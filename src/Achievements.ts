class Achievements {
    
    public collectedTiles: number = 0;
    public unlockedDoors: number = 0;
    public creepDeaths: number = 0;
    public fallDeaths: number = 0;
    public completedLevels: number = 0;
    public freewallContinues: number = 0;

    constructor(public game: Game) {
        if (USE_WAVEDASH_SDK) {
            this.collectedTiles = Wavedash.getStat("COLLECTED_TILES") || 0;
            ScreenLoger.Log("Collected tiles: " + this.collectedTiles);
        }
    }

    public addCollectedTiles(count: number = 1): void {
        this.collectedTiles += count;
        ScreenLoger.Log("Collected tiles: " + this.collectedTiles);
        if (USE_WAVEDASH_SDK) {
            Wavedash.setStat("COLLECTED_TILES", this.collectedTiles, true);
            ScreenLoger.Log("WaveDash collected Tiles " + Wavedash.getStat("COLLECTED_TILES"));
        }
    }
}