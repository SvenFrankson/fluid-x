interface IPuzzleTileData {
    data: IPuzzleData;
    onclick: () => void;
    locked?: boolean;
    completed?: boolean;
}

abstract class LevelPage {

    public page: number = 0;
    public levelsPerPage: number = 9;
    public levelCount: number = 0;

    public nabuPage: Nabu.DefaultPage;

    constructor(queryString: string, public router: CarillonRouter) {
        this.nabuPage = document.querySelector(queryString);
    }

    public get shown(): boolean {
        return this.nabuPage.shown;
    }

    public async show(duration?: number): Promise<void> {
        return this.nabuPage.show(duration);
    }

    public async hide(duration?: number): Promise<void> {
        return this.nabuPage.hide(duration);
    }

    public setSquareButtonOnClick(squareButton: HTMLButtonElement, n: number): void {

    }

    protected abstract getPuzzlesData(page: number, levelsPerPage: number): Promise<IPuzzleTileData[]>;

    public async redraw(): Promise<void> {

        let container = this.nabuPage.querySelector(".square-btn-container");
        container.innerHTML = "";

        let rect = container.getBoundingClientRect();
        let colCount = Math.floor(rect.width / 150);
        let rowCount = Math.floor(rect.height / 150);
        while (colCount < 3) {
            colCount++;
        }
        while (rowCount < 4) {
            rowCount++;
        }

        this.levelsPerPage = colCount * (rowCount - 1);
        let puzzleTileData = await this.getPuzzlesData(this.page, this.levelsPerPage);

        let n = 0;
        for (let i = 0; i < rowCount - 1; i++) {
            let line = document.createElement("div");
            line.classList.add("square-btn-container-line");
            container.appendChild(line);
            for (let j = 0; j < colCount; j++) {
                let squareButton = document.createElement("button");
                squareButton.classList.add("square-btn-panel");
                if (n >= puzzleTileData.length) {
                    squareButton.style.visibility = "hidden";
                }
                else {
                    if (puzzleTileData[n].locked) {
                        squareButton.classList.add("locked");
                    }

                    squareButton.innerHTML = "<stroke-text>" + puzzleTileData[n].data.title + "</stroke-text>";
                    squareButton.onclick = puzzleTileData[n].onclick;

                    let miniature = PuzzleMiniatureMaker.Generate(puzzleTileData[n].data.content)
                    miniature.classList.add("square-btn-miniature");
                    squareButton.appendChild(miniature);

                    let authorField = document.createElement("div");
                    authorField.classList.add("square-btn-author");
                    let authorText = document.createElement("stroke-text") as StrokeText;
                    authorField.appendChild(authorText);
                    squareButton.appendChild(authorField);
                    if (puzzleTileData[n].data.score != null) {
                        let val = "# 1 " + puzzleTileData[n].data.player + " " + Game.ScoreToString(puzzleTileData[n].data.score);
                        authorText.setContent(val);
                    }
                    else {
                        authorText.setContent("by " + puzzleTileData[n].data.author);
                    }

                    if (this.router.game.isPuzzleCompleted(puzzleTileData[n].data.id)) {
                        let completedStamp = document.createElement("div");
                        completedStamp.classList.add("stamp");
                        let stars = document.createElement("div");
                        completedStamp.appendChild(stars);
                        squareButton.appendChild(completedStamp);

                        let score = this.router.game.getPersonalBestScore(puzzleTileData[n].data.id);
                        let highscore = puzzleTileData[n].data.score;
                        let ratio = 1;
                        if (highscore != null) {
                            ratio = highscore / score;
                        }
                        let s1 = ratio > 0.3 ? "★" : "☆";
                        let s2 = ratio > 0.6 ? "★" : "☆";
                        let s3 = ratio > 0.9 ? "★" : "☆";
                        stars.innerHTML = s1 + "</br>" + s2 + s3;
                    }
                }
                n++;
                line.appendChild(squareButton);
            }
        }
        
        let line = document.createElement("div");
        line.classList.add("square-btn-container-halfline");
        container.appendChild(line);

        line = document.createElement("div");
        line.classList.add("square-btn-container-halfline");
        container.appendChild(line);

        let prevButton = document.createElement("button");
        prevButton.classList.add("square-btn");
        if (this.page === 0) {
            prevButton.innerHTML = "<stroke-text>BACK</stroke-text>";
            prevButton.onclick = () => {
                location.hash = "#home";
            }
        }
        else {
            prevButton.innerHTML = "<stroke-text>PREV</stroke-text>";
            prevButton.onclick = () => {
                this.page--;
                this.redraw();
            }
        }
        line.appendChild(prevButton);
        for (let j = 1; j < colCount - 1; j++) {
            let squareButton = document.createElement("button");
            squareButton.classList.add("square-btn");
            squareButton.style.visibility = "hidden";
            line.appendChild(squareButton);
        }
        let nextButton = document.createElement("button");
        nextButton.classList.add("square-btn");
        if (puzzleTileData.length === this.levelsPerPage) {
            nextButton.innerHTML = "<stroke-text>NEXT</stroke-text>";
            nextButton.onclick = () => {
                this.page++;
                this.redraw();
            }
        }
        else {
            nextButton.style.visibility = "hidden";
        }
        line.appendChild(nextButton);
    }
}

class BaseLevelPage extends LevelPage {
    protected async getPuzzlesData(page: number, levelsPerPage: number): Promise<IPuzzleTileData[]> {
        let puzzleData: IPuzzleTileData[] = [];
        let data = this.router.game.tiaratumGameLevels;
        CLEAN_IPuzzlesData(data);

        for (let i = 0; i < levelsPerPage && i < data.puzzles.length; i++) {
            let n = i + page * levelsPerPage;
            let locked = true;
            if (n === 0) {
                locked = false;
            }
            else if (data.puzzles[n - 1]) {
                let prevId = data.puzzles[n - 1].id;
                if (this.router.game.isPuzzleCompleted(prevId)) {
                    locked = false;
                }
            }
            if (data.puzzles[n]) {
                puzzleData[i] = {
                    data: data.puzzles[n],
                    onclick: () => {
                        this.router.game.puzzle.loadFromData(data.puzzles[n]);
                        location.hash = "level-" + (n + 1).toFixed(0);
                    },
                    locked: locked
                }
            }
        }

        return puzzleData;
    }
}

class CommunityLevelPage extends LevelPage {
    
    protected async getPuzzlesData(page: number, levelsPerPage: number): Promise<IPuzzleTileData[]> {
        let puzzleData: IPuzzleTileData[] = [];

        const response = await fetch(SHARE_SERVICE_PATH + "get_puzzles/" + page.toFixed(0) + "/" + levelsPerPage.toFixed(0), {
            method: "GET",
            mode: "cors"
        });

        if (response.status === 200) {
            let data = await response.json();
            CLEAN_IPuzzlesData(data);
    
            for (let i = 0; i < levelsPerPage && i < data.puzzles.length; i++) {
                let id = data.puzzles[i].id;
                puzzleData[i] = {
                    data: data.puzzles[i],
                    onclick: () => {
                        this.router.game.puzzle.loadFromData(data.puzzles[i]);
                        location.hash = "play-community-" + id;
                    }
                }
            }
        }
        else {
            console.error(await response.text());
        }

        return puzzleData;
    }
}

class DevLevelPage extends LevelPage {

    public levelStateToFetch: number = 0;
    
    protected async getPuzzlesData(page: number, levelsPerPage: number): Promise<IPuzzleTileData[]> {
        let puzzleData: IPuzzleTileData[] = [];

        console.log(var1);
        const response = await fetch(SHARE_SERVICE_PATH + "get_puzzles/" + page.toFixed(0) + "/" + levelsPerPage.toFixed(0) + "/" + this.levelStateToFetch.toFixed(0), {
            method: "GET",
            mode: "cors",
            headers: {
                "Authorization": 'Basic ' + btoa("carillon:" + var1)
            }
        });

        if (response.status === 200) {
            let text = await response.text();
            console.log(text);
            
            let data = JSON.parse(text);
            CLEAN_IPuzzlesData(data);
    
            for (let i = 0; i < levelsPerPage && i < data.puzzles.length; i++) {
                let id = data.puzzles[i].id;
                puzzleData[i] = {
                    data: data.puzzles[i],
                    onclick: () => {
                        this.router.game.puzzle.loadFromData(data.puzzles[i]);
                        location.hash = "play-community-" + id;
                    }
                }
            }
        }
        else {
            console.error(await response.text());
        }

        return puzzleData;
    }
}