class Nobori extends Tile {

    public rightSide: boolean = false;
    public mast: BABYLON.Mesh;
    public flag: BABYLON.Mesh;

    constructor(game: Game, props: NoboriProps) {
        super(game, props);
        this.isDecor = true;

        if (props && props.rightSide) {
            this.rightSide = props.rightSide;
        }

        this.mast = new BABYLON.Mesh("nobori-mast");
        this.mast.parent = this;
        this.mast.position.x = this.rightSide ? 0.5 : - 0.5;
        this.mast.position.z = 0.5;
        this.mast.rotation.y = this.rightSide ? Math.PI : 0;
        this.mast.material = this.game.materials.brownMaterial;

        this.mast.renderOutline = true;
        this.mast.outlineColor = BABYLON.Color3.Black();
        this.mast.outlineWidth = 0.02;

        this.flag = new BABYLON.Mesh("nobori-flag");
        this.flag.parent = this.mast;
        this.flag.position.x = 0.35;
        this.flag.position.y = 3;
        this.flag.material = this.game.materials.noboriMaterials[this.color];

        this.flag.renderOutline = true;
        this.flag.outlineColor = BABYLON.Color3.Black();
        this.flag.outlineWidth = 0.02;
        
        this.game.puzzle.noboris.push(this);
    }

    public async instantiate(): Promise<void> {
        await super.instantiate();

        if (this.props.noShadow != true) {
            let m = 0.06;
            let shadowData = Mummu.Create9SliceVertexData({
                width: 0.9 + 2 * m,
                height: 0.1 + 2 * m,
                margin: m
            });
            Mummu.RotateVertexDataInPlace(shadowData, BABYLON.Quaternion.FromEulerAngles(Math.PI * 0.5, 0, 0));
            this.shadow.parent = this.mast;
            this.shadow.position.x = this.flag.position.x - 0.015;
            this.shadow.position.y = 0.01;
            this.shadow.position.z = - 0.015;
            shadowData.applyToMesh(this.shadow);
        }

        let datas = await this.game.vertexDataLoader.get("./datas/meshes/nobori.babylon");
        this.mast.position.x = this.rightSide ? 0.5 : - 0.5;
        this.mast.rotation.y = this.rightSide ? Math.PI : 0;
        datas[0].applyToMesh(this.mast);
        datas[1].applyToMesh(this.flag);
        this._baseFlagData = Mummu.CloneVertexData(datas[1]);
    }

    public dispose(): void {
        let index = this.game.puzzle.noboris.indexOf(this);
        if (index != -1) {
            this.game.puzzle.noboris.splice(index, 1);
        }
        super.dispose();
    }

    private _baseFlagData: BABYLON.VertexData;
    private _timer: number = 0;

    public update(dt: number): void {
        this._timer += dt;
        if (this._baseFlagData) {
            let data = Mummu.CloneVertexData(this._baseFlagData);
            let positions = data.positions;

            for (let n = 0; n < positions.length / 3; n++) {
                let x = positions[3 * n + 0];
                let y = positions[3 * n + 1];
                let z = positions[3 * n + 2];

                let dX = (1 + Math.sin(y + this._timer) * Math.abs(y)) / 2 * 0.05;
                x += dX;
                positions[3 * n + 0] = x;

                let dZ = Math.sin(6 * x + this._timer) * Math.abs(y) / 2 * 0.05;
                z += dZ;
                dZ = Math.sin(2 * y + this._timer) * Math.abs(y) / 2 * 0.1;
                z += dZ;

                positions[3 * n + 2] = z;
            }
            data.positions = positions;

            BABYLON.VertexData.ComputeNormals(data.positions, data.indices, data.normals);

            data.applyToMesh(this.flag);
        }
    }
}