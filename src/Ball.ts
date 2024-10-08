interface BallProps {
    color: TileColor;
}

class Ball extends BABYLON.Mesh {

    public color: TileColor;
    public ballTop: BABYLON.Mesh;
    public bounceVX: number = 0;
    public vZ: number = 1;
    public radius: number = 0.4;

    public leftDown: boolean = false;
    public rightDown: boolean = false;

    constructor(public game: Game, props: BallProps) {
        super("ball");
        this.color = props.color;

        this.ballTop = new BABYLON.Mesh("ball-top");
        this.ballTop.parent = this;

        let boxMaterial = new BABYLON.StandardMaterial("box-material");
        boxMaterial.diffuseColor = BABYLON.Color3.FromHexString("#624c3c");
        boxMaterial.specularColor.copyFromFloats(0, 0, 0);
        //boxMaterial.emissiveColor.copyFromFloats(0.1, 0.1, 0.1);
        this.material = boxMaterial;

        let BallTopMaterial = new BABYLON.StandardMaterial("Balltop-material");
        BallTopMaterial.specularColor.copyFromFloats(0, 0, 0);
        //BallTopMaterial.emissiveColor.copyFromFloats(0.1, 0.1, 0.1);
        if (this.color === TileColor.North) {
            BallTopMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/red-north-wind.png");
        }
        if (this.color === TileColor.South) {
            BallTopMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/blue-south-wind.png");
        }
        if (this.color === TileColor.East) {
            BallTopMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/yellow-east-wind.png");
        }
        if (this.color === TileColor.West) {
            BallTopMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/green-west-wind.png");
        }
        this.ballTop.material = BallTopMaterial;

        document.addEventListener("keydown", (ev: KeyboardEvent) => {
            if (ev.code === "KeyA") {
                this.leftDown = true;
            }
            else if (ev.code === "KeyD") {
                this.rightDown = true;
            }
        })

        document.addEventListener("keyup", (ev: KeyboardEvent) => {
            if (ev.code === "KeyA") {
                this.leftDown = false;
            }
            else if (ev.code === "KeyD") {
                this.rightDown = false;
            }
        })
    }

    public async instantiate(): Promise<void> {
        let ballDatas = await this.game.vertexDataLoader.get("./datas/meshes/ball.babylon");
        ballDatas[0].applyToMesh(this);

        ballDatas[1].applyToMesh(this.ballTop);
    }

    public update(): void {
        let vX = 0;
        if (Math.abs(this.bounceVX) > 0.01) {
            vX = this.bounceVX;
            if (this.bounceVX < 0 && this.leftDown) {
                vX = -1;
            }
            else if (this.bounceVX > 0 && this.rightDown) {
                vX = 1;
            }
            this.bounceVX -= Math.sign(this.bounceVX) * 0.025;
        }
        else {
            if (this.leftDown) {
                vX -= 1;
            }
            if (this.rightDown) {
                vX += 1;
            }
        }

        let speed = new BABYLON.Vector3(vX, 0, this.vZ);
        speed.normalize().scaleInPlace(2);

        this.position.addInPlace(speed.scale(1/60));
        if (this.position.z + this.radius > this.game.terrain.zMax) {
            this.vZ = -1;
        }
        else if (this.position.z - this.radius < this.game.terrain.zMin) {
            this.vZ = 1;
        }

        if (this.position.x + this.radius > this.game.terrain.xMax) {
            this.bounceVX = -1;
        }
        else if (this.position.x - this.radius < this.game.terrain.xMin) {
            this.bounceVX = 1;
        }

        for (let i = 0; i < this.game.tiles.length; i++) {
            let tile = this.game.tiles[i];
            if (tile.collide(this)) {
                let dir = this.position.subtract(tile.position);
                if (Math.abs(dir.x) > Math.abs(dir.z)) {
                    if (dir.x > 0) {
                        this.bounceVX = 1;
                    }
                    else {
                        this.bounceVX = -1;
                    }
                }
                else {
                    if (dir.z > 0) {
                        this.vZ = 1;
                    }
                    else {
                        this.vZ = -1;
                    }
                }
                break;
            }
        }
    }
}