class PaywallPage {

    public nabuPage: Nabu.DefaultPage;
    public screenLock: HTMLDivElement;
    public unpaidContainer: HTMLDivElement;
    public buyPremiumButton: HTMLButtonElement;
    public ignoreButton: HTMLButtonElement;
    public paidContainer: HTMLDivElement;
    public continueButton: HTMLButtonElement;

    constructor(selector: string, public router: CarillonRouter) {
        this.nabuPage = document.querySelector(selector) as Nabu.DefaultPage;
        this.screenLock = this.nabuPage.querySelector("#paywall-screen-lock") as HTMLDivElement;
        this.buyPremiumButton = this.nabuPage.querySelector("#buy-premium-btn") as HTMLButtonElement;
        this.ignoreButton = this.nabuPage.querySelector("#paywall-ignore") as HTMLButtonElement;
        this.unpaidContainer = this.nabuPage.querySelector("#paywall-unpaid") as HTMLDivElement;
        this.paidContainer = this.nabuPage.querySelector("#paywall-paid") as HTMLDivElement;
        this.continueButton = this.nabuPage.querySelector("#paywall-continue") as HTMLButtonElement;

        this.buyPremiumButton.onclick = async () => {
            const result = await Wavedash.triggerPaywall("premium-version");
            this.router.homeMenu.updateContentVersionDisplay();
            if (result.success && result.data) {
                this.updateContent();
            }
        }

        this.continueButton.onclick = () => {
            this.router.game.puzzle.balls.forEach(ball => ball.isControlLocked = false);
            this.nabuPage.hide(0.2);
        }

        this.screenLock.onclick = async () => {
            if (IsPremiumEntitled()) {
                this.router.game.puzzle.balls.forEach(ball => ball.isControlLocked = false);
                this.nabuPage.hide(0.2);
            }
        }        
    }

    public show(onContinue?: () => void, duration?: number): void {
        this.updateContent();
        IsPremiumEntitled();
        this.router.game.puzzle.balls.forEach(ball => ball.isControlLocked = true);
        this.nabuPage.show(duration);
        if (onContinue) {
            this.ignoreButton.onclick = onContinue;
        }
        else {
            this.ignoreButton.onclick = () => {
                this.router.game.puzzle.balls.forEach(ball => ball.isControlLocked = false);
                this.router.game.achievements.addDismissedPaywalls(1);
                this.nabuPage.hide(0.2);
            };
        }
    }

    public async showIfNotPremium(duration?: number): Promise<void> {
        const isPremium = await IsPremiumEntitled();
        if (!isPremium) {
            this.show(undefined, duration);
        }
    }

    public async updateContent(): Promise<void> {
        const isPremium = await IsPremiumEntitled();
        if (isPremium) {
            this.unpaidContainer.style.display = "none";
            this.paidContainer.style.display = "block";
        }
        else {
            this.unpaidContainer.style.display = "block";
            this.paidContainer.style.display = "none";
        }
    }
}