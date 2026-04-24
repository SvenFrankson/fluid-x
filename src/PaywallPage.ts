class PaywallPage {

    public nabuPage: Nabu.DefaultPage;
    public continueButton: HTMLButtonElement;

    constructor(selector: string, public router: CarillonRouter) {
        this.nabuPage = document.querySelector(selector) as Nabu.DefaultPage;
        this.continueButton = this.nabuPage.querySelector("#paywall-continue") as HTMLButtonElement;
    }

    public show(onContinue?: () => void, duration?: number): void {
        this.nabuPage.show(duration);
        if (onContinue) {
            this.continueButton.onclick = onContinue;
        }
        else {
            this.continueButton.onclick = () => {
                this.router.game.achievements.addDismissedPaywalls(1);
                this.nabuPage.hide(0.2);
            };
        }
    }
}