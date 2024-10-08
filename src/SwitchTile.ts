/// <reference path="./Tile.ts"/>

class SwitchTile extends Tile {

    public tileTop: BABYLON.Mesh;
    public tileBottom: BABYLON.Mesh;
    public tileFrame: BABYLON.Mesh;

    constructor(game: Game, props: TileProps) {
        super(game, props);

        this.material = this.game.brownMaterial;

        this.tileFrame = new BABYLON.Mesh("tile-frame");
        this.tileFrame.parent = this;

        this.tileFrame.material = this.game.blackMaterial;

        this.tileTop = new BABYLON.Mesh("tile-top");
        this.tileTop.parent = this;
        
        this.tileTop.material = this.game.colorMaterials[this.color];

        this.tileBottom = new BABYLON.Mesh("tile-bottom");
        this.tileBottom.parent = this;
        
        this.tileBottom.material = this.game.salmonMaterial;
    }

    public async instantiate(): Promise<void> {
        await super.instantiate();
        let tileData = await this.game.vertexDataLoader.get("./datas/meshes/switchbox.babylon");
        tileData[0].applyToMesh(this);
        tileData[1].applyToMesh(this.tileFrame);
        tileData[2].applyToMesh(this.tileTop);
        tileData[3].applyToMesh(this.tileBottom);
    }
}