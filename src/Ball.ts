interface BallProps {
    color: TileColor;
}

class Ball extends BABYLON.Mesh {

    public color: TileColor;
    public ballTop: BABYLON.Mesh;
    public shadow: BABYLON.Mesh;
    
    public vZ: number = 1;
    public radius: number = 0.3;

    public leftDown: boolean = false;
    public rightDown: boolean = false;

    public setColor(color: TileColor) {
        this.color = color;
        if (this.ballTop) {
            this.ballTop.material = this.game.colorMaterials[this.color];
        }
    }

    constructor(public game: Game, props: BallProps) {
        super("ball");
        this.rotationQuaternion = BABYLON.Quaternion.Identity();

        this.color = props.color;

        this.ballTop = new BABYLON.Mesh("ball-top");
        this.ballTop.parent = this;

        let boxMaterial = new BABYLON.StandardMaterial("box-material");
        boxMaterial.diffuseColor = BABYLON.Color3.FromHexString("#624c3c");
        boxMaterial.specularColor.copyFromFloats(0, 0, 0);
        //boxMaterial.emissiveColor.copyFromFloats(0.1, 0.1, 0.1);
        this.material = boxMaterial;

        this.ballTop.material = this.game.colorMaterials[this.color];

        this.shadow = new BABYLON.Mesh("shadow");
        this.shadow.position.x = -0.015;
        this.shadow.position.y = 0.1;
        this.shadow.position.z = -0.015;
        this.shadow.parent = this;

        this.shadow.material = this.game.shadowDiscMaterial;

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

        BABYLON.CreateGroundVertexData({ width: 0.8, height: 0.8 }).applyToMesh(this.shadow);
    }

    public falling: boolean = false;
    public inputX: number = 0;
    public inputSpeed: number = 0.1;
    public bounceXValue: number = 0;
    public bounceXTimer: number = 0;
    public bounceXDelay: number = 0.4;

    public update(): void {
        if (this.falling) {
            return;
        }

        if (this.leftDown) {
            this.inputX -= this.inputSpeed;
        }
        else if (this.inputX < 0) {
            this.inputX = Math.min(this.inputX + this.inputSpeed, 0);
        }

        if (this.rightDown) {
            this.inputX += this.inputSpeed;
        }
        else if (this.inputX > 0) {
            this.inputX = Math.max(this.inputX - this.inputSpeed, 0);
        }

        this.inputX = Nabu.MinMax(this.inputX, -1, 1);

        let vX = this.inputX;
        if (this.bounceXTimer > 0) {
            this.bounceXTimer -= 0.01;
            if (this.bounceXValue < 0) {
                vX = Math.min(vX, this.bounceXValue);
            }
            else if (this.bounceXValue > 0) {
                vX = Math.max(vX, this.bounceXValue);
            }
        }

        let speed = new BABYLON.Vector3(vX * Math.sqrt(3), 0, this.vZ);
        speed.normalize().scaleInPlace(1);

        this.position.addInPlace(speed.scale(1/60));
        if (this.position.z + this.radius > this.game.terrain.zMax) {
            this.vZ = -1;
        }
        else if (this.position.z - this.radius < this.game.terrain.zMin) {
            this.vZ = 1;
        }

        if (this.position.x + this.radius > this.game.terrain.xMax) {
            this.bounceXValue = -1;
            this.bounceXTimer = this.bounceXDelay;
        }
        else if (this.position.x - this.radius < this.game.terrain.xMin) {
            this.bounceXValue = 1;
            this.bounceXTimer = this.bounceXDelay;
        }

        let impact = BABYLON.Vector3.Zero();
        for (let i = 0; i < this.game.terrain.borders.length; i++) {
            let border = this.game.terrain.borders[i];
            if (border.collide(this, impact)) {
                let dir = this.position.subtract(impact);
                if (Math.abs(dir.x) > Math.abs(dir.z)) {
                    if (dir.x > 0) {
                        this.bounceXValue = 1;
                        this.bounceXTimer = this.bounceXDelay;
                    }
                    else {
                        this.bounceXValue = -1;
                        this.bounceXTimer = this.bounceXDelay;
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

        for (let i = 0; i < this.game.terrain.tiles.length; i++) {
            let tile = this.game.terrain.tiles[i];
            if (tile instanceof HoleTile) {
                if (tile.fallsIn(this)) {
                    this.falling = true;
                }
            }
            else {
                if (tile.collide(this, impact)) {
                    let dir = this.position.subtract(impact);
                    if (Math.abs(dir.x) > Math.abs(dir.z)) {
                        if (dir.x > 0) {
                            this.bounceXValue = 1;
                            this.bounceXTimer = this.bounceXDelay;
                        }
                        else {
                            this.bounceXValue = -1;
                            this.bounceXTimer = this.bounceXDelay;
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
                    if (tile instanceof SwitchTile) {
                        tile.bump();
                        this.setColor(tile.color);
                    }
                    else if (tile instanceof BlockTile) {
                        if (tile.color === this.color) {
                            tile.shrink().then(() => {
                                tile.dispose();
                            });
                        }
                    }
                    break;
                }
            }
        }

        let ray = new BABYLON.Ray(this.position.add(new BABYLON.Vector3(0, 0.3, 0)), new BABYLON.Vector3(0, -1, 0), 1);
        let hit = this.game.scene.pickWithRay(
            ray,
            (mesh) => {
                return mesh.name === "floor" || mesh.name === "building-floor";
            }
        )
        if (hit.hit) {
            this.position.y = hit.pickedPoint.y;
            let q = Mummu.QuaternionFromYZAxis(hit.getNormal(true), BABYLON.Axis.Z);
            BABYLON.Quaternion.SlerpToRef(this.rotationQuaternion, q, 0.1, this.rotationQuaternion);
        }
    }
}