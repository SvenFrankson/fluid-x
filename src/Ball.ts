interface BallProps {
    color: TileColor;
}

enum BallState {
    Ready,
    Move,
    Fall,
    Done
}

class Ball extends BABYLON.Mesh {

    public ballState: BallState = BallState.Ready;
    public fallOriginPos: BABYLON.Vector3;
    public fallRotAxis: BABYLON.Vector3;
    public fallTimer: number = 0;
    public hole: HoleTile;
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

        let inputLeft = document.querySelector("#input-left");
        if (inputLeft) {
            inputLeft.addEventListener("pointerdown", () => {
                this.leftDown = true;
            })
            inputLeft.addEventListener("pointerup", () => {
                this.leftDown = false;
            })
        }

        let inputRight = document.querySelector("#input-right");
        if (inputRight) {
            inputRight.addEventListener("pointerdown", () => {
                this.rightDown = true;
            })
            inputRight.addEventListener("pointerup", () => {
                this.rightDown = false;
            })
        }
    }

    public async instantiate(): Promise<void> {
        let ballDatas = await this.game.vertexDataLoader.get("./datas/meshes/ball.babylon");
        ballDatas[0].applyToMesh(this);

        ballDatas[1].applyToMesh(this.ballTop);

        BABYLON.CreateGroundVertexData({ width: 0.8, height: 0.8 }).applyToMesh(this.shadow);
    }

    public speed: number = 3;
    public inputSpeed: number = 1000;
    public bounceXValue: number = 0;
    public bounceXTimer: number = 0;
    public bounceXDelay: number = 0.84;
    

    public update(dt: number): void {
        Mummu.DrawDebugPoint(this.position.add(new BABYLON.Vector3(0, 0.05, 0)), 600, BABYLON.Color3.Black(), 0.05);
        let vX = 0;
        if (this.leftDown) {
            vX -= 1;
        }

        if (this.rightDown) {
            vX += 1;
        }

        vX = Nabu.MinMax(vX, -1, 1);

        
        if (this.ballState === BallState.Ready) {
            if (this.leftDown || this.rightDown) {
                this.ballState = BallState.Move;
            }
            return;
        }
        else if (this.ballState === BallState.Move) {

            if (this.bounceXTimer > 0) {
                vX = this.bounceXValue;
                this.bounceXTimer -= dt * this.speed;
            }

            let speed = new BABYLON.Vector3(vX * 13 / 11, 0, this.vZ);
            speed.normalize().scaleInPlace(this.speed);

            this.position.addInPlace(speed.scale(dt));
            if (this.position.z + this.radius > this.game.terrain.zMax) {
                this.vZ = -1;
            }
            else if (this.position.z - this.radius < this.game.terrain.zMin) {
                this.vZ = 1;
            }

            if (this.position.x + this.radius > this.game.terrain.xMax) {
                this.bounceXValue = - 1;
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
                            this.position.x = impact.x + this.radius;
                            this.bounceXValue = 1;
                            this.bounceXTimer = this.bounceXDelay;
                        }
                        else {
                            this.position.x = impact.x - this.radius;
                            this.bounceXValue = - 1;
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
                        this.ballState = BallState.Fall;
                        this.hole = tile;
                        return;
                    }
                }
                else {
                    if (tile.tileState === TileState.Active) {
                        if (tile.collide(this, impact)) {
                            let dir = this.position.subtract(impact);
                            if (Math.abs(dir.x) > Math.abs(dir.z)) {
                                if (dir.x > 0) {
                                    this.position.x = impact.x + this.radius;
                                    this.bounceXValue = 1;
                                    this.bounceXTimer = this.bounceXDelay;
                                }
                                else {
                                    this.position.x = impact.x - this.radius;
                                    this.bounceXValue = - 1;
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
                                    tile.tileState = TileState.Dying;
                                    tile.shrink().then(() => {
                                        tile.dispose();
                                    });
                                }
                            }
                            break;
                        }
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
        else if (this.ballState === BallState.Fall) {
            let bottom = this.hole.position.clone();
            bottom.y -= 5.5;
            if (this.fallTimer === 0) {
                let dHole = bottom.subtract(this.position);
                this.fallOriginPos = this.position.clone();
                this.fallRotAxis = BABYLON.Vector3.Cross(BABYLON.Axis.Y, dHole).normalize();
            }

            this.fallTimer += dt;

            if (this.fallTimer > 1) {
                this.ballState = BallState.Done;
                return;
            }

            let f = Math.pow(this.fallTimer, 0.9);
            this.position.x = this.fallOriginPos.x * (1 - f) + bottom.x * f;
            this.position.z = this.fallOriginPos.z * (1 - f) + bottom.z * f;
            f = this.fallTimer * this.fallTimer;
            this.position.y = this.fallOriginPos.y * (1 - f) + bottom.y * f;

            this.rotate(this.fallRotAxis, 2 * Math.PI * dt, BABYLON.Space.WORLD);
        }
    }
}