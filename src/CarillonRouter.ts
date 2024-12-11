class CarillonRouter extends Nabu.Router {
    public homeMenu: HomePage;
    public storyPuzzlesPage: StoryPuzzlesPage;
    public expertPuzzlesPage: ExpertPuzzlesPage;
    public xmasPuzzlesPage: XMasPuzzlesPage;
    public communityPuzzlesPage: CommunityPuzzlesPage;
    public devPuzzlesPage: DevPuzzlesPage;
    public multiplayerPuzzlesPage: MultiplayerPuzzlesPage;
    public playUI: Nabu.DefaultPage;
    public editorUI: Nabu.DefaultPage;
    public creditsPage: Nabu.DefaultPage;
    public multiplayerPage: MultiplayerPage;
    public devPage: Nabu.DefaultPage;
    public tutoPage: TutoPage;
    public eulaPage: Nabu.DefaultPage;

    public timerText: HTMLDivElement;
    public puzzleIntro: HTMLDivElement;
    
    public playBackButton: HTMLButtonElement;

    constructor(public game: Game) {
        super();
    }

    public async postInitialize(): Promise<void> {
        //await RandomWait();
        for (let i = 0; i < this.pages.length; i++) {
            await this.pages[i].waitLoaded();
        }

        this.homeMenu = new HomePage("#home-menu", this);
        this.storyPuzzlesPage = new StoryPuzzlesPage("#base-puzzles-page", this);
        this.expertPuzzlesPage = new ExpertPuzzlesPage("#expert-puzzles-page", this);
        this.xmasPuzzlesPage = new XMasPuzzlesPage("#xmas-puzzles-page", this);
        this.communityPuzzlesPage = new CommunityPuzzlesPage("#community-puzzles-page", this);
        this.devPuzzlesPage = new DevPuzzlesPage("#dev-puzzles-page", this);
        this.multiplayerPuzzlesPage = new MultiplayerPuzzlesPage("#multiplayer-puzzles-page", this);
        this.creditsPage = document.querySelector("#credits-page") as Nabu.DefaultPage;
        this.multiplayerPage = new MultiplayerPage("#multiplayer-page", this);
        this.playUI = document.querySelector("#play-ui") as Nabu.DefaultPage;
        this.editorUI = document.querySelector("#editor-ui") as Nabu.DefaultPage;
        this.devPage = document.querySelector("#dev-page") as Nabu.DefaultPage;
        this.tutoPage = new TutoPage("#tuto-page", this);
        this.eulaPage = document.querySelector("#eula-page") as Nabu.DefaultPage;
        
        this.playBackButton = document.querySelector("#play-ui .back-btn") as HTMLButtonElement;
        this.timerText = document.querySelector("#play-timer");
        this.puzzleIntro = document.querySelector("#puzzle-intro");
    }

    protected onUpdate(): void {}

    protected async onHRefChange(page: string, previousPage: string): Promise<void> {
        //await RandomWait();
        console.log("onHRefChange from " + previousPage + " to " + page);
        //?gdmachineId=1979464530

        let showTime = 0.5;
        for (let i = 0; i < this.pages.length; i++) {
            await this.pages[i].waitLoaded();
        }
        
        this.game.mode = GameMode.Menu;
        this.game.globalTimer = 0;
        this.game.editor.deactivate();

        if (page.startsWith("#options")) {
            if (USE_POKI_SDK) {
                PokiGameplayStop();
            }
        }
        else if (page.startsWith("#credits")) {
            if (USE_POKI_SDK) {
                PokiGameplayStop();
            }
            await this.show(this.creditsPage, false, showTime);
        }
        else if (page === "#dev") {
            if (USE_POKI_SDK) {
                PokiGameplayStop();
            }
            await this.show(this.devPage, false, showTime);
        }
        else if (page.startsWith("#editor-preview")) {
            this.game.puzzle.puzzleUI.successNextButton.onpointerup = () => {
                this.game.puzzle.puzzleUI.autoNext = false;
                location.hash = "#editor"
            };
            this.show(this.playUI, false, showTime);
            (document.querySelector("#editor-btn") as HTMLButtonElement).style.display = "";
            this.game.mode = GameMode.Preplay;
            await this.game.puzzle.reset(true);
            this.game.puzzle.editorOrEditorPreview = true;
            this.game.puzzle.skipIntro();
            this.game.globalTimer = 0;
        }
        else if (page.startsWith("#editor")) {
            this.show(this.editorUI, false, showTime);
            this.game.mode = GameMode.Editor;
            await this.game.puzzle.reset(true);
            this.game.puzzle.editorOrEditorPreview = true;
            this.game.editor.activate();
        }
        else if (page.startsWith("#level-")) {
            let numLevel = parseInt(page.replace("#level-", ""));
            this.game.puzzle.puzzleUI.successNextButton.onpointerup = () => {
                this.game.puzzle.puzzleUI.autoNext = false;
                location.hash = "#level-" + (numLevel + 1).toFixed(0)
            };
            (this.game.puzzle.puzzleUI.gameoverBackButton.parentElement as HTMLAnchorElement).href = "#levels";
            if (this.game.puzzle.data.numLevel != numLevel) {
                let data = this.game.loadedStoryPuzzles;
                if (data.puzzles[numLevel - 1]) {
                    this.game.puzzle.resetFromData(data.puzzles[numLevel - 1]);
                }
                else {
                    location.hash = "#levels";
                    return;
                }
            }
            this.show(this.playUI, false, showTime);
            this.game.mode = GameMode.Preplay;
            await this.game.puzzle.reset();
            this.game.puzzle.editorOrEditorPreview = false;
            (document.querySelector("#editor-btn") as HTMLButtonElement).style.display = DEV_MODE_ACTIVATED ? "" : "none";
            this.game.globalTimer = 0;
        }
        else if (page.startsWith("#puzzle-")) {
            let puzzleId = parseInt(page.replace("#puzzle-", ""));
            if (this.game.puzzle.data.id != puzzleId) {
                let data: IPuzzleData = await this.game.getPuzzleDataById(puzzleId);
                if (!data) {
                    console.error("Puzzle #" + puzzleId + " not found.");
                    location.hash = "#home";
                    return;
                }
                this.game.puzzle.resetFromData(data);
            }
            if (this.game.puzzle.data.state === 8) {
                this.game.puzzle.puzzleUI.successNextButton.onpointerup = () => {
                this.game.puzzle.puzzleUI.autoNext = false
                location.hash = "#xmas-puzzles"
            };
                (this.game.puzzle.puzzleUI.gameoverBackButton.parentElement as HTMLAnchorElement).href = "#xmas-puzzles";
            }
            else if (this.game.puzzle.data.state === 4) {
                this.game.puzzle.puzzleUI.successNextButton.onpointerup = () => {
                this.game.puzzle.puzzleUI.autoNext = false
                location.hash = "#multiplayer-puzzles"
            };
                (this.game.puzzle.puzzleUI.gameoverBackButton.parentElement as HTMLAnchorElement).href = "#multiplayer-puzzles";
            }
            else if (this.game.puzzle.data.state === 3) {
                this.game.puzzle.puzzleUI.successNextButton.onpointerup = () => {
                this.game.puzzle.puzzleUI.autoNext = false
                location.hash = "#expert-puzzles"
            };
                (this.game.puzzle.puzzleUI.gameoverBackButton.parentElement as HTMLAnchorElement).href = "#expert-puzzles";
            }
            else {
                this.game.puzzle.puzzleUI.successNextButton.onpointerup = () => {
                this.game.puzzle.puzzleUI.autoNext = false
                location.hash = "#community-puzzles"
            };
                (this.game.puzzle.puzzleUI.gameoverBackButton.parentElement as HTMLAnchorElement).href = "#community-puzzles";
            }
            this.show(this.playUI, false, showTime);
            this.game.mode = GameMode.Preplay;
            await this.game.puzzle.reset();
            this.game.puzzle.editorOrEditorPreview = false;
            (document.querySelector("#editor-btn") as HTMLButtonElement).style.display = DEV_MODE_ACTIVATED ? "" : "none";
            this.game.globalTimer = 0;
        }
        else if (page.startsWith("#levels")) {
            if (USE_POKI_SDK) {
                PokiGameplayStop();
            }
            this.show(this.storyPuzzlesPage.nabuPage, false, showTime);
            requestAnimationFrame(() => {
                this.storyPuzzlesPage.redraw();
            })
        }
        else if (page.startsWith("#expert-puzzles")) {
            if (USE_POKI_SDK) {
                PokiGameplayStop();
            }
            this.show(this.expertPuzzlesPage.nabuPage, false, showTime);
            requestAnimationFrame(() => {
                this.expertPuzzlesPage.redraw();
            })
        }
        else if (page.startsWith("#xmas-puzzles")) {
            if (USE_POKI_SDK) {
                PokiGameplayStop();
            }
            this.show(this.xmasPuzzlesPage.nabuPage, false, showTime);
            requestAnimationFrame(() => {
                this.xmasPuzzlesPage.redraw();
            })
        }
        else if (page.startsWith("#community-puzzles")) {
            if (USE_POKI_SDK) {
                PokiGameplayStop();
            }
            this.show(this.communityPuzzlesPage.nabuPage, false, showTime);
            requestAnimationFrame(() => {
                this.communityPuzzlesPage.redraw();
            })
        }
        else if (page.startsWith("#multiplayer-puzzles")) {
            if (USE_POKI_SDK) {
                PokiGameplayStop();
            }
            this.show(this.multiplayerPuzzlesPage.nabuPage, false, showTime);
            requestAnimationFrame(() => {
                this.multiplayerPuzzlesPage.redraw();
            })
        }
        else if (page.startsWith("#multiplayer")) {
            if (USE_POKI_SDK) {
                PokiGameplayStop();
            }
            await this.show(this.multiplayerPage.nabuPage, false, showTime);
        }
        else if (page.startsWith("#dev-puzzles")) {
            if (USE_POKI_SDK) {
                PokiGameplayStop();
            }
            if (!DEV_MODE_ACTIVATED) {
                location.hash = "#dev";
                return;
            }
            this.show(this.devPuzzlesPage.nabuPage, false, showTime);
            if (page.indexOf("#dev-puzzles-") != -1) {
                let state = parseInt(page.replace("#dev-puzzles-", ""));
                this.devPuzzlesPage.levelStateToFetch = state;
            }
            else {
                this.devPuzzlesPage.levelStateToFetch = 0;
            }
            requestAnimationFrame(() => {
                this.devPuzzlesPage.redraw();
            })
        }
        else if (page.startsWith("#home")) {
            if (ADVENT_CAL) {
                location.hash = "#xmas-puzzles";
            }
            if (USE_POKI_SDK) {
                PokiGameplayStop();
            }
            this.homeMenu.updateCompletionBars();
            await this.show(this.homeMenu.nabuPage, false, showTime);
        }
        else {
            location.hash = "#home";
            return;
        }
    }
}
