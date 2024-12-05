class TutoPage {

    public nabuPage: Nabu.DefaultPage;
    public tutoContainer: HTMLDivElement;
    public tutoPrev: HTMLButtonElement[];
    public tutoNext: HTMLButtonElement[];

    public svgElement: SVGElement;
    public tutoText: HTMLDivElement;
    public svgBall: SVGGElement;
    public svgBallArrowRight: SVGPathElement;
    public svgBallArrowLeft: SVGPathElement;
    public svgKeyA: SVGGElement;
    public svgKeyD: SVGGElement;
    
    private _tuto2Path = [
        new BABYLON.Vector2(50, 130),
        new BABYLON.Vector2(50, 90),
        new BABYLON.Vector2(70, 70),
        new BABYLON.Vector2(110, 110),
        new BABYLON.Vector2(110, 130)
    ];
    private _tuto2SumNormalizedDist = [0];

    private _tuto3Path = [
        new BABYLON.Vector2(50, 130),
        new BABYLON.Vector2(50, 90),
        new BABYLON.Vector2(70, 70),
        new BABYLON.Vector2(110, 110),
        new BABYLON.Vector2(110, 130)
    ];
    private _tuto3SumNormalizedDist = [0];

    private _evaluatePath(f: number, path: BABYLON.Vector2[], sumDist: number[]): BABYLON.Vector2 {
        let n = 0;
        while (
            n + 1 < sumDist.length &&
            n + 1 < path.length &&
            f > sumDist[n + 1]
        ) {
            n++;
        }

        let d1 = sumDist[n];
        let d2 = sumDist[n + 1];
        let ff = (f - d1) / (d2 - d1);
        
        return BABYLON.Vector2.Lerp(path[n], path[n + 1], ff);
    }

    constructor(queryString: string, public router: CarillonRouter) {
        this.nabuPage = document.querySelector(queryString);
        this.tutoContainer = this.nabuPage.querySelector(".tutorial-container");
        this.tutoPrev = [...this.nabuPage.querySelectorAll(".tutorial-prev-btn")] as HTMLButtonElement[];
        this.tutoPrev.forEach(btn => 
            btn.onclick = () => {
            this.setTutoIndex(this._tutoIndex - 1);
        });
        this.tutoNext = [...this.nabuPage.querySelectorAll(".tutorial-next-btn")] as HTMLButtonElement[];
        this.tutoNext.forEach(btn => 
            btn.onclick = () => {
            if (this._tutoIndex < 3) {
                this.setTutoIndex(this._tutoIndex + 1);
            }
            else {
                this.hide(0.5);
                this.router.game.fadeInIntro();
                this.router.game.puzzle.skipIntro();
            }
        });
        this.tutoText = this.tutoContainer.querySelector(".tutorial-text");
        this.svgBall = this.tutoContainer.querySelector("#tutorial-ball");
        this.svgBallArrowRight = this.tutoContainer.querySelector("#tutorial-ball-arrow-r");
        this.svgBallArrowLeft = this.tutoContainer.querySelector("#tutorial-ball-arrow-l");
        this.svgKeyA = this.tutoContainer.querySelector("#tutorial-key-a");
        this.svgKeyD = this.tutoContainer.querySelector("#tutorial-key-d");
        this.svgElement = this.tutoContainer.querySelector("svg");

        this._tuto2Path = [
            new BABYLON.Vector2(60, 135),
            new BABYLON.Vector2(60, 125),
            new BABYLON.Vector2(100, 85),
            new BABYLON.Vector2(100, 75),
            new BABYLON.Vector2(100, 135),
        ]

        this._tuto2SumNormalizedDist = [0];
        for (let i = 1; i < this._tuto2Path.length; i++) {
            this._tuto2SumNormalizedDist[i] = BABYLON.Vector2.Distance(
                this._tuto2Path[i],
                this._tuto2Path[i - 1]
            ) + this._tuto2SumNormalizedDist[i - 1];
        }

        let l2 = this._tuto2SumNormalizedDist[this._tuto2SumNormalizedDist.length - 1];
        for (let i = 0; i < this._tuto2Path.length; i++) {
            this._tuto2SumNormalizedDist[i] = this._tuto2SumNormalizedDist[i] / l2;
        }

        this._tuto3Path = [
            new BABYLON.Vector2(50, 75),
            new BABYLON.Vector2(50, 135),
            new BABYLON.Vector2(70, 122),
            new BABYLON.Vector2(70 - 17, 105),
            new BABYLON.Vector2(70, 88),
            new BABYLON.Vector2(50, 75)
        ]

        this._tuto3SumNormalizedDist = [0];
        for (let i = 1; i < this._tuto3Path.length; i++) {
            this._tuto3SumNormalizedDist[i] = BABYLON.Vector2.Distance(
                this._tuto3Path[i],
                this._tuto3Path[i - 1]
            ) + this._tuto3SumNormalizedDist[i - 1];
        }

        let l3 = this._tuto3SumNormalizedDist[this._tuto3SumNormalizedDist.length - 1];
        for (let i = 0; i < this._tuto3Path.length; i++) {
            this._tuto3SumNormalizedDist[i] = this._tuto3SumNormalizedDist[i] / l3;
        }
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
        this.setTutoIndex(0, true);
        this.router.game.puzzle.puzzleUI.hideTouchInput();
        await this.nabuPage.show(duration);
    }

    public async hide(duration?: number): Promise<void> {
        //await RandomWait();
        this.router.game.scene.onBeforeRenderObservable.removeCallback(this.update);
        this.router.game.puzzle.puzzleUI.showTouchInput();
        return this.nabuPage.hide(duration);
    }

    private _timer: number = 0;
    public update = () => {
        let dt = this.router.game.scene.deltaTime / 1000;
        this._timer += dt;
        if (this._tutoIndex === 0) {
            this.svgBall.setAttribute("transform", "translate(80 105)");
        }
        else if (this._tutoIndex === 1) {
            let P = 3;
            let t = this._timer - Math.floor(this._timer / P) * P;
            if (t > P / 2) {
                t = P - t;
            }
            t = t / (P / 2);

            let y = 75 + 60 * t;
            this.svgBall.setAttribute("transform", "translate(80 " + y.toFixed(1) + ")");
        }
        else if (this._tutoIndex === 2) {
            let P = 6;
            let t = this._timer - Math.floor(this._timer / P) * P;
            let tBase = t;
            if (t > P / 2) {
                t = P - t;
            }
            t = t / (P / 2);

            if (tBase > this._tuto2SumNormalizedDist[1] * P / 2 && tBase < this._tuto2SumNormalizedDist[2] * P / 2) {
                this.svgKeyD.setAttribute("transform", "translate(0 5)");
                this.svgKeyD.querySelector("rect").setAttribute("fill", "white");
                this.svgElement.querySelector("#tutorial-key-d-base").setAttribute("stroke-width", "4");
                this.svgBallArrowRight.setAttribute("opacity", "1");
            }
            else {
                this.svgKeyD.setAttribute("transform", "translate(0 0)");
                this.svgKeyD.querySelector("rect").setAttribute("fill", "#808080");
                this.svgElement.querySelector("#tutorial-key-d-base").setAttribute("stroke-width", "2");
                this.svgBallArrowRight.setAttribute("opacity", "0");
            }

            if (tBase > (P - this._tuto2SumNormalizedDist[2] * P / 2) &&
                tBase < (P - this._tuto2SumNormalizedDist[1] * P / 2)) {
                this.svgKeyA.setAttribute("transform", "translate(0 5)");
                this.svgKeyA.querySelector("rect").setAttribute("fill", "white");
                this.svgElement.querySelector("#tutorial-key-a-base").setAttribute("stroke-width", "4");
                this.svgBallArrowLeft.setAttribute("opacity", "1");
            }
            else {
                this.svgKeyA.setAttribute("transform", "translate(0 0)");
                this.svgKeyA.querySelector("rect").setAttribute("fill", "#808080");
                this.svgElement.querySelector("#tutorial-key-a-base").setAttribute("stroke-width", "2");
                this.svgBallArrowLeft.setAttribute("opacity", "0");
            }
            
            let p = this._evaluatePath(t, this._tuto2Path, this._tuto2SumNormalizedDist);
            this.svgBall.setAttribute("transform", "translate(" + p.x.toFixed(1) + " " + p.y.toFixed(1) + ")");
            this.svgBallArrowRight.setAttribute("transform", "translate(" + p.x.toFixed(1) + " " + p.y.toFixed(1) + ")");
            this.svgBallArrowLeft.setAttribute("transform", "translate(" + p.x.toFixed(1) + " " + p.y.toFixed(1) + ")");
        }
        else if (this._tutoIndex === 3) {
            let P = 4;
            let t = this._timer - Math.floor(this._timer / P) * P;
            let tBase = t;
            t = t / P;

            if (
                tBase > this._tuto3SumNormalizedDist[2] * P && tBase < this._tuto3SumNormalizedDist[5] * P
            ) {
                this.svgElement.querySelector("#tutorial-tile-2").setAttribute("opacity", "0");
            }
            else {
                this.svgElement.querySelector("#tutorial-tile-2").setAttribute("opacity", "1");
            }

            if (
                tBase > this._tuto3SumNormalizedDist[4] * P && tBase < this._tuto3SumNormalizedDist[5] * P
            ) {
                this.svgElement.querySelector("#tutorial-tile-1").setAttribute("opacity", "0");
            }
            else {
                this.svgElement.querySelector("#tutorial-tile-1").setAttribute("opacity", "1");
            }

            let p = this._evaluatePath(t, this._tuto3Path, this._tuto3SumNormalizedDist);

            this.svgBall.setAttribute("transform", "translate(" + p.x.toFixed(1) + " " + p.y.toFixed(1) + ")");
        }
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
        v = Nabu.MinMax(v, 0, 3);
        if (v != this._tutoIndex || force) {

            if (force) {
                this._animating = true;
                await this.fadeOutBoard(0);
            }
            else {
                this._animating = true;
                await this.fadeOutBoard(0.25);
            }

            this._tutoIndex = v;
            this._timer = 0;
            
            document.querySelector("#tutorial-panel-0").setAttribute("visibility", "hidden");
            document.querySelector("#tutorial-panel-1").setAttribute("visibility", "hidden");
            document.querySelector("#tutorial-panel-2").setAttribute("visibility", "hidden");
            document.querySelector("#tutorial-panel-3").setAttribute("visibility", "hidden");
            if (this._tutoIndex === 0) {
                this.showTuto0();
            }
            else if (this._tutoIndex === 1) {
                this.showTuto1();
            }
            else if (this._tutoIndex === 2) {
                this.showTuto2();
            }
            else if (this._tutoIndex === 3) {
                this.showTuto3();
            }

            await this.fadeInBoard(0.25);
            this._animating = false;
        }
    }

    public async showTuto0(): Promise<void> {
        this.tutoText.innerHTML = "&nbsp;&nbsp;&nbsp;<i>1) Context</i><br/>This is the Ball.";
        document.querySelector("#tutorial-panel-0").setAttribute("visibility", "visible");
    }

    public async showTuto1(): Promise<void> {
        this.tutoText.innerHTML = "&nbsp;&nbsp;&nbsp;<i>2) Rule</i><br/>The Ball <b>always</b> moves <b>up</b> and <b>down</b>.";
        document.querySelector("#tutorial-panel-1").setAttribute("visibility", "visible");
    }

    public async showTuto2(): Promise<void> {
        this.tutoText.innerHTML = "&nbsp;&nbsp;&nbsp;<i>3) Control</i><br/>You can only steer the Ball <b>Left</b> or <b>Right</b>.";
        if (IsTouchScreen) {
            this.svgKeyA.querySelector("text").innerHTML = "&lt;";
            this.svgKeyD.querySelector("text").innerHTML = "&gt;";
        }
        else {
            this.svgKeyA.querySelector("text").innerHTML = "A";
            this.svgKeyD.querySelector("text").innerHTML = "D";
        }
        document.querySelector("#tutorial-panel-2").setAttribute("visibility", "visible");
    }

    public async showTuto3(): Promise<void> {
        this.tutoText.innerHTML = "&nbsp;&nbsp;&nbsp;<i>4) Objective</i><br/>Collect all the <b>Tiles</b> to complete the <b>Puzzle</b> !";
        document.querySelector("#tutorial-panel-3").setAttribute("visibility", "visible");
    }
}