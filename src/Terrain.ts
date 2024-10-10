class Terrain {

    public border: BABYLON.Mesh;
    public tiles: Tile[] = [];
    public borders: Border[] = [];
    public build: Build[] = [];

    public w: number = 20;
    public h: number = 10;

    public get xMin(): number {
        return - 0.55;
    }

    public get xMax(): number {
        return this.w * 1.1 + 0.55;
    }

    public get zMin(): number {
        return - 0.55;
    }

    public get zMax(): number {
        return this.h * 1.1 + 0.55;
    }

    constructor(public game: Game) {

    }

    public async instantiate(): Promise<void> {
        this.border = new BABYLON.Mesh("border");

        let floor = Mummu.CreateQuad("floor", { width: this.xMax - this.xMin, height: this.zMax - this.xMin, uvInWorldSpace: true, uvSize: 1.1 })
        floor.position.x = 0.5 * (this.xMin + this.xMax);
        floor.position.z = 0.5 * (this.zMin + this.zMax);
        floor.rotation.x = Math.PI * 0.5;
        floor.material = this.game.floorMaterial;

        let top = BABYLON.MeshBuilder.CreateBox("top", { width: this.xMax - this.xMin + 1, height: 0.2, depth: 0.5});
        top.position.x = 0.5 * (this.xMin + this.xMax);
        top.position.y = 0.1;
        top.position.z = this.zMax + 0.25;
        top.material = this.game.blackMaterial;

        let right = BABYLON.MeshBuilder.CreateBox("right", { width: 0.5, height: 0.2, depth: this.zMax - this.zMin});
        right.position.x = this.xMax + 0.25;
        right.position.y = 0.1;
        right.position.z = 0.5 * (this.zMin + this.zMax);
        right.material = this.game.blackMaterial;

        let bottom = BABYLON.MeshBuilder.CreateBox("bottom", { width: this.xMax - this.xMin + 1, height: 0.2, depth: 0.5});
        bottom.position.x = 0.5 * (this.xMin + this.xMax);
        bottom.position.y = 0.1;
        bottom.position.z = this.zMin - 0.25;
        bottom.material = this.game.blackMaterial;

        let left = BABYLON.MeshBuilder.CreateBox("left", { width: 0.5, height: 0.2, depth: this.zMax - this.zMin});
        left.position.x = this.xMin - 0.25;
        left.position.y = 0.1;
        left.position.z = 0.5 * (this.zMin + this.zMax);
        left.material = this.game.blackMaterial;
    }
}