interface BallProps {
    color: TileColor;
}

enum BallState {
    Ready,
    Move,
    Fall,
    Flybacking,
    Done
}

class Ball extends BABYLON.Mesh {

    public dropletMode: boolean = false;

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
    
    private _boost: boolean = false;
    public get boost(): boolean {
        return this._boost;
    }
    public set boost(v: boolean) {
        this._boost = v;

        this.shadow.material = this._boost ? this.game.lightDiscMaterial : this.game.shadowDiscMaterial;

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
    public nominalSpeed: number = 2;
    public vZ: number = 1;
    public radius: number = 0.25;
    public bounceXDelay: number = 0.93;
    public xForceAccelDelay: number = 0.8 * this.bounceXDelay;

    public isControlLocked: boolean = false;
    private _lockControlTimout: number = 0;
    public lockControl(duration: number = 0.2): void {
        clearTimeout(this._lockControlTimout);
        this.isControlLocked = true;
        this._lockControlTimout = setTimeout(() => {
            this.isControlLocked = false;
        }, duration * 1000);
    }
    public leftDown: number = 0;
    public rightDown: number = 0;
    public animateSpeed = Mummu.AnimationFactory.EmptyNumberCallback;

    public setColor(color: TileColor) {
        this.color = color;
        if (this.ballTop) {
            this.ballTop.material = this.game.tileColorShinyMaterials[this.color];
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

        this.color = props.color;

        this.scaling.copyFromFloats(this.radius * 2, this.radius * 2, this.radius * 2);

        this.ballTop = new BABYLON.Mesh("ball-top");
        this.ballTop.position.y = 0.3;
        this.ballTop.parent = this;

        this.material = this.game.brownMaterial;

        this.renderOutline = true;
        this.outlineColor = BABYLON.Color3.Black();
        this.outlineWidth = 0.02 / (this.radius * 2);

        this.ballTop.material = this.game.tileColorShinyMaterials[this.color];

        this.shadow = new BABYLON.Mesh("shadow");
        this.shadow.position.x = 0;
        this.shadow.position.y = 0.05;
        this.shadow.position.z = 0;
        this.shadow.parent = this;

        this.shadow.material = this.game.shadowDiscMaterial;
        
        this.leftArrow = new BABYLON.Mesh("left-arrow");
        this.leftArrow.position.y = 0.1;
        this.leftArrow.rotation.y = Math.PI;
        this.leftArrow.material = this.game.puckSideMaterial;
        this.leftArrowSize = 0.5;

        this.rightArrow = new BABYLON.Mesh("right-arrow");
        this.rightArrow.position.y = 0.1;
        this.rightArrow.material = this.game.puckSideMaterial;
        this.rightArrowSize = 0.5;

        this.trailMesh = new BABYLON.Mesh("trailMesh");
        this.trailMesh.material = this.game.whiteMaterial;

        this.woodChocSound = this.game.soundManager.createSound("wood-choc", "./datas/sounds/wood-wood-choc.wav", undefined, undefined, { autoplay: false, loop: false }, 2);
        this.woodChocSound2 = this.game.soundManager.createSound("wood-choc", "./datas/sounds/wood-wood-choc-2.wav", undefined, undefined, { autoplay: false, loop: false }, 2);
        this.fallImpactSound = this.game.soundManager.createSound("wood-choc", "./datas/sounds/fall-impact.wav", undefined, undefined, { autoplay: false, loop: false });

        this.animateSpeed = Mummu.AnimationFactory.CreateNumber(this, this, "speed");

        if (this.ballIndex === 0) {
            let inputLeft = document.querySelector("#input-left");
            if (inputLeft) {
                inputLeft.addEventListener("pointerdown", () => {
                    this.leftDown = 1;
                    this.mouseInControl = false;
                })
                inputLeft.addEventListener("pointerup", () => {
                    this.mouseInControl = false;
                    this.leftDown = 0;
                })
            }
    
            let inputRight = document.querySelector("#input-right");
            if (inputRight) {
                inputRight.addEventListener("pointerdown", () => {
                    this.mouseInControl = false;
                    this.rightDown = 1;
                })
                inputRight.addEventListener("pointerup", () => {
                    this.mouseInControl = false;
                    this.rightDown = 0;
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
    
            this.game.canvas.addEventListener("pointerdown", this.mouseDown);
            this.game.canvas.addEventListener("pointerup", this.mouseUp);
            this.game.canvas.addEventListener("pointerleave", this.mouseUp);
            this.game.canvas.addEventListener("pointerout", this.mouseUp);

            document.addEventListener("keydown", (ev: KeyboardEvent) => {
                if (ev.code === "KeyA") {
                    if (this.wasdCanControl) {
                        if (this.mouseCanControl) {
                            this.mouseInControl = false;
                        }
                        this.leftDown = 1;
                    }
                }
                if (ev.code === "ArrowLeft") {
                    if (this.arrowCanControl) {
                        if (this.mouseCanControl) {
                            this.mouseInControl = false;
                        }
                        this.leftDown = 1;
                    }
                }
                
                if (ev.code === "KeyD") {
                    if (this.wasdCanControl) {
                        if (this.mouseCanControl) {
                            this.mouseInControl = false;
                        }
                        this.rightDown = 1;
                    }
                }
                if (ev.code === "ArrowRight") {
                    if (this.arrowCanControl) {
                        if (this.mouseCanControl) {
                            this.mouseInControl = false;
                        }
                        this.rightDown = 1;
                    }
                }
                if (ev.code === "Space") {
                    if (this.wasdCanControl) {
                        this.boost = true;
                    }
                }
            })
    
            document.addEventListener("keyup", (ev: KeyboardEvent) => {
                if (ev.code === "KeyA") {
                    if (this.wasdCanControl) {
                        if (this.mouseCanControl) {
                            this.mouseInControl = false;
                        }
                        this.leftDown = 0;
                    }
                }
                if (ev.code === "ArrowLeft") {
                    if (this.arrowCanControl) {
                        if (this.mouseCanControl) {
                            this.mouseInControl = false;
                        }
                        this.leftDown = 0;
                    }
                }
                
                if (ev.code === "KeyD") {
                    if (this.wasdCanControl) {
                        if (this.mouseCanControl) {
                            this.mouseInControl = false;
                        }
                        this.rightDown = 0;
                    }
                }
                if (ev.code === "ArrowRight") {
                    if (this.arrowCanControl) {
                        if (this.mouseCanControl) {
                            this.mouseInControl = false;
                        }
                        this.rightDown = 0;
                    }
                }
                if (ev.code === "Space") {
                    if (this.wasdCanControl) {
                        this.boost = false;
                    }
                }
            })
        }
        
    }

    public get wasdCanControl(): boolean {
        return this.puzzle.ballsCount === 1 || this.ballIndex === 0;
    }
    public get arrowCanControl(): boolean {
        return this.puzzle.ballsCount === 1 || this.ballIndex === 1;
    }
    public get mouseCanControl(): boolean {
        return this.puzzle.ballsCount === 1 || this.ballIndex === 0;
    }
    public mouseInControl: boolean = false;
    private _pointerDown: boolean = false;
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
        let ballDatas: BABYLON.VertexData[];
        if (this.dropletMode) {
            ballDatas = await this.game.vertexDataLoader.get("./datas/meshes/ball-droplet.babylon");
        }
        else {
            ballDatas = await this.game.vertexDataLoader.get("./datas/meshes/ball.babylon");
        }
        
        ballDatas[0].applyToMesh(this);
        ballDatas[1].applyToMesh(this.ballTop);

        BABYLON.CreateGroundVertexData({ width: 1.35, height: 1.35 }).applyToMesh(this.shadow);
        BABYLON.CreateGroundVertexData({ width: 2.2 * 2 * this.radius, height: 2.2 * 2 * this.radius }).applyToMesh(this.leftArrow);
        BABYLON.CreateGroundVertexData({ width: 2.2 * 2 * this.radius, height: 2.2 * 2 * this.radius }).applyToMesh(this.rightArrow);
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
    public get boostedSpeed(): number {
        return this.boost ? this.speed * 1.6 : this.speed;
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
            this.rightDown = 0;
            this.leftDown = 0;
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
                        this.rightDown = Math.min(1, dx / 0.5);
                    }
                    else if (dx < 0) {
                        this.leftDown = Math.min(1, dx / -0.5);
                    }
                }
            }
        }

        let vX = 0;
        if (this.leftDown > 0) {
            this.leftArrowSize = this.leftArrowSize * 0.8 + Math.max(0.5, this.leftDown) * 0.2;
            vX -= this.leftDown;
        }
        else {
            this.leftArrowSize = this.leftArrowSize * 0.8 + 0.5 * 0.2;
        }

        if (this.rightDown > 0) {
            this.rightArrowSize = this.rightArrowSize * 0.8 + Math.max(0.5, this.rightDown) * 0.2;
            vX += this.rightDown;
        }
        else {
            this.rightArrowSize = this.rightArrowSize * 0.8 + 0.5 * 0.2;
        }

        vX = Nabu.MinMax(vX, -1, 1);

        if (this.ballState != BallState.Ready && this.ballState != BallState.Flybacking) {
            this.trailTimer += dt;

            if (this.game.performanceWatcher.worst > 24) {
                let p = BABYLON.Vector3.Zero();
                if (this.dropletMode) {
                    p = new BABYLON.Vector3(0, 0.1, -0.8);
                }
                else {
                    p.copyFrom(this.smoothedMoveDir).scaleInPlace(-0.3);
                    p.y += 0.15;
                }
                BABYLON.Vector3.TransformCoordinatesToRef(p, this.getWorldMatrix(), p);
                if (this.trailTimer > 0.02) {
                    this.trailTimer = 0;
                    let last = this.trailPoints[this.trailPoints.length - 1]
                    if (last) {
                        p.scaleInPlace(0.6).addInPlace(last.scale(0.4));
                    }

                    this.trailPoints.push(p);
                    let c = new BABYLON.Color4(0.2 + (this.boost ? 0.6 : 0), 0.2 + (this.boost ? 0.6 : 0), 0.2 + (this.boost ? 0.6 : 0), 1);
                    this.trailColor.scaleInPlace(0.8).addInPlace(c.scaleInPlace(0.2));
                    this.trailPointColors.push(this.trailColor.clone());
                    let count = 40;
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

            if (!this.isControlLocked && (this.leftDown || this.rightDown)) {
                if (this.game.mode === GameMode.Preplay) {
                    this.puzzle.skipIntro();
                    this.lockControl(0.2);
                }
                else {
                    this.puzzle.start();
                }
            }
            return;
        }
        else if (this.ballState === BallState.Move || this.ballState === BallState.Done) {
            if (this.ballState === BallState.Done) {
                this.speed *= 0.99;
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
                    this.game.toonSoundManager.start(this.tac(impact));
                    this.woodChocSound2.play();
                }
            }
            else if (this.position.z - this.radius < this.puzzle.zMin) {
                this.position.z = this.puzzle.zMin + this.radius;
                this.vZ = 1;
                if (!this.water) {
                    let impact = this.position.clone();
                    impact.z = this.puzzle.zMin;
                    this.game.toonSoundManager.start(this.tac(impact));
                    this.woodChocSound2.play();
                }
            }

            if (this.position.x + this.radius > this.puzzle.xMax) {
                this.position.x = this.puzzle.xMax - this.radius;
                this.bounceXValue = - 1;
                this.bounceXTimer = this.bounceXDelay;
                let impact = this.position.clone();
                impact.x = this.puzzle.xMax;
                this.game.toonSoundManager.start(this.tac(impact));
                this.woodChocSound2.play();
            }
            else if (this.position.x - this.radius < this.puzzle.xMin) {
                this.position.x = this.puzzle.xMin + this.radius;
                this.bounceXValue = 1;
                this.bounceXTimer = this.bounceXDelay;
                let impact = this.position.clone();
                impact.x = this.puzzle.xMin;
                this.game.toonSoundManager.start(this.tac(impact));
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
                                this.game.toonSoundManager.start(this.poc(impact));
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
                        this.game.toonSoundManager.start(this.poc(impact));
                        this.woodChocSound.play();
                    }
                    else {
                        if (dir.z > 0) {
                            this.vZ = 1;
                        }
                        else {
                            this.vZ = -1;
                        }
                        this.game.toonSoundManager.start(this.poc(impact));
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
                                                this.bounceXTimer = this.bounceXDelay;
                                            }
                                            else {
                                                this.position.x = impact.x - this.radius;
                                                this.bounceXValue = - 1;
                                                this.bounceXTimer = this.bounceXDelay;
                                            }
                                            if (tile instanceof WallTile) {
                                                this.game.toonSoundManager.start(this.tac(impact));
                                                this.woodChocSound2.play();
                                            }
                                            else {
                                                this.game.toonSoundManager.start(this.poc(impact));
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
                                                this.game.toonSoundManager.start(this.tac(impact));
                                                this.woodChocSound2.play();
                                            }
                                            else {
                                                this.game.toonSoundManager.start(this.poc(impact));
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
                    setTimeout(() => {
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

    public poc(pos: BABYLON.Vector3) {
        return {
            text: "POC",
            pos: pos,
            color: "#624c3c",
            size: 0.25,
            duration: 0.3,
            type: ToonSoundType.Poc
        }
    }

    public tac(pos: BABYLON.Vector3) {
        return {
            text: "TAC",
            pos: pos,
            color: "#2b2821",
            size: 0.25,
            duration: 0.3,
            type: ToonSoundType.Poc
        }
    }
}