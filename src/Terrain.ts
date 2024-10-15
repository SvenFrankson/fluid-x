class Terrain {

    private _textContent: string;
    public border: BABYLON.Mesh;
    public floor: BABYLON.Mesh;
    public holeWall: BABYLON.Mesh;
    public tiles: Tile[] = [];
    public borders: Border[] = [];
    public builds: Build[] = [];

    public w: number = 10;
    public h: number = 10;

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

    constructor(public game: Game) {
        this.floor = new BABYLON.Mesh("floor");
        this.floor.material = this.game.floorMaterial;

        this.holeWall = new BABYLON.Mesh("hole-wall");
        this.holeWall.material = this.game.grayMaterial;
    }

    public async reset(): Promise<void> {
        if (this._textContent) {
            this.loadFromText(this._textContent);
            await this.instantiate();
        }
    }

    public async loadFromFile(path: string): Promise<void> {
        let file = await fetch(path);
        let content = await file.text();
        this.loadFromText(content);
    }

    public loadFromText(content: string): void {
        while (this.tiles.length > 0) {
            this.tiles[0].dispose();
        }
        while (this.builds.length > 0) {
            this.builds[0].dispose();
        }

        this._textContent = content;

        content = content.replaceAll("\r\n", "");
        content = content.replaceAll("\n", "");
        let lines = content.split("x");
        console.log(lines);
        let ballLine = lines.splice(0, 1)[0].split("u");
        this.game.ball.position.x = parseInt(ballLine[0]) * 1.1;
        this.game.ball.position.y = 0;
        this.game.ball.position.z = parseInt(ballLine[1]) * 1.1;
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
                if (c === "O") {
                    let hole = new HoleTile(this.game, {
                        color: TileColor.South,
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
                /*
                if (c === "^") {
                    let ramp = new Ramp(this.game, {
                        i: i,
                        j: j
                    });
                    await ramp.instantiate();
                }
                if (c === "/") {
                    let ramp = new Box(this.game, {
                        i: i,
                        j: j,
                        borderLeft: true,
                        borderTop: true
                    });
                    await ramp.instantiate();
                }
                if (c === "7") {
                    let ramp = new Box(this.game, {
                        i: i,
                        j: j,
                        borderRight: true,
                        borderTop: true
                    });
                    await ramp.instantiate();
                }
                if (c === "=") {
                    let ramp = new Box(this.game, {
                        i: i,
                        j: j,
                        borderTop: true,
                        borderBottom: true
                    });
                    await ramp.instantiate();
                }
                */
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
            else if (tile instanceof HoleTile) {
                lines[j][i] = "O";
            }
        })

        lines.reverse();

        let lines2 = lines.map((l1) => { return l1.reduce((c1, c2) => { return c1 + c2; })});

        lines2.splice(0, 0, this.game.ball.i.toFixed(0) + "u" + this.game.ball.j.toFixed(0) + "u" + this.game.ball.color.toFixed(0));

        return lines2.reduce((l1, l2) => { return l1 + "x" + l2; });
    }

    public async instantiate(): Promise<void> {
        for (let i = 0; i < this.tiles.length; i++) {
            await this.tiles[i].instantiate();
        }

        this.rebuildFloor();
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

        let right = BABYLON.MeshBuilder.CreateBox("right", { width: 0.5, height: 0.2, depth: this.zMax - this.zMin});
        right.position.x = this.xMax + 0.25;
        right.position.y = 0.1;
        right.position.z = 0.5 * (this.zMin + this.zMax);
        right.material = this.game.blackMaterial;
        right.parent = this.border;

        let bottom = BABYLON.MeshBuilder.CreateBox("bottom", { width: this.xMax - this.xMin + 1, height: 0.2, depth: 0.5});
        bottom.position.x = 0.5 * (this.xMin + this.xMax);
        bottom.position.y = 0.1;
        bottom.position.z = this.zMin - 0.25;
        bottom.material = this.game.blackMaterial;
        bottom.parent = this.border;

        let left = BABYLON.MeshBuilder.CreateBox("left", { width: 0.5, height: 0.2, depth: this.zMax - this.zMin});
        left.position.x = this.xMin - 0.25;
        left.position.y = 0.1;
        left.position.z = 0.5 * (this.zMin + this.zMax);
        left.material = this.game.blackMaterial;
        left.parent = this.border;
        
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
        Mummu.MergeVertexDatas(...holeDatas).applyToMesh(this.holeWall);
    }
}