/// <reference path="./Tile.ts"/>

class SwitchBox extends Tile {

    public tileFrame: BABYLON.Mesh;

    constructor(game: Game, props: TileProps) {
        super(game, props);

        this.tileFrame = new BABYLON.Mesh("tile-frame");
        this.tileFrame.parent = this;

        this.tileTop.position.y = 0;

        let frameMaterial = new BABYLON.StandardMaterial("frame-material");
        frameMaterial.diffuseColor = BABYLON.Color3.FromHexString("#624c3c");
        frameMaterial.specularColor.copyFromFloats(0, 0, 0);
        //frameMaterial.emissiveColor.copyFromFloats(0.1, 0.1, 0.1);
        this.tileFrame.material = frameMaterial;
    }

    public async instantiate(): Promise<void> {
        let tileData = await this.game.vertexDataLoader.get("./datas/meshes/switchbox.babylon");
        tileData[0].applyToMesh(this);
        tileData[1].applyToMesh(this.tileFrame);
        tileData[2].applyToMesh(this.tileTop);
    }
}