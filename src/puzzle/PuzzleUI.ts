class PuzzleUI {

    public successPanel: HTMLDivElement;
    public gameoverPanel: HTMLDivElement;
    public failMessage: HTMLDivElement;
    public highscoreContainer: HTMLDivElement;
    public highscorePlayerLine: HTMLDivElement;
    public scoreSubmitBtn: HTMLButtonElement;
    public scorePendingBtn: HTMLButtonElement;
    public scoreDoneBtn: HTMLButtonElement;
    public successReplayButton: HTMLButtonElement;
    public successNextButton: HTMLButtonElement;
    public gameoverBackButton: HTMLButtonElement;
    public gameoverReplayButton: HTMLButtonElement;

    private _hoveredElement: HTMLElement;
    public get hoveredElement(): HTMLElement {
        return this._hoveredElement;
    }
    public setHoveredElement(e: HTMLElement): void {
        if (this.hoveredElement) {
            this.hoveredElement.classList.remove("hovered");
        }
        this._hoveredElement = e;
        if (this.hoveredElement) {
            this.hoveredElement.classList.add("hovered");
        }
    }

    public get game(): Game {
        return this.puzzle.game;
    }

    constructor(public puzzle: Puzzle) {
        this.failMessage = document.querySelector("#success-score-fail-message");
        this.highscoreContainer = document.querySelector("#success-highscore-container");
        this.highscorePlayerLine = document.querySelector("#score-player-input").parentElement as HTMLDivElement;
        this.scoreSubmitBtn = document.querySelector("#success-score-submit-btn");
        this.scorePendingBtn = document.querySelector("#success-score-pending-btn");
        this.scoreDoneBtn = document.querySelector("#success-score-done-btn");
        
        this.successReplayButton = document.querySelector("#success-replay-btn") as HTMLButtonElement;
        this.successReplayButton.onclick = () => {
            this.puzzle.reset();
        }
        this.successNextButton = document.querySelector("#success-next-btn") as HTMLButtonElement;
        this.gameoverBackButton = document.querySelector("#gameover-back-btn") as HTMLButtonElement;
        this.gameoverReplayButton = document.querySelector("#gameover-replay-btn") as HTMLButtonElement;
        this.gameoverReplayButton.onclick = () => {
            this.puzzle.reset();
        }
        
        this.successPanel = document.querySelector("#play-success-panel");
        this.gameoverPanel = document.querySelector("#play-gameover-panel");

        this.game.router.playUI.onshow = () => { this._registerToInputManager(); };
        this.game.router.playUI.onhide = () => { this._unregisterFromInputManager(); };
    }

    public win(): void {
        this.successPanel.style.display = "";
        this.gameoverPanel.style.display = "none";
        if (this.game.uiInputManager.inControl) {
            this.setHoveredElement(this.successNextButton);
        }
    }

    public lose(): void {
        this.successPanel.style.display = "none";
        this.gameoverPanel.style.display = "";
        if (this.game.uiInputManager.inControl) {
            this.setHoveredElement(this.gameoverReplayButton);
        }
    }

    public reset(): void {
        if (this.successPanel) {
            this.successPanel.style.display = "none";
        }
        if (this.gameoverPanel) {
            this.gameoverPanel.style.display = "none";
        }
    }

    public setHighscoreState(state: number): void {
        this.failMessage.style.display = "none";
        if (state === 0) {
            // Not enough for Highscore
            this.highscoreContainer.style.display = "none";
        }
        else if (state === 1) {
            // Enough for Highscore, waiting for player action.
            this.highscoreContainer.style.display = "block";

            this.scoreSubmitBtn.style.display = "inline-block";
            this.scorePendingBtn.style.display = "none";
            this.scoreDoneBtn.style.display = "none";
        }
        else if (state === 2) {
            // Sending Highscore.
            this.highscoreContainer.style.display = "block";

            this.scoreSubmitBtn.style.display = "none";
            this.scorePendingBtn.style.display = "inline-block";
            this.scoreDoneBtn.style.display = "none";
        }
        else if (state === 3) {
            // Highscore sent with success.
            this.highscoreContainer.style.display = "block";

            this.scoreSubmitBtn.style.display = "none";
            this.scorePendingBtn.style.display = "none";
            this.scoreDoneBtn.style.display = "inline-block";

            if (this.game.uiInputManager.inControl) {
                this.setHoveredElement(this.successNextButton);
            }
        }
    }

    private _registerToInputManager(): void {
        this.game.uiInputManager.onUpCallbacks.push(this._inputUp);
        this.game.uiInputManager.onLeftCallbacks.push(this._inputLat);
        this.game.uiInputManager.onDownCallbacks.push(this._inputDown);
        this.game.uiInputManager.onRightCallbacks.push(this._inputLat);
        this.game.uiInputManager.onEnterCallbacks.push(this._inputEnter);
        this.game.uiInputManager.onBackCallbacks.push(this._inputBack);
        this.game.uiInputManager.onDropControlCallbacks.push(this._inputDropControl);
    }

    private _unregisterFromInputManager(): void {
        this.game.uiInputManager.onUpCallbacks.remove(this._inputUp);
        this.game.uiInputManager.onLeftCallbacks.remove(this._inputLat);
        this.game.uiInputManager.onDownCallbacks.remove(this._inputDown);
        this.game.uiInputManager.onRightCallbacks.remove(this._inputLat);
        this.game.uiInputManager.onEnterCallbacks.remove(this._inputEnter);
        this.game.uiInputManager.onBackCallbacks.remove(this._inputBack);
        this.game.uiInputManager.onDropControlCallbacks.remove(this._inputDropControl);
    }

    private _inputUp = () => {
        if (this.successPanel.style.display === "") {
            if (this.hoveredElement === undefined) {
                this.setHoveredElement(this.successNextButton);
            }
            else if (this.hoveredElement === this.successNextButton) {
                this.setHoveredElement(this.successReplayButton);
            }
            else if (this.hoveredElement === this.successReplayButton) {
                if (this.highscoreContainer.style.display === "block") {
                    if (this.scoreSubmitBtn.style.display === "inline-block" && !this.scoreSubmitBtn.classList.contains("locked")) {
                        this.setHoveredElement(this.scoreSubmitBtn);
                    }
                    else {
                        this.setHoveredElement(this.highscorePlayerLine);
                    }
                }
            }
            else if (this.hoveredElement === this.scoreSubmitBtn) {
                this.setHoveredElement(this.highscorePlayerLine);
            }
            else if (this.hoveredElement === this.highscorePlayerLine) {
                this.setHoveredElement(this.successNextButton);
            }
        }
        else if (this.gameoverPanel.style.display === "") {
            
        }
    }

    private _inputLat = () => {
        if (this.successPanel.style.display === "") {
            if (this.hoveredElement === undefined) {
                this.setHoveredElement(this.successNextButton);
            }
            else if (this.hoveredElement === this.successReplayButton) {
                this.setHoveredElement(this.successNextButton);
            } 
            else if (this.hoveredElement === this.successNextButton) {
                this.setHoveredElement(this.successReplayButton);
            }
        }
        else if (this.gameoverPanel.style.display === "") {
            if (this.hoveredElement === undefined) {
                this.setHoveredElement(this.gameoverReplayButton);
            }
            else if (this.hoveredElement === this.gameoverBackButton) {
                this.setHoveredElement(this.gameoverReplayButton);
            } 
            else if (this.hoveredElement === this.gameoverReplayButton) {
                this.setHoveredElement(this.gameoverBackButton);
            }
        }
    }

    private _inputDown = () => {
        if (this.successPanel.style.display === "") {
            if (this.hoveredElement === undefined) {
                this.setHoveredElement(this.successNextButton);
            }
            else if (this.hoveredElement === this.highscorePlayerLine) {
                if (this.scoreSubmitBtn.style.display === "inline-block" && !this.scoreSubmitBtn.classList.contains("locked")) {
                    this.setHoveredElement(this.scoreSubmitBtn);
                }
                else {
                    this.setHoveredElement(this.successReplayButton);
                }
            }
            else if (this.hoveredElement === this.scoreSubmitBtn) {
                this.setHoveredElement(this.successReplayButton);
            }
            else if (this.hoveredElement === this.successReplayButton) {
                this.setHoveredElement(this.successNextButton);
            }
            else if (this.hoveredElement === this.successNextButton) {
                if (this.highscoreContainer.style.display === "block") {
                    this.setHoveredElement(this.highscorePlayerLine);
                }
            }
        }
        else if (this.gameoverPanel.style.display === "") {
            
        }
    }

    private _inputEnter = () => {
        if (this.successPanel.style.display === "" || this.gameoverPanel.style.display === "") {
            if (this.hoveredElement instanceof HTMLButtonElement) {
                if (this.hoveredElement.parentElement instanceof HTMLAnchorElement) {
                    location.hash = this.hoveredElement.parentElement.href.split("/").pop();
                }
                else if (this.hoveredElement.onclick) {
                    this.hoveredElement.onclick(undefined);
                }
            }
            else if (this.hoveredElement === this.highscorePlayerLine){
                (document.querySelector("#score-player-input") as HTMLInputElement).focus();
            }
        }
    }

    private _inputBack = () => {
        if (this.successPanel.style.display === "") {

        }
        else if (this.gameoverPanel.style.display === "") {
            
        }
    }

    private _inputDropControl = () => {
        this.setHoveredElement(undefined);
    }
}