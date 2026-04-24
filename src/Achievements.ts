class Achievements {
    
    public collectedTiles: number = 0; // COLLECTED_TILES
    public unlockedDoors: number = 0; // UNLOCKED_DOORS
    public creepDeaths: number = 0; // CREEPER_DEATHS
    public fallDeaths: number = 0; // FALL_DEATHS
    public dismissedPaywalls: number = 0; // DISMISSED_PAYWALLS
    public totalCompleted: number = 0; // TOTAL_COMPLETED
    public easyCompleted: number = 0; // EASY_COMPLETED
    public mediumCompleted: number = 0; // MEDIUM_COMPLETED
    public hardCompleted: number = 0; // HARD_COMPLETED
    public expertCompleted: number = 0; // EXPERT_COMPLETED

    constructor(public game: Game) {
        if (USE_WAVEDASH_SDK) {
            this.collectedTiles = Wavedash.getStat("COLLECTED_TILES") || 0;
            ScreenLoger.Log("Collected tiles: " + this.collectedTiles);
            this.unlockedDoors = Wavedash.getStat("UNLOCKED_DOORS") || 0;
            ScreenLoger.Log("Unlocked doors: " + this.unlockedDoors);
            this.creepDeaths = Wavedash.getStat("CREEPER_DEATHS") || 0;
            ScreenLoger.Log("Creep deaths: " + this.creepDeaths);
            this.fallDeaths = Wavedash.getStat("FALL_DEATHS") || 0;
            ScreenLoger.Log("Fall deaths: " + this.fallDeaths);
            this.dismissedPaywalls = Wavedash.getStat("DISMISSED_PAYWALLS") || 0;
            ScreenLoger.Log("Dismissed paywalls: " + this.dismissedPaywalls);
            this.totalCompleted = Wavedash.getStat("TOTAL_COMPLETED") || 0;
            ScreenLoger.Log("Total completed: " + this.totalCompleted);
            this.easyCompleted = Wavedash.getStat("EASY_COMPLETED") || 0;
            ScreenLoger.Log("Easy completed: " + this.easyCompleted);
            this.mediumCompleted = Wavedash.getStat("MEDIUM_COMPLETED") || 0;
            ScreenLoger.Log("Medium completed: " + this.mediumCompleted);
            this.hardCompleted = Wavedash.getStat("HARD_COMPLETED") || 0;
            ScreenLoger.Log("Hard completed: " + this.hardCompleted);
            this.expertCompleted = Wavedash.getStat("EXPERT_COMPLETED") || 0;
            ScreenLoger.Log("Expert completed: " + this.expertCompleted);
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

    public addUnlockedDoors(count: number = 1): void {
        this.unlockedDoors += count;
        ScreenLoger.Log("Unlocked doors: " + this.unlockedDoors);
        if (USE_WAVEDASH_SDK) {
            Wavedash.setStat("UNLOCKED_DOORS", this.unlockedDoors, true);
            ScreenLoger.Log("WaveDash unlocked Doors " + Wavedash.getStat("UNLOCKED_DOORS"));
        }
    }

    public addCreepDeaths(count: number = 1): void {
        this.creepDeaths += count;
        ScreenLoger.Log("Creep deaths: " + this.creepDeaths);
        if (USE_WAVEDASH_SDK) {
            Wavedash.setStat("CREEPER_DEATHS", this.creepDeaths, true);
            ScreenLoger.Log("WaveDash creep deaths " + Wavedash.getStat("CREEPER_DEATHS"));
        }
    }

    public addFallDeaths(count: number = 1): void {
        this.fallDeaths += count;
        ScreenLoger.Log("Fall deaths: " + this.fallDeaths);
        if (USE_WAVEDASH_SDK) {
            Wavedash.setStat("FALL_DEATHS", this.fallDeaths, true);
            ScreenLoger.Log("WaveDash fall deaths " + Wavedash.getStat("FALL_DEATHS"));
        }
    }

    public addDismissedPaywalls(count: number = 1): void {
        this.dismissedPaywalls += count;
        ScreenLoger.Log("Dismissed paywalls: " + this.dismissedPaywalls);
        if (USE_WAVEDASH_SDK) {
            Wavedash.setStat("DISMISSED_PAYWALLS", this.dismissedPaywalls, true);
            ScreenLoger.Log("WaveDash dismissed paywalls " + Wavedash.getStat("DISMISSED_PAYWALLS"));
        }
    }

    public addComplete(difficulty: number): void {
        this.totalCompleted += 1;
        ScreenLoger.Log("Total completed: " + this.totalCompleted);
        if (USE_WAVEDASH_SDK) {
            Wavedash.setStat("TOTAL_COMPLETED", this.totalCompleted, true);
            ScreenLoger.Log("WaveDash total completed " + Wavedash.getStat("TOTAL_COMPLETED"));
        }
        if (difficulty === 1) {
            this.easyCompleted += 1;
            ScreenLoger.Log("Easy completed: " + this.easyCompleted);
            if (USE_WAVEDASH_SDK) {
                Wavedash.setStat("EASY_COMPLETED", this.easyCompleted, true);
                ScreenLoger.Log("WaveDash easy completed " + Wavedash.getStat("EASY_COMPLETED"));
            }
        }
        if (difficulty === 0 || difficulty === 2) {
            this.mediumCompleted += 1;
            ScreenLoger.Log("Medium completed: " + this.mediumCompleted);
            if (USE_WAVEDASH_SDK) {
                Wavedash.setStat("MEDIUM_COMPLETED", this.mediumCompleted, true);
                ScreenLoger.Log("WaveDash medium completed " + Wavedash.getStat("MEDIUM_COMPLETED"));
            }
        }
        if (difficulty === 3) {
            this.hardCompleted += 1;
            ScreenLoger.Log("Hard completed: " + this.hardCompleted);
            if (USE_WAVEDASH_SDK) {
                Wavedash.setStat("HARD_COMPLETED", this.hardCompleted, true);
                ScreenLoger.Log("WaveDash hard completed " + Wavedash.getStat("HARD_COMPLETED"));
            }
        }
        if (difficulty === 4) {
            this.expertCompleted += 1;
            ScreenLoger.Log("Expert completed: " + this.expertCompleted);
            if (USE_WAVEDASH_SDK) {
                Wavedash.setStat("EXPERT_COMPLETED", this.expertCompleted, true);
                ScreenLoger.Log("WaveDash expert completed " + Wavedash.getStat("EXPERT_COMPLETED"));
            }
        }
    }
}