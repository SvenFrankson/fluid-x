class CarillonRouter extends Nabu.Router {
    public homeMenu: HomePage;
    public baseLevelsPage: BaseLevelPage;
    public expertLevelsPage: ExpertLevelPage;
    public communityLevelPage: CommunityLevelPage;
    public devLevelPage: DevLevelPage;
    public multiplayerLevelsPage: MultiplayerLevelPage;
    public playUI: Nabu.DefaultPage;
    public editorUI: Nabu.DefaultPage;
    public creditsPage: Nabu.DefaultPage;
    public multiplayerPage: MultiplayerPage;
    public devPage: Nabu.DefaultPage;
    public eulaPage: Nabu.DefaultPage;

    public timerText: HTMLDivElement;
    public puzzleIntro: HTMLDivElement;
    
    public playBackButton: HTMLButtonElement;

    constructor(public game: Game) {
        super();
    }

    public async postInitialize(): Promise<void> {
        for (let i = 0; i < this.pages.length; i++) {
            await this.pages[i].waitLoaded();
        }

        this.homeMenu = new HomePage("#home-menu", this);
        this.baseLevelsPage = new BaseLevelPage("#base-levels-page", this);
        this.expertLevelsPage = new ExpertLevelPage("#expert-puzzles-page", this);
        this.communityLevelPage = new CommunityLevelPage("#community-levels-page", this);
        this.devLevelPage = new DevLevelPage("#dev-levels-page", this);
        this.multiplayerLevelsPage = new MultiplayerLevelPage("#multiplayer-levels-page", this);
        this.creditsPage = document.querySelector("#credits-page") as Nabu.DefaultPage;
        this.multiplayerPage = new MultiplayerPage("#multiplayer-page", this);
        this.playUI = document.querySelector("#play-ui") as Nabu.DefaultPage;
        this.editorUI = document.querySelector("#editor-ui") as Nabu.DefaultPage;
        this.devPage = document.querySelector("#dev-page") as Nabu.DefaultPage;
        this.eulaPage = document.querySelector("#eula-page") as Nabu.DefaultPage;
        
        this.playBackButton = document.querySelector("#play-ui .back-btn") as HTMLButtonElement;
        this.timerText = document.querySelector("#play-timer");
        this.puzzleIntro = document.querySelector("#puzzle-intro");
    }

    protected onUpdate(): void {}

    protected async onHRefChange(page: string, previousPage: string): Promise<void> {
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
        else if (page.startsWith("#community")) {
            if (USE_POKI_SDK) {
                PokiGameplayStop();
            }
            this.show(this.communityLevelPage.nabuPage, false, showTime);
            requestAnimationFrame(() => {
                this.communityLevelPage.redraw();
            })
        }
        else if (page.startsWith("#dev-levels")) {
            if (USE_POKI_SDK) {
                PokiGameplayStop();
            }
            if (!DEV_MODE_ACTIVATED) {
                location.hash = "#dev";
                return;
            }
            this.show(this.devLevelPage.nabuPage, false, showTime);
            if (page.indexOf("#dev-levels-") != -1) {
                let state = parseInt(page.replace("#dev-levels-", ""));
                this.devLevelPage.levelStateToFetch = state;
            }
            else {
                this.devLevelPage.levelStateToFetch = 0;
            }
            requestAnimationFrame(() => {
                this.devLevelPage.redraw();
            })
        }
        else if (page.startsWith("#editor-preview")) {
            (this.game.puzzle.puzzleUI.successNextButton.parentElement as HTMLAnchorElement).href = "#editor";
            this.show(this.playUI, false, showTime);
            (document.querySelector("#editor-btn") as HTMLButtonElement).style.display = "";
            await this.game.puzzle.reset();
            this.game.puzzle.skipIntro();
            this.game.mode = GameMode.Preplay;
            this.game.globalTimer = 0;
        }
        else if (page.startsWith("#editor")) {
            this.show(this.editorUI, false, showTime);
            await this.game.puzzle.reset();
            this.game.editor.activate();
            this.game.mode = GameMode.Editor;
        }
        else if (page.startsWith("#level-")) {
            let numLevel = parseInt(page.replace("#level-", ""));
            (this.game.puzzle.puzzleUI.successNextButton.parentElement as HTMLAnchorElement).href = "#level-" + (numLevel + 1).toFixed(0);
            if (this.game.puzzle.data.numLevel != numLevel) {
                let data = this.game.tiaratumGameTutorialLevels;
                if (data.puzzles[numLevel - 1]) {
                    this.game.puzzle.resetFromData(data.puzzles[numLevel - 1]);
                }
                else {
                    location.hash = "#levels";
                    return;
                }
            }
            this.show(this.playUI, false, showTime);
            await this.game.puzzle.reset();
            (document.querySelector("#editor-btn") as HTMLButtonElement).style.display = DEV_MODE_ACTIVATED ? "" : "none";
            this.game.mode = GameMode.Preplay;
            this.game.globalTimer = 0;
        }
        else if (page.startsWith("#puzzle-")) {
            let puzzleId = parseInt(page.replace("#puzzle-", ""));
            if (this.game.puzzle.data.id != puzzleId) {
                let headers = {};
                if (var1) {
                    headers = { 
                        "Authorization": 'Basic ' + btoa("carillon:" + var1)
                    };
                }
                const response = await fetch(SHARE_SERVICE_PATH + "puzzle/" + puzzleId.toFixed(0), {
                    method: "GET",
                    mode: "cors",
                    headers: headers
                });
                let data = await response.json();
                CLEAN_IPuzzleData(data);
                this.game.puzzle.resetFromData(data);
            }
            if (this.game.puzzle.data.state === 4) {
                (this.game.puzzle.puzzleUI.successNextButton.parentElement as HTMLAnchorElement).href = "#multiplayer-levels";
            }
            else if (this.game.puzzle.data.state === 3) {
                (this.game.puzzle.puzzleUI.successNextButton.parentElement as HTMLAnchorElement).href = "#expert-puzzles";
            }
            else {
                (this.game.puzzle.puzzleUI.successNextButton.parentElement as HTMLAnchorElement).href = "#community";
            }
            this.show(this.playUI, false, showTime);
            await this.game.puzzle.reset();
            (document.querySelector("#editor-btn") as HTMLButtonElement).style.display = DEV_MODE_ACTIVATED ? "" : "none";
            this.game.mode = GameMode.Preplay;
            this.game.globalTimer = 0;
        }
        else if (page.startsWith("#levels")) {
            if (USE_POKI_SDK) {
                PokiGameplayStop();
            }
            this.show(this.baseLevelsPage.nabuPage, false, showTime);
            requestAnimationFrame(() => {
                this.baseLevelsPage.redraw();
            })
        }
        else if (page.startsWith("#expert-puzzles")) {
            if (USE_POKI_SDK) {
                PokiGameplayStop();
            }
            this.show(this.expertLevelsPage.nabuPage, false, showTime);
            requestAnimationFrame(() => {
                this.expertLevelsPage.redraw();
            })
        }
        else if (page.startsWith("#multiplayer-levels")) {
            if (USE_POKI_SDK) {
                PokiGameplayStop();
            }
            this.show(this.multiplayerLevelsPage.nabuPage, false, showTime);
            requestAnimationFrame(() => {
                this.multiplayerLevelsPage.redraw();
            })
        }
        else if (page.startsWith("#multiplayer")) {
            if (USE_POKI_SDK) {
                PokiGameplayStop();
            }
            await this.show(this.multiplayerPage.nabuPage, false, showTime);
        }
        else if (page.startsWith("#home")) {
            if (USE_POKI_SDK) {
                PokiGameplayStop();
            }
            await this.show(this.homeMenu.nabuPage, false, showTime);
        }
        else {
            location.hash = "#home";
            return;
        }
    }
}
