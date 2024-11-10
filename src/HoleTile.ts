/// <reference path="./Tile.ts"/>

class HoleTile extends Tile {

    public covered: boolean = false;
    public covers: BABYLON.Mesh[];

    constructor(game: Game, props: TileProps) {
        props.noShadow = true;
        super(game, props);
        this.color = props.color;
    }

    public async instantiate(): Promise<void> {
        await super.instantiate();
        
        if (this.covered) {
            if (!this.covers) {
                let datas = await this.game.vertexDataLoader.get("./datas/meshes/cracked-tile.babylon");
                let r = Math.floor(4 * Math.random()) * Math.PI * 0.5;

                this.covers = [];
                for (let n = 0; n < 3; n++) {
                    this.covers[n] = new BABYLON.Mesh("cover");
                    this.covers[n].parent = this;
                    this.covers[n].material = this.game.floorMaterial;

                    let data = Mummu.CloneVertexData(datas[n]);
                    Mummu.RotateAngleAxisVertexDataInPlace(data, r, BABYLON.Axis.Y);
                    for (let i = 0; i < data.positions.length / 3; i++) {
                        data.uvs[2 * i] = 0.5 * (data.positions[3 * i] + this.position.x);
                        data.uvs[2 * i + 1] = 0.5 * (data.positions[3 * i + 2] + this.position.z) - 0.5;
                    }
                    data.applyToMesh(this.covers[n]);
                }
            }
        }
    }

    public fallsIn(ball: Ball): boolean {
        if (ball.position.x < this.position.x - 0.55) {
            return false;
        }
        if (ball.position.x > this.position.x + 0.55) {
            return false;
        }
        if (ball.position.z < this.position.z - 0.55) {
            return false;
        }
        if (ball.position.z > this.position.z + 0.55) {
            return false;
        }
        return true;
    }
}