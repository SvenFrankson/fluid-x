/// <reference path="./Tile.ts"/>

class WallTile extends Tile {

    constructor(game: Game, props: TileProps) {
        super(game, props);
        this.color = props.color;

        this.material = this.game.blackMaterial;
    }

    public async instantiate(): Promise<void> {
        await super.instantiate();
        
        let xPlus = 0;
        let xMinus = 0;
        if (this.i === 0) {
            xMinus = - 0.1;
        }
        else if (this.game.puzzle.tiles.find(tile => { return tile instanceof WallTile && tile.i === (this.i - 1) && tile.j === this.j })) {
            xMinus = - 0.05;
        }
        if (this.i === this.game.puzzle.w - 1) {
            xPlus = 0.1;
        }
        else if (this.game.puzzle.tiles.find(tile => { return tile instanceof WallTile && tile.i === (this.i + 1) && tile.j === this.j })) {
            xPlus = 0.05;
        }

        let zPlus = 0;
        let zMinus = 0;
        if (this.j === 0) {
            zMinus = - 0.1;
        }
        else if (this.game.puzzle.tiles.find(tile => { return tile instanceof WallTile && tile.i === this.i && tile.j === (this.j - 1) })) {
            zMinus = - 0.05;
        }
        if (this.j === this.game.puzzle.h - 1) {
            zPlus = 0.1;
        }
        else if (this.game.puzzle.tiles.find(tile => { return tile instanceof WallTile && tile.i === this.i && tile.j === (this.j + 1) })) {
            zPlus = 0.05;
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

        this.material = this.game.brownMaterial;

        this.renderOutline = true;
        this.outlineColor = BABYLON.Color3.Black();
        this.outlineWidth = 0.02;

        this.tileTop = new BABYLON.Mesh("tile-top");
        this.tileTop.parent = this;
        this.tileTop.position.y = 0.2;
        this.tileTop.material = this.game.whiteMaterial;

        this.trunk = new BABYLON.Mesh("trunk");
        this.trunk.parent = this;
        this.trunk.position.y = 0.2;
        this.trunk.material = this.game.trueWhiteMaterial;
        this.trunk.renderOutline = true;
        this.trunk.outlineColor = BABYLON.Color3.Black();
        this.trunk.outlineWidth = 0.02;

        this.flower = new BABYLON.Mesh("flower");
        this.flower.parent = this;
        this.flower.position.y = 0.2;
        this.flower.material = this.game.trueWhiteMaterial;
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