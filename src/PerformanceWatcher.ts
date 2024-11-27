class PerformanceWatcher {

    public supportTexture3D: boolean = false;
    public average: number = 24;
    public worst: number = 24;

    public isWorstTooLow: boolean = false;

    constructor(public game: Game) {
        
    }

    public update(rawDt: number): void {
        let fps = 1 / rawDt;
        if (isFinite(fps)) {
            this.average = 0.995 * this.average + 0.005 * fps;

            this.worst = Math.min(fps, this.worst);
            this.worst = 0.999 * this.worst + 0.001 * this.average;

            if (this.worst < 24) {
                this.isWorstTooLow = true;
            }
            else if (this.worst > 26) {
                this.isWorstTooLow = false;
            }
        }
    }
}