class PuzzleUI {

    public successPanel: HTMLDivElement;
    public gameoverPanel: HTMLDivElement;
    public failMessage: HTMLDivElement;
    public highscoreContainer: HTMLDivElement;
    public scoreSubmitBtn: HTMLButtonElement;
    public scorePendingBtn: HTMLButtonElement;
    public scoreDoneBtn: HTMLButtonElement;
    public successReplayButton: HTMLButtonElement;
    public successBackButton: HTMLButtonElement;
    public successNextButton: HTMLButtonElement;
    public gameoverBackButton: HTMLButtonElement;
    public gameoverReplayButton: HTMLButtonElement;

    constructor(public puzzle: Puzzle) {
        this.failMessage = document.querySelector("#success-score-fail-message");
        this.highscoreContainer = document.querySelector("#success-highscore-container");
        this.scoreSubmitBtn = document.querySelector("#success-score-submit-btn");
        this.scorePendingBtn = document.querySelector("#success-score-pending-btn");
        this.scoreDoneBtn = document.querySelector("#success-score-done-btn");
        
        this.successReplayButton = document.querySelector("#success-replay-btn") as HTMLButtonElement;
        this.successReplayButton.onclick = () => {
            this.puzzle.reset();
        }
        this.successBackButton = document.querySelector("#success-back-btn") as HTMLButtonElement;
        this.successNextButton = document.querySelector("#success-next-btn") as HTMLButtonElement;
        this.gameoverBackButton = document.querySelector("#gameover-back-btn") as HTMLButtonElement;
        this.gameoverReplayButton = document.querySelector("#gameover-replay-btn") as HTMLButtonElement;
        this.gameoverReplayButton.onclick = () => {
            this.puzzle.reset();
        }
        
        this.successPanel = document.querySelector("#play-success-panel");
        this.gameoverPanel = document.querySelector("#play-gameover-panel");
    }

    public win(): void {
        this.successPanel.style.display = "";
        this.gameoverPanel.style.display = "none";
    }

    public lose(): void {
        this.successPanel.style.display = "none";
        this.gameoverPanel.style.display = "";
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
        }
    }
}