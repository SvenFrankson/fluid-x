interface IPuzzleTileData {
    data: IPuzzleData;
    onclick: () => void;
    locked?: boolean;
    completed?: boolean;
    classList?: string[];
}

abstract class LevelPage {

    public className: string = "LevelPage";
    //public page: number = 0;
    //public levelsPerPage: number = 9;
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

    public onPageRedrawn(): void {

    }

    public async redraw(): Promise<void> {
        this.buttons = [];

        let container = this.nabuPage.querySelector(".square-btn-container");
        container.innerHTML = "";

        let rect = container.getBoundingClientRect();
        this.colCount = Math.floor(rect.width / 156);
        this.rowCount = Math.floor(rect.height / 156);
        while (this.colCount < 2) {
            this.colCount++;
        }
        while (this.rowCount < 3) {
            this.rowCount++;
        }
        let size = Math.floor(rect.width / this.colCount - 16);

        //this.levelsPerPage = this.colCount * (this.rowCount - 1);
        let puzzleTileDatas = await this.getPuzzlesData(0, 200);

        for (let n = 0; n < puzzleTileDatas.length; n++) {
            let squareButton = document.createElement("button");
            squareButton.style.width = size.toFixed(0) + "px";
            squareButton.style.height = size.toFixed(0) + "px";
            container.appendChild(squareButton);
            this.buttons.push(squareButton);
            squareButton.classList.add("square-btn-panel", "bluegrey");
            
            if (puzzleTileDatas[n].locked) {
                squareButton.classList.add("locked");
            }
            if (puzzleTileDatas[n].classList) {
                squareButton.classList.add(...puzzleTileDatas[n].classList);
            }

            squareButton.onclick = puzzleTileDatas[n].onclick;

            let titleField = document.createElement("div");
            titleField.classList.add("square-btn-title");
            let titleText = document.createElement("stroke-text") as StrokeText;
            titleText.setContent(puzzleTileDatas[n].data.title);
            titleField.appendChild(titleText);
            squareButton.appendChild(titleField);

            let miniature = PuzzleMiniatureMaker.Generate(puzzleTileDatas[n].data.content)
            miniature.classList.add("square-btn-miniature");
            squareButton.appendChild(miniature);

            let difficultyField = document.createElement("div");
            difficultyField.classList.add("square-btn-difficulty");

            let difficulty = puzzleTileDatas[n].data.difficulty;
            if (difficulty === 0) {
                if (DEV_MODE_ACTIVATED) {
                    difficultyField.classList.add("beige");
                    difficultyField.innerHTML = "UKNWN";
                }
                else {
                    difficultyField.classList.add("blue");
                    difficultyField.innerHTML = "MEDIUM";
                }
            }
            else if (difficulty === 1) {
                difficultyField.classList.add("green");
                difficultyField.innerHTML = "EASY";
            }
            else if (difficulty === 2) {
                difficultyField.classList.add("blue");
                difficultyField.innerHTML = "MEDIUM";
            }
            else if (difficulty === 3) {
                difficultyField.classList.add("orange");
                difficultyField.innerHTML = "HARD";
            }
            else if (difficulty === 4) {
                difficultyField.classList.add("red");
                difficultyField.innerHTML = "EXPERT";
            }
            squareButton.appendChild(difficultyField);

            let authorField = document.createElement("div");
            authorField.classList.add("square-btn-author");
            let authorText = document.createElement("stroke-text") as StrokeText;
            authorField.appendChild(authorText);
            squareButton.appendChild(authorField);
            if (puzzleTileDatas[n].data.score != null) {
                let val = "# 1 " + puzzleTileDatas[n].data.player + " " + Game.ScoreToString(puzzleTileDatas[n].data.score);
                authorText.setContent(val);
            }
            else {
                authorText.setContent("by " + puzzleTileDatas[n].data.author);
            }

            if (puzzleTileDatas[n].data.id != null && this.router.game.puzzleCompletion.isPuzzleCompleted(puzzleTileDatas[n].data.id)) {
                let completedStamp = document.createElement("div");
                let starCount = this.router.game.puzzleCompletion.getStarCount(puzzleTileDatas[n].data.id);
                completedStamp.classList.add("stamp");
                completedStamp.classList.add("stamp-" + starCount);
                squareButton.appendChild(completedStamp);
            }
        }

        if (puzzleTileDatas.length % this.colCount > 0) {
            for (let i = puzzleTileDatas.length; i < Math.ceil(puzzleTileDatas.length / this.colCount) * this.colCount; i++) {
                let squareButton = document.createElement("button");
                squareButton.classList.add("square-btn-panel", "locked");
                squareButton.style.width = size.toFixed(0) + "px";
                squareButton.style.height = size.toFixed(0) + "px";
                squareButton.style.opacity = "0.2";
                container.appendChild(squareButton);
            }
        }
        
        if (this.router.game.uiInputManager.inControl) {
            this.setHoveredButtonIndex(this.hoveredButtonIndex);
        }

        this.onPageRedrawn();
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

class StoryPuzzlesPage extends LevelPage {
    
    constructor(queryString: string, router: CarillonRouter) {
        super(queryString, router);
        this.nabuPage.querySelector(".puzzle-level-title stroke-text").innerHTML = "Story Mode";
        this.className = "BaseLevelPage";
    }

    public onPageRedrawn(): void {
        if (this.router.game.puzzleCompletion) {
            (this.nabuPage.querySelector(".puzzle-level-completion completion-bar") as CompletionBar).setAttribute("value", this.router.game.puzzleCompletion.storyPuzzleCompletion.toFixed(2));
        }
    }

    protected async getPuzzlesData(page: number, levelsPerPage: number): Promise<IPuzzleTileData[]> {
        let puzzleData: IPuzzleTileData[] = [];
        let data = this.router.game.loadedStoryPuzzles;
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
                    if (this.router.game.puzzleCompletion.isPuzzleCompleted(prevId)) {
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
                        title: "Community Puzzles",
                        author: "Tiaratum Games",
                        content: "0u0u0xaoooooooaxoowwnnnoaxonnwnnnorxonnwNoooOxonnwWoooOxonnwwnnorxoowwwnnoaxooooooooa",
                    },
                    onclick: () => {
                        location.hash = "#community-puzzles"
                    }
                }
            }
        }

        return puzzleData;
    }
}

class ExpertPuzzlesPage extends LevelPage {
    
    constructor(queryString: string, router: CarillonRouter) {
        super(queryString, router);
        this.nabuPage.querySelector(".puzzle-level-title stroke-text").innerHTML = "Expert Mode";
        this.className = "ExpertLevelPage";
    }

    public onPageRedrawn(): void {
        if (this.router.game.puzzleCompletion) {
            (this.nabuPage.querySelector(".puzzle-level-completion completion-bar") as CompletionBar).setAttribute("value", this.router.game.puzzleCompletion.expertPuzzleCompletion.toFixed(2));
        }
    }

    protected async getPuzzlesData(page: number, levelsPerPage: number): Promise<IPuzzleTileData[]> {
        let puzzleData: IPuzzleTileData[] = [];
        let data = this.router.game.loadedExpertPuzzles;
        CLEAN_IPuzzlesData(data);

        for (let i = 0; i < levelsPerPage && i < data.puzzles.length + 1; i++) {
            let n = i + page * levelsPerPage;
            if (data.puzzles[n]) {
                let locked = true;
                let storyId = this.router.game.expertIdToStoryId(data.puzzles[n].id);
                if (this.router.game.puzzleCompletion.isPuzzleCompleted(storyId)) {
                    locked = false;
                }
                
                puzzleData[i] = {
                    data: data.puzzles[n],
                    onclick: () => {
                        this.router.game.puzzle.resetFromData(data.puzzles[n]);
                        location.hash = "puzzle-" + data.puzzles[n].id.toFixed(0);
                    },
                    locked: locked
                }
            }
            else if (n === data.puzzles.length) {
                puzzleData[i] = {
                    data: {
                        id: null,
                        title: "Story Puzzles",
                        author: "Tiaratum Games",
                        content: "0u0u0xaoooooooaxoowwnnnoaxonnwnnnorxonnwNoooOxonnwWoooOxonnwwnnorxoowwwnnoaxooooooooa",
                    },
                    onclick: () => {
                        location.hash = "#levels"
                    }
                }
            }
        }

        return puzzleData;
    }
}

class CommunityPuzzlesPage extends LevelPage {
    
    constructor(queryString: string, router: CarillonRouter) {
        super(queryString, router);
        this.nabuPage.querySelector(".puzzle-level-title stroke-text").innerHTML = "Community Puzzles";
        this.className = "CommunityLevelPage";
    }

    public onPageRedrawn(): void {
        if (this.router.game.puzzleCompletion) {
            (this.nabuPage.querySelector(".puzzle-level-completion completion-bar") as CompletionBar).setAttribute("value", this.router.game.puzzleCompletion.communityPuzzleCompletion.toFixed(2));
        }
    }
    
    protected async getPuzzlesData(page: number, levelsPerPage: number): Promise<IPuzzleTileData[]> {
        if (true) {
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
                        location.hash = "puzzle-" + id;
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
        let data = this.router.game.loadedCommunityPuzzles;

        for (let i = 0; i < levelsPerPage && i < data.puzzles.length; i++) {
            let n = i + page * levelsPerPage;
            if (data.puzzles[n]) {
                puzzleData[i] = {
                    data: data.puzzles[n],
                    onclick: () => {
                        this.router.game.puzzle.resetFromData(data.puzzles[n]);
                        location.hash = "puzzle-" + data.puzzles[n].id;
                    }
                }
            }
        }

        return puzzleData;
    }
}

class DevPuzzlesPage extends LevelPage {
    
    constructor(queryString: string, router: CarillonRouter) {
        super(queryString, router);
        this.nabuPage.querySelector(".puzzle-level-title stroke-text").innerHTML = "Dev Puzzles";
        this.className = "DevLevelPage";
    }

    public levelStateToFetch: number = 0;

    public onPageRedrawn(): void {
        this.nabuPage.querySelector(".puzzle-level-title stroke-text").innerHTML = "DevMode : " + DEV_MODES_NAMES[this.levelStateToFetch] + " Puzzles";
    }
    
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
                        location.hash = "puzzle-" + id;
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

class MultiplayerPuzzlesPage extends LevelPage {
    
    constructor(queryString: string, router: CarillonRouter) {
        super(queryString, router);
        this.nabuPage.querySelector(".puzzle-level-title stroke-text").innerHTML = "Multiplayer Mode";
        this.className = "MultiplayerLevelPage";
    }

    public levelStateToFetch: number = 0;
    
    protected async getPuzzlesData(page: number, levelsPerPage: number): Promise<IPuzzleTileData[]> {
        let puzzleData: IPuzzleTileData[] = [];
        let data = this.router.game.loadedMultiplayerPuzzles;
        CLEAN_IPuzzlesData(data);

        for (let i = 0; i < levelsPerPage && i < data.puzzles.length + 1; i++) {
            let n = i + page * levelsPerPage;
            if (data.puzzles[n]) {                
                puzzleData[i] = {
                    data: data.puzzles[n],
                    onclick: () => {
                        this.router.game.puzzle.resetFromData(data.puzzles[n]);
                        location.hash = "puzzle-" + data.puzzles[n].id.toFixed(0);
                    }
                }
            }
        }

        return puzzleData;
    }
}