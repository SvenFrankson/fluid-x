/// <reference path="./Tile.ts"/>

class BlockTile extends Tile {

    public tileTop: BABYLON.Mesh;

    constructor(game: Game, props: TileProps) {
        super(game, props);
        this.color = props.color;

        this.material = this.game.brownMaterial;

        this.tileTop = new BABYLON.Mesh("tile-top");
        this.tileTop.parent = this;
        this.tileTop.material = this.game.tileColorMaterials[this.color];

        this.renderOutline = true;
        this.outlineColor = BABYLON.Color3.Black();
        this.outlineWidth = 0.02;
        
        this.game.puzzle.blockTiles.push(this);
    }

    public async instantiate(): Promise<void> {
        await super.instantiate();
        
        let tileData = CreateBoxFrameVertexData({
            w: 1,
            d: 1,
            h: 0.35,
            thickness: 0.05,
            flatShading: false,
            topCap: false,
            bottomCap: true,
        })
        tileData.applyToMesh(this);

        this.tileTop.position.y = 0.3;
        BABYLON.CreateGroundVertexData({ width: 0.9, height: 0.9 }).applyToMesh(this.tileTop);
    }

    public dispose(): void {
        let index = this.game.puzzle.blockTiles.indexOf(this);
        if (index != -1) {
            this.game.puzzle.blockTiles.splice(index, 1);
        }
        super.dispose();
    }
}