/// <reference path="./Tile.ts"/>

class WallTile extends Tile {

    constructor(game: Game, props: TileProps) {
        super(game, props);
        this.color = props.color;

        this.material = this.game.blackMaterial;
    }

    public async instantiate(): Promise<void> {
        await super.instantiate();
        
        let data = BABYLON.CreateBoxVertexData({ width: 1.1, height: 0.3, depth: 1.1 });
        Mummu.TranslateVertexDataInPlace(data, new BABYLON.Vector3(0, 0.15, 0));
        data.applyToMesh(this);
    }
}