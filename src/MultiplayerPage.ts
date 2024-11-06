enum MultiplayerPagePanel {
    Selection,
    Local
}

class MultiplayerPage {

    public nabuPage: Nabu.DefaultPage;
    public currentPanel: MultiplayerPagePanel = MultiplayerPagePanel.Selection;

    public panels: HTMLDivElement[] = [];

    public selectLocalBtn: HTMLButtonElement;
    public selectPublicBtn: HTMLButtonElement;
    public selectPrivateBtn: HTMLButtonElement;

    public localPlayBtn: HTMLButtonElement;

    constructor(queryString: string, public router: CarillonRouter) {
        this.nabuPage = document.querySelector(queryString);
        this.panels = [
            document.querySelector("#multiplayer-panel-selection") as HTMLDivElement,
            document.querySelector("#multiplayer-panel-local") as HTMLDivElement
        ];

        this.selectLocalBtn = document.querySelector("#multiplayer-select-local") as HTMLButtonElement;
        this.selectLocalBtn.onclick = () => {
            this.setPanel(MultiplayerPagePanel.Local);
        }

        this.selectPublicBtn = document.querySelector("#multiplayer-select-public") as HTMLButtonElement;
        this.selectPrivateBtn = document.querySelector("#multiplayer-select-private") as HTMLButtonElement;

        this.localPlayBtn = this.panels[MultiplayerPagePanel.Local].querySelector(".multiplayer-play") as HTMLButtonElement;
        (this.panels[MultiplayerPagePanel.Local].querySelector(".multiplayer-back") as HTMLButtonElement).onclick = () => {
            this.setPanel(MultiplayerPagePanel.Selection);
        }

        this._registerToInputManager();
    }

    public setPanel(p: MultiplayerPagePanel): void {
        for (let i = 0; i < this.panels.length; i++) {
            this.panels[i].style.display = (p === i) ? "block" : "none";
        }
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

    private _hoveredButtonIndex: number = 0;
    public get hoveredButtonIndex(): number {
        return this._hoveredButtonIndex;
    }
    
    public setHoveredButtonIndex(v: number, filter?: (btn: HTMLButtonElement) => boolean): boolean {
        /*
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
        */
        return false;
    }

    private _registerToInputManager(): void {
        this.router.game.uiInputManager.onUpCallbacks.push(this._inputUp);
        this.router.game.uiInputManager.onDownCallbacks.push(this._inputDown);
        this.router.game.uiInputManager.onEnterCallbacks.push(this._inputEnter);
        this.router.game.uiInputManager.onDropControlCallbacks.push(this._inputDropControl);
    }

    private _unregisterFromInputManager(): void {
        this.router.game.uiInputManager.onUpCallbacks.remove(this._inputUp);
        this.router.game.uiInputManager.onDownCallbacks.remove(this._inputDown);
        this.router.game.uiInputManager.onEnterCallbacks.remove(this._inputEnter);
        this.router.game.uiInputManager.onDropControlCallbacks.remove(this._inputDropControl);
    }

    private _filter = (btn: HTMLButtonElement) => {
        return !btn.classList.contains("locked") && btn.style.visibility != "hidden";
    }

    private _inputUp = () => {
        if (!this.shown) {
            return;
        }
        /*
        if (this.buttons.length === 0) {
            return;
        }
        if (this.hoveredButtonIndex === 0) {
            if (!this.setHoveredButtonIndex(this.hoveredButtonIndex + (this.rowCount - 1), this._filter)) {
                this._inputUp();
            }
        }
        else {
            if (!this.setHoveredButtonIndex(this.hoveredButtonIndex - 1, this._filter)) {
                this._inputUp();
            }
        }
        */
    }

    private _inputDown = () => {
        if (!this.shown) {
            return;
        }
        /*
        if (this.buttons.length === 0) {
            return;
        }
        if (this.hoveredButtonIndex === this.rowCount - 1) {
            if (!this.setHoveredButtonIndex(this.hoveredButtonIndex - (this.rowCount - 1), this._filter)) {
                this._inputDown();
            }
        }
        else {
            if (!this.setHoveredButtonIndex(this.hoveredButtonIndex + 1, this._filter)) {
                this._inputDown();
            }
        }
        */
    }

    private _inputEnter = () => {
        if (!this.shown) {
            return;
        }
        /*
        if (this.buttons.length === 0) {
            return;
        }
        let btn = this.buttons[this._hoveredButtonIndex];
        if (btn && btn.onpointerup) {
            btn.onpointerup(undefined);
        }
        */
    }

    private _inputDropControl = () => {
        if (!this.shown) {
            return;
        }
        /*
        if (this.buttons.length === 0) {
            return;
        }
        this.buttons.forEach(btn => {
            btn.classList.remove("hovered");
        });
        */
    }
}