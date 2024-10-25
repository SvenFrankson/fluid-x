interface IPuzzleData {
    id: number;
    title: string;
    author: string;
    content: string;
    numLevel?: number;
    score?: number;
    player?: string;
    state?: number;
    story_order?: number;
}

function CLEAN_IPuzzleData(data: any): any {
    if (data.score != null && typeof(data.score) === "string") {
        data.score = parseInt(data.score);
    }
    if (data.state != null && typeof(data.state) === "string") {
        data.state = parseInt(data.state);
    }
    if (data.story_order != null && typeof(data.story_order) === "string") {
        data.story_order = parseInt(data.story_order);
    }
}

interface IPuzzlesData {
    puzzles: IPuzzleData[];
}

function CLEAN_IPuzzlesData(data: any): any {
    for (let i = 0; i < data.puzzles.length; i++) {
        if (data.puzzles[i].score != null && typeof(data.puzzles[i].score) === "string") {
            data.puzzles[i].score = parseInt(data.puzzles[i].score);
        }
        if (data.puzzles[i].state != null && typeof(data.puzzles[i].state) === "string") {
            data.puzzles[i].state = parseInt(data.puzzles[i].state);
        }
        if (data.puzzles[i].story_order != null && typeof(data.puzzles[i].story_order) === "string") {
            data.puzzles[i].story_order = parseInt(data.puzzles[i].story_order);
        }
    }
}

class Puzzle {

    public data: IPuzzleData = {
        id: -1,
        title: "No Title",
        author: "No Author",
        content: ""
    };

    public border: BABYLON.Mesh;
    public floor: BABYLON.Mesh;
    public holeWall: BABYLON.Mesh;
    public tiles: Tile[] = [];
    public borders: Border[] = [];
    public buildings: Build[] = [];

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

    private _pendingPublish: boolean = false;

    constructor(public game: Game) {
        this.floor = new BABYLON.Mesh("floor");
        this.floor.material = this.game.floorMaterial;

        this.holeWall = new BABYLON.Mesh("hole-wall");
        this.holeWall.material = this.game.grayMaterial;
    }

    public win(): void {
        
        let score = Math.floor(this.game.ball.playTimer * 100);
        this.game.completePuzzle(this.data.id, score);
        (this.game.router.successPanel.querySelector("#success-timer stroke-text") as StrokeText).setContent(Game.ScoreToString(score));

        let highscore = this.data.score;
        let ratio = 1;
        if (highscore != null) {
            ratio = highscore / score;
        }
        let s1 = ratio > 0.3 ? "★" : "☆";
        let s2 = ratio > 0.6 ? "★" : "☆";
        let s3 = ratio > 0.9 ? "★" : "☆";
        this.game.router.successPanel.querySelector(".stamp div").innerHTML = s1 + "</br>" + s2 + s3;

        setTimeout(() => {
            if (this.game.ball.ballState === BallState.Done) {

                this.game.stamp.play(this.game.router.successPanel.querySelector(".stamp"));
                this.game.router.successPanel.style.display = "";
                this.game.router.gameoverPanel.style.display = "none";
                if (this.data.score === null || score < this.data.score) {
                    this.setHighscoreState(1);
                }
                else {
                    this.setHighscoreState(0);
                }
            }
        }, 1000);
    }

    public lose(): void {
        setTimeout(() => {
            if (this.game.ball.ballState === BallState.Done) {
                this.game.router.successPanel.style.display = "none";
                this.game.router.gameoverPanel.style.display = "";
            }
        }, 1000);
    }

    public setHighscoreState(state: number): void {
        (document.querySelector("#success-score-fail-message") as HTMLDivElement).style.display = "none";
        if (state === 0) {
            // Not enough for Highscore
            (document.querySelector("#success-highscore-container") as HTMLDivElement).style.display = "none";
        }
        else if (state === 1) {
            // Enough for Highscore, waiting for player action.
            (document.querySelector("#success-highscore-container") as HTMLDivElement).style.display = "block";

            (document.querySelector("#success-score-submit-btn") as HTMLButtonElement).style.display = "inline-block";
            (document.querySelector("#success-score-pending-btn") as HTMLButtonElement).style.display = "none";
            (document.querySelector("#success-score-done-btn") as HTMLButtonElement).style.display = "none";
        }
        else if (state === 2) {
            // Sending Highscore.
            (document.querySelector("#success-highscore-container") as HTMLDivElement).style.display = "block";

            (document.querySelector("#success-score-submit-btn") as HTMLButtonElement).style.display = "none";
            (document.querySelector("#success-score-pending-btn") as HTMLButtonElement).style.display = "inline-block";
            (document.querySelector("#success-score-done-btn") as HTMLButtonElement).style.display = "none";
        }
        else if (state === 3) {
            // Highscore sent with success.
            (document.querySelector("#success-highscore-container") as HTMLDivElement).style.display = "block";

            (document.querySelector("#success-score-submit-btn") as HTMLButtonElement).style.display = "none";
            (document.querySelector("#success-score-pending-btn") as HTMLButtonElement).style.display = "none";
            (document.querySelector("#success-score-done-btn") as HTMLButtonElement).style.display = "inline-block";
        }
    }

    public async submitHighscore(): Promise<void> {
        if (this._pendingPublish) {
            return;
        }
        this._pendingPublish = true;

        let score = Math.round(this.game.ball.playTimer * 100);
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
            this.setHighscoreState(2);
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
                this.setHighscoreState(3);
                this._pendingPublish = false;
            }
            catch (e) {
                this.setHighscoreState(1);
                (document.querySelector("#success-score-fail-message") as HTMLDivElement).style.display = "block";
                this._pendingPublish = false;
            }
        }
    }

    public async reset(): Promise<void> {
        if (this.data) {
            this.loadFromData(this.data);
            await this.instantiate();
        }
        if (this.game.router.successPanel) {
            this.game.router.successPanel.style.display = "none";
        }
        if (this.game.router.gameoverPanel) {
            this.game.router.gameoverPanel.style.display = "none";
        }
        (document.querySelector("#puzzle-title stroke-text") as StrokeText).setContent(this.data.title);
        (document.querySelector("#puzzle-author stroke-text") as StrokeText).setContent("created by " + this.data.author);
        this.game.fadeInIntro();
    }

    public async loadFromFile(path: string): Promise<void> {
        let file = await fetch(path);
        let content = await file.text();
        this.loadFromData({
            id: 42,
            title: "No Title",
            author: "No Author",
            content: content
        });
    }

    public loadFromData(data: IPuzzleData): void {
        while (this.tiles.length > 0) {
            this.tiles[0].dispose();
        }
        while (this.buildings.length > 0) {
            this.buildings[0].dispose();
        }

        this.data = data;
        DEV_UPDATE_STATE_UI();

        if (isFinite(data.id)) {
            this.game.bodyColorIndex = 5;
            this.game.bodyPatternIndex = Math.floor(Math.random() * 2);
        }

        console.log(this.data);

        let content = this.data.content;
        content = content.replaceAll("\r\n", "");
        content = content.replaceAll("\n", "");
        let lines = content.split("x");
        console.log(lines);
        let ballLine = lines.splice(0, 1)[0].split("u");
        this.game.ball.position.x = parseInt(ballLine[0]) * 1.1;
        this.game.ball.position.y = 0;
        this.game.ball.position.z = parseInt(ballLine[1]) * 1.1;
        this.game.ball.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.game.ball.trailPoints = [];
        this.game.ball.trailMesh.isVisible = false;
        if (ballLine.length > 2) {
            this.game.ball.setColor(parseInt(ballLine[2]));
        }
        else {
            this.game.ball.setColor(TileColor.North);
        }
        this.game.ball.ballState = BallState.Ready;
        this.game.setPlayTimer(0);
        this.game.ball.vZ = 1;
        this.h = lines.length;
        this.w = lines[0].length;
        console.log(this.w + " " + this.h);
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
                    let rock = new RockTile(this.game, {
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
    }

    public saveAsText(): string {
        let lines: string[][] = [];
        for (let j = 0; j < this.h; j++) {
            lines[j] = [];
            for (let i = 0; i < this.w; i++) {
                lines[j][i] = "o";
            }
        }

        this.tiles.forEach(tile => {
            let i = tile.i;
            let j = tile.j;
            if (tile instanceof BlockTile) {
                if (tile.color === TileColor.North) {
                    lines[j][i] = "n";
                }
                else if (tile.color === TileColor.East) {
                    lines[j][i] = "e";
                }
                else if (tile.color === TileColor.South) {
                    lines[j][i] = "s";
                }
                else if (tile.color === TileColor.West) {
                    lines[j][i] = "w";
                }
            }
            else if (tile instanceof SwitchTile) {
                if (tile.color === TileColor.North) {
                    lines[j][i] = "N";
                }
                else if (tile.color === TileColor.East) {
                    lines[j][i] = "E";
                }
                else if (tile.color === TileColor.South) {
                    lines[j][i] = "S";
                }
                else if (tile.color === TileColor.West) {
                    lines[j][i] = "W";
                }
            }
            else if (tile instanceof PushTile) {
                lines[j][i] = "p";
            }
            else if (tile instanceof HoleTile) {
                lines[j][i] = "O";
            }
            else if (tile instanceof RockTile) {
                lines[j][i] = "r";
            }
            else if (tile instanceof WallTile) {
                lines[j][i] = "a";
            }
        });

        this.buildings.forEach(building => {
            let i = building.i;
            let j = building.j;
            if (building instanceof Box) {
                lines[j][i] = "B";
            }
            if (building instanceof Ramp) {
                lines[j][i] = "R";
            }
            if (building instanceof Bridge) {
                lines[j][i] = "U";
            }
        })

        lines.reverse();

        let lines2 = lines.map((l1) => { return l1.reduce((c1, c2) => { return c1 + c2; })});

        lines2.splice(0, 0, this.game.ball.i.toFixed(0) + "u" + this.game.ball.j.toFixed(0) + "u" + this.game.ball.color.toFixed(0));

        return lines2.reduce((l1, l2) => { return l1 + "x" + l2; });
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
        this.border = new BABYLON.Mesh("border");

        let top = BABYLON.MeshBuilder.CreateBox("top", { width: this.xMax - this.xMin + 1, height: 0.2, depth: 0.5});
        top.position.x = 0.5 * (this.xMin + this.xMax);
        top.position.y = 0.1;
        top.position.z = this.zMax + 0.25;
        top.material = this.game.blackMaterial;
        top.parent = this.border;
        
        let topPanel = BABYLON.MeshBuilder.CreateGround("top-panel", { width: this.xMax - this.xMin + 1, height: 5.5});
        topPanel.position.x = 0.5 * (this.xMin + this.xMax);
        topPanel.position.y = - 5.5 * 0.5;
        topPanel.position.z = this.zMax + 0.5;
        topPanel.rotation.x = Math.PI * 0.5;
        topPanel.material = this.game.blackMaterial;
        topPanel.parent = this.border;

        let right = BABYLON.MeshBuilder.CreateBox("right", { width: 0.5, height: 0.2, depth: this.zMax - this.zMin});
        right.position.x = this.xMax + 0.25;
        right.position.y = 0.1;
        right.position.z = 0.5 * (this.zMin + this.zMax);
        right.material = this.game.blackMaterial;
        right.parent = this.border;
        
        let rightPanel = BABYLON.MeshBuilder.CreateGround("right-panel", { width: 5.5, height: this.zMax - this.zMin + 1});
        rightPanel.position.x = this.xMax + 0.5;
        rightPanel.position.y = - 5.5 * 0.5;
        rightPanel.position.z = 0.5 * (this.zMin + this.zMax);
        rightPanel.rotation.z = - Math.PI * 0.5;
        rightPanel.material = this.game.blackMaterial;
        rightPanel.parent = this.border;

        let bottom = BABYLON.MeshBuilder.CreateBox("bottom", { width: this.xMax - this.xMin + 1, height: 0.2, depth: 0.5});
        bottom.position.x = 0.5 * (this.xMin + this.xMax);
        bottom.position.y = 0.1;
        bottom.position.z = this.zMin - 0.25;
        bottom.material = this.game.blackMaterial;
        bottom.parent = this.border;
        
        let bottomPanel = BABYLON.MeshBuilder.CreateGround("bottom-panel", { width: this.xMax - this.xMin + 1, height: 5.5});
        bottomPanel.position.x = 0.5 * (this.xMin + this.xMax);
        bottomPanel.position.y = - 5.5 * 0.5;
        bottomPanel.position.z = this.zMin - 0.5;
        bottomPanel.rotation.x = - Math.PI * 0.5;
        bottomPanel.material = this.game.blackMaterial;
        bottomPanel.parent = this.border;

        let left = BABYLON.MeshBuilder.CreateBox("left", { width: 0.5, height: 0.2, depth: this.zMax - this.zMin});
        left.position.x = this.xMin - 0.25;
        left.position.y = 0.1;
        left.position.z = 0.5 * (this.zMin + this.zMax);
        left.material = this.game.blackMaterial;
        left.parent = this.border;
        
        let leftPanel = BABYLON.MeshBuilder.CreateGround("left-panel", { width: 5.5, height: this.zMax - this.zMin + 1});
        leftPanel.position.x = this.xMin - 0.5;
        leftPanel.position.y = - 5.5 * 0.5;
        leftPanel.position.z = 0.5 * (this.zMin + this.zMax);
        leftPanel.rotation.z = Math.PI * 0.5;
        leftPanel.material = this.game.blackMaterial;
        leftPanel.parent = this.border;
        
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

    public update(dt: number): void {
        let tiles = this.tiles.filter(t => {
            return t instanceof BlockTile && t.tileState === TileState.Active;
        })
        if (tiles.length === 0 && this.game.ball.ballState != BallState.Done) {
            this.game.ball.ballState = BallState.Done;
            this.win();
        }
    }
}