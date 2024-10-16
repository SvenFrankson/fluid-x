interface IPuzzleTileData {
    onclick: () => void;
    title: string;
    author: string;
    content: string;
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
        let rect = this.nabuPage.getBoundingClientRect();
        let colCount = Math.floor(rect.width / 120);
        let rowCount = Math.floor(rect.height * 0.7 / 120);

        let container = this.nabuPage.querySelector(".square-btn-container");
        container.innerHTML = "";

        this.levelsPerPage = colCount * (rowCount - 1);
        let maxPage = Math.ceil(this.levelCount / this.levelsPerPage);

        let puzzleTileData = await this.getPuzzlesData(this.page, this.levelsPerPage);

        let n = 0;
        for (let i = 0; i < rowCount - 1; i++) {
            let line = document.createElement("div");
            line.classList.add("square-btn-container-line");
            container.appendChild(line);
            for (let j = 0; j < colCount; j++) {
                let squareButton = document.createElement("button");
                squareButton.classList.add("square-btn");
                if (n >= puzzleTileData.length) {
                    squareButton.style.visibility = "hidden";
                }
                else {
                    squareButton.innerHTML = "<stroke-text>" + puzzleTileData[n].title + "</stroke-text>";
                    squareButton.onclick = puzzleTileData[n].onclick;

                    let miniature = PuzzleMiniatureMaker.Generate(puzzleTileData[n].content)
                    miniature.classList.add("square-btn-miniature");
                    squareButton.appendChild(miniature);

                    let authorField = document.createElement("div");
                    authorField.classList.add("square-btn-author");
                    let authorText = document.createElement("stroke-text") as StrokeText;
                    authorText.setContent(puzzleTileData[n].author);
                    authorField.appendChild(authorText);
                    squareButton.appendChild(authorField);
                }
                n++;
                line.appendChild(squareButton);
            }
        }

        let line = document.createElement("div");
        line.classList.add("square-btn-container-line");
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
        if (this.page < maxPage - 1) {
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
    public levelFileNames = [
        "test"
    ];

    constructor(queryString: string, router: CarillonRouter) {
        super(queryString, router);
        this.levelCount = this.levelFileNames.length;
    }
    
    protected async getPuzzlesData(page: number, levelsPerPage: number): Promise<IPuzzleTileData[]> {
        let puzzleData: IPuzzleTileData[] = [];

        let n = page * levelsPerPage;
        for (let i = 0; i < levelsPerPage; i++) {
            let index = i + n;
            if (this.levelFileNames[index]) {
                let hash = "#level-" + this.levelFileNames[index];
                puzzleData[i] = {
                    title: "Level " + n.toFixed(0),
                    author: "Tiaratum Games",
                    content: "",
                    onclick: () => {
                        location.hash = hash;
                    }
                }
            }
        }

        return puzzleData;
    }
}

class CommunityLevelPage extends LevelPage {
    
    protected async getPuzzlesData(page: number, levelsPerPage: number): Promise<IPuzzleTileData[]> {
        let puzzleData: IPuzzleTileData[] = [];

        const response = await fetch("http://localhost/index.php/get_puzzles/0/12/", {
            method: "GET",
            mode: "cors"
        });
        let data = await response.json();
        console.log(data);
        //this.terrain.loadFromText(data.puzzles[0].content);
        //this.terrain.instantiate();

        for (let i = 0; i < levelsPerPage && i < data.puzzles.length; i++) {
            let id = data.puzzles[i].id;
            puzzleData[i] = {
                title: data.puzzles[i].title,
                author: data.puzzles[i].author,
                content: data.puzzles[i].content,
                onclick: () => {
                    this.router.game.terrain.loadFromData(data.puzzles[i]);
                    location.hash = "play-community-" + id;
                }
            }
        }

        return puzzleData;
    }
}