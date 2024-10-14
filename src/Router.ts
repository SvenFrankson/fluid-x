class CarillonRouter extends Nabu.Router {
    public homeMenu: Nabu.DefaultPage;
    public levelPage: LevelPage;
    public playUI: Nabu.DefaultPage;
    public editorUI: Nabu.DefaultPage;

    constructor(public game: Game) {
        super();
    }

    protected onFindAllPages(): void {
        this.homeMenu = document.querySelector("#home-menu") as Nabu.DefaultPage;
        this.levelPage = new LevelPage("#level-page", this);
        this.playUI = document.querySelector("#play-ui") as Nabu.DefaultPage;
        this.editorUI = document.querySelector("#editor-ui") as Nabu.DefaultPage;
    }

    protected onUpdate(): void {}

    protected async onHRefChange(page: string, previousPage: string): Promise<void> {
        console.log("onHRefChange previous " + previousPage + " now " + page);
        //?gdmachineId=1979464530
        
        if (page.startsWith("#options")) {
            
        }
        else if (page.startsWith("#credits")) {
            
        }
        else if (page.startsWith("#community")) {
            
        }
        else if (page.startsWith("#editor")) {
            await this.show(this.editorUI, false, 0);
        }
        else if (page.startsWith("#level-")) {
            let fileName = page.replace("#level-", "");
            await this.game.terrain.loadFromFile("./datas/levels/" + fileName + ".txt");
            await this.game.terrain.instantiate();
            await this.show(this.playUI, false, 0);
        }
        else if (page.startsWith("#levels")) {
            await this.show(this.levelPage.nabuPage, false, 0);
            this.levelPage.redraw();
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
