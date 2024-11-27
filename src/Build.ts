interface BuildProps {
    i?: number;
    j?: number;
    size?: number;
    borderTop?: boolean;
    borderRight?: boolean;
    borderBottom?: boolean;
    borderLeft?: boolean;
}

abstract class Build extends BABYLON.Mesh {

    public floor: BABYLON.Mesh;
    public shadow: BABYLON.Mesh;
    public borders: Border[] = [];
    public get puzzle(): Puzzle {
        return this.game.puzzle;
    }

    public get i(): number {
        return Math.round(this.position.x / 1.1);
    }
    public set i(v: number) {
        this.position.x = v * 1.1;
        this.freeze();
    }
    public get j(): number {
        return Math.round(this.position.z / 1.1);
    }
    public set j(v: number) {
        this.position.z = v * 1.1;
        this.freeze();
    }

    constructor(public game: Game, protected props: BuildProps) {
        super("tile");
        if (isFinite(props.i)) {
            this.position.x = props.i * 1.1;
        }
        if (isFinite(props.j)) {
            this.position.z = props.j * 1.1;
        }

        this.parent = this.game.puzzle.buildingsContainer;

        this.floor = new BABYLON.Mesh("building-floor");
        this.floor.parent = this;

        this.floor.material = this.game.woodFloorMaterial;

        this.shadow = new BABYLON.Mesh("shadow");
        this.shadow.position.y = 0.005;
        this.shadow.parent = this;

        this.shadow.material = this.game.shadow9Material;

        let index = this.game.puzzle.buildings.indexOf(this);
        if (index === -1) {
            this.game.puzzle.buildings.push(this);
        }
    }

    public async instantiate(): Promise<void> { }

    public async bump(): Promise<void> {
        
    }

    public fillHeightmap(): void { }

    public regenerateBorders(): void { }

    public dispose(): void {
        let index = this.game.puzzle.buildings.indexOf(this);
        if (index != -1) {
            this.game.puzzle.buildings.splice(index, 1);
        }
        for (let i = 0; i < this.borders.length; i++) {
            this.borders[i].dispose();
        }
        super.dispose();
    }

    public freeze(): void {
        this.freezeWorldMatrix();
        this.getChildMeshes().forEach(child => {
            child.freezeWorldMatrix();
        })
    }
}

class Ramp extends Build {

    public builtInBorderLeft: BABYLON.Mesh;
    public builtInBorderRight: BABYLON.Mesh;

    public w: number = 2;
    
    constructor(game: Game, props: BuildProps) {
        super(game, props);
        this.material = this.game.brickWallMaterial;

        if (props.size) {
            this.w = props.size;
        }

        this.builtInBorderLeft = new BABYLON.Mesh("ramp-border");
        this.builtInBorderLeft.position.x = -0.55;
        this.builtInBorderLeft.parent = this;
        this.builtInBorderLeft.material = this.game.borderMaterial;

        this.builtInBorderLeft.renderOutline = true;
        this.builtInBorderLeft.outlineColor = BABYLON.Color3.Black();
        this.builtInBorderLeft.outlineWidth = 0.01;

        this.builtInBorderRight = new BABYLON.Mesh("ramp-border");
        this.builtInBorderRight.position.x = (this.w - 0.5) * 1.1;
        this.builtInBorderRight.parent = this;
        this.builtInBorderRight.material = this.game.borderMaterial;

        this.builtInBorderRight.renderOutline = true;
        this.builtInBorderRight.outlineColor = BABYLON.Color3.Black();
        this.builtInBorderRight.outlineWidth = 0.01;
    }

    public fillHeightmap() {
        for (let ii = 0; ii < this.w; ii++) {
            for (let jj = 0; jj < 3; jj++) {
                this.game.puzzle.hMapSet((jj + 1) / 3, this.i + ii, this.j + jj);
            }
        }
    }

    public regenerateBorders(): void {
        while (this.borders.length > 0) {
            this.borders.pop().dispose();
        }

        this.borders.push(Border.BorderLeft(this.game, this.i, this.j, 0, true));
        this.borders.push(Border.BorderLeft(this.game, this.i, this.j + 1, 0.5, true));
        this.borders.push(Border.BorderLeft(this.game, this.i, this.j + 2, 0, true));
        let hideUpperSideBorderLeft = true;
        if (this.puzzle.hMapGet(this.i - 1, this.j + 2) === 1) {
            hideUpperSideBorderLeft = false;
        }
        this.borders.push(Border.BorderLeft(this.game, this.i, this.j + 2, 1, hideUpperSideBorderLeft));
        
        this.borders.push(Border.BorderRight(this.game, this.i + this.w - 1, this.j, 0, true));
        this.borders.push(Border.BorderRight(this.game, this.i + this.w - 1, this.j + 1, 0.5, true));
        this.borders.push(Border.BorderRight(this.game, this.i + this.w - 1, this.j + 2, 0, true));
        let hideUpperSideBorderRight = true;
        if (this.puzzle.hMapGet(this.i + this.w, this.j + 2) === 1) {
            hideUpperSideBorderRight = false;
        }
        this.borders.push(Border.BorderRight(this.game, this.i + this.w - 1, this.j + 2, 1, hideUpperSideBorderRight));
        
        for (let i = 0; i < this.w; i++) {
            this.borders.push(Border.BorderTop(this.game, this.i + i, this.j + 2, 0, true));
        }

        this.props.borderLeft = true;
        this.props.borderRight = true;

        /*
        if (this.puzzle.hMapGet(this.i, this.j + 2) != 1 || this.puzzle.hMapGet(this.i + 1, this.j + 2) != 1) {
            this.props.borderTop = true;
            this.borders.push(Border.BorderTop(this.game, this.i, this.j + 2, 1));
            this.borders.push(Border.BorderTop(this.game, this.i + 1, this.j + 2, 1));
        }
        */
    }

    public async instantiate(): Promise<void> {
        let data = await this.game.vertexDataLoader.get("./datas/meshes/ramp.babylon");
        let wallData = Mummu.CloneVertexData(data[0]);
        let floorData = Mummu.CloneVertexData(data[1]);

        for (let i = 0; i < wallData.positions.length / 3; i++) {
            let x = wallData.positions[3 * i];
            if (x > 0) {
                wallData.positions[3 * i] = x + 1.1 * (this.w - 2);
            }
        }

        for (let i = 0; i < floorData.positions.length / 3; i++) {
            let x = floorData.positions[3 * i];
            if (x > 0) {
                floorData.positions[3 * i] = x + 1.1 * (this.w - 2);
            }
        }

        wallData.applyToMesh(this);
        for (let i = 0; i < floorData.positions.length / 3; i++) {
            floorData.uvs[2 * i] = 0.55 * (floorData.positions[3 * i] + this.position.x);
            floorData.uvs[2 * i + 1] = 0.55 * (floorData.positions[3 * i + 2] + this.position.z);
        }
        floorData.applyToMesh(this.floor);

        let showLeftBorder = true;
        for (let j = 0; j < 3; j++) {
            let rampH = (j + 1) / 3;
            let puzzleH = this.puzzle.hMapGet(this.i - 1, this.j + j);
            if (puzzleH > rampH) {
                showLeftBorder = false;
            }
        }

        if (showLeftBorder) {
            let jPlusLeftStack = this.game.puzzle.getGriddedBorderStack(this.i - 1, this.j + 3);
            let jPlusLeftConn = jPlusLeftStack && jPlusLeftStack.array.find(brd => { return brd.position.y === this.position.y + 1 && brd.vertical === true; });
            if (jPlusLeftConn) {
                data[2].applyToMesh(this.builtInBorderLeft);
            }
            else {
                data[3].applyToMesh(this.builtInBorderLeft);
            }
        }
        
        let showRightBorder = true;
        for (let j = 0; j < 3; j++) {
            let rampH = (j + 1) / 3;
            let puzzleH = this.puzzle.hMapGet(this.i + this.w, this.j + j);
            if (puzzleH > rampH) {
                showRightBorder = false;
            }
        }

        if (showRightBorder) {
            let jPlusRightStack = this.game.puzzle.getGriddedBorderStack(this.i + this.w - 1, this.j + 3);
            let jPlusRightConn = jPlusRightStack && jPlusRightStack.array.find(brd => { return brd.position.y === this.position.y + 1 && brd.vertical === true; });
            if (jPlusRightConn) {
                data[2].applyToMesh(this.builtInBorderRight);
            }
            else {
                data[3].applyToMesh(this.builtInBorderRight);
            }
        }

        let m = 0.2;
        let shadowData = Mummu.Create9SliceVertexData({
            width: 1.1 * this.w + 2 * m,
            height: 3.3 + m,
            margin: m,
            cutTop: true
        });
        Mummu.RotateVertexDataInPlace(shadowData, BABYLON.Quaternion.FromEulerAngles(Math.PI * 0.5, 0, 0));
        Mummu.TranslateVertexDataInPlace(shadowData, new BABYLON.Vector3(0.55 * (this.w - 1), 0, 1.1 + 0.5 * m));
        shadowData.applyToMesh(this.shadow);
    }
}

class BuildingBlock {
    
    public static async GenerateVertexDatas(puzzle: Puzzle): Promise<BABYLON.VertexData[]> {
        let walls: BABYLON.VertexData[] = [];
        let woods: BABYLON.VertexData[] = [];
        let floors: BABYLON.VertexData[] = [];

        let boxChuncks = await puzzle.game.vertexDataLoader.get("./datas/meshes/building-unit.babylon");

        let boxesGrid: number[][] = [];
        for (let i = 0; i <= puzzle.w + 1; i++) {
            boxesGrid[i] = [];
            for (let j = 0; j <= puzzle.h + 1; j++) {
                boxesGrid[i][j] = 0;
            }
        }

        for (let i = 0; i < puzzle.w; i++) {
            for (let j = 0; j < puzzle.h; j++) {
                let b = puzzle.buildingBlockGet(i, j);
                if (b > 0) {
                    boxesGrid[1 + i][1 + j] = 1;
                }
            }
        }

        for (let i = 0; i < boxesGrid.length - 1; i++) {
            for (let j = 0; j < boxesGrid[i].length - 1; j++) {
                let wall: BABYLON.VertexData;
                let wood: BABYLON.VertexData;
                let floor: BABYLON.VertexData;
                let ref = boxesGrid[i][j].toFixed(0) + "" + boxesGrid[i + 1][j].toFixed(0) + "" + boxesGrid[i + 1][j + 1].toFixed(0) + "" + boxesGrid[i][j + 1].toFixed(0);

                if (ref === "1000") {
                    wall = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[3]), Math.PI, BABYLON.Axis.Y);
                    wood = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[4]), Math.PI, BABYLON.Axis.Y);
                    floor = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[5]), Math.PI, BABYLON.Axis.Y);
                }
                if (ref === "0100") {
                    wall = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[3]), Math.PI * 0.5, BABYLON.Axis.Y);
                    wood = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[4]), Math.PI * 0.5, BABYLON.Axis.Y);
                    floor = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[5]), Math.PI * 0.5, BABYLON.Axis.Y);
                }
                if (ref === "0010") {
                    wall = Mummu.CloneVertexData(boxChuncks[3]);
                    wood = Mummu.CloneVertexData(boxChuncks[4]);
                    floor = Mummu.CloneVertexData(boxChuncks[5]);
                }
                if (ref === "0001") {
                    wall = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[3]), - Math.PI * 0.5, BABYLON.Axis.Y);
                    wood = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[4]), - Math.PI * 0.5, BABYLON.Axis.Y);
                    floor = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[5]), - Math.PI * 0.5, BABYLON.Axis.Y);
                }
                
                if (ref === "1100") {
                    wall = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[0]), Math.PI, BABYLON.Axis.Y);
                    wood = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[1]), Math.PI, BABYLON.Axis.Y);
                    floor = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[2]), Math.PI, BABYLON.Axis.Y);
                }
                if (ref === "0110") {
                    wall = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[0]), Math.PI * 0.5, BABYLON.Axis.Y);
                    wood = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[1]), Math.PI * 0.5, BABYLON.Axis.Y);
                    floor = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[2]), Math.PI * 0.5, BABYLON.Axis.Y);
                }
                if (ref === "0011") {
                    wall = Mummu.CloneVertexData(boxChuncks[0]);
                    wood = Mummu.CloneVertexData(boxChuncks[1]);
                    floor = Mummu.CloneVertexData(boxChuncks[2]);
                }
                if (ref === "1001") {
                    wall = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[0]), - Math.PI * 0.5, BABYLON.Axis.Y);
                    wood = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[1]), - Math.PI * 0.5, BABYLON.Axis.Y);
                    floor = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[2]), - Math.PI * 0.5, BABYLON.Axis.Y);
                }

                if (ref === "1101") {
                    wall = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[6]), Math.PI, BABYLON.Axis.Y);
                    wood = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[7]), Math.PI, BABYLON.Axis.Y);
                    floor = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[8]), Math.PI, BABYLON.Axis.Y);
                }
                if (ref === "1110") {
                    wall = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[6]), Math.PI * 0.5, BABYLON.Axis.Y);
                    wood = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[7]), Math.PI * 0.5, BABYLON.Axis.Y);
                    floor = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[8]), Math.PI * 0.5, BABYLON.Axis.Y);
                }
                if (ref === "0111") {
                    wall = Mummu.CloneVertexData(boxChuncks[6]);
                    wood = Mummu.CloneVertexData(boxChuncks[7]);
                    floor = Mummu.CloneVertexData(boxChuncks[8]);
                }
                if (ref === "1011") {
                    wall = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[6]), - Math.PI * 0.5, BABYLON.Axis.Y);
                    wood = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[7]), - Math.PI * 0.5, BABYLON.Axis.Y);
                    floor = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[8]), - Math.PI * 0.5, BABYLON.Axis.Y);
                }

                if (ref === "1111") {
                    floor = BABYLON.CreatePlaneVertexData({ size: 1.1 });
                    Mummu.RotateAngleAxisVertexDataInPlace(floor, Math.PI * 0.5, BABYLON.Axis.X);
                    Mummu.TranslateVertexDataInPlace(floor, BABYLON.Vector3.Up());
                }

                if (wall) {
                    Mummu.TranslateVertexDataInPlace(wall, new BABYLON.Vector3((i - 0.5) * 1.1, 0, (j - 0.5) * 1.1));
                    walls.push(wall);
                }
                if (wood) {
                    Mummu.TranslateVertexDataInPlace(wood, new BABYLON.Vector3((i - 0.5) * 1.1, 0, (j - 0.5) * 1.1));
                    woods.push(wood);
                }
                if (floor) {
                    Mummu.TranslateVertexDataInPlace(floor, new BABYLON.Vector3((i - 0.5) * 1.1, 0, (j - 0.5) * 1.1));
                    floors.push(floor);
                }
            }
        }

        if (walls.length > 0) {
            let floorsData = Mummu.MergeVertexDatas(...floors);

            for (let i = 0; i < floorsData.positions.length / 3; i++) {
                floorsData.uvs[2 * i] = 0.55 * floorsData.positions[3 * i];
                floorsData.uvs[2 * i + 1] = 0.55 * floorsData.positions[3 * i + 2];
            }

            return [
                Mummu.MergeVertexDatas(...walls),
                Mummu.MergeVertexDatas(...woods),
                floorsData
            ];
        }
        return [
            new BABYLON.VertexData(),
            new BABYLON.VertexData(),
            new BABYLON.VertexData()
        ];
    }
}

class Bridge extends Build {

    public builtInBorder: BABYLON.Mesh;
    
    constructor(game: Game, props: BuildProps) {
        super(game, props);
        
        this.material = this.game.brickWallMaterial;

        this.builtInBorder = new BABYLON.Mesh("ramp-border");
        this.builtInBorder.parent = this;
    
        this.builtInBorder.material = this.game.blackMaterial;
    }

    public fillHeightmap() {
        for (let ii = 0; ii < 4; ii++) {
            for (let jj = 0; jj < 2; jj++) {
                this.game.puzzle.hMapSet(1, this.i + ii, this.j + jj);
            }
        }
    }

    public regenerateBorders(): void {
        while (this.borders.length > 0) {
            this.borders.pop().dispose();
        }

        this.borders.push(Border.BorderLeft(this.game, this.i, this.j, 0, true));
        this.borders.push(Border.BorderLeft(this.game, this.i, this.j + 1, 0, true));
        this.borders.push(Border.BorderRight(this.game, this.i, this.j, 0, true));
        this.borders.push(Border.BorderRight(this.game, this.i, this.j + 1, 0, true));
        
        this.borders.push(Border.BorderLeft(this.game, this.i + 3, this.j, 0, true));
        this.borders.push(Border.BorderLeft(this.game, this.i + 3, this.j + 1, 0, true));
        this.borders.push(Border.BorderRight(this.game, this.i + 3, this.j, 0, true));
        this.borders.push(Border.BorderRight(this.game, this.i + 3, this.j + 1, 0, true));
        
        this.borders.push(Border.BorderBottom(this.game, this.i, this.j, 0, true));
        this.borders.push(Border.BorderBottom(this.game, this.i + 3, this.j, 0, true));
        
        this.borders.push(Border.BorderTop(this.game, this.i, this.j + 1, 0, true));
        this.borders.push(Border.BorderTop(this.game, this.i + 3, this.j + 1, 0, true));

        this.props.borderLeft = false;
        this.props.borderRight = false;
        this.props.borderBottom = false;
        this.props.borderTop = false;

        if (this.puzzle.hMapGet(this.i - 1, this.j) != 1 || this.puzzle.hMapGet(this.i - 1, this.j + 1) != 1) {
            this.props.borderLeft = true;
            this.borders.push(Border.BorderLeft(this.game, this.i, this.j, 1));
            this.borders.push(Border.BorderLeft(this.game, this.i, this.j + 1, 1));
        }

        if (this.puzzle.hMapGet(this.i + 4, this.j) != 1 || this.puzzle.hMapGet(this.i + 4, this.j + 1) != 1) {
            this.props.borderRight = true;
            this.borders.push(Border.BorderRight(this.game, this.i + 3, this.j, 1));
            this.borders.push(Border.BorderRight(this.game, this.i + 3, this.j + 1, 1));
        }

        if (this.puzzle.hMapGet(this.i, this.j - 1) != 1 || this.puzzle.hMapGet(this.i + 1, this.j - 1) != 1 || this.puzzle.hMapGet(this.i + 2, this.j - 1) != 1 || this.puzzle.hMapGet(this.i + 3, this.j - 1) != 1) {
            this.props.borderBottom = true;
            this.borders.push(Border.BorderBottom(this.game, this.i, this.j, 1));
            this.borders.push(Border.BorderBottom(this.game, this.i + 1, this.j, 1));
            this.borders.push(Border.BorderBottom(this.game, this.i + 2, this.j, 1));
            this.borders.push(Border.BorderBottom(this.game, this.i + 3, this.j, 1));
        }

        if (this.puzzle.hMapGet(this.i, this.j + 2) != 1 || this.puzzle.hMapGet(this.i + 1, this.j + 2) != 1 || this.puzzle.hMapGet(this.i + 2, this.j + 2) != 1 || this.puzzle.hMapGet(this.i + 3, this.j + 2) != 1) {
            this.props.borderTop = true;
            this.borders.push(Border.BorderTop(this.game, this.i, this.j + 1, 1));
            this.borders.push(Border.BorderTop(this.game, this.i + 1, this.j + 1, 1));            
            this.borders.push(Border.BorderTop(this.game, this.i + 2, this.j + 1, 1));
            this.borders.push(Border.BorderTop(this.game, this.i + 3, this.j + 1, 1));
        }
    }

    public async instantiate(): Promise<void> {
        let data = await this.game.vertexDataLoader.get("./datas/meshes/building.babylon");
        data[3].applyToMesh(this);
        let floorData = Mummu.CloneVertexData(data[4]);
        for (let i = 0; i < floorData.positions.length / 3; i++) {
            floorData.uvs[2 * i] = 0.55 * (floorData.positions[3 * i] + this.position.x);
            floorData.uvs[2 * i + 1] = 0.55 * (floorData.positions[3 * i + 2] + this.position.z);
        }
        floorData.applyToMesh(this.floor);
        data[5].applyToMesh(this.builtInBorder);

        let m = 0.2;
        let shadowData = Mummu.Create9SliceVertexData({
            width: 4.4 + 2 * m,
            height: 2.2 + 2 * m,
            margin: m,
            cutRight: this.props.borderRight ? false : true,
            cutLeft: this.props.borderLeft ? false : true
        });
        Mummu.RotateVertexDataInPlace(shadowData, BABYLON.Quaternion.FromEulerAngles(Math.PI * 0.5, 0, 0));
        Mummu.TranslateVertexDataInPlace(shadowData, new BABYLON.Vector3(1.5 * 1.1, 0, 0.5 * 1.1));
        shadowData.applyToMesh(this.shadow);
    }
}