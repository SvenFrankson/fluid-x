/// <reference path="./Tile.ts"/>

class BlockTile extends Tile {

    public tileTop: BABYLON.Mesh;

    constructor(game: Game, props: TileProps) {
        super(game, props);
        this.color = props.color;

        this.material = this.game.brownMaterial;

        this.tileTop = new BABYLON.Mesh("tile-top");
        this.tileTop.parent = this;

        this.tileTop.material = this.game.colorMaterials[this.color];
    }

    public async instantiate(): Promise<void> {
        await super.instantiate();
        
        let tileData = CreateBoxFrameVertexData({
            w: 1,
            d: 1,
            h: 0.35,
            thickness: 0.05,
            flatShading: true,
            topCap: false,
            bottomCap: true,
        })
        tileData.applyToMesh(this);

        this.tileTop.position.y = 0.3;
        BABYLON.CreateGroundVertexData({ width: 0.9, height: 0.9 }).applyToMesh(this.tileTop);
    }
}