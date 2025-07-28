/// <reference path="./Tile.ts"/>

class WallTile extends Tile {

    constructor(game: Game, props: TileProps) {
        super(game, props);
        this.color = props.color;

        this.material = this.game.materials.blackMaterial;
    }

    public async instantiate(): Promise<void> {
        //await RandomWait();
        await super.instantiate();
        
        let xPlus = 0;
        let xMinus = 0;
        if (this.i === 0) {
            xMinus = - 0.1;
        }
        else {
            let stack = this.game.puzzle.getGriddedStack(this.i - 1, this.j);
            if (stack && stack.array.find(t => { return t instanceof WallTile})) {
                xMinus = - 0.05;
            }
        }
        if (this.i === this.game.puzzle.w - 1) {
            xPlus = 0.1;
        }
        else {
            let stack = this.game.puzzle.getGriddedStack(this.i + 1, this.j);
            if (stack && stack.array.find(t => { return t instanceof WallTile})) {
                xPlus = 0.05;
            }
        }

        let zPlus = 0;
        let zMinus = 0;
        if (this.j === 0) {
            zMinus = - 0.1;
        }
        else {
            let stack = this.game.puzzle.getGriddedStack(this.i, this.j - 1);
            if (stack && stack.array.find(t => { return t instanceof WallTile})) {
                zMinus = - 0.05;
            }
        }
        if (this.j === this.game.puzzle.h - 1) {
            zPlus = 0.1;
        }
        else {
            let stack = this.game.puzzle.getGriddedStack(this.i, this.j + 1);
            if (stack && stack.array.find(t => { return t instanceof WallTile})) {
                zPlus = 0.05;
            }
        }

        let data = BABYLON.CreateBoxVertexData({ width: 1 + xPlus - xMinus, height: 0.3, depth: 1 + zPlus - zMinus });
        Mummu.TranslateVertexDataInPlace(data, new BABYLON.Vector3(
            xPlus * 0.5 + xMinus * 0.5,
            0.15,
            zPlus * 0.5 + zMinus * 0.5
        ));
        data.applyToMesh(this);
    }
}

class CherryTree extends Tile {

    public tileTop: BABYLON.Mesh;
    public trunk: BABYLON.Mesh;
    public flower: BABYLON.Mesh;

    constructor(game: Game, props: TileProps) {
        super(game, props);

        this.material = this.game.materials.brownMaterial;

        this.renderOutline = true;
        this.outlineColor = BABYLON.Color3.Black();
        this.outlineWidth = 0.02;

        this.tileTop = new BABYLON.Mesh("tile-top");
        this.tileTop.parent = this;
        this.tileTop.position.y = 0.2;
        this.tileTop.material = this.game.materials.whiteMaterial;

        this.trunk = new BABYLON.Mesh("trunk");
        this.trunk.parent = this;
        this.trunk.position.y = 0.2;
        this.trunk.material = this.game.materials.trueWhiteMaterial;
        this.trunk.renderOutline = true;
        this.trunk.outlineColor = BABYLON.Color3.Black();
        this.trunk.outlineWidth = 0.02;

        this.flower = new BABYLON.Mesh("flower");
        this.flower.parent = this;
        this.flower.position.y = 0.2;
        this.flower.material = this.game.materials.trueWhiteMaterial;
        this.flower.renderOutline = true;
        this.flower.outlineColor = BABYLON.Color3.Black();
        this.flower.outlineWidth = 0.02;
    }

    public async instantiate(): Promise<void> {
        await super.instantiate();

        let tileData = CreateBoxFrameVertexData({
            w: 1,
            d: 1,
            h: 0.3,
            thickness: 0.05,
            innerHeight: 0.1, 
            flatShading: false,
            topCap: false,
            bottomCap: true,
        })
        tileData.applyToMesh(this);

        BABYLON.CreateGroundVertexData({ width: 0.9, height: 0.9 }).applyToMesh(this.tileTop);

        let datas = await this.game.vertexDataLoader.get("./datas/meshes/cherry.babylon");
        datas[0].applyToMesh(this.trunk);
        datas[1].applyToMesh(this.flower);
    }
}

class Nobori extends Tile {

    public mast: BABYLON.Mesh;
    public flag: BABYLON.Mesh;

    constructor(game: Game, props: TileProps) {
        super(game, props);

        this.mast = new BABYLON.Mesh("nobori-mast");
        this.mast.parent = this;
        this.mast.position.x = - 0.5;
        this.mast.position.z = 0.5;
        this.mast.material = this.game.materials.brownMaterial;

        this.mast.renderOutline = true;
        this.mast.outlineColor = BABYLON.Color3.Black();
        this.mast.outlineWidth = 0.02;

        this.flag = new BABYLON.Mesh("nobori-flag");
        this.flag.parent = this.mast;
        this.flag.position.x = 0.35;
        this.flag.position.y = 3;
        this.flag.material = this.game.materials.redMaterial;

        this.flag.renderOutline = true;
        this.flag.outlineColor = BABYLON.Color3.Black();
        this.flag.outlineWidth = 0.02;
    }

    public async instantiate(): Promise<void> {
        await super.instantiate();

        if (this.props.noShadow != true) {
            let m = 0.06;
            let shadowData = Mummu.Create9SliceVertexData({
                width: 0.9 + 2 * m,
                height: 0.1 + 2 * m,
                margin: m
            });
            Mummu.RotateVertexDataInPlace(shadowData, BABYLON.Quaternion.FromEulerAngles(Math.PI * 0.5, 0, 0));
            this.shadow.parent = this.mast;
            this.shadow.position.x = this.flag.position.x -0.015;
            this.shadow.position.y = 0.01;
            this.shadow.position.z = - 0.015;
            shadowData.applyToMesh(this.shadow);
        }

        let datas = await this.game.vertexDataLoader.get("./datas/meshes/nobori.babylon");
        datas[0].applyToMesh(this.mast);

        datas[1].applyToMesh(this.flag);
    }
}