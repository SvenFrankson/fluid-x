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

    public woodChocSound: MySound;
    public woodChocSound2: MySound;
    public fallImpactSound: MySound;

    public ballState: BallState = BallState.Ready;
    public fallOriginPos: BABYLON.Vector3;
    public fallRotAxis: BABYLON.Vector3;
    public fallTimer: number = 0;
    public hole: HoleTile;
    public color: TileColor;
    public ballTop: BABYLON.Mesh;
    public shadow: BABYLON.Mesh;
    public trailMesh: BABYLON.Mesh;
    
    public vZ: number = 1;
    public radius: number = 0.3;

    public leftDown: boolean = false;
    public rightDown: boolean = false;
    public animateSpeed = Mummu.AnimationFactory.EmptyNumberCallback;

    public setColor(color: TileColor) {
        this.color = color;
        if (this.ballTop) {
            this.ballTop.material = this.game.colorMaterials[this.color];
        }
    }

    public get i(): number {
        return Math.round(this.position.x / 1.1);
    }
    public set i(v: number) {
        this.position.x = v * 1.1;
    }
    public get j(): number {
        return Math.round(this.position.z / 1.1);
    }
    public set j(v: number) {
        this.position.z = v * 1.1;
    }

    constructor(public game: Game, props: BallProps) {
        super("ball");
        this.rotationQuaternion = BABYLON.Quaternion.Identity();

        this.color = props.color;

        this.scaling.copyFromFloats(this.radius * 2, this.radius * 2, this.radius * 2);

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

        this.trailMesh = new BABYLON.Mesh("trailMesh");
        this.trailMesh.material = this.game.whiteMaterial;

        this.woodChocSound = this.game.soundManager.createSound("wood-choc", "./datas/sounds/wood-wood-choc.wav", undefined, undefined, { autoplay: false, loop: false }, 2);
        this.woodChocSound2 = this.game.soundManager.createSound("wood-choc", "./datas/sounds/wood-wood-choc-2.wav", undefined, undefined, { autoplay: false, loop: false }, 2);
        this.fallImpactSound = this.game.soundManager.createSound("wood-choc", "./datas/sounds/fall-impact.wav", undefined, undefined, { autoplay: false, loop: false });

        this.animateSpeed = Mummu.AnimationFactory.CreateNumber(this, this, "speed");
        document.addEventListener("keydown", (ev: KeyboardEvent) => {
            if (ev.code === "KeyA" || ev.code === "ArrowLeft") {
                this.leftDown = true;
            }
            else if (ev.code === "KeyD" || ev.code === "ArrowRight") {
                this.rightDown = true;
            }
        })

        document.addEventListener("keyup", (ev: KeyboardEvent) => {
            if (ev.code === "KeyA" || ev.code === "ArrowLeft") {
                this.leftDown = false;
            }
            else if (ev.code === "KeyD" || ev.code === "ArrowRight") {
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

    public playTimer: number = 0;
    public xForce: number = 1;
    public speed: number = 2;
    public moveDir: BABYLON.Vector3 = BABYLON.Vector3.Up();
    public inputSpeed: number = 1000;
    public bounceXValue: number = 0;
    public bounceXTimer: number = 0;
    public bounceXDelay: number = 1.09;

    public trailTimer: number = 0;
    public trailPoints: BABYLON.Vector3[] = [];
    
    public update(dt: number): void {
        let vX = 0;
        if (this.leftDown) {
            vX -= 1;
        }

        if (this.rightDown) {
            vX += 1;
        }

        vX = Nabu.MinMax(vX, -1, 1);

        if (this.ballState != BallState.Ready) {
            this.trailTimer += dt;
            let p = this.absolutePosition.clone().add(Mummu.Rotate(this.moveDir, BABYLON.Axis.Y, Math.PI * 0.5).scale(0.04));
            if (this.trailTimer > 0.05) {
                this.trailTimer = 0;
                let last = this.trailPoints[this.trailPoints.length - 1]
                if (last) {
                    p.scaleInPlace(0.6).addInPlace(last.scale(0.4));
                }

                if (this.trailPoints.length >= 2) {
                    let last = this.trailPoints[this.trailPoints.length - 1];
                    let anteLast = this.trailPoints[this.trailPoints.length - 2];
                    let lastDir = last.subtract(anteLast);
                    let pDir = p.subtract(last);
                    let a = Mummu.AngleFromToAround(lastDir, pDir, BABYLON.Axis.Y);
                    if (a > Math.PI * 0.3) {
                        Mummu.RotateInPlace(pDir, BABYLON.Axis.Y, - (a - Math.PI * 0.3));
                        p.copyFrom(pDir).addInPlace(last);
                    } 
                    if (a < - Math.PI * 0.3) {
                        Mummu.RotateInPlace(pDir, BABYLON.Axis.Y, - (a + Math.PI * 0.3));
                        p.copyFrom(pDir).addInPlace(last);
                    } 
                }

                this.trailPoints.push(p);
                if (this.trailPoints.length > 25) {
                    this.trailPoints.splice(0, 1);
                }
            }
            if (this.trailPoints.length > 2) {
                let points = this.trailPoints.map(pt => { return pt.clone(); });
                Mummu.CatmullRomPathInPlace(points);
                points.push(p);
                let data = Mummu.CreateWireVertexData({
                    path: points,
                    pathUps: points.map(p => { return BABYLON.Axis.Y; }),
                    radiusFunc: (f) => {
                        return 0.08 * f;
                    },
                    color: new BABYLON.Color4(0.4, 0.4, 0.4, 1)
                });
                data.applyToMesh(this.trailMesh);
                this.trailMesh.isVisible = true;
            }
        }

        if (this.ballState === BallState.Ready) {
            if (this.leftDown || this.rightDown) {
                this.ballState = BallState.Move;
                this.bounceXValue = 0;
                this.bounceXTimer = 0;
                this.speed = 0;
                this.animateSpeed(2.2, 0.2, Nabu.Easing.easeInCubic);
                this.game.fadeOutIntro(0.5);
                this.playTimer = 0;
                this.game.setPlayTimer(this.playTimer);
            }
            return;
        }
        else if (this.ballState === BallState.Move || this.ballState === BallState.Done) {
            if (this.ballState === BallState.Done) {
                this.speed *= 0.99;
            }
            else {
                this.playTimer += dt;
                this.game.setPlayTimer(this.playTimer);
            }
            
            this.xForce = 2;
            if (this.bounceXTimer > 0) {
                vX = this.bounceXValue;
                this.bounceXTimer -= dt * this.speed;
                this.xForce = 1;
            }

            this.moveDir.copyFromFloats(
                this.xForce * vX * (1.2 - 2 * this.radius) / 0.55,
                0,
                this.vZ
            ).normalize();
            let speed = this.moveDir.scale(this.speed);

            this.position.addInPlace(speed.scale(dt));
            if (this.position.z + this.radius > this.game.puzzle.zMax) {
                this.vZ = -1;
                this.woodChocSound2.play();
            }
            else if (this.position.z - this.radius < this.game.puzzle.zMin) {
                this.vZ = 1;
                this.woodChocSound2.play();
            }

            if (this.position.x + this.radius > this.game.puzzle.xMax) {
                this.bounceXValue = - 1;
                this.bounceXTimer = this.bounceXDelay;
                this.woodChocSound2.play();
                this.woodChocSound2.play();
            }
            else if (this.position.x - this.radius < this.game.puzzle.xMin) {
                this.bounceXValue = 1;
                this.bounceXTimer = this.bounceXDelay;
                this.woodChocSound2.play();
            }

            let impact = BABYLON.Vector3.Zero();
            for (let i = 0; i < this.game.puzzle.borders.length; i++) {
                let border = this.game.puzzle.borders[i];
                if (border.collide(this, impact)) {
                    let dir = this.position.subtract(impact);
                    if (Math.abs(dir.x) > Math.abs(dir.z)) {
                        if (dir.x > 0) {
                            this.bounceXValue = 1;
                            this.bounceXTimer = this.bounceXDelay;
                        }
                        else {
                            this.bounceXValue = - 1;
                            this.bounceXTimer = this.bounceXDelay;
                        }
                    }
                    else {
                        if (dir.z > 0) {
                            this.vZ = 1;
                        }
                        else {
                            this.vZ = - 1;
                        }
                    }
                    this.woodChocSound2.play();
                    break;
                }
            }

            for (let i = 0; i < this.game.puzzle.tiles.length; i++) {
                let tile = this.game.puzzle.tiles[i];
                if (this.ballState === BallState.Move && tile instanceof HoleTile) {
                    if (tile.fallsIn(this)) {
                        this.ballState = BallState.Fall;
                        this.fallTimer = 0;
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
                                this.woodChocSound.play();
                            }
                            else {
                                if (dir.z > 0) {
                                    this.vZ = 1;
                                }
                                else {
                                    this.vZ = -1;
                                }
                                this.woodChocSound.play();
                            }
                            if (this.ballState === BallState.Move) {
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
                                else if (tile instanceof PushTile) {
                                    tile.push(dir.scale(-1));
                                }
                                break;
                            }
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
                if (this.fallImpactSound) {
                    this.fallImpactSound.play();
                }
                let explosionCloud = new Explosion(this.game);
                let p = this.position.clone();
                p.y = -1;
                explosionCloud.origin.copyFrom(p);
                explosionCloud.setRadius(0.4);
                explosionCloud.color = new BABYLON.Color3(0.5, 0.5, 0.5);
                explosionCloud.lifespan = 4;
                explosionCloud.maxOffset = new BABYLON.Vector3(0, 0.4, 0);
                explosionCloud.tZero = 0.9;
                explosionCloud.boom();

                this.ballState = BallState.Done;
                this.game.puzzle.lose();
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