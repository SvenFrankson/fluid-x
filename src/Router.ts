class CarillonRouter extends Nabu.Router {
    public homeMenu: Nabu.DefaultPage;
    public baseLevelPage: BaseLevelPage;
    public communityLevelPage: CommunityLevelPage;
    public playUI: Nabu.DefaultPage;
    public editorUI: Nabu.DefaultPage;

    constructor(public game: Game) {
        super();
    }

    protected onFindAllPages(): void {
        this.homeMenu = document.querySelector("#home-menu") as Nabu.DefaultPage;
        this.baseLevelPage = new BaseLevelPage("#base-levels-page", this);
        this.communityLevelPage = new CommunityLevelPage("#community-levels-page", this);
        this.playUI = document.querySelector("#play-ui") as Nabu.DefaultPage;
        this.editorUI = document.querySelector("#editor-ui") as Nabu.DefaultPage;
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
        else if (page.startsWith("#editor-preview")) {
            await this.show(this.playUI, false, 0);
            (document.querySelector("#editor-btn") as HTMLButtonElement).style.display = "";
            await this.game.terrain.reset();
            this.game.mode = GameMode.Play;
        }
        else if (page.startsWith("#editor")) {
            await this.show(this.editorUI, false, 0);
            await this.game.terrain.reset();
            this.game.editor.activate();
            this.game.mode = GameMode.Editor;
        }
        else if (page.startsWith("#level-")) {
            let fileName = page.replace("#level-", "");
            await this.game.terrain.loadFromFile("./datas/levels/" + fileName + ".txt");
            await this.game.terrain.instantiate();
            await this.show(this.playUI, false, 0);
            (document.querySelector("#editor-btn") as HTMLButtonElement).style.display = "none";
            this.game.mode = GameMode.Play;
        }
        else if (page.startsWith("#play-community")) {
            await this.game.terrain.instantiate();
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
