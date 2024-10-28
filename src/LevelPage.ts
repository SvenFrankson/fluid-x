interface IPuzzleTileData {
    data: IPuzzleData;
    onclick: () => void;
    locked?: boolean;
    completed?: boolean;
    classList?: string[];
}

abstract class LevelPage {

    public className: string = "LevelPage";
    public page: number = 0;
    public levelsPerPage: number = 9;
    public levelCount: number = 0;

    public nabuPage: Nabu.DefaultPage;
    public buttons: HTMLButtonElement[] = [];
    public rowCount: number = 3;
    public colCount: number = 3;

    constructor(queryString: string, public router: CarillonRouter) {
        this.nabuPage = document.querySelector(queryString);
        this._registerToInputManager();
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
        this.buttons = [];

        let container = this.nabuPage.querySelector(".square-btn-container");
        container.innerHTML = "";

        let rect = container.getBoundingClientRect();
        this.colCount = Math.floor(rect.width / 150);
        this.rowCount = Math.floor(rect.height / 150);
        while (this.colCount < 2) {
            this.colCount++;
        }
        while (this.rowCount < 2) {
            this.rowCount++;
        }

        this.levelsPerPage = this.colCount * (this.rowCount - 1);
        let puzzleTileData = await this.getPuzzlesData(this.page, this.levelsPerPage);

        let n = 0;
        for (let i = 0; i < this.rowCount - 1; i++) {
            let line = document.createElement("div");
            line.classList.add("square-btn-container-line");
            container.appendChild(line);
            for (let j = 0; j < this.colCount; j++) {
                let squareButton = document.createElement("button");
                this.buttons.push(squareButton);
                squareButton.classList.add("square-btn-panel", "bluegrey");
                if (n >= puzzleTileData.length) {
                    squareButton.classList.add("locked");
                    squareButton.style.opacity = "0.2";
                }
                else {
                    if (puzzleTileData[n].locked) {
                        squareButton.classList.add("locked");
                    }
                    if (puzzleTileData[n].classList) {
                        squareButton.classList.add(...puzzleTileData[n].classList);
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

                    if (puzzleTileData[n].data.id != null && this.router.game.isPuzzleCompleted(puzzleTileData[n].data.id)) {
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

        let prevButton = document.createElement("button");
        this.buttons.push(prevButton);
        prevButton.classList.add("square-btn", "bluegrey");
        prevButton.style.margin = "10px";
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
        
        for (let j = 1; j < this.colCount - 1; j++) {
            let squareButton = document.createElement("button");
            squareButton.style.margin = "10px";
            this.buttons.push(squareButton);
            squareButton.classList.add("square-btn");
            squareButton.style.visibility = "hidden";
            line.appendChild(squareButton);
        }

        let nextButton = document.createElement("button");
        nextButton.style.margin = "10px";
        this.buttons.push(nextButton);
        nextButton.classList.add("square-btn", "bluegrey");
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

        if (this.router.game.uiInputManager.inControl) {
            this.setHoveredButtonIndex(this.hoveredButtonIndex);
        }
    }

    private _hoveredButtonIndex: number = 0;
    public get hoveredButtonIndex(): number {
        return this._hoveredButtonIndex;
    }
    public get hoveredButtonColIndex(): number {
        return this._hoveredButtonIndex % this.colCount;
    }
    public get hoveredButtonRowIndex(): number {
        return Math.floor(this._hoveredButtonIndex / this.colCount);
    }
    public setHoveredButtonIndex(v: number, filter?: (btn: HTMLButtonElement) => boolean): boolean {
        let btn = this.buttons[this._hoveredButtonIndex];
        if (btn) {
            btn.classList.remove("hovered");
        }
        this._hoveredButtonIndex = v;
        btn = this.buttons[this._hoveredButtonIndex];
        if (!btn) {
            return true;
        }
        else if ((!filter || filter(btn))) {
            if (btn) {
                btn.classList.add("hovered");
            }
            return true;
        }
        return false;
    }

    private _registerToInputManager(): void {
        this.router.game.uiInputManager.onUpCallbacks.push(this._inputUp);
        this.router.game.uiInputManager.onLeftCallbacks.push(this._inputLeft);
        this.router.game.uiInputManager.onDownCallbacks.push(this._inputDown);
        this.router.game.uiInputManager.onRightCallbacks.push(this._inputRight);
        this.router.game.uiInputManager.onEnterCallbacks.push(this._inputEnter);
        this.router.game.uiInputManager.onBackCallbacks.push(this._inputBack);
        this.router.game.uiInputManager.onDropControlCallbacks.push(this._inputDropControl);
    }

    private _unregisterFromInputManager(): void {
        this.router.game.uiInputManager.onUpCallbacks.remove(this._inputUp);
        this.router.game.uiInputManager.onLeftCallbacks.remove(this._inputLeft);
        this.router.game.uiInputManager.onDownCallbacks.remove(this._inputDown);
        this.router.game.uiInputManager.onRightCallbacks.remove(this._inputRight);
        this.router.game.uiInputManager.onEnterCallbacks.remove(this._inputEnter);
        this.router.game.uiInputManager.onBackCallbacks.remove(this._inputBack);
        this.router.game.uiInputManager.onDropControlCallbacks.remove(this._inputDropControl);
    }

    private _filter = (btn: HTMLButtonElement) => {
        return !btn.classList.contains("locked") && btn.style.visibility != "hidden";
    }

    private _inputUp = () => {
        if (!this.shown) {
            return;
        }
        if (this.buttons.length === 0) {
            return;
        }
        if (this.hoveredButtonRowIndex === 0) {
            if (!this.setHoveredButtonIndex(this.hoveredButtonIndex + this.colCount * (this.rowCount - 1), this._filter)) {
                this._inputUp();
            }
        }
        else {
            if (!this.setHoveredButtonIndex(this.hoveredButtonIndex - this.colCount, this._filter)) {
                this._inputUp();
            }
        }
    }

    private _inputLeft = () => {
        if (!this.shown) {
            return;
        }
        if (this.buttons.length === 0) {
            return;
        }
        if (this.hoveredButtonColIndex === 0) {
            if (!this.setHoveredButtonIndex(this.hoveredButtonIndex + this.colCount - 1, this._filter)) {
                this._inputLeft();
            }
        }
        else {
            if (!this.setHoveredButtonIndex(this.hoveredButtonIndex - 1, this._filter)) {
                this._inputLeft();
            }
        }
    }

    private _inputDown = () => {
        if (!this.shown) {
            return;
        }
        if (this.buttons.length === 0) {
            return;
        }
        if (this.hoveredButtonRowIndex === this.rowCount - 1) {
            if (!this.setHoveredButtonIndex(this.hoveredButtonIndex - this.colCount * (this.rowCount - 1), this._filter)) {
                this._inputDown();
            }
        }
        else {
            if (!this.setHoveredButtonIndex(this.hoveredButtonIndex + this.colCount, this._filter)) {
                this._inputDown();
            }
        }
    }

    private _inputRight = () => {
        if (!this.shown) {
            return;
        }
        if (this.buttons.length === 0) {
            return;
        }
        if (this.hoveredButtonColIndex === this.colCount - 1) {
            if (!this.setHoveredButtonIndex(this.hoveredButtonIndex - this.colCount + 1, this._filter)) {
                this._inputRight();
            }
        }
        else {
            if (!this.setHoveredButtonIndex(this.hoveredButtonIndex + 1, this._filter)) {
                this._inputRight();
            }
        }
    }

    private _inputEnter = () => {
        if (!this.shown) {
            return;
        }
        if (this.buttons.length === 0) {
            return;
        }
        let btn = this.buttons[this._hoveredButtonIndex];
        if (btn && btn.onclick) {
            btn.onclick(undefined);
            return;
        }
    }

    private _inputBack = () => {
        if (!this.shown) {
            return;
        }
        location.hash = "#home";
    }

    private _inputDropControl = () => {
        if (!this.shown) {
            return;
        }
        if (this.buttons.length === 0) {
            return;
        }
        this.buttons.forEach(btn => {
            btn.classList.remove("hovered");
        });
    }
}

class BaseLevelPage extends LevelPage {
    
    constructor(queryString: string, router: CarillonRouter) {
        super(queryString, router);
        this.className = "BaseLevelPage";
    }

    protected async getPuzzlesData(page: number, levelsPerPage: number): Promise<IPuzzleTileData[]> {
        let puzzleData: IPuzzleTileData[] = [];
        let data = this.router.game.tiaratumGameTutorialLevels;
        CLEAN_IPuzzlesData(data);

        for (let i = 0; i < levelsPerPage && i < data.puzzles.length + 1; i++) {
            let n = i + page * levelsPerPage;
            if (data.puzzles[n]) {
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
                puzzleData[i] = {
                    data: data.puzzles[n],
                    onclick: () => {
                        this.router.game.puzzle.resetFromData(data.puzzles[n]);
                        location.hash = "level-" + (n + 1).toFixed(0);
                    },
                    locked: locked
                }
            }
            else if (n === data.puzzles.length) {
                puzzleData[i] = {
                    data: {
                        id: null,
                        title: "Puzzles and Challenges !",
                        author: "Tiaratum Games",
                        content: "0u0u0xaoooooooaxoowwnnnoaxonnwnnnorxonnwNoooOxonnwWoooOxonnwwnnorxoowwwnnoaxooooooooa",
                    },
                    onclick: () => {
                        location.hash = "#community"
                    }
                }
            }
        }

        return puzzleData;
    }
}

class CommunityLevelPage extends LevelPage {
    
    constructor(queryString: string, router: CarillonRouter) {
        super(queryString, router);
        this.className = "CommunityLevelPage";
    }
    
    protected async getPuzzlesData(page: number, levelsPerPage: number): Promise<IPuzzleTileData[]> {
        if (OFFLINE_MODE) {
            return this.getPuzzlesDataOffline(page, levelsPerPage);
        }
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
                        this.router.game.puzzle.resetFromData(data.puzzles[i]);
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

    protected async getPuzzlesDataOffline(page: number, levelsPerPage: number): Promise<IPuzzleTileData[]> {
        let puzzleData: IPuzzleTileData[] = [];
        let data = this.router.game.tiaratumGameOfflinePuzzleLevels;

        for (let i = 0; i < levelsPerPage && i < data.puzzles.length; i++) {
            let n = i + page * levelsPerPage;
            if (data.puzzles[n]) {
                puzzleData[i] = {
                    data: data.puzzles[n],
                    onclick: () => {
                        this.router.game.puzzle.resetFromData(data.puzzles[n]);
                        location.hash = "play-community-" + data.puzzles[n].id;
                    }
                }
            }
        }

        return puzzleData;
    }
}

class DevLevelPage extends LevelPage {
    
    constructor(queryString: string, router: CarillonRouter) {
        super(queryString, router);
        this.className = "DevLevelPage";
    }

    public levelStateToFetch: number = 0;
    
    protected async getPuzzlesData(page: number, levelsPerPage: number): Promise<IPuzzleTileData[]> {
        let puzzleData: IPuzzleTileData[] = [];

        const response = await fetch(SHARE_SERVICE_PATH + "get_puzzles/" + page.toFixed(0) + "/" + levelsPerPage.toFixed(0) + "/" + this.levelStateToFetch.toFixed(0), {
            method: "GET",
            mode: "cors",
            headers: {
                "Authorization": 'Basic ' + btoa("carillon:" + var1)
            }
        });

        if (response.status === 200) {
            let text = await response.text();
            
            let data = JSON.parse(text);
            CLEAN_IPuzzlesData(data);
    
            for (let i = 0; i < levelsPerPage && i < data.puzzles.length; i++) {
                let id = data.puzzles[i].id;
                puzzleData[i] = {
                    data: data.puzzles[i],
                    onclick: () => {
                        this.router.game.puzzle.resetFromData(data.puzzles[i]);
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