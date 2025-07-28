class Nobori extends Tile {

    public mast: BABYLON.Mesh;
    public flag: BABYLON.Mesh;

    constructor(game: Game, props: TileProps) {
        super(game, props);

        this.mast = new BABYLON.Mesh("nobori-mast");
        this.mast.parent = this;
        this.mast.position.x = - 0.5;
        this.mast.position.z = 0.5;
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
        datas[0].applyToMesh(this.mast);

        datas[1].applyToMesh(this.flag);
    }
}