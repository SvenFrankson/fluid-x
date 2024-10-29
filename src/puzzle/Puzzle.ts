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

    public ball: Ball;
    public border: BABYLON.Mesh;
    public floor: BABYLON.Mesh;
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

    public borders: Border[] = [];
    public getBorders(x: number, z: number): Border[] {
        return this.borders.filter(b => {
            return Math.abs(b.position.x - x) < 2 && Math.abs(b.position.z - z) < 2;
        })
    }
    public buildings: Build[] = [];

    public fpsMaterial: BABYLON.StandardMaterial;
    public fpsTexture: BABYLON.DynamicTexture;

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
        return - 0.55;
    }

    public get xMax(): number {
        return this.w * 1.1 - 0.55;
    }

    public get zMin(): number {
        return - 0.55;
    }

    public get zMax(): number {
        return this.h * 1.1 - 0.55;
    }

    public puzzleUI: PuzzleUI;
    private _pendingPublish: boolean = false;
    public haikus: Haiku[] = [];

    constructor(public game: Game) {
        this.ball = new Ball(this, { color: TileColor.North });

        this.floor = new BABYLON.Mesh("floor");
        this.floor.material = this.game.floorMaterial;

        this.holeWall = new BABYLON.Mesh("hole-wall");
        this.holeWall.material = this.game.grayMaterial;

        this.puzzleUI = new PuzzleUI(this);

        this.fpsMaterial = new BABYLON.StandardMaterial("test-haiku-material");
        this.fpsTexture = new BABYLON.DynamicTexture("haiku-texture", { width: 300, height: 100 });
        this.fpsTexture.hasAlpha = true;
        this.fpsMaterial.diffuseTexture = this.fpsTexture;
        this.fpsMaterial.specularColor.copyFromFloats(0.3, 0.3, 0.3);
        this.fpsMaterial.useAlphaFromDiffuseTexture = true;
    }

    public async reset(): Promise<void> {
        if (this.data) {
            this.resetFromData(this.data);
            await this.instantiate();
        }
        this.puzzleUI.reset();
        (document.querySelector("#puzzle-title stroke-text") as StrokeText).setContent(this.data.title);
        (document.querySelector("#puzzle-author stroke-text") as StrokeText).setContent("created by " + this.data.author);
        this.game.fadeInIntro();
        if (USE_POKI_SDK) {
            PokiGameplayStart();
        }
    }

    public win(): void {
        if (USE_POKI_SDK) {
            PokiGameplayStop();
        }
        let score = Math.floor(this.ball.playTimer * 100);
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
            if (this.ball.ballState === BallState.Done) {

                this.game.stamp.play(this.puzzleUI.successPanel.querySelector(".stamp"));
                this.puzzleUI.win();
                if (!OFFLINE_MODE && (this.data.score === null || score < this.data.score)) {
                    this.puzzleUI.setHighscoreState(1);
                }
                else {
                    this.puzzleUI.setHighscoreState(0);
                }
            }
        }, 3000);
    }

    public lose(): void {
        if (USE_POKI_SDK) {
            PokiGameplayStop();
        }
        setTimeout(() => {
            if (this.ball.ballState === BallState.Done) {
                this.puzzleUI.lose();
            }
        }, 1000);
    }

    public async submitHighscore(): Promise<void> {
        if (this._pendingPublish) {
            return;
        }
        this._pendingPublish = true;

        let score = Math.round(this.ball.playTimer * 100);
        let puzzleId = this.data.id;
        let player = (document.querySelector("#score-player-input") as HTMLInputElement).value;
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
        this.griddedTiles = [];

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
        this.ball.position.x = parseInt(ballLine[0]) * 1.1;
        this.ball.position.y = 0;
        this.ball.position.z = parseInt(ballLine[1]) * 1.1;
        this.ball.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.ball.trailPoints = [];
        this.ball.trailMesh.isVisible = false;
        if (ballLine.length > 2) {
            this.ball.setColor(parseInt(ballLine[2]));
        }
        else {
            this.ball.setColor(TileColor.North);
        }
        this.ball.ballState = BallState.Ready;
        this.game.setPlayTimer(0);
        this.ball.vZ = 1;
        this.h = lines.length;
        this.w = lines[0].length;
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
                        h: 0
                    });
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
                if (c === "B") {
                    let box = new Box(this.game, {
                        i: i,
                        j: j,
                        borderBottom: true,
                        borderRight: true,
                        borderLeft: true,
                        borderTop: true
                    });
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
    }

    public async instantiate(): Promise<void> {
        this.regenerateHeightMap();
        for (let i = 0; i < this.tiles.length; i++) {
            let t = this.tiles[i];
            t.position.y = this.hMapGet(t.i, t.j);
        }

        for (let i = 0; i < this.tiles.length; i++) {
            await this.tiles[i].instantiate();
        }
        for (let i = 0; i < this.buildings.length; i++) {
            this.buildings[i].regenerateBorders();
            await this.buildings[i].instantiate();
        }

        await this.ball.instantiate();
        this.rebuildFloor();
    }

    public regenerateHeightMap(): void {
        this.heightMap = [];
        for (let i = 0; i < this.w; i++) {
            this.heightMap[i] = [];
            for (let j = 0; j < this.h; j++) {
                this.heightMap[i][j] = 0;
            }
        }

        this.buildings.forEach(building => {
            building.fillHeightmap();
        })
    }

    public async editorRegenerateBuildings(): Promise<void> {
        this.regenerateHeightMap();

        for (let i = 0; i < this.buildings.length; i++) {
            this.buildings[i].regenerateBorders();
            await this.buildings[i].instantiate();
        }
    }

    public rebuildFloor(): void {
        if (this.border) {
            this.border.dispose();
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
                    let tileData = BABYLON.CreateGroundVertexData({ width: 1.1, height: 1.1 });
                    Mummu.TranslateVertexDataInPlace(tileData, new BABYLON.Vector3(i * 1.1, 0, j * 1.1));
                    Mummu.ColorizeVertexDataInPlace(tileData, BABYLON.Color3.White());
                    floorDatas.push(tileData);
                }
            }
        }

        for (let n = 0; n < holes.length; n++) {
            let hole = holes[n];
            let i = hole.i;
            let j = hole.j;
            let left = holes.find(h => { return h.i === i - 1 && h.j === j; });
            if (!left) {
                let holeData = Mummu.CreateQuadVertexData({ width: 1.1, height: 5 });
                holeData.colors = [
                    0, 0, 0, 1,
                    0, 0, 0, 1,
                    1, 1, 1, 1,
                    1, 1, 1, 1
                ];
                Mummu.RotateVertexDataInPlace(holeData, BABYLON.Quaternion.FromEulerAngles(0, - Math.PI * 0.5, 0));
                Mummu.TranslateVertexDataInPlace(holeData, new BABYLON.Vector3((i - 0.5) * 1.1, -2.5, j * 1.1));
                holeDatas.push(holeData);
            }
            let right = holes.find(h => { return h.i === i + 1 && h.j === j; });
            if (!right) {
                let holeData = Mummu.CreateQuadVertexData({ width: 1.1, height: 5 });
                holeData.colors = [
                    0, 0, 0, 1,
                    0, 0, 0, 1,
                    1, 1, 1, 1,
                    1, 1, 1, 1
                ];
                Mummu.RotateVertexDataInPlace(holeData, BABYLON.Quaternion.FromEulerAngles(0, Math.PI * 0.5, 0));
                Mummu.TranslateVertexDataInPlace(holeData, new BABYLON.Vector3((i + 0.5) * 1.1, -2.5, j * 1.1));
                holeDatas.push(holeData);
            }
            let up = holes.find(h => { return h.i === i && h.j === j + 1; });
            if (!up) {
                let holeData = Mummu.CreateQuadVertexData({ width: 1.1, height: 5 });
                holeData.colors = [
                    0, 0, 0, 1,
                    0, 0, 0, 1,
                    1, 1, 1, 1,
                    1, 1, 1, 1
                ];
                Mummu.TranslateVertexDataInPlace(holeData, new BABYLON.Vector3(i * 1.1, -2.5, (j + 0.5) * 1.1));
                holeDatas.push(holeData);
            }
            let down = holes.find(h => { return h.i === i && h.j === j - 1; });
            if (!down) {
                let holeData = Mummu.CreateQuadVertexData({ width: 1.1, height: 5 });
                holeData.colors = [
                    0, 0, 0, 1,
                    0, 0, 0, 1,
                    1, 1, 1, 1,
                    1, 1, 1, 1
                ];
                Mummu.RotateVertexDataInPlace(holeData, BABYLON.Quaternion.FromEulerAngles(0, Math.PI, 0));
                Mummu.TranslateVertexDataInPlace(holeData, new BABYLON.Vector3(i * 1.1, -2.5, (j - 0.5) * 1.1));
                holeDatas.push(holeData);
            }
        }
        Mummu.MergeVertexDatas(...floorDatas).applyToMesh(this.floor);
        if (holeDatas.length > 0) {
            Mummu.MergeVertexDatas(...holeDatas).applyToMesh(this.holeWall);
            this.holeWall.isVisible = true;
        }
        else {
            this.holeWall.isVisible = false;
        }
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

    private _timer: number = 0;
    private _globalTime: number = 0;
    private _smoothedFPS: number = 30;
    public update(dt: number): void {
        this.ball.update(dt);
        let tiles = this.tiles.filter(t => {
            return t instanceof BlockTile && t.tileState === TileState.Active;
        })
        if (tiles.length === 0 && this.ball.ballState != BallState.Done) {
            this.ball.ballState = BallState.Done;
            this.win();
        }
        for (let i = 0; i < this.haikus.length; i++) {
            this.haikus[i].update(dt);
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