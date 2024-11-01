/// <reference path="./Tile.ts"/>

class WaterTile extends Tile {

    public path: BABYLON.Vector3[] = [];
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
        this.waterMesh.material = this.game.waterMaterial;

        this.floorMesh = new BABYLON.Mesh("floor");
        this.floorMesh.parent = this;
        this.floorMesh.material = this.game.floorMaterial;
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
        let proj = {
            point: BABYLON.Vector3.Zero(),
            index: 0
        }
        Mummu.ProjectPointOnPathToRef(ball.position, this.path, proj);
        let dist = BABYLON.Vector3.Distance(ball.position, proj.point);
        return dist < ball.radius * 0.5 + 0.3;
    }

    private _getPath(): BABYLON.Vector3[] {
        let entry: BABYLON.Vector3 = (new BABYLON.Vector3(0, 0, 0.55)).add(this.position);
        let exit: BABYLON.Vector3 = (new BABYLON.Vector3(0, 0, - 0.55)).add(this.position);
        if (this.iPlusWater) {
            if (this.iPlusWater.distFromSource < this.distFromSource) {
                entry.copyFrom(this.position).addInPlace(this.iPlusWater.position).scaleInPlace(0.5);
            }
            else {
                exit.copyFrom(this.position).addInPlace(this.iPlusWater.position).scaleInPlace(0.5);
            }
        }
        if (this.iMinusWater) {
            if (this.iMinusWater.distFromSource < this.distFromSource) {
                entry.copyFrom(this.position).addInPlace(this.iMinusWater.position).scaleInPlace(0.5);
            }
            else {
                exit.copyFrom(this.position).addInPlace(this.iMinusWater.position).scaleInPlace(0.5);
            }
        }
        if (this.jPlusWater) {
            if (this.jPlusWater.distFromSource < this.distFromSource) {
                entry.copyFrom(this.position).addInPlace(this.jPlusWater.position).scaleInPlace(0.5);
            }
            else {
                exit.copyFrom(this.position).addInPlace(this.jPlusWater.position).scaleInPlace(0.5);
            }
        }
        if (this.jMinusWater) {
            if (this.jMinusWater.distFromSource < this.distFromSource) {
                entry.copyFrom(this.position).addInPlace(this.jMinusWater.position).scaleInPlace(0.5);
            }
            else {
                exit.copyFrom(this.position).addInPlace(this.jMinusWater.position).scaleInPlace(0.5);
            }
        }

        let dirIn = this.position.subtract(entry).scale(4);
        let dirOut = exit.subtract(this.position).scale(4);

        let path = [entry, exit];
        Mummu.CatmullRomPathInPlace(path, dirIn, dirOut);
        Mummu.CatmullRomPathInPlace(path, dirIn.scale(0.5), dirOut.scale(0.5));
        Mummu.CatmullRomPathInPlace(path, dirIn.scale(0.25), dirOut.scale(0.25));
        Mummu.CatmullRomPathInPlace(path, dirIn.scale(0.1), dirOut.scale(0.1));

        return path;
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

        this.path = this._getPath();
        let datas = await this.game.vertexDataLoader.get("./datas/meshes/water-canal.babylon");

        let DEBUG = BABYLON.CreateLines("debug", { points: this.path, colors: this.path.map(() => { return new BABYLON.Color4(1, 0, 0, 1); })});
        DEBUG.parent = this;
        DEBUG.position = this.position.scale(-1);

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
            ).applyToMesh(this.waterMesh);
            
            Mummu.RotateAngleAxisVertexDataInPlace(
                Mummu.CloneVertexData(datas[2]), a, BABYLON.Axis.Y
            ).applyToMesh(this.floorMesh);
        }
        else if (!this.iPlusWater && !this.iMinusWater) {
            datas[0].applyToMesh(this);
            datas[1].applyToMesh(this.waterMesh);
            datas[2].applyToMesh(this.floorMesh);
        }
        else if (this.iPlusWater && this.jPlusWater) {
            datas[3].applyToMesh(this);
            datas[4].applyToMesh(this.waterMesh);
            datas[5].applyToMesh(this.floorMesh);
        }
        else if (this.iMinusWater && this.jPlusWater) {
            Mummu.MirrorXVertexDataInPlace(
                Mummu.CloneVertexData(datas[3])
            ).applyToMesh(this);

            //Mummu.MirrorXVertexDataInPlace(
            //    Mummu.CloneVertexData(datas[4])
            //).applyToMesh(this.shoreMesh);

            Mummu.MirrorXVertexDataInPlace(
                Mummu.CloneVertexData(datas[4])
            ).applyToMesh(this.waterMesh);

            Mummu.MirrorXVertexDataInPlace(
                Mummu.CloneVertexData(datas[5])
            ).applyToMesh(this.floorMesh);
        }
        else if (this.iPlusWater && this.jMinusWater) {
            Mummu.RotateAngleAxisVertexDataInPlace(
                Mummu.CloneVertexData(datas[3]), Math.PI * 0.5, BABYLON.Axis.Y
            ).applyToMesh(this);
            
            //Mummu.RotateAngleAxisVertexDataInPlace(
            //    Mummu.CloneVertexData(datas[4]), Math.PI * 0.5, BABYLON.Axis.Y
            //).applyToMesh(this.shoreMesh);
            
            Mummu.RotateAngleAxisVertexDataInPlace(
                Mummu.CloneVertexData(datas[4]), Math.PI * 0.5, BABYLON.Axis.Y
            ).applyToMesh(this.waterMesh);
            
            Mummu.RotateAngleAxisVertexDataInPlace(
                Mummu.CloneVertexData(datas[5]), Math.PI * 0.5, BABYLON.Axis.Y
            ).applyToMesh(this.floorMesh);
        }
        else if (this.iMinusWater && this.jMinusWater) {
            Mummu.MirrorXVertexDataInPlace(
                Mummu.RotateAngleAxisVertexDataInPlace(
                    Mummu.CloneVertexData(datas[3]), Math.PI * 0.5, BABYLON.Axis.Y
                )
            ).applyToMesh(this);
            
            //Mummu.MirrorXVertexDataInPlace(
            //    Mummu.RotateAngleAxisVertexDataInPlace(
            //        Mummu.CloneVertexData(datas[4]), Math.PI * 0.5, BABYLON.Axis.Y
            //    )
            //).applyToMesh(this.shoreMesh);
            
            Mummu.MirrorXVertexDataInPlace(
                Mummu.RotateAngleAxisVertexDataInPlace(
                    Mummu.CloneVertexData(datas[4]), Math.PI * 0.5, BABYLON.Axis.Y
                )
            ).applyToMesh(this.waterMesh);
            
            Mummu.MirrorXVertexDataInPlace(
                Mummu.RotateAngleAxisVertexDataInPlace(
                    Mummu.CloneVertexData(datas[5]), Math.PI * 0.5, BABYLON.Axis.Y
                )
            ).applyToMesh(this.floorMesh);
        }
        else {
            datas[0].applyToMesh(this);
            datas[1].applyToMesh(this.waterMesh);
            datas[2].applyToMesh(this.floorMesh);
        }
    }
}