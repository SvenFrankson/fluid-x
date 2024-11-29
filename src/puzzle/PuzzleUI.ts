class PuzzleUI {

    public ingameTimer: HTMLDivElement;
    public successPanel: HTMLDivElement;
    public successNextLabel: HTMLDivElement;
    public gameoverPanel: HTMLDivElement;
    public unlockContainer: HTMLDivElement;
    public failMessage: HTMLDivElement;

    public completionBarLabel: CompletionBar;
    public completionBar: CompletionBar;

    public highscoreContainer: HTMLDivElement;
    public highscorePlayerLine: HTMLDivElement;
    public highscoreTwoPlayersLine: HTMLDivElement;

    public scoreSubmitBtn: HTMLButtonElement;
    public scorePendingBtn: HTMLButtonElement;
    public scoreDoneBtn: HTMLButtonElement;
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
        this.ingameTimer = document.querySelector("#play-timer");
        this.failMessage = document.querySelector("#success-score-fail-message");
        this.successNextLabel = document.querySelector("#success-next-label");
        this.completionBarLabel = document.querySelector("#play-success-completion-label");
        this.completionBar = document.querySelector("#play-success-panel-completion-container completion-bar");
        this.highscoreContainer = document.querySelector("#success-highscore-container");
        this.highscorePlayerLine = document.querySelector("#score-player-input").parentElement as HTMLDivElement;
        this.highscoreTwoPlayersLine = document.querySelector("#score-2-players-input").parentElement as HTMLDivElement;
        this.scoreSubmitBtn = document.querySelector("#success-score-submit-btn");
        this.scorePendingBtn = document.querySelector("#success-score-pending-btn");
        this.scoreDoneBtn = document.querySelector("#success-score-done-btn");
        
        this.successNextButton = document.querySelector("#success-next-btn") as HTMLButtonElement;
        //this.unlockTryButton = document.querySelector("#play-unlock-try-btn") as HTMLButtonElement;
        this.gameoverBackButton = document.querySelector("#gameover-back-btn") as HTMLButtonElement;
        this.gameoverReplayButton = document.querySelector("#gameover-replay-btn") as HTMLButtonElement;
        this.gameoverReplayButton.onpointerup = async () => {
            //await RandomWait();
            await this.puzzle.reset(true);
            this.puzzle.skipIntro();
        }
        
        this.successPanel = document.querySelector("#play-success-panel");
        this.gameoverPanel = document.querySelector("#play-gameover-panel");
        this.unlockContainer = document.querySelector("#play-unlock-container");

        this.game.router.playUI.onshow = () => { this._registerToInputManager(); };
        this.game.router.playUI.onhide = () => { this._unregisterFromInputManager(); };
    }

    public win(firstTimeCompleted: boolean, previousCompletion: number): void {
        this.successPanel.style.display = "";
        let panelDX = document.body.classList.contains("vertical") ? 0 : -50;
        let panelDY = document.body.classList.contains("vertical") ? 70 : 10;
        if (firstTimeCompleted) {
            this.tryShowUnlockPanel().then(() => {
                CenterPanel(this.successPanel, panelDX, panelDY);
                requestAnimationFrame(() => {
                    CenterPanel(this.successPanel, panelDX, panelDY);
                })
            })
        }
        else {
            this.unlockContainer.style.display = "none";
        }
        this.gameoverPanel.style.display = "none";
        this.ingameTimer.style.display = "none";
        this.successNextLabel.style.display = "none";
        this.successNextButton.innerHTML = "CONTINUE";

        let completion = 1;
        if (this.puzzle.data.state === PuzzleState.OKAY) {
            completion = this.game.puzzleCompletion.communityPuzzleCompletion;
            this.completionBarLabel.innerHTML = "Community";
        }
        else if (this.puzzle.data.state === PuzzleState.STORY) {
            completion = this.game.puzzleCompletion.storyPuzzleCompletion;
            this.completionBarLabel.innerHTML = "Story";
        }
        else if (this.puzzle.data.state === PuzzleState.XPERT) {
            completion = this.game.puzzleCompletion.expertPuzzleCompletion;
            this.completionBarLabel.innerHTML = "Expert";
        }
        if (previousCompletion != completion) {
            this.completionBar.setValue(previousCompletion);
            this.completionBar.animateValueTo(completion, 3);
        }
        else {
            this.completionBar.setValue(completion);
        }

        if (this.puzzle.data.state === 2) {
            let nextPuzzle = this.game.loadedStoryPuzzles.puzzles[this.puzzle.data.numLevel];
            if (nextPuzzle) {
                this.successNextLabel.innerHTML = "Next - " + nextPuzzle.title;
                this.successNextLabel.style.display = "";
                this.successNextButton.innerHTML = "NEXT LEVEL";
            }
        }
        if (this.game.uiInputManager.inControl) {
            this.setHoveredElement(this.successNextButton);
        }
        CenterPanel(this.successPanel, panelDX, panelDY);
        requestAnimationFrame(() => {
            CenterPanel(this.successPanel, panelDX, panelDY);
        })
    }

    public lose(): void {
        let panelDX = document.body.classList.contains("vertical") ? 0 : -50;
        this.successPanel.style.display = "none";
        this.unlockContainer.style.display = "none";
        this.gameoverPanel.style.display = "";
        this.ingameTimer.style.display = "none";
        if (this.game.uiInputManager.inControl) {
            this.setHoveredElement(this.gameoverReplayButton);
        }
        CenterPanel(this.gameoverPanel, panelDX, 0);
        requestAnimationFrame(() => {
            CenterPanel(this.gameoverPanel, panelDX, 0);
        })
    }

    public reset(): void {
        if (this.successPanel) {
            this.successPanel.style.display = "none";
        }
        if (this.unlockContainer) {
            this.unlockContainer.style.display = "none";
        }
        if (this.gameoverPanel) {
            this.gameoverPanel.style.display = "none";
        }
        if (this.ingameTimer) {
            this.ingameTimer.style.display = "";
        }
    }

    public async tryShowUnlockPanel(): Promise<void> {
        //await RandomWait();
        let expertId = this.game.storyIdToExpertId(this.puzzle.data.id);
        if (isFinite(expertId)) {
            let data: IPuzzleData = await this.game.getPuzzleDataById(expertId);
            if (data) {
                let squareBtn = this.unlockContainer.querySelector(".square-btn-panel");
                squareBtn.querySelector(".square-btn-title stroke-text").innerHTML = data.title;
                squareBtn.querySelector(".square-btn-author stroke-text").innerHTML = "by " + data.author;
            
                let existingImg = squareBtn.querySelector(".square-btn-miniature");
                if (existingImg) {
                    squareBtn.removeChild(existingImg);
                }
                let newIcon = PuzzleMiniatureMaker.Generate(data.content);
                newIcon.classList.add("square-btn-miniature");
                squareBtn.appendChild(newIcon);
    
                this.unlockContainer.style.display = "";
            }
            else {
                console.error("Puzzle Expert #" + expertId + " not found.");
                this.unlockContainer.style.display = "none";
            }
        }
    }

    public setHighscoreState(state: number): void {
        let twoPlayerCase = this.puzzle.ballsCount === 2;
        this.highscorePlayerLine.style.display = twoPlayerCase ? "none" : "block";
        this.highscoreTwoPlayersLine.style.display = twoPlayerCase ? "block" : "none";

        this.failMessage.style.display = "none";
        if (state === 0) {
            // Not enough for Highscore
            this.highscoreContainer.style.display = "none";
        }
        else if (state === 1) {
            // Enough for Highscore, waiting for player action.
            this.highscoreContainer.style.display = "block";

            if (twoPlayerCase) {
                (this.highscoreTwoPlayersLine.querySelector("input") as HTMLInputElement).value = this.puzzle.game.player1Name + " & " + this.puzzle.game.player2Name;
                this.scoreSubmitBtn.classList.remove("locked");
            }

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
        this.game.uiInputManager.onDownCallbacks.push(this._inputDown);
        this.game.uiInputManager.onEnterCallbacks.push(this._inputEnter);
        this.game.uiInputManager.onBackCallbacks.push(this._inputBack);
        this.game.uiInputManager.onDropControlCallbacks.push(this._inputDropControl);
    }

    private _unregisterFromInputManager(): void {
        this.game.uiInputManager.onUpCallbacks.remove(this._inputUp);
        this.game.uiInputManager.onDownCallbacks.remove(this._inputDown);
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
                    this.setHoveredElement(this.successNextButton);
                }
            }
            else if (this.hoveredElement === this.scoreSubmitBtn) {
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
                else if (this.hoveredElement.onpointerup) {
                    this.hoveredElement.onpointerup(undefined);
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