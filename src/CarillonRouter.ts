class CarillonRouter extends Nabu.Router {
    public homeMenu: HomePage;
    public baseLevelPage: BaseLevelPage;
    public communityLevelPage: CommunityLevelPage;
    public devLevelPage: DevLevelPage;
    public playUI: Nabu.DefaultPage;
    public editorUI: Nabu.DefaultPage;
    public creditsPage: Nabu.DefaultPage;
    public devPage: Nabu.DefaultPage;
    public eulaPage: Nabu.DefaultPage;

    public timerText: HTMLDivElement;
    public puzzleIntro: HTMLDivElement;
    
    public playBackButton: HTMLButtonElement;

    constructor(public game: Game) {
        super();
    }

    protected onFindAllPages(): void {
        console.log("onFindAllPages");
        this.homeMenu = new HomePage("#home-menu", this);
        this.baseLevelPage = new BaseLevelPage("#base-levels-page", this);
        this.communityLevelPage = new CommunityLevelPage("#community-levels-page", this);
        this.devLevelPage = new DevLevelPage("#dev-levels-page", this);
        this.creditsPage = document.querySelector("#credits-page") as Nabu.DefaultPage;
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
        console.log("onHRefChange previous " + previousPage + " now " + page);
        //?gdmachineId=1979464530

        for (let i = 0; i < this.pages.length; i++) {
            await this.pages[i].waitLoaded();
        }
        
        this.game.mode = GameMode.Menu;
        this.game.editor.deactivate();

        if (page.startsWith("#options")) {
            
        }
        else if (page.startsWith("#credits")) {
            await this.show(this.creditsPage, false, 0);
        }
        else if (page === "#dev") {
            await this.show(this.devPage, false, 0);
        }
        else if (page.startsWith("#community")) {
            await this.show(this.communityLevelPage.nabuPage, false, 0);
            this.communityLevelPage.redraw();
        }
        else if (page.startsWith("#dev-levels")) {
            if (!DEV_MODE_ACTIVATED) {
                location.hash = "#dev";
                return;
            }
            await this.show(this.devLevelPage.nabuPage, false, 0);
            if (page.indexOf("#dev-levels-") != -1) {
                let state = parseInt(page.replace("#dev-levels-", ""));
                this.devLevelPage.levelStateToFetch = state;
            }
            else {
                this.devLevelPage.levelStateToFetch = 0;
            }
            this.devLevelPage.redraw();
        }
        else if (page.startsWith("#editor-preview")) {
            (this.game.puzzle.puzzleUI.successBackButton.parentElement as HTMLAnchorElement).href = "#editor";
            (this.game.puzzle.puzzleUI.successNextButton.parentElement as HTMLAnchorElement).href = "#editor";
            (this.game.puzzle.puzzleUI.gameoverBackButton.parentElement as HTMLAnchorElement).href = "#editor";
            await this.show(this.playUI, false, 0);
            (document.querySelector("#editor-btn") as HTMLButtonElement).style.display = "";
            await this.game.puzzle.reset();
            this.game.mode = GameMode.Play;
        }
        else if (page.startsWith("#editor")) {
            await this.show(this.editorUI, false, 0);
            await this.game.puzzle.reset();
            this.game.editor.activate();
            this.game.mode = GameMode.Editor;
        }
        else if (page.startsWith("#level-")) {
            (this.playBackButton.parentElement as HTMLAnchorElement).href = "#levels";
            (this.game.puzzle.puzzleUI.successBackButton.parentElement as HTMLAnchorElement).href = "#levels";
            (this.game.puzzle.puzzleUI.gameoverBackButton.parentElement as HTMLAnchorElement).href = "#levels";
            let numLevel = parseInt(page.replace("#level-", ""));
            (this.game.puzzle.puzzleUI.successNextButton.parentElement as HTMLAnchorElement).href = "#level-" + (numLevel + 1).toFixed(0);
            if (this.game.puzzle.data.numLevel != numLevel) {
                let data = this.game.tiaratumGameTutorialLevels;
                if (data.puzzles[numLevel - 1]) {
                    this.game.puzzle.loadFromData(data.puzzles[numLevel - 1]);
                }
                else {
                    location.hash = "#levels";
                    return;
                }
            }
            await this.game.puzzle.reset();
            await this.show(this.playUI, false, 0);
            (document.querySelector("#editor-btn") as HTMLButtonElement).style.display = DEV_MODE_ACTIVATED ? "" : "none";
            this.game.mode = GameMode.Play;
        }
        else if (page.startsWith("#play-community-")) {
            (this.playBackButton.parentElement as HTMLAnchorElement).href = "#community";
            (this.game.puzzle.puzzleUI.successBackButton.parentElement as HTMLAnchorElement).href = "#community";
            (this.game.puzzle.puzzleUI.successNextButton.parentElement as HTMLAnchorElement).href = "#community";
            (this.game.puzzle.puzzleUI.gameoverBackButton.parentElement as HTMLAnchorElement).href = "#community";
            let puzzleId = parseInt(page.replace("#play-community-", ""));
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
                this.game.puzzle.loadFromData(data);
            }
            await this.game.puzzle.reset();
            await this.show(this.playUI, false, 0);
            (document.querySelector("#editor-btn") as HTMLButtonElement).style.display = DEV_MODE_ACTIVATED ? "" : "none";
            this.game.mode = GameMode.Play;
        }
        else if (page.startsWith("#levels")) {
            await this.show(this.baseLevelPage.nabuPage, false, 0);
            this.baseLevelPage.redraw();
        }
        else if (page.startsWith("#home")) {
            await this.show(this.homeMenu.nabuPage, false, 0);
        }
        else {
            location.hash = "#home";
            return;
        }
    }
}
