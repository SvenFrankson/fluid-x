/// <reference path="./Tile.ts"/>

class PushTile extends Tile {

    public tileTop: BABYLON.Mesh;
    public animatePosition = Mummu.AnimationFactory.EmptyVector3Callback;
    public animateRotX = Mummu.AnimationFactory.EmptyNumberCallback;
    public animateRotZ = Mummu.AnimationFactory.EmptyNumberCallback;
    public animateWait = Mummu.AnimationFactory.EmptyVoidCallback;

    constructor(game: Game, props: TileProps) {
        super(game, props);
        this.color = props.color;

        this.animatePosition = Mummu.AnimationFactory.CreateVector3(this, this, "position");
        this.animateRotX = Mummu.AnimationFactory.CreateNumber(this, this.rotation, "x");
        this.animateRotZ = Mummu.AnimationFactory.CreateNumber(this, this.rotation, "z");
        this.animateWait = Mummu.AnimationFactory.CreateWait(this);

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
            dir = dir.clone();
            if (Math.abs(dir.x) > Math.abs(dir.z)) {
                dir.x = Math.sign(dir.x);
                dir.z = 0;
            }
            else {
                dir.x = 0;
                dir.z = Math.sign(dir.z);
            }
    
            let newI = this.i + dir.x;
            let newJ = this.j + dir.z;
    
            if (newI >= 0 && newI < this.game.terrain.w) {
                if (newJ >= 0 && newJ < this.game.terrain.h) {
                    let tileAtDestination = this.game.terrain.tiles.find(tile => {
                        return tile.i === newI && tile.j === newJ && (tile.position.y - this.position.y) < 0.5;
                    })
                    if (tileAtDestination instanceof HoleTile) {
                        let newPos = this.position.clone();
                        newPos.x = (this.i + dir.x * 0.75) * 1.1;
                        newPos.z = (this.j + dir.z * 0.75) * 1.1;
        
                        this.tileState = TileState.Moving;
                        await this.animatePosition(newPos, 0.5, Nabu.Easing.easeOutSquare);

                        if (dir.x === 1) {
                            this.animateRotZ(- Math.PI, 0.4);
                        }
                        else if (dir.x === -1) {
                            this.animateRotZ(Math.PI, 0.4);
                        }
                        if (dir.z === 1) {
                            this.animateRotX(Math.PI, 0.4);
                        }
                        else if (dir.z === -1) {
                            this.animateRotX(- Math.PI, 0.4);
                        }
                        await this.animateWait(0.2);
                        newPos.y -= 5.5
                        await this.animatePosition(newPos, 0.5, Nabu.Easing.easeInSquare);
                        this.dispose();
                    }
                    else if (tileAtDestination) {

                    }
                    else {
                        let newPos = this.position.clone();
                        newPos.x = newI * 1.1;
                        newPos.z = newJ * 1.1;
        
                        this.tileState = TileState.Moving;
                        await this.animatePosition(newPos, 1, Nabu.Easing.easeOutSquare);
                        this.tileState = TileState.Active;
                    }
                }
            }
        }
    }
}