enum PuzzleState {
    Loading,
    Ready,
    Playing,
    Wining,
    Done
}

class Puzzle {

    public editorOrEditorPreview: boolean = false;
    public data: IPuzzleData = {
        id: null,
        title: "No Title",
        author: "No Author",
        content: ""
    };

    public winSlotRows = 1;
    public winSlots: BABYLON.Mesh[] = [];
    public winSlotsIndexes: number[] = [0, 0, 0, 0];
    public stars: BABYLON.Mesh[] = [];

    public ballsCount: number = 1;
    public ballsPositionZero: BABYLON.Vector3[] = [BABYLON.Vector3.Zero(), BABYLON.Vector3.Zero()];
    public balls: Ball[] = [];

    public ballCollision: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public ballCollisionDone: boolean[] = [true, true];

    private _winloseTimout: number = 0;
    public puzzleState: PuzzleState = PuzzleState.Done;
    public playTimer: number = 0;
    public fishingPolesCount: number = 0;
    public fishingPole: FishingPole;
    public border: BABYLON.Mesh;
    public floor: BABYLON.Mesh;
    public holeOutline: BABYLON.LinesMesh;
    public invisiFloorTM: BABYLON.Mesh;
    public holeWall: BABYLON.Mesh;
    public creeps: Creep[] = [];
    public tiles: Tile[] = [];
    public blockTiles: BlockTile[] = [];
    public griddedTiles: Nabu.UniqueList<Tile>[][] = [];
    private _getOrCreateGriddedStack(i: number, j: number): Nabu.UniqueList<Tile> {
        if (!this.griddedTiles[i]) {
            this.griddedTiles[i] = [];
        }
        if (!this.griddedTiles[i][j]) {
            this.griddedTiles[i][j] = new Nabu.UniqueList<Tile>();
        }
        return this.griddedTiles[i][j];
    }
    public getGriddedStack(i: number, j: number): Nabu.UniqueList<Tile> {
        if (this.griddedTiles[i]) {
            return this.griddedTiles[i][j];
        }
    }
    public updateGriddedStack(t: Tile, skipSafetyCheck?: boolean): void {
        if (!skipSafetyCheck) {
            this.griddedTiles.forEach(line => {
                line.forEach(stack => {
                    if (stack.contains(t)) {
                        stack.remove(t);
                    }
                });
            });
        }
        this._getOrCreateGriddedStack(t.i, t.j).push(t);
    }
    public removeFromGriddedStack(t: Tile): void {
        let expected = this.getGriddedStack(t.i, t.j);
        if (expected && expected.contains(t)) {
            expected.remove(t);
        }
        else {
            console.warn("Removing a Tile that is not in its expected stack.");
            this.griddedTiles.forEach(line => {
                line.forEach(stack => {
                    if (stack.contains(t)) {
                        stack.remove(t);
                    }
                });
            });
        }
    }

    public griddedBorders: Nabu.UniqueList<Border>[][] = [];
    private _getOrCreateGriddedBorderStack(i: number, j: number): Nabu.UniqueList<Border> {
        if (!this.griddedBorders[i]) {
            this.griddedBorders[i] = [];
        }
        if (!this.griddedBorders[i][j]) {
            this.griddedBorders[i][j] = new Nabu.UniqueList<Border>();
        }
        return this.griddedBorders[i][j];
    }
    public getGriddedBorderStack(i: number, j: number): Nabu.UniqueList<Border> {
        if (this.griddedBorders[i]) {
            return this.griddedBorders[i][j];
        }
    }
    public updateGriddedBorderStack(b: Border, skipSafetyCheck?: boolean): void {
        if (!skipSafetyCheck) {
            this.griddedBorders.forEach(line => {
                line.forEach(stack => {
                    if (stack.contains(b)) {
                        stack.remove(b);
                    }
                });
            });
        }
        this._getOrCreateGriddedBorderStack(b.i, b.j).push(b);
    }
    public removeFromGriddedBorderStack(t: Border): void {
        let expected = this.getGriddedBorderStack(t.i, t.j);
        if (expected && expected.contains(t)) {
            expected.remove(t);
        }
        else {
            console.warn("Removing a Border that is not in its expected stack.");
            this.griddedBorders.forEach(line => {
                line.forEach(stack => {
                    if (stack.contains(t)) {
                        console.warn("It's been found elsewhere.");
                        stack.remove(t);
                    }
                });
            });
        }
    }

    public buildings: Build[] = [];
    public buildingBlocks: number[][] = [];
    public buildingBlockGet(i: number, j: number): number {
        if (i >= 0 && i < this.buildingBlocks.length) {
            if (!this.buildingBlocks[i]) {
                return 0;
            }
            if (j >= 0 && j < this.buildingBlocks[i].length) {
                if (isFinite(this.buildingBlocks[i][j])) {
                    return this.buildingBlocks[i][j];
                }
            }
        }
        return 0;
    }
    public buildingBlockSet(v: number, i: number, j: number): void {
        if (i >= 0 && i < this.w) {
            if (j >= 0 && j < this.h) {
                if (!this.buildingBlocks[i]) {
                    this.buildingBlocks[i] = [];
                }
                this.buildingBlocks[i][j] = v;
            }
        }
    }
    public forceFullBuildingBlockGrid(): void {
        for (let i = 0; i < this.w; i++) {
            for (let j = 0; j < this.h; j++) {
                this.buildingBlockSet(this.buildingBlockGet(i, j), i, j);
            }
        }
    }

    public buildingsContainer: BABYLON.Mesh;
    public buildingBlocksBorders: Border[] = [];
    public boxesWall: BABYLON.Mesh;
    public boxesWood: BABYLON.Mesh;
    public boxesFloor: BABYLON.Mesh;
    public bordersMesh: BABYLON.Mesh;

    public showFPS: boolean = false;
    public fpsMaterial: BABYLON.StandardMaterial;
    public fpsTexture: BABYLON.DynamicTexture;

    public get floorMaterial(): BABYLON.StandardMaterial {
        let index = this.floorMaterialIndex % this.game.materials.floorMaterials.length;
        return this.game.materials.floorMaterials[index];
    }

    public get haikuColor(): string {
        if (this.floorMaterialIndex === 6) {
            return "#e3d8caff";
        }
        if (this.floorMaterialIndex === 5) {
            return "#e3d8caff";
        }
        return "#e3cfb4ff";
    }

    public clicSound: MySound;
    public cricSound: MySound;
    public cracSound: MySound;
    public wiishSound: MySound;
    public wooshSound: MySound;
    public longCrackSound: MySound;
    public fallImpactSound: MySound;
    public slashSound: MySound;
    public snapBassSound: MySound;

    public getScene(): BABYLON.Scene {
        return this.game.scene;
    }

    public w: number = 10;
    public h: number = 10;
    public heightMap: number[][];
    public hMapGet(i: number, j: number): number {
        if (i >= 0 && i < this.heightMap.length) {
            if (!this.heightMap[i]) {
                return 0;
            }
            if (j >= 0 && j < this.heightMap[i].length) {
                return this.heightMap[i][j];
            }
        }
        return 0;
    }
    public hMapSet(v: number, i: number, j: number): void {
        if (i >= 0 && i < this.heightMap.length) {
            if (j >= 0 && j < this.heightMap[i].length) {
                if (!this.heightMap[i]) {
                    this.heightMap[i] = [];
                }
                this.heightMap[i][j] = v;
            }
        }
    }

    public get xMin(): number {
        return - 0.55 - 0.05;
    }

    public get xMax(): number {
        return this.w * 1.1 - 0.55 + 0.05;
    }

    public get zMin(): number {
        return - 0.55 - 0.05;
    }

    public get zMax(): number {
        return this.h * 1.1 - 0.55 + 0.05;
    }

    public puzzleUI: PuzzleUI;
    private _pendingPublish: boolean = false;
    public haiku: Haiku;
    public titleHaiku: Haiku;
    public tileHaikus: HaikuTile[] = [];
    public playerHaikus: HaikuPlayerStart[] = [];
    public floorMaterialIndex: number = 0;
    public winAnimationTime: number = 4;

    constructor(public game: Game) {
        this.balls = [
            new Ball(this, { color: TileColor.North }, 0),
        ];

        this.fishingPole = new FishingPole(this);

        this.floor = new BABYLON.Mesh("floor");
        this.floor.material = this.game.materials.floorMaterial;

        this.invisiFloorTM = BABYLON.MeshBuilder.CreateGround("invisifloor", { width: 10, height: 10 } );
        this.invisiFloorTM.position.x = 5 - 0.55;
        this.invisiFloorTM.position.y = - 0.01;
        this.invisiFloorTM.position.z = 5 - 0.55;
        this.invisiFloorTM.isVisible = false;

        this.holeWall = new BABYLON.Mesh("hole-wall");
        this.holeWall.material = this.game.materials.holeMaterial;

        this.buildingsContainer = new BABYLON.Mesh("boxes-container");

        this.boxesWall = new BABYLON.Mesh("building-wall");
        this.boxesWall.material = this.game.materials.wallMaterial;
        this.boxesWall.parent = this.buildingsContainer;

        this.boxesWood = new BABYLON.Mesh("building-wood");
        this.boxesWood.material = this.game.materials.brownMaterial;
        this.boxesWood.parent = this.buildingsContainer;

        this.boxesFloor = new BABYLON.Mesh("building-floor");
        this.boxesFloor.material = this.game.materials.woodFloorMaterial;
        this.boxesFloor.parent = this.buildingsContainer;

        this.bordersMesh = new BABYLON.Mesh("borders-mesh");
        this.bordersMesh.material = this.game.materials.borderMaterial;
        this.bordersMesh.parent = this.buildingsContainer;
        this.bordersMesh.renderOutline = true;
        this.bordersMesh.outlineColor = BABYLON.Color3.Black();
        this.bordersMesh.outlineWidth = 0.01;

        this.puzzleUI = new PuzzleUI(this);

        if (this.showFPS) {
            this.fpsMaterial = new BABYLON.StandardMaterial("test-haiku-material");
            this.fpsTexture = new BABYLON.DynamicTexture("haiku-texture", { width: 600, height: 200 });
            this.fpsTexture.hasAlpha = true;
            this.fpsMaterial.diffuseTexture = this.fpsTexture;
            this.fpsMaterial.specularColor.copyFromFloats(0.3, 0.3, 0.3);
            this.fpsMaterial.useAlphaFromDiffuseTexture = true;
        }
        
        this.clicSound = this.game.soundManager.createSound("clic", "./datas/sounds/clic.wav", undefined, undefined, { autoplay: false, loop: false, volume: 0.15 }, 3);
        this.cricSound = this.game.soundManager.createSound("cric", "./datas/sounds/clic.wav", undefined, undefined, { autoplay: false, loop: false, volume: 0.25, playbackRate: 0.92 }, 3);
        this.cracSound = this.game.soundManager.createSound("crac", "./datas/sounds/clic.wav", undefined, undefined, { autoplay: false, loop: false, volume: 0.25, playbackRate: 0.84 }, 3);
        this.wiishSound = this.game.soundManager.createSound("wiish", "./datas/sounds/wind.mp3", undefined, undefined, { autoplay: false, loop: false, volume: 0.1, playbackRate: 1 }, 3);
        this.wooshSound = this.game.soundManager.createSound("woosh", "./datas/sounds/wind.mp3", undefined, undefined, { autoplay: false, loop: false, volume: 0.1, playbackRate: 0.8 }, 3);
        this.longCrackSound = this.game.soundManager.createSound("long-crack", "./datas/sounds/long_crack_bass.mp3", undefined, undefined, { autoplay: false, loop: false, volume: 1 }, 3);
        this.fallImpactSound = this.game.soundManager.createSound("fall-impact", "./datas/sounds/fall-impact.wav", undefined, undefined, { autoplay: false, loop: false, volume: 0.4 }, 3);
        this.slashSound = this.game.soundManager.createSound("slash", "./datas/sounds/slash.mp3", undefined, undefined, { autoplay: false, loop: false, volume: 0.4 });
        this.snapBassSound = this.game.soundManager.createSound("snap-bass", "./datas/sounds/snap_bass.mp3", undefined, undefined, { autoplay: false, loop: false, volume: 0.6 }, 3);
    }

    public async reset(replaying?: boolean): Promise<void> {
        //await RandomWait();
        this.game.fadeOutIntro(0);
        this.fishingPole.stop = true;
        this.puzzleUI.reset();
        if (this.data) {
            this.resetFromData(this.data, replaying);
            await this.instantiate(replaying);
        }
        document.querySelector("#puzzle-title").innerHTML = GetTranslatedTitle(this.data);
        document.querySelector("#puzzle-author").innerHTML = "created by " + this.data.author;
        (document.querySelector("#puzzle-skip-intro") as HTMLDivElement).style.display = "";
        (document.querySelector("#puzzle-ready") as HTMLDivElement).style.display = "none";
        if (!this.editorOrEditorPreview && this.data.state === PuzzleDataState.STORY && this.data.numLevel === 1) {
            this.game.router.tutoPage.show(1);
        }
        else {
            this.game.fadeInIntro();
        }
        if (USE_POKI_SDK) {
            PokiGameplayStart();
        }
    }

    public skipIntro(): void {
        (document.querySelector("#puzzle-skip-intro") as HTMLDivElement).style.display = "none";
        (document.querySelector("#puzzle-ready") as HTMLDivElement).style.display = "";
        this.game.mode = GameMode.Play;
        this.puzzleUI.showTouchInput();
    }

    public win(): void {
        if (USE_POKI_SDK) {
            //PokiGameplayStop();
        }
        this.puzzleState = PuzzleState.Wining;
        let score = Math.floor(this.playTimer * 100);
        
        let previousCompletion = 0;
        if (this.data.state === PuzzleDataState.OKAY) {
            previousCompletion = this.game.puzzleCompletion.communityPuzzleCompletion;
        }
        else if (this.data.state === PuzzleDataState.STORY) {
            previousCompletion = this.game.puzzleCompletion.storyPuzzleCompletion;
        }
        else if (this.data.state === PuzzleDataState.XPERT) {
            previousCompletion = this.game.puzzleCompletion.expertPuzzleCompletion;
        }
        else if (this.data.state === PuzzleDataState.XMAS) {
            previousCompletion = this.game.puzzleCompletion.xmasPuzzleCompletion;
        }
        let firstTimeCompleted = !this.game.puzzleCompletion.isPuzzleCompleted(this.data.id);
        this.game.puzzleCompletion.completePuzzle(this.data.id, score);
        (this.puzzleUI.successPanel.querySelector("#success-timer") as StrokeText).innerHTML = Game.ScoreToString(score);

        clearTimeout(this._winloseTimout);
        setTimeout(() => {
            this.puzzleUI.hideTouchInput();
            this.balls[0].winAnimation()
        }, 500);
        setTimeout(() => {
            this.puzzleUI.winSound.play();
        }, 1000);
        this._winloseTimout = setTimeout(() => {
            this.puzzleUI.win(firstTimeCompleted, previousCompletion);
            if (!this.editorOrEditorPreview && !OFFLINE_MODE && (this.data.score === null || score < this.data.score)) {
                this.puzzleUI.setHighscoreState(1);
            }
            else {
                this.puzzleUI.setHighscoreState(0);
            }
            this.puzzleState = PuzzleState.Done;
            this.game.mode = GameMode.Menu;
        }, this.winAnimationTime * 1000);
    }

    public lose(): void {
        if (USE_POKI_SDK) {
            //PokiGameplayStop();
        }
        clearTimeout(this._winloseTimout);
        this._winloseTimout = setTimeout(() => {
            this.puzzleUI.hideTouchInput();
            this.puzzleState = PuzzleState.Done;
            this.puzzleUI.lose();
        }, 1000);
    }

    public async submitHighscore(): Promise<void> {
        //await RandomWait();
        if (this._pendingPublish) {
            return;
        }
        this._pendingPublish = true;

        let score = Math.round(this.playTimer * 100);
        let puzzleId = this.data.id;
        let player = (document.querySelector("#score-player-input") as HTMLInputElement).value;
        if (this.ballsCount === 2) {
            player = (document.querySelector("#score-2-players-input") as HTMLInputElement).value;
        }
        let actions = "cheating";

        let data = {
            puzzle_id: puzzleId,
            player: player,
            score: score,
            actions: actions
        }
        if (data.player.length > 3) {
            let dataString = JSON.stringify(data);
            this.puzzleUI.setHighscoreState(2);
            await Mummu.AnimationFactory.CreateWait(this)(1);
            try {
                const response = await fetch(SHARE_SERVICE_PATH + "publish_score", {
                    method: "POST",
                    mode: "cors",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: dataString,
                });
                if (!response.ok) {
                    throw new Error("Response status: " + response.status);
                }
                let puzzleData = await this.game.getPuzzleDataById(this.data.id);
                puzzleData.player = player;
                puzzleData.score = score;
                this.puzzleUI.setHighscoreState(3);
                this._pendingPublish = false;
            }
            catch (e) {
                this.puzzleUI.setHighscoreState(1);
                (document.querySelector("#success-score-fail-message") as HTMLDivElement).style.display = "block";
                this._pendingPublish = false;
            }
        }
    }

    public async loadFromFile(path: string): Promise<void> {
        //await RandomWait();
        let file = await fetch(path);
        let content = await file.text();
        this.resetFromData({
            id: null,
            title: "No Title",
            author: "No Author",
            content: content
        });
    }

    public resetFromData(data: IPuzzleData, replaying?: boolean): void {
        clearTimeout(this._winloseTimout);
        if (!replaying) {
            while (this.buildings.length > 0) {
                this.buildings[0].dispose();
            }
            while (this.buildingBlocksBorders.length > 0) {
                this.buildingBlocksBorders.pop().dispose();
            }
            this.griddedBorders = [];
        }
        while (this.tiles.length > 0) {
            this.tiles[0].dispose();
        }
        while (this.creeps.length > 0) {
            this.creeps.pop().dispose();
        }
        if (this.haiku) {
            this.haiku.dispose();
            this.haiku = undefined;
        }
        if (this.titleHaiku) {
            this.titleHaiku.dispose();
            this.titleHaiku = undefined;
        }
        while (this.tileHaikus.length > 0) {
            this.tileHaikus.pop().dispose();
        }
        while (this.playerHaikus.length > 0) {
            this.playerHaikus.pop().dispose();
        }
        this.blockTiles = [];
        this.griddedTiles = [];

        this.data = data;
        DEV_UPDATE_STATE_UI();

        if (isFinite(data.id)) {
            if (data.difficulty === 1) {
                this.game.bodyColorIndex = 10;
            }
            if (data.difficulty === 2) {
                this.game.bodyColorIndex = 3;
            }
            if (data.difficulty === 3) {
                this.game.bodyColorIndex = 8;
            }
            if (data.difficulty === 4) {
                this.game.bodyColorIndex = 7;
            }
            if (data.difficulty === 0) {
                this.game.bodyColorIndex = 5;
            }
            this.game.bodyPatternIndex = Math.floor(Math.random() * 2);
        }

        let content = this.data.content;
        content = content.replaceAll("\r\n", "");
        content = content.replaceAll("\n", "");
        let lines = content.split("x");

        let ballLine = lines.splice(0, 1)[0].split("u");
        this.ballsCount = 1;
        if (ballLine.length === 8 || ballLine.length === 9) {
            this.ballsCount = 2;
            this.ballsCount = 1;
        }
        
        let bIndexZero = 0;
        if (ballLine.length === 5 || ballLine.length === 8) {
            bIndexZero = 2;
        }
        else if (ballLine.length === 6 || ballLine.length === 9) {
            bIndexZero = 3;
        }
        for (let bIndex = 0; bIndex < this.ballsCount; bIndex++) {
            this.balls[bIndex].reset();
            this.balls[bIndex].position.x = parseInt(ballLine[bIndexZero + 0 + 3 * bIndex]) * 1.1;
            this.balls[bIndex].position.y = 0;
            this.balls[bIndex].position.z = parseInt(ballLine[bIndexZero + 1 + 3 * bIndex]) * 1.1;
            this.ballsPositionZero[bIndex].copyFrom(this.balls[bIndex].position);
            if (ballLine.length > 2) {
                this.balls[bIndex].setColor(parseInt(ballLine[bIndexZero + 2 + 3 * bIndex]));
            }
            else {
                this.balls[bIndex].setColor(TileColor.North);
            }
            this.balls[bIndex].lockControl(0.2);
    
            this.game.setPlayTimer(0);
        }
        for (let bIndex = this.ballsCount; bIndex < this.balls.length; bIndex++) {
            this.balls[bIndex].setVisible(false);
        }

        if (this.ballsCount === 1) {
            this.balls[0].material = this.game.materials.brownMaterial;
        }
        else if (this.ballsCount === 2) {
            this.balls[0].material = this.game.materials.whiteMaterial;
            this.balls[1].material = this.game.materials.blackMaterial;

            this.playerHaikus[0] = new HaikuPlayerStart(this.game, this.game.player1Name.toLocaleUpperCase(), this.balls[0]);
            this.playerHaikus[1] = new HaikuPlayerStart(this.game, this.game.player2Name.toLocaleUpperCase(), this.balls[1]);
        }

        this.ballCollision.copyFromFloats(- 10, 0, -10);
        this.ballCollisionDone = [true, true];
        
        this.fishingPolesCount = 0;

        let buildingBlocksLine = lines[lines.length - 1];
        if (buildingBlocksLine.startsWith("BB")) {
            lines.pop();
        }
        else {
            buildingBlocksLine = "";
        }

        if (ballLine.length === 5 || ballLine.length === 8) {
            this.w = parseInt(ballLine[0]);
            this.h = parseInt(ballLine[1]);
        }
        else {
            this.h = lines.length;
            this.w = lines[0].length;
        }

        if (ballLine.length === 6 || ballLine.length === 9) {
            this.floorMaterialIndex = parseInt(ballLine[2]);
        }
        else {
            this.floorMaterialIndex = 0;
        }

        if (!replaying) {
            this.buildingBlocks = [];
            for (let i = 0; i < this.w; i++) {
                this.buildingBlocks[i] = [];
                for (let j = 0; j < this.h; j++) {
                    this.buildingBlocks[i][j] = 0;
                }
            }
    
            if (buildingBlocksLine != "") {
                buildingBlocksLine = buildingBlocksLine.replace("BB", "");
                for (let j = 0; j < this.h; j++) {
                    for (let i = 0; i < this.w; i++) {
                        let n = i + j * this.w;
                        if (n < buildingBlocksLine.length) {
                            this.buildingBlocks[i][j] = parseInt(buildingBlocksLine[n]);
                        }
                    }
                }
            }
        }

        for (let j = 0; j < lines.length && j < this.h; j++) {
            let line = lines[lines.length - 1 - j];
            let i = 0;
            for (let ii = 0; ii < line.length && i < this.w; ii++) {
                let c = line[ii];
                if (c === "p") {
                    let push = new PushTile(this.game, {
                        color: TileColor.North,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                else if (c === "O") {
                    let hole = new HoleTile(this.game, {
                        color: TileColor.North,
                        i: i,
                        j: j,
                        h: 0,
                        noShadow: true
                    });
                }
                else if (c === "Q") {
                    let hole = new HoleTile(this.game, {
                        color: TileColor.North,
                        i: i,
                        j: j,
                        h: 0,
                        noShadow: true
                    });
                    hole.covered = true;
                }
                else if (c === "r") {
                    let rock = new WallTile(this.game, {
                        color: TileColor.North,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                else if (c === "a") {
                    let wall = new WallTile(this.game, {
                        color: TileColor.North,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                else if (c === "q") {
                    let water = new WaterTile(this.game, {
                        color: TileColor.North,
                        i: i,
                        j: j,
                        h: 0,
                        noShadow: true
                    });
                }
                else if (c === "N") {
                    let block = new SwitchTile(this.game, {
                        color: TileColor.North,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                else if (c === "n") {
                    let block = new BlockTile(this.game, {
                        color: TileColor.North,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                else if (c === "E") {
                    let block = new SwitchTile(this.game, {
                        color: TileColor.East,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                else if (c === "e") {
                    let block = new BlockTile(this.game, {
                        color: TileColor.East,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                else if (c === "S") {
                    let block = new SwitchTile(this.game, {
                        color: TileColor.South,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                else if (c === "s") {
                    let block = new BlockTile(this.game, {
                        color: TileColor.South,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                else if (c === "W") {
                    let block = new SwitchTile(this.game, {
                        color: TileColor.West,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                else if (c === "w") {
                    let block = new BlockTile(this.game, {
                        color: TileColor.West,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                else if (c === "I") {
                    let button = new ButtonTile(this.game, {
                        color: TileColor.North,
                        value: 1,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                else if (c === "D") {
                    let button = new ButtonTile(this.game, {
                        color: TileColor.North,
                        value: 2,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                else if (c === "T") {
                    let button = new ButtonTile(this.game, {
                        color: TileColor.North,
                        value: 3,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                else if (c === "i") {
                    let button = new DoorTile(this.game, {
                        color: TileColor.North,
                        value: 1,
                        i: i,
                        j: j,
                        h: 0,
                        noShadow: true
                    });
                }
                else if (c === "j") {
                    let button = new DoorTile(this.game, {
                        color: TileColor.North,
                        value: 1,
                        i: i,
                        j: j,
                        h: 0,
                        noShadow: true
                    });
                    button.close(0);
                }
                else if (c === "d") {
                    let button = new DoorTile(this.game, {
                        color: TileColor.North,
                        value: 2,
                        i: i,
                        j: j,
                        h: 0,
                        noShadow: true
                    });
                }
                else if (c === "f") {
                    let button = new DoorTile(this.game, {
                        color: TileColor.North,
                        value: 2,
                        i: i,
                        j: j,
                        h: 0,
                        noShadow: true
                    });
                    button.close(0);
                }
                else if (c === "t") {
                    let button = new DoorTile(this.game, {
                        color: TileColor.North,
                        value: 3,
                        i: i,
                        j: j,
                        h: 0,
                        noShadow: true
                    });
                }
                else if (c === "u") {
                    let button = new DoorTile(this.game, {
                        color: TileColor.North,
                        value: 3,
                        i: i,
                        j: j,
                        h: 0,
                        noShadow: true
                    });
                    button.close(0);
                }
                else if (c === "c") {
                    let creep = new Creep(this, {
                        i: i,
                        j: j
                    });
                }
                else if (c === "B") {
                    if (!replaying) {
                        this.buildingBlocks[i][j] = 1;
                        this.buildingBlocks[i + 1][j] = 1;
                        this.buildingBlocks[i][j + 1] = 1;
                        this.buildingBlocks[i + 1][j + 1] = 1;
                    }
                }
                else if (c === "R") {
                    let s = parseInt(line[ii + 1]);
                    if (isNaN(s)) {
                        if (!replaying) {
                            let ramp = new Ramp(this.game, {
                                i: i,
                                j: j,
                                size: 2
                            });
                        }
                    }
                    else {
                        if (!replaying) {
                            let ramp = new Ramp(this.game, {
                                i: i,
                                j: j,
                                size: s
                            });
                        }
                        ii++;
                    }
                }
                else if (c === "U") {
                    if (!replaying) {
                        let bridge = new Bridge(this.game, {
                            i: i,
                            j: j,
                            borderBottom: true,
                            borderRight: true,
                            borderLeft: true,
                            borderTop: true
                        });
                    }
                }
                i++;
            }
        }

        if (data.haiku) {
            let split = data.haiku.split("x");
            let x = parseInt(split[0]) * 0.55;
            let z = parseInt(split[1]) * 0.55;
            let haiku: Haiku;
            if (z < - 2) {
                haiku = new Haiku(this.game, "", 2000, 200);
                haiku.position.copyFromFloats((this.w - 1) * 1.1 * 0.5, 0.32, - 1);

                this.titleHaiku = new Haiku(this.game, "", 2000, 200);
                this.titleHaiku.position.copyFromFloats((this.w - 1) * 1.1 * 0.5, 0.32, this.h * 1.1 - 0.15);
                this.titleHaiku.setText(GetTranslatedTitle(this.data));
            }
            else {
                haiku = new Haiku(this.game, "");
                haiku.position.copyFromFloats(x, 0.02, z);
            }
            this.haiku = haiku;
            let translatedText = HaikuMaker.GetTranslatedHaikuText(this);
            if (translatedText) {
                haiku.setText(translatedText);
            }
            else {
                split = data.haiku.split("x");
                split.splice(0, 2);
                let text = split.reduce((s1, s2) => { return s1 + "x" + s2; });
                haiku.setText(text);
            }
        }
        this.game.updateMenuCameraRadius();
    }

    public connectWaterTiles(): void {
        let waterTiles = this.tiles.filter(t => { return t instanceof WaterTile; }) as WaterTile[];
        waterTiles.forEach(waterTile => {
            waterTile.disconnect();
        })
        while (waterTiles.length > 2) {
            waterTiles = waterTiles.sort((t1, t2) => {
                if (t2.j === t1.j) {
                    return t1.i - t2.i;
                }
                return t2.j - t1.j;
            });
            if (waterTiles[0]) {
                (waterTiles[0] as WaterTile).recursiveConnect(0);
            }
            waterTiles = this.tiles.filter(t => { return t instanceof WaterTile && t.distFromSource === Infinity; }) as WaterTile[];
        }
    }

    public buildingUpStep: number = 0.1;
    public buildingUpValue: number = 1;
    public async NextFrame(): Promise<void> {
        return new Promise<void>(resolve => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    resolve();
                });
            });
        });
    }
    public async SkipNextFrame(): Promise<void> {
        return new Promise<void>(resolve => {
            requestAnimationFrame(() => {
                resolve();
            });
        });
    }

    public async instantiate(replaying?: boolean): Promise<void> {
        //await RandomWait();
        this.puzzleState = PuzzleState.Loading;
        if (!replaying) {
            this.boxesWall.isVisible = false;
            this.boxesWood.isVisible = false;
            this.boxesFloor.isVisible = false;
            this.bordersMesh.isVisible = false;
            this.buildingsContainer.scaling.y = 0.01;
            let instantiatableTiles = this.tiles.filter(tile => {
                return tile instanceof BlockTile ||
                tile instanceof SwitchTile ||
                tile instanceof ButtonTile ||
                tile instanceof DoorTile ||
                tile instanceof HoleTile && tile.covered ||
                tile instanceof WaterTile;
            });
            if (instantiatableTiles.length > 0) {
                this.buildingUpStep = 1 / instantiatableTiles.length;
            }
            else {
                this.buildingUpStep = 1;
            }
            this.buildingUpValue = 0;
    
            this.regenerateHeightMap();
            await this.SkipNextFrame();
        }
    
        this.rebuildFloor();
        await this.SkipNextFrame();
        
        if (!replaying) {    
            for (let i = 0; i < this.buildings.length; i++) {
                this.buildings[i].regenerateBorders();
            }
            this.regenerateBuildingBlocksBorders();
            for (let i = 0; i < this.buildings.length; i++) {
                await this.buildings[i].instantiate();
            }
    
            let bordersVertexDatas: BABYLON.VertexData[] = [];
            for (let i = 0; i < this.buildings.length; i++) {
                let building = this.buildings[i];
                for (let j = 0; j < building.borders.length; j++) {
                    let border = building.borders[j];
                    let data = await border.getVertexData();
                    if (data) {
                        Mummu.RotateAngleAxisVertexDataInPlace(data, border.rotationY, BABYLON.Axis.Y);
                        Mummu.TranslateVertexDataInPlace(data, border.position);
                        bordersVertexDatas.push(data);
                    }
                }
                await this.SkipNextFrame();
            }
            for (let i = 0; i < this.buildingBlocksBorders.length; i++) {
                let data = await this.buildingBlocksBorders[i].getVertexData();
                if (data) {
                    Mummu.RotateAngleAxisVertexDataInPlace(data, this.buildingBlocksBorders[i].rotationY, BABYLON.Axis.Y);
                    Mummu.TranslateVertexDataInPlace(data, this.buildingBlocksBorders[i].position);
                    bordersVertexDatas.push(data);
                }
                if (i > 0 && i % 10 === 0) {
                    await this.SkipNextFrame();
                }
            }
    
            if (bordersVertexDatas.length > 0) {
                this.bordersMesh.isVisible = true;
                Mummu.MergeVertexDatas(...bordersVertexDatas).applyToMesh(this.bordersMesh);
            }
            else {
                this.bordersMesh.isVisible = false;
            }
            await this.NextFrame();
    
            let datas = await BuildingBlock.GenerateVertexDatas(this);
            datas[0].applyToMesh(this.boxesWall);
            datas[1].applyToMesh(this.boxesWood);
            datas[2].applyToMesh(this.boxesFloor);
            this.boxesWall.isVisible = true;
            this.boxesWood.isVisible = true;
            this.boxesFloor.isVisible = true;

            let buildingScalingYAnimation = Mummu.AnimationFactory.CreateNumber(this.buildingsContainer, this.buildingsContainer.scaling, "y");
            buildingScalingYAnimation(1, 2, Nabu.Easing.easeOutSine);

            await this.NextFrame();
        }        

        for (let i = 0; i < this.tiles.length; i++) {
            let t = this.tiles[i];
            if (t instanceof WaterTile) {

            }
            else if (t instanceof HoleTile) {

            }
            else {
                t.position.y = this.hMapGet(t.i, t.j);
            }
        }

        this.connectWaterTiles();

        for (let i = 0; i < this.tiles.length; i++) {
            let tile = this.tiles[i];
            await tile.instantiate();
            if (!replaying) {
                if (tile instanceof BlockTile ||
                    tile instanceof SwitchTile ||
                    tile instanceof ButtonTile ||
                    tile instanceof DoorTile ||
                    tile instanceof HoleTile && tile.covered ||
                    tile instanceof WaterTile
                ) {
                    tile.size = 0;
                    tile.bump(1);
                    await this.NextFrame();
                }
                else if (
                    tile instanceof WallTile
                ) {
                    await this.SkipNextFrame();
                }
            }
        }

        for (let i = 0; i < this.creeps.length; i++) {
            this.creeps[i].position.y = this.hMapGet(this.creeps[i].i, this.creeps[i].j);
            await this.creeps[i].instantiate();
            if (!replaying) {
                await this.NextFrame();
            }
        }

        for (let i = 0; i < this.ballsCount; i++) {
            await this.balls[i].instantiate();
            if (!replaying) {
                await this.NextFrame();
            }
        }

        if (this.ballsCount === 2) {
            this.playerHaikus[0].show();
            this.playerHaikus[1].show();
        }
        HaikuMaker.MakeHaiku(this);
        if (!replaying) {
            await this.NextFrame();
        }

        this.puzzleState = PuzzleState.Ready;
    }

    public regenerateHeightMap(): void {
        this.heightMap = [];
        for (let i = 0; i < this.w; i++) {
            this.heightMap[i] = [];
            for (let j = 0; j < this.h; j++) {
                this.heightMap[i][j] = this.buildingBlockGet(i, j);
            }
        }

        this.buildings.forEach(building => {
            building.fillHeightmap();
        })
    }

    public regenerateBuildingBlocksBorders(): void {
        while (this.buildingBlocksBorders.length > 0) {
            this.buildingBlocksBorders.pop().dispose();
        }

        for (let i = 0; i < this.w; i++) {
            for (let j = 0; j < this.h; j++) {
                let b = this.buildingBlockGet(i, j);
                if (b === 1) {
                    if (this.hMapGet(i - 1, j) != 1) {
                        this.buildingBlocksBorders.push(Border.BorderLeft(this.game, i, j, 1));
                        this.buildingBlocksBorders.push(Border.BorderLeft(this.game, i, j, 0, true));
                    }
            
                    if (this.hMapGet(i + 1, j) != 1) {
                        this.buildingBlocksBorders.push(Border.BorderRight(this.game, i, j, 1));
                        this.buildingBlocksBorders.push(Border.BorderRight(this.game, i, j, 0, true));
                    }
            
                    if (this.hMapGet(i, j + 1) != 1) {
                        this.buildingBlocksBorders.push(Border.BorderTop(this.game, i, j, 1));
                        this.buildingBlocksBorders.push(Border.BorderTop(this.game, i, j, 0, true));
                    }
            
                    if (this.hMapGet(i, j - 1) != 1) {
                        this.buildingBlocksBorders.push(Border.BorderBottom(this.game, i, j, 1));
                        this.buildingBlocksBorders.push(Border.BorderBottom(this.game, i, j, 0, true));
                    }
                }
            }
        }
    }

    
    public async editorRegenerateWaterTiles(): Promise<void> {
        this.connectWaterTiles();
        let waterTiles = this.tiles.filter(t => { return t instanceof WaterTile; }) as WaterTile[];
        for (let i = 0; i < waterTiles.length; i++) {
            await waterTiles[i].instantiate();
        }
    }

    public async editorRegenerateBuildings(): Promise<void> {
        this.regenerateHeightMap();

        for (let i = 0; i < this.buildings.length; i++) {
            this.buildings[i].regenerateBorders();
        }
        this.regenerateBuildingBlocksBorders();
        for (let i = 0; i < this.buildings.length; i++) {
            await this.buildings[i].instantiate();
        }
        
        let bordersVertexDatas: BABYLON.VertexData[] = [];
        for (let i = 0; i < this.buildings.length; i++) {
            let building = this.buildings[i];
            for (let j = 0; j < building.borders.length; j++) {
                let border = building.borders[j];
                let data = await border.getVertexData();
                if (data) {
                    Mummu.RotateAngleAxisVertexDataInPlace(data, border.rotationY, BABYLON.Axis.Y);
                    Mummu.TranslateVertexDataInPlace(data, border.position);
                    bordersVertexDatas.push(data);
                }
            }
        }
        for (let i = 0; i < this.buildingBlocksBorders.length; i++) {
            let data = await this.buildingBlocksBorders[i].getVertexData();
            if (data) {
                Mummu.RotateAngleAxisVertexDataInPlace(data, this.buildingBlocksBorders[i].rotationY, BABYLON.Axis.Y);
                Mummu.TranslateVertexDataInPlace(data, this.buildingBlocksBorders[i].position);
                bordersVertexDatas.push(data);
            }
        }
        if (bordersVertexDatas.length > 0) {
            this.bordersMesh.isVisible = true;
            Mummu.MergeVertexDatas(...bordersVertexDatas).applyToMesh(this.bordersMesh);
        }
        else {
            this.bordersMesh.isVisible = false;
        }

        let datas = await BuildingBlock.GenerateVertexDatas(this);
        datas[0].applyToMesh(this.boxesWall);
        datas[1].applyToMesh(this.boxesWood);
        datas[2].applyToMesh(this.boxesFloor);
    }

    public updateInvisifloorTM(): void {
        let w = this.xMax - this.xMin + 2.2 + 50;
        let h = this.zMax - this.zMin + 2.2 + 50;
        BABYLON.CreateGroundVertexData({ width: w, height: h }).applyToMesh(this.invisiFloorTM);
        this.invisiFloorTM.position.x = (this.xMax + this.xMin) * 0.5;
        this.invisiFloorTM.position.z = (this.zMax + this.zMin) * 0.5;
    }

    public rebuildFloor(): void {
        if (this.border) {
            this.border.dispose();
        }
        if (this.holeOutline) {
            this.holeOutline.dispose();
        }
        while (this.winSlots.length > 0) {
            this.winSlots.pop().dispose();
        }
        while (this.stars.length > 0) {
            this.stars.pop().dispose();
        }
        this.border = new BABYLON.Mesh("border");

        this.winSlotRows = 1;
        let bHeight = 0.3;
        let bThickness = 0.8;
        let width = this.xMax - this.xMin;
        let depth = this.zMax - this.zMin;

        let slotCounts = [];
        for (let color = TileColor.North; color <= TileColor.West; color++) {
            slotCounts[color] = this.tiles.filter((tile) => {
                return tile instanceof BlockTile && tile.color === color;
            }).length;
        }

        let lNorth = slotCounts[TileColor.North] * 0.7 + 0.1;
        let lEast = slotCounts[TileColor.East] * 0.7 + 0.1;
        let lSouth = slotCounts[TileColor.South] * 0.7 + 0.1;
        let lWest = slotCounts[TileColor.West] * 0.7 + 0.1;
        if (lNorth > width || lEast > width) {
            this.winSlotRows = 2;
        }
        if (lSouth > depth || lWest > depth) {
            this.winSlotRows = 2;
        }

        let puzzleFrame = CreateBoxFrameVertexData({
            w: width + 2 * this.winSlotRows * bThickness,
            d: depth + 2 * this.winSlotRows * bThickness,
            wTop: width + 2 * this.winSlotRows * bThickness - 0.1,
            dTop: depth + 2 * this.winSlotRows * bThickness - 0.1,
            h: 5.5 + bHeight,
            thickness: this.winSlotRows * bThickness,
            innerHeight: bHeight,
            flatShading: true
        })
        Mummu.TranslateVertexDataInPlace(puzzleFrame, new BABYLON.Vector3(0, -5.5, 0));

        this.border.position.copyFromFloats((this.xMax + this.xMin) * 0.5, 0, (this.zMax + this.zMin) * 0.5)
        this.border.material = this.game.materials.blackMaterial;

        Mummu.MergeVertexDatas(puzzleFrame).applyToMesh(this.border);

        /*
        let plaqueData = CreatePlaqueVertexData(2.5, 0.32, 0.03);
        Mummu.TranslateVertexDataInPlace(plaqueData, new BABYLON.Vector3(-1.25, 0, 0.16));
        
        let tiaratumLogo = new BABYLON.Mesh("tiaratum-logo");
        plaqueData.applyToMesh(tiaratumLogo);
        tiaratumLogo.parent = this.border;
        tiaratumLogo.position.copyFromFloats(width * 0.5 + 0.4, 0.21, - depth * 0.5 - 0.4);
        let haikuMaterial = new BABYLON.StandardMaterial("test-haiku-material");
        haikuMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/tiaratum-logo-yellow.png");
        haikuMaterial.diffuseTexture.hasAlpha = true;
        haikuMaterial.specularColor.copyFromFloats(0.3, 0.3, 0.3);
        haikuMaterial.useAlphaFromDiffuseTexture = true;
        tiaratumLogo.material = haikuMaterial;
        
        Mummu.TranslateVertexDataInPlace(plaqueData, new BABYLON.Vector3(-1.25, 0, 0.16).scale(-2));
        let tiaratumLogo2 = new BABYLON.Mesh("tiaratum-logo-2");
        plaqueData.applyToMesh(tiaratumLogo2);
        tiaratumLogo2.parent = this.border;
        tiaratumLogo2.position.copyFromFloats(- width * 0.5 - 0.4, 0.21, depth * 0.5 + 0.4);
        tiaratumLogo2.material = haikuMaterial;
        */
        
        if (this.showFPS) {
            let fpsPlaqueData = CreatePlaqueVertexData(1.8, 0.64, 0.03);
            Mummu.TranslateVertexDataInPlace(fpsPlaqueData, new BABYLON.Vector3(0.9, 0, 0.32));
    
            let fpsPlaque = new BABYLON.Mesh("tiaratum-fps");
            fpsPlaqueData.applyToMesh(fpsPlaque);
            fpsPlaque.parent = this.border;
            fpsPlaque.position.copyFromFloats(- width * 0.5 - bThickness + 0.1, bHeight, - depth * 0.5 - bThickness + 0.1);
            fpsPlaque.material = this.fpsMaterial;
            
            Mummu.TranslateVertexDataInPlace(fpsPlaqueData, new BABYLON.Vector3(0.9, 0, 0.32).scale(-2));
            let fpsPlaque2 = new BABYLON.Mesh("tiaratum-fps-2");
            fpsPlaqueData.applyToMesh(fpsPlaque2);
            fpsPlaque2.parent = this.border;
            fpsPlaque2.position.copyFromFloats(width * 0.5 + bThickness - 0.1, bHeight, depth * 0.5 + bThickness - 0.1);
            fpsPlaque2.material = this.fpsMaterial;
        }

        this.winSlotsIndexes = [0, 0, 0, 0];
        for (let color = TileColor.North; color <= TileColor.West; color++) {
            this.winSlots[color] = new BABYLON.Mesh("winslots-south");
            this.winSlots[color].material = this.game.materials.blackMaterial;
            let count = slotCounts[color];
            if (count > 0) {
                let datas: BABYLON.VertexData[] = [];
                for (let i = 0; i < count; i++) {
                    let data = CreateBoxFrameVertexData({
                        w: 0.5,
                        wBase: 0.6,
                        d: 0.5,
                        dBase: 0.6,
                        h: 0.1,
                        thickness: 0.05,
                        innerHeight: 0.09,
                        topCap: true,
                        topCapColor: new BABYLON.Color4(0.7, 0.7, 0.7, 1),
                        flatShading: true
                    });
                    let x = Math.floor(i / this.winSlotRows);
                    let z = i % this.winSlotRows;
                    Mummu.TranslateVertexDataInPlace(data, new BABYLON.Vector3(x * 0.7, 0, z * 0.7));
                    datas.push(data);
                }
                Mummu.MergeVertexDatas(...datas).applyToMesh(this.winSlots[color]);
                this.winSlots[color].parent = this.border;
                if (color === TileColor.North) {
                    this.winSlots[color].position.copyFromFloats(- (count - 1) * 0.7 * 0.5 / this.winSlotRows, bHeight, depth * 0.5 + bThickness * 0.5);
                }
                else if (color === TileColor.East) {
                    this.winSlots[color].position.copyFromFloats(width * 0.5 + bThickness * 0.5, bHeight, (count - 1) * 0.7 * 0.5 / this.winSlotRows);
                }
                else if (color === TileColor.South) {
                    this.winSlots[color].position.copyFromFloats((count - 1) * 0.7 * 0.5 / this.winSlotRows, bHeight, - depth * 0.5 - bThickness * 0.5);
                }
                else if (color === TileColor.West) {
                    this.winSlots[color].position.copyFromFloats(- width * 0.5 - bThickness * 0.5, bHeight, - (count - 1) * 0.7 * 0.5 / this.winSlotRows);
                }
                this.winSlots[color].rotation.y = Math.PI * 0.5 * color;
            }
        }
        
        let holes = [];
        let floorDatas = [];
        let holeDatas = [];
        for (let i = 0; i < this.w; i++) {
            for (let j = 0; j < this.h; j++) {
                let holeTile = this.tiles.find(tile => {
                    if (tile instanceof HoleTile) {
                        if (tile.props.i === i) {
                            if (tile.props.j === j) {
                                return true;
                            }
                        }
                    }
                    return false;
                })
                if (holeTile) {
                    holes.push({ i: i, j: j });
                    let tileData = BABYLON.CreateGroundVertexData({ width: 1.1, height: 1.1 });
                    Mummu.TranslateVertexDataInPlace(tileData, new BABYLON.Vector3(i * 1.1, -5, j * 1.1));
                    Mummu.ColorizeVertexDataInPlace(tileData, BABYLON.Color3.Black());
                    floorDatas.push(tileData);
                }
                if (!holeTile) {
                    let waterTile = this.tiles.find(tile => {
                        if (tile instanceof WaterTile) {
                            if (tile.props.i === i) {
                                if (tile.props.j === j) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    })
                    if (!waterTile) {
                        let tileData = BABYLON.CreateGroundVertexData({ width: 1.1, height: 1.1 });
                        Mummu.TranslateVertexDataInPlace(tileData, new BABYLON.Vector3(i * 1.1, 0, j * 1.1));
                        Mummu.ColorizeVertexDataInPlace(tileData, BABYLON.Color3.White());
                        floorDatas.push(tileData);
                    }
                }
            }
        }

        let holeOutlinePoints: BABYLON.Vector3[][] = [];
        let holeOutlineColors: BABYLON.Color4[][] = [];
        for (let n = 0; n < holes.length; n++) {
            let hole = holes[n];
            let i = hole.i;
            let j = hole.j;
            let left = holes.find(h => { return h.i === i - 1 && h.j === j; });
            if (!left) {
                let holeData = Mummu.CreateQuadVertexData({ width: 1.1, height: 5, uvInWorldSpace: true, uvSize: 1.1 });
                holeData.colors = [
                    0, 0, 0, 1,
                    0, 0, 0, 1,
                    1, 1, 1, 1,
                    1, 1, 1, 1
                ];
                Mummu.RotateVertexDataInPlace(holeData, BABYLON.Quaternion.FromEulerAngles(0, - Math.PI * 0.5, 0));
                Mummu.TranslateVertexDataInPlace(holeData, new BABYLON.Vector3((i - 0.5) * 1.1, -2.5, j * 1.1));
                holeDatas.push(holeData);
                holeOutlinePoints.push([
                    new BABYLON.Vector3(i * 1.1 - 0.55, 0, j * 1.1 + 0.55),
                    new BABYLON.Vector3(i * 1.1 - 0.55, 0, j * 1.1 - 0.55),
                ]);
                holeOutlineColors.push([
                    new BABYLON.Color4(0, 0, 0, 1),
                    new BABYLON.Color4(0, 0, 0, 1)
                ]);
            }
            let right = holes.find(h => { return h.i === i + 1 && h.j === j; });
            if (!right) {
                let holeData = Mummu.CreateQuadVertexData({ width: 1.1, height: 5, uvInWorldSpace: true, uvSize: 1.1 });
                holeData.colors = [
                    0, 0, 0, 1,
                    0, 0, 0, 1,
                    1, 1, 1, 1,
                    1, 1, 1, 1
                ];
                Mummu.RotateVertexDataInPlace(holeData, BABYLON.Quaternion.FromEulerAngles(0, Math.PI * 0.5, 0));
                Mummu.TranslateVertexDataInPlace(holeData, new BABYLON.Vector3((i + 0.5) * 1.1, -2.5, j * 1.1));
                holeDatas.push(holeData);
                holeOutlinePoints.push([
                    new BABYLON.Vector3(i * 1.1 + 0.55, 0, j * 1.1 + 0.55),
                    new BABYLON.Vector3(i * 1.1 + 0.55, 0, j * 1.1 - 0.55),
                ]);
                holeOutlineColors.push([
                    new BABYLON.Color4(0, 0, 0, 1),
                    new BABYLON.Color4(0, 0, 0, 1)
                ]);
            }
            let up = holes.find(h => { return h.i === i && h.j === j + 1; });
            if (!up) {
                let holeData = Mummu.CreateQuadVertexData({ width: 1.1, height: 5, uvInWorldSpace: true, uvSize: 1.1 });
                holeData.colors = [
                    0, 0, 0, 1,
                    0, 0, 0, 1,
                    1, 1, 1, 1,
                    1, 1, 1, 1
                ];
                Mummu.TranslateVertexDataInPlace(holeData, new BABYLON.Vector3(i * 1.1, -2.5, (j + 0.5) * 1.1));
                holeDatas.push(holeData);
                holeOutlinePoints.push([
                    new BABYLON.Vector3(i * 1.1 + 0.55, 0, j * 1.1 + 0.55),
                    new BABYLON.Vector3(i * 1.1 - 0.55, 0, j * 1.1 + 0.55),
                ]);
                holeOutlineColors.push([
                    new BABYLON.Color4(0, 0, 0, 1),
                    new BABYLON.Color4(0, 0, 0, 1)
                ]);
            }
            let down = holes.find(h => { return h.i === i && h.j === j - 1; });
            if (!down) {
                let holeData = Mummu.CreateQuadVertexData({ width: 1.1, height: 5, uvInWorldSpace: true, uvSize: 1.1 });
                holeData.colors = [
                    0, 0, 0, 1,
                    0, 0, 0, 1,
                    1, 1, 1, 1,
                    1, 1, 1, 1
                ];
                Mummu.RotateVertexDataInPlace(holeData, BABYLON.Quaternion.FromEulerAngles(0, Math.PI, 0));
                Mummu.TranslateVertexDataInPlace(holeData, new BABYLON.Vector3(i * 1.1, -2.5, (j - 0.5) * 1.1));
                holeDatas.push(holeData);
                holeOutlinePoints.push([
                    new BABYLON.Vector3(i * 1.1 + 0.55, 0, j * 1.1 - 0.55),
                    new BABYLON.Vector3(i * 1.1 - 0.55, 0, j * 1.1 - 0.55),
                ]);
                holeOutlineColors.push([
                    new BABYLON.Color4(0, 0, 0, 1),
                    new BABYLON.Color4(0, 0, 0, 1)
                ]);
            }
        }
        let floorData = Mummu.MergeVertexDatas(...floorDatas);
        for (let i = 0; i < floorData.positions.length / 3; i++) {
            floorData.uvs[2 * i] = 0.5 * floorData.positions[3 * i];
            floorData.uvs[2 * i + 1] = 0.5 * floorData.positions[3 * i + 2] - 0.5;
        }
        floorData.applyToMesh(this.floor);
        this.floor.material = this.floorMaterial;

        if (holeOutlinePoints.length > 0) {
            this.holeOutline = BABYLON.MeshBuilder.CreateLineSystem("hole-outline", {
                lines: holeOutlinePoints,
                colors: holeOutlineColors
            }, this.game.scene);
        }

        if (holeDatas.length > 0) {
            Mummu.MergeVertexDatas(...holeDatas).applyToMesh(this.holeWall);
            this.holeWall.isVisible = true;
        }
        else {
            this.holeWall.isVisible = false;
        }

        this.updateInvisifloorTM();
    }

    public fetchWinSlot(color: number): number {
        let s = this.winSlotsIndexes[color];
        this.winSlotsIndexes[color]++;
        return s;
    }

    public fetchWinSlotPos(color: number): BABYLON.Vector3 {
        let s = this.fetchWinSlot(color);
        let x = Math.floor(s / this.winSlotRows);
        let z = s % this.winSlotRows;
        let d = new BABYLON.Vector3(x * 0.7, 0, z * 0.7);
        let winSlotMesh = this.winSlots[color];
        return BABYLON.Vector3.TransformCoordinates(d, winSlotMesh.getWorldMatrix());
    }

    public start(): void {
        for (let i = 0; i < this.ballsCount; i++) {
            this.balls[i].ballState = BallState.Move;
            this.balls[i].bounceXValue = 0;
            this.balls[i].bounceXTimer = 0;
            this.balls[i].speed = 0;
            this.balls[i].vZ = 1;
            this.balls[i].animateSpeed(this.balls[i].nominalSpeed, 0.2, Nabu.Easing.easeInCubic);
            if (this.playerHaikus[i]) {
                this.playerHaikus[i].hide();
            }
        }
        for (let i = 0; i < this.tileHaikus.length; i++) {
            this.tileHaikus[i].show();
        }
        this.puzzleState = PuzzleState.Playing;
        this.game.fadeOutIntro(0.5);
        this.playTimer = 0;
        this.game.setPlayTimer(this.playTimer);
    }

    private _ballCollisionTimeStamp: number = 0;
    public addBallCollision(v: BABYLON.Vector3): void {
        if (Math.abs(this._globalTime - this._ballCollisionTimeStamp) > 0.1) {
            this.ballCollisionDone = [false, false];
            this.ballCollision.copyFrom(v);
            this._ballCollisionTimeStamp = this._globalTime;
        }
    }

    private _timer: number = 0;
    private _globalTime: number = 0;
    public update(dt: number): void {
        if (this.puzzleState != PuzzleState.Loading) {
            for (let i = 0; i < this.ballsCount; i++) {
                this.balls[i].update(dt);
            }
            for (let i = 0; i < this.creeps.length; i++) {
                this.creeps[i].update(dt);
            }

            if (this.puzzleState === PuzzleState.Playing) {
                let noBlockTile = true;
                for (let i = 0; i < this.blockTiles.length; i++) {
                    if (this.blockTiles[i].tileState === TileState.Active) {
                        noBlockTile = false;
                        break;
                    }
                }
                if (noBlockTile) {
                    let ballNotDone = false;
                    for (let i = 0; i < this.ballsCount; i++) {
                        if (this.balls[i].ballState != BallState.Done) {
                            ballNotDone = true;
                        }
                    }
                    if (ballNotDone) {
                        for (let i = 0; i < this.ballsCount; i++) {
                            this.balls[i].ballState = BallState.Done;
                        }
                        this.win();
                    }
                }
            }

            if (this.balls[0].ballState === BallState.Move || this.balls[0].ballState === BallState.Fall || this.balls[0].ballState === BallState.Flybacking) {
                this.playTimer += dt;
                this.game.setPlayTimer(this.playTimer);
            }
        }
        if (this.haiku) {
            this.haiku.update(dt);
        }
        if (this.titleHaiku) {
            this.titleHaiku.update(dt);
        }
        for (let i = 0; i < this.tileHaikus.length; i++) {
            let tileHaiku = this.tileHaikus[i];
            if (tileHaiku.shown && tileHaiku.tile.isDisposed()) {
                tileHaiku.hide();
            }
        }

        this._globalTime += dt;
        this._timer += dt;
        if (this.showFPS) {
            let refreshRate = 0.1;
            if (this.game.performanceWatcher.worst < 24) {
                refreshRate = 1;
            }
            if (this._timer > refreshRate) {
                this._timer = 0;
                let context = this.fpsTexture.getContext();
                context.fillStyle = "#e0c872ff";
                context.fillRect(0, 0, 600, 200);
        
                context.fillStyle = "#473a2fFF";
                context.font = "900 90px Julee";
                context.fillText(this.game.performanceWatcher.average.toFixed(0).padStart(3, " "), 60, 77);
                context.fillText("fps (avg)", 200, 77);
        
                context.fillStyle = "#473a2fFF";
                context.font = "900 90px Julee";
                context.fillText(this.game.performanceWatcher.worst.toFixed(0).padStart(3, " "), 60, 177);
                context.fillText("fps (min)", 200, 177);
        
                this.fpsTexture.update();
            }
        }
    }
}