interface BuildProps {
    i?: number;
    j?: number;
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
    }
    public get j(): number {
        return Math.round(this.position.z / 1.1);
    }
    public set j(v: number) {
        this.position.z = v * 1.1;
    }

    constructor(public game: Game, protected props: BuildProps) {
        super("tile");
        if (isFinite(props.i)) {
            this.position.x = props.i * 1.1;
        }
        if (isFinite(props.j)) {
            this.position.z = props.j * 1.1;
        }

        this.floor = new BABYLON.Mesh("building-floor");
        this.floor.parent = this;

        this.floor.material = this.game.darkFloorMaterial;

        this.shadow = new BABYLON.Mesh("shadow");
        this.shadow.position.y = 0.01;
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
}

class Ramp extends Build {

    public builtInBorder: BABYLON.Mesh;
    
    constructor(game: Game, props: BuildProps) {
        super(game, props);

        this.scaling.copyFromFloats(1.1, 1, 1.1);
        this.material = this.game.salmonMaterial;

        this.builtInBorder = new BABYLON.Mesh("ramp-border");
        this.builtInBorder.parent = this;

        this.builtInBorder.material = this.game.blackMaterial;
    }

    public fillHeightmap() {
        for (let ii = 0; ii < 2; ii++) {
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
        this.borders.push(Border.BorderLeft(this.game, this.i, this.j + 2, 1, true));
        
        this.borders.push(Border.BorderRight(this.game, this.i + 1, this.j, 0, true));
        this.borders.push(Border.BorderRight(this.game, this.i + 1, this.j + 1, 0.5, true));
        this.borders.push(Border.BorderRight(this.game, this.i + 1, this.j + 2, 0, true));
        this.borders.push(Border.BorderRight(this.game, this.i + 1, this.j + 2, 1, true));
        
        this.borders.push(Border.BorderTop(this.game, this.i, this.j + 2, 0, true));
        this.borders.push(Border.BorderTop(this.game, this.i + 1, this.j + 2, 0, true));

        this.props.borderLeft = true;
        this.props.borderRight = true;

        if (this.puzzle.hMapGet(this.i, this.j + 2) != 1 || this.puzzle.hMapGet(this.i + 1, this.j + 2) != 1) {
            this.props.borderTop = true;
            this.borders.push(Border.BorderTop(this.game, this.i, this.j + 2, 1));
            this.borders.push(Border.BorderTop(this.game, this.i + 1, this.j + 2, 1));
        }
    }

    public async instantiate(): Promise<void> {
        for (let i = 0; i < this.borders.length; i++) {
            await this.borders[i].instantiate();
        }
        let data = await this.game.vertexDataLoader.get("./datas/meshes/building.babylon");
        data[0].applyToMesh(this);
        data[1].applyToMesh(this.floor);
        data[2].applyToMesh(this.builtInBorder);

        let m = 0.2;
        let shadowData = Mummu.Create9SliceVertexData({
            width: 2 + 2 * m,
            height: 3 + m,
            margin: m,
            cutTop: true
        });
        Mummu.RotateVertexDataInPlace(shadowData, BABYLON.Quaternion.FromEulerAngles(Math.PI * 0.5, 0, 0));
        Mummu.TranslateVertexDataInPlace(shadowData, new BABYLON.Vector3(0.5, 0, 1 + 0.5 * m));
        shadowData.applyToMesh(this.shadow);
    }
}

class Box extends Build {
    
    constructor(game: Game, props: BuildProps) {
        super(game, props);

        this.scaling.copyFromFloats(1.1, 1, 1.1);
        this.material = this.game.salmonMaterial;
    }

    public fillHeightmap() {
        for (let ii = 0; ii < 2; ii++) {
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
        
        this.borders.push(Border.BorderRight(this.game, this.i + 1, this.j, 0, true));
        this.borders.push(Border.BorderRight(this.game, this.i + 1, this.j + 1, 0, true));
        
        this.borders.push(Border.BorderBottom(this.game, this.i, this.j, 0, true));
        this.borders.push(Border.BorderBottom(this.game, this.i + 1, this.j, 0, true));
        
        this.borders.push(Border.BorderTop(this.game, this.i, this.j + 1, 0, true));
        this.borders.push(Border.BorderTop(this.game, this.i + 1, this.j + 1, 0, true));

        this.props.borderLeft = false;
        this.props.borderRight = false;
        this.props.borderBottom = false;
        this.props.borderTop = false;

        if (this.puzzle.hMapGet(this.i - 1, this.j) != 1 || this.puzzle.hMapGet(this.i - 1, this.j + 1) != 1) {
            this.props.borderLeft = true;
            this.borders.push(Border.BorderLeft(this.game, this.i, this.j, 1));
            this.borders.push(Border.BorderLeft(this.game, this.i, this.j + 1, 1));
        }

        if (this.puzzle.hMapGet(this.i + 2, this.j) != 1 || this.puzzle.hMapGet(this.i + 2, this.j + 1) != 1) {
            this.props.borderRight = true;
            this.borders.push(Border.BorderRight(this.game, this.i + 1, this.j, 1));
            this.borders.push(Border.BorderRight(this.game, this.i + 1, this.j + 1, 1));
        }

        if (this.puzzle.hMapGet(this.i, this.j - 1) != 1 || this.puzzle.hMapGet(this.i + 1, this.j - 1) != 1) {
            this.props.borderBottom = true;
            this.borders.push(Border.BorderBottom(this.game, this.i, this.j, 1));
            this.borders.push(Border.BorderBottom(this.game, this.i + 1, this.j, 1));
        }

        if (this.puzzle.hMapGet(this.i, this.j + 2) != 1 || this.puzzle.hMapGet(this.i + 1, this.j + 2) != 1) {
            this.props.borderTop = true;
            this.borders.push(Border.BorderTop(this.game, this.i, this.j + 1, 1));
            this.borders.push(Border.BorderTop(this.game, this.i + 1, this.j + 1, 1));

            console.log("box " + this.i + " " + this.j);
            let b1 = this.borders[this.borders.length - 2];
            console.log("b1 " + b1.i + " " + b1.j);
            let b2 = this.borders[this.borders.length - 1];
            console.log("b2 " + b2.i + " " + b2.j);
        }
    }

    public async instantiate(): Promise<void> {
        for (let i = 0; i < this.borders.length; i++) {
            await this.borders[i].instantiate();
        }
        
        let data = await this.game.vertexDataLoader.get("./datas/meshes/building.babylon");
        data[6].applyToMesh(this);
        data[7].applyToMesh(this.floor);

        let m = 0.2;
        let shadowData = Mummu.Create9SliceVertexData({
            width: 2 + 2 * m,
            height: 2 + 2 * m,
            margin: m,
            cutTop: this.props.borderTop ? false : true,
            cutRight: this.props.borderRight ? false : true,
            cutBottom: this.props.borderBottom ? false : true,
            cutLeft: this.props.borderLeft ? false : true,
        });
        Mummu.RotateVertexDataInPlace(shadowData, BABYLON.Quaternion.FromEulerAngles(Math.PI * 0.5, 0, 0));
        Mummu.TranslateVertexDataInPlace(shadowData, new BABYLON.Vector3(0.5, 0, 0.5));
        shadowData.applyToMesh(this.shadow);
    }
}

class Bridge extends Build {

    public builtInBorder: BABYLON.Mesh;
    
    constructor(game: Game, props: BuildProps) {
        super(game, props);
        
        this.scaling.copyFromFloats(1.1, 1, 1.1);
        this.material = this.game.salmonMaterial;

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
            

            console.log("bridge " + this.i + " " + this.j);
            let b1 = this.borders[this.borders.length - 2];
            console.log("b1 " + b1.i + " " + b1.j);
            let b2 = this.borders[this.borders.length - 1];
            console.log("b2 " + b2.i + " " + b2.j);
            
            this.borders.push(Border.BorderTop(this.game, this.i + 2, this.j + 1, 1));
            this.borders.push(Border.BorderTop(this.game, this.i + 3, this.j + 1, 1));
        }
    }

    public async instantiate(): Promise<void> {
        for (let i = 0; i < this.borders.length; i++) {
            await this.borders[i].instantiate();
        }
        
        let data = await this.game.vertexDataLoader.get("./datas/meshes/building.babylon");
        data[3].applyToMesh(this);
        data[4].applyToMesh(this.floor);
        data[5].applyToMesh(this.builtInBorder);

        let m = 0.2;
        let shadowData = Mummu.Create9SliceVertexData({
            width: 4 + 2 * m,
            height: 2 + 2 * m,
            margin: m,
            cutRight: this.props.borderRight ? false : true,
            cutLeft: this.props.borderLeft ? false : true
        });
        Mummu.RotateVertexDataInPlace(shadowData, BABYLON.Quaternion.FromEulerAngles(Math.PI * 0.5, 0, 0));
        Mummu.TranslateVertexDataInPlace(shadowData, new BABYLON.Vector3(1.5, 0, 0.5));
        shadowData.applyToMesh(this.shadow);
    }
}