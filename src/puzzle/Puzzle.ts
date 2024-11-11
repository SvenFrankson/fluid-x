class Puzzle {

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

    public playTimer: number = 0;
    public fishingPolesCount: number = 0;
    public fishingPole: FishingPole;
    public border: BABYLON.Mesh;
    public floor: BABYLON.Mesh;
    public holeOutline: BABYLON.LinesMesh;
    public invisiFloorTM: BABYLON.Mesh;
    public holeWall: BABYLON.Mesh;
    public tiles: Tile[] = [];
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

    public buildingBlocksBorders: Border[] = [];
    public boxesWall: BABYLON.Mesh;
    public boxesWood: BABYLON.Mesh;
    public boxesFloor: BABYLON.Mesh;
    public bordersMesh: BABYLON.Mesh;

    public fpsMaterial: BABYLON.StandardMaterial;
    public fpsTexture: BABYLON.DynamicTexture;

    public cricSound: MySound;
    public cracSound: MySound;
    public wooshSound: MySound;

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
        if (i < this.heightMap.length) {
            if (j < this.heightMap[i].length) {
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
    public haikus: Haiku[] = [];
    public playerHaikus: HaikuPlayerStart[] = [];

    constructor(public game: Game) {
        this.balls = [
            new Ball(this, { color: TileColor.North }, 0),
            new Ball(this, { color: TileColor.North }, 1)
        ];

        this.fishingPole = new FishingPole(this);

        this.floor = new BABYLON.Mesh("floor");
        this.floor.material = this.game.floorMaterial;

        this.invisiFloorTM = BABYLON.MeshBuilder.CreateGround("invisifloor", { width: 10, height: 10 } );
        this.invisiFloorTM.position.x = 5 - 0.55;
        this.invisiFloorTM.position.y = - 0.01;
        this.invisiFloorTM.position.z = 5 - 0.55;
        this.invisiFloorTM.isVisible = false;

        this.holeWall = new BABYLON.Mesh("hole-wall");
        this.holeWall.material = this.game.holeMaterial;

        this.boxesWall = new BABYLON.Mesh("building-wall");
        this.boxesWall.material = this.game.wallMaterial;

        this.boxesWood = new BABYLON.Mesh("building-wood");
        this.boxesWood.material = this.game.brownMaterial;

        this.boxesFloor = new BABYLON.Mesh("building-floor");
        this.boxesFloor.material = this.game.woodFloorMaterial;

        this.bordersMesh = new BABYLON.Mesh("borders-mesh");
        this.bordersMesh.material = this.game.borderMaterial;
        this.bordersMesh.renderOutline = true;
        this.bordersMesh.outlineColor = BABYLON.Color3.Black();
        this.bordersMesh.outlineWidth = 0.01;

        this.puzzleUI = new PuzzleUI(this);

        this.fpsMaterial = new BABYLON.StandardMaterial("test-haiku-material");
        this.fpsTexture = new BABYLON.DynamicTexture("haiku-texture", { width: 300, height: 100 });
        this.fpsTexture.hasAlpha = true;
        this.fpsMaterial.diffuseTexture = this.fpsTexture;
        this.fpsMaterial.specularColor.copyFromFloats(0.3, 0.3, 0.3);
        this.fpsMaterial.useAlphaFromDiffuseTexture = true;
        
        this.cricSound = this.game.soundManager.createSound("wood-choc", "./datas/sounds/clic.wav", undefined, undefined, { autoplay: false, loop: false, volume: 0.15 }, 3);
        this.cracSound = this.game.soundManager.createSound("wood-choc", "./datas/sounds/clic.wav", undefined, undefined, { autoplay: false, loop: false, volume: 0.15, playbackRate: 0.9 }, 3);
        this.wooshSound = this.game.soundManager.createSound("wood-choc", "./datas/sounds/wind.mp3", undefined, undefined, { autoplay: false, loop: false, volume: 0.1, playbackRate: 0.8 }, 3);
    }

    public async reset(): Promise<void> {
        this.fishingPole.stop = true;
        if (this.data) {
            this.resetFromData(this.data);
            await this.instantiate();
        }
        this.puzzleUI.reset();
        (document.querySelector("#puzzle-title stroke-text") as StrokeText).setContent(this.data.title);
        (document.querySelector("#puzzle-author stroke-text") as StrokeText).setContent("created by " + this.data.author);
        (document.querySelector("#puzzle-skip-intro") as HTMLDivElement).style.display = "";
        (document.querySelector("#puzzle-ready") as HTMLDivElement).style.display = "none";
        this.game.fadeInIntro();
        if (USE_POKI_SDK) {
            PokiGameplayStart();
        }
    }

    public skipIntro(): void {
        (document.querySelector("#puzzle-skip-intro") as HTMLDivElement).style.display = "none";
        (document.querySelector("#puzzle-ready") as HTMLDivElement).style.display = "";
        this.game.mode = GameMode.Play;
    }

    public win(): void {
        if (USE_POKI_SDK) {
            PokiGameplayStop();
        }
        let score = Math.floor(this.playTimer * 100);
        let firstTimeCompleted = !this.game.isPuzzleCompleted(this.data.id);
        this.game.completePuzzle(this.data.id, score);
        (this.puzzleUI.successPanel.querySelector("#success-timer stroke-text") as StrokeText).setContent(Game.ScoreToString(score));

        let highscore = this.data.score;
        let ratio = 1;
        if (highscore != null) {
            ratio = highscore / score;
        }
        let s1 = ratio > 0.3 ? "★" : "☆";
        let s2 = ratio > 0.6 ? "★" : "☆";
        let s3 = ratio > 0.9 ? "★" : "☆";
        this.puzzleUI.successPanel.querySelector(".stamp div").innerHTML = s1 + "</br>" + s2 + s3;

        setTimeout(() => {
            for (let i = 0; i < this.ballsCount; i++) {
                if (this.balls[i].ballState != BallState.Done) {
                    return;
                }
            }
            this.game.stamp.play(this.puzzleUI.successPanel.querySelector(".stamp"));
            this.puzzleUI.win(firstTimeCompleted);
            if (!OFFLINE_MODE && (this.data.score === null || score < this.data.score)) {
                this.puzzleUI.setHighscoreState(1);
            }
            else {
                this.puzzleUI.setHighscoreState(0);
            }
        }, 3000);
    }

    public lose(): void {
        if (USE_POKI_SDK) {
            PokiGameplayStop();
        }
        setTimeout(() => {
            for (let i = 0; i < this.ballsCount; i++) {
                if (this.balls[i].ballState != BallState.Done) {
                    return;
                }
            }
            this.puzzleUI.lose();
        }, 1000);
    }

    public async submitHighscore(): Promise<void> {
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
        let file = await fetch(path);
        let content = await file.text();
        this.resetFromData({
            id: null,
            title: "No Title",
            author: "No Author",
            content: content
        });
    }

    public resetFromData(data: IPuzzleData): void {
        while (this.tiles.length > 0) {
            this.tiles[0].dispose();
        }
        while (this.buildings.length > 0) {
            this.buildings[0].dispose();
        }
        while (this.haikus.length > 0) {
            this.haikus.pop().dispose();
        }
        while (this.playerHaikus.length > 0) {
            this.playerHaikus.pop().dispose();
        }
        this.griddedTiles = [];
        this.griddedBorders = [];

        this.data = data;
        DEV_UPDATE_STATE_UI();

        if (isFinite(data.id)) {
            this.game.bodyColorIndex = 5;
            this.game.bodyPatternIndex = Math.floor(Math.random() * 2);
        }

        let content = this.data.content;
        content = content.replaceAll("\r\n", "");
        content = content.replaceAll("\n", "");
        let lines = content.split("x");

        let ballLine = lines.splice(0, 1)[0].split("u");
        this.ballsCount = Math.max(1, Math.floor(ballLine.length / 3));
        for (let bIndex = 0; bIndex < this.ballsCount; bIndex++) {
            this.balls[bIndex].parent = undefined;
            this.balls[bIndex].position.x = parseInt(ballLine[0 + 3 * bIndex]) * 1.1;
            this.balls[bIndex].position.y = 0;
            this.balls[bIndex].position.z = parseInt(ballLine[1 + 3 * bIndex]) * 1.1;
            this.ballsPositionZero[bIndex].copyFrom(this.balls[bIndex].position);
            this.balls[bIndex].rotationQuaternion = BABYLON.Quaternion.Identity();
            this.balls[bIndex].trailPoints = [];
            this.balls[bIndex].trailMesh.isVisible = false;
            if (ballLine.length > 2) {
                this.balls[bIndex].setColor(parseInt(ballLine[2 + 3 * bIndex]));
            }
            else {
                this.balls[bIndex].setColor(TileColor.North);
            }
            this.balls[bIndex].ballState = BallState.Ready;
            this.balls[bIndex].lockControl(0.2);
    
            this.game.setPlayTimer(0);
            this.balls[bIndex].vZ = 1;

            this.balls[bIndex].setVisible(true);

        }
        for (let bIndex = this.ballsCount; bIndex < this.balls.length; bIndex++) {
            this.balls[bIndex].setVisible(false);
        }

        if (this.ballsCount === 1) {
            this.balls[0].material = this.game.brownMaterial;
        }
        else if (this.ballsCount === 2) {
            this.balls[0].material = this.game.whiteMaterial;
            this.balls[1].material = this.game.blackMaterial;

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

        this.h = lines.length;
        this.w = lines[0].length;

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

        for (let j = 0; j < lines.length; j++) {
            let line = lines[lines.length - 1 - j];
            for (let i = 0; i < line.length; i++) {
                let c = line[i];
                if (c === "p") {
                    let push = new PushTile(this.game, {
                        color: TileColor.North,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                if (c === "O") {
                    let hole = new HoleTile(this.game, {
                        color: TileColor.North,
                        i: i,
                        j: j,
                        h: 0,
                        noShadow: true
                    });
                }
                if (c === "Q") {
                    let hole = new HoleTile(this.game, {
                        color: TileColor.North,
                        i: i,
                        j: j,
                        h: 0,
                        noShadow: true
                    });
                    hole.covered = true;
                }
                if (c === "r") {
                    let rock = new WallTile(this.game, {
                        color: TileColor.North,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                if (c === "a") {
                    let wall = new WallTile(this.game, {
                        color: TileColor.North,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                if (c === "q") {
                    let water = new WaterTile(this.game, {
                        color: TileColor.North,
                        i: i,
                        j: j,
                        h: 0,
                        noShadow: true
                    });
                }
                if (c === "N") {
                    let block = new SwitchTile(this.game, {
                        color: TileColor.North,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                if (c === "n") {
                    let block = new BlockTile(this.game, {
                        color: TileColor.North,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                if (c === "E") {
                    let block = new SwitchTile(this.game, {
                        color: TileColor.East,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                if (c === "e") {
                    let block = new BlockTile(this.game, {
                        color: TileColor.East,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                if (c === "S") {
                    let block = new SwitchTile(this.game, {
                        color: TileColor.South,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                if (c === "s") {
                    let block = new BlockTile(this.game, {
                        color: TileColor.South,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                if (c === "W") {
                    let block = new SwitchTile(this.game, {
                        color: TileColor.West,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                if (c === "w") {
                    let block = new BlockTile(this.game, {
                        color: TileColor.West,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                if (c === "I") {
                    let button = new ButtonTile(this.game, {
                        color: TileColor.North,
                        value: 1,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                if (c === "D") {
                    let button = new ButtonTile(this.game, {
                        color: TileColor.North,
                        value: 2,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                if (c === "T") {
                    let button = new ButtonTile(this.game, {
                        color: TileColor.North,
                        value: 3,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                if (c === "i") {
                    let button = new DoorTile(this.game, {
                        color: TileColor.North,
                        value: 1,
                        i: i,
                        j: j,
                        h: 0,
                        noShadow: true
                    });
                }
                if (c === "j") {
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
                if (c === "d") {
                    let button = new DoorTile(this.game, {
                        color: TileColor.North,
                        value: 2,
                        i: i,
                        j: j,
                        h: 0,
                        noShadow: true
                    });
                }
                if (c === "f") {
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
                if (c === "t") {
                    let button = new DoorTile(this.game, {
                        color: TileColor.North,
                        value: 3,
                        i: i,
                        j: j,
                        h: 0,
                        noShadow: true
                    });
                }
                if (c === "u") {
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
                if (c === "B") {
                    this.buildingBlocks[i][j] = 1;
                    this.buildingBlocks[i + 1][j] = 1;
                    this.buildingBlocks[i][j + 1] = 1;
                    this.buildingBlocks[i + 1][j + 1] = 1;
                }
                if (c === "R") {
                    let ramp = new Ramp(this.game, {
                        i: i,
                        j: j
                    });
                }
                if (c === "U") {
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
        }

        HaikuMaker.MakeHaiku(this);
        this.game.updateMenuCameraRadius();
    }

    public async instantiate(): Promise<void> {
        this.regenerateHeightMap();
        
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

        let waterTiles = this.tiles.filter(t => { return t instanceof WaterTile && t.distFromSource === Infinity; });
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
            waterTiles = this.tiles.filter(t => { return t instanceof WaterTile && t.distFromSource === Infinity; })
        }

        for (let i = 0; i < this.tiles.length; i++) {
            await this.tiles[i].instantiate();
        }
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
        Mummu.MergeVertexDatas(...bordersVertexDatas).applyToMesh(this.bordersMesh);
        this.bordersMesh.freezeWorldMatrix();

        let datas = await BuildingBlock.GenerateVertexDatas(this);
        datas[0].applyToMesh(this.boxesWall);
        datas[1].applyToMesh(this.boxesWood);
        datas[2].applyToMesh(this.boxesFloor);

        for (let i = 0; i < this.ballsCount; i++) {
            await this.balls[i].instantiate();
        }

        if (this.ballsCount === 2) {
            this.playerHaikus[0].show();
            this.playerHaikus[1].show();
        }

        this.rebuildFloor();
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
        for (let i = 0; i < this.buildingBlocksBorders.length; i++) {
            let data = await this.buildingBlocksBorders[i].getVertexData();
            if (data) {
                Mummu.RotateAngleAxisVertexDataInPlace(data, this.buildingBlocksBorders[i].rotationY, BABYLON.Axis.Y);
                Mummu.TranslateVertexDataInPlace(data, this.buildingBlocksBorders[i].position);
                bordersVertexDatas.push(data);
            }
        }
        Mummu.MergeVertexDatas(...bordersVertexDatas).applyToMesh(this.bordersMesh);
        this.bordersMesh.freezeWorldMatrix();

        let datas = await BuildingBlock.GenerateVertexDatas(this);
        datas[0].applyToMesh(this.boxesWall);
        datas[1].applyToMesh(this.boxesWood);
        datas[2].applyToMesh(this.boxesFloor);
    }

    public updateInvisifloorTM(): void {
        let w = Math.max(100, 2 * (this.xMax - this.xMin));
        let h = Math.max(100, 2 * (this.zMax - this.zMin));
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

        let data = CreateBoxFrameVertexData({
            w: width + 2 * this.winSlotRows * bThickness,
            d: depth + 2 * this.winSlotRows * bThickness,
            wTop: width + 2 * this.winSlotRows * bThickness - 0.1,
            dTop: depth + 2 * this.winSlotRows * bThickness - 0.1,
            h: 5.5 + bHeight,
            thickness: this.winSlotRows * bThickness,
            innerHeight: bHeight,
            flatShading: true
        })

        Mummu.TranslateVertexDataInPlace(data, new BABYLON.Vector3(0, -5.5, 0));

        this.border.position.copyFromFloats((this.xMax + this.xMin) * 0.5, 0, (this.zMax + this.zMin) * 0.5)
        this.border.material = this.game.blackMaterial;
        data.applyToMesh(this.border);

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
        
        let fpsPlaqueData = CreatePlaqueVertexData(0.9, 0.32, 0.03);
        Mummu.TranslateVertexDataInPlace(fpsPlaqueData, new BABYLON.Vector3(0.45, 0, 0.16));

        let fpsPlaque = new BABYLON.Mesh("tiaratum-fps");
        fpsPlaqueData.applyToMesh(fpsPlaque);
        fpsPlaque.parent = this.border;
        fpsPlaque.position.copyFromFloats(- width * 0.5 - bThickness + 0.1, bHeight, - depth * 0.5 - bThickness + 0.1);
        fpsPlaque.material = this.fpsMaterial;
        
        Mummu.TranslateVertexDataInPlace(fpsPlaqueData, new BABYLON.Vector3(0.45, 0, 0.16).scale(-2));
        let fpsPlaque2 = new BABYLON.Mesh("tiaratum-fps-2");
        fpsPlaqueData.applyToMesh(fpsPlaque2);
        fpsPlaque2.parent = this.border;
        fpsPlaque2.position.copyFromFloats(width * 0.5 + bThickness - 0.1, bHeight, depth * 0.5 + bThickness - 0.1);
        fpsPlaque2.material = this.fpsMaterial;

        this.winSlotsIndexes = [0, 0, 0, 0];
        for (let color = TileColor.North; color <= TileColor.West; color++) {
            this.winSlots[color] = new BABYLON.Mesh("winslots-south");
            this.winSlots[color].material = this.game.blackMaterial;
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

        this.holeOutline = BABYLON.MeshBuilder.CreateLineSystem("hole-outline", {
            lines: holeOutlinePoints,
            colors: holeOutlineColors
        }, this.game.scene);

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
            this.balls[i].animateSpeed(this.balls[i].nominalSpeed, 0.2, Nabu.Easing.easeInCubic);
            if (this.playerHaikus[i]) {
                this.playerHaikus[i].hide();
            }
        }
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
    private _smoothedFPS: number = 30;
    public update(dt: number): void {
        for (let i = 0; i < this.ballsCount; i++) {
            this.balls[i].update(dt);
        }
        let tiles = this.tiles.filter(t => {
            return t instanceof BlockTile && t.tileState === TileState.Active;
        })
        if (tiles.length === 0) {
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
        for (let i = 0; i < this.haikus.length; i++) {
            this.haikus[i].update(dt);
        }

        if (this.balls[0].ballState === BallState.Move || this.balls[0].ballState === BallState.Fall || this.balls[0].ballState === BallState.Flybacking) {
            this.playTimer += dt;
            this.game.setPlayTimer(this.playTimer);
        }

        this._globalTime += dt;
        this._timer += dt;
        if (this._timer > 0.25) {
            this._timer = 0;
            let fps = this.game.engine.getFps();
            if (isFinite(fps)) {
                this._smoothedFPS = 0.9 * this._smoothedFPS + 0.1 * fps;
            }
            let context = this.fpsTexture.getContext();
            context.fillStyle = "#e0c872ff";
            context.fillRect(0, 0, 800, 100);
    
            context.fillStyle = "#473a2fFF";
            context.font = "900 90px Julee";
            context.fillText(this._smoothedFPS.toFixed(0).padStart(3, " "), 30, 77);
            context.fillText("fps", 170, 77);
    
            this.fpsTexture.update();
        }
    }
}