class PerformanceWatcher {

    public supportTexture3D: boolean = false;
    public average: number = 24;
    public worst: number = 24;

    public isWorstTooLow: boolean = false;
    public timout: number = 0;

    constructor(public game: Game) {
        
    }

    public update(rawDt: number): void {
        let fps = 1 / rawDt;
        if (isFinite(fps)) {
            this.average = 0.995 * this.average + 0.005 * fps;

            this.worst = Math.min(fps, this.worst);
            this.worst = 0.995 * this.worst + 0.005 * this.average;

            if (!this.isWorstTooLow && this.worst < 24) {
                clearTimeout(this.timout);
                this.timout = 0;
                this.isWorstTooLow = true;
            }
            else if (this.isWorstTooLow && this.timout === 0) {
                this.timout = setTimeout(() => {
                    this.isWorstTooLow = false;
                    clearTimeout(this.timout);
                    this.timout = 0;
                }, 3000);
            }
        }
    }
}