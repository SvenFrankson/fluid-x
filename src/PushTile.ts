/// <reference path="./Tile.ts"/>

class PushTile extends Tile {

    public tileTop: BABYLON.Mesh;
    public animatePosition = Mummu.AnimationFactory.EmptyVector3Callback;

    constructor(game: Game, props: TileProps) {
        super(game, props);
        this.color = props.color;

        this.animatePosition = Mummu.AnimationFactory.CreateVector3(this, this, "position");

        this.material = this.game.brownMaterial;

        this.tileTop = new BABYLON.Mesh("tile-top");
        this.tileTop.parent = this;

        let pushTileTopMaterial = new BABYLON.StandardMaterial("push-tile-material");
        pushTileTopMaterial.specularColor.copyFromFloats(0, 0, 0);
        pushTileTopMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/push-tile-top.png");

        this.tileTop.material = pushTileTopMaterial;
    }

    public async instantiate(): Promise<void> {
        await super.instantiate();
        
        let tileData = await this.game.vertexDataLoader.getAtIndex("./datas/meshes/box.babylon");
        tileData.applyToMesh(this);

        this.tileTop.position.y = 0.3;
        BABYLON.CreateGroundVertexData({ width: 0.9, height: 0.9 }).applyToMesh(this.tileTop);
    }

    public async push(dir: BABYLON.Vector3): Promise<void> {
        if (this.tileState === TileState.Active) {
            dir.x = Math.round(dir.x);
            dir.z = Math.round(dir.z);
    
            let newI = this.i + dir.x;
            let newJ = this.j + dir.z;
    
            if (newI >= 0 && newI < this.game.terrain.w) {
                if (newJ >= 0 && newJ < this.game.terrain.h) {
                    let newPos = this.position.clone();
                    newPos.x = newI * 1.1;
                    newPos.z = newJ * 1.1;
    
                    this.tileState = TileState.Moving;
                    await this.animatePosition(newPos, 1);
                    this.tileState = TileState.Active;
                }
            }
        }
    }
}