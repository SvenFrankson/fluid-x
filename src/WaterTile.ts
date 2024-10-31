/// <reference path="./Tile.ts"/>

class WaterTile extends Tile {

    public flowDir: BABYLON.Vector2 = new BABYLON.Vector2(0, - 1);
    public distFromSource: number = Infinity;
    public iMinusWater: WaterTile;
    public iPlusWater: WaterTile;
    public jMinusWater: WaterTile;
    public jPlusWater: WaterTile;

    public shoreMesh: BABYLON.Mesh;
    public waterMesh: BABYLON.Mesh;
    public floorMesh: BABYLON.Mesh;

    constructor(game: Game, props: TileProps) {
        super(game, props);
        this.color = props.color;

        this.material = this.game.blackMaterial;

        this.shoreMesh = new BABYLON.Mesh("shore");
        this.shoreMesh.parent = this;
        this.shoreMesh.material = this.game.whiteMaterial;

        this.waterMesh = new BABYLON.Mesh("water");
        this.waterMesh.parent = this;
        this.waterMesh.material = this.game.tileColorMaterials[TileColor.South];

        this.floorMesh = new BABYLON.Mesh("floor");
        this.floorMesh.parent = this;
        this.floorMesh.material = this.game.floorMaterial;
    }

    public recursiveConnect(d: number = 0): void {
        this.distFromSource = d;

        let right = this.game.puzzle.tiles.find(tile => { return tile instanceof WaterTile && tile.i === (this.i + 1) && tile.j === this.j }) as WaterTile;
        if (right && (!this.iPlusWater || this.iPlusWater.distFromSource > d + 1)) {
            this.iPlusWater = right;
            right.iMinusWater = this;
            right.recursiveConnect(d + 1);
        }

        let left = this.game.puzzle.tiles.find(tile => { return tile instanceof WaterTile && tile.i === (this.i - 1) && tile.j === this.j }) as WaterTile;
        if (left && (!this.iMinusWater || this.iMinusWater.distFromSource > d + 1)) {
            this.iMinusWater = left;
            left.iPlusWater = this;
            left.recursiveConnect(d + 1);
        }

        let up = this.game.puzzle.tiles.find(tile => { return tile instanceof WaterTile && tile.i === this.i && tile.j === (this.j + 1) }) as WaterTile;
        if (up && (!this.jPlusWater || this.jPlusWater.distFromSource > d + 1)) {
            this.jPlusWater = up;
            up.jMinusWater = this;
            up.recursiveConnect(d + 1);
        }

        let down = this.game.puzzle.tiles.find(tile => { return tile instanceof WaterTile && tile.i === this.i && tile.j === (this.j - 1) }) as WaterTile;
        if (down && (!this.jMinusWater || this.jMinusWater.distFromSource > d + 1)) {
            this.jMinusWater = down;
            down.jPlusWater = this;
            down.recursiveConnect(d + 1);
        }
    }

    public async instantiate(): Promise<void> {
        await super.instantiate();

        let datas = await this.game.vertexDataLoader.get("./datas/meshes/water-canal.babylon");

        if (this.iPlusWater && this.iMinusWater) {
            let a = Math.PI * 0.5;
            if (this.iMinusWater.distFromSource < this.distFromSource) {
                a = - Math.PI * 0.5;
            }
            Mummu.RotateAngleAxisVertexDataInPlace(
                Mummu.CloneVertexData(datas[0]), a, BABYLON.Axis.Y
            ).applyToMesh(this);
            
            Mummu.RotateAngleAxisVertexDataInPlace(
                Mummu.CloneVertexData(datas[1]), a, BABYLON.Axis.Y
            ).applyToMesh(this.shoreMesh);
            
            Mummu.RotateAngleAxisVertexDataInPlace(
                Mummu.CloneVertexData(datas[2]), a, BABYLON.Axis.Y
            ).applyToMesh(this.waterMesh);
        }
        else if (!this.iPlusWater && !this.iMinusWater) {
            datas[0].applyToMesh(this);
            datas[1].applyToMesh(this.shoreMesh);
            datas[2].applyToMesh(this.waterMesh);
        }
        else if (this.iPlusWater && this.jPlusWater) {
            datas[3].applyToMesh(this);
            datas[4].applyToMesh(this.shoreMesh);
            datas[5].applyToMesh(this.waterMesh);
            datas[6].applyToMesh(this.floorMesh);
        }
        else if (this.iMinusWater && this.jPlusWater) {
            Mummu.MirrorXVertexDataInPlace(
                Mummu.CloneVertexData(datas[3])
            ).applyToMesh(this);

            Mummu.MirrorXVertexDataInPlace(
                Mummu.CloneVertexData(datas[4])
            ).applyToMesh(this.shoreMesh);

            Mummu.MirrorXVertexDataInPlace(
                Mummu.CloneVertexData(datas[5])
            ).applyToMesh(this.waterMesh);

            Mummu.MirrorXVertexDataInPlace(
                Mummu.CloneVertexData(datas[6])
            ).applyToMesh(this.floorMesh);
        }
        else if (this.iPlusWater && this.jMinusWater) {
            Mummu.RotateAngleAxisVertexDataInPlace(
                Mummu.CloneVertexData(datas[3]), Math.PI * 0.5, BABYLON.Axis.Y
            ).applyToMesh(this);
            
            Mummu.RotateAngleAxisVertexDataInPlace(
                Mummu.CloneVertexData(datas[4]), Math.PI * 0.5, BABYLON.Axis.Y
            ).applyToMesh(this.shoreMesh);
            
            Mummu.RotateAngleAxisVertexDataInPlace(
                Mummu.CloneVertexData(datas[5]), Math.PI * 0.5, BABYLON.Axis.Y
            ).applyToMesh(this.waterMesh);
            
            Mummu.RotateAngleAxisVertexDataInPlace(
                Mummu.CloneVertexData(datas[6]), Math.PI * 0.5, BABYLON.Axis.Y
            ).applyToMesh(this.floorMesh);
        }
        else if (this.iMinusWater && this.jMinusWater) {
            Mummu.MirrorXVertexDataInPlace(
                Mummu.RotateAngleAxisVertexDataInPlace(
                    Mummu.CloneVertexData(datas[3]), Math.PI * 0.5, BABYLON.Axis.Y
                )
            ).applyToMesh(this);
            
            Mummu.MirrorXVertexDataInPlace(
                Mummu.RotateAngleAxisVertexDataInPlace(
                    Mummu.CloneVertexData(datas[4]), Math.PI * 0.5, BABYLON.Axis.Y
                )
            ).applyToMesh(this.shoreMesh);
            
            Mummu.MirrorXVertexDataInPlace(
                Mummu.RotateAngleAxisVertexDataInPlace(
                    Mummu.CloneVertexData(datas[5]), Math.PI * 0.5, BABYLON.Axis.Y
                )
            ).applyToMesh(this.waterMesh);
            
            Mummu.MirrorXVertexDataInPlace(
                Mummu.RotateAngleAxisVertexDataInPlace(
                    Mummu.CloneVertexData(datas[6]), Math.PI * 0.5, BABYLON.Axis.Y
                )
            ).applyToMesh(this.floorMesh);
        }
        else {
            datas[0].applyToMesh(this);
            datas[1].applyToMesh(this.shoreMesh);
            datas[2].applyToMesh(this.waterMesh);
        }
    }
}