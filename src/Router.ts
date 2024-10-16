class CarillonRouter extends Nabu.Router {
    public homeMenu: Nabu.DefaultPage;
    public baseLevelPage: BaseLevelPage;
    public communityLevelPage: CommunityLevelPage;
    public devLevelPage: DevLevelPage;
    public playUI: Nabu.DefaultPage;
    public editorUI: Nabu.DefaultPage;

    public playBackButton: HTMLButtonElement;
    public successReplayButton: HTMLButtonElement;
    public successBackButton: HTMLButtonElement;
    public successNextButton: HTMLButtonElement;
    public gameoverBackButton: HTMLButtonElement;
    public gameoverReplayButton: HTMLButtonElement;

    constructor(public game: Game) {
        super();
    }

    protected onFindAllPages(): void {
        this.homeMenu = document.querySelector("#home-menu") as Nabu.DefaultPage;
        this.baseLevelPage = new BaseLevelPage("#base-levels-page", this);
        this.communityLevelPage = new CommunityLevelPage("#community-levels-page", this);
        this.devLevelPage = new DevLevelPage("#dev-levels-page", this);
        this.playUI = document.querySelector("#play-ui") as Nabu.DefaultPage;
        this.editorUI = document.querySelector("#editor-ui") as Nabu.DefaultPage;

        this.playBackButton = document.querySelector("#play-ui .back-btn") as HTMLButtonElement;
        this.successReplayButton = document.querySelector("#success-replay-btn") as HTMLButtonElement;
        this.successReplayButton.onclick = () => {
            this.game.puzzle.reset();
        }
        this.successBackButton = document.querySelector("#success-back-btn") as HTMLButtonElement;
        this.successNextButton = document.querySelector("#success-next-btn") as HTMLButtonElement;
        this.gameoverBackButton = document.querySelector("#gameover-back-btn") as HTMLButtonElement;
        this.gameoverReplayButton = document.querySelector("#gameover-replay-btn") as HTMLButtonElement;
        this.gameoverReplayButton.onclick = () => {
            this.game.puzzle.reset();
        }
    }

    protected onUpdate(): void {}

    protected async onHRefChange(page: string, previousPage: string): Promise<void> {
        console.log("onHRefChange previous " + previousPage + " now " + page);
        //?gdmachineId=1979464530
        
        this.game.mode = GameMode.Menu;
        this.game.editor.deactivate();

        if (page.startsWith("#options")) {
            
        }
        else if (page.startsWith("#credits")) {
            
        }
        else if (page.startsWith("#community")) {
            await this.show(this.communityLevelPage.nabuPage, false, 0);
            this.communityLevelPage.redraw();
        }
        else if (page.startsWith("#dev-levels")) {
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
            (this.successBackButton.parentElement as HTMLAnchorElement).href = "#editor";
            (this.successNextButton.parentElement as HTMLAnchorElement).href = "#editor";
            (this.gameoverBackButton.parentElement as HTMLAnchorElement).href = "#editor";
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
            (this.successBackButton.parentElement as HTMLAnchorElement).href = "#levels";
            (this.gameoverBackButton.parentElement as HTMLAnchorElement).href = "#levels";
            let numLevel = parseInt(page.replace("#level-", ""));
            (this.successNextButton.parentElement as HTMLAnchorElement).href = "#level-" + (numLevel + 1).toFixed(0);
            if (this.game.puzzle.data.numLevel != numLevel) {
                let data = this.game.tiaratumGameLevels;
                if (data.puzzles[numLevel]) {
                    this.game.puzzle.loadFromData(data.puzzles[numLevel]);
                }
                else {
                    location.hash = "#levels";
                }
            }
            await this.game.puzzle.reset();
            await this.show(this.playUI, false, 0);
            (document.querySelector("#editor-btn") as HTMLButtonElement).style.display = "none";
            this.game.mode = GameMode.Play;
        }
        else if (page.startsWith("#play-community-")) {
            (this.playBackButton.parentElement as HTMLAnchorElement).href = "#community";
            (this.successBackButton.parentElement as HTMLAnchorElement).href = "#community";
            (this.successNextButton.parentElement as HTMLAnchorElement).href = "#community";
            (this.gameoverBackButton.parentElement as HTMLAnchorElement).href = "#community";
            let id = parseInt(page.replace("#play-community-", ""));
            if (this.game.puzzle.data.id != id) {
                const response = await fetch("http://localhost/index.php/puzzle/" + id.toFixed(0), {
                    method: "GET",
                    mode: "cors"
                });
                let data = await response.json();
                this.game.puzzle.loadFromData(data);
            }
            await this.game.puzzle.reset();
            await this.show(this.playUI, false, 0);
            (document.querySelector("#editor-btn") as HTMLButtonElement).style.display = "none";
            this.game.mode = GameMode.Play;
        }
        else if (page.startsWith("#levels")) {
            await this.show(this.baseLevelPage.nabuPage, false, 0);
            this.baseLevelPage.redraw();
        }
        else if (page.startsWith("#home")) {
            await this.show(this.homeMenu, false, 0);
        }
        else {
            location.hash = "#home";
            return;
        }
    }
}
