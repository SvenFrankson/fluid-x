class PerformanceWatcher {

    public supportTexture3D: boolean = false;
    public average: number = 24;
    public worst: number = 24;

    constructor(public game: Game) {
        
    }

    public update(rawDt: number): void {
        let fps = 1 / rawDt;
        if (isFinite(fps)) {
            this.average = 0.995 * this.average + 0.005 * fps;

            this.worst = Math.min(fps, this.worst);
            this.worst = 0.995 * this.worst + 0.005 * this.average;
        }
    }
}