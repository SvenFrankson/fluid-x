class UserInterfaceInputManager {

    public inControl = false;

    public onUpCallbacks = new Nabu.UniqueList<() => void>();
    public onLeftCallbacks = new Nabu.UniqueList<() => void>();
    public onDownCallbacks = new Nabu.UniqueList<() => void>();
    public onRightCallbacks = new Nabu.UniqueList<() => void>();
    public onEnterCallbacks = new Nabu.UniqueList<() => void>();
    public onBackCallbacks = new Nabu.UniqueList<() => void>();
    public onPrevCallbacks = new Nabu.UniqueList<() => void>();
    public onNextCallbacks = new Nabu.UniqueList<() => void>();
    public onDropControlCallbacks = new Nabu.UniqueList<() => void>();

    constructor(public game: Game) {

    }

    public initialize(): void {
        window.addEventListener("pointerdown", () => {
            if (this.inControl) {
                this.inControl = false;
                this.onDropControlCallbacks.forEach(cb => {
                    cb();
                });
            }
        })
        window.addEventListener("pointermove", () => {
            if (this.inControl) {
                this.inControl = false;
                this.onDropControlCallbacks.forEach(cb => {
                    cb();
                });
            }
        })

        window.addEventListener("keydown", (ev: KeyboardEvent) => {
            if (document.activeElement instanceof HTMLInputElement) {
                if (ev.code === "Enter") {
                    this.game.canvas.focus();
                }
                return;
            }
            if (document.activeElement instanceof HTMLTextAreaElement) {
                return;
            }
            this.inControl = true;
            if (ev.code === "KeyW" || ev.code === "ArrowUp") {
                ev.preventDefault();
                this.onUpCallbacks.forEach(cb => {
                    cb();
                });
            }
            if (ev.code === "KeyA" || ev.code === "ArrowLeft") {
                ev.preventDefault();
                this.onLeftCallbacks.forEach(cb => {
                    cb();
                });
            }
            if (ev.code === "KeyS" || ev.code === "ArrowDown") {
                ev.preventDefault();
                this.onDownCallbacks.forEach(cb => {
                    cb();
                });
            }
            if (ev.code === "KeyD" || ev.code === "ArrowRight") {
                ev.preventDefault();
                this.onRightCallbacks.forEach(cb => {
                    cb();
                });
            }
            if (ev.code === "Enter" || ev.code === "Space" || ev.code === "KeyE") {
                ev.preventDefault();
                this.onEnterCallbacks.forEach(cb => {
                    cb();
                });
            }
            if (ev.code === "Backspace" || ev.code === "KeyX") {
                ev.preventDefault();
                this.onBackCallbacks.forEach(cb => {
                    cb();
                });
            }
        });
    }
}