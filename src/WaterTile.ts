/// <reference path="./Tile.ts"/>

class WaterTile extends Tile {

    public get size(): number {
        return this.scaling.y;
    }
    public set size(s: number) {
        this.scaling.copyFromFloats(1, s, 1);
    }

    public path: BABYLON.Vector3[] = [];
    public distFromSource: number = Infinity;
    public iMinusWater: WaterTile;
    public iPlusWater: WaterTile;
    public jMinusWater: WaterTile;
    public jPlusWater: WaterTile;

    public shoreMesh: BABYLON.Mesh;
    public waterMesh: BABYLON.Mesh;
    public floorMesh: BABYLON.Mesh;
    public sculptMesh: BABYLON.Mesh;

    constructor(game: Game, props: TileProps) {
        super(game, props);
        this.color = props.color;

        this.material = this.game.materials.blackMaterial;

        this.renderOutline = true;
        this.outlineColor = BABYLON.Color3.Black();
        this.outlineWidth = 0.01;

        this.shoreMesh = new BABYLON.Mesh("shore");
        this.shoreMesh.parent = this;
        this.shoreMesh.material = this.game.materials.whiteMaterial;

        this.waterMesh = new BABYLON.Mesh("water");
        this.waterMesh.parent = this;
        this.waterMesh.material = this.game.materials.waterMaterial;

        this.floorMesh = new BABYLON.Mesh("floor");
        this.floorMesh.parent = this;
        this.floorMesh.material = this.game.puzzle.floorMaterial;

        let floorData = BABYLON.CreateGroundVertexData({ width: 1.1, height: 1.1 });
        for (let i = 0; i < floorData.positions.length / 3; i++) {
            floorData.uvs[2 * i] = 0.5 * (floorData.positions[3 * i] + this.position.x);
            floorData.uvs[2 * i + 1] = 0.5 * (floorData.positions[3 * i + 2] + this.position.z) - 0.5;
        }
        floorData.applyToMesh(this.floorMesh);
    }

    public disconnect(): void {
        this.distFromSource = Infinity;
        this.iMinusWater = undefined;
        this.iPlusWater = undefined;
        this.jMinusWater = undefined;
        this.jPlusWater = undefined;
        if (this.sculptMesh) {
            this.sculptMesh.dispose();
            this.sculptMesh = undefined;
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

        let downStack = this.game.puzzle.getGriddedStack(this.i, this.j - 1);
        let downWaterTile: WaterTile;
        if (downStack) {
            downWaterTile = downStack.array.find(tile => { return tile instanceof WaterTile}) as WaterTile;
        }
        if (downWaterTile && (!this.jMinusWater || this.jMinusWater.distFromSource > d + 1)) {
            this.jMinusWater = downWaterTile;
            downWaterTile.jPlusWater = this;
            downWaterTile.recursiveConnect(d + 1);
            return;
        }

        let rightStack = this.game.puzzle.getGriddedStack(this.i + 1, this.j);
        let rightWaterTile: WaterTile;
        if (rightStack) {
            rightWaterTile = rightStack.array.find(tile => { return tile instanceof WaterTile}) as WaterTile;
        }
        if (rightWaterTile && (!this.iPlusWater || this.iPlusWater.distFromSource > d + 1)) {
            this.iPlusWater = rightWaterTile;
            rightWaterTile.iMinusWater = this;
            rightWaterTile.recursiveConnect(d + 1);
            return;
        }

        let leftStack = this.game.puzzle.getGriddedStack(this.i - 1, this.j);
        let leftWaterTile: WaterTile;
        if (leftStack) {
            leftWaterTile = leftStack.array.find(tile => { return tile instanceof WaterTile}) as WaterTile;
        }
        if (leftWaterTile && (!this.iMinusWater || this.iMinusWater.distFromSource > d + 1)) {
            this.iMinusWater = leftWaterTile;
            leftWaterTile.iPlusWater = this;
            leftWaterTile.recursiveConnect(d + 1);
            return;
        }

        let upStack = this.game.puzzle.getGriddedStack(this.i, this.j + 1);
        let upWaterTile: WaterTile;
        if (upStack) {
            upWaterTile = upStack.array.find(tile => { return tile instanceof WaterTile}) as WaterTile;
        }
        if (upWaterTile && (!this.jPlusWater || this.jPlusWater.distFromSource > d + 1)) {
            this.jPlusWater = upWaterTile;
            upWaterTile.jMinusWater = this;
            upWaterTile.recursiveConnect(d + 1);
            return;
        }
    }

    public async instantiate(): Promise<void> {
        //await RandomWait();
        await super.instantiate();

        this.path = this._getPath();
        let datas = await this.game.vertexDataLoader.get("./datas/meshes/water-canal.babylon");
        let floorData: BABYLON.VertexData;

        //let DEBUG = BABYLON.CreateLines("debug", { points: this.path, colors: this.path.map(() => { return new BABYLON.Color4(1, 0, 0, 1); })});
        //DEBUG.parent = this;
        //DEBUG.position = this.position.scale(-1);

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
            
            floorData = Mummu.RotateAngleAxisVertexDataInPlace(
                Mummu.CloneVertexData(datas[2]), a, BABYLON.Axis.Y
            )
        }
        else if (!this.iPlusWater && !this.iMinusWater) {
            if (this.distFromSource === 0) {
                if (!this.sculptMesh) {
                    this.sculptMesh = new BABYLON.Mesh("sculpt");
                    this.sculptMesh.parent = this;
                    this.sculptMesh.material = this.game.materials.grayMaterial;

                    this.sculptMesh.renderOutline = true;
                    this.sculptMesh.outlineColor = BABYLON.Color3.Black();
                    this.sculptMesh.outlineWidth = 0.01;
                }
                datas[6].applyToMesh(this);
                datas[7].applyToMesh(this.waterMesh);
                floorData = Mummu.CloneVertexData(datas[8]);
                datas[9].applyToMesh(this.sculptMesh);
            }
            else {
                datas[0].applyToMesh(this);
                datas[1].applyToMesh(this.waterMesh);
                floorData = Mummu.CloneVertexData(datas[2]);
            }
        }
        else if (this.iPlusWater && this.jPlusWater) {
            datas[3].applyToMesh(this);
            datas[4].applyToMesh(this.waterMesh);
            floorData = Mummu.CloneVertexData(datas[5]);
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

            floorData = Mummu.MirrorXVertexDataInPlace(
                Mummu.CloneVertexData(datas[5])
            );
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
            
            floorData = Mummu.RotateAngleAxisVertexDataInPlace(
                Mummu.CloneVertexData(datas[5]), Math.PI * 0.5, BABYLON.Axis.Y
            );
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
            
            floorData = Mummu.MirrorXVertexDataInPlace(
                Mummu.RotateAngleAxisVertexDataInPlace(
                    Mummu.CloneVertexData(datas[5]), Math.PI * 0.5, BABYLON.Axis.Y
                )
            );
        }
        else {
            if (this.distFromSource === 0) {
                if (!this.sculptMesh) {
                    this.sculptMesh = new BABYLON.Mesh("sculpt");
                    this.sculptMesh.parent = this;
                    this.sculptMesh.material = this.game.materials.grayMaterial;

                    this.sculptMesh.renderOutline = true;
                    this.sculptMesh.outlineColor = BABYLON.Color3.Black();
                    this.sculptMesh.outlineWidth = 0.01;
                }
                datas[6].applyToMesh(this);
                datas[7].applyToMesh(this.waterMesh);
                floorData = Mummu.CloneVertexData(datas[8]);
                datas[9].applyToMesh(this.sculptMesh);
            }
            else {
                datas[0].applyToMesh(this);
                datas[1].applyToMesh(this.waterMesh);
                floorData = Mummu.CloneVertexData(datas[2]);
            }
        }

        for (let i = 0; i < floorData.positions.length / 3; i++) {
            floorData.uvs[2 * i] = 0.5 * (floorData.positions[3 * i] + this.position.x);
            floorData.uvs[2 * i + 1] = 0.5 * (floorData.positions[3 * i + 2] + this.position.z) - 0.5;
        }
        floorData.applyToMesh(this.floorMesh);
        this.floorMesh.material = this.game.puzzle.floorMaterial;
    }
}