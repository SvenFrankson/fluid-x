enum TileColor {
    North,
    East,
    South,
    West
}

interface TileProps {
    color: TileColor;
    i?: number;
    j?: number;
}

class Tile extends BABYLON.Mesh {

    public color: TileColor;
    public tileTop: BABYLON.Mesh;

    constructor(public game: Game, props: TileProps) {
        super("tile");
        this.color = props.color;
        if (isFinite(props.i)) {
            this.position.x = props.i * 1.1;
        }
        if (isFinite(props.j)) {
            this.position.z = props.j * 1.1;
        }

        this.tileTop = new BABYLON.Mesh("tile-top");
        this.tileTop.parent = this;
        this.tileTop.position.y = 0.3;

        let boxMaterial = new BABYLON.StandardMaterial("box-material");
        boxMaterial.diffuseColor = BABYLON.Color3.FromHexString("#e3cfb4");
        boxMaterial.specularColor.copyFromFloats(0, 0, 0);
        //boxMaterial.emissiveColor.copyFromFloats(0.1, 0.1, 0.1);
        this.material = boxMaterial;

        let tileTopMaterial = new BABYLON.StandardMaterial("tiletop-material");
        tileTopMaterial.specularColor.copyFromFloats(0, 0, 0);
        //tileTopMaterial.emissiveColor.copyFromFloats(0.1, 0.1, 0.1);
        if (this.color === TileColor.North) {
            tileTopMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/red-north-wind.png");
        }
        if (this.color === TileColor.South) {
            tileTopMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/blue-south-wind.png");
        }
        if (this.color === TileColor.East) {
            tileTopMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/yellow-east-wind.png");
        }
        if (this.color === TileColor.West) {
            tileTopMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/green-west-wind.png");
        }
        this.tileTop.material = tileTopMaterial;
    }

    public async instantiate(): Promise<void> {
        let tileData = this.game.vertexDataLoader.getAtIndex("./datas/meshes/box.babylon");
        (await tileData).applyToMesh(this);

        BABYLON.CreateGroundVertexData({ width: 0.9, height: 0.9 }).applyToMesh(this.tileTop);
    }

    public collide(ball: Ball): boolean {
        if (ball.position.x + ball.radius < this.position.x - 0.5) {
            return false;
        }
        if (ball.position.x - ball.radius > this.position.x + 0.5) {
            return false;
        }
        if (ball.position.z + ball.radius < this.position.z - 0.5) {
            return false;
        }
        if (ball.position.z - ball.radius > this.position.z + 0.5) {
            return false;
        }
        return true;
    }
}