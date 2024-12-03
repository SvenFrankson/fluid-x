class TutoPage {

    public nabuPage: Nabu.DefaultPage;
    public tutoContainer: HTMLDivElement;
    public tutoPrev: HTMLDivElement;
    public tutoNext: HTMLDivElement;

    public svgElement: SVGElement;
    public tutoText: HTMLDivElement;
    public svgBall: SVGCircleElement;

    constructor(queryString: string, public router: CarillonRouter) {
        this.nabuPage = document.querySelector(queryString);
        this.tutoContainer = this.nabuPage.querySelector(".tutorial-container");
        this.tutoPrev = this.nabuPage.querySelector("#tutorial-prev-btn");
        this.tutoPrev.onclick = () => {
            this.setTutoIndex(this._tutoIndex - 1);
        }
        this.tutoNext = this.nabuPage.querySelector("#tutorial-next-btn");
        this.tutoNext.onclick = () => {
            this.setTutoIndex(this._tutoIndex + 1);
        }
        this.tutoText = this.tutoContainer.querySelector(".tutorial-text");
        this.svgBall = this.tutoContainer.querySelector("#tutorial-ball");
        this.svgElement = this.tutoContainer.querySelector("svg");
    }

    public get shown(): boolean {
        return this.nabuPage.shown;
    }

    public async show(duration?: number): Promise<void> {
        //await RandomWait();
        requestAnimationFrame(() => {
            CenterPanel(this.nabuPage, 0, 0);
        })
        this.router.game.scene.onBeforeRenderObservable.add(this.update);
        await this.nabuPage.show(duration);
        this.setTutoIndex(0, true);
    }

    public async hide(duration?: number): Promise<void> {
        //await RandomWait();
        this.router.game.scene.onBeforeRenderObservable.removeCallback(this.update);
        return this.nabuPage.hide(duration);
    }

    private _timer: number = 0;
    public update = () => {
        let dt = this.router.game.scene.deltaTime / 1000;
        this._timer += dt;
        let t = this._timer - Math.floor(this._timer / 2) * 2;
        if (t > 1) {
            t = 2 - t;
        }
        let y = 70 + 70 * t;
        this.svgBall.setAttribute("cy", y.toFixed(1));
    }

    public async fadeOutBoard(duration: number = 1): Promise<void> {
        if (this.svgElement) {
            return new Promise<void>(resolve => {
                this.svgElement.style.opacity = "1";
                this.tutoText.style.opacity = "1";
        
                let t0 = performance.now();
                let step = () => {
                    let f = (performance.now() - t0) / 1000 / duration;
                    if (f < 1) {
                        f = Nabu.Easing.easeInOutSine(f);
                        this.svgElement.style.opacity = (1 - f).toFixed(2);
                        this.tutoText.style.opacity = (1 - f).toFixed(2);
                        requestAnimationFrame(step);
                    }
                    else {
                        this.svgElement.style.opacity = "0";
                        this.tutoText.style.opacity = "0";
                        resolve();
                    }
                }
                step();
            })
        }
    }

    public async fadeInBoard(duration: number = 1): Promise<void> {
        if (this.svgElement) {
            return new Promise<void>(resolve => {
                this.svgElement.style.opacity = "0";
                this.tutoText.style.opacity = "0";
        
                let t0 = performance.now();
                let step = () => {
                    let f = (performance.now() - t0) / 1000 / duration;
                    if (f < 1) {
                        f = Nabu.Easing.easeInOutSine(f);
                        this.svgElement.style.opacity = f.toFixed(2);
                        this.tutoText.style.opacity = f.toFixed(2);
                        requestAnimationFrame(step);
                    }
                    else {
                        this.svgElement.style.opacity = "1";
                        this.tutoText.style.opacity = "1";
                        resolve();
                    }
                }
                step();
            })
        }
    }

    private _animating: boolean = false;
    private _tutoIndex: number = 0;
    public async setTutoIndex(v: number, force?: boolean): Promise<void> {
        if (this._animating) {
            return;
        }
        v = Nabu.MinMax(v, 0, 1);
        if (v != this._tutoIndex || force) {
            this._tutoIndex = v;

            if (force) {
                this._animating = true;
                await this.fadeOutBoard(0);
            }
            else {
                this._animating = true;
                await this.fadeOutBoard(0.5);
            }

            this._timer = 0;
            if (this._tutoIndex === 0) {
                this.showTuto0();
            }
            else if (this._tutoIndex === 1) {
                this.showTuto1();
            }

            await this.fadeInBoard(0.5);
            this._animating = false;
        }
    }

    public async showTuto0(): Promise<void> {
        this.tutoText.innerHTML = "This is the ball. You control the ball.";
    }

    public async showTuto1(): Promise<void> {
        this.tutoText.innerHTML = "The ball moves up and down until the ball bounces on a surface.";
    }
}