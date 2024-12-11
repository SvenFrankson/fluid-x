interface BallProps {
    color: TileColor;
}

enum BallState {
    Ready,
    Move,
    Fall,
    Split,
    Flybacking,
    Wining,
    Done
}

class Ball extends BABYLON.Mesh {

    public woodChocSound: MySound;
    public woodChocSound2: MySound;
    public fallImpactSound: MySound;

    public leftArrow: BABYLON.Mesh;
    public get leftArrowSize(): number {
        return this.leftArrow.scaling.x;
    }
    public set leftArrowSize(v: number) {
        this.leftArrow.scaling.copyFromFloats(v, v, v);
    }
    public rightArrow: BABYLON.Mesh;
    public get rightArrowSize(): number {
        return this.rightArrow.scaling.x;
    }
    public set rightArrowSize(v: number) {
        this.rightArrow.scaling.copyFromFloats(v, v, v);
    }
    public ballState: BallState = BallState.Ready;
    public fallOriginPos: BABYLON.Vector3;
    public fallRotAxis: BABYLON.Vector3;
    public fallTimer: number = 0;
    public hole: HoleTile;
    public water: WaterTile;
    public color: TileColor;
    public ballTop: BABYLON.Mesh;
    public shadow: BABYLON.Mesh;
    public trailMesh: BABYLON.Mesh;
    public trailColor: BABYLON.Color4 = new BABYLON.Color4(0, 0, 0, 0);

    public leftBox: BABYLON.Mesh;
    public leftTop: BABYLON.Mesh;
    public rightBox: BABYLON.Mesh;
    public rightTop: BABYLON.Mesh;
    
    public canBoost: boolean = true;
    private _boost: boolean = false;
    public get boost(): boolean {
        return this._boost;
    }
    public set boost(v: boolean) {
        this._boost = v;

        this.shadow.material = this._boost ? this.game.materials.lightDiscMaterial : this.game.materials.shadowDiscMaterial;

        let inputBoost = document.querySelector("#input-boost") as HTMLButtonElement;
        if (inputBoost) {
            if (this._boost) {
                inputBoost.classList.add("active");
            }
            else {
                inputBoost.classList.remove("active");
            }
        }
    }
    public nominalSpeed: number = 2.3;
    public vZ: number = 1;
    public radius: number = 0.25;
    public bounceXDelay: number = 0.93;
    public bounceXDelayWall: number = 0.7;
    public xForceAccelDelay: number = 0.8 * this.bounceXDelay;

    private _loseTimout: number = 0;
    public isControlLocked: boolean = false;
    private _lockControlTimout: number = 0;
    public lockControl(duration: number = 0.2): void {
        clearTimeout(this._lockControlTimout);
        this.isControlLocked = true;
        this._lockControlTimout = setTimeout(() => {
            this.isControlLocked = false;
        }, duration * 1000);
    }
    public leftPressed: number = 0;
    public rightPressed: number = 0;
    public upPressed: number = 0;
    public downPressed: number = 0;
    public animateSpeed = Mummu.AnimationFactory.EmptyNumberCallback;

    public setColor(color: TileColor) {
        this.color = color;
        if (this.ballTop) {
            this.ballTop.material = this.game.materials.tileColorShinyMaterials[this.color];
        }
        if (this.leftTop) {
            this.leftTop.material = this.game.materials.tileColorShinyMaterials[this.color];
        }
        if (this.rightTop) {
            this.rightTop.material = this.game.materials.tileColorShinyMaterials[this.color];
        }
    }

    public get i(): number {
        return Math.round(this.position.x / 1.1);
    }
    public set i(v: number) {
        this.position.x = v * 1.1;

        this.rightArrow.position.copyFrom(this.position);
        this.rightArrow.position.y += 0.1;
        this.leftArrow.position.copyFrom(this.position);
        this.leftArrow.position.y += 0.1;
    }
    public get j(): number {
        return Math.round(this.position.z / 1.1);
    }
    public set j(v: number) {
        this.position.z = v * 1.1;

        this.rightArrow.position.copyFrom(this.position);
        this.rightArrow.position.y += 0.1;
        this.leftArrow.position.copyFrom(this.position);
        this.leftArrow.position.y += 0.1;
    }

    public get game(): Game {
        return this.puzzle.game;
    }

    constructor(public puzzle: Puzzle, props: BallProps, public ballIndex: number = 0) {
        super("ball");

        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.animContainer = new BABYLON.Mesh("anim-container");
        //this.animContainer = Mummu.DrawDebugPoint(BABYLON.Vector3.Zero(), Infinity, BABYLON.Color3.Red(), 1);
        this.animPos = Mummu.AnimationFactory.CreateVector3(this.animContainer, this.animContainer, "position");
        this.animWinTrailRadius = Mummu.AnimationFactory.CreateNumber(this, this, "winTrailRadius");
        this.animRotX = Mummu.AnimationFactory.CreateNumber(this.animContainer, this.animContainer.rotation, "x");
        this.animRotY = Mummu.AnimationFactory.CreateNumber(this.animContainer, this.animContainer.rotation, "y");
        this.animRotZ = Mummu.AnimationFactory.CreateNumber(this.animContainer, this.animContainer.rotation, "z");

        this.color = props.color;

        this.scaling.copyFromFloats(this.radius * 2, this.radius * 2, this.radius * 2);

        this.ballTop = new BABYLON.Mesh("ball-top");
        this.ballTop.position.y = 0.3;
        this.ballTop.parent = this;

        this.material = this.game.materials.brownMaterial;

        this.renderOutline = true;
        this.outlineColor = BABYLON.Color3.Black();
        this.outlineWidth = 0.02 / (this.radius * 2);

        this.ballTop.material = this.game.materials.tileColorShinyMaterials[this.color];

        this.shadow = new BABYLON.Mesh("shadow");
        this.shadow.position.x = 0;
        this.shadow.position.y = 0.05;
        this.shadow.position.z = 0;
        this.shadow.parent = this;

        this.shadow.material = this.game.materials.shadowDiscMaterial;
        
        this.leftArrow = new BABYLON.Mesh("left-arrow");
        this.leftArrow.position.y = 0.1;
        this.leftArrow.rotation.y = Math.PI;
        this.leftArrow.material = this.game.materials.puckSideMaterial;
        this.leftArrowSize = 0.5;

        this.rightArrow = new BABYLON.Mesh("right-arrow");
        this.rightArrow.position.y = 0.1;
        this.rightArrow.material = this.game.materials.puckSideMaterial;
        this.rightArrowSize = 0.5;

        this.trailMesh = new BABYLON.Mesh("trailMesh");
        this.trailMesh.material = this.game.materials.whiteMaterial;
        
        this.leftBox = new BABYLON.Mesh("left-box");
        this.leftBox.parent = this;
        this.leftBox.material = this.game.materials.brownMaterial;
        this.leftBox.isVisible = false;

        this.leftBox.renderOutline = true;
        this.leftBox.outlineColor = BABYLON.Color3.Black();
        this.leftBox.outlineWidth = 0.02 / (this.radius * 2);
        
        this.leftTop = new BABYLON.Mesh("left-top");
        this.leftTop.parent = this.leftBox;
        this.leftTop.position.y = 0.3;
        this.leftTop.material = this.game.materials.tileColorShinyMaterials[this.color];
        this.leftTop.isVisible = false;
        
        this.rightBox = new BABYLON.Mesh("right-box");
        this.rightBox.parent = this;
        this.rightBox.material = this.game.materials.brownMaterial;
        this.rightBox.isVisible = false;

        this.rightBox.renderOutline = true;
        this.rightBox.outlineColor = BABYLON.Color3.Black();
        this.rightBox.outlineWidth = 0.02 / (this.radius * 2);
        
        this.rightTop = new BABYLON.Mesh("right-top");
        this.rightTop.parent = this.rightBox;
        this.rightTop.position.y = 0.3;
        this.rightTop.material = this.game.materials.tileColorShinyMaterials[this.color];
        this.rightTop.isVisible = false;

        this.woodChocSound = this.game.soundManager.createSound("ball-wood-choc", "./datas/sounds/wood-wood-choc.wav", undefined, undefined, { autoplay: false, loop: false }, 2);
        this.woodChocSound2 = this.game.soundManager.createSound("ball-wood-choc-2", "./datas/sounds/wood-wood-choc-2.wav", undefined, undefined, { autoplay: false, loop: false }, 2);
        this.fallImpactSound = this.game.soundManager.createSound("ball-fall-impact", "./datas/sounds/fall-impact.wav", undefined, undefined, { autoplay: false, loop: false });

        this.animateSpeed = Mummu.AnimationFactory.CreateNumber(this, this, "speed");

        if (this.ballIndex === 0) {
            this.connectMouse();
            
            let inputLeft = document.querySelector("#input-left");
            if (inputLeft) {
                inputLeft.addEventListener("pointerdown", () => {
                    this.leftPressed = 1;
                    this.mouseInControl = false;
                })
                inputLeft.addEventListener("pointerup", () => {
                    this.mouseInControl = false;
                    this.leftPressed = 0;
                })
            }
    
            let inputRight = document.querySelector("#input-right");
            if (inputRight) {
                inputRight.addEventListener("pointerdown", () => {
                    this.mouseInControl = false;
                    this.rightPressed = 1;
                })
                inputRight.addEventListener("pointerup", () => {
                    this.mouseInControl = false;
                    this.rightPressed = 0;
                })
            }
    
            let inputBoost = document.querySelector("#input-boost") as HTMLButtonElement;
            inputBoost.addEventListener("pointerdown", () => {
                if (this.boost) {
                    this.boost = false;
                }
                else {
                    this.boost = true;
                }
            })
    
            this.game.canvas.addEventListener("pointerdown", this.pointerDown);

            document.addEventListener("keydown", (ev: KeyboardEvent) => {
                if (ev.code === "KeyW") {
                    if (this.wasdCanControl) {
                        if (this.mouseCanControl) {
                            this.mouseInControl = false;
                        }
                        this.upPressed = 1;
                    }
                }
                if (ev.code === "ArrowUp") {
                    if (this.arrowCanControl) {
                        if (this.mouseCanControl) {
                            this.mouseInControl = false;
                        }
                        this.upPressed = 1;
                    }
                }

                if (ev.code === "KeyA") {
                    if (this.wasdCanControl) {
                        if (this.mouseCanControl) {
                            this.mouseInControl = false;
                        }
                        this.leftPressed = 1;
                    }
                }
                if (ev.code === "ArrowLeft") {
                    if (this.arrowCanControl) {
                        if (this.mouseCanControl) {
                            this.mouseInControl = false;
                        }
                        this.leftPressed = 1;
                    }
                }
                if (ev.code === "KeyS") {
                    if (this.wasdCanControl) {
                        if (this.mouseCanControl) {
                            this.mouseInControl = false;
                        }
                        this.downPressed = 1;
                    }
                }
                if (ev.code === "ArrowDown") {
                    if (this.arrowCanControl) {
                        if (this.mouseCanControl) {
                            this.mouseInControl = false;
                        }
                        this.downPressed = 1;
                    }
                }
                
                if (ev.code === "KeyD") {
                    if (this.wasdCanControl) {
                        if (this.mouseCanControl) {
                            this.mouseInControl = false;
                        }
                        this.rightPressed = 1;
                    }
                }
                if (ev.code === "ArrowRight") {
                    if (this.arrowCanControl) {
                        if (this.mouseCanControl) {
                            this.mouseInControl = false;
                        }
                        this.rightPressed = 1;
                    }
                }
                if (ev.code === "Space") {
                    if (this.wasdCanControl && this.canBoost) {
                        this.boost = true;
                    }
                }
            })
    
            document.addEventListener("keyup", (ev: KeyboardEvent) => {
                if (ev.code === "KeyW") {
                    if (this.wasdCanControl) {
                        if (this.mouseCanControl) {
                            this.mouseInControl = false;
                        }
                        this.upPressed = 0;
                    }
                }
                if (ev.code === "ArrowUp") {
                    if (this.arrowCanControl) {
                        if (this.mouseCanControl) {
                            this.mouseInControl = false;
                        }
                        this.upPressed = 0;
                    }
                }

                if (ev.code === "KeyA") {
                    if (this.wasdCanControl) {
                        if (this.mouseCanControl) {
                            this.mouseInControl = false;
                        }
                        this.leftPressed = 0;
                    }
                }
                if (ev.code === "ArrowLeft") {
                    if (this.arrowCanControl) {
                        if (this.mouseCanControl) {
                            this.mouseInControl = false;
                        }
                        this.leftPressed = 0;
                    }
                }
                if (ev.code === "KeyS") {
                    if (this.wasdCanControl) {
                        if (this.mouseCanControl) {
                            this.mouseInControl = false;
                        }
                        this.downPressed = 0;
                    }
                }
                if (ev.code === "ArrowDown") {
                    if (this.arrowCanControl) {
                        if (this.mouseCanControl) {
                            this.mouseInControl = false;
                        }
                        this.downPressed = 0;
                    }
                }
                
                if (ev.code === "KeyD") {
                    if (this.wasdCanControl) {
                        if (this.mouseCanControl) {
                            this.mouseInControl = false;
                        }
                        this.rightPressed = 0;
                    }
                }
                if (ev.code === "ArrowRight") {
                    if (this.arrowCanControl) {
                        if (this.mouseCanControl) {
                            this.mouseInControl = false;
                        }
                        this.rightPressed = 0;
                    }
                }
                if (ev.code === "Space") {
                    if (this.wasdCanControl && this.canBoost) {
                        this.boost = false;
                    }
                }
            })
        }
        
    }

    public connectMouse(): void {
        this.game.canvas.addEventListener("pointerdown", this.mouseDown);
        this.game.canvas.addEventListener("pointerup", this.mouseUp);
        this.game.canvas.addEventListener("pointerleave", this.mouseUp);
        this.game.canvas.addEventListener("pointerout", this.mouseUp);
    }

    public get wasdCanControl(): boolean {
        return this.puzzle.ballsCount === 1 || this.ballIndex === 0;
    }
    public get arrowCanControl(): boolean {
        return this.puzzle.ballsCount === 1 || this.ballIndex === 1;
    }
    public get mouseCanControl(): boolean {
        return (this.puzzle.ballsCount === 1 || this.ballIndex === 0);
    }
    public mouseInControl: boolean = false;
    private _pointerDown: boolean = false;
    public pointerDown = (ev: PointerEvent) => {
        if (this.game.mode === GameMode.Preplay) {
            if (!this.game.router.tutoPage.shown) {
                this.puzzle.skipIntro();
                this.lockControl(0.2);
            }
        }
    }
    public mouseDown = (ev: PointerEvent) => {
        if (this.mouseCanControl) {
            this.mouseInControl = true;
            this._pointerDown = true;
        }
    }

    public mouseUp = (ev: PointerEvent) => {
        if (this.mouseCanControl) {
            this.mouseInControl = true;
            this._pointerDown = false;
        }
    }

    public async instantiate(): Promise<void> {
        //await RandomWait();
        let ballDatas: BABYLON.VertexData[];
        ballDatas = await this.game.vertexDataLoader.get("./datas/meshes/ball.babylon");
        
        ballDatas[0].applyToMesh(this);
        ballDatas[1].applyToMesh(this.ballTop);
        ballDatas[3].applyToMesh(this.leftBox);
        ballDatas[4].applyToMesh(this.leftTop);
        ballDatas[5].applyToMesh(this.rightBox);
        ballDatas[6].applyToMesh(this.rightTop);

        BABYLON.CreateGroundVertexData({ width: 1.35, height: 1.35 }).applyToMesh(this.shadow);
        BABYLON.CreateGroundVertexData({ width: 2.6 * 2 * this.radius, height: 2.6 * 2 * this.radius }).applyToMesh(this.leftArrow);
        BABYLON.CreateGroundVertexData({ width: 2.6 * 2 * this.radius, height: 2.6 * 2 * this.radius }).applyToMesh(this.rightArrow);
    }

    public setVisible(v: boolean): void {
        this.isVisible = v;
        this.ballTop.isVisible = v;
        this.shadow.isVisible = v;
        this.leftArrow.isVisible = v;
        this.rightArrow.isVisible = v;
        if (!v) {
            this.trailMesh.isVisible = false;
        }
    }

    public xForce: number = 1;
    public speed: number = this.nominalSpeed;
    public dumdumFactor = 1;
    public dumdumFactorTarget = 1;
    public get boostedSpeed(): number {
        return this.speed * this.dumdumFactor;
    }
    public moveDir: BABYLON.Vector3 = BABYLON.Vector3.Forward();
    public smoothedMoveDir: BABYLON.Vector3 = BABYLON.Vector3.Forward();
    public inputSpeed: number = 1000;
    public bounceXValue: number = 0;
    public bounceXTimer: number = 0;

    public trailTimer: number = 0;
    public trailPoints: BABYLON.Vector3[] = [];
    public trailPointColors: BABYLON.Color4[] = [];
    
    public update(dt: number): void {
        if (this.mouseCanControl && this.mouseInControl) {
            this.rightPressed = 0;
            this.leftPressed = 0;
            this.upPressed = 0;
            this.downPressed = 0;
            if (this._pointerDown) {
                let pick = this.game.scene.pick(
                    this.game.scene.pointerX * window.devicePixelRatio,
                    this.game.scene.pointerY * window.devicePixelRatio,
                    (mesh) => {
                        return mesh.name === "floor" || mesh.name === "building-floor" || mesh === this.puzzle.invisiFloorTM;
                    }
                )
                if (pick.hit) {
                    let point = pick.pickedPoint;
                    let dx = point.x - this.absolutePosition.x;
                    if (dx > 0) {
                        this.rightPressed = Math.min(1, dx / 0.5);
                    }
                    else if (dx < 0) {
                        this.leftPressed = Math.min(1, dx / -0.5);
                    }
                    let dz = point.z - this.absolutePosition.z;
                    if (Math.abs(dz) > Math.abs(dx) && Math.abs(dz) > 1) {
                        if (dz > 0) {
                            this.upPressed = 1;
                        }
                        else if (dz < 0) {
                            this.downPressed = 1;
                        }
                    }
                }
            }
        }

        this.dumdumFactorTarget = 1;
        if (this.vZ > 0) {
            if (this.upPressed > 0) {
                this.dumdumFactorTarget = 1.5;
            }
            if (this.downPressed > 0) {
                this.dumdumFactorTarget = 1 / 1.5;
                this.dumdumFactorTarget = 1.5;
                //this.vZ = -1;
            }
        }
        if (this.vZ < 0) {
            if (this.upPressed > 0) {
                //this.vZ = 1;
                this.dumdumFactorTarget = 1 / 1.5;
                this.dumdumFactorTarget = 1.5;
            }
            if (this.downPressed > 0) {
                this.dumdumFactorTarget = 1.5;
            }
        }
        if (this.boost) {
            this.dumdumFactorTarget = 1.5;
        }
        let f = Nabu.Easing.smooth05Sec(1 / dt);
        this.dumdumFactor = this.dumdumFactor * f + this.dumdumFactorTarget * (1 - f);

        let vX = 0;
        if (this.leftPressed > 0) {
            this.leftArrowSize = this.leftArrowSize * 0.8 + Math.max(0.5, this.leftPressed) * 0.2;
            vX -= this.leftPressed;
        }
        else {
            this.leftArrowSize = this.leftArrowSize * 0.8 + 0.5 * 0.2;
        }

        if (this.rightPressed > 0) {
            this.rightArrowSize = this.rightArrowSize * 0.8 + Math.max(0.5, this.rightPressed) * 0.2;
            vX += this.rightPressed;
        }
        else {
            this.rightArrowSize = this.rightArrowSize * 0.8 + 0.5 * 0.2;
        }

        vX = Nabu.MinMax(vX, -1, 1);

        if (this.ballState != BallState.Ready && this.ballState != BallState.Flybacking && this.ballState != BallState.Wining) {
            this.trailTimer += dt;

            if (this.game.performanceWatcher.worst > 1) {
                let p = BABYLON.Vector3.Zero();
                let f = 0.6;
                p.copyFrom(this.smoothedMoveDir).scaleInPlace(-0.3);
                p.y += 0.15;
                BABYLON.Vector3.TransformCoordinatesToRef(p, this.getWorldMatrix(), p);
                if (this.trailTimer > 0.02) {
                    this.trailTimer = 0;
                    let last = this.trailPoints[this.trailPoints.length - 1]
                    if (last) {
                        p.scaleInPlace(f).addInPlace(last.scale(1 - f));
                    }

                    this.trailPoints.push(p);
                    let col = 0.2;
                    let s = this.boostedSpeed;
                    if (s < this.nominalSpeed / 1.1) {
                        col = 0.05;
                    }
                    else if (s > this.nominalSpeed * 1.1) {
                        col = 0.8;
                    }
                    let c = new BABYLON.Color4(col, col, col, 1);
                    this.trailColor.scaleInPlace(0.8).addInPlace(c.scaleInPlace(0.2));
                    this.trailPointColors.push(this.trailColor.clone());
                    let count = 15;
                    //count = 200; // debug
                    if (this.trailPoints.length > count) {
                        this.trailPoints.splice(0, 1);
                    }
                    while (this.trailPointColors.length > this.trailPoints.length) {
                        this.trailPointColors.splice(0, 1);
                    }
                }

                if (this.trailPoints.length > 2) {
                    let points = this.trailPoints.map((pt, i) => { 
                        pt = pt.clone();
                        pt.y -= 0.05 * i / this.trailPoints.length;
                        return pt;
                    });
                    Mummu.CatmullRomPathInPlace(points);
                    points.push(p);

                    let colors: BABYLON.Color4[] = [];
                    for (let i = 0; i < this.trailPointColors.length; i++) {
                        colors.push(this.trailPointColors[i]);
                        colors.push(this.trailPointColors[i]);
                    }
                    let data = CreateTrailVertexData({
                        path: points,
                        radiusFunc: (f) => {
                            return 0.08 * f;
                            //return 0.01;
                        },
                        colors: colors
                    });
                    data.applyToMesh(this.trailMesh);
                    this.trailMesh.isVisible = true;
                }
                else {
                    this.trailMesh.isVisible = false;
                }    
            }
            else {
                this.trailMesh.isVisible = false;
            }
        }

        if (this.ballState === BallState.Ready) {
            this.rightArrow.position.copyFrom(this.position);
            this.rightArrow.position.y += 0.1;
            this.leftArrow.position.copyFrom(this.position);
            this.leftArrow.position.y += 0.1;

            if (!this.isControlLocked && (this.leftPressed || this.rightPressed)) {
                if (!this.game.router.tutoPage.shown) {
                    if (this.game.mode === GameMode.Preplay) {
                        this.puzzle.skipIntro();
                        this.lockControl(0.2);
                    }
                    else {
                        this.puzzle.start();
                    }
                }
            }
            return;
        }
        else if (this.ballState === BallState.Move || this.ballState === BallState.Done || this.ballState === BallState.Split) {
            if (this.ballState === BallState.Done) {
                let f = Nabu.Easing.smooth1Sec(1 / dt);
                this.speed *= f;
            }
            if (this.ballState === BallState.Split) {
                let f = Nabu.Easing.smooth05Sec(1 / dt);
                this.speed *= f;
                this.leftBox.position.x = this.leftBox.position.x * f - 0.2 * (1 - f);
                this.leftBox.position.z = this.leftBox.position.z * f - 0.4 * (1 - f);
                this.leftBox.rotation.y = this.leftBox.rotation.y * f - 0.4 * (1 - f);
                this.rightBox.position.x = this.rightBox.position.x * f + 0.4 * (1 - f);
                this.rightBox.position.z = this.rightBox.position.z * f + 0.2 * (1 - f);
                this.rightBox.rotation.y = this.rightBox.rotation.y * f + 0.8 * (1 - f);
            }
            
            if (this.bounceXTimer > 0) {
                vX = this.bounceXValue;
                this.bounceXTimer -= dt * this.boostedSpeed;
                this.xForce = 1;
            }
            else {
                let fXForce = Nabu.Easing.smoothNSec(1 / dt, this.xForceAccelDelay);
                this.xForce = this.xForce * fXForce + 2 * (1 - fXForce);
            }

            let speed: BABYLON.Vector3;
            if (!this.water) {
                this.moveDir.copyFromFloats(
                    this.xForce * vX * (1.2 - 2 * this.radius) / 0.55,
                    0,
                    this.vZ
                ).normalize();
                speed = this.moveDir.scale(this.boostedSpeed);
            }
            else {
                let path = this.water.path;
                let proj = {
                    point: BABYLON.Vector3.Zero(),
                    index: 0
                }
                Mummu.ProjectPointOnPathToRef(this.absolutePosition, path, proj);
                let n = Nabu.MinMax(proj.index, 1, path.length - 2);
                let correction = proj.point.subtract(this.position);
                let dir = path[n].subtract(path[n - 1]).normalize();
                if (dir.z > 0) {
                    this.vZ = 1;
                }
                else if (dir.z < 0) {
                    this.vZ = -1;
                }
                dir.addInPlace(correction).normalize();
                this.moveDir.copyFrom(dir);
                this.moveDir.x += this.xForce * vX * (1.2 - 2 * this.radius) / 0.55;
                this.moveDir.normalize();
                speed = this.moveDir.scale(this.boostedSpeed * 0.5);
            }

            this.position.addInPlace(speed.scale(dt));
            if (this.position.z + this.radius > this.puzzle.zMax) {
                this.position.z = this.puzzle.zMax - this.radius;
                this.vZ = -1;
                if (!this.water) {
                    let impact = this.position.clone();
                    impact.z = this.puzzle.zMax;
                    this.woodChocSound2.play();
                }
            }
            else if (this.position.z - this.radius < this.puzzle.zMin) {
                this.position.z = this.puzzle.zMin + this.radius;
                this.vZ = 1;
                if (!this.water) {
                    let impact = this.position.clone();
                    impact.z = this.puzzle.zMin;
                    this.woodChocSound2.play();
                }
            }

            if (this.position.x + this.radius > this.puzzle.xMax) {
                this.position.x = this.puzzle.xMax - this.radius;
                this.bounceXValue = - 1;
                this.bounceXTimer = this.bounceXDelayWall;
                let impact = this.position.clone();
                impact.x = this.puzzle.xMax;
                this.woodChocSound2.play();
            }
            else if (this.position.x - this.radius < this.puzzle.xMin) {
                this.position.x = this.puzzle.xMin + this.radius;
                this.bounceXValue = 1;
                this.bounceXTimer = this.bounceXDelayWall;
                let impact = this.position.clone();
                impact.x = this.puzzle.xMin;
                this.woodChocSound2.play();
            }

            let impact = BABYLON.Vector3.Zero();

            for (let ii = -1; ii <= 1; ii++) {
                for (let jj = -1; jj <= 1; jj++) {
                    let stack = this.puzzle.getGriddedBorderStack(this.i + ii, this.j + jj);
                    if (stack) {
                        let borders = stack.array;
                        for (let i = 0; i < borders.length; i++) {
                            let border = borders[i];
                            if (border.collide(this, impact)) {
                                let dir = this.position.subtract(impact);
                                if (Math.abs(dir.x) > Math.abs(dir.z)) {
                                    if (dir.x > 0) {
                                        this.bounceXValue = 1;
                                        this.bounceXTimer = this.bounceXDelayWall;
                                    }
                                    else {
                                        this.bounceXValue = - 1;
                                        this.bounceXTimer = this.bounceXDelayWall;
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
                    }
                }
            }            

            this.water = undefined;
            for (let ii = -1; ii <= 1; ii++) {
                for (let jj = -1; jj <= 1; jj++) {
                    let stack = this.puzzle.getGriddedStack(this.i + ii, this.j + jj);
                    if (stack) {
                        let tiles = stack.array;
                        for (let i = 0; i < tiles.length; i++) {
                            let tile = tiles[i];
                            if (this.ballState === BallState.Move && tile instanceof WaterTile) {
                                if (tile.fallsIn(this)) {
                                    this.water = tile;
                                }
                            }
                        }
                    }
                }
            }

            for (let i = 0; i < this.puzzle.ballsCount; i++) {
                let otherBall = this.puzzle.balls[i];
                if (otherBall && otherBall != this) {
                    let sqrDist = BABYLON.Vector3.DistanceSquared(this.absolutePosition, otherBall.absolutePosition);
                    if (sqrDist < (this.radius + otherBall.radius) * (this.radius + otherBall.radius)) {
                        this.puzzle.addBallCollision(this.absolutePosition.add(otherBall.absolutePosition).scaleInPlace(0.5));
                    }
                }
            }

            if (this.ballState === BallState.Move) {
                for (let i = 0; i < this.puzzle.creeps.length; i++) {
                    let creep = this.puzzle.creeps[i];
                    let sqrDist = BABYLON.Vector3.DistanceSquared(this.absolutePosition, creep.absolutePosition);
                    if (sqrDist < (this.radius + creep.radius) * (this.radius + creep.radius)) {
                        creep.stopMove = true;
                        creep.bump();
                        let dir = this.absolutePosition.subtract(creep.absolutePosition);
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
                                this.vZ = -1;
                            }
                        }
                        this.puzzle.slashSound.play();
                        this.split();
                        clearTimeout(this._loseTimout);
                        this._loseTimout = setTimeout(() => {
                            this.puzzle.lose();
                        }, 500);
                        return;
                    }
                }
            }

            if (!this.puzzle.ballCollisionDone[this.ballIndex]) {
                let dir = this.absolutePosition.subtract(this.puzzle.ballCollision);
                let sqrDist = dir.lengthSquared();
                if (sqrDist < this.radius * this.radius) {
                    Mummu.ForceDistanceFromOriginInPlace(this.position, this.puzzle.ballCollision, this.radius);
                    if (Math.abs(dir.x) > Math.abs(dir.z)) {
                        if (dir.x > 0) {
                            this.bounceXValue = 1;
                            this.bounceXTimer = this.bounceXDelay;
                        }
                        else {
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
                    this.puzzle.ballCollisionDone[this.ballIndex] = true;
                }
            }

            for (let ii = -1; ii <= 1; ii++) {
                for (let jj = -1; jj <= 1; jj++) {
                    let stack = this.puzzle.getGriddedStack(this.i + ii, this.j + jj);
                    if (stack) {
                        let tiles = stack.array;
                        for (let i = 0; i < tiles.length; i++) {
                            let tile = tiles[i];
                            if (this.ballState === BallState.Move && tile instanceof HoleTile) {
                                if (tile.fallsIn(this)) {
                                    if (tile.covered) {
                                        tile.rumble();
                                    }
                                    else {
                                        this.ballState = BallState.Fall;
                                        this.fallTimer = 0;
                                        this.hole = tile;
                                        return;
                                    }
                                }
                            }
                            else if (tile instanceof WaterTile && tile.distFromSource > 0) {

                            }
                            else if (tile instanceof DoorTile && tile.closed === false) {

                            }
                            else {
                                if (tile.tileState === TileState.Active || tile.tileState === TileState.Moving) {
                                    if (tile.collide(this, impact)) {
                                        let dir = this.position.subtract(impact);
                                        if (Math.abs(dir.x) > Math.abs(dir.z)) {
                                            if (dir.x > 0) {
                                                this.position.x = impact.x + this.radius;
                                                this.bounceXValue = 1;
                                                this.bounceXTimer = (tile instanceof WallTile || tile instanceof DoorTile) ? this.bounceXDelayWall : this.bounceXDelay;
                                            }
                                            else {
                                                this.position.x = impact.x - this.radius;
                                                this.bounceXValue = - 1;
                                                this.bounceXTimer = (tile instanceof WallTile || tile instanceof DoorTile) ? this.bounceXDelayWall : this.bounceXDelay;
                                            }
                                            if (tile instanceof WallTile || tile instanceof DoorTile) {
                                                this.woodChocSound2.play();
                                            }
                                            else {
                                                this.woodChocSound.play();
                                            }
                                        }
                                        else {
                                            if (dir.z > 0) {
                                                this.vZ = 1;
                                            }
                                            else {
                                                this.vZ = -1;
                                            }
                                            if (tile instanceof WallTile) {
                                                this.woodChocSound2.play();
                                            }
                                            else {
                                                this.woodChocSound.play();
                                            }
                                        }
                                        if (this.ballState === BallState.Move) {
                                            if (tile instanceof SwitchTile) {
                                                tile.bump();
                                                this.setColor(tile.color);
                                            }
                                            else if (tile instanceof ButtonTile) {
                                                tile.clicClack();
                                                this.puzzle.tiles.forEach(door => {
                                                    if (door instanceof DoorTile && door.props.value === tile.props.value) {
                                                        if (door.closed) {
                                                            door.open();
                                                        }
                                                        else {
                                                            door.close();
                                                        }
                                                    }
                                                })
                                            }
                                            else if (tile instanceof BlockTile) {
                                                if (tile.color === this.color) {
                                                    tile.tileState = TileState.Dying;
                                                    tile.shrink().then(() => {
                                                        tile.shootStar();
                                                        tile.dispose();
                                                    });
                                                }
                                            }
                                            else if (tile instanceof PushTile) {
                                                tile.push(dir.scale(-1));
                                            }
                                            ii = Infinity;
                                            jj = Infinity;
                                            i = Infinity;
                                            break;
                                        }
                                    }
                                }
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
                let f = this.speed / this.nominalSpeed;
                this.position.y = this.position.y * (1 - f) + hit.pickedPoint.y * f;
                let q = Mummu.QuaternionFromYZAxis(hit.getNormal(true), BABYLON.Axis.Z);
                let fQ = Nabu.Easing.smoothNSec(1 / dt, 0.5);
                BABYLON.Quaternion.SlerpToRef(this.rotationQuaternion, q, 1 - fQ, this.rotationQuaternion);
                let a = Mummu.Angle(this.moveDir, this.smoothedMoveDir.scale(-1));
                if (Math.abs(a) < Math.PI / 180) {
                    this.smoothedMoveDir.x += -0.05 + Math.random() * 0.1;
                    this.smoothedMoveDir.normalize();
                }
                BABYLON.Vector3.SlerpToRef(this.smoothedMoveDir, this.moveDir, 1 - fQ, this.smoothedMoveDir);
                this.smoothedMoveDir.normalize();
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

                if (this.puzzle.fishingPolesCount > 0) {
                    this.puzzle.fishingPolesCount --;
                    this.ballState = BallState.Flybacking;
                    this.trailPoints = [];
                    this.trailMesh.isVisible = false;
                    this.puzzle.fishingPole.fish(
                        this.position.clone(),
                        this.puzzle.ballsPositionZero[this.ballIndex].add(new BABYLON.Vector3(0, 0.2, 0)),
                        () => {
                            this.position.copyFromFloats(0, 0, 0);
                            this.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, - Math.PI * 0.2);
                            this.parent = this.puzzle.fishingPole.lineMesh;
                        },
                        () => {
                            this.position.copyFrom(this.puzzle.ballsPositionZero[this.ballIndex]);
                            this.parent = undefined;
                            this.ballState = BallState.Move;
                            this.bounceXValue = 0;
                            this.bounceXTimer = 0;
                            this.speed = 0;
                            this.vZ *= -1;
                            this.animateSpeed(this.nominalSpeed, 0.5, Nabu.Easing.easeInCubic);
                        }
                    );
                }
                else {
                    this.ballState = BallState.Done;
                    clearTimeout(this._loseTimout);
                    this._loseTimout = setTimeout(() => {
                        this.puzzle.lose();
                    }, 500);
                }
                return;
            }

            let f = Math.pow(this.fallTimer, 0.9);
            this.position.x = this.fallOriginPos.x * (1 - f) + bottom.x * f;
            this.position.z = this.fallOriginPos.z * (1 - f) + bottom.z * f;
            f = this.fallTimer * this.fallTimer;
            this.position.y = this.fallOriginPos.y * (1 - f) + bottom.y * f;

            this.rotate(this.fallRotAxis, 2 * Math.PI * dt, BABYLON.Space.WORLD);
        }

        this.rightArrow.position.copyFrom(this.position);
        this.rightArrow.position.y += 0.1;
        this.leftArrow.position.copyFrom(this.position);
        this.leftArrow.position.y += 0.1;
    }

    public split(): void {
        let explosionFire = new Explosion(this.game);
        explosionFire.origin.copyFrom(this.absolutePosition);
        explosionFire.setRadius(0.3);
        explosionFire.color = BABYLON.Color3.FromHexString("#ffffff");
        explosionFire.lifespan = 1;
        explosionFire.tZero = 1.15;
        explosionFire.boom();

        this.isVisible = false;
        this.shadow.isVisible = false;
        this.leftArrow.isVisible = false;
        this.rightArrow.isVisible = false;

        this.ballTop.isVisible = false;
        this.leftBox.position.copyFromFloats(0, 0, 0);
        this.leftBox.rotation.copyFromFloats(0, 0, 0);
        this.leftBox.isVisible = true;
        this.leftTop.isVisible = true;
        this.rightBox.position.copyFromFloats(0, 0, 0);
        this.rightBox.rotation.copyFromFloats(0, 0, 0);
        this.rightBox.isVisible = true;
        this.rightTop.isVisible = true;
        this.ballState = BallState.Split;
    }

    public reset(): void {
        this.killWinAnim();
        clearTimeout(this._loseTimout);
        this.parent = undefined;
        this.boost = false;
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.trailPoints = [];
        this.trailPointColors = [];
        this.trailMesh.isVisible = false;
        this.ballState = BallState.Ready;
        this.vZ = 1;
        
        this.leftBox.position.copyFromFloats(0, 0, 0);
        this.leftBox.rotation.copyFromFloats(0, 0, 0);
        this.leftBox.isVisible = false;
        this.leftTop.isVisible = false;
        this.rightBox.position.copyFromFloats(0, 0, 0);
        this.rightBox.rotation.copyFromFloats(0, 0, 0);
        this.rightBox.isVisible = false;
        this.rightTop.isVisible = false;

        this.shadow.isVisible = true;
        this.leftArrow.isVisible = true;
        this.rightArrow.isVisible = true;
        
        this.setVisible(true);
    }

    public animContainer: BABYLON.Mesh;
    public animPos = Mummu.AnimationFactory.EmptyVector3Callback;
    public animWinTrailRadius = Mummu.AnimationFactory.EmptyNumberCallback;
    public animRotX = Mummu.AnimationFactory.EmptyNumberCallback;
    public animRotY = Mummu.AnimationFactory.EmptyNumberCallback;
    public animRotZ = Mummu.AnimationFactory.EmptyNumberCallback;

    public winTrailPos0: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public winTrailPos1: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public winTrailPoints0: BABYLON.Vector3[] = [];
    public winTrailPoints1: BABYLON.Vector3[] = [];
    public winTrailMesh0: BABYLON.Mesh;
    public winTrailMesh1: BABYLON.Mesh;

    public async animStand(duration: number): Promise<void> {
        let standingP = this.animContainer.position.clone();
        standingP.y += 0.1;
        standingP.z -= 0.3;

        let r = this.animContainer.rotation.x - Math.PI * 0.5;

        this.animRotX(r, duration, Nabu.Easing.easeInSine);
        await this.animPos(standingP, duration, Nabu.Easing.easeInSine);
        //this.sparkle();
    }

    public async animSit(duration: number): Promise<void> {
        let sitP = this.animContainer.position.clone();
        sitP.y -= 0.1;
        sitP.z += 0.3;

        let r = this.animContainer.rotation.x + Math.PI * 0.5;

        this.animRotX(r, duration, Nabu.Easing.easeInSine);
        await this.animPos(sitP, duration, Nabu.Easing.easeInSine);
        //this.sparkle();
    }

    public async backFlip(turns: number, duration: number): Promise<void> {
        let r = this.animContainer.rotation.x + turns * 2 * Math.PI;
        setTimeout(() => {
            this.puzzle.wiishSound.play()
        }, duration * 100);
        await this.animRotX(r, duration, Nabu.Easing.easeInOutSine);
    }

    public async frontFlip(turns: number, duration: number): Promise<void> {
        let r = this.animContainer.rotation.x - turns * 2 * Math.PI;
        setTimeout(() => {
            this.puzzle.wiishSound.play()
        }, duration * 100);
        await this.animRotX(r, duration, Nabu.Easing.easeInOutSine);
    }

    public async spin(turns: number, duration: number): Promise<void> {
        let r = this.animContainer.rotation.y + turns * 2 * Math.PI;
        setTimeout(() => {
            this.puzzle.wiishSound.play()
        }, duration * 100);
        await this.animRotY(r, duration, Nabu.Easing.easeInOutSine);
    }

    public async jump(h: number, duration: number): Promise<void> {
        let baseP = this.animContainer.position.clone();

        let stretchP = baseP.clone();
        stretchP.y -= 0.1;

        let jumpP = baseP.clone();
        jumpP.y += h;

        await this.animPos(stretchP, duration * 0.2, Nabu.Easing.easeOutCubic);
        await this.animPos(jumpP, duration * 0.4, Nabu.Easing.easeOutCubic);
        await this.animPos(baseP, duration * 0.4, Nabu.Easing.easeInCubic);
        this.woodChocSound.play();
    }

    public sparkle(): void {
        let explosionFire = new Explosion(this.game);
        explosionFire.origin.copyFrom(this.absolutePosition);
        explosionFire.setRadius(0.4);
        explosionFire.color = BABYLON.Color3.FromHexString("#e0c872");
        explosionFire.color = BABYLON.Color3.FromHexString("#ffffff");
        explosionFire.lifespan = 1;
        explosionFire.tZero = 1.1;
        explosionFire.boom();
    }

    private _shadowGroundY: number = 0;
    public winTrailRadius: number = 0.5;
    private _winTrailTimer: number = 0;

    private _updateWin = () => {
        let dt = this.game.scene.deltaTime / 1000;

        this.shadow.position.x = this.animContainer.position.x;
        this.shadow.position.y = this._shadowGroundY;
        this.shadow.position.z = this.animContainer.position.z;
        
        this._winTrailTimer -= dt;
        if (this._winTrailTimer <= 0) {
            this._winTrailTimer = 0.01;

            let pt0 = new BABYLON.Vector3(1, 0, -1).normalize();
            pt0.scaleInPlace(this.winTrailRadius);
            BABYLON.Vector3.TransformCoordinatesToRef(pt0, this.getWorldMatrix(), pt0);
            this.winTrailPoints0.push(pt0);
            if (this.winTrailPoints0.length > 40) {
                this.winTrailPoints0.splice(0, 1);
            }

            let pt1 = new BABYLON.Vector3(- 1, 0, -1).normalize();
            pt1.scaleInPlace(this.winTrailRadius);
            BABYLON.Vector3.TransformCoordinatesToRef(pt1, this.getWorldMatrix(), pt1);
            this.winTrailPoints1.push(pt1);
            if (this.winTrailPoints1.length > 40) {
                this.winTrailPoints1.splice(0, 1);
            }

            if (this.winTrailPoints0.length > 2) {
                let data = CreateTrailVertexData({
                    path: this.winTrailPoints0,
                    radiusFunc: (f) => {
                        return 0.05 * f;
                        //return 0.01;
                    },
                    color: new BABYLON.Color4(1, 1, 1, 1)
                });
                data.applyToMesh(this.winTrailMesh0);
                this.winTrailMesh0.isVisible = true;
            }

            if (this.winTrailPoints1.length > 2) {
                let data = CreateTrailVertexData({
                    path: this.winTrailPoints1,
                    radiusFunc: (f) => {
                        return 0.05 * f;
                        //return 0.01;
                    },
                    color: new BABYLON.Color4(1, 1, 1, 1)
                });
                data.applyToMesh(this.winTrailMesh1);
                this.winTrailMesh1.isVisible = true;
            }
        }
    }

    public winIndex = 0;

    public async popWinTrailRadius(duration: number): Promise<void> {
        this.winTrailRadius = 0.4;
        await this.animWinTrailRadius(0.8, duration * 0.5, Nabu.Easing.easeOutCubic);
        await this.animWinTrailRadius(0.4, duration * 0.5, Nabu.Easing.easeInCubic);
    }

    public async winAnimation(): Promise<void> {
        this.trailMesh.isVisible = false;

        this.winTrailRadius = 0.5;

        this.winTrailMesh0 = new BABYLON.Mesh("winTrailMesh0");
        this.winTrailMesh0.material = this.game.materials.fullAutolitWhiteMaterial;
        this.winTrailPoints0 = [];

        this.winTrailMesh1 = new BABYLON.Mesh("winTrailMesh1");
        this.winTrailMesh1.material = this.game.materials.fullAutolitWhiteMaterial;
        this.winTrailPoints1 = [];

        this.animContainer.position.copyFrom(this.position);
        this.animContainer.position.y += 0.2 * this.radius * 2;
        this.setParent(this.animContainer);
        
        this.ballState = BallState.Wining;
        this.speed = 0;

        this._shadowGroundY = this.shadow.absolutePosition.y;
        this.shadow.scaling.copyFrom(this.scaling).scaleInPlace(0.8);
        this.shadow.parent = undefined;
        this.game.scene.onBeforeRenderObservable.add(this._updateWin);

        this.game.spotlight.position = this.absolutePosition.add(new BABYLON.Vector3(0, 5, 0));
        this.game.animLightIntensity(0.5, 0.3);
        this.game.animSpotlightIntensity(1, 0.3);

        this.winIndex = (this.winIndex + 1) % 3;
        if (this.winIndex === 0) {
            await this.win1();
        }
        else if (this.winIndex === 1) {
            await this.win2();
        }
        else if (this.winIndex === 2) {
            await this.win3();
        }

        this.killWinAnim();
    }

    public killWinAnim(): void {
        this.game.scene.onBeforeRenderObservable.removeCallback(this._updateWin);
        this.shadow.position.x = 0;
        this.shadow.position.y = 0.05;
        this.shadow.position.z = 0;
        this.shadow.scaling.copyFromFloats(1, 1, 1);
        this.shadow.parent = this;
        this.setParent(undefined);

        this.ballState = BallState.Done;

        if (this.winTrailMesh0) {
            this.winTrailMesh0.dispose();
        }
        if (this.winTrailMesh1) {
            this.winTrailMesh1.dispose();
        }
        
        this.game.animLightIntensity(1, 1);
        this.game.animSpotlightIntensity(0, 1);
    }

    public async win1(): Promise<void> {
        let wait = Mummu.AnimationFactory.CreateWait(this);

        this.popWinTrailRadius(3.5);

        await this.animStand(0.5);
        this.popWinTrailRadius(2);

        let d = 1.2;
        this.jump(2.5, d);
        await wait(0.2 * d);
        await this.backFlip(2, 0.8 * d);
        this.sparkle();

        d = 0.8;
        this.jump(1.5, d);
        await wait(0.2 * d);
        await this.frontFlip(1, 0.8 * d);
        this.sparkle();

        await this.animSit(0.5);
    }

    public async win2(): Promise<void> {
        let wait = Mummu.AnimationFactory.CreateWait(this);

        await this.animStand(0.5);
        this.popWinTrailRadius(2);

        let d = 1.2;
        this.jump(2.5, d);
        await wait(0.2 * d);
        await this.spin(2, 0.8 * d);
        this.sparkle();
        
        d = 0.8;
        this.jump(1.5, d);
        await wait(0.2 * d);
        await this.spin(1, 0.8 * d);
        this.sparkle();

        await this.animSit(0.5);
    }

    public async win3(): Promise<void> {
        let wait = Mummu.AnimationFactory.CreateWait(this);


        await wait(0.5);
        this.popWinTrailRadius(2);

        let d = 1.2;
        this.jump(2.5, d);
        await wait(0.2 * d);
        await this.backFlip(2, 0.8 * d);
        this.sparkle();

        d = 0.8;
        this.jump(1.5, d);
        await wait(0.2 * d);
        await this.frontFlip(1, 0.8 * d);
        this.sparkle();

        await wait(0.5);
    }
}