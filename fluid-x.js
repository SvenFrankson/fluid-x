var BallState;
(function (BallState) {
    BallState[BallState["Ready"] = 0] = "Ready";
    BallState[BallState["Move"] = 1] = "Move";
    BallState[BallState["Fall"] = 2] = "Fall";
    BallState[BallState["Flybacking"] = 3] = "Flybacking";
    BallState[BallState["Done"] = 4] = "Done";
})(BallState || (BallState = {}));
class Ball extends BABYLON.Mesh {
    constructor(puzzle, props, ballIndex = 0) {
        super("ball");
        this.puzzle = puzzle;
        this.ballIndex = ballIndex;
        this.dropletMode = false;
        this.ballState = BallState.Ready;
        this.fallTimer = 0;
        this.nominalSpeed = 2.2;
        this.vZ = 1;
        this.radius = 0.25;
        this.bounceXDelay = 0.93;
        this.xForceAccelDelay = 0.8 * this.bounceXDelay;
        this.isControlLocked = false;
        this._lockControlTimout = 0;
        this.leftDown = 0;
        this.rightDown = 0;
        this.animateSpeed = Mummu.AnimationFactory.EmptyNumberCallback;
        this.mouseInControl = false;
        this._pointerDown = false;
        this.mouseDown = (ev) => {
            if (this.mouseCanControl) {
                this.mouseInControl = true;
                this._pointerDown = true;
            }
        };
        this.mouseUp = (ev) => {
            if (this.mouseCanControl) {
                this.mouseInControl = true;
                this._pointerDown = false;
            }
        };
        this.xForce = 1;
        this.speed = this.nominalSpeed;
        this.moveDir = BABYLON.Vector3.Forward();
        this.smoothedMoveDir = BABYLON.Vector3.Forward();
        this.inputSpeed = 1000;
        this.bounceXValue = 0;
        this.bounceXTimer = 0;
        this.trailTimer = 0;
        this.trailPoints = [];
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
        this.shadow.position.x = -0.015;
        this.shadow.position.y = 0.1;
        this.shadow.position.z = -0.015;
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
        document.addEventListener("keydown", (ev) => {
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
        });
        document.addEventListener("keyup", (ev) => {
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
        });
        let inputLeft = document.querySelector("#input-left");
        if (inputLeft) {
            inputLeft.addEventListener("pointerdown", () => {
                this.leftDown = 1;
                this.mouseInControl = false;
            });
            inputLeft.addEventListener("pointerup", () => {
                this.mouseInControl = false;
                this.leftDown = 0;
            });
        }
        let inputRight = document.querySelector("#input-right");
        if (inputRight) {
            inputRight.addEventListener("pointerdown", () => {
                this.mouseInControl = false;
                this.rightDown = 1;
            });
            inputRight.addEventListener("pointerup", () => {
                this.mouseInControl = false;
                this.rightDown = 0;
            });
        }
        this.game.canvas.addEventListener("pointerdown", this.mouseDown);
        this.game.canvas.addEventListener("pointerup", this.mouseUp);
        this.game.canvas.addEventListener("pointerleave", this.mouseUp);
        this.game.canvas.addEventListener("pointerout", this.mouseUp);
    }
    get leftArrowSize() {
        return this.leftArrow.scaling.x;
    }
    set leftArrowSize(v) {
        this.leftArrow.scaling.copyFromFloats(v, v, v);
    }
    get rightArrowSize() {
        return this.rightArrow.scaling.x;
    }
    set rightArrowSize(v) {
        this.rightArrow.scaling.copyFromFloats(v, v, v);
    }
    lockControl(duration = 0.2) {
        clearTimeout(this._lockControlTimout);
        this.isControlLocked = true;
        this._lockControlTimout = setTimeout(() => {
            this.isControlLocked = false;
        }, duration * 1000);
    }
    setColor(color) {
        this.color = color;
        if (this.ballTop) {
            this.ballTop.material = this.game.tileColorShinyMaterials[this.color];
        }
    }
    get i() {
        return Math.round(this.position.x / 1.1);
    }
    set i(v) {
        this.position.x = v * 1.1;
        this.rightArrow.position.copyFrom(this.position);
        this.rightArrow.position.y += 0.1;
        this.leftArrow.position.copyFrom(this.position);
        this.leftArrow.position.y += 0.1;
    }
    get j() {
        return Math.round(this.position.z / 1.1);
    }
    set j(v) {
        this.position.z = v * 1.1;
        this.rightArrow.position.copyFrom(this.position);
        this.rightArrow.position.y += 0.1;
        this.leftArrow.position.copyFrom(this.position);
        this.leftArrow.position.y += 0.1;
    }
    get game() {
        return this.puzzle.game;
    }
    get wasdCanControl() {
        return this.puzzle.ballsCount === 1 || this.ballIndex === 0;
    }
    get arrowCanControl() {
        return this.puzzle.ballsCount === 1 || this.ballIndex === 1;
    }
    get mouseCanControl() {
        return this.puzzle.ballsCount === 1 || this.ballIndex === 0;
    }
    async instantiate() {
        let ballDatas;
        if (this.dropletMode) {
            ballDatas = await this.game.vertexDataLoader.get("./datas/meshes/ball-droplet.babylon");
        }
        else {
            ballDatas = await this.game.vertexDataLoader.get("./datas/meshes/ball.babylon");
        }
        ballDatas[0].applyToMesh(this);
        ballDatas[1].applyToMesh(this.ballTop);
        BABYLON.CreateGroundVertexData({ width: 1.3, height: 1.3 }).applyToMesh(this.shadow);
        BABYLON.CreateGroundVertexData({ width: 2.2 * 2 * this.radius, height: 2.2 * 2 * this.radius }).applyToMesh(this.leftArrow);
        BABYLON.CreateGroundVertexData({ width: 2.2 * 2 * this.radius, height: 2.2 * 2 * this.radius }).applyToMesh(this.rightArrow);
    }
    setVisible(v) {
        this.isVisible = v;
        this.ballTop.isVisible = v;
        this.shadow.isVisible = v;
        this.leftArrow.isVisible = v;
        this.rightArrow.isVisible = v;
        if (!v) {
            this.trailMesh.isVisible = false;
        }
    }
    update(dt) {
        if (this.mouseCanControl && this.mouseInControl) {
            this.rightDown = 0;
            this.leftDown = 0;
            if (this._pointerDown) {
                let pick = this.game.scene.pick(this.game.scene.pointerX * window.devicePixelRatio, this.game.scene.pointerY * window.devicePixelRatio, (mesh) => {
                    return mesh.name === "floor" || mesh.name === "building-floor" || mesh === this.puzzle.invisiFloorTM;
                });
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
            let p = BABYLON.Vector3.Zero();
            if (this.dropletMode) {
                p = new BABYLON.Vector3(0, 0.1, -0.8);
            }
            else {
                p.copyFrom(this.smoothedMoveDir).scaleInPlace(-0.3);
                p.y += 0.1;
            }
            BABYLON.Vector3.TransformCoordinatesToRef(p, this.getWorldMatrix(), p);
            if (this.trailTimer > 0.02) {
                this.trailTimer = 0;
                let last = this.trailPoints[this.trailPoints.length - 1];
                if (last) {
                    p.scaleInPlace(0.6).addInPlace(last.scale(0.4));
                }
                this.trailPoints.push(p);
                let count = 40;
                //count = 200; // debug
                if (this.trailPoints.length > count) {
                    this.trailPoints.splice(0, 1);
                }
            }
            if (this.trailPoints.length > 2) {
                let points = this.trailPoints.map(pt => { return pt.clone(); });
                Mummu.CatmullRomPathInPlace(points);
                points.push(p);
                let data = CreateTrailVertexData({
                    path: points,
                    radiusFunc: (f) => {
                        return 0.08 * f;
                        //return 0.01;
                    },
                    color: new BABYLON.Color4(0.2, 0.2, 0.2, 1)
                });
                data.applyToMesh(this.trailMesh);
                this.trailMesh.isVisible = true;
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
                this.bounceXTimer -= dt * this.speed;
                this.xForce = 1;
            }
            else {
                let fXForce = Nabu.Easing.smoothNSec(1 / dt, this.xForceAccelDelay);
                this.xForce = this.xForce * fXForce + 2 * (1 - fXForce);
            }
            let speed;
            if (!this.water) {
                this.moveDir.copyFromFloats(this.xForce * vX * (1.2 - 2 * this.radius) / 0.55, 0, this.vZ).normalize();
                speed = this.moveDir.scale(this.speed);
            }
            else {
                let path = this.water.path;
                let proj = {
                    point: BABYLON.Vector3.Zero(),
                    index: 0
                };
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
                speed = this.moveDir.scale(this.speed * 0.5);
            }
            this.position.addInPlace(speed.scale(dt));
            if (this.position.z + this.radius > this.puzzle.zMax) {
                this.position.z = this.puzzle.zMax - this.radius;
                this.vZ = -1;
                if (!this.water) {
                    this.woodChocSound2.play();
                }
            }
            else if (this.position.z - this.radius < this.puzzle.zMin) {
                this.position.z = this.puzzle.zMin + this.radius;
                this.vZ = 1;
                if (!this.water) {
                    this.woodChocSound2.play();
                }
            }
            if (this.position.x + this.radius > this.puzzle.xMax) {
                this.position.x = this.puzzle.xMax - this.radius;
                this.bounceXValue = -1;
                this.bounceXTimer = this.bounceXDelay;
                this.woodChocSound2.play();
            }
            else if (this.position.x - this.radius < this.puzzle.xMin) {
                this.position.x = this.puzzle.xMin + this.radius;
                this.bounceXValue = 1;
                this.bounceXTimer = this.bounceXDelay;
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
                            this.bounceXValue = -1;
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
                                    this.ballState = BallState.Fall;
                                    this.fallTimer = 0;
                                    this.hole = tile;
                                    return;
                                }
                            }
                            else if (tile instanceof WaterTile && tile.distFromSource > 0) {
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
                                                this.bounceXValue = -1;
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
            let hit = this.game.scene.pickWithRay(ray, (mesh) => {
                return mesh.name === "floor" || mesh.name === "building-floor";
            });
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
                    this.puzzle.fishingPolesCount--;
                    this.ballState = BallState.Flybacking;
                    this.trailPoints = [];
                    this.trailMesh.isVisible = false;
                    this.puzzle.fishingPole.fish(this.position.clone(), this.puzzle.ballsPositionZero[this.ballIndex].add(new BABYLON.Vector3(0, 0.2, 0)), () => {
                        this.position.copyFromFloats(0, 0, 0);
                        this.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, -Math.PI * 0.2);
                        this.parent = this.puzzle.fishingPole.lineMesh;
                    }, () => {
                        this.position.copyFrom(this.puzzle.ballsPositionZero[this.ballIndex]);
                        this.parent = undefined;
                        this.ballState = BallState.Move;
                        this.bounceXValue = 0;
                        this.bounceXTimer = 0;
                        this.speed = 0;
                        this.vZ *= -1;
                        this.animateSpeed(this.nominalSpeed, 0.5, Nabu.Easing.easeInCubic);
                    });
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
}
var TileState;
(function (TileState) {
    TileState[TileState["Active"] = 0] = "Active";
    TileState[TileState["Dying"] = 1] = "Dying";
    TileState[TileState["Moving"] = 2] = "Moving";
})(TileState || (TileState = {}));
class Tile extends BABYLON.Mesh {
    constructor(game, props) {
        super("tile");
        this.game = game;
        this.props = props;
        this.tileState = TileState.Active;
        this.animateSize = Mummu.AnimationFactory.EmptyNumberCallback;
        this.color = props.color;
        if (isFinite(props.i)) {
            this.i = props.i;
        }
        if (isFinite(props.j)) {
            this.j = props.j;
        }
        if (isFinite(props.h)) {
            this.position.y = props.h;
        }
        this.game.puzzle.tiles.push(this);
        this.game.puzzle.updateGriddedStack(this, true);
        if (props.noShadow != true) {
            this.shadow = new BABYLON.Mesh("shadow");
            this.shadow.position.x = -0.015;
            this.shadow.position.y = 0.01;
            this.shadow.position.z = -0.015;
            this.shadow.parent = this;
            this.shadow.material = this.game.shadow9Material;
        }
        this.animateSize = Mummu.AnimationFactory.CreateNumber(this, this, "size");
    }
    get size() {
        return this.scaling.x;
    }
    set size(s) {
        this.scaling.copyFromFloats(s, s, s);
    }
    get i() {
        return Math.round(this.position.x / 1.1);
    }
    set i(v) {
        this.position.x = v * 1.1;
    }
    get j() {
        return Math.round(this.position.z / 1.1);
    }
    set j(v) {
        this.position.z = v * 1.1;
    }
    async instantiate() {
        if (this.props.noShadow != true) {
            let m = 0.06;
            let shadowData = Mummu.Create9SliceVertexData({
                width: 1 + 2 * m,
                height: 1 + 2 * m,
                margin: m
            });
            Mummu.RotateVertexDataInPlace(shadowData, BABYLON.Quaternion.FromEulerAngles(Math.PI * 0.5, 0, 0));
            shadowData.applyToMesh(this.shadow);
        }
    }
    async bump() {
        await this.animateSize(1.1, 0.1);
        await this.animateSize(1, 0.1);
    }
    async shrink() {
        await this.animateSize(1.1, 0.1);
        await this.animateSize(0.4, 0.3);
    }
    dispose() {
        let index = this.game.puzzle.tiles.indexOf(this);
        if (index != -1) {
            this.game.puzzle.tiles.splice(index, 1);
        }
        this.game.puzzle.removeFromGriddedStack(this);
        super.dispose();
    }
    collide(ball, impact) {
        if (Math.abs(ball.position.y - this.position.y) > 0.5) {
            return false;
        }
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
        let dx = ball.position.x - Nabu.MinMax(ball.position.x, this.position.x - 0.5, this.position.x + 0.5);
        let dz = ball.position.z - Nabu.MinMax(ball.position.z, this.position.z - 0.5, this.position.z + 0.5);
        let dd = dx * dx + dz * dz;
        if (dd < ball.radius * ball.radius) {
            impact.x = Nabu.MinMax(ball.position.x, this.position.x - 0.5, this.position.x + 0.5);
            impact.y = ball.position.y;
            impact.z = Nabu.MinMax(ball.position.z, this.position.z - 0.5, this.position.z + 0.5);
            return true;
        }
        return false;
    }
    getWinPath(dest) {
        let origin = this.position.clone();
        let dir = dest.subtract(origin).normalize();
        let c = (t) => {
            let p = BABYLON.Vector3.Lerp(origin, dest, t);
            p.y += 2 * Math.sin(t * Math.PI);
            return p;
        };
        let a0 = 2 * Math.PI * Math.random();
        let spireCount = (Math.floor(Math.random() * 6) + 2);
        let a = (t) => {
            return a0 + t * spireCount * Math.PI;
        };
        let r = (t) => {
            return Math.sin(t * Math.PI);
        };
        let p = (t) => {
            let p = dir.scale(r(t));
            Mummu.RotateInPlace(p, BABYLON.Axis.Y, a(t));
            p.addInPlace(c(t));
            return p;
        };
        let path = [];
        for (let i = 0; i <= 100; i++) {
            path[i] = p(i / 100);
        }
        return path;
    }
    shootStar() {
        let dy = 0.4;
        let dest = this.game.puzzle.fetchWinSlotPos(this.color);
        dest.y += dy;
        let path = this.getWinPath(dest);
        let star = BABYLON.MeshBuilder.CreateBox("star", { size: 0.4 });
        this.game.puzzle.stars.push(star);
        let tileData = CreateBoxFrameVertexData({
            w: 1,
            d: 1,
            h: 0.35,
            thickness: 0.05,
            flatShading: true,
            topCap: false,
            bottomCap: true,
        });
        tileData.applyToMesh(star);
        star.material = this.material;
        star.position.copyFrom(this.position);
        let starTop = BABYLON.CreateGround("startop", { width: 0.9, height: 0.9 });
        starTop.position.y = 0.3;
        starTop.parent = star;
        starTop.material = this.game.tileColorMaterials[this.color];
        star.scaling.copyFromFloats(0.4, 0.4, 0.4);
        let tail = new BABYLON.Mesh("tail");
        tail.visibility = 1;
        let tailMaterial = new BABYLON.StandardMaterial("tail-material");
        tailMaterial.specularColor.copyFromFloats(0, 0, 0);
        tailMaterial.emissiveColor.copyFromFloats(0.5, 0.5, 0.5);
        tail.material = tailMaterial;
        let tailPoints = [];
        this.game.puzzle.wooshSound.play();
        let t0 = performance.now();
        let duration = 1.5;
        let step = () => {
            if (star.isDisposed()) {
                tail.dispose();
                return;
            }
            let f = (performance.now() - t0) / 1000 / duration;
            if (f < 1) {
                f = Nabu.Easing.easeOutSine(f);
                Mummu.EvaluatePathToRef(f, path, star.position);
                star.rotation.y = f * 2 * Math.PI;
                let n = Math.floor(f * path.length);
                if (f < 0.5) {
                    if (0 < n - 3 - 1) {
                        tailPoints = path.slice(0, n - 3);
                    }
                    else {
                        tailPoints = [];
                    }
                }
                else {
                    let start = Math.floor((-1.1 + 2.2 * f) * path.length);
                    if (start < n - 3 - 1) {
                        tailPoints = path.slice(start, n - 3);
                    }
                    else {
                        tailPoints = [];
                    }
                }
                if (tailPoints.length > 2) {
                    let data = CreateTrailVertexData({
                        path: [...tailPoints],
                        up: BABYLON.Axis.Y,
                        radiusFunc: (f) => {
                            return 0.02 * f + 0.01;
                        },
                        color: new BABYLON.Color4(1, 1, 1, 1)
                    });
                    data.applyToMesh(tail);
                    tail.isVisible = true;
                }
                else {
                    tail.isVisible = false;
                }
                requestAnimationFrame(step);
            }
            else {
                tail.dispose();
                star.position.copyFrom(dest);
                star.setParent(this.game.puzzle.border);
                let index = this.game.puzzle.stars.indexOf(star);
                if (index != -1) {
                    this.game.puzzle.stars.splice(index, 1);
                }
                let animateY = Mummu.AnimationFactory.CreateNumber(star, star.position, "y");
                animateY(star.position.y - dy, 0.4, Nabu.Easing.easeInOutSine).then(() => {
                    star.freezeWorldMatrix();
                    starTop.freezeWorldMatrix();
                    let flash = Mummu.Create9Slice("flash", {
                        width: 1.2,
                        height: 1.2,
                        margin: 0.1
                    });
                    flash.material = this.game.whiteShadow9Material;
                    flash.parent = star;
                    flash.position.y = 0.29;
                    flash.rotation.x = Math.PI * 0.5;
                    SineFlashVisibility(flash, 0.3).then(() => {
                        flash.dispose();
                    });
                    this.game.puzzle.clickSound.play();
                });
            }
        };
        step();
    }
}
/// <reference path="./Tile.ts"/>
class BlockTile extends Tile {
    constructor(game, props) {
        super(game, props);
        this.color = props.color;
        this.material = this.game.brownMaterial;
        this.tileTop = new BABYLON.Mesh("tile-top");
        this.tileTop.parent = this;
        this.tileTop.material = this.game.tileColorMaterials[this.color];
        this.renderOutline = true;
        this.outlineColor = BABYLON.Color3.Black();
        this.outlineWidth = 0.02;
    }
    async instantiate() {
        await super.instantiate();
        let tileData = CreateBoxFrameVertexData({
            w: 1,
            d: 1,
            h: 0.35,
            thickness: 0.05,
            flatShading: false,
            topCap: false,
            bottomCap: true,
        });
        tileData.applyToMesh(this);
        this.tileTop.position.y = 0.3;
        BABYLON.CreateGroundVertexData({ width: 0.9, height: 0.9 }).applyToMesh(this.tileTop);
    }
}
class Border extends BABYLON.Mesh {
    constructor(game, ghost = false) {
        super("tile");
        this.game = game;
        this.ghost = ghost;
        this.w = 0;
        this.d = 1;
        this.material = this.game.borderMaterial;
        this.renderOutline = true;
        this.outlineColor = BABYLON.Color3.Black();
        this.outlineWidth = 0.01;
    }
    get vertical() {
        return this.rotation.y === 0;
    }
    set vertical(v) {
        this.rotation.y = v ? 0 : Math.PI * 0.5;
        this.w = v ? 0 : 1;
        this.d = v ? 1 : 0;
    }
    get i() {
        return Math.floor(this.position.x / 1.1);
    }
    get j() {
        return Math.floor(this.position.z / 1.1);
    }
    static BorderLeft(game, i, j, y = 0, ghost = false) {
        let border = new Border(game, ghost);
        border.position.x = (i - 0.5) * 1.1;
        border.position.y = y;
        border.position.z = j * 1.1;
        border.game.puzzle.updateGriddedBorderStack(border, true);
        return border;
    }
    static BorderRight(game, i, j, y = 0, ghost = false) {
        let border = new Border(game, ghost);
        border.position.x = (i + 0.5) * 1.1;
        border.position.y = y;
        border.position.z = j * 1.1;
        border.game.puzzle.updateGriddedBorderStack(border, true);
        return border;
    }
    static BorderTop(game, i, j, y = 0, ghost = false) {
        let border = new Border(game, ghost);
        border.vertical = false;
        border.position.x = i * 1.1;
        border.position.y = y;
        border.position.z = (j + 0.5) * 1.1;
        border.game.puzzle.updateGriddedBorderStack(border, true);
        return border;
    }
    static BorderBottom(game, i, j, y = 0, ghost = false) {
        let border = new Border(game, ghost);
        border.vertical = false;
        border.position.x = i * 1.1;
        border.position.y = y;
        border.position.z = (j - 0.5) * 1.1;
        border.game.puzzle.updateGriddedBorderStack(border, true);
        return border;
    }
    async instantiate() {
        if (!this.ghost) {
            let borderDatas = await this.game.vertexDataLoader.get("./datas/meshes/border.babylon");
            if (this.vertical) {
                let jPlusStack = this.game.puzzle.getGriddedBorderStack(this.i, this.j + 1);
                let jPlusConn = jPlusStack && jPlusStack.array.find(brd => { return brd.position.y === this.position.y && brd.vertical === this.vertical; });
                let jMinusStack = this.game.puzzle.getGriddedBorderStack(this.i, this.j - 1);
                let jMinusConn = jMinusStack && jMinusStack.array.find(brd => { return brd.position.y === this.position.y && brd.vertical === this.vertical; });
                if (jPlusConn && jMinusConn) {
                    borderDatas[0].applyToMesh(this);
                }
                else if (jPlusConn) {
                    Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(borderDatas[3]), Math.PI, BABYLON.Axis.Y).applyToMesh(this);
                }
                else if (jMinusConn) {
                    borderDatas[3].applyToMesh(this);
                }
                else {
                    borderDatas[4].applyToMesh(this);
                }
            }
            else {
                let iPlusStack = this.game.puzzle.getGriddedBorderStack(this.i + 1, this.j);
                let iPlusConn = iPlusStack && iPlusStack.array.find(brd => { return brd.position.y === this.position.y && !brd.vertical; });
                let iMinusStack = this.game.puzzle.getGriddedBorderStack(this.i - 1, this.j);
                let iMinusConn = iMinusStack && iMinusStack.array.find(brd => { return brd.position.y === this.position.y && !brd.vertical; });
                if (iPlusConn && iMinusConn) {
                    borderDatas[0].applyToMesh(this);
                }
                else if (iPlusConn) {
                    Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(borderDatas[1]), Math.PI, BABYLON.Axis.Y).applyToMesh(this);
                }
                else if (iMinusConn) {
                    borderDatas[1].applyToMesh(this);
                }
                else {
                    borderDatas[2].applyToMesh(this);
                }
            }
        }
    }
    dispose() {
        this.game.puzzle.removeFromGriddedBorderStack(this);
        super.dispose();
    }
    collide(ball, impact) {
        if (Math.abs(ball.position.y - this.position.y) > 0.6) {
            return false;
        }
        if (ball.position.x + ball.radius < this.position.x - 0.5 * this.w) {
            return false;
        }
        if (ball.position.x - ball.radius > this.position.x + 0.5 * this.w) {
            return false;
        }
        if (ball.position.z + ball.radius < this.position.z - 0.5 * this.d) {
            return false;
        }
        if (ball.position.z - ball.radius > this.position.z + 0.5 * this.d) {
            return false;
        }
        let dx = ball.position.x - Nabu.MinMax(ball.position.x, this.position.x - 0.5 * this.w, this.position.x + 0.5 * this.w);
        let dz = ball.position.z - Nabu.MinMax(ball.position.z, this.position.z - 0.5 * this.d, this.position.z + 0.5 * this.d);
        let dd = dx * dx + dz * dz;
        if (dd < ball.radius * ball.radius) {
            impact.x = Nabu.MinMax(ball.position.x, this.position.x - 0.5 * this.w, this.position.x + 0.5 * this.w);
            impact.y = ball.position.y;
            impact.z = Nabu.MinMax(ball.position.z, this.position.z - 0.5 * this.d, this.position.z + 0.5 * this.d);
            return true;
        }
        return false;
    }
}
class Build extends BABYLON.Mesh {
    constructor(game, props) {
        super("tile");
        this.game = game;
        this.props = props;
        this.borders = [];
        if (isFinite(props.i)) {
            this.position.x = props.i * 1.1;
        }
        if (isFinite(props.j)) {
            this.position.z = props.j * 1.1;
        }
        this.floor = new BABYLON.Mesh("building-floor");
        this.floor.parent = this;
        this.floor.material = this.game.woodFloorMaterial;
        this.shadow = new BABYLON.Mesh("shadow");
        this.shadow.position.y = 0.005;
        this.shadow.parent = this;
        this.shadow.material = this.game.shadow9Material;
        let index = this.game.puzzle.buildings.indexOf(this);
        if (index === -1) {
            this.game.puzzle.buildings.push(this);
        }
    }
    get puzzle() {
        return this.game.puzzle;
    }
    get i() {
        return Math.round(this.position.x / 1.1);
    }
    set i(v) {
        this.position.x = v * 1.1;
        this.freeze();
    }
    get j() {
        return Math.round(this.position.z / 1.1);
    }
    set j(v) {
        this.position.z = v * 1.1;
        this.freeze();
    }
    async instantiate() { }
    async bump() {
    }
    fillHeightmap() { }
    regenerateBorders() { }
    dispose() {
        let index = this.game.puzzle.buildings.indexOf(this);
        if (index != -1) {
            this.game.puzzle.buildings.splice(index, 1);
        }
        for (let i = 0; i < this.borders.length; i++) {
            this.borders[i].dispose();
        }
        super.dispose();
    }
    freeze() {
        this.freezeWorldMatrix();
        this.getChildMeshes().forEach(child => {
            child.freezeWorldMatrix();
        });
    }
}
class Ramp extends Build {
    constructor(game, props) {
        super(game, props);
        this.material = this.game.brickWallMaterial;
        this.builtInBorderLeft = new BABYLON.Mesh("ramp-border");
        this.builtInBorderLeft.position.x = -0.55;
        this.builtInBorderLeft.parent = this;
        this.builtInBorderLeft.material = this.game.borderMaterial;
        this.builtInBorderLeft.renderOutline = true;
        this.builtInBorderLeft.outlineColor = BABYLON.Color3.Black();
        this.builtInBorderLeft.outlineWidth = 0.01;
        this.builtInBorderRight = new BABYLON.Mesh("ramp-border");
        this.builtInBorderRight.position.x = 1.5 * 1.1;
        this.builtInBorderRight.parent = this;
        this.builtInBorderRight.material = this.game.borderMaterial;
        this.builtInBorderRight.renderOutline = true;
        this.builtInBorderRight.outlineColor = BABYLON.Color3.Black();
        this.builtInBorderRight.outlineWidth = 0.01;
    }
    fillHeightmap() {
        for (let ii = 0; ii < 2; ii++) {
            for (let jj = 0; jj < 3; jj++) {
                this.game.puzzle.hMapSet((jj + 1) / 3, this.i + ii, this.j + jj);
            }
        }
    }
    regenerateBorders() {
        while (this.borders.length > 0) {
            this.borders.pop().dispose();
        }
        this.borders.push(Border.BorderLeft(this.game, this.i, this.j, 0, true));
        this.borders.push(Border.BorderLeft(this.game, this.i, this.j + 1, 0.5, true));
        this.borders.push(Border.BorderLeft(this.game, this.i, this.j + 2, 0, true));
        this.borders.push(Border.BorderLeft(this.game, this.i, this.j + 2, 1, true));
        this.borders.push(Border.BorderRight(this.game, this.i + 1, this.j, 0, true));
        this.borders.push(Border.BorderRight(this.game, this.i + 1, this.j + 1, 0.5, true));
        this.borders.push(Border.BorderRight(this.game, this.i + 1, this.j + 2, 0, true));
        this.borders.push(Border.BorderRight(this.game, this.i + 1, this.j + 2, 1, true));
        this.borders.push(Border.BorderTop(this.game, this.i, this.j + 2, 0, true));
        this.borders.push(Border.BorderTop(this.game, this.i + 1, this.j + 2, 0, true));
        this.props.borderLeft = true;
        this.props.borderRight = true;
        if (this.puzzle.hMapGet(this.i, this.j + 2) != 1 || this.puzzle.hMapGet(this.i + 1, this.j + 2) != 1) {
            this.props.borderTop = true;
            this.borders.push(Border.BorderTop(this.game, this.i, this.j + 2, 1));
            this.borders.push(Border.BorderTop(this.game, this.i + 1, this.j + 2, 1));
        }
    }
    async instantiate() {
        for (let i = 0; i < this.borders.length; i++) {
            await this.borders[i].instantiate();
        }
        let data = await this.game.vertexDataLoader.get("./datas/meshes/ramp.babylon");
        data[0].applyToMesh(this);
        let floorData = Mummu.CloneVertexData(data[1]);
        for (let i = 0; i < floorData.positions.length / 3; i++) {
            floorData.uvs[2 * i] = 0.55 * (floorData.positions[3 * i] + this.position.x);
            floorData.uvs[2 * i + 1] = 0.55 * (floorData.positions[3 * i + 2] + this.position.z);
        }
        floorData.applyToMesh(this.floor);
        let jPlusLeftStack = this.game.puzzle.getGriddedBorderStack(this.i - 1, this.j + 3);
        let jPlusLeftConn = jPlusLeftStack && jPlusLeftStack.array.find(brd => { return brd.position.y === this.position.y + 1 && brd.vertical === true; });
        if (jPlusLeftConn) {
            data[2].applyToMesh(this.builtInBorderLeft);
        }
        else {
            data[3].applyToMesh(this.builtInBorderLeft);
        }
        let jPlusRightStack = this.game.puzzle.getGriddedBorderStack(this.i + 1, this.j + 3);
        let jPlusRightConn = jPlusRightStack && jPlusRightStack.array.find(brd => { return brd.position.y === this.position.y + 1 && brd.vertical === true; });
        if (jPlusRightConn) {
            data[2].applyToMesh(this.builtInBorderRight);
        }
        else {
            data[3].applyToMesh(this.builtInBorderRight);
        }
        let m = 0.2;
        let shadowData = Mummu.Create9SliceVertexData({
            width: 2.2 + 2 * m,
            height: 3.3 + m,
            margin: m,
            cutTop: true
        });
        Mummu.RotateVertexDataInPlace(shadowData, BABYLON.Quaternion.FromEulerAngles(Math.PI * 0.5, 0, 0));
        Mummu.TranslateVertexDataInPlace(shadowData, new BABYLON.Vector3(0.55, 0, 1.1 + 0.5 * m));
        shadowData.applyToMesh(this.shadow);
    }
}
class BuildingBlock {
    static async GenerateVertexDatas(puzzle) {
        let walls = [];
        let woods = [];
        let floors = [];
        let boxChuncks = await puzzle.game.vertexDataLoader.get("./datas/meshes/building-unit.babylon");
        let boxesGrid = [];
        for (let i = 0; i <= puzzle.w + 1; i++) {
            boxesGrid[i] = [];
            for (let j = 0; j <= puzzle.h + 1; j++) {
                boxesGrid[i][j] = 0;
            }
        }
        for (let i = 0; i < puzzle.w; i++) {
            for (let j = 0; j < puzzle.h; j++) {
                let b = puzzle.buildingBlockGet(i, j);
                if (b > 0) {
                    boxesGrid[1 + i][1 + j] = 1;
                }
            }
        }
        for (let i = 0; i < boxesGrid.length - 1; i++) {
            for (let j = 0; j < boxesGrid[i].length - 1; j++) {
                let wall;
                let wood;
                let floor;
                let ref = boxesGrid[i][j].toFixed(0) + "" + boxesGrid[i + 1][j].toFixed(0) + "" + boxesGrid[i + 1][j + 1].toFixed(0) + "" + boxesGrid[i][j + 1].toFixed(0);
                if (ref === "1000") {
                    wall = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[3]), Math.PI, BABYLON.Axis.Y);
                    wood = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[4]), Math.PI, BABYLON.Axis.Y);
                    floor = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[5]), Math.PI, BABYLON.Axis.Y);
                }
                if (ref === "0100") {
                    wall = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[3]), Math.PI * 0.5, BABYLON.Axis.Y);
                    wood = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[4]), Math.PI * 0.5, BABYLON.Axis.Y);
                    floor = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[5]), Math.PI * 0.5, BABYLON.Axis.Y);
                }
                if (ref === "0010") {
                    wall = Mummu.CloneVertexData(boxChuncks[3]);
                    wood = Mummu.CloneVertexData(boxChuncks[4]);
                    floor = Mummu.CloneVertexData(boxChuncks[5]);
                }
                if (ref === "0001") {
                    wall = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[3]), -Math.PI * 0.5, BABYLON.Axis.Y);
                    wood = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[4]), -Math.PI * 0.5, BABYLON.Axis.Y);
                    floor = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[5]), -Math.PI * 0.5, BABYLON.Axis.Y);
                }
                if (ref === "1100") {
                    wall = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[0]), Math.PI, BABYLON.Axis.Y);
                    wood = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[1]), Math.PI, BABYLON.Axis.Y);
                    floor = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[2]), Math.PI, BABYLON.Axis.Y);
                }
                if (ref === "0110") {
                    wall = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[0]), Math.PI * 0.5, BABYLON.Axis.Y);
                    wood = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[1]), Math.PI * 0.5, BABYLON.Axis.Y);
                    floor = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[2]), Math.PI * 0.5, BABYLON.Axis.Y);
                }
                if (ref === "0011") {
                    wall = Mummu.CloneVertexData(boxChuncks[0]);
                    wood = Mummu.CloneVertexData(boxChuncks[1]);
                    floor = Mummu.CloneVertexData(boxChuncks[2]);
                }
                if (ref === "1001") {
                    wall = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[0]), -Math.PI * 0.5, BABYLON.Axis.Y);
                    wood = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[1]), -Math.PI * 0.5, BABYLON.Axis.Y);
                    floor = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[2]), -Math.PI * 0.5, BABYLON.Axis.Y);
                }
                if (ref === "1101") {
                    wall = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[6]), Math.PI, BABYLON.Axis.Y);
                    wood = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[7]), Math.PI, BABYLON.Axis.Y);
                    floor = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[8]), Math.PI, BABYLON.Axis.Y);
                }
                if (ref === "1110") {
                    wall = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[6]), Math.PI * 0.5, BABYLON.Axis.Y);
                    wood = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[7]), Math.PI * 0.5, BABYLON.Axis.Y);
                    floor = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[8]), Math.PI * 0.5, BABYLON.Axis.Y);
                }
                if (ref === "0111") {
                    wall = Mummu.CloneVertexData(boxChuncks[6]);
                    wood = Mummu.CloneVertexData(boxChuncks[7]);
                    floor = Mummu.CloneVertexData(boxChuncks[8]);
                }
                if (ref === "1011") {
                    wall = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[6]), -Math.PI * 0.5, BABYLON.Axis.Y);
                    wood = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[7]), -Math.PI * 0.5, BABYLON.Axis.Y);
                    floor = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(boxChuncks[8]), -Math.PI * 0.5, BABYLON.Axis.Y);
                }
                if (ref === "1111") {
                    floor = BABYLON.CreatePlaneVertexData({ size: 1.1 });
                    Mummu.RotateAngleAxisVertexDataInPlace(floor, Math.PI * 0.5, BABYLON.Axis.X);
                    Mummu.TranslateVertexDataInPlace(floor, BABYLON.Vector3.Up());
                }
                if (wall) {
                    Mummu.TranslateVertexDataInPlace(wall, new BABYLON.Vector3((i - 0.5) * 1.1, 0, (j - 0.5) * 1.1));
                    walls.push(wall);
                }
                if (wood) {
                    Mummu.TranslateVertexDataInPlace(wood, new BABYLON.Vector3((i - 0.5) * 1.1, 0, (j - 0.5) * 1.1));
                    woods.push(wood);
                }
                if (floor) {
                    Mummu.TranslateVertexDataInPlace(floor, new BABYLON.Vector3((i - 0.5) * 1.1, 0, (j - 0.5) * 1.1));
                    floors.push(floor);
                }
            }
        }
        if (walls.length > 0) {
            let floorsData = Mummu.MergeVertexDatas(...floors);
            for (let i = 0; i < floorsData.positions.length / 3; i++) {
                floorsData.uvs[2 * i] = 0.55 * floorsData.positions[3 * i];
                floorsData.uvs[2 * i + 1] = 0.55 * floorsData.positions[3 * i + 2];
            }
            return [
                Mummu.MergeVertexDatas(...walls),
                Mummu.MergeVertexDatas(...woods),
                floorsData
            ];
        }
        return [
            new BABYLON.VertexData(),
            new BABYLON.VertexData(),
            new BABYLON.VertexData()
        ];
    }
}
class OldBoxDeprecated extends Build {
    constructor(game, props) {
        super(game, props);
        this.material = this.game.woodMaterial;
        //this.roof = new BABYLON.Mesh("box-roof");
        //this.roof.parent = this;
        //this.roof.material = this.game.roofMaterial;
        this.wall = new BABYLON.Mesh("box-wall");
        this.wall.parent = this;
        this.wall.material = this.game.wallMaterial;
    }
    fillHeightmap() {
        for (let ii = 0; ii < 2; ii++) {
            for (let jj = 0; jj < 2; jj++) {
                this.game.puzzle.hMapSet(1, this.i + ii, this.j + jj);
            }
        }
    }
    regenerateBorders() {
        while (this.borders.length > 0) {
            this.borders.pop().dispose();
        }
        this.borders.push(Border.BorderLeft(this.game, this.i, this.j, 0, true));
        this.borders.push(Border.BorderLeft(this.game, this.i, this.j + 1, 0, true));
        this.borders.push(Border.BorderRight(this.game, this.i + 1, this.j, 0, true));
        this.borders.push(Border.BorderRight(this.game, this.i + 1, this.j + 1, 0, true));
        this.borders.push(Border.BorderBottom(this.game, this.i, this.j, 0, true));
        this.borders.push(Border.BorderBottom(this.game, this.i + 1, this.j, 0, true));
        this.borders.push(Border.BorderTop(this.game, this.i, this.j + 1, 0, true));
        this.borders.push(Border.BorderTop(this.game, this.i + 1, this.j + 1, 0, true));
        this.props.borderLeft = false;
        this.props.borderRight = false;
        this.props.borderBottom = false;
        this.props.borderTop = false;
        if (this.puzzle.hMapGet(this.i - 1, this.j) != 1) {
            this.props.borderLeft = true;
            this.borders.push(Border.BorderLeft(this.game, this.i, this.j, 1));
        }
        if (this.puzzle.hMapGet(this.i - 1, this.j + 1) != 1) {
            this.props.borderLeft = true;
            this.borders.push(Border.BorderLeft(this.game, this.i, this.j + 1, 1));
        }
        if (this.puzzle.hMapGet(this.i + 2, this.j) != 1) {
            this.props.borderRight = true;
            this.borders.push(Border.BorderRight(this.game, this.i + 1, this.j, 1));
        }
        if (this.puzzle.hMapGet(this.i + 2, this.j + 1) != 1) {
            this.props.borderRight = true;
            this.borders.push(Border.BorderRight(this.game, this.i + 1, this.j + 1, 1));
        }
        if (this.puzzle.hMapGet(this.i, this.j - 1) != 1) {
            this.props.borderBottom = true;
            this.borders.push(Border.BorderBottom(this.game, this.i, this.j, 1));
        }
        if (this.puzzle.hMapGet(this.i + 1, this.j - 1) != 1) {
            this.props.borderBottom = true;
            this.borders.push(Border.BorderBottom(this.game, this.i + 1, this.j, 1));
        }
        if (this.puzzle.hMapGet(this.i, this.j + 2) != 1) {
            this.props.borderTop = true;
            this.borders.push(Border.BorderTop(this.game, this.i, this.j + 1, 1));
        }
        if (this.puzzle.hMapGet(this.i + 1, this.j + 2) != 1) {
            this.props.borderTop = true;
            this.borders.push(Border.BorderTop(this.game, this.i + 1, this.j + 1, 1));
        }
    }
    async instantiate() {
        for (let i = 0; i < this.borders.length; i++) {
            await this.borders[i].instantiate();
        }
        /*
        let data = await this.game.vertexDataLoader.get("./datas/meshes/building.babylon");
        let boxData = Mummu.CloneVertexData(data[6]);
        //Mummu.ColorizeVertexDataInPlace(boxData, this.game.whiteMaterial.diffuseColor, BABYLON.Color3.White());
        //Mummu.ColorizeVertexDataInPlace(boxData, this.game.blueMaterial.diffuseColor, BABYLON.Color3.Red());
        //Mummu.ColorizeVertexDataInPlace(boxData, this.game.brownMaterial.diffuseColor, BABYLON.Color3.Green());
        boxData.applyToMesh(this);
        data[7].applyToMesh(this.floor);
        //data[8].applyToMesh(this.roof);
        data[9].applyToMesh(this.wall);

        let m = 0.2;
        let shadowData = Mummu.Create9SliceVertexData({
            width: 2.2 + 2 * m,
            height: 2.2 + 2 * m,
            margin: m,
            cutTop: this.props.borderTop ? false : true,
            cutRight: this.props.borderRight ? false : true,
            cutBottom: this.props.borderBottom ? false : true,
            cutLeft: this.props.borderLeft ? false : true,
        });
        Mummu.RotateVertexDataInPlace(shadowData, BABYLON.Quaternion.FromEulerAngles(Math.PI * 0.5, 0, 0));
        Mummu.TranslateVertexDataInPlace(shadowData, new BABYLON.Vector3(0.55, 0, 0.55));
        shadowData.applyToMesh(this.shadow);
        */
    }
}
class Bridge extends Build {
    constructor(game, props) {
        super(game, props);
        this.material = this.game.brickWallMaterial;
        this.builtInBorder = new BABYLON.Mesh("ramp-border");
        this.builtInBorder.parent = this;
        this.builtInBorder.material = this.game.blackMaterial;
    }
    fillHeightmap() {
        for (let ii = 0; ii < 4; ii++) {
            for (let jj = 0; jj < 2; jj++) {
                this.game.puzzle.hMapSet(1, this.i + ii, this.j + jj);
            }
        }
    }
    regenerateBorders() {
        while (this.borders.length > 0) {
            this.borders.pop().dispose();
        }
        this.borders.push(Border.BorderLeft(this.game, this.i, this.j, 0, true));
        this.borders.push(Border.BorderLeft(this.game, this.i, this.j + 1, 0, true));
        this.borders.push(Border.BorderRight(this.game, this.i, this.j, 0, true));
        this.borders.push(Border.BorderRight(this.game, this.i, this.j + 1, 0, true));
        this.borders.push(Border.BorderLeft(this.game, this.i + 3, this.j, 0, true));
        this.borders.push(Border.BorderLeft(this.game, this.i + 3, this.j + 1, 0, true));
        this.borders.push(Border.BorderRight(this.game, this.i + 3, this.j, 0, true));
        this.borders.push(Border.BorderRight(this.game, this.i + 3, this.j + 1, 0, true));
        this.borders.push(Border.BorderBottom(this.game, this.i, this.j, 0, true));
        this.borders.push(Border.BorderBottom(this.game, this.i + 3, this.j, 0, true));
        this.borders.push(Border.BorderTop(this.game, this.i, this.j + 1, 0, true));
        this.borders.push(Border.BorderTop(this.game, this.i + 3, this.j + 1, 0, true));
        this.props.borderLeft = false;
        this.props.borderRight = false;
        this.props.borderBottom = false;
        this.props.borderTop = false;
        if (this.puzzle.hMapGet(this.i - 1, this.j) != 1 || this.puzzle.hMapGet(this.i - 1, this.j + 1) != 1) {
            this.props.borderLeft = true;
            this.borders.push(Border.BorderLeft(this.game, this.i, this.j, 1));
            this.borders.push(Border.BorderLeft(this.game, this.i, this.j + 1, 1));
        }
        if (this.puzzle.hMapGet(this.i + 4, this.j) != 1 || this.puzzle.hMapGet(this.i + 4, this.j + 1) != 1) {
            this.props.borderRight = true;
            this.borders.push(Border.BorderRight(this.game, this.i + 3, this.j, 1));
            this.borders.push(Border.BorderRight(this.game, this.i + 3, this.j + 1, 1));
        }
        if (this.puzzle.hMapGet(this.i, this.j - 1) != 1 || this.puzzle.hMapGet(this.i + 1, this.j - 1) != 1 || this.puzzle.hMapGet(this.i + 2, this.j - 1) != 1 || this.puzzle.hMapGet(this.i + 3, this.j - 1) != 1) {
            this.props.borderBottom = true;
            this.borders.push(Border.BorderBottom(this.game, this.i, this.j, 1));
            this.borders.push(Border.BorderBottom(this.game, this.i + 1, this.j, 1));
            this.borders.push(Border.BorderBottom(this.game, this.i + 2, this.j, 1));
            this.borders.push(Border.BorderBottom(this.game, this.i + 3, this.j, 1));
        }
        if (this.puzzle.hMapGet(this.i, this.j + 2) != 1 || this.puzzle.hMapGet(this.i + 1, this.j + 2) != 1 || this.puzzle.hMapGet(this.i + 2, this.j + 2) != 1 || this.puzzle.hMapGet(this.i + 3, this.j + 2) != 1) {
            this.props.borderTop = true;
            this.borders.push(Border.BorderTop(this.game, this.i, this.j + 1, 1));
            this.borders.push(Border.BorderTop(this.game, this.i + 1, this.j + 1, 1));
            this.borders.push(Border.BorderTop(this.game, this.i + 2, this.j + 1, 1));
            this.borders.push(Border.BorderTop(this.game, this.i + 3, this.j + 1, 1));
        }
    }
    async instantiate() {
        for (let i = 0; i < this.borders.length; i++) {
            await this.borders[i].instantiate();
        }
        let data = await this.game.vertexDataLoader.get("./datas/meshes/building.babylon");
        data[3].applyToMesh(this);
        let floorData = Mummu.CloneVertexData(data[4]);
        for (let i = 0; i < floorData.positions.length / 3; i++) {
            floorData.uvs[2 * i] = 0.55 * (floorData.positions[3 * i] + this.position.x);
            floorData.uvs[2 * i + 1] = 0.55 * (floorData.positions[3 * i + 2] + this.position.z);
        }
        floorData.applyToMesh(this.floor);
        data[5].applyToMesh(this.builtInBorder);
        let m = 0.2;
        let shadowData = Mummu.Create9SliceVertexData({
            width: 4.4 + 2 * m,
            height: 2.2 + 2 * m,
            margin: m,
            cutRight: this.props.borderRight ? false : true,
            cutLeft: this.props.borderLeft ? false : true
        });
        Mummu.RotateVertexDataInPlace(shadowData, BABYLON.Quaternion.FromEulerAngles(Math.PI * 0.5, 0, 0));
        Mummu.TranslateVertexDataInPlace(shadowData, new BABYLON.Vector3(1.5 * 1.1, 0, 0.5 * 1.1));
        shadowData.applyToMesh(this.shadow);
    }
}
class CarillonRouter extends Nabu.Router {
    constructor(game) {
        super();
        this.game = game;
    }
    async postInitialize() {
        for (let i = 0; i < this.pages.length; i++) {
            await this.pages[i].waitLoaded();
        }
        this.homeMenu = new HomePage("#home-menu", this);
        this.baseLevelsPage = new BaseLevelPage("#base-levels-page", this);
        this.communityLevelPage = new CommunityLevelPage("#community-levels-page", this);
        this.devLevelPage = new DevLevelPage("#dev-levels-page", this);
        this.multiplayerLevelsPage = new MultiplayerLevelPage("#multiplayer-levels-page", this);
        this.creditsPage = document.querySelector("#credits-page");
        this.multiplayerPage = new MultiplayerPage("#multiplayer-page", this);
        this.playUI = document.querySelector("#play-ui");
        this.editorUI = document.querySelector("#editor-ui");
        this.devPage = document.querySelector("#dev-page");
        this.eulaPage = document.querySelector("#eula-page");
        this.playBackButton = document.querySelector("#play-ui .back-btn");
        this.timerText = document.querySelector("#play-timer");
        this.puzzleIntro = document.querySelector("#puzzle-intro");
    }
    onUpdate() { }
    async onHRefChange(page, previousPage) {
        console.log("onHRefChange from " + previousPage + " to " + page);
        //?gdmachineId=1979464530
        let showTime = 0.5;
        for (let i = 0; i < this.pages.length; i++) {
            await this.pages[i].waitLoaded();
        }
        this.game.mode = GameMode.Menu;
        this.game.globalTimer = 0;
        this.game.editor.deactivate();
        if (page.startsWith("#options")) {
            if (USE_POKI_SDK) {
                PokiGameplayStop();
            }
        }
        else if (page.startsWith("#credits")) {
            if (USE_POKI_SDK) {
                PokiGameplayStop();
            }
            await this.show(this.creditsPage, false, showTime);
        }
        else if (page === "#dev") {
            if (USE_POKI_SDK) {
                PokiGameplayStop();
            }
            await this.show(this.devPage, false, showTime);
        }
        else if (page.startsWith("#community")) {
            if (USE_POKI_SDK) {
                PokiGameplayStop();
            }
            this.show(this.communityLevelPage.nabuPage, false, showTime);
            requestAnimationFrame(() => {
                this.communityLevelPage.redraw();
            });
        }
        else if (page.startsWith("#dev-levels")) {
            if (USE_POKI_SDK) {
                PokiGameplayStop();
            }
            if (!DEV_MODE_ACTIVATED) {
                location.hash = "#dev";
                return;
            }
            this.show(this.devLevelPage.nabuPage, false, showTime);
            if (page.indexOf("#dev-levels-") != -1) {
                let state = parseInt(page.replace("#dev-levels-", ""));
                this.devLevelPage.levelStateToFetch = state;
            }
            else {
                this.devLevelPage.levelStateToFetch = 0;
            }
            requestAnimationFrame(() => {
                this.devLevelPage.redraw();
            });
        }
        else if (page.startsWith("#editor-preview")) {
            this.game.puzzle.puzzleUI.successNextButton.parentElement.href = "#editor";
            this.show(this.playUI, false, showTime);
            document.querySelector("#editor-btn").style.display = "";
            await this.game.puzzle.reset();
            this.game.puzzle.skipIntro();
            this.game.mode = GameMode.Preplay;
            this.game.globalTimer = 0;
        }
        else if (page.startsWith("#editor")) {
            this.show(this.editorUI, false, showTime);
            await this.game.puzzle.reset();
            this.game.editor.activate();
            this.game.mode = GameMode.Editor;
        }
        else if (page.startsWith("#level-")) {
            let numLevel = parseInt(page.replace("#level-", ""));
            this.game.puzzle.puzzleUI.successNextButton.parentElement.href = "#level-" + (numLevel + 1).toFixed(0);
            if (this.game.puzzle.data.numLevel != numLevel) {
                let data = this.game.tiaratumGameTutorialLevels;
                if (data.puzzles[numLevel - 1]) {
                    this.game.puzzle.resetFromData(data.puzzles[numLevel - 1]);
                }
                else {
                    location.hash = "#levels";
                    return;
                }
            }
            this.show(this.playUI, false, showTime);
            await this.game.puzzle.reset();
            document.querySelector("#editor-btn").style.display = DEV_MODE_ACTIVATED ? "" : "none";
            this.game.mode = GameMode.Preplay;
            this.game.globalTimer = 0;
        }
        else if (page.startsWith("#play-community-")) {
            let puzzleId = parseInt(page.replace("#play-community-", ""));
            if (this.game.puzzle.data.id != puzzleId) {
                let headers = {};
                if (var1) {
                    headers = {
                        "Authorization": 'Basic ' + btoa("carillon:" + var1)
                    };
                }
                const response = await fetch(SHARE_SERVICE_PATH + "puzzle/" + puzzleId.toFixed(0), {
                    method: "GET",
                    mode: "cors",
                    headers: headers
                });
                let data = await response.json();
                CLEAN_IPuzzleData(data);
                this.game.puzzle.resetFromData(data);
            }
            if (this.game.puzzle.data.state === 3) {
                this.game.puzzle.puzzleUI.successNextButton.parentElement.href = "#multiplayer-levels";
            }
            else {
                this.game.puzzle.puzzleUI.successNextButton.parentElement.href = "#community";
            }
            this.show(this.playUI, false, showTime);
            await this.game.puzzle.reset();
            document.querySelector("#editor-btn").style.display = DEV_MODE_ACTIVATED ? "" : "none";
            this.game.mode = GameMode.Preplay;
            this.game.globalTimer = 0;
        }
        else if (page.startsWith("#levels")) {
            if (USE_POKI_SDK) {
                PokiGameplayStop();
            }
            this.show(this.baseLevelsPage.nabuPage, false, showTime);
            requestAnimationFrame(() => {
                this.baseLevelsPage.redraw();
            });
        }
        else if (page.startsWith("#multiplayer-levels")) {
            if (USE_POKI_SDK) {
                PokiGameplayStop();
            }
            this.show(this.multiplayerLevelsPage.nabuPage, false, showTime);
            requestAnimationFrame(() => {
                this.multiplayerLevelsPage.redraw();
            });
        }
        else if (page.startsWith("#multiplayer")) {
            if (USE_POKI_SDK) {
                PokiGameplayStop();
            }
            await this.show(this.multiplayerPage.nabuPage, false, showTime);
        }
        else if (page.startsWith("#home")) {
            if (USE_POKI_SDK) {
                PokiGameplayStop();
            }
            await this.show(this.homeMenu.nabuPage, false, showTime);
        }
        else {
            location.hash = "#home";
            return;
        }
    }
}
var EditorBrush;
(function (EditorBrush) {
    EditorBrush[EditorBrush["None"] = 0] = "None";
    EditorBrush[EditorBrush["Delete"] = 1] = "Delete";
    EditorBrush[EditorBrush["Tile"] = 2] = "Tile";
    EditorBrush[EditorBrush["Switch"] = 3] = "Switch";
    EditorBrush[EditorBrush["Push"] = 4] = "Push";
    EditorBrush[EditorBrush["Hole"] = 5] = "Hole";
    EditorBrush[EditorBrush["Wall"] = 6] = "Wall";
    EditorBrush[EditorBrush["Water"] = 7] = "Water";
    EditorBrush[EditorBrush["Box"] = 8] = "Box";
    EditorBrush[EditorBrush["Ramp"] = 9] = "Ramp";
    EditorBrush[EditorBrush["Bridge"] = 10] = "Bridge";
})(EditorBrush || (EditorBrush = {}));
class Editor {
    constructor(game) {
        this.game = game;
        this.active = false;
        this.cursorOffset = BABYLON.Vector3.Zero();
        this.cursorI = 0;
        this.cursorJ = 0;
        this.cursorH = 0;
        this.brush = EditorBrush.None;
        this.brushColor = TileColor.North;
        this.selectableButtons = [];
        this._pendingPublish = false;
        this.updatePublishBtn = () => {
            if (this.title.length > 2 && this.author.length > 2 && this.eulaAccepted) {
                document.getElementById("publish-confirm-btn").classList.add("lightblue");
                document.getElementById("publish-confirm-btn").classList.remove("locked");
            }
            else {
                document.getElementById("publish-confirm-btn").classList.remove("lightblue");
                document.getElementById("publish-confirm-btn").classList.add("locked");
            }
        };
        this._pointerX = 0;
        this._pointerY = 0;
        this.update = (dt) => {
            if (this.active) {
                let pick = this.game.scene.pick(this.game.scene.pointerX, this.game.scene.pointerY, (mesh) => {
                    return mesh.name === "floor" || mesh.name === "building-floor" || mesh === this.puzzle.invisiFloorTM;
                });
                if (pick.hit) {
                    this.cursorI = Math.round(pick.pickedPoint.x / 1.1);
                    this.cursorJ = Math.round(pick.pickedPoint.z / 1.1);
                    this.cursorH = this.puzzle.hMapGet(this.cursorI, this.cursorJ);
                    this.cursor.isVisible = true;
                    this.cursor.position.copyFromFloats(this.cursorI * 1.1, this.cursorH, this.cursorJ * 1.1);
                    this.cursor.position.addInPlace(this.cursorOffset);
                }
                else {
                    this.cursor.isVisible = false;
                }
            }
        };
        this.pointerDown = (ev) => {
            this._pointerX = ev.clientX;
            this._pointerY = ev.clientY;
        };
        this.pointerUp = (ev) => {
            let dx = ev.clientX - this._pointerX;
            let dy = ev.clientY - this._pointerY;
            let dd = dx * dx + dy * dy;
            if (dd < 9) {
                let pick = this.game.scene.pick(this.game.scene.pointerX, this.game.scene.pointerY, (mesh) => {
                    return mesh.name === "floor" || mesh.name === "building-floor" || mesh === this.puzzle.invisiFloorTM;
                });
                if (pick.hit) {
                    if (ev.button === 2 || this.brush === EditorBrush.Delete) {
                        let tile = this.puzzle.tiles.find(tile => {
                            return tile.i === this.cursorI && tile.j === this.cursorJ && Math.abs(tile.position.y - this.cursorH) < 0.3;
                        });
                        if (tile) {
                            tile.dispose();
                            this.puzzle.rebuildFloor();
                        }
                        else if (this.puzzle.buildingBlockGet(this.cursorI, this.cursorJ) === 1) {
                            this.puzzle.buildingBlockSet(0, this.cursorI, this.cursorJ);
                            this.puzzle.editorRegenerateBuildings();
                        }
                        else {
                            let building = this.puzzle.buildings.find(build => {
                                return build.i === this.cursorI && build.j === this.cursorJ;
                            });
                            if (building) {
                                building.dispose();
                                this.puzzle.editorRegenerateBuildings();
                            }
                        }
                    }
                    else if (ev.button === 0) {
                        let tile = this.puzzle.tiles.find(tile => {
                            return tile.i === this.cursorI && tile.j === this.cursorJ && Math.abs(tile.position.y - this.cursorH) < 0.3;
                        });
                        if (!tile) {
                            if (this.brush === EditorBrush.Tile) {
                                tile = new BlockTile(this.game, {
                                    i: this.cursorI,
                                    j: this.cursorJ,
                                    h: this.cursorH,
                                    color: this.brushColor
                                });
                            }
                            else if (this.brush === EditorBrush.Switch) {
                                tile = new SwitchTile(this.game, {
                                    i: this.cursorI,
                                    j: this.cursorJ,
                                    h: this.cursorH,
                                    color: this.brushColor
                                });
                            }
                            else if (this.brush === EditorBrush.Push) {
                                tile = new PushTile(this.game, {
                                    i: this.cursorI,
                                    j: this.cursorJ,
                                    color: this.brushColor
                                });
                            }
                            else if (this.brush === EditorBrush.Hole) {
                                tile = new HoleTile(this.game, {
                                    i: this.cursorI,
                                    j: this.cursorJ,
                                    color: this.brushColor
                                });
                            }
                            else if (this.brush === EditorBrush.Wall) {
                                tile = new WallTile(this.game, {
                                    i: this.cursorI,
                                    j: this.cursorJ,
                                    color: this.brushColor
                                });
                            }
                            else if (this.brush === EditorBrush.Water) {
                                tile = new WaterTile(this.game, {
                                    i: this.cursorI,
                                    j: this.cursorJ,
                                    color: this.brushColor,
                                    noShadow: true
                                });
                            }
                            else if (this.brush === EditorBrush.Box) {
                                this.puzzle.buildingBlockSet(1, this.cursorI, this.cursorJ);
                                this.puzzle.editorRegenerateBuildings();
                            }
                            else if (this.brush === EditorBrush.Ramp) {
                                let box = new Ramp(this.game, {
                                    i: this.cursorI,
                                    j: this.cursorJ
                                });
                                this.puzzle.editorRegenerateBuildings();
                            }
                            else if (this.brush === EditorBrush.Bridge) {
                                let box = new Bridge(this.game, {
                                    i: this.cursorI,
                                    j: this.cursorJ
                                });
                                this.puzzle.editorRegenerateBuildings();
                            }
                            if (tile) {
                                tile.instantiate();
                                this.puzzle.rebuildFloor();
                            }
                        }
                    }
                }
            }
        };
        this.cursor = Mummu.CreateLineBox("cursor", {
            width: 1,
            height: 1,
            depth: 1,
            color: new BABYLON.Color4(0, 1, 0, 1)
        });
        this.setCursorSize({ w: 1, h: 0, d: 1 });
    }
    get title() {
        if (this.titleInput) {
            return this.titleInput.value;
        }
        return "";
    }
    get author() {
        if (this.authorInput) {
            return this.authorInput.value;
        }
        return "";
    }
    get eulaAccepted() {
        if (this.eulaCheckbox) {
            return this.eulaCheckbox.checked;
        }
        return false;
    }
    getScene() {
        return this.game.scene;
    }
    get puzzle() {
        return this.game.puzzle;
    }
    initValues() {
        this.p1OriginColorInput.setValue(this.puzzle.balls[0].color);
        this.p1OriginIInput.setValue(this.puzzle.balls[0].i);
        this.p1OriginJInput.setValue(this.puzzle.balls[0].j);
        this.p2OriginColorInput.setValue(this.puzzle.balls[1].color);
        this.p2OriginIInput.setValue(this.puzzle.balls[1].i);
        this.p2OriginJInput.setValue(this.puzzle.balls[1].j);
        this.widthInput.setValue(this.puzzle.w);
        this.heightInput.setValue(this.puzzle.h);
        document.getElementById("p2-ball").style.display = this.puzzle.ballsCount === 2 ? "block" : "none";
        this.ballCountButton.querySelector("stroke-text").innerHTML = this.puzzle.ballsCount === 2 ? "2 PLAYERS" : "1 PLAYER";
    }
    activate() {
        this.ballCountButton = document.getElementById("ball-count-btn");
        this.ballCountButton.onclick = () => {
            if (this.puzzle.ballsCount === 1) {
                this.puzzle.ballsCount = 2;
                this.puzzle.balls[1].instantiate();
                this.puzzle.balls[1].setVisible(true);
            }
            else if (this.puzzle.ballsCount === 2) {
                this.puzzle.ballsCount = 1;
                this.puzzle.balls[1].setVisible(false);
            }
            document.getElementById("p2-ball").style.display = this.puzzle.ballsCount === 2 ? "block" : "none";
            this.ballCountButton.querySelector("stroke-text").innerHTML = this.puzzle.ballsCount === 2 ? "2 PLAYERS" : "1 PLAYER";
        };
        this.p1OriginColorInput = document.getElementById("editor-p1-origin-color");
        this.p1OriginColorInput.onValueChange = (v) => {
            let color = v;
            this.puzzle.balls[0].setColor(color);
        };
        this.p1OriginColorInput.valueToString = (v) => {
            return TileColorNames[v];
        };
        this.p1OriginIInput = document.getElementById("editor-p1-origin-i");
        this.p1OriginIInput.onValueChange = (v) => {
            this.dropClear();
            this.puzzle.balls[0].i = Math.min(v, this.puzzle.w - 1);
        };
        this.p1OriginJInput = document.getElementById("editor-p1-origin-j");
        this.p1OriginJInput.onValueChange = (v) => {
            this.dropClear();
            this.puzzle.balls[0].j = Math.min(v, this.puzzle.h - 1);
        };
        this.p2OriginColorInput = document.getElementById("editor-p2-origin-color");
        this.p2OriginColorInput.onValueChange = (v) => {
            let color = v;
            this.puzzle.balls[1].setColor(color);
        };
        this.p2OriginColorInput.valueToString = (v) => {
            return TileColorNames[v];
        };
        this.p2OriginIInput = document.getElementById("editor-p2-origin-i");
        this.p2OriginIInput.onValueChange = (v) => {
            this.dropClear();
            this.puzzle.balls[1].i = Math.min(v, this.puzzle.w - 1);
        };
        this.p2OriginJInput = document.getElementById("editor-p2-origin-j");
        this.p2OriginJInput.onValueChange = (v) => {
            this.dropClear();
            this.puzzle.balls[1].j = Math.min(v, this.puzzle.h - 1);
        };
        this.widthInput = document.getElementById("editor-width");
        this.widthInput.onValueChange = (v) => {
            this.dropClear();
            this.puzzle.w = Math.max(v, 3);
            this.puzzle.rebuildFloor();
        };
        this.widthInsert = document.getElementById("editor-width-insert");
        this.widthInsert.onclick = () => {
            let text = SaveAsText(this.puzzle);
            text = text.replaceAll("x", "xo");
            text = text.replaceAll("xoBB", "xBB");
            this.puzzle.data.content = text;
            this.puzzle.reset();
            this.initValues();
        };
        this.widthDelete = document.getElementById("editor-width-delete");
        this.widthDelete.onclick = () => {
            let text = SaveAsText(this.puzzle);
            let split = text.split("x");
            for (let i = 1; i < split.length - 1; i++) {
                split[i] = split[i].substring(1);
            }
            text = split.reduce((s1, s2) => { return s1 + "x" + s2; });
            this.puzzle.data.content = text;
            this.puzzle.reset();
            this.initValues();
        };
        this.heightInput = document.getElementById("editor-height");
        this.heightInput.onValueChange = (v) => {
            this.dropClear();
            this.puzzle.h = Math.max(v, 3);
            this.puzzle.rebuildFloor();
        };
        this.heightInsert = document.getElementById("editor-height-insert");
        this.heightInsert.onclick = () => {
            let text = SaveAsText(this.puzzle);
            let split = text.split("x");
            let last = split.pop();
            split.push("x" + ("").padStart(this.puzzle.w, "o"));
            split.push(last);
            text = split.reduce((s1, s2) => { return s1 + "x" + s2; });
            this.puzzle.data.content = text;
            this.puzzle.reset();
            this.initValues();
        };
        this.heightDelete = document.getElementById("editor-height-delete");
        this.heightDelete.onclick = () => {
            let text = SaveAsText(this.puzzle);
            let split = text.split("x");
            let last = split.pop();
            split.pop();
            split.push(last);
            text = split.reduce((s1, s2) => { return s1 + "x" + s2; });
            this.puzzle.data.content = text;
            this.puzzle.reset();
            this.initValues();
        };
        this.switchTileNorthButton = document.getElementById("switch-north-btn");
        this.switchTileEastButton = document.getElementById("switch-east-btn");
        this.switchTileSouthButton = document.getElementById("switch-south-btn");
        this.switchTileWestButton = document.getElementById("switch-west-btn");
        this.blockTileNorthButton = document.getElementById("tile-north-btn");
        this.blockTileEastButton = document.getElementById("tile-east-btn");
        this.blockTileSouthButton = document.getElementById("tile-south-btn");
        this.blockTileWestButton = document.getElementById("tile-west-btn");
        this.pushTileButton = document.getElementById("push-tile-btn");
        this.holeButton = document.getElementById("hole-btn");
        this.wallButton = document.getElementById("wall-btn");
        this.waterButton = document.getElementById("water-btn");
        this.boxButton = document.getElementById("box-btn");
        this.rampButton = document.getElementById("ramp-btn");
        this.bridgeButton = document.getElementById("bridge-btn");
        this.deleteButton = document.getElementById("delete-btn");
        this.selectableButtons = [
            this.switchTileNorthButton,
            this.switchTileEastButton,
            this.switchTileSouthButton,
            this.switchTileWestButton,
            this.blockTileNorthButton,
            this.blockTileEastButton,
            this.blockTileSouthButton,
            this.blockTileWestButton,
            this.pushTileButton,
            this.holeButton,
            this.wallButton,
            this.waterButton,
            this.boxButton,
            this.rampButton,
            this.bridgeButton
        ];
        let makeBrushButton = (button, brush, brushColor, cursorSize) => {
            if (!cursorSize) {
                cursorSize = {};
            }
            button.onclick = () => {
                this.dropClear();
                this.unselectAllButtons();
                if (this.brush != brush || (isFinite(brushColor) && this.brushColor != brushColor)) {
                    this.brush = brush;
                    this.brushColor = brushColor;
                    button.classList.add("selected");
                    this.setCursorSize(cursorSize);
                }
                else {
                    this.brush = EditorBrush.None;
                    this.setCursorSize({});
                }
            };
        };
        makeBrushButton(this.switchTileNorthButton, EditorBrush.Switch, TileColor.North);
        makeBrushButton(this.switchTileEastButton, EditorBrush.Switch, TileColor.East);
        makeBrushButton(this.switchTileSouthButton, EditorBrush.Switch, TileColor.South);
        makeBrushButton(this.switchTileWestButton, EditorBrush.Switch, TileColor.West);
        makeBrushButton(this.blockTileNorthButton, EditorBrush.Tile, TileColor.North);
        makeBrushButton(this.blockTileEastButton, EditorBrush.Tile, TileColor.East);
        makeBrushButton(this.blockTileSouthButton, EditorBrush.Tile, TileColor.South);
        makeBrushButton(this.blockTileWestButton, EditorBrush.Tile, TileColor.West);
        makeBrushButton(this.pushTileButton, EditorBrush.Push);
        makeBrushButton(this.holeButton, EditorBrush.Hole);
        makeBrushButton(this.wallButton, EditorBrush.Wall);
        makeBrushButton(this.waterButton, EditorBrush.Water);
        makeBrushButton(this.boxButton, EditorBrush.Box, undefined, { w: 1, h: 1, d: 1 });
        makeBrushButton(this.rampButton, EditorBrush.Ramp, undefined, { w: 2, h: 1, d: 3 });
        makeBrushButton(this.bridgeButton, EditorBrush.Bridge, undefined, { w: 4, h: 1, d: 2 });
        makeBrushButton(this.deleteButton, EditorBrush.Delete);
        document.getElementById("play-btn").onclick = async () => {
            this.dropClear();
            this.dropBrush();
            this.puzzle.data.content = SaveAsText(this.puzzle);
            this.puzzle.reset();
            location.hash = "#editor-preview";
        };
        document.getElementById("save-btn").onclick = () => {
            this.dropClear();
            this.dropBrush();
            let content = SaveAsText(this.puzzle);
            Nabu.download("puzzle.txt", content);
        };
        document.getElementById("load-btn").onclick = () => {
            this.dropClear();
            this.dropBrush();
            document.getElementById("load-btn").style.display = "none";
            document.getElementById("load-file-input").style.display = "";
        };
        document.getElementById("load-file-input").onchange = (event) => {
            let files = event.target.files;
            let file = files[0];
            if (file) {
                const reader = new FileReader();
                reader.addEventListener('load', async (event) => {
                    let content = event.target.result;
                    this.puzzle.resetFromData({
                        id: null,
                        title: "Custom Machine",
                        author: "Editor",
                        content: content
                    });
                    await this.puzzle.instantiate();
                    this.initValues();
                });
                reader.readAsText(file);
            }
            document.getElementById("load-btn").style.display = "";
            document.getElementById("load-file-input").style.display = "none";
        };
        this.publishForm = document.getElementById("editor-publish-form");
        this.publishFormEdit = document.getElementById("editor-publish-form-edit");
        this.publishFormSuccess = document.getElementById("editor-publish-form-success");
        this.publishFormFailure = document.getElementById("editor-publish-form-failure");
        this.publishCancelButton = document.querySelector("#publish-cancel-btn");
        this.publishConfirmButton = document.querySelector("#publish-confirm-btn");
        this.publishPendingButton = document.querySelector("#publish-pending-btn");
        this.titleInput = document.querySelector("#title-input");
        this.authorInput = document.querySelector("#author-input");
        this.eulaCheckbox = document.querySelector("#eula-checkbox");
        document.getElementById("publish-btn").onclick = async () => {
            this.dropClear();
            this.dropBrush();
            this.setPublishState(0);
            this.eulaCheckbox.checked = false;
            this.updatePublishBtn();
        };
        this.titleInput.onchange = this.updatePublishBtn;
        this.authorInput.onchange = this.updatePublishBtn;
        this.eulaCheckbox.onchange = this.updatePublishBtn;
        this.publishConfirmButton.onclick = async () => {
            if (this._pendingPublish) {
                return;
            }
            this._pendingPublish = true;
            this.setPublishState(1);
            await Mummu.AnimationFactory.CreateWait(this)(1);
            try {
                let data = {
                    title: this.title,
                    author: this.author,
                    content: SaveAsText(this.puzzle),
                    id: null
                };
                let headers = {
                    "Content-Type": "application/json",
                };
                if (DEV_MODE_ACTIVATED && this.puzzle.data.id != null) {
                    data.id = this.puzzle.data.id;
                    console.log("ID found, going into update mode");
                    console.log(data.id);
                    if (var1) {
                        headers = {
                            "Content-Type": "application/json",
                            "Authorization": 'Basic ' + btoa("carillon:" + var1)
                        };
                    }
                }
                let dataString = JSON.stringify(data);
                const response = await fetch(SHARE_SERVICE_PATH + "publish_puzzle", {
                    method: "POST",
                    mode: "cors",
                    headers: headers,
                    body: dataString,
                });
                let text = await response.text();
                let id = parseInt(text);
                let url = "https://carillion.tiaratum.com/#play-community-" + id.toFixed(0);
                document.querySelector("#publish-generated-url").setAttribute("value", url);
                document.querySelector("#publish-generated-url-go").parentElement.href = url;
                document.querySelector("#publish-generated-url-copy").onclick = () => { navigator.clipboard.writeText(url); };
                this.setPublishState(2);
                this._pendingPublish = false;
            }
            catch (e) {
                this.setPublishState(3);
                this._pendingPublish = false;
            }
        };
        document.getElementById("publish-read-eula-btn").onclick = async () => {
            this.game.router.eulaPage.show(0);
        };
        this.publishCancelButton.onclick = async () => {
            this.publishForm.style.display = "none";
        };
        document.querySelectorAll(".publish-ok-btn").forEach(btn => {
            btn.onclick = () => {
                this.publishForm.style.display = "none";
            };
        });
        this.clearButton = document.getElementById("clear-btn");
        this.doClearButton = document.getElementById("doclear-btn");
        this.clearButton.onclick = () => {
            this.clearButton.parentElement.style.display = "none";
            this.doClearButton.parentElement.style.display = "block";
        };
        this.doClearButton.onclick = async () => {
            this.dropClear();
            await this.puzzle.loadFromFile("./datas/levels/min.txt");
            await this.puzzle.instantiate();
            this.initValues();
            this.updatePublishText();
        };
        this.game.canvas.addEventListener("pointerdown", this.pointerDown);
        this.game.canvas.addEventListener("pointerup", this.pointerUp);
        this.game.camera.attachControl();
        this.updatePublishText();
        this.initValues();
        this.active = true;
    }
    deactivate() {
        this.active = false;
        document.getElementById("switch-north-btn").onclick = undefined;
        document.getElementById("switch-east-btn").onclick = undefined;
        document.getElementById("switch-south-btn").onclick = undefined;
        document.getElementById("switch-west-btn").onclick = undefined;
        document.getElementById("tile-north-btn").onclick = undefined;
        document.getElementById("tile-east-btn").onclick = undefined;
        document.getElementById("tile-south-btn").onclick = undefined;
        document.getElementById("tile-west-btn").onclick = undefined;
        document.getElementById("box-btn").onclick = undefined;
        document.getElementById("ramp-btn").onclick = undefined;
        document.getElementById("bridge-btn").onclick = undefined;
        document.getElementById("hole-btn").onclick = undefined;
        document.getElementById("save-btn").onclick = undefined;
        document.getElementById("load-btn").onclick = undefined;
        document.getElementById("load-file-input").onchange = undefined;
        this.game.canvas.removeEventListener("pointerdown", this.pointerDown);
        this.game.canvas.removeEventListener("pointerup", this.pointerUp);
        this.cursor.isVisible = false;
        this.game.camera.detachControl();
    }
    dropClear() {
        this.clearButton.parentElement.style.display = "";
        this.doClearButton.parentElement.style.display = "none";
    }
    dropBrush() {
        this.unselectAllButtons();
        this.brush = EditorBrush.None;
    }
    unselectAllButtons() {
        this.selectableButtons.forEach(button => {
            button.classList.remove("selected");
        });
    }
    updatePublishText() {
        if (DEV_MODE_ACTIVATED && this.puzzle.data.id != null) {
            document.querySelector("#publish-btn stroke-text").innerHTML = "Update";
            this.publishConfirmButton.querySelector("stroke-text").innerHTML = "Update";
            this.titleInput.value = this.puzzle.data.title;
            this.authorInput.value = this.puzzle.data.author;
        }
        else {
            document.querySelector("#publish-btn stroke-text").innerHTML = "Publish";
            this.publishConfirmButton.querySelector("stroke-text").innerHTML = "Publish";
        }
    }
    setPublishState(state) {
        this.publishForm.style.display = "";
        this.publishCancelButton.style.display = "inline-block";
        this.publishConfirmButton.style.display = "inline-block";
        this.publishPendingButton.style.display = "none";
        this.publishFormEdit.style.display = "none";
        this.publishFormSuccess.style.display = "none";
        this.publishFormFailure.style.display = "none";
        if (state === 0) {
            // Waiting for player action.
            this.publishFormEdit.style.display = "block";
        }
        else if (state === 1) {
            // Sending Puzzle.
            this.publishCancelButton.style.display = "none";
            this.publishConfirmButton.style.display = "none";
            this.publishPendingButton.style.display = "inline-block";
            this.publishFormEdit.style.display = "block";
        }
        else if (state === 2) {
            // Success.
            this.publishFormSuccess.style.display = "block";
        }
        else if (state === 3) {
            // Failure.
            this.publishFormFailure.style.display = "block";
        }
    }
    setCursorSize(size) {
        if (isNaN(size.w)) {
            size.w = 1;
        }
        if (isNaN(size.h)) {
            size.h = 0;
        }
        if (isNaN(size.d)) {
            size.d = 1;
        }
        this.cursor.scaling.x = size.w * 1.1;
        this.cursorOffset.x = 0 + (size.w - 1) * 1.1 * 0.5;
        this.cursor.scaling.y = 0.7 + size.h;
        this.cursorOffset.y = size.h * 0.5;
        this.cursor.scaling.z = size.d * 1.1;
        this.cursorOffset.z = 0 + (size.d - 1) * 1.1 * 0.5;
    }
}
class HaikuMaker {
    static MakeHaiku(puzzle) {
        if (puzzle.data.id === 74 && puzzle.data.state === 2) {
            let testHaiku = new Haiku(puzzle.game, "", "- Control -", IsTouchScreen ? "Hold ← or → to move" : "Hold A or D to move.", "");
            testHaiku.position.copyFromFloats(1.1 * 3, 0.1, 1.1 * 1.5);
            testHaiku.visibility = 0;
            puzzle.haikus.push(testHaiku);
        }
        if (puzzle.data.id === 75 && puzzle.data.state === 2) {
            let testHaiku = new Haiku(puzzle.game, "", "- Control -", IsTouchScreen ? "Hold ← or → to move" : "Hold A or D to move.", "");
            testHaiku.position.copyFromFloats(1.1 * 2, 0.1, 1.1 * 3);
            testHaiku.visibility = 0;
            puzzle.haikus.push(testHaiku);
            let testHaiku2 = new Haiku(puzzle.game, "", "- Objective -", "Hit all colored tiles.", "");
            testHaiku2.position.copyFromFloats(1.1 * 7, 0.1, 1.1 * 1);
            testHaiku2.visibility = 0;
            puzzle.haikus.push(testHaiku2);
        }
        if (puzzle.data.id === 76 && puzzle.data.state === 2) {
            let testHaiku = new Haiku(puzzle.game, "", "- Color -", "Hit a drum to switch Color.", "");
            testHaiku.position.copyFromFloats(1.1 * 3, 0.1, 1.1 * 3);
            testHaiku.visibility = 0;
            puzzle.haikus.push(testHaiku);
        }
        if (puzzle.data.id === 60 && puzzle.data.state === 2) {
            let testHaiku = new Haiku(puzzle.game, "", "- Caution -", "Holes are dangerous.", "");
            testHaiku.position.copyFromFloats(1.1 * 3, 0.1, 1.1 * 2.5);
            testHaiku.visibility = 0;
            puzzle.haikus.push(testHaiku);
        }
        if (puzzle.data.id === 78 && puzzle.data.state === 2) {
            let testHaiku = new Haiku(puzzle.game, "", "                - Push -", "Wooden Tiles can be pushed.", "");
            testHaiku.position.copyFromFloats(1.1 * 2.2, 0.1, 1.1 * 2.7);
            testHaiku.visibility = 0;
            puzzle.haikus.push(testHaiku);
        }
        if (puzzle.data.id === 62 && puzzle.data.state === 2) {
            let testHaiku = new Haiku(puzzle.game, "", "- Count -", "One Tile at a time.", "");
            testHaiku.position.copyFromFloats(1.1 * 5, 0.1, 1.1 * 4.5);
            testHaiku.visibility = 0;
            puzzle.haikus.push(testHaiku);
        }
        if (puzzle.data.id === 68 && puzzle.data.state === 2) {
            let testHaiku = new Haiku(puzzle.game, "", "- Satisfaction -", "", "");
            testHaiku.position.copyFromFloats(1.1 * 2.5, 0.1, 1.1 * 1.5);
            testHaiku.visibility = 0;
            puzzle.haikus.push(testHaiku);
        }
        if (puzzle.data.id === 80 && puzzle.data.state === 2) {
            let testHaiku = new Haiku(puzzle.game, "", "- Lives -", "Don't look down.", "");
            testHaiku.position.copyFromFloats(1.1 * 4, 0.1, 1.1 * 3.5);
            testHaiku.visibility = 0;
            puzzle.haikus.push(testHaiku);
        }
        if (puzzle.data.id === 92 && puzzle.data.state === 2) {
            let testHaiku = new Haiku(puzzle.game, "", "- Water -", "Dip a toe !", "");
            testHaiku.position.copyFromFloats(1.1 * 2, 0.1, 1.1 * 2.5);
            testHaiku.visibility = 0;
            puzzle.haikus.push(testHaiku);
        }
        if (puzzle.data.id === 58 && puzzle.data.state === 2) {
            // First Level Haikus
            let testHaiku = new Haiku(puzzle.game, "- Control -", "Left -west- to right -east-", "One may decide where he goes.", "Unless walls oppose.");
            testHaiku.position.copyFromFloats(1.1 * 2, 0.1, 1.1 * 2.5);
            testHaiku.visibility = 0;
            puzzle.haikus.push(testHaiku);
            let testHaiku2 = new Haiku(puzzle.game, "- Bounce -", "Up -north- and down -south-", "Some cycle one can't decide.", "A Vertical tide.");
            testHaiku2.position.copyFromFloats(1.1 * 8, 0.1, 1.1 * 2.5);
            testHaiku2.visibility = 0;
            puzzle.haikus.push(testHaiku2);
            let testHaiku3 = new Haiku(puzzle.game, "- Complete -", "Find all colored tile", "Scattered around the area.", "Time is no limit.");
            testHaiku3.position.copyFromFloats(1.1 * 14, 0.1, 1.1 * 2.5);
            testHaiku3.visibility = 0;
            puzzle.haikus.push(testHaiku3);
        }
        if (puzzle.data.id === 59 && puzzle.data.state === 2) {
            // First Level Haikus
            let testHaiku = new Haiku(puzzle.game, "- Color -", "Four colors for tiles", "Use the right one to collide.", "Or else be bounced back.");
            testHaiku.position.copyFromFloats(1.1 * 2, 0.1, 1.1 * 2.5);
            testHaiku.visibility = 0;
            puzzle.haikus.push(testHaiku);
        }
    }
}
class Haiku extends BABYLON.Mesh {
    constructor(game, title, text1, text2, text3) {
        super("haiku");
        this.game = game;
        this.title = title;
        this.text1 = text1;
        this.text2 = text2;
        this.text3 = text3;
        this.animateVisibility = Mummu.AnimationFactory.EmptyNumberCallback;
        this.inRange = false;
        BABYLON.CreateGroundVertexData({ width: 5, height: 5 }).applyToMesh(this);
        let haikuMaterial = new BABYLON.StandardMaterial("test-haiku-material");
        this.dynamicTexture = new BABYLON.DynamicTexture("haiku-texture", { width: 1000, height: 1000 });
        this.dynamicTexture.hasAlpha = true;
        haikuMaterial.diffuseTexture = this.dynamicTexture;
        haikuMaterial.specularColor.copyFromFloats(0, 0, 0);
        haikuMaterial.useAlphaFromDiffuseTexture = true;
        this.material = haikuMaterial;
        let context = this.dynamicTexture.getContext();
        context.fillStyle = "#00000000";
        context.fillRect(0, 0, 1000, 1000);
        context.fillStyle = "#473a2fFF";
        context.fillStyle = "black";
        context.font = "130px Shalimar";
        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                context.fillText(this.title, 100 + x, 150 + y);
                context.fillText(this.text1, 30 + x, 550 + y);
                context.fillText(this.text2, 30 + x, 700 + y);
                context.fillText(this.text3, 30 + x, 850 + y);
            }
        }
        this.dynamicTexture.update();
        this.animateVisibility = Mummu.AnimationFactory.CreateNumber(this, this, "visibility");
    }
    update(dt) {
        if (this.game.puzzle.balls[0].ballState === BallState.Move) {
            let dx = Math.abs(this.position.x - this.game.puzzle.balls[0].position.x);
            if (!this.inRange) {
                if (dx < 3) {
                    this.inRange = true;
                    this.animateVisibility(1, 2, Nabu.Easing.easeInOutSine);
                }
                return;
            }
            else if (this.inRange) {
                if (dx > 3.5) {
                    this.inRange = false;
                    this.animateVisibility(0, 2, Nabu.Easing.easeInOutSine);
                }
                return;
            }
        }
        if (this.inRange) {
            this.inRange = false;
            this.animateVisibility(0, 2, Nabu.Easing.easeInOutSine);
        }
    }
}
class HaikuPlayerStart extends BABYLON.Mesh {
    constructor(game, playerName, ball) {
        super("haiku");
        this.game = game;
        this.playerName = playerName;
        this.ball = ball;
        this.animateVisibility = Mummu.AnimationFactory.EmptyNumberCallback;
        this.inRange = false;
        BABYLON.CreateGroundVertexData({ width: 5, height: 5 }).applyToMesh(this);
        this.position.copyFrom(this.ball.position);
        this.position.y += 0.01;
        let haikuMaterial = new BABYLON.StandardMaterial("test-haiku-material");
        this.dynamicTexture = new BABYLON.DynamicTexture("haiku-texture", { width: 1000, height: 1000 });
        this.dynamicTexture.hasAlpha = true;
        haikuMaterial.diffuseTexture = this.dynamicTexture;
        haikuMaterial.specularColor.copyFromFloats(0, 0, 0);
        haikuMaterial.useAlphaFromDiffuseTexture = true;
        this.material = haikuMaterial;
        let context = this.dynamicTexture.getContext();
        context.fillStyle = "#00000000";
        context.fillRect(0, 0, 1000, 1000);
        context.strokeStyle = "#473a2fFF";
        context.strokeStyle = "black";
        context.lineWidth = 6;
        for (let i = 0; i < 4; i++) {
            let a1 = i * Math.PI * 0.5 + Math.PI * 0.1;
            let a2 = (i + 1) * Math.PI * 0.5 - Math.PI * 0.1;
            context.beginPath();
            context.arc(500, 500, 80, a1, a2);
            context.stroke();
        }
        context.fillStyle = "#473a2fFF";
        context.fillStyle = "black";
        context.font = "130px Shalimar";
        let l = context.measureText(this.playerName).width;
        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                context.fillText(this.playerName, Math.floor(500 - l * 0.5) + x, 700 + y);
            }
        }
        this.dynamicTexture.update();
        this.animateVisibility = Mummu.AnimationFactory.CreateNumber(this, this, "visibility");
    }
    show() {
        this.animateVisibility(1, 1, Nabu.Easing.easeInOutSine);
    }
    hide() {
        this.animateVisibility(0, 1, Nabu.Easing.easeInOutSine);
    }
}
/// <reference path="./Tile.ts"/>
class HoleTile extends Tile {
    constructor(game, props) {
        props.noShadow = true;
        super(game, props);
        this.color = props.color;
        this.scaling.copyFromFloats(1.1, 1, 1.1);
        this.material = this.game.blackMaterial;
        this.tileDark = new BABYLON.Mesh("tile-top");
        this.tileDark.parent = this;
        this.tileDark.material = this.game.grayMaterial;
    }
    fallsIn(ball) {
        if (ball.position.x < this.position.x - 0.55) {
            return false;
        }
        if (ball.position.x > this.position.x + 0.55) {
            return false;
        }
        if (ball.position.z < this.position.z - 0.55) {
            return false;
        }
        if (ball.position.z > this.position.z + 0.55) {
            return false;
        }
        return true;
    }
}
class HomePage {
    constructor(queryString, router) {
        this.router = router;
        this.buttons = [];
        this.rowCount = 3;
        this._hoveredButtonIndex = 0;
        this._filter = (btn) => {
            return !btn.classList.contains("locked") && btn.style.visibility != "hidden";
        };
        this._inputUp = () => {
            if (!this.shown) {
                return;
            }
            if (this.buttons.length === 0) {
                return;
            }
            if (this.hoveredButtonIndex === 0) {
                if (!this.setHoveredButtonIndex(this.hoveredButtonIndex + (this.rowCount - 1), this._filter)) {
                    this._inputUp();
                }
            }
            else {
                if (!this.setHoveredButtonIndex(this.hoveredButtonIndex - 1, this._filter)) {
                    this._inputUp();
                }
            }
        };
        this._inputDown = () => {
            if (!this.shown) {
                return;
            }
            if (this.buttons.length === 0) {
                return;
            }
            if (this.hoveredButtonIndex === this.rowCount - 1) {
                if (!this.setHoveredButtonIndex(this.hoveredButtonIndex - (this.rowCount - 1), this._filter)) {
                    this._inputDown();
                }
            }
            else {
                if (!this.setHoveredButtonIndex(this.hoveredButtonIndex + 1, this._filter)) {
                    this._inputDown();
                }
            }
        };
        this._inputEnter = () => {
            if (!this.shown) {
                return;
            }
            if (this.buttons.length === 0) {
                return;
            }
            let btn = this.buttons[this._hoveredButtonIndex];
            if (btn && btn.onpointerup) {
                btn.onpointerup(undefined);
            }
        };
        this._inputDropControl = () => {
            if (!this.shown) {
                return;
            }
            if (this.buttons.length === 0) {
                return;
            }
            this.buttons.forEach(btn => {
                btn.classList.remove("hovered");
            });
        };
        this.nabuPage = document.querySelector(queryString);
        this.buttons = [...this.nabuPage.querySelectorAll("button")];
        this.rowCount = this.buttons.length;
        this._registerToInputManager();
    }
    get shown() {
        return this.nabuPage.shown;
    }
    async show(duration) {
        return this.nabuPage.show(duration);
    }
    async hide(duration) {
        return this.nabuPage.hide(duration);
    }
    get hoveredButtonIndex() {
        return this._hoveredButtonIndex;
    }
    setHoveredButtonIndex(v, filter) {
        let btn = this.buttons[this._hoveredButtonIndex];
        if (btn) {
            btn.classList.remove("hovered");
        }
        this._hoveredButtonIndex = v;
        btn = this.buttons[this._hoveredButtonIndex];
        if (!btn) {
            return true;
        }
        else if ((!filter || filter(btn))) {
            if (btn) {
                btn.classList.add("hovered");
            }
            return true;
        }
        return false;
    }
    _registerToInputManager() {
        this.router.game.uiInputManager.onUpCallbacks.push(this._inputUp);
        this.router.game.uiInputManager.onDownCallbacks.push(this._inputDown);
        this.router.game.uiInputManager.onEnterCallbacks.push(this._inputEnter);
        this.router.game.uiInputManager.onDropControlCallbacks.push(this._inputDropControl);
    }
    _unregisterFromInputManager() {
        this.router.game.uiInputManager.onUpCallbacks.remove(this._inputUp);
        this.router.game.uiInputManager.onDownCallbacks.remove(this._inputDown);
        this.router.game.uiInputManager.onEnterCallbacks.remove(this._inputEnter);
        this.router.game.uiInputManager.onDropControlCallbacks.remove(this._inputDropControl);
    }
}
class LevelPage {
    constructor(queryString, router) {
        this.router = router;
        this.className = "LevelPage";
        this.page = 0;
        this.levelsPerPage = 9;
        this.levelCount = 0;
        this.buttons = [];
        this.rowCount = 3;
        this.colCount = 3;
        this._hoveredButtonIndex = 0;
        this._filter = (btn) => {
            return !btn.classList.contains("locked") && btn.style.visibility != "hidden";
        };
        this._inputUp = () => {
            if (!this.shown) {
                return;
            }
            if (this.buttons.length === 0) {
                return;
            }
            if (this.hoveredButtonRowIndex === 0) {
                if (!this.setHoveredButtonIndex(this.hoveredButtonIndex + this.colCount * (this.rowCount - 1), this._filter)) {
                    this._inputUp();
                }
            }
            else {
                if (!this.setHoveredButtonIndex(this.hoveredButtonIndex - this.colCount, this._filter)) {
                    this._inputUp();
                }
            }
        };
        this._inputLeft = () => {
            if (!this.shown) {
                return;
            }
            if (this.buttons.length === 0) {
                return;
            }
            if (this.hoveredButtonColIndex === 0) {
                if (!this.setHoveredButtonIndex(this.hoveredButtonIndex + this.colCount - 1, this._filter)) {
                    this._inputLeft();
                }
            }
            else {
                if (!this.setHoveredButtonIndex(this.hoveredButtonIndex - 1, this._filter)) {
                    this._inputLeft();
                }
            }
        };
        this._inputDown = () => {
            if (!this.shown) {
                return;
            }
            if (this.buttons.length === 0) {
                return;
            }
            if (this.hoveredButtonRowIndex === this.rowCount - 1) {
                if (!this.setHoveredButtonIndex(this.hoveredButtonIndex - this.colCount * (this.rowCount - 1), this._filter)) {
                    this._inputDown();
                }
            }
            else {
                if (!this.setHoveredButtonIndex(this.hoveredButtonIndex + this.colCount, this._filter)) {
                    this._inputDown();
                }
            }
        };
        this._inputRight = () => {
            if (!this.shown) {
                return;
            }
            if (this.buttons.length === 0) {
                return;
            }
            if (this.hoveredButtonColIndex === this.colCount - 1) {
                if (!this.setHoveredButtonIndex(this.hoveredButtonIndex - this.colCount + 1, this._filter)) {
                    this._inputRight();
                }
            }
            else {
                if (!this.setHoveredButtonIndex(this.hoveredButtonIndex + 1, this._filter)) {
                    this._inputRight();
                }
            }
        };
        this._inputEnter = () => {
            if (!this.shown) {
                return;
            }
            if (this.buttons.length === 0) {
                return;
            }
            let btn = this.buttons[this._hoveredButtonIndex];
            if (btn && btn.onclick) {
                btn.onclick(undefined);
                return;
            }
        };
        this._inputBack = () => {
            if (!this.shown) {
                return;
            }
            location.hash = "#home";
        };
        this._inputDropControl = () => {
            if (!this.shown) {
                return;
            }
            if (this.buttons.length === 0) {
                return;
            }
            this.buttons.forEach(btn => {
                btn.classList.remove("hovered");
            });
        };
        this.nabuPage = document.querySelector(queryString);
        this._registerToInputManager();
    }
    get shown() {
        return this.nabuPage.shown;
    }
    async show(duration) {
        return this.nabuPage.show(duration);
    }
    async hide(duration) {
        return this.nabuPage.hide(duration);
    }
    setSquareButtonOnClick(squareButton, n) {
    }
    async redraw() {
        this.buttons = [];
        let container = this.nabuPage.querySelector(".square-btn-container");
        container.innerHTML = "";
        let rect = container.getBoundingClientRect();
        this.colCount = Math.round(rect.width / 140);
        this.rowCount = Math.round((Math.round(rect.height / (140 / 3))) / 3);
        while (this.colCount < 2) {
            this.colCount++;
        }
        while (this.rowCount < 3) {
            this.rowCount++;
        }
        this.levelsPerPage = this.colCount * (this.rowCount - 1);
        let puzzleTileData = await this.getPuzzlesData(this.page, this.levelsPerPage);
        let n = 0;
        for (let i = 0; i < this.rowCount - 1; i++) {
            let line = document.createElement("div");
            line.classList.add("square-btn-container-line");
            container.appendChild(line);
            for (let j = 0; j < this.colCount; j++) {
                let squareButton = document.createElement("button");
                this.buttons.push(squareButton);
                squareButton.classList.add("square-btn-panel", "bluegrey");
                if (n >= puzzleTileData.length) {
                    squareButton.classList.add("locked");
                    squareButton.style.opacity = "0.2";
                }
                else {
                    if (puzzleTileData[n].locked) {
                        squareButton.classList.add("locked");
                    }
                    if (puzzleTileData[n].classList) {
                        squareButton.classList.add(...puzzleTileData[n].classList);
                    }
                    squareButton.innerHTML = "<stroke-text>" + puzzleTileData[n].data.title + "</stroke-text>";
                    squareButton.onclick = puzzleTileData[n].onclick;
                    let miniature = PuzzleMiniatureMaker.Generate(puzzleTileData[n].data.content);
                    miniature.classList.add("square-btn-miniature");
                    squareButton.appendChild(miniature);
                    let authorField = document.createElement("div");
                    authorField.classList.add("square-btn-author");
                    let authorText = document.createElement("stroke-text");
                    authorField.appendChild(authorText);
                    squareButton.appendChild(authorField);
                    if (puzzleTileData[n].data.score != null) {
                        let val = "# 1 " + puzzleTileData[n].data.player + " " + Game.ScoreToString(puzzleTileData[n].data.score);
                        authorText.setContent(val);
                    }
                    else {
                        authorText.setContent("by " + puzzleTileData[n].data.author);
                    }
                    if (puzzleTileData[n].data.id != null && this.router.game.isPuzzleCompleted(puzzleTileData[n].data.id)) {
                        let completedStamp = document.createElement("div");
                        completedStamp.classList.add("stamp");
                        let stars = document.createElement("div");
                        completedStamp.appendChild(stars);
                        squareButton.appendChild(completedStamp);
                        let score = this.router.game.getPersonalBestScore(puzzleTileData[n].data.id);
                        let highscore = puzzleTileData[n].data.score;
                        let ratio = 1;
                        if (highscore != null) {
                            ratio = highscore / score;
                        }
                        let s1 = ratio > 0.3 ? "★" : "☆";
                        let s2 = ratio > 0.6 ? "★" : "☆";
                        let s3 = ratio > 0.9 ? "★" : "☆";
                        stars.innerHTML = s1 + "</br>" + s2 + s3;
                    }
                }
                n++;
                line.appendChild(squareButton);
            }
        }
        let line = document.createElement("div");
        line.classList.add("square-btn-container-halfline");
        container.appendChild(line);
        let prevButton = document.createElement("button");
        this.buttons.push(prevButton);
        prevButton.classList.add("square-btn", "bluegrey");
        prevButton.style.margin = "10px";
        if (this.page === 0) {
            prevButton.innerHTML = "<stroke-text>MENU</stroke-text>";
            prevButton.onclick = () => {
                location.hash = "#home";
            };
        }
        else {
            prevButton.innerHTML = "<stroke-text>&lt; PAGE " + (this.page - 1 + 1).toFixed(0) + "</stroke-text>";
            prevButton.onclick = () => {
                this.page--;
                this.redraw();
            };
        }
        line.appendChild(prevButton);
        for (let j = 1; j < this.colCount - 1; j++) {
            let squareButton = document.createElement("button");
            squareButton.style.margin = "10px";
            this.buttons.push(squareButton);
            squareButton.classList.add("square-btn");
            squareButton.style.visibility = "hidden";
            line.appendChild(squareButton);
        }
        let nextButton = document.createElement("button");
        nextButton.style.margin = "10px";
        this.buttons.push(nextButton);
        nextButton.classList.add("square-btn", "bluegrey");
        if (puzzleTileData.length === this.levelsPerPage) {
            nextButton.innerHTML = "<stroke-text>PAGE " + (this.page + 1 + 1).toFixed(0) + " &gt;</stroke-text>";
            nextButton.onclick = () => {
                this.page++;
                this.redraw();
            };
        }
        else {
            nextButton.style.visibility = "hidden";
        }
        line.appendChild(nextButton);
        if (this.router.game.uiInputManager.inControl) {
            this.setHoveredButtonIndex(this.hoveredButtonIndex);
        }
    }
    get hoveredButtonIndex() {
        return this._hoveredButtonIndex;
    }
    get hoveredButtonColIndex() {
        return this._hoveredButtonIndex % this.colCount;
    }
    get hoveredButtonRowIndex() {
        return Math.floor(this._hoveredButtonIndex / this.colCount);
    }
    setHoveredButtonIndex(v, filter) {
        let btn = this.buttons[this._hoveredButtonIndex];
        if (btn) {
            btn.classList.remove("hovered");
        }
        this._hoveredButtonIndex = v;
        btn = this.buttons[this._hoveredButtonIndex];
        if (!btn) {
            return true;
        }
        else if ((!filter || filter(btn))) {
            if (btn) {
                btn.classList.add("hovered");
            }
            return true;
        }
        return false;
    }
    _registerToInputManager() {
        this.router.game.uiInputManager.onUpCallbacks.push(this._inputUp);
        this.router.game.uiInputManager.onLeftCallbacks.push(this._inputLeft);
        this.router.game.uiInputManager.onDownCallbacks.push(this._inputDown);
        this.router.game.uiInputManager.onRightCallbacks.push(this._inputRight);
        this.router.game.uiInputManager.onEnterCallbacks.push(this._inputEnter);
        this.router.game.uiInputManager.onBackCallbacks.push(this._inputBack);
        this.router.game.uiInputManager.onDropControlCallbacks.push(this._inputDropControl);
    }
    _unregisterFromInputManager() {
        this.router.game.uiInputManager.onUpCallbacks.remove(this._inputUp);
        this.router.game.uiInputManager.onLeftCallbacks.remove(this._inputLeft);
        this.router.game.uiInputManager.onDownCallbacks.remove(this._inputDown);
        this.router.game.uiInputManager.onRightCallbacks.remove(this._inputRight);
        this.router.game.uiInputManager.onEnterCallbacks.remove(this._inputEnter);
        this.router.game.uiInputManager.onBackCallbacks.remove(this._inputBack);
        this.router.game.uiInputManager.onDropControlCallbacks.remove(this._inputDropControl);
    }
}
class BaseLevelPage extends LevelPage {
    constructor(queryString, router) {
        super(queryString, router);
        this.className = "BaseLevelPage";
    }
    async getPuzzlesData(page, levelsPerPage) {
        let puzzleData = [];
        let data = this.router.game.tiaratumGameTutorialLevels;
        CLEAN_IPuzzlesData(data);
        for (let i = 0; i < levelsPerPage && i < data.puzzles.length + 1; i++) {
            let n = i + page * levelsPerPage;
            if (data.puzzles[n]) {
                let locked = true;
                if (n === 0) {
                    locked = false;
                }
                else if (data.puzzles[n - 1]) {
                    let prevId = data.puzzles[n - 1].id;
                    if (this.router.game.isPuzzleCompleted(prevId)) {
                        locked = false;
                    }
                }
                puzzleData[i] = {
                    data: data.puzzles[n],
                    onclick: () => {
                        this.router.game.puzzle.resetFromData(data.puzzles[n]);
                        location.hash = "level-" + (n + 1).toFixed(0);
                    },
                    locked: locked
                };
            }
            else if (n === data.puzzles.length) {
                puzzleData[i] = {
                    data: {
                        id: null,
                        title: "Puzzles and Challenges !",
                        author: "Tiaratum Games",
                        content: "0u0u0xaoooooooaxoowwnnnoaxonnwnnnorxonnwNoooOxonnwWoooOxonnwwnnorxoowwwnnoaxooooooooa",
                    },
                    onclick: () => {
                        location.hash = "#community";
                    }
                };
            }
        }
        return puzzleData;
    }
}
class CommunityLevelPage extends LevelPage {
    constructor(queryString, router) {
        super(queryString, router);
        this.className = "CommunityLevelPage";
    }
    async getPuzzlesData(page, levelsPerPage) {
        if (OFFLINE_MODE) {
            return this.getPuzzlesDataOffline(page, levelsPerPage);
        }
        let puzzleData = [];
        const response = await fetch(SHARE_SERVICE_PATH + "get_puzzles/" + page.toFixed(0) + "/" + levelsPerPage.toFixed(0), {
            method: "GET",
            mode: "cors"
        });
        if (response.status === 200) {
            let data = await response.json();
            CLEAN_IPuzzlesData(data);
            for (let i = 0; i < levelsPerPage && i < data.puzzles.length; i++) {
                let id = data.puzzles[i].id;
                puzzleData[i] = {
                    data: data.puzzles[i],
                    onclick: () => {
                        this.router.game.puzzle.resetFromData(data.puzzles[i]);
                        location.hash = "play-community-" + id;
                    }
                };
            }
        }
        else {
            console.error(await response.text());
        }
        return puzzleData;
    }
    async getPuzzlesDataOffline(page, levelsPerPage) {
        let puzzleData = [];
        let data = this.router.game.tiaratumGameOfflinePuzzleLevels;
        for (let i = 0; i < levelsPerPage && i < data.puzzles.length; i++) {
            let n = i + page * levelsPerPage;
            if (data.puzzles[n]) {
                puzzleData[i] = {
                    data: data.puzzles[n],
                    onclick: () => {
                        this.router.game.puzzle.resetFromData(data.puzzles[n]);
                        location.hash = "play-community-" + data.puzzles[n].id;
                    }
                };
            }
        }
        return puzzleData;
    }
}
class DevLevelPage extends LevelPage {
    constructor(queryString, router) {
        super(queryString, router);
        this.levelStateToFetch = 0;
        this.className = "DevLevelPage";
    }
    async getPuzzlesData(page, levelsPerPage) {
        let puzzleData = [];
        const response = await fetch(SHARE_SERVICE_PATH + "get_puzzles/" + page.toFixed(0) + "/" + levelsPerPage.toFixed(0) + "/" + this.levelStateToFetch.toFixed(0), {
            method: "GET",
            mode: "cors",
            headers: {
                "Authorization": 'Basic ' + btoa("carillon:" + var1)
            }
        });
        if (response.status === 200) {
            let text = await response.text();
            let data = JSON.parse(text);
            CLEAN_IPuzzlesData(data);
            for (let i = 0; i < levelsPerPage && i < data.puzzles.length; i++) {
                let id = data.puzzles[i].id;
                puzzleData[i] = {
                    data: data.puzzles[i],
                    onclick: () => {
                        this.router.game.puzzle.resetFromData(data.puzzles[i]);
                        location.hash = "play-community-" + id;
                    }
                };
            }
        }
        else {
            console.error(await response.text());
        }
        return puzzleData;
    }
}
class MultiplayerLevelPage extends LevelPage {
    constructor(queryString, router) {
        super(queryString, router);
        this.levelStateToFetch = 0;
        this.className = "MultiplayerLevelPage";
    }
    async getPuzzlesData(page, levelsPerPage) {
        let puzzleData = [];
        const response = await fetch(SHARE_SERVICE_PATH + "get_puzzles/" + page.toFixed(0) + "/" + levelsPerPage.toFixed(0) + "/3", {
            method: "GET",
            mode: "cors"
        });
        if (response.status === 200) {
            let text = await response.text();
            let data = JSON.parse(text);
            CLEAN_IPuzzlesData(data);
            for (let i = 0; i < levelsPerPage && i < data.puzzles.length; i++) {
                let id = data.puzzles[i].id;
                puzzleData[i] = {
                    data: data.puzzles[i],
                    onclick: () => {
                        this.router.game.puzzle.resetFromData(data.puzzles[i]);
                        location.hash = "play-community-" + id;
                    }
                };
            }
        }
        else {
            console.error(await response.text());
        }
        return puzzleData;
    }
}
/// <reference path="../lib/nabu/nabu.d.ts"/>
/// <reference path="../lib/mummu/mummu.d.ts"/>
/// <reference path="../lib/babylon.d.ts"/>
var CRL_VERSION = 0;
var CRL_VERSION2 = 0;
var CRL_VERSION3 = 21;
var VERSION = CRL_VERSION * 1000 + CRL_VERSION2 * 100 + CRL_VERSION3;
var CONFIGURATION_VERSION = CRL_VERSION * 1000 + CRL_VERSION2 * 100 + CRL_VERSION3;
var observed_progress_speed_percent_second;
var USE_POKI_SDK = true;
var PokiSDK;
var PokiSDKPlaying = false;
function PokiGameplayStart() {
    if (!PokiSDKPlaying) {
        console.log("PokiSDK.gameplayStart");
        PokiSDK.gameplayStart();
        PokiSDKPlaying = true;
    }
}
var CanStartCommercialBreak = false;
async function PokiCommercialBreak() {
    if (!CanStartCommercialBreak) {
        return;
    }
    if (location.host.startsWith("127.0.0.1")) {
        return;
    }
    let prevMainVolume = BABYLON.Engine.audioEngine.getGlobalVolume();
    BABYLON.Engine.audioEngine.setGlobalVolume(0);
    await PokiSDK.commercialBreak();
    BABYLON.Engine.audioEngine.setGlobalVolume(prevMainVolume);
}
function PokiGameplayStop() {
    if (PokiSDKPlaying) {
        PokiSDK.gameplayStop();
        PokiSDKPlaying = false;
    }
}
var PlayerHasInteracted = false;
var IsTouchScreen = -1;
var IsMobile = -1;
var HasLocalStorage = false;
var OFFLINE_MODE = false;
var SHARE_SERVICE_PATH = "https://carillion.tiaratum.com/index.php/";
if (location.host.startsWith("127.0.0.1")) {
    SHARE_SERVICE_PATH = "http://localhost/index.php/";
}
async function WaitPlayerInteraction() {
    return new Promise(resolve => {
        let wait = () => {
            if (PlayerHasInteracted) {
                resolve();
            }
            else {
                requestAnimationFrame(wait);
            }
        };
        wait();
    });
}
let onFirstPlayerInteractionTouch = (ev) => {
    if (!Game.Instance.gameLoaded) {
        return;
    }
    console.log("onFirstPlayerInteractionTouch");
    ev.stopPropagation();
    PlayerHasInteracted = true;
    document.body.removeEventListener("touchstart", onFirstPlayerInteractionTouch);
    //Game.Instance.showGraphicAutoUpdateAlert("Touch");
    setTimeout(() => {
        document.getElementById("click-anywhere-screen").style.display = "none";
    }, 300);
    Game.Instance.onResize();
    IsTouchScreen = 1;
    document.body.classList.add("touchscreen");
    IsMobile = /(?:phone|windows\s+phone|ipod|blackberry|(?:android|bb\d+|meego|silk|googlebot) .+? mobile|palm|windows\s+ce|opera\smini|avantgo|mobilesafari|docomo)/i.test(navigator.userAgent) ? 1 : 0;
    if (IsMobile === 1) {
        document.body.classList.add("mobile");
    }
    Game.Instance.soundManager.unlockEngine();
    if (Game.Instance.completedPuzzles.length === 0) {
        location.hash = "#level-1";
    }
};
let onFirstPlayerInteractionClick = (ev) => {
    if (!Game.Instance.gameLoaded) {
        return;
    }
    console.log("onFirstPlayerInteractionClic");
    ev.stopPropagation();
    PlayerHasInteracted = true;
    document.body.removeEventListener("click", onFirstPlayerInteractionClick);
    document.body.removeEventListener("keydown", onFirstPlayerInteractionKeyboard);
    //Game.Instance.showGraphicAutoUpdateAlert("Clic");
    setTimeout(() => {
        document.getElementById("click-anywhere-screen").style.display = "none";
    }, 300);
    Game.Instance.onResize();
    IsTouchScreen = 0;
    IsMobile = /(?:phone|windows\s+phone|ipod|blackberry|(?:android|bb\d+|meego|silk|googlebot) .+? mobile|palm|windows\s+ce|opera\smini|avantgo|mobilesafari|docomo)/i.test(navigator.userAgent) ? 1 : 0;
    if (IsMobile === 1) {
        document.body.classList.add("mobile");
    }
    Game.Instance.soundManager.unlockEngine();
    if (Game.Instance.completedPuzzles.length === 0) {
        location.hash = "#level-1";
    }
};
let onFirstPlayerInteractionKeyboard = (ev) => {
    if (!Game.Instance.gameLoaded) {
        return;
    }
    console.log("onFirstPlayerInteractionKeyboard");
    ev.stopPropagation();
    PlayerHasInteracted = true;
    document.body.removeEventListener("click", onFirstPlayerInteractionClick);
    document.body.removeEventListener("keydown", onFirstPlayerInteractionKeyboard);
    //Game.Instance.showGraphicAutoUpdateAlert("Keyboard");
    setTimeout(() => {
        document.getElementById("click-anywhere-screen").style.display = "none";
    }, 300);
    Game.Instance.onResize();
    IsTouchScreen = 0;
    IsMobile = /(?:phone|windows\s+phone|ipod|blackberry|(?:android|bb\d+|meego|silk|googlebot) .+? mobile|palm|windows\s+ce|opera\smini|avantgo|mobilesafari|docomo)/i.test(navigator.userAgent) ? 1 : 0;
    if (IsMobile === 1) {
        document.body.classList.add("mobile");
    }
    Game.Instance.soundManager.unlockEngine();
    if (Game.Instance.completedPuzzles.length === 0) {
        location.hash = "#level-1";
    }
};
function addLine(text) {
    let e = document.createElement("div");
    e.classList.add("debug-log");
    e.innerText = text;
    document.body.appendChild(e);
}
function StopPointerProgatation(ev) {
    ev.stopPropagation();
}
function StopPointerProgatationAndMonkeys(ev) {
    console.log("StopPointerProgatationAndMonkeys");
    ev.stopPropagation();
}
var TileColor;
(function (TileColor) {
    TileColor[TileColor["North"] = 0] = "North";
    TileColor[TileColor["East"] = 1] = "East";
    TileColor[TileColor["South"] = 2] = "South";
    TileColor[TileColor["West"] = 3] = "West";
})(TileColor || (TileColor = {}));
var TileColorNames = [
    "North",
    "East",
    "South",
    "West"
];
var GameMode;
(function (GameMode) {
    GameMode[GameMode["Menu"] = 0] = "Menu";
    GameMode[GameMode["Preplay"] = 1] = "Preplay";
    GameMode[GameMode["Play"] = 2] = "Play";
    GameMode[GameMode["Editor"] = 3] = "Editor";
})(GameMode || (GameMode = {}));
var cssColors = [
    "black",
    "brown",
    "salmon",
    "blue",
    "bluegrey",
    "lightblue",
    "beige",
    "red",
    "orange",
    "yellow",
    "green"
];
var hexColors = [
    "#2b2821",
    "#624c3c",
    "#d9ac8b",
    "#243d5c",
    "#5d7275",
    "#5c8b93",
    "#b1a58d",
    "#b03a48",
    "#d4804d",
    "#e0c872",
    "#3e6958"
];
var cssPatterns = [
    "cube-pattern",
    "rainbow-pattern"
];
class Game {
    constructor(canvasElement) {
        this.DEBUG_MODE = true;
        this.DEBUG_USE_LOCAL_STORAGE = true;
        this.screenRatio = 1;
        this.menuCamAlpha = -Math.PI * 0.75;
        this.menuCamBeta = Math.PI * 0.3;
        this.menuCamRadius = 15;
        this.playCameraRange = 15;
        this.playCameraRadius = 20;
        this.playCameraMinRadius = 5;
        this.playCameraMaxRadius = 100;
        this.cameraOrtho = false;
        this.player1Name = "";
        this.player2Name = "";
        this._mode = GameMode.Menu;
        this.completedPuzzles = [];
        this.gameLoaded = false;
        this._bodyColorIndex = 0;
        this._bodyPatternIndex = 0;
        this.onResize = () => {
            let rect = this.canvas.getBoundingClientRect();
            this.screenRatio = rect.width / rect.height;
            if (this.screenRatio < 1) {
                document.body.classList.add("vertical");
            }
            else {
                document.body.classList.remove("vertical");
            }
            this.engine.resize();
            this.canvas.setAttribute("width", Math.floor(rect.width * window.devicePixelRatio).toFixed(0));
            this.canvas.setAttribute("height", Math.floor(rect.height * window.devicePixelRatio).toFixed(0));
            this.updatePlayCameraRadius();
        };
        this.movieIdleDir = BABYLON.Vector3.Zero();
        this.factoredTimeSinceGameStart = 0;
        this.averagedFPS = 0;
        this.updateConfigTimeout = -1;
        this.globalTimer = 0;
        this.machineEditorContainerIsDisplayed = false;
        this.machineEditorContainerHeight = -1;
        this.machineEditorContainerWidth = -1;
        this.canvasLeft = 0;
        this._pointerDownX = 0;
        this._pointerDownY = 0;
        this.onPointerDown = (event) => {
            this._pointerDownX = this.scene.pointerX;
            this._pointerDownY = this.scene.pointerY;
        };
        this.onPointerUp = (event) => {
        };
        this.onWheelEvent = (event) => {
        };
        this._curtainOpacity = 0;
        this.fadeIntroDir = 0;
        Game.Instance = this;
        this.canvas = document.getElementById(canvasElement);
        this.canvas.requestPointerLock = this.canvas.requestPointerLock || this.canvas.msRequestPointerLock || this.canvas.mozRequestPointerLock || this.canvas.webkitRequestPointerLock;
        this.canvasCurtain = document.getElementById("canvas-curtain");
        this.engine = new BABYLON.Engine(this.canvas, true, undefined, false);
        BABYLON.Engine.ShadersRepository = "./shaders/";
        BABYLON.Engine.audioEngine.useCustomUnlockedButton = true;
        this.soundManager = new SoundManager();
        this.uiInputManager = new UserInterfaceInputManager(this);
    }
    getScene() {
        return this.scene;
    }
    get borderMaterial() {
        return this.brownMaterial;
    }
    get mode() {
        return this._mode;
    }
    set mode(m) {
        if (m != this._mode) {
            this._mode = m;
            this.globalTimer = 0;
        }
    }
    get bodyColorIndex() {
        return this._bodyColorIndex;
    }
    set bodyColorIndex(v) {
        document.body.classList.remove(cssColors[this._bodyColorIndex]);
        this._bodyColorIndex = v;
        document.body.classList.add(cssColors[this._bodyColorIndex]);
        this.bottom.material.diffuseColor = BABYLON.Color3.FromHexString(hexColors[this._bodyColorIndex]);
    }
    get bodyPatternIndex() {
        return this._bodyPatternIndex;
    }
    set bodyPatternIndex(v) {
        //document.body.classList.remove(cssPatterns[this._bodyPatternIndex]);
        this._bodyPatternIndex = v;
        //document.body.classList.add(cssPatterns[this._bodyPatternIndex]);
        if (v === 0) {
            this.bottom.material.emissiveTexture = new BABYLON.Texture("./datas/textures/cube_pattern_emissive.png");
            this.bottom.scaling.copyFromFloats(1.12, 1.95, 1);
        }
        else {
            this.bottom.material.emissiveTexture = new BABYLON.Texture("./datas/textures/rainbow_pattern_emissive.png");
            this.bottom.scaling.copyFromFloats(0.98, 1.11, 1);
        }
    }
    async createScene() {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = BABYLON.Color4.FromHexString("#00000000");
        this.vertexDataLoader = new Mummu.VertexDataLoader(this.scene);
        let rect = this.canvas.getBoundingClientRect();
        this.screenRatio = rect.width / rect.height;
        if (this.screenRatio < 1) {
            document.body.classList.add("vertical");
            this.playCameraRange = 11;
        }
        else {
            document.body.classList.remove("vertical");
            this.playCameraRange = 13;
        }
        this.canvas.setAttribute("width", Math.floor(rect.width * window.devicePixelRatio).toFixed(0));
        this.canvas.setAttribute("height", Math.floor(rect.height * window.devicePixelRatio).toFixed(0));
        this.light = new BABYLON.HemisphericLight("light", (new BABYLON.Vector3(2, 4, 3)).normalize(), this.scene);
        this.light.groundColor.copyFromFloats(0.3, 0.3, 0.3);
        /*
        this.skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1500 }, this.scene);
        this.skybox.rotation.x = Math.PI * 0.3;
        let skyboxMaterial: BABYLON.StandardMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
        skyboxMaterial.backFaceCulling = false;
        let skyTexture = new BABYLON.CubeTexture(
            "./datas/skyboxes/cloud",
            this.scene,
            ["-px.jpg", "-py.jpg", "-pz.jpg", "-nx.jpg", "-ny.jpg", "-nz.jpg"]);
        skyboxMaterial.reflectionTexture = skyTexture;
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.emissiveColor = BABYLON.Color3.FromHexString("#5c8b93").scaleInPlace(0.75);
        this.skybox.material = skyboxMaterial;
        */
        this.bottom = Mummu.CreateQuad("bottom", { width: 100, height: 100, uvInWorldSpace: true });
        this.bottom.rotation.x = Math.PI * 0.5;
        this.bottom.position.y = -5.1;
        let bottomMaterial = new BABYLON.StandardMaterial("bottom-material");
        bottomMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.bottom.material = bottomMaterial;
        this.stamp = new StampEffect(this);
        this.bodyColorIndex = 5;
        this.bodyPatternIndex = 0;
        this.camera = new BABYLON.ArcRotateCamera("camera", -Math.PI * 0.5, Math.PI * 0.1, 15, BABYLON.Vector3.Zero());
        this.camera.wheelPrecision *= 10;
        this.updatePlayCameraRadius();
        this.router = new CarillonRouter(this);
        this.router.initialize();
        await this.router.postInitialize();
        this.uiInputManager.initialize();
        let northMaterial = new BABYLON.StandardMaterial("north-material");
        northMaterial.specularColor.copyFromFloats(0, 0, 0);
        northMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/red-north-wind.png");
        let eastMaterial = new BABYLON.StandardMaterial("east-material");
        eastMaterial.specularColor.copyFromFloats(0, 0, 0);
        eastMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/yellow-east-wind.png");
        let southMaterial = new BABYLON.StandardMaterial("south-material");
        southMaterial.specularColor.copyFromFloats(0, 0, 0);
        southMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/blue-south-wind.png");
        let westMaterial = new BABYLON.StandardMaterial("west-material");
        westMaterial.specularColor.copyFromFloats(0, 0, 0);
        westMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/green-west-wind.png");
        this.waterMaterial = new BABYLON.StandardMaterial("floor-material");
        this.waterMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.waterMaterial.diffuseColor.copyFromFloats(1, 1, 1);
        this.waterMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/water.png");
        this.floorMaterial = new BABYLON.StandardMaterial("floor-material");
        this.floorMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.floorMaterial.diffuseColor.copyFromFloats(1, 1, 1);
        this.floorMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/floor_2.png");
        this.woodFloorMaterial = new BABYLON.StandardMaterial("dark-floor-material");
        this.woodFloorMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.woodFloorMaterial.diffuseColor.copyFromFloats(1, 1, 1);
        this.woodFloorMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/wood-plank.png");
        this.roofMaterial = new BABYLON.StandardMaterial("roof-material");
        this.roofMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.roofMaterial.diffuseColor = BABYLON.Color3.FromHexString("#243d5c");
        this.roofMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/wall.png");
        this.roofMaterial.diffuseTexture.uScale = 5;
        this.roofMaterial.diffuseTexture.vScale = 5;
        this.woodMaterial = new BABYLON.StandardMaterial("wood-material");
        this.woodMaterial.diffuseColor = BABYLON.Color3.FromHexString("#624c3c");
        this.woodMaterial.specularColor.copyFromFloats(0, 0, 0);
        //this.woodMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/roof.png");
        //(this.woodMaterial.diffuseTexture as BABYLON.Texture).uScale = 10;
        //(this.woodMaterial.diffuseTexture as BABYLON.Texture).vScale = 10;
        this.wallMaterial = new BABYLON.StandardMaterial("wall-material");
        this.wallMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.wallMaterial.diffuseColor = BABYLON.Color3.FromHexString("#e3cfb4");
        this.wallMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/wall.png");
        this.brickWallMaterial = new BABYLON.StandardMaterial("wall-material");
        this.brickWallMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.brickWallMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/Stone_05.png");
        this.holeMaterial = new BABYLON.StandardMaterial("roof-material");
        this.holeMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.holeMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/Stone_01.png");
        this.shadow9Material = new BABYLON.StandardMaterial("shadow-material");
        this.shadow9Material.diffuseColor.copyFromFloats(0.1, 0.1, 0.1);
        this.shadow9Material.diffuseTexture = new BABYLON.Texture("./datas/textures/shadow-9.png");
        this.shadow9Material.diffuseTexture.hasAlpha = true;
        this.shadow9Material.useAlphaFromDiffuseTexture = true;
        this.shadow9Material.alpha = 0.4;
        this.shadow9Material.specularColor.copyFromFloats(0, 0, 0);
        this.whiteShadow9Material = new BABYLON.StandardMaterial("white-shadow9-material");
        this.whiteShadow9Material.diffuseColor.copyFromFloats(1, 1, 1);
        this.whiteShadow9Material.diffuseTexture = new BABYLON.Texture("./datas/textures/shadow-9.png");
        this.whiteShadow9Material.diffuseTexture.hasAlpha = true;
        this.whiteShadow9Material.useAlphaFromDiffuseTexture = true;
        this.whiteShadow9Material.alpha = 1;
        this.whiteShadow9Material.specularColor.copyFromFloats(0, 0, 0);
        this.shadowDiscMaterial = new BABYLON.StandardMaterial("shadow-material");
        this.shadowDiscMaterial.diffuseColor.copyFromFloats(0.1, 0.1, 0.1);
        this.shadowDiscMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/shadow-disc.png");
        this.shadowDiscMaterial.diffuseTexture.hasAlpha = true;
        this.shadowDiscMaterial.useAlphaFromDiffuseTexture = true;
        this.shadowDiscMaterial.alpha = 0.4;
        this.shadowDiscMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.puckSideMaterial = new BABYLON.StandardMaterial("shadow-material");
        this.puckSideMaterial.diffuseColor.copyFromFloats(1, 1, 1);
        this.puckSideMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/puck-side-arrow.png");
        this.puckSideMaterial.diffuseTexture.hasAlpha = true;
        this.puckSideMaterial.emissiveColor.copyFromFloats(1, 1, 1);
        this.puckSideMaterial.useAlphaFromDiffuseTexture = true;
        this.puckSideMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.tileColorMaterials = [];
        this.tileColorMaterials[TileColor.North] = northMaterial;
        this.tileColorMaterials[TileColor.South] = southMaterial;
        this.tileColorMaterials[TileColor.East] = eastMaterial;
        this.tileColorMaterials[TileColor.West] = westMaterial;
        this.tileColorShinyMaterials = [];
        this.tileColorShinyMaterials[TileColor.North] = northMaterial.clone(northMaterial.name + "-shiny");
        this.tileColorShinyMaterials[TileColor.East] = eastMaterial.clone(eastMaterial.name + "-shiny");
        this.tileColorShinyMaterials[TileColor.South] = southMaterial.clone(southMaterial.name + "-shiny");
        this.tileColorShinyMaterials[TileColor.West] = westMaterial.clone(westMaterial.name + "-shiny");
        this.tileColorShinyMaterials.forEach(shinyMat => {
            //shinyMat.specularColor.copyFromFloats(1, 1, 1);
            //shinyMat.specularPower = 256;
        });
        this.trueWhiteMaterial = new BABYLON.StandardMaterial("true-white-material");
        this.trueWhiteMaterial.diffuseColor = BABYLON.Color3.FromHexString("#ffffff");
        this.trueWhiteMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.whiteMaterial = new BABYLON.StandardMaterial("white-material");
        this.whiteMaterial.diffuseColor = BABYLON.Color3.FromHexString("#e3cfb4");
        this.whiteMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.grayMaterial = new BABYLON.StandardMaterial("gray-material");
        this.grayMaterial.diffuseColor = BABYLON.Color3.FromHexString("#5d7275");
        this.grayMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.blackMaterial = new BABYLON.StandardMaterial("black-material");
        this.blackMaterial.diffuseColor = BABYLON.Color3.FromHexString("#2b2821");
        this.blackMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.brownMaterial = new BABYLON.StandardMaterial("brown-material");
        this.brownMaterial.diffuseColor = BABYLON.Color3.FromHexString("#624c3c");
        this.brownMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.salmonMaterial = new BABYLON.StandardMaterial("salmon-material");
        this.salmonMaterial.diffuseColor = BABYLON.Color3.FromHexString("#d9ac8b");
        this.salmonMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.blueMaterial = new BABYLON.StandardMaterial("blue-material");
        this.blueMaterial.diffuseColor = BABYLON.Color3.FromHexString("#243d5c");
        this.blueMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.redMaterial = new BABYLON.StandardMaterial("red-material");
        this.redMaterial.diffuseColor = BABYLON.Color3.FromHexString("#b03a48");
        this.redMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.yellowMaterial = new BABYLON.StandardMaterial("yellow-material");
        this.yellowMaterial.diffuseColor = BABYLON.Color3.FromHexString("#e0c872");
        this.yellowMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.greenMaterial = new BABYLON.StandardMaterial("green-material");
        this.greenMaterial.diffuseColor = BABYLON.Color3.FromHexString("#3e6958");
        this.greenMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.colorMaterials = [
            this.redMaterial,
            this.yellowMaterial,
            this.blueMaterial,
            this.greenMaterial
        ];
        let cubicNoiseTexture = new CubicNoiseTexture(this.scene);
        cubicNoiseTexture.double();
        cubicNoiseTexture.double();
        cubicNoiseTexture.double();
        cubicNoiseTexture.double();
        cubicNoiseTexture.double();
        cubicNoiseTexture.double();
        cubicNoiseTexture.double();
        cubicNoiseTexture.randomize();
        cubicNoiseTexture.smooth();
        this.noiseTexture = cubicNoiseTexture.get3DTexture();
        let borderDatas = await this.vertexDataLoader.get("./datas/meshes/border.babylon");
        borderDatas.forEach(data => {
            let positions = data.positions;
            for (let i = 0; i < positions.length / 3; i++) {
                let x = positions[3 * i];
                let y = positions[3 * i + 1];
                let z = positions[3 * i + 2];
                let nx = data.normals[3 * i];
                let ny = data.normals[3 * i + 1];
                let nz = data.normals[3 * i + 2];
                if (Math.abs(z - 0.55) < 0.01 || Math.abs(z + 0.55) < 0.01) {
                    let n = new BABYLON.Vector3(nx, ny, 0);
                    n.normalize();
                    data.normals[3 * i] = n.x;
                    data.normals[3 * i + 1] = n.y;
                    data.normals[3 * i + 2] = n.z;
                }
            }
        });
        if (HasLocalStorage) {
            let dataString = window.localStorage.getItem("completed-puzzles-v" + VERSION.toFixed(0));
            if (dataString) {
                this.completedPuzzles = JSON.parse(dataString);
            }
        }
        let tutorialPuzzles;
        if (OFFLINE_MODE) {
            const response = await fetch("./datas/levels/tiaratum_tutorial_levels.json", {
                method: "GET",
                mode: "cors"
            });
            tutorialPuzzles = await response.json();
            CLEAN_IPuzzlesData(tutorialPuzzles);
        }
        else {
            try {
                const response = await fetch(SHARE_SERVICE_PATH + "get_puzzles/0/20/2", {
                    method: "GET",
                    mode: "cors"
                });
                if (!response.ok) {
                    throw new Error("Response status: " + response.status);
                }
                tutorialPuzzles = await response.json();
                CLEAN_IPuzzlesData(tutorialPuzzles);
            }
            catch (e) {
                console.error(e);
                OFFLINE_MODE = true;
                const response = await fetch("./datas/levels/tiaratum_tutorial_levels.json", {
                    method: "GET",
                    mode: "cors"
                });
                tutorialPuzzles = await response.json();
                CLEAN_IPuzzlesData(tutorialPuzzles);
            }
        }
        for (let i = 0; i < tutorialPuzzles.puzzles.length; i++) {
            tutorialPuzzles.puzzles[i].title = (i + 1).toFixed(0) + ". " + tutorialPuzzles.puzzles[i].title;
        }
        this.tiaratumGameTutorialLevels = tutorialPuzzles;
        for (let i = 0; i < this.tiaratumGameTutorialLevels.puzzles.length; i++) {
            this.tiaratumGameTutorialLevels.puzzles[i].numLevel = (i + 1);
        }
        if (OFFLINE_MODE) {
            let offlinePuzzles;
            const response = await fetch("./datas/levels/tiaratum_offline_levels.json", {
                method: "GET",
                mode: "cors"
            });
            offlinePuzzles = await response.json();
            CLEAN_IPuzzlesData(offlinePuzzles);
            this.tiaratumGameOfflinePuzzleLevels = offlinePuzzles;
        }
        this.puzzle = new Puzzle(this);
        await this.puzzle.loadFromFile("./datas/levels/test.txt");
        await this.puzzle.instantiate();
        this.editor = new Editor(this);
        /*
        let bridge = new Bridge(this, {
            i: 12,
            j: 6,
            borderBottom: true,
            borderTop: true
        });
        await bridge.instantiate();

        let box3 = new Box(this, {
            i: 16,
            j: 6,
            borderRight: true,
            borderTop: true
        });
        await box3.instantiate();

        let ramp2 = new Ramp(this, {
            i: 16,
            j: 3
        });
        await ramp2.instantiate();
        */
        this.canvas.addEventListener("pointerdown", this.onPointerDown);
        this.canvas.addEventListener("pointerup", this.onPointerUp);
        this.canvas.addEventListener("wheel", this.onWheelEvent);
        this.router.start();
        document.querySelectorAll(".p1-name-input").forEach(e => {
            if (e instanceof HTMLInputElement) {
                e.onchange = () => {
                    let v = e.value;
                    this.player1Name = v;
                    if (v.length > 2) {
                        document.querySelector("#success-score-submit-btn").classList.remove("locked");
                    }
                    else {
                        document.querySelector("#success-score-submit-btn").classList.add("locked");
                    }
                    if (this.player1Name.length > 2 && this.player2Name.length > 2) {
                        this.router.multiplayerPage.localPlayBtn.classList.remove("locked");
                    }
                    else {
                        this.router.multiplayerPage.localPlayBtn.classList.add("locked");
                    }
                    document.querySelectorAll(".p1-name-input").forEach(e2 => {
                        if (e2 instanceof HTMLInputElement) {
                            e2.value = v;
                        }
                    });
                };
            }
        });
        document.querySelectorAll(".p2-name-input").forEach(e => {
            if (e instanceof HTMLInputElement) {
                e.onchange = () => {
                    let v = e.value;
                    this.player2Name = v;
                    if (this.player1Name.length > 2 && this.player2Name.length > 2) {
                        this.router.multiplayerPage.localPlayBtn.classList.remove("locked");
                    }
                    else {
                        this.router.multiplayerPage.localPlayBtn.classList.add("locked");
                    }
                    document.querySelectorAll(".p2-name-input").forEach(e2 => {
                        if (e2 instanceof HTMLInputElement) {
                            e2.value = v;
                        }
                    });
                };
            }
        });
        document.querySelector("#success-score-submit-btn").onclick = () => {
            this.puzzle.submitHighscore();
        };
        document.querySelector("#reset-btn").onclick = async () => {
            await this.puzzle.reset();
            this.puzzle.skipIntro();
        };
        document.querySelector("#zoom-out-btn").onclick = () => {
            this.playCameraRange += 1;
            this.updatePlayCameraRadius();
        };
        document.querySelector("#zoom-in-btn").onclick = () => {
            this.playCameraRange -= 1;
            this.updatePlayCameraRadius();
        };
        document.querySelector("#dev-mode-activate-btn").onclick = () => {
            DEV_ACTIVATE();
        };
        document.querySelector("#eula-back-btn").onclick = () => {
            this.router.eulaPage.hide(0);
        };
        document.querySelector("#title-version").innerHTML = "confidential build - v" + CRL_VERSION + "." + CRL_VERSION2 + "." + CRL_VERSION3;
        let devSecret = 0;
        let devSecretTimout = 0;
        document.querySelector("#home-menu h1").style.pointerEvents = "auto";
        document.querySelector("#home-menu h1").onclick = () => {
            if (devSecret < 6) {
                devSecret++;
            }
            console.log(devSecret);
            clearTimeout(devSecretTimout);
            devSecretTimout = setTimeout(() => {
                devSecret = 0;
            }, 3000);
        };
        document.addEventListener("keyup", ev => {
            if (devSecret === 6 && ev.code === "KeyD") {
                devSecret++;
            }
            else if (devSecret === 7 && ev.code === "KeyE") {
                devSecret++;
            }
            else if (devSecret === 8 && ev.code === "KeyV") {
                devSecret++;
            }
            else if (devSecret === 9 && ev.code === "Numpad1") {
                devSecret++;
            }
            else if (devSecret === 10 && ev.code === "Numpad9") {
                devSecret++;
            }
            else if (devSecret === 11 && ev.code === "Numpad9") {
                devSecret++;
            }
            else if (devSecret === 12 && ev.code === "Numpad1") {
                clearTimeout(devSecretTimout);
                devSecret = 0;
                location.hash = "#dev";
            }
            clearTimeout(devSecretTimout);
            devSecretTimout = setTimeout(() => {
                devSecret = 0;
            }, 3000);
        });
        let ambient = this.soundManager.createSound("ambient", "./datas/sounds/zen-ambient.mp3", this.scene, () => {
            ambient.setVolume(0.15);
        }, {
            autoplay: true,
            loop: true
        });
        if (this.completedPuzzles.length > 0) {
            //page = "#home";
        }
        let puzzleId;
        if (location.search != "") {
            let puzzleIdStr = location.search.replace("?puzzle=", "");
            if (puzzleIdStr) {
                puzzleId = parseInt(puzzleIdStr);
                if (puzzleId) {
                }
            }
        }
        this.gameLoaded = true;
        document.body.addEventListener("touchstart", onFirstPlayerInteractionTouch);
        document.body.addEventListener("click", onFirstPlayerInteractionClick);
        document.body.addEventListener("keydown", onFirstPlayerInteractionKeyboard);
        if (location.host.startsWith("127.0.0.1")) {
            document.getElementById("click-anywhere-screen").style.display = "none";
            document.querySelector("#dev-pass-input").value = "Crillion";
            DEV_ACTIVATE();
        }
    }
    static ScoreToString(t) {
        t = t / 100;
        let min = Math.floor(t / 60);
        let sec = Math.floor(t - 60 * min);
        let centi = Math.floor((t - 60 * min - sec) * 100);
        return min.toFixed(0).padStart(2, "0") + ":" + sec.toFixed(0).padStart(2, "0") + ":" + centi.toFixed(0).padStart(2, "0");
    }
    setPlayTimer(t) {
        let min = Math.floor(t / 60);
        let sec = Math.floor(t - 60 * min);
        let centi = Math.floor((t - 60 * min - sec) * 100);
        if (this.router && this.router.timerText) {
            let strokes = this.router && this.router.timerText.querySelectorAll("stroke-text");
            strokes[0].setContent(min.toFixed(0).padStart(2, "0") + ":");
            strokes[1].setContent(sec.toFixed(0).padStart(2, "0") + ":");
            strokes[2].setContent(centi.toFixed(0).padStart(2, "0"));
        }
    }
    animate() {
        this.engine.runRenderLoop(() => {
            this.scene.render();
            this.update();
        });
        window.onresize = this.onResize;
        if (screen && screen.orientation) {
            screen.orientation.onchange = this.onResize;
        }
    }
    async initialize() {
    }
    getCameraHorizontalFOV() {
        return 2 * Math.atan(this.screenRatio * Math.tan(this.camera.fov / 2));
    }
    updatePlayCameraRadius() {
        let minFov = Math.min(this.camera.fov, this.getCameraHorizontalFOV());
        this.playCameraRadius = Nabu.MinMax(this.playCameraRange / Math.tan(minFov), this.playCameraMinRadius, this.playCameraMaxRadius);
    }
    updateMenuCameraRadius() {
        let minFov = Math.min(this.camera.fov, this.getCameraHorizontalFOV());
        this.menuCamRadius = Nabu.MinMax(Math.min(this.playCameraRange, Math.max(this.puzzle.w, this.puzzle.h) * 1.1) / Math.tan(minFov), this.playCameraMinRadius, this.playCameraMaxRadius);
    }
    update() {
        let rawDT = this.scene.deltaTime / 1000;
        if (isFinite(rawDT)) {
            this.globalTimer += rawDT;
            let aLeft = -Math.PI * 0.9;
            let aRight = -Math.PI * 0.3;
            let a0 = (aLeft + aRight) * 0.5;
            let aDist = Math.abs(aLeft - aRight) * 0.5;
            let fa = Math.sin(this.globalTimer / 40 * 2 * Math.PI);
            this.menuCamAlpha = a0 + aDist * fa;
            let bTop = Math.PI * 0.1;
            let bBottom = Math.PI * 0.35;
            let b0 = (bTop + bBottom) * 0.5;
            let bDist = Math.abs(bTop - bBottom) * 0.5;
            let fb = Math.sin(this.globalTimer / 20 * 2 * Math.PI);
            this.menuCamBeta = b0 + bDist * fb;
            if (this.mode === GameMode.Play) {
                let targetCameraPos = this.puzzle.balls[0].absolutePosition.clone();
                if (this.puzzle.ballsCount === 2) {
                    targetCameraPos.addInPlace(this.puzzle.balls[1].absolutePosition).scaleInPlace(0.5);
                }
                rawDT = Math.min(rawDT, 1);
                targetCameraPos.y = Math.max(targetCameraPos.y, -2.5);
                let margin = 3;
                if (this.puzzle.xMax - this.puzzle.xMin > 2 * margin) {
                    targetCameraPos.x = Nabu.MinMax(targetCameraPos.x, this.puzzle.xMin + margin, this.puzzle.xMax - margin);
                }
                else {
                    targetCameraPos.x = (this.puzzle.xMin + this.puzzle.xMax) * 0.5;
                }
                if (this.puzzle.zMax - this.puzzle.zMin > 2 * margin) {
                    targetCameraPos.z = Nabu.MinMax(targetCameraPos.z, this.puzzle.zMin + margin * 0.85, this.puzzle.zMax - margin * 1.15);
                }
                else {
                    targetCameraPos.z = (this.puzzle.zMin * 0.85 + this.puzzle.zMax * 1.15) * 0.5;
                }
                let relZPos = (targetCameraPos.z - this.puzzle.zMin) / (this.puzzle.zMax - this.puzzle.zMin);
                let targetCamBeta = Math.PI * 0.01 * relZPos + Math.PI * 0.15 * (1 - relZPos);
                targetCamBeta = 0.1 * Math.PI;
                let f = Nabu.Easing.smoothNSec(1 / rawDT, Math.max(1, 3 - this.globalTimer));
                BABYLON.Vector3.LerpToRef(this.camera.target, targetCameraPos, (1 - f), this.camera.target);
                let f3 = Nabu.Easing.smoothNSec(1 / rawDT, Math.max(2, 4 - this.globalTimer));
                this.camera.alpha = this.camera.alpha * f3 + (-Math.PI * 0.5) * (1 - f3);
                this.camera.beta = this.camera.beta * f3 + targetCamBeta * (1 - f3);
                let f4 = Nabu.Easing.smoothNSec(1 / rawDT, Math.max(0.25, 2.25 - this.globalTimer));
                this.camera.radius = this.camera.radius * f4 + (this.playCameraRadius) * (1 - f4);
            }
            else if (this.mode === GameMode.Menu || this.mode === GameMode.Preplay) {
                rawDT = Math.min(rawDT, 1);
                let w = this.puzzle.xMax - this.puzzle.xMin;
                let d = this.puzzle.zMax - this.puzzle.zMin;
                let targetCameraPos = new BABYLON.Vector3(0.5 * (this.puzzle.xMin + this.puzzle.xMax) + 0.2 * w * Math.cos(this.globalTimer / 30 * 2 * Math.PI), 0, 0.4 * (this.puzzle.zMin + this.puzzle.zMax) + 0.2 * d * Math.sin(this.globalTimer / 30 * 2 * Math.PI));
                let f3 = Nabu.Easing.smoothNSec(1 / rawDT, Math.max(1, 8 - this.globalTimer));
                BABYLON.Vector3.LerpToRef(this.camera.target, targetCameraPos, (1 - f3), this.camera.target);
                this.camera.alpha = this.camera.alpha * f3 + this.menuCamAlpha * (1 - f3);
                this.camera.beta = this.camera.beta * f3 + this.menuCamBeta * (1 - f3);
                this.camera.radius = this.camera.radius * f3 + this.menuCamRadius * (1 - f3);
            }
            else if (this.mode === GameMode.Editor) {
                this.camera.target.x = Nabu.MinMax(this.camera.target.x, this.puzzle.xMin, this.puzzle.xMax);
                this.camera.target.z = Nabu.MinMax(this.camera.target.z, this.puzzle.zMin, this.puzzle.zMax);
                this.camera.target.y = 0;
                this.editor.update(rawDT);
            }
            if (this.mode === GameMode.Preplay || this.mode === GameMode.Play) {
                if (this.puzzle) {
                    this.puzzle.update(rawDT);
                }
            }
            this.waterMaterial.diffuseTexture.vOffset += 0.5 * rawDT;
            if (this.waterMaterial.diffuseTexture.vOffset > 1) {
                this.waterMaterial.diffuseTexture.vOffset -= 1;
            }
        }
    }
    completePuzzle(id, score) {
        let comp = this.completedPuzzles.find(comp => { return comp.id === id; });
        if (!comp) {
            comp = { id: id, score: score };
            this.completedPuzzles.push(comp);
        }
        else if (comp.score > score) {
            comp.score = Math.min(comp.score, score);
        }
        if (HasLocalStorage) {
            window.localStorage.setItem("completed-puzzles-v" + VERSION.toFixed(0), JSON.stringify(this.completedPuzzles));
        }
    }
    isPuzzleCompleted(id) {
        return this.completedPuzzles.findIndex(comp => { return comp.id === id; }) != -1;
    }
    getPersonalBestScore(id) {
        let comp = this.completedPuzzles.find(comp => { return comp.id === id; });
        if (comp) {
            return comp.score;
        }
        return Infinity;
    }
    get curtainOpacity() {
        return this._curtainOpacity;
    }
    set curtainOpacity(v) {
        this._curtainOpacity = v;
        if (this._curtainOpacity === 0) {
            this.canvasCurtain.style.display = "none";
        }
        else {
            this.canvasCurtain.style.display = "block";
            this.canvasCurtain.style.backgroundColor = "#000000" + Math.round(this._curtainOpacity * 255).toString(16).padStart(2, "0");
        }
    }
    async fadeInIntro(duration = 1) {
        if (this.router.puzzleIntro) {
            this.router.puzzleIntro.style.opacity = "0";
            let t0 = performance.now();
            let step = () => {
                if (this.fadeIntroDir < 0) {
                    return;
                }
                let f = (performance.now() - t0) / 1000 / duration;
                if (f < 1) {
                    this.router.puzzleIntro.style.opacity = f.toFixed(2);
                    requestAnimationFrame(step);
                }
                else {
                    this.router.puzzleIntro.style.opacity = "1";
                }
            };
            this.fadeIntroDir = 1;
            step();
        }
    }
    async fadeOutIntro(duration = 1) {
        if (this.router.puzzleIntro) {
            this.router.puzzleIntro.style.opacity = "1";
            let t0 = performance.now();
            let step = () => {
                if (this.fadeIntroDir > 0) {
                    return;
                }
                let f = (performance.now() - t0) / 1000 / duration;
                if (f < 1) {
                    this.router.puzzleIntro.style.opacity = (1 - f).toFixed(2);
                    requestAnimationFrame(step);
                }
                else {
                    this.router.puzzleIntro.style.opacity = "0";
                }
            };
            this.fadeIntroDir = -1;
            step();
        }
    }
}
function DEBUG_LOG_MESHES_NAMES() {
    let meshes = Game.Instance.scene.meshes.map(m => { return m.name; });
    let countedMeshNames = [];
    meshes.forEach(meshName => {
        let existing = countedMeshNames.find(e => { return e.name === meshName; });
        if (!existing) {
            countedMeshNames.push({ name: meshName, count: 1 });
        }
        else {
            existing.count++;
        }
    });
    countedMeshNames.sort((e1, e2) => { return e1.count - e2.count; });
    console.log(countedMeshNames);
}
async function DEV_GENERATE_TUTORIAL_LEVEL_FILE() {
    const response = await fetch(SHARE_SERVICE_PATH + "get_puzzles/0/20/2", {
        method: "GET",
        mode: "cors"
    });
    if (response.status === 200) {
        let data = await response.json();
        Nabu.download("tiaratum_tutorial_levels.json", JSON.stringify(data));
    }
    else {
        console.error(await response.text());
    }
}
async function DEV_GENERATE_PUZZLE_LEVEL_FILE() {
    const response = await fetch(SHARE_SERVICE_PATH + "get_puzzles/0/40/1", {
        method: "GET",
        mode: "cors"
    });
    if (response.status === 200) {
        let data = await response.json();
        Nabu.download("tiaratum_offline_levels.json", JSON.stringify(data));
    }
    else {
        console.error(await response.text());
    }
}
var DEV_MODE_ACTIVATED = false;
var var1 = "";
function DEV_ACTIVATE() {
    DEV_MODE_ACTIVATED = true;
    var1 = document.querySelector("#dev-pass-input").value;
    document.querySelector("#dev-page .dev-active").style.display = "block";
    document.querySelector("#dev-back-btn").style.display = "block";
    document.querySelector("#dev-page .dev-not-active").style.display = "none";
    document.querySelectorAll("h1").forEach(e => {
        e.style.fontFamily = "Consolas";
        e.style.color = "lime";
        e.style.backgroundColor = "black";
        let info = document.createElement("div");
        info.innerHTML = "[dev mode ON] with great power comes great responsibilities";
        info.style.fontSize = "16px";
        info.style.color = "lime";
        info.style.paddingBottom = "5px";
        e.appendChild(info);
    });
    let devStateBtns = [];
    for (let i = 0; i <= 6; i++) {
        let btn = document.getElementById("dev-state-" + i.toFixed(0) + "-btn");
        devStateBtns.push(btn);
    }
    for (let i = 0; i < devStateBtns.length; i++) {
        devStateBtns[i].style.display = "block";
        let state = i;
        devStateBtns[i].onclick = async () => {
            let id = parseInt(location.hash.replace("#play-community-", ""));
            if (isFinite(id)) {
                let data = {
                    id: id,
                    state: state
                };
                let dataString = JSON.stringify(data);
                const response = await fetch(SHARE_SERVICE_PATH + "set_puzzle_state", {
                    method: "POST",
                    mode: "cors",
                    headers: {
                        "Authorization": 'Basic ' + btoa("carillon:" + var1)
                    },
                    body: dataString,
                });
                Game.Instance.puzzle.data.state = state;
                DEV_UPDATE_STATE_UI();
            }
        };
    }
    document.querySelector("#dev-story-order").style.display = "block";
    let devStoryOrderBtns = document.querySelectorAll("#dev-story-order button");
    let devStoryOrderMinus = devStoryOrderBtns[0];
    devStoryOrderMinus.onclick = () => {
        Game.Instance.puzzle.data.story_order--;
        DEV_UPDATE_STATE_UI();
    };
    let devStoryOrderPlus = devStoryOrderBtns[1];
    devStoryOrderPlus.onclick = () => {
        Game.Instance.puzzle.data.story_order++;
        DEV_UPDATE_STATE_UI();
    };
    let devStoryOrderSend = devStoryOrderBtns[2];
    devStoryOrderSend.onclick = async () => {
        let id = parseInt(location.hash.replace("#play-community-", ""));
        if (isFinite(id)) {
            let data = {
                id: id,
                story_order: Game.Instance.puzzle.data.story_order
            };
            let dataString = JSON.stringify(data);
            const response = await fetch(SHARE_SERVICE_PATH + "set_puzzle_story_order", {
                method: "POST",
                mode: "cors",
                headers: {
                    "Authorization": 'Basic ' + btoa("carillon:" + var1)
                },
                body: dataString,
            });
        }
    };
}
function DEV_UPDATE_STATE_UI() {
    let devStateBtns = [];
    for (let i = 0; i <= 6; i++) {
        let btn = document.getElementById("dev-state-" + i.toFixed(0) + "-btn");
        devStateBtns.push(btn);
    }
    devStateBtns.forEach(btn => {
        btn.classList.remove("selected");
    });
    if (devStateBtns[Game.Instance.puzzle.data.state]) {
        devStateBtns[Game.Instance.puzzle.data.state].classList.add("selected");
    }
    let storyOrderVal = document.querySelector("#dev-story-order span stroke-text");
    storyOrderVal.setContent(isFinite(Game.Instance.puzzle.data.story_order) ? Game.Instance.puzzle.data.story_order.toFixed(0) : "0");
}
let createAndInit = async () => {
    try {
        window.localStorage.setItem("test-local-storage", "Test Local Storage Availability");
        window.localStorage.removeItem("test-local-storage");
        HasLocalStorage = true;
    }
    catch {
        HasLocalStorage = false;
    }
    let main = new Game("render-canvas");
    await main.createScene();
    main.initialize().then(() => {
        main.animate();
    });
};
requestAnimationFrame(() => {
    if (USE_POKI_SDK) {
        PokiSDK.init().then(() => {
            createAndInit();
        });
    }
    else {
        createAndInit();
    }
});
var MultiplayerPagePanel;
(function (MultiplayerPagePanel) {
    MultiplayerPagePanel[MultiplayerPagePanel["Selection"] = 0] = "Selection";
    MultiplayerPagePanel[MultiplayerPagePanel["Local"] = 1] = "Local";
})(MultiplayerPagePanel || (MultiplayerPagePanel = {}));
class MultiplayerPage {
    constructor(queryString, router) {
        this.router = router;
        this.currentPanel = MultiplayerPagePanel.Selection;
        this.panels = [];
        this._hoveredButtonIndex = 0;
        this._filter = (btn) => {
            return !btn.classList.contains("locked") && btn.style.visibility != "hidden";
        };
        this._inputUp = () => {
            if (!this.shown) {
                return;
            }
            /*
            if (this.buttons.length === 0) {
                return;
            }
            if (this.hoveredButtonIndex === 0) {
                if (!this.setHoveredButtonIndex(this.hoveredButtonIndex + (this.rowCount - 1), this._filter)) {
                    this._inputUp();
                }
            }
            else {
                if (!this.setHoveredButtonIndex(this.hoveredButtonIndex - 1, this._filter)) {
                    this._inputUp();
                }
            }
            */
        };
        this._inputDown = () => {
            if (!this.shown) {
                return;
            }
            /*
            if (this.buttons.length === 0) {
                return;
            }
            if (this.hoveredButtonIndex === this.rowCount - 1) {
                if (!this.setHoveredButtonIndex(this.hoveredButtonIndex - (this.rowCount - 1), this._filter)) {
                    this._inputDown();
                }
            }
            else {
                if (!this.setHoveredButtonIndex(this.hoveredButtonIndex + 1, this._filter)) {
                    this._inputDown();
                }
            }
            */
        };
        this._inputEnter = () => {
            if (!this.shown) {
                return;
            }
            /*
            if (this.buttons.length === 0) {
                return;
            }
            let btn = this.buttons[this._hoveredButtonIndex];
            if (btn && btn.onpointerup) {
                btn.onpointerup(undefined);
            }
            */
        };
        this._inputDropControl = () => {
            if (!this.shown) {
                return;
            }
            /*
            if (this.buttons.length === 0) {
                return;
            }
            this.buttons.forEach(btn => {
                btn.classList.remove("hovered");
            });
            */
        };
        this.nabuPage = document.querySelector(queryString);
        this.panels = [
            document.querySelector("#multiplayer-panel-selection"),
            document.querySelector("#multiplayer-panel-local")
        ];
        this.selectLocalBtn = document.querySelector("#multiplayer-select-local");
        this.selectLocalBtn.onclick = () => {
            this.setPanel(MultiplayerPagePanel.Local);
        };
        this.selectPublicBtn = document.querySelector("#multiplayer-select-public");
        this.selectPrivateBtn = document.querySelector("#multiplayer-select-private");
        this.localPlayBtn = this.panels[MultiplayerPagePanel.Local].querySelector(".multiplayer-play");
        this.panels[MultiplayerPagePanel.Local].querySelector(".multiplayer-back").onclick = () => {
            this.setPanel(MultiplayerPagePanel.Selection);
        };
        this._registerToInputManager();
    }
    setPanel(p) {
        for (let i = 0; i < this.panels.length; i++) {
            this.panels[i].style.display = (p === i) ? "block" : "none";
        }
    }
    get shown() {
        return this.nabuPage.shown;
    }
    async show(duration) {
        return this.nabuPage.show(duration);
    }
    async hide(duration) {
        return this.nabuPage.hide(duration);
    }
    get hoveredButtonIndex() {
        return this._hoveredButtonIndex;
    }
    setHoveredButtonIndex(v, filter) {
        /*
        let btn = this.buttons[this._hoveredButtonIndex];
        if (btn) {
            btn.classList.remove("hovered");
        }
        this._hoveredButtonIndex = v;
        btn = this.buttons[this._hoveredButtonIndex];
        if (!btn) {
            return true;
        }
        else if ((!filter || filter(btn))) {
            if (btn) {
                btn.classList.add("hovered");
            }
            return true;
        }
        */
        return false;
    }
    _registerToInputManager() {
        this.router.game.uiInputManager.onUpCallbacks.push(this._inputUp);
        this.router.game.uiInputManager.onDownCallbacks.push(this._inputDown);
        this.router.game.uiInputManager.onEnterCallbacks.push(this._inputEnter);
        this.router.game.uiInputManager.onDropControlCallbacks.push(this._inputDropControl);
    }
    _unregisterFromInputManager() {
        this.router.game.uiInputManager.onUpCallbacks.remove(this._inputUp);
        this.router.game.uiInputManager.onDownCallbacks.remove(this._inputDown);
        this.router.game.uiInputManager.onEnterCallbacks.remove(this._inputEnter);
        this.router.game.uiInputManager.onDropControlCallbacks.remove(this._inputDropControl);
    }
}
class NumValueInput extends HTMLElement {
    constructor() {
        super(...arguments);
        this.value = 0;
        this.valueToString = (v) => {
            return v.toFixed(0);
        };
    }
    static get observedAttributes() {
        return ["value-width", "min", "max", "wrap"];
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "value-width") {
            if (this.valueDisplay) {
                this.valueDisplay.style.width = newValue;
            }
        }
        if (name === "wrap") {
            if (newValue === "true") {
                this.wrap = true;
            }
            else {
                this.wrap = false;
            }
        }
        if (name === "min") {
            this.min = parseInt(newValue);
        }
        if (name === "max") {
            this.max = parseInt(newValue);
        }
    }
    connectedCallback() {
        this.buttonMinus = document.createElement("button");
        this.buttonMinus.classList.add("xsmall-btn", "green");
        this.buttonMinus.innerHTML = "<stroke-text>-</stroke-text>";
        this.appendChild(this.buttonMinus);
        this.buttonMinus.onclick = () => {
            this.setValue(this.value - 1);
            if (this.onValueChange) {
                this.onValueChange(this.value);
            }
        };
        this.valueDisplay = document.createElement("span");
        this.valueDisplay.style.display = "inline-block";
        if (this.hasAttribute("value-width")) {
            this.valueDisplay.style.width = this.getAttribute("value-width");
        }
        else {
            this.valueDisplay.style.width = "50px";
        }
        this.valueDisplay.style.fontSize = "20px";
        this.valueDisplay.style.fontWeight = "900";
        this.valueDisplay.style.textAlign = "center";
        this.valueDisplayText = document.createElement("stroke-text");
        this.valueDisplay.appendChild(this.valueDisplayText);
        this.appendChild(this.valueDisplay);
        this.buttonPlus = document.createElement("button");
        this.buttonPlus.classList.add("xsmall-btn", "green");
        this.buttonPlus.innerHTML = "<stroke-text>+</stroke-text>";
        this.appendChild(this.buttonPlus);
        this.buttonPlus.onclick = () => {
            this.setValue(this.value + 1);
            if (this.onValueChange) {
                this.onValueChange(this.value);
            }
        };
    }
    _updateValueDisplay() {
        this.valueDisplayText.setContent(this.valueToString(this.value));
    }
    setValue(v) {
        this.value = v;
        if (this.wrap && isFinite(this.min) && isFinite(this.max)) {
            if (this.value < this.min) {
                this.value = this.max;
            }
            if (this.value > this.max) {
                this.value = this.min;
            }
        }
        else if (isFinite(this.min)) {
            this.value = Math.max(this.value, this.min);
        }
        else if (isFinite(this.max)) {
            this.value = Math.min(this.value, this.max);
        }
        this._updateValueDisplay();
    }
}
customElements.define("num-value-input", NumValueInput);
/// <reference path="./Tile.ts"/>
class PushTile extends Tile {
    constructor(game, props) {
        super(game, props);
        this.animatePosition = Mummu.AnimationFactory.EmptyVector3Callback;
        this.animateRotX = Mummu.AnimationFactory.EmptyNumberCallback;
        this.animateRotZ = Mummu.AnimationFactory.EmptyNumberCallback;
        this.animateWait = Mummu.AnimationFactory.EmptyVoidCallback;
        this.color = props.color;
        this.animatePosition = Mummu.AnimationFactory.CreateVector3(this, this, "position");
        this.animateRotX = Mummu.AnimationFactory.CreateNumber(this, this.rotation, "x");
        this.animateRotZ = Mummu.AnimationFactory.CreateNumber(this, this.rotation, "z");
        this.animateWait = Mummu.AnimationFactory.CreateWait(this);
        this.material = this.game.brownMaterial;
        this.renderOutline = true;
        this.outlineColor = BABYLON.Color3.Black();
        this.outlineWidth = 0.02;
        this.tileTop = new BABYLON.Mesh("tile-top");
        this.tileTop.parent = this;
        let pushTileTopMaterial = new BABYLON.StandardMaterial("push-tile-material");
        pushTileTopMaterial.specularColor.copyFromFloats(0, 0, 0);
        pushTileTopMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/push-tile-top.png");
        this.tileTop.material = pushTileTopMaterial;
        this.pushSound = this.game.soundManager.createSound("wood-choc", "./datas/sounds/wood-wood-drag.wav", undefined, undefined, { autoplay: false, loop: false, volume: 0.8 });
        this.fallImpactSound = this.game.soundManager.createSound("wood-choc", "./datas/sounds/fall-impact.wav", undefined, undefined, { autoplay: false, loop: false });
    }
    async instantiate() {
        await super.instantiate();
        let tileData = CreateBoxFrameVertexData({
            w: 1,
            d: 1,
            h: 0.35,
            thickness: 0.05,
            flatShading: false,
            topCap: false,
            bottomCap: true,
        });
        tileData.applyToMesh(this);
        this.tileTop.position.y = 0.3;
        BABYLON.CreateGroundVertexData({ width: 0.9, height: 0.9 }).applyToMesh(this.tileTop);
    }
    async push(dir) {
        if (this.tileState === TileState.Active) {
            dir = dir.clone();
            if (Math.abs(dir.x) > Math.abs(dir.z)) {
                dir.x = Math.sign(dir.x);
                dir.z = 0;
            }
            else {
                dir.x = 0;
                dir.z = Math.sign(dir.z);
            }
            let newI = this.i + dir.x;
            let newJ = this.j + dir.z;
            if (newI >= 0 && newI < this.game.puzzle.w) {
                if (newJ >= 0 && newJ < this.game.puzzle.h) {
                    let borderBlock = false;
                    if (dir.x > 0) {
                        let stack = this.game.puzzle.getGriddedBorderStack(this.i, this.j);
                        if (stack && stack.array.find((b) => { return b.vertical && Math.abs(b.position.y - this.position.y) > 0.6; })) {
                            borderBlock = true;
                        }
                    }
                    else if (dir.x < 0) {
                        let stack = this.game.puzzle.getGriddedBorderStack(newI, this.j);
                        if (stack && stack.array.find((b) => { return b.vertical && Math.abs(b.position.y - this.position.y) > 0.6; })) {
                            borderBlock = true;
                        }
                    }
                    else if (dir.z > 0) {
                        let stack = this.game.puzzle.getGriddedBorderStack(this.i, this.j);
                        if (stack && stack.array.find((b) => { return !b.vertical && Math.abs(b.position.y - this.position.y) > 0.6; })) {
                            borderBlock = true;
                        }
                    }
                    else if (dir.z < 0) {
                        let stack = this.game.puzzle.getGriddedBorderStack(this.i, newJ);
                        if (stack && stack.array.find((b) => { return !b.vertical && Math.abs(b.position.y - this.position.y) > 0.6; })) {
                            borderBlock = true;
                        }
                    }
                    if (!borderBlock) {
                        let tileAtDestination = this.game.puzzle.tiles.find(tile => {
                            return tile.i === newI && tile.j === newJ && (tile.position.y - this.position.y) < 0.5;
                        });
                        if (tileAtDestination instanceof HoleTile) {
                            let newPos = this.position.clone();
                            newPos.x = (this.i + dir.x * 0.75) * 1.1;
                            newPos.z = (this.j + dir.z * 0.75) * 1.1;
                            this.tileState = TileState.Moving;
                            this.pushSound.play();
                            await this.animatePosition(newPos, 0.5, Nabu.Easing.easeOutSquare);
                            if (dir.x === 1) {
                                this.animateRotZ(-Math.PI, 0.4);
                            }
                            else if (dir.x === -1) {
                                this.animateRotZ(Math.PI, 0.4);
                            }
                            if (dir.z === 1) {
                                this.animateRotX(Math.PI, 0.4);
                            }
                            else if (dir.z === -1) {
                                this.animateRotX(-Math.PI, 0.4);
                            }
                            await this.animateWait(0.2);
                            newPos.y -= 5.5;
                            await this.animatePosition(newPos, 0.5, Nabu.Easing.easeInSquare);
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
                            this.fallImpactSound.play();
                            this.dispose();
                        }
                        else if (tileAtDestination) {
                        }
                        else {
                            let newPos = this.position.clone();
                            newPos.x = newI * 1.1;
                            newPos.z = newJ * 1.1;
                            this.tileState = TileState.Moving;
                            this.pushSound.play();
                            await this.animatePosition(newPos, 1, Nabu.Easing.easeOutSquare);
                            this.game.puzzle.updateGriddedStack(this);
                            this.tileState = TileState.Active;
                        }
                    }
                }
            }
        }
    }
}
class MySound {
    constructor(_name, _urlOrArrayBuffer, _scene, _readyToPlayCallback, _options, instancesCount = 1) {
        this._name = _name;
        this._urlOrArrayBuffer = _urlOrArrayBuffer;
        this._scene = _scene;
        this._readyToPlayCallback = _readyToPlayCallback;
        this._options = _options;
        this.instancesCount = instancesCount;
        this._loaded = false;
        this._sounds = [];
    }
    load() {
        if (this._loaded) {
            return;
        }
        for (let i = 0; i < this.instancesCount; i++) {
            this._sounds[i] = new BABYLON.Sound(this._name, this._urlOrArrayBuffer, this._scene, this._readyToPlayCallback, this._options);
        }
        this._loaded = true;
    }
    play(time, offset, length) {
        if (this._loaded) {
            for (let i = 0; i < this.instancesCount; i++) {
                if (!this._sounds[i].isPlaying) {
                    this._sounds[i].play(time, offset, length);
                    return;
                }
            }
        }
    }
    setVolume(newVolume, time) {
        if (this._loaded) {
            for (let i = 0; i < this.instancesCount; i++) {
                this._sounds[i].setVolume(newVolume, time);
            }
        }
    }
}
class SoundManager {
    constructor() {
        this.managedSounds = [];
    }
    createSound(name, urlOrArrayBuffer, scene, readyToPlayCallback, options, instancesCount = 1) {
        let mySound = new MySound(name, urlOrArrayBuffer, scene, readyToPlayCallback, options, instancesCount);
        if (BABYLON.Engine.audioEngine.unlocked) {
            mySound.load();
        }
        return mySound;
    }
    unlockEngine() {
        BABYLON.Engine.audioEngine.unlock();
        for (let i = 0; i < this.managedSounds.length; i++) {
            this.managedSounds[i].load();
        }
    }
}
class StrokeText extends HTMLElement {
    connectedCallback() {
        let o = (1 / window.devicePixelRatio).toFixed(1) + "px";
        o = "1px";
        this.style.textShadow = o + " " + o + " 0px #e3cfb4ff, -" + o + " " + o + " 0px #e3cfb4ff, -" + o + " -" + o + " 0px #e3cfb4ff, " + o + " -" + o + " 0px #e3cfb4ff";
    }
    setContent(text) {
        this.innerText = text;
    }
}
customElements.define("stroke-text", StrokeText);
/// <reference path="./Tile.ts"/>
class SwitchTile extends Tile {
    constructor(game, props) {
        super(game, props);
        this.material = this.game.brownMaterial;
        this.renderOutline = true;
        this.outlineColor = BABYLON.Color3.Black();
        this.outlineWidth = 0.02;
        this.tileFrame = new BABYLON.Mesh("tile-frame");
        this.tileFrame.parent = this;
        this.tileFrame.material = this.game.blackMaterial;
        this.tileFrame.renderOutline = true;
        this.tileFrame.outlineColor = BABYLON.Color3.Black();
        this.tileFrame.outlineWidth = 0.02;
        this.tileTop = new BABYLON.Mesh("tile-top");
        this.tileTop.parent = this;
        this.tileTop.material = this.game.tileColorMaterials[this.color];
        this.tileBottom = new BABYLON.Mesh("tile-bottom");
        this.tileBottom.parent = this;
        this.tileBottom.material = this.game.salmonMaterial;
    }
    async instantiate() {
        await super.instantiate();
        let tileData = await this.game.vertexDataLoader.get("./datas/meshes/switchbox.babylon");
        tileData[0].applyToMesh(this);
        tileData[1].applyToMesh(this.tileFrame);
        tileData[2].applyToMesh(this.tileTop);
        tileData[3].applyToMesh(this.tileBottom);
    }
}
class UserInterfaceInputManager {
    constructor(game) {
        this.game = game;
        this.inControl = false;
        this.onUpCallbacks = new Nabu.UniqueList();
        this.onLeftCallbacks = new Nabu.UniqueList();
        this.onDownCallbacks = new Nabu.UniqueList();
        this.onRightCallbacks = new Nabu.UniqueList();
        this.onEnterCallbacks = new Nabu.UniqueList();
        this.onBackCallbacks = new Nabu.UniqueList();
        this.onPrevCallbacks = new Nabu.UniqueList();
        this.onNextCallbacks = new Nabu.UniqueList();
        this.onDropControlCallbacks = new Nabu.UniqueList();
    }
    initialize() {
        window.addEventListener("pointerdown", () => {
            if (this.inControl) {
                this.inControl = false;
                this.onDropControlCallbacks.forEach(cb => {
                    cb();
                });
            }
        });
        window.addEventListener("pointermove", () => {
            if (this.inControl) {
                this.inControl = false;
                this.onDropControlCallbacks.forEach(cb => {
                    cb();
                });
            }
        });
        window.addEventListener("keydown", (ev) => {
            if (document.activeElement instanceof HTMLInputElement) {
                if (ev.code === "Enter") {
                    this.game.canvas.focus();
                }
                return;
            }
            this.inControl = true;
            if (ev.code === "KeyW" || ev.code === "ArrowUp") {
                this.onUpCallbacks.forEach(cb => {
                    cb();
                });
            }
            if (ev.code === "KeyA" || ev.code === "ArrowLeft") {
                this.onLeftCallbacks.forEach(cb => {
                    cb();
                });
            }
            if (ev.code === "KeyS" || ev.code === "ArrowDown") {
                this.onDownCallbacks.forEach(cb => {
                    cb();
                });
            }
            if (ev.code === "KeyD" || ev.code === "ArrowRight") {
                this.onRightCallbacks.forEach(cb => {
                    cb();
                });
            }
            if (ev.code === "Enter" || ev.code === "Space" || ev.code === "KeyE") {
                this.onEnterCallbacks.forEach(cb => {
                    cb();
                });
            }
            if (ev.code === "Backspace" || ev.code === "KeyX") {
                this.onBackCallbacks.forEach(cb => {
                    cb();
                });
            }
        });
    }
}
/// <reference path="./Tile.ts"/>
class WallTile extends Tile {
    constructor(game, props) {
        super(game, props);
        this.color = props.color;
        this.material = this.game.blackMaterial;
    }
    async instantiate() {
        await super.instantiate();
        let xPlus = 0;
        let xMinus = 0;
        if (this.i === 0) {
            xMinus = -0.1;
        }
        else if (this.game.puzzle.tiles.find(tile => { return tile instanceof WallTile && tile.i === (this.i - 1) && tile.j === this.j; })) {
            xMinus = -0.05;
        }
        if (this.i === this.game.puzzle.w - 1) {
            xPlus = 0.1;
        }
        else if (this.game.puzzle.tiles.find(tile => { return tile instanceof WallTile && tile.i === (this.i + 1) && tile.j === this.j; })) {
            xPlus = 0.05;
        }
        let zPlus = 0;
        let zMinus = 0;
        if (this.j === 0) {
            zMinus = -0.1;
        }
        else if (this.game.puzzle.tiles.find(tile => { return tile instanceof WallTile && tile.i === this.i && tile.j === (this.j - 1); })) {
            zMinus = -0.05;
        }
        if (this.j === this.game.puzzle.h - 1) {
            zPlus = 0.1;
        }
        else if (this.game.puzzle.tiles.find(tile => { return tile instanceof WallTile && tile.i === this.i && tile.j === (this.j + 1); })) {
            zPlus = 0.05;
        }
        let data = BABYLON.CreateBoxVertexData({ width: 1 + xPlus - xMinus, height: 0.3, depth: 1 + zPlus - zMinus });
        Mummu.TranslateVertexDataInPlace(data, new BABYLON.Vector3(xPlus * 0.5 + xMinus * 0.5, 0.15, zPlus * 0.5 + zMinus * 0.5));
        data.applyToMesh(this);
    }
}
/// <reference path="./Tile.ts"/>
class WaterTile extends Tile {
    constructor(game, props) {
        super(game, props);
        this.path = [];
        this.distFromSource = Infinity;
        this.color = props.color;
        this.material = this.game.blackMaterial;
        this.renderOutline = true;
        this.outlineColor = BABYLON.Color3.Black();
        this.outlineWidth = 0.01;
        this.shoreMesh = new BABYLON.Mesh("shore");
        this.shoreMesh.parent = this;
        this.shoreMesh.material = this.game.whiteMaterial;
        this.waterMesh = new BABYLON.Mesh("water");
        this.waterMesh.parent = this;
        this.waterMesh.material = this.game.waterMaterial;
        this.floorMesh = new BABYLON.Mesh("floor");
        this.floorMesh.parent = this;
        this.floorMesh.material = this.game.floorMaterial;
    }
    fallsIn(ball) {
        if (ball.position.x < this.position.x - 0.55) {
            return false;
        }
        if (ball.position.x > this.position.x + 0.55) {
            return false;
        }
        if (ball.position.z < this.position.z - 0.55) {
            return false;
        }
        if (ball.position.z > this.position.z + 0.55) {
            return false;
        }
        let proj = {
            point: BABYLON.Vector3.Zero(),
            index: 0
        };
        Mummu.ProjectPointOnPathToRef(ball.position, this.path, proj);
        let dist = BABYLON.Vector3.Distance(ball.position, proj.point);
        return dist < ball.radius * 0.5 + 0.3;
    }
    _getPath() {
        let entry = (new BABYLON.Vector3(0, 0, 0.55)).add(this.position);
        let exit = (new BABYLON.Vector3(0, 0, -0.55)).add(this.position);
        if (this.iPlusWater) {
            if (this.iPlusWater.distFromSource < this.distFromSource) {
                entry.copyFrom(this.position).addInPlace(this.iPlusWater.position).scaleInPlace(0.5);
            }
            else {
                exit.copyFrom(this.position).addInPlace(this.iPlusWater.position).scaleInPlace(0.5);
            }
        }
        if (this.iMinusWater) {
            if (this.iMinusWater.distFromSource < this.distFromSource) {
                entry.copyFrom(this.position).addInPlace(this.iMinusWater.position).scaleInPlace(0.5);
            }
            else {
                exit.copyFrom(this.position).addInPlace(this.iMinusWater.position).scaleInPlace(0.5);
            }
        }
        if (this.jPlusWater) {
            if (this.jPlusWater.distFromSource < this.distFromSource) {
                entry.copyFrom(this.position).addInPlace(this.jPlusWater.position).scaleInPlace(0.5);
            }
            else {
                exit.copyFrom(this.position).addInPlace(this.jPlusWater.position).scaleInPlace(0.5);
            }
        }
        if (this.jMinusWater) {
            if (this.jMinusWater.distFromSource < this.distFromSource) {
                entry.copyFrom(this.position).addInPlace(this.jMinusWater.position).scaleInPlace(0.5);
            }
            else {
                exit.copyFrom(this.position).addInPlace(this.jMinusWater.position).scaleInPlace(0.5);
            }
        }
        let dirIn = this.position.subtract(entry).scale(4);
        let dirOut = exit.subtract(this.position).scale(4);
        let path = [entry, exit];
        Mummu.CatmullRomPathInPlace(path, dirIn, dirOut);
        Mummu.CatmullRomPathInPlace(path, dirIn.scale(0.5), dirOut.scale(0.5));
        Mummu.CatmullRomPathInPlace(path, dirIn.scale(0.25), dirOut.scale(0.25));
        Mummu.CatmullRomPathInPlace(path, dirIn.scale(0.1), dirOut.scale(0.1));
        return path;
    }
    recursiveConnect(d = 0) {
        this.distFromSource = d;
        let right = this.game.puzzle.tiles.find(tile => { return tile instanceof WaterTile && tile.i === (this.i + 1) && tile.j === this.j; });
        if (right && (!this.iPlusWater || this.iPlusWater.distFromSource > d + 1)) {
            this.iPlusWater = right;
            right.iMinusWater = this;
            right.recursiveConnect(d + 1);
        }
        let left = this.game.puzzle.tiles.find(tile => { return tile instanceof WaterTile && tile.i === (this.i - 1) && tile.j === this.j; });
        if (left && (!this.iMinusWater || this.iMinusWater.distFromSource > d + 1)) {
            this.iMinusWater = left;
            left.iPlusWater = this;
            left.recursiveConnect(d + 1);
        }
        let up = this.game.puzzle.tiles.find(tile => { return tile instanceof WaterTile && tile.i === this.i && tile.j === (this.j + 1); });
        if (up && (!this.jPlusWater || this.jPlusWater.distFromSource > d + 1)) {
            this.jPlusWater = up;
            up.jMinusWater = this;
            up.recursiveConnect(d + 1);
        }
        let down = this.game.puzzle.tiles.find(tile => { return tile instanceof WaterTile && tile.i === this.i && tile.j === (this.j - 1); });
        if (down && (!this.jMinusWater || this.jMinusWater.distFromSource > d + 1)) {
            this.jMinusWater = down;
            down.jPlusWater = this;
            down.recursiveConnect(d + 1);
        }
    }
    async instantiate() {
        await super.instantiate();
        this.path = this._getPath();
        let datas = await this.game.vertexDataLoader.get("./datas/meshes/water-canal.babylon");
        let floorData;
        //let DEBUG = BABYLON.CreateLines("debug", { points: this.path, colors: this.path.map(() => { return new BABYLON.Color4(1, 0, 0, 1); })});
        //DEBUG.parent = this;
        //DEBUG.position = this.position.scale(-1);
        if (this.iPlusWater && this.iMinusWater) {
            let a = Math.PI * 0.5;
            if (this.iMinusWater.distFromSource < this.distFromSource) {
                a = -Math.PI * 0.5;
            }
            Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(datas[0]), a, BABYLON.Axis.Y).applyToMesh(this);
            Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(datas[1]), a, BABYLON.Axis.Y).applyToMesh(this.waterMesh);
            floorData = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(datas[2]), a, BABYLON.Axis.Y);
        }
        else if (!this.iPlusWater && !this.iMinusWater) {
            if (this.distFromSource === 0) {
                if (!this.sculptMesh) {
                    this.sculptMesh = new BABYLON.Mesh("sculpt");
                    this.sculptMesh.parent = this;
                    this.sculptMesh.material = this.game.grayMaterial;
                    this.sculptMesh.renderOutline = true;
                    this.sculptMesh.outlineColor = BABYLON.Color3.Black();
                    this.sculptMesh.outlineWidth = 0.01;
                }
                datas[6].applyToMesh(this);
                datas[7].applyToMesh(this.waterMesh);
                floorData = Mummu.CloneVertexData(datas[8]);
                datas[9].applyToMesh(this.sculptMesh);
            }
            else {
                datas[0].applyToMesh(this);
                datas[1].applyToMesh(this.waterMesh);
                floorData = Mummu.CloneVertexData(datas[2]);
            }
        }
        else if (this.iPlusWater && this.jPlusWater) {
            datas[3].applyToMesh(this);
            datas[4].applyToMesh(this.waterMesh);
            floorData = Mummu.CloneVertexData(datas[5]);
        }
        else if (this.iMinusWater && this.jPlusWater) {
            Mummu.MirrorXVertexDataInPlace(Mummu.CloneVertexData(datas[3])).applyToMesh(this);
            //Mummu.MirrorXVertexDataInPlace(
            //    Mummu.CloneVertexData(datas[4])
            //).applyToMesh(this.shoreMesh);
            Mummu.MirrorXVertexDataInPlace(Mummu.CloneVertexData(datas[4])).applyToMesh(this.waterMesh);
            floorData = Mummu.MirrorXVertexDataInPlace(Mummu.CloneVertexData(datas[5]));
        }
        else if (this.iPlusWater && this.jMinusWater) {
            Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(datas[3]), Math.PI * 0.5, BABYLON.Axis.Y).applyToMesh(this);
            //Mummu.RotateAngleAxisVertexDataInPlace(
            //    Mummu.CloneVertexData(datas[4]), Math.PI * 0.5, BABYLON.Axis.Y
            //).applyToMesh(this.shoreMesh);
            Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(datas[4]), Math.PI * 0.5, BABYLON.Axis.Y).applyToMesh(this.waterMesh);
            floorData = Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(datas[5]), Math.PI * 0.5, BABYLON.Axis.Y);
        }
        else if (this.iMinusWater && this.jMinusWater) {
            Mummu.MirrorXVertexDataInPlace(Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(datas[3]), Math.PI * 0.5, BABYLON.Axis.Y)).applyToMesh(this);
            //Mummu.MirrorXVertexDataInPlace(
            //    Mummu.RotateAngleAxisVertexDataInPlace(
            //        Mummu.CloneVertexData(datas[4]), Math.PI * 0.5, BABYLON.Axis.Y
            //    )
            //).applyToMesh(this.shoreMesh);
            Mummu.MirrorXVertexDataInPlace(Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(datas[4]), Math.PI * 0.5, BABYLON.Axis.Y)).applyToMesh(this.waterMesh);
            floorData = Mummu.MirrorXVertexDataInPlace(Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(datas[5]), Math.PI * 0.5, BABYLON.Axis.Y));
        }
        else {
            if (this.distFromSource === 0) {
                if (!this.sculptMesh) {
                    this.sculptMesh = new BABYLON.Mesh("sculpt");
                    this.sculptMesh.parent = this;
                    this.sculptMesh.material = this.game.grayMaterial;
                    this.sculptMesh.renderOutline = true;
                    this.sculptMesh.outlineColor = BABYLON.Color3.Black();
                    this.sculptMesh.outlineWidth = 0.01;
                }
                datas[6].applyToMesh(this);
                datas[7].applyToMesh(this.waterMesh);
                floorData = Mummu.CloneVertexData(datas[8]);
                datas[9].applyToMesh(this.sculptMesh);
            }
            else {
                datas[0].applyToMesh(this);
                datas[1].applyToMesh(this.waterMesh);
                floorData = Mummu.CloneVertexData(datas[2]);
            }
        }
        for (let i = 0; i < floorData.positions.length / 3; i++) {
            floorData.uvs[2 * i] = 0.5 * (floorData.positions[3 * i] + this.position.x);
            floorData.uvs[2 * i + 1] = 0.5 * (floorData.positions[3 * i + 2] + this.position.z) - 0.5;
        }
        floorData.applyToMesh(this.floorMesh);
    }
}
class CubicNoiseTexture {
    constructor(scene) {
        this.scene = scene;
        this.size = 1;
        this._data = [[[0.5]]];
    }
    getData(i, j, k) {
        while (i < 0) {
            i += this.size;
        }
        while (j < 0) {
            j += this.size;
        }
        while (k < 0) {
            k += this.size;
        }
        i = i % this.size;
        j = j % this.size;
        k = k % this.size;
        return this._data[i][j][k];
    }
    setData(v, i, j, k) {
        while (i < 0) {
            i += this.size;
        }
        while (j < 0) {
            j += this.size;
        }
        while (k < 0) {
            k += this.size;
        }
        i = i % this.size;
        j = j % this.size;
        k = k % this.size;
        return this._data[i][j][k];
    }
    double() {
        let newSize = this.size * 2;
        let newData = [];
        for (let i = 0; i < newSize; i++) {
            newData[i] = [];
            for (let j = 0; j < newSize; j++) {
                newData[i][j] = [];
            }
        }
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                for (let k = 0; k < this.size; k++) {
                    let v = this._data[i][j][k];
                    newData[2 * i][2 * j][2 * k] = v;
                    newData[2 * i + 1][2 * j][2 * k] = v;
                    newData[2 * i + 1][2 * j + 1][2 * k] = v;
                    newData[2 * i][2 * j + 1][2 * k] = v;
                    newData[2 * i][2 * j][2 * k + 1] = v;
                    newData[2 * i + 1][2 * j][2 * k + 1] = v;
                    newData[2 * i + 1][2 * j + 1][2 * k + 1] = v;
                    newData[2 * i][2 * j + 1][2 * k + 1] = v;
                }
            }
        }
        this.size = newSize;
        this._data = newData;
    }
    smooth() {
        let newData = [];
        for (let i = 0; i < this.size; i++) {
            newData[i] = [];
            for (let j = 0; j < this.size; j++) {
                newData[i][j] = [];
            }
        }
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                for (let k = 0; k < this.size; k++) {
                    let val = 0;
                    let c = 0;
                    for (let ii = -1; ii <= 1; ii++) {
                        for (let jj = -1; jj <= 1; jj++) {
                            for (let kk = -1; kk <= 1; kk++) {
                                let d = Math.sqrt(ii * ii + jj * jj + kk * kk);
                                let w = 2 - d;
                                let v = this.getData(i + ii, j + jj, k + kk);
                                val += w * v;
                                c += w;
                            }
                        }
                    }
                }
            }
        }
    }
    noise() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                for (let k = 0; k < this.size; k++) {
                    this._data[i][j][k] = (this._data[i][j][k] + Math.random()) * 0.5;
                }
            }
        }
    }
    randomize() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                for (let k = 0; k < this.size; k++) {
                    this._data[i][j][k] = Math.random();
                }
            }
        }
    }
    get3DTexture() {
        let data = new Uint8ClampedArray(this.size * this.size * this.size);
        let min = 255;
        let max = 0;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                for (let k = 0; k < this.size; k++) {
                    data[i + j * this.size + k * this.size * this.size] = 256 * this._data[i][j][k];
                    min = Math.min(min, data[i + j * this.size + k * this.size * this.size]);
                    max = Math.max(max, data[i + j * this.size + k * this.size * this.size]);
                }
            }
        }
        let tex = new BABYLON.RawTexture3D(data, this.size, this.size, this.size, BABYLON.Constants.TEXTUREFORMAT_R, this.scene, false, false, BABYLON.Texture.TRILINEAR_SAMPLINGMODE, BABYLON.Engine.TEXTURETYPE_UNSIGNED_BYTE);
        tex.wrapU = 1;
        tex.wrapV = 1;
        tex.wrapR = 1;
        return tex;
    }
}
class Explosion {
    constructor(game) {
        this.game = game;
        this.origin = BABYLON.Vector3.Zero();
        this.lifespan = 2;
        this.tZero = 0;
        this.particles = [];
        this.particulesCount = 10;
        this.particuleRadius = 1;
        this.targetPositions = [];
        this.delays = [];
        this.radiusXZ = 1;
        this.radiusY = 1;
        this.maxOffset = BABYLON.Vector3.Zero();
        this.keepAlive = false;
        this._timer = 0;
        this.update = () => {
            this._timer += this.game.scene.deltaTime / 1000;
            let globalF = 1;
            let done = true;
            for (let i = 0; i < this.particles.length; i++) {
                let bubble = this.particles[i];
                let f = (this._timer - this.delays[i]) / this.lifespan;
                if (f < 1) {
                    done = false;
                }
                globalF = Math.min(globalF, f);
                f = Nabu.MinMax(f, 0, 1);
                let fScale = 0;
                let fPos = 0;
                if (this.sizeEasing) {
                    fScale = this.sizeEasing(f);
                    fPos = this.sizeEasing(f);
                }
                else {
                    fScale = Nabu.Easing.easeOutCubic(Nabu.Easing.easeOutCubic(f));
                    fPos = Nabu.Easing.easeOutCubic(Nabu.Easing.easeOutCubic(f));
                }
                BABYLON.Vector3.LerpToRef(this.origin, this.targetPositions[i], fPos, bubble.position);
                bubble.rotate(BABYLON.Axis.Y, 0.01, BABYLON.Space.LOCAL);
                bubble.scaling.copyFromFloats(fScale, fScale, fScale);
            }
            this.bubbleMaterial.setFloat("time", 2 * globalF + this.tZero);
            if (done) {
                if (this.keepAlive) {
                    for (let i = 0; i < this.particles.length; i++) {
                        this.particles[i].isVisible = false;
                    }
                    this.game.scene.onBeforeRenderObservable.removeCallback(this.update);
                }
                else {
                    this.dispose();
                }
            }
        };
        this.bubbleMaterial = new ExplosionMaterial("explosion-material", this.game.scene);
        this.bubbleMaterial.setUseLightFromPOV(true);
        this.bubbleMaterial.setAutoLight(0.8);
    }
    setRadius(v) {
        this.radiusXZ = v;
        this.radiusY = v;
        this.particuleRadius = v;
    }
    get color() {
        return this.bubbleMaterial.diffuse;
    }
    set color(c) {
        this.bubbleMaterial.setDiffuse(c);
    }
    static RandomInSphere() {
        let p = new BABYLON.Vector3(-1 + 2 * Math.random(), -1 + 2 * Math.random(), -1 + 2 * Math.random());
        while (p.lengthSquared() > 1) {
            p.copyFromFloats(-1 + 2 * Math.random(), -1 + 2 * Math.random(), -1 + 2 * Math.random());
        }
        return p;
    }
    dispose() {
        this.game.scene.onBeforeRenderObservable.removeCallback(this.update);
        while (this.particles.length > 0) {
            this.particles.pop().dispose();
        }
    }
    async MakeNoisedBlob(radius) {
        let data = await this.game.vertexDataLoader.getAtIndex("datas/meshes/explosion.babylon", 0);
        data = Mummu.CloneVertexData(data);
        data = Mummu.ScaleVertexDataInPlace(data, radius);
        let positions = [...data.positions];
        let delta = new BABYLON.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
        delta.scaleInPlace(radius * 0.5 * Math.random());
        for (let i = 0; i < positions.length / 3; i++) {
            positions[3 * i + 0] += delta.x;
            positions[3 * i + 1] += delta.y;
            positions[3 * i + 2] += delta.z;
        }
        data.positions = positions;
        return data;
    }
    async boom() {
        this.game.scene.onBeforeRenderObservable.removeCallback(this.update);
        if (this.particles.length > 0 && this.particles.length != this.particulesCount) {
            while (this.particles.length > 0) {
                this.particles.pop().dispose();
            }
            this.targetPositions = [];
        }
        this._timer = 0;
        this.bubbleMaterial.setFloat("time", 0);
        this.bubbleMaterial.setVector3("origin", this.origin);
        this.bubbleMaterial.setFloat("radius", 2 * this.radiusXZ);
        this.bubbleMaterial.setTexture("noiseTexture", this.game.noiseTexture);
        for (let i = 0; i < this.particulesCount; i++) {
            let bubble = this.particles[i];
            if (!bubble) {
                bubble = new BABYLON.Mesh("bubble-" + i);
            }
            (await this.MakeNoisedBlob((0.6 + 0.4 * Math.random()) * this.particuleRadius)).applyToMesh(bubble);
            bubble.position.copyFrom(this.origin);
            bubble.material = this.bubbleMaterial;
            bubble.rotation.copyFromFloats(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            bubble.isVisible = true;
            let targetPosition = Explosion.RandomInSphere().multiplyInPlace(new BABYLON.Vector3(this.radiusXZ, this.radiusY, this.radiusXZ));
            targetPosition.addInPlace(this.origin);
            targetPosition.addInPlace(this.maxOffset);
            this.particles[i] = bubble;
            this.targetPositions[i] = targetPosition;
            this.delays[i] = 0.2 * Math.random() * this.lifespan;
        }
        this.game.scene.onBeforeRenderObservable.add(this.update);
    }
}
class ExplosionMaterial extends BABYLON.ShaderMaterial {
    constructor(name, scene) {
        super(name, scene, {
            vertex: "explosion",
            fragment: "explosion",
        }, {
            attributes: ["position", "normal", "uv", "color"],
            uniforms: [
                "world", "worldView", "worldViewProjection", "view", "projection",
                "useVertexColor",
                "useLightFromPOV",
                "autoLight",
                "diffuseSharpness",
                "diffuse",
                "viewPositionW",
                "viewDirectionW",
                "lightInvDirW",
                "useFlatSpecular",
                "specularIntensity",
                "specularColor",
                "specularCount",
                "specularPower",
                "time",
                "origin",
                "radius"
            ],
            needAlphaBlending: true,
            needAlphaTesting: true
        });
        this._update = () => {
            let camera = this.getScene().activeCamera;
            let direction = camera.getForwardRay().direction;
            this.setVector3("viewPositionW", camera.globalPosition);
            this.setVector3("viewDirectionW", direction);
            let lights = this.getScene().lights;
            for (let i = 0; i < lights.length; i++) {
                let light = lights[i];
                if (light instanceof BABYLON.HemisphericLight) {
                    this.setVector3("lightInvDirW", light.direction);
                }
            }
        };
        this._useVertexColor = false;
        this._useLightFromPOV = false;
        this._autoLight = 0;
        this._diffuseSharpness = 0;
        this._diffuse = BABYLON.Color3.White();
        this._useFlatSpecular = false;
        this._specularIntensity = 0;
        this._specular = BABYLON.Color3.White();
        this._specularCount = 1;
        this._specularPower = 4;
        this.updateUseVertexColor();
        this.updateUseLightFromPOV();
        this.updateAutoLight();
        this.updateDiffuseSharpness();
        this.updateDiffuse();
        this.updateUseFlatSpecular();
        this.updateSpecularIntensity();
        this.updateSpecular();
        this.updateSpecularCount();
        this.updateSpecularPower();
        this.setVector3("viewPositionW", BABYLON.Vector3.Zero());
        this.setVector3("viewDirectionW", BABYLON.Vector3.Up());
        this.setVector3("lightInvDirW", BABYLON.Vector3.Up());
        this.getScene().onBeforeRenderObservable.add(this._update);
    }
    dispose(forceDisposeEffect, forceDisposeTextures, notBoundToMesh) {
        super.dispose(forceDisposeEffect, forceDisposeTextures, notBoundToMesh);
        this.getScene().onBeforeRenderObservable.removeCallback(this._update);
    }
    get useVertexColor() {
        return this._useVertexColor;
    }
    setUseVertexColor(b) {
        this._useVertexColor = b;
        this.updateUseVertexColor();
    }
    updateUseVertexColor() {
        this.setInt("useVertexColor", this._useVertexColor ? 1 : 0);
    }
    get useLightFromPOV() {
        return this._useLightFromPOV;
    }
    setUseLightFromPOV(b) {
        this._useLightFromPOV = b;
        this.updateUseLightFromPOV();
    }
    updateUseLightFromPOV() {
        this.setInt("useLightFromPOV", this._useLightFromPOV ? 1 : 0);
    }
    get autoLight() {
        return this._autoLight;
    }
    setAutoLight(v) {
        this._autoLight = v;
        this.updateAutoLight();
    }
    updateAutoLight() {
        this.setFloat("autoLight", this._autoLight);
    }
    get diffuseSharpness() {
        return this._diffuseSharpness;
    }
    setDiffuseSharpness(v) {
        this._diffuseSharpness = v;
        this.updateDiffuseSharpness();
    }
    updateDiffuseSharpness() {
        this.setFloat("diffuseSharpness", this._diffuseSharpness);
    }
    get diffuse() {
        return this._diffuse;
    }
    setDiffuse(c) {
        this._diffuse = c;
        this.updateDiffuse();
    }
    updateDiffuse() {
        this.setColor3("diffuse", this._diffuse);
    }
    get useFlatSpecular() {
        return this._useFlatSpecular;
    }
    setUseFlatSpecular(b) {
        this._useFlatSpecular = b;
        this.updateUseFlatSpecular();
    }
    updateUseFlatSpecular() {
        this.setInt("useFlatSpecular", this._useFlatSpecular ? 1 : 0);
    }
    get specularIntensity() {
        return this._specularIntensity;
    }
    setSpecularIntensity(v) {
        this._specularIntensity = v;
        this.updateSpecularIntensity();
    }
    updateSpecularIntensity() {
        this.setFloat("specularIntensity", this._specularIntensity);
    }
    get specular() {
        return this._specular;
    }
    setSpecular(c) {
        this._specular = c;
        this.updateSpecular();
    }
    updateSpecular() {
        this.setColor3("specular", this._specular);
    }
    get specularCount() {
        return this._specularCount;
    }
    setSpecularCount(v) {
        this._specularCount = v;
        this.updateSpecularCount();
    }
    updateSpecularCount() {
        this.setFloat("specularCount", this._specularCount);
    }
    get specularPower() {
        return this._specularPower;
    }
    setSpecularPower(v) {
        this._specularPower = v;
        this.updateSpecularPower();
    }
    updateSpecularPower() {
        this.setFloat("specularPower", this._specularPower);
    }
}
class StampEffect {
    constructor(game) {
        this.game = game;
        this.sound = game.soundManager.createSound("stamp-sound", "./datas/sounds/stamp.mp3");
    }
    getScene() {
        return this.game.scene;
    }
    async play(div) {
        div.style.visibility = "hidden";
        await Mummu.AnimationFactory.CreateWait(this)(0.2);
        this.sound.play();
        div.style.transform = "scale(0.1)";
        div.style.transition = "all 0.2s";
        div.style.visibility = "";
        div.style.transform = "scale(1.3)";
        await Mummu.AnimationFactory.CreateWait(this)(0.2);
        div.style.transform = "scale(1)";
        await Mummu.AnimationFactory.CreateWait(this)(0.2);
        div.style.transition = "";
    }
}
class FishingPole {
    constructor(puzzle) {
        this.puzzle = puzzle;
        this.origin = new BABYLON.Vector3(0, 20, 5);
        this.animateTip = Mummu.AnimationFactory.EmptyVector3Callback;
        this.stop = false;
        this.lineMesh = new BABYLON.Mesh("tentacle");
        this.lineMesh.material = this.puzzle.game.trueWhiteMaterial;
        let magnet = CreateBoxFrameVertexData({
            w: 0.2,
            wBase: 0.25,
            d: 0.2,
            dBase: 0.25,
            h: 0.3,
            thickness: 0.03,
            innerHeight: 0.1,
            topCap: true,
            flatShading: true
        });
        Mummu.ColorizeVertexDataInPlace(magnet, this.puzzle.game.blackMaterial.diffuseColor);
        let line = BABYLON.CreateCylinderVertexData({ diameter: 0.05, height: 100, tessellation: 12, cap: BABYLON.Mesh.NO_CAP });
        Mummu.ColorizeVertexDataInPlace(line, this.puzzle.game.brownMaterial.diffuseColor.scale(1.5));
        Mummu.TranslateVertexDataInPlace(line, new BABYLON.Vector3(0, 50.2, 0));
        let data = Mummu.MergeVertexDatas(magnet, line);
        Mummu.TranslateVertexDataInPlace(data, new BABYLON.Vector3(0, 0.3, 0));
        data.applyToMesh(this.lineMesh);
        this.lineMesh.isVisible = false;
        this.animateTip = Mummu.AnimationFactory.CreateVector3(this.lineMesh, this.lineMesh, "position");
    }
    async fish(from, to, onLowestPointCallback, onJustBeforeFlybackCallback) {
        this.origin.copyFrom(from).addInPlace(to).scaleInPlace(0.5);
        this.origin.y = 20;
        let tipZero = BABYLON.Vector3.Lerp(this.origin, from, 0.1);
        this.lineMesh.position.copyFrom(tipZero);
        this.lineMesh.isVisible = true;
        let fromTop = from.clone();
        fromTop.y = 0;
        let tipPath = [
            tipZero.clone(),
            fromTop.clone(),
            from.clone(),
            BABYLON.Vector3.Lerp(fromTop, to, 0.1).add(new BABYLON.Vector3(0, 3, 0)),
            to.clone()
        ];
        Mummu.CatmullRomPathInPlace(tipPath);
        Mummu.CatmullRomPathInPlace(tipPath);
        Mummu.CatmullRomPathInPlace(tipPath);
        Mummu.CatmullRomPathInPlace(tipPath);
        Mummu.CatmullRomPathInPlace(tipPath);
        this.stop = false;
        return new Promise(resolve => {
            let duration = 4;
            let t0 = performance.now();
            let step = async () => {
                if (this.stop) {
                    this.lineMesh.isVisible = false;
                    return;
                }
                let f = (performance.now() - t0) / 1000 / duration;
                if (f < 1) {
                    if (f > 0.5 && onLowestPointCallback) {
                        onLowestPointCallback();
                        onLowestPointCallback = undefined;
                    }
                    f = Nabu.Easing.easeInOutSine(f);
                    Mummu.EvaluatePathToRef(f, tipPath, this.lineMesh.position);
                    requestAnimationFrame(step);
                }
                else {
                    if (onLowestPointCallback) {
                        onLowestPointCallback();
                        onLowestPointCallback = undefined;
                    }
                    if (onJustBeforeFlybackCallback) {
                        onJustBeforeFlybackCallback();
                        onJustBeforeFlybackCallback = undefined;
                    }
                    await this.animateTip(this.origin, 1, Nabu.Easing.easeInSine);
                    this.lineMesh.isVisible = false;
                    resolve();
                }
            };
            step();
        });
    }
}
class Puzzle {
    constructor(game) {
        this.game = game;
        this.data = {
            id: null,
            title: "No Title",
            author: "No Author",
            content: ""
        };
        this.winSlotRows = 1;
        this.winSlots = [];
        this.winSlotsIndexes = [0, 0, 0, 0];
        this.stars = [];
        this.ballsCount = 1;
        this.ballsPositionZero = [BABYLON.Vector3.Zero(), BABYLON.Vector3.Zero()];
        this.balls = [];
        this.ballCollision = BABYLON.Vector3.Zero();
        this.ballCollisionDone = [true, true];
        this.playTimer = 0;
        this.fishingPolesCount = 3;
        this.tiles = [];
        this.griddedTiles = [];
        this.griddedBorders = [];
        this.buildings = [];
        this.buildingBlocks = [];
        this.buildingBlocksBorders = [];
        this.w = 10;
        this.h = 10;
        this._pendingPublish = false;
        this.haikus = [];
        this.playerHaikus = [];
        this._ballCollisionTimeStamp = 0;
        this._timer = 0;
        this._globalTime = 0;
        this._smoothedFPS = 30;
        this.balls = [
            new Ball(this, { color: TileColor.North }, 0),
            new Ball(this, { color: TileColor.North }, 1)
        ];
        this.fishingPole = new FishingPole(this);
        this.floor = new BABYLON.Mesh("floor");
        this.floor.material = this.game.floorMaterial;
        this.invisiFloorTM = BABYLON.MeshBuilder.CreateGround("invisifloor", { width: 10, height: 10 });
        this.invisiFloorTM.position.x = 5 - 0.55;
        this.invisiFloorTM.position.y = -0.01;
        this.invisiFloorTM.position.z = 5 - 0.55;
        this.invisiFloorTM.isVisible = false;
        this.holeWall = new BABYLON.Mesh("hole-wall");
        this.holeWall.material = this.game.holeMaterial;
        this.boxesWall = new BABYLON.Mesh("building-wall");
        this.boxesWall.material = this.game.wallMaterial;
        this.boxesWood = new BABYLON.Mesh("building-wood");
        this.boxesWood.material = this.game.brownMaterial;
        this.boxesFloor = new BABYLON.Mesh("building-floor");
        this.boxesFloor.material = this.game.woodFloorMaterial;
        this.puzzleUI = new PuzzleUI(this);
        this.fpsMaterial = new BABYLON.StandardMaterial("test-haiku-material");
        this.fpsTexture = new BABYLON.DynamicTexture("haiku-texture", { width: 300, height: 100 });
        this.fpsTexture.hasAlpha = true;
        this.fpsMaterial.diffuseTexture = this.fpsTexture;
        this.fpsMaterial.specularColor.copyFromFloats(0.3, 0.3, 0.3);
        this.fpsMaterial.useAlphaFromDiffuseTexture = true;
        this.clickSound = this.game.soundManager.createSound("wood-choc", "./datas/sounds/clic.wav", undefined, undefined, { autoplay: false, loop: false, volume: 0.15 }, 3);
        this.wooshSound = this.game.soundManager.createSound("wood-choc", "./datas/sounds/wind.mp3", undefined, undefined, { autoplay: false, loop: false, volume: 0.1, playbackRate: 0.8 }, 3);
    }
    _getOrCreateGriddedStack(i, j) {
        if (!this.griddedTiles[i]) {
            this.griddedTiles[i] = [];
        }
        if (!this.griddedTiles[i][j]) {
            this.griddedTiles[i][j] = new Nabu.UniqueList();
        }
        return this.griddedTiles[i][j];
    }
    getGriddedStack(i, j) {
        if (this.griddedTiles[i]) {
            return this.griddedTiles[i][j];
        }
    }
    updateGriddedStack(t, skipSafetyCheck) {
        if (!skipSafetyCheck) {
            this.griddedTiles.forEach(line => {
                line.forEach(stack => {
                    if (stack.contains(t)) {
                        stack.remove(t);
                    }
                });
            });
        }
        this._getOrCreateGriddedStack(t.i, t.j).push(t);
    }
    removeFromGriddedStack(t) {
        let expected = this.getGriddedStack(t.i, t.j);
        if (expected && expected.contains(t)) {
            expected.remove(t);
        }
        else {
            console.warn("Removing a Tile that is not in its expected stack.");
            this.griddedTiles.forEach(line => {
                line.forEach(stack => {
                    if (stack.contains(t)) {
                        stack.remove(t);
                    }
                });
            });
        }
    }
    _getOrCreateGriddedBorderStack(i, j) {
        if (!this.griddedBorders[i]) {
            this.griddedBorders[i] = [];
        }
        if (!this.griddedBorders[i][j]) {
            this.griddedBorders[i][j] = new Nabu.UniqueList();
        }
        return this.griddedBorders[i][j];
    }
    getGriddedBorderStack(i, j) {
        if (this.griddedBorders[i]) {
            return this.griddedBorders[i][j];
        }
    }
    updateGriddedBorderStack(b, skipSafetyCheck) {
        if (!skipSafetyCheck) {
            this.griddedBorders.forEach(line => {
                line.forEach(stack => {
                    if (stack.contains(b)) {
                        stack.remove(b);
                    }
                });
            });
        }
        this._getOrCreateGriddedBorderStack(b.i, b.j).push(b);
    }
    removeFromGriddedBorderStack(t) {
        let expected = this.getGriddedBorderStack(t.i, t.j);
        if (expected && expected.contains(t)) {
            expected.remove(t);
        }
        else {
            console.warn("Removing a Border that is not in its expected stack.");
            this.griddedBorders.forEach(line => {
                line.forEach(stack => {
                    if (stack.contains(t)) {
                        stack.remove(t);
                    }
                });
            });
        }
    }
    buildingBlockGet(i, j) {
        if (i >= 0 && i < this.buildingBlocks.length) {
            if (!this.buildingBlocks[i]) {
                return 0;
            }
            if (j >= 0 && j < this.buildingBlocks[i].length) {
                if (isFinite(this.buildingBlocks[i][j])) {
                    return this.buildingBlocks[i][j];
                }
            }
        }
        return 0;
    }
    buildingBlockSet(v, i, j) {
        if (i >= 0 && i < this.w) {
            if (j >= 0 && j < this.h) {
                if (!this.buildingBlocks[i]) {
                    this.buildingBlocks[i] = [];
                }
                this.buildingBlocks[i][j] = v;
            }
        }
    }
    getScene() {
        return this.game.scene;
    }
    hMapGet(i, j) {
        if (i >= 0 && i < this.heightMap.length) {
            if (!this.heightMap[i]) {
                return 0;
            }
            if (j >= 0 && j < this.heightMap[i].length) {
                return this.heightMap[i][j];
            }
        }
        return 0;
    }
    hMapSet(v, i, j) {
        if (i < this.heightMap.length) {
            if (j < this.heightMap[i].length) {
                if (!this.heightMap[i]) {
                    this.heightMap[i] = [];
                }
                this.heightMap[i][j] = v;
            }
        }
    }
    get xMin() {
        return -0.55 - 0.05;
    }
    get xMax() {
        return this.w * 1.1 - 0.55 + 0.05;
    }
    get zMin() {
        return -0.55 - 0.05;
    }
    get zMax() {
        return this.h * 1.1 - 0.55 + 0.05;
    }
    async reset() {
        this.fishingPole.stop = true;
        if (this.data) {
            this.resetFromData(this.data);
            await this.instantiate();
        }
        this.puzzleUI.reset();
        document.querySelector("#puzzle-title stroke-text").setContent(this.data.title);
        document.querySelector("#puzzle-author stroke-text").setContent("created by " + this.data.author);
        document.querySelector("#puzzle-skip-intro").style.display = "";
        document.querySelector("#puzzle-ready").style.display = "none";
        this.game.fadeInIntro();
        if (USE_POKI_SDK) {
            PokiGameplayStart();
        }
    }
    skipIntro() {
        document.querySelector("#puzzle-skip-intro").style.display = "none";
        document.querySelector("#puzzle-ready").style.display = "";
        this.game.mode = GameMode.Play;
    }
    win() {
        if (USE_POKI_SDK) {
            PokiGameplayStop();
        }
        let score = Math.floor(this.playTimer * 100);
        this.game.completePuzzle(this.data.id, score);
        this.puzzleUI.successPanel.querySelector("#success-timer stroke-text").setContent(Game.ScoreToString(score));
        let highscore = this.data.score;
        let ratio = 1;
        if (highscore != null) {
            ratio = highscore / score;
        }
        let s1 = ratio > 0.3 ? "★" : "☆";
        let s2 = ratio > 0.6 ? "★" : "☆";
        let s3 = ratio > 0.9 ? "★" : "☆";
        this.puzzleUI.successPanel.querySelector(".stamp div").innerHTML = s1 + "</br>" + s2 + s3;
        setTimeout(() => {
            for (let i = 0; i < this.ballsCount; i++) {
                if (this.balls[i].ballState != BallState.Done) {
                    return;
                }
            }
            this.game.stamp.play(this.puzzleUI.successPanel.querySelector(".stamp"));
            this.puzzleUI.win();
            if (!OFFLINE_MODE && (this.data.score === null || score < this.data.score)) {
                this.puzzleUI.setHighscoreState(1);
            }
            else {
                this.puzzleUI.setHighscoreState(0);
            }
        }, 3000);
    }
    lose() {
        if (USE_POKI_SDK) {
            PokiGameplayStop();
        }
        setTimeout(() => {
            for (let i = 0; i < this.ballsCount; i++) {
                if (this.balls[i].ballState != BallState.Done) {
                    return;
                }
            }
            this.puzzleUI.lose();
        }, 1000);
    }
    async submitHighscore() {
        if (this._pendingPublish) {
            return;
        }
        this._pendingPublish = true;
        let score = Math.round(this.playTimer * 100);
        let puzzleId = this.data.id;
        let player = document.querySelector("#score-player-input").value;
        if (this.ballsCount === 2) {
            player = document.querySelector("#score-2-players-input").value;
        }
        let actions = "cheating";
        let data = {
            puzzle_id: puzzleId,
            player: player,
            score: score,
            actions: actions
        };
        if (data.player.length > 3) {
            let dataString = JSON.stringify(data);
            this.puzzleUI.setHighscoreState(2);
            await Mummu.AnimationFactory.CreateWait(this)(1);
            try {
                const response = await fetch(SHARE_SERVICE_PATH + "publish_score", {
                    method: "POST",
                    mode: "cors",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: dataString,
                });
                if (!response.ok) {
                    throw new Error("Response status: " + response.status);
                }
                this.puzzleUI.setHighscoreState(3);
                this._pendingPublish = false;
            }
            catch (e) {
                this.puzzleUI.setHighscoreState(1);
                document.querySelector("#success-score-fail-message").style.display = "block";
                this._pendingPublish = false;
            }
        }
    }
    async loadFromFile(path) {
        let file = await fetch(path);
        let content = await file.text();
        this.resetFromData({
            id: null,
            title: "No Title",
            author: "No Author",
            content: content
        });
    }
    resetFromData(data) {
        while (this.tiles.length > 0) {
            this.tiles[0].dispose();
        }
        while (this.buildings.length > 0) {
            this.buildings[0].dispose();
        }
        while (this.haikus.length > 0) {
            this.haikus.pop().dispose();
        }
        while (this.playerHaikus.length > 0) {
            this.playerHaikus.pop().dispose();
        }
        this.griddedTiles = [];
        this.griddedBorders = [];
        this.data = data;
        DEV_UPDATE_STATE_UI();
        if (isFinite(data.id)) {
            this.game.bodyColorIndex = 5;
            this.game.bodyPatternIndex = Math.floor(Math.random() * 2);
        }
        let content = this.data.content;
        content = content.replaceAll("\r\n", "");
        content = content.replaceAll("\n", "");
        let lines = content.split("x");
        let ballLine = lines.splice(0, 1)[0].split("u");
        this.ballsCount = Math.max(1, Math.floor(ballLine.length / 3));
        for (let bIndex = 0; bIndex < this.ballsCount; bIndex++) {
            this.balls[bIndex].parent = undefined;
            this.balls[bIndex].position.x = parseInt(ballLine[0 + 3 * bIndex]) * 1.1;
            this.balls[bIndex].position.y = 0;
            this.balls[bIndex].position.z = parseInt(ballLine[1 + 3 * bIndex]) * 1.1;
            this.ballsPositionZero[bIndex].copyFrom(this.balls[bIndex].position);
            this.balls[bIndex].rotationQuaternion = BABYLON.Quaternion.Identity();
            this.balls[bIndex].trailPoints = [];
            this.balls[bIndex].trailMesh.isVisible = false;
            if (ballLine.length > 2) {
                this.balls[bIndex].setColor(parseInt(ballLine[2 + 3 * bIndex]));
            }
            else {
                this.balls[bIndex].setColor(TileColor.North);
            }
            this.balls[bIndex].ballState = BallState.Ready;
            this.balls[bIndex].lockControl(0.2);
            this.game.setPlayTimer(0);
            this.balls[bIndex].vZ = 1;
            this.balls[bIndex].setVisible(true);
        }
        for (let bIndex = this.ballsCount; bIndex < this.balls.length; bIndex++) {
            this.balls[bIndex].setVisible(false);
        }
        if (this.ballsCount === 1) {
            this.balls[0].material = this.game.brownMaterial;
        }
        else if (this.ballsCount === 2) {
            this.balls[0].material = this.game.whiteMaterial;
            this.balls[1].material = this.game.blackMaterial;
            this.playerHaikus[0] = new HaikuPlayerStart(this.game, this.game.player1Name.toLocaleUpperCase(), this.balls[0]);
            this.playerHaikus[1] = new HaikuPlayerStart(this.game, this.game.player2Name.toLocaleUpperCase(), this.balls[1]);
        }
        this.ballCollision.copyFromFloats(-10, 0, -10);
        this.ballCollisionDone = [true, true];
        this.fishingPolesCount = 3;
        let buildingBlocksLine = lines[lines.length - 1];
        if (buildingBlocksLine.startsWith("BB")) {
            lines.pop();
        }
        else {
            buildingBlocksLine = "";
        }
        this.h = lines.length;
        this.w = lines[0].length;
        this.buildingBlocks = [];
        for (let i = 0; i < this.w; i++) {
            this.buildingBlocks[i] = [];
            for (let j = 0; j < this.h; j++) {
                this.buildingBlocks[i][j] = 0;
            }
        }
        if (buildingBlocksLine != "") {
            buildingBlocksLine = buildingBlocksLine.replace("BB", "");
            for (let j = 0; j < this.h; j++) {
                for (let i = 0; i < this.w; i++) {
                    let n = i + j * this.w;
                    if (n < buildingBlocksLine.length) {
                        this.buildingBlocks[i][j] = parseInt(buildingBlocksLine[n]);
                    }
                }
            }
        }
        for (let j = 0; j < lines.length; j++) {
            let line = lines[lines.length - 1 - j];
            for (let i = 0; i < line.length; i++) {
                let c = line[i];
                if (c === "p") {
                    let push = new PushTile(this.game, {
                        color: TileColor.North,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                if (c === "O") {
                    let hole = new HoleTile(this.game, {
                        color: TileColor.North,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                if (c === "r") {
                    let rock = new WallTile(this.game, {
                        color: TileColor.North,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                if (c === "a") {
                    let wall = new WallTile(this.game, {
                        color: TileColor.North,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                if (c === "q") {
                    let water = new WaterTile(this.game, {
                        color: TileColor.North,
                        i: i,
                        j: j,
                        h: 0,
                        noShadow: true
                    });
                }
                if (c === "N") {
                    let block = new SwitchTile(this.game, {
                        color: TileColor.North,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                if (c === "n") {
                    let block = new BlockTile(this.game, {
                        color: TileColor.North,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                if (c === "E") {
                    let block = new SwitchTile(this.game, {
                        color: TileColor.East,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                if (c === "e") {
                    let block = new BlockTile(this.game, {
                        color: TileColor.East,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                if (c === "S") {
                    let block = new SwitchTile(this.game, {
                        color: TileColor.South,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                if (c === "s") {
                    let block = new BlockTile(this.game, {
                        color: TileColor.South,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                if (c === "W") {
                    let block = new SwitchTile(this.game, {
                        color: TileColor.West,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                if (c === "w") {
                    let block = new BlockTile(this.game, {
                        color: TileColor.West,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                if (c === "B") {
                    this.buildingBlocks[i][j] = 1;
                    this.buildingBlocks[i + 1][j] = 1;
                    this.buildingBlocks[i][j + 1] = 1;
                    this.buildingBlocks[i + 1][j + 1] = 1;
                }
                if (c === "R") {
                    let ramp = new Ramp(this.game, {
                        i: i,
                        j: j
                    });
                }
                if (c === "U") {
                    let bridge = new Bridge(this.game, {
                        i: i,
                        j: j,
                        borderBottom: true,
                        borderRight: true,
                        borderLeft: true,
                        borderTop: true
                    });
                }
            }
        }
        HaikuMaker.MakeHaiku(this);
        this.game.updateMenuCameraRadius();
    }
    async instantiate() {
        this.regenerateHeightMap();
        for (let i = 0; i < this.tiles.length; i++) {
            let t = this.tiles[i];
            if (t instanceof WaterTile) {
            }
            else if (t instanceof HoleTile) {
            }
            else {
                t.position.y = this.hMapGet(t.i, t.j);
            }
        }
        let waterTiles = this.tiles.filter(t => { return t instanceof WaterTile; });
        if (waterTiles.length > 2) {
            waterTiles = waterTiles.sort((t1, t2) => {
                if (t2.j === t1.j) {
                    return t1.i - t2.i;
                }
                return t2.j - t1.j;
            });
            if (waterTiles[0]) {
                waterTiles[0].recursiveConnect(0);
            }
        }
        for (let i = 0; i < this.tiles.length; i++) {
            await this.tiles[i].instantiate();
        }
        for (let i = 0; i < this.buildings.length; i++) {
            this.buildings[i].regenerateBorders();
        }
        this.regenerateBuildingBlocksBorders();
        for (let i = 0; i < this.buildings.length; i++) {
            await this.buildings[i].instantiate();
        }
        for (let i = 0; i < this.buildingBlocksBorders.length; i++) {
            await this.buildingBlocksBorders[i].instantiate();
        }
        let datas = await BuildingBlock.GenerateVertexDatas(this);
        datas[0].applyToMesh(this.boxesWall);
        datas[1].applyToMesh(this.boxesWood);
        datas[2].applyToMesh(this.boxesFloor);
        for (let i = 0; i < this.ballsCount; i++) {
            await this.balls[i].instantiate();
        }
        if (this.ballsCount === 2) {
            this.playerHaikus[0].show();
            this.playerHaikus[1].show();
        }
        this.rebuildFloor();
    }
    regenerateHeightMap() {
        this.heightMap = [];
        for (let i = 0; i < this.w; i++) {
            this.heightMap[i] = [];
            for (let j = 0; j < this.h; j++) {
                this.heightMap[i][j] = this.buildingBlockGet(i, j);
            }
        }
        this.buildings.forEach(building => {
            building.fillHeightmap();
        });
    }
    regenerateBuildingBlocksBorders() {
        while (this.buildingBlocksBorders.length > 0) {
            this.buildingBlocksBorders.pop().dispose();
        }
        for (let i = 0; i < this.w; i++) {
            for (let j = 0; j < this.h; j++) {
                let b = this.buildingBlockGet(i, j);
                if (b === 1) {
                    if (this.hMapGet(i - 1, j) != 1) {
                        this.buildingBlocksBorders.push(Border.BorderLeft(this.game, i, j, 1));
                        this.buildingBlocksBorders.push(Border.BorderLeft(this.game, i, j, 0, true));
                    }
                    if (this.hMapGet(i + 1, j) != 1) {
                        this.buildingBlocksBorders.push(Border.BorderRight(this.game, i, j, 1));
                        this.buildingBlocksBorders.push(Border.BorderRight(this.game, i, j, 0, true));
                    }
                    if (this.hMapGet(i, j + 1) != 1) {
                        this.buildingBlocksBorders.push(Border.BorderTop(this.game, i, j, 1));
                        this.buildingBlocksBorders.push(Border.BorderTop(this.game, i, j, 0, true));
                    }
                    if (this.hMapGet(i, j - 1) != 1) {
                        this.buildingBlocksBorders.push(Border.BorderBottom(this.game, i, j, 1));
                        this.buildingBlocksBorders.push(Border.BorderBottom(this.game, i, j, 0, true));
                    }
                }
            }
        }
    }
    async editorRegenerateBuildings() {
        this.regenerateHeightMap();
        for (let i = 0; i < this.buildings.length; i++) {
            this.buildings[i].regenerateBorders();
        }
        this.regenerateBuildingBlocksBorders();
        for (let i = 0; i < this.buildings.length; i++) {
            await this.buildings[i].instantiate();
        }
        for (let i = 0; i < this.buildingBlocksBorders.length; i++) {
            await this.buildingBlocksBorders[i].instantiate();
        }
        let datas = await BuildingBlock.GenerateVertexDatas(this);
        datas[0].applyToMesh(this.boxesWall);
        datas[1].applyToMesh(this.boxesWood);
        datas[2].applyToMesh(this.boxesFloor);
    }
    updateInvisifloorTM() {
        let w = Math.max(100, 2 * (this.xMax - this.xMin));
        let h = Math.max(100, 2 * (this.zMax - this.zMin));
        BABYLON.CreateGroundVertexData({ width: w, height: h }).applyToMesh(this.invisiFloorTM);
        this.invisiFloorTM.position.x = (this.xMax + this.xMin) * 0.5;
        this.invisiFloorTM.position.z = (this.zMax + this.zMin) * 0.5;
    }
    rebuildFloor() {
        if (this.border) {
            this.border.dispose();
        }
        if (this.holeOutline) {
            this.holeOutline.dispose();
        }
        while (this.winSlots.length > 0) {
            this.winSlots.pop().dispose();
        }
        while (this.stars.length > 0) {
            this.stars.pop().dispose();
        }
        this.border = new BABYLON.Mesh("border");
        this.winSlotRows = 1;
        let bHeight = 0.3;
        let bThickness = 0.8;
        let width = this.xMax - this.xMin;
        let depth = this.zMax - this.zMin;
        let slotCounts = [];
        for (let color = TileColor.North; color <= TileColor.West; color++) {
            slotCounts[color] = this.tiles.filter((tile) => {
                return tile instanceof BlockTile && tile.color === color;
            }).length;
        }
        let lNorth = slotCounts[TileColor.North] * 0.7 + 0.1;
        let lEast = slotCounts[TileColor.East] * 0.7 + 0.1;
        let lSouth = slotCounts[TileColor.South] * 0.7 + 0.1;
        let lWest = slotCounts[TileColor.West] * 0.7 + 0.1;
        if (lNorth > width || lEast > width) {
            this.winSlotRows = 2;
        }
        if (lSouth > depth || lWest > depth) {
            this.winSlotRows = 2;
        }
        let data = CreateBoxFrameVertexData({
            w: width + 2 * this.winSlotRows * bThickness,
            d: depth + 2 * this.winSlotRows * bThickness,
            wTop: width + 2 * this.winSlotRows * bThickness - 0.1,
            dTop: depth + 2 * this.winSlotRows * bThickness - 0.1,
            h: 5.5 + bHeight,
            thickness: this.winSlotRows * bThickness,
            innerHeight: bHeight,
            flatShading: true
        });
        Mummu.TranslateVertexDataInPlace(data, new BABYLON.Vector3(0, -5.5, 0));
        this.border.position.copyFromFloats((this.xMax + this.xMin) * 0.5, 0, (this.zMax + this.zMin) * 0.5);
        this.border.material = this.game.blackMaterial;
        data.applyToMesh(this.border);
        /*
        let plaqueData = CreatePlaqueVertexData(2.5, 0.32, 0.03);
        Mummu.TranslateVertexDataInPlace(plaqueData, new BABYLON.Vector3(-1.25, 0, 0.16));
        
        let tiaratumLogo = new BABYLON.Mesh("tiaratum-logo");
        plaqueData.applyToMesh(tiaratumLogo);
        tiaratumLogo.parent = this.border;
        tiaratumLogo.position.copyFromFloats(width * 0.5 + 0.4, 0.21, - depth * 0.5 - 0.4);
        let haikuMaterial = new BABYLON.StandardMaterial("test-haiku-material");
        haikuMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/tiaratum-logo-yellow.png");
        haikuMaterial.diffuseTexture.hasAlpha = true;
        haikuMaterial.specularColor.copyFromFloats(0.3, 0.3, 0.3);
        haikuMaterial.useAlphaFromDiffuseTexture = true;
        tiaratumLogo.material = haikuMaterial;
        
        Mummu.TranslateVertexDataInPlace(plaqueData, new BABYLON.Vector3(-1.25, 0, 0.16).scale(-2));
        let tiaratumLogo2 = new BABYLON.Mesh("tiaratum-logo-2");
        plaqueData.applyToMesh(tiaratumLogo2);
        tiaratumLogo2.parent = this.border;
        tiaratumLogo2.position.copyFromFloats(- width * 0.5 - 0.4, 0.21, depth * 0.5 + 0.4);
        tiaratumLogo2.material = haikuMaterial;
        */
        let fpsPlaqueData = CreatePlaqueVertexData(0.9, 0.32, 0.03);
        Mummu.TranslateVertexDataInPlace(fpsPlaqueData, new BABYLON.Vector3(0.45, 0, 0.16));
        let fpsPlaque = new BABYLON.Mesh("tiaratum-fps");
        fpsPlaqueData.applyToMesh(fpsPlaque);
        fpsPlaque.parent = this.border;
        fpsPlaque.position.copyFromFloats(-width * 0.5 - bThickness + 0.1, bHeight, -depth * 0.5 - bThickness + 0.1);
        fpsPlaque.material = this.fpsMaterial;
        Mummu.TranslateVertexDataInPlace(fpsPlaqueData, new BABYLON.Vector3(0.45, 0, 0.16).scale(-2));
        let fpsPlaque2 = new BABYLON.Mesh("tiaratum-fps-2");
        fpsPlaqueData.applyToMesh(fpsPlaque2);
        fpsPlaque2.parent = this.border;
        fpsPlaque2.position.copyFromFloats(width * 0.5 + bThickness - 0.1, bHeight, depth * 0.5 + bThickness - 0.1);
        fpsPlaque2.material = this.fpsMaterial;
        this.winSlotsIndexes = [0, 0, 0, 0];
        for (let color = TileColor.North; color <= TileColor.West; color++) {
            this.winSlots[color] = new BABYLON.Mesh("winslots-south");
            this.winSlots[color].material = this.game.blackMaterial;
            let count = slotCounts[color];
            if (count > 0) {
                let datas = [];
                for (let i = 0; i < count; i++) {
                    let data = CreateBoxFrameVertexData({
                        w: 0.5,
                        wBase: 0.6,
                        d: 0.5,
                        dBase: 0.6,
                        h: 0.1,
                        thickness: 0.05,
                        innerHeight: 0.09,
                        topCap: true,
                        topCapColor: new BABYLON.Color4(0.7, 0.7, 0.7, 1),
                        flatShading: true
                    });
                    let x = Math.floor(i / this.winSlotRows);
                    let z = i % this.winSlotRows;
                    Mummu.TranslateVertexDataInPlace(data, new BABYLON.Vector3(x * 0.7, 0, z * 0.7));
                    datas.push(data);
                }
                Mummu.MergeVertexDatas(...datas).applyToMesh(this.winSlots[color]);
                this.winSlots[color].parent = this.border;
                if (color === TileColor.North) {
                    this.winSlots[color].position.copyFromFloats(-(count - 1) * 0.7 * 0.5 / this.winSlotRows, bHeight, depth * 0.5 + bThickness * 0.5);
                }
                else if (color === TileColor.East) {
                    this.winSlots[color].position.copyFromFloats(width * 0.5 + bThickness * 0.5, bHeight, (count - 1) * 0.7 * 0.5 / this.winSlotRows);
                }
                else if (color === TileColor.South) {
                    this.winSlots[color].position.copyFromFloats((count - 1) * 0.7 * 0.5 / this.winSlotRows, bHeight, -depth * 0.5 - bThickness * 0.5);
                }
                else if (color === TileColor.West) {
                    this.winSlots[color].position.copyFromFloats(-width * 0.5 - bThickness * 0.5, bHeight, -(count - 1) * 0.7 * 0.5 / this.winSlotRows);
                }
                this.winSlots[color].rotation.y = Math.PI * 0.5 * color;
            }
        }
        let holes = [];
        let floorDatas = [];
        let holeDatas = [];
        for (let i = 0; i < this.w; i++) {
            for (let j = 0; j < this.h; j++) {
                let holeTile = this.tiles.find(tile => {
                    if (tile instanceof HoleTile) {
                        if (tile.props.i === i) {
                            if (tile.props.j === j) {
                                return true;
                            }
                        }
                    }
                    return false;
                });
                if (holeTile) {
                    holes.push({ i: i, j: j });
                    let tileData = BABYLON.CreateGroundVertexData({ width: 1.1, height: 1.1 });
                    Mummu.TranslateVertexDataInPlace(tileData, new BABYLON.Vector3(i * 1.1, -5, j * 1.1));
                    Mummu.ColorizeVertexDataInPlace(tileData, BABYLON.Color3.Black());
                    floorDatas.push(tileData);
                }
                if (!holeTile) {
                    let waterTile = this.tiles.find(tile => {
                        if (tile instanceof WaterTile) {
                            if (tile.props.i === i) {
                                if (tile.props.j === j) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    });
                    if (!waterTile) {
                        let tileData = BABYLON.CreateGroundVertexData({ width: 1.1, height: 1.1 });
                        Mummu.TranslateVertexDataInPlace(tileData, new BABYLON.Vector3(i * 1.1, 0, j * 1.1));
                        Mummu.ColorizeVertexDataInPlace(tileData, BABYLON.Color3.White());
                        floorDatas.push(tileData);
                    }
                }
            }
        }
        let holeOutlinePoints = [];
        let holeOutlineColors = [];
        for (let n = 0; n < holes.length; n++) {
            let hole = holes[n];
            let i = hole.i;
            let j = hole.j;
            let left = holes.find(h => { return h.i === i - 1 && h.j === j; });
            if (!left) {
                let holeData = Mummu.CreateQuadVertexData({ width: 1.1, height: 5, uvInWorldSpace: true, uvSize: 1.1 });
                holeData.colors = [
                    0, 0, 0, 1,
                    0, 0, 0, 1,
                    1, 1, 1, 1,
                    1, 1, 1, 1
                ];
                Mummu.RotateVertexDataInPlace(holeData, BABYLON.Quaternion.FromEulerAngles(0, -Math.PI * 0.5, 0));
                Mummu.TranslateVertexDataInPlace(holeData, new BABYLON.Vector3((i - 0.5) * 1.1, -2.5, j * 1.1));
                holeDatas.push(holeData);
                holeOutlinePoints.push([
                    new BABYLON.Vector3(i * 1.1 - 0.55, 0, j * 1.1 + 0.55),
                    new BABYLON.Vector3(i * 1.1 - 0.55, 0, j * 1.1 - 0.55),
                ]);
                holeOutlineColors.push([
                    new BABYLON.Color4(0, 0, 0, 1),
                    new BABYLON.Color4(0, 0, 0, 1)
                ]);
            }
            let right = holes.find(h => { return h.i === i + 1 && h.j === j; });
            if (!right) {
                let holeData = Mummu.CreateQuadVertexData({ width: 1.1, height: 5, uvInWorldSpace: true, uvSize: 1.1 });
                holeData.colors = [
                    0, 0, 0, 1,
                    0, 0, 0, 1,
                    1, 1, 1, 1,
                    1, 1, 1, 1
                ];
                Mummu.RotateVertexDataInPlace(holeData, BABYLON.Quaternion.FromEulerAngles(0, Math.PI * 0.5, 0));
                Mummu.TranslateVertexDataInPlace(holeData, new BABYLON.Vector3((i + 0.5) * 1.1, -2.5, j * 1.1));
                holeDatas.push(holeData);
                holeOutlinePoints.push([
                    new BABYLON.Vector3(i * 1.1 + 0.55, 0, j * 1.1 + 0.55),
                    new BABYLON.Vector3(i * 1.1 + 0.55, 0, j * 1.1 - 0.55),
                ]);
                holeOutlineColors.push([
                    new BABYLON.Color4(0, 0, 0, 1),
                    new BABYLON.Color4(0, 0, 0, 1)
                ]);
            }
            let up = holes.find(h => { return h.i === i && h.j === j + 1; });
            if (!up) {
                let holeData = Mummu.CreateQuadVertexData({ width: 1.1, height: 5, uvInWorldSpace: true, uvSize: 1.1 });
                holeData.colors = [
                    0, 0, 0, 1,
                    0, 0, 0, 1,
                    1, 1, 1, 1,
                    1, 1, 1, 1
                ];
                Mummu.TranslateVertexDataInPlace(holeData, new BABYLON.Vector3(i * 1.1, -2.5, (j + 0.5) * 1.1));
                holeDatas.push(holeData);
                holeOutlinePoints.push([
                    new BABYLON.Vector3(i * 1.1 + 0.55, 0, j * 1.1 + 0.55),
                    new BABYLON.Vector3(i * 1.1 - 0.55, 0, j * 1.1 + 0.55),
                ]);
                holeOutlineColors.push([
                    new BABYLON.Color4(0, 0, 0, 1),
                    new BABYLON.Color4(0, 0, 0, 1)
                ]);
            }
            let down = holes.find(h => { return h.i === i && h.j === j - 1; });
            if (!down) {
                let holeData = Mummu.CreateQuadVertexData({ width: 1.1, height: 5, uvInWorldSpace: true, uvSize: 1.1 });
                holeData.colors = [
                    0, 0, 0, 1,
                    0, 0, 0, 1,
                    1, 1, 1, 1,
                    1, 1, 1, 1
                ];
                Mummu.RotateVertexDataInPlace(holeData, BABYLON.Quaternion.FromEulerAngles(0, Math.PI, 0));
                Mummu.TranslateVertexDataInPlace(holeData, new BABYLON.Vector3(i * 1.1, -2.5, (j - 0.5) * 1.1));
                holeDatas.push(holeData);
                holeOutlinePoints.push([
                    new BABYLON.Vector3(i * 1.1 + 0.55, 0, j * 1.1 - 0.55),
                    new BABYLON.Vector3(i * 1.1 - 0.55, 0, j * 1.1 - 0.55),
                ]);
                holeOutlineColors.push([
                    new BABYLON.Color4(0, 0, 0, 1),
                    new BABYLON.Color4(0, 0, 0, 1)
                ]);
            }
        }
        let floorData = Mummu.MergeVertexDatas(...floorDatas);
        for (let i = 0; i < floorData.positions.length / 3; i++) {
            floorData.uvs[2 * i] = 0.5 * floorData.positions[3 * i];
            floorData.uvs[2 * i + 1] = 0.5 * floorData.positions[3 * i + 2] - 0.5;
        }
        floorData.applyToMesh(this.floor);
        this.holeOutline = BABYLON.MeshBuilder.CreateLineSystem("hole-outline", {
            lines: holeOutlinePoints,
            colors: holeOutlineColors
        }, this.game.scene);
        if (holeDatas.length > 0) {
            Mummu.MergeVertexDatas(...holeDatas).applyToMesh(this.holeWall);
            this.holeWall.isVisible = true;
        }
        else {
            this.holeWall.isVisible = false;
        }
        this.updateInvisifloorTM();
    }
    fetchWinSlot(color) {
        let s = this.winSlotsIndexes[color];
        this.winSlotsIndexes[color]++;
        return s;
    }
    fetchWinSlotPos(color) {
        let s = this.fetchWinSlot(color);
        let x = Math.floor(s / this.winSlotRows);
        let z = s % this.winSlotRows;
        let d = new BABYLON.Vector3(x * 0.7, 0, z * 0.7);
        let winSlotMesh = this.winSlots[color];
        return BABYLON.Vector3.TransformCoordinates(d, winSlotMesh.getWorldMatrix());
    }
    start() {
        for (let i = 0; i < this.ballsCount; i++) {
            this.balls[i].ballState = BallState.Move;
            this.balls[i].bounceXValue = 0;
            this.balls[i].bounceXTimer = 0;
            this.balls[i].speed = 0;
            this.balls[i].animateSpeed(this.balls[i].nominalSpeed, 0.2, Nabu.Easing.easeInCubic);
            if (this.playerHaikus[i]) {
                this.playerHaikus[i].hide();
            }
        }
        this.game.fadeOutIntro(0.5);
        this.playTimer = 0;
        this.game.setPlayTimer(this.playTimer);
    }
    addBallCollision(v) {
        if (Math.abs(this._globalTime - this._ballCollisionTimeStamp) > 0.1) {
            this.ballCollisionDone = [false, false];
            this.ballCollision.copyFrom(v);
            this._ballCollisionTimeStamp = this._globalTime;
        }
    }
    update(dt) {
        for (let i = 0; i < this.ballsCount; i++) {
            this.balls[i].update(dt);
        }
        let tiles = this.tiles.filter(t => {
            return t instanceof BlockTile && t.tileState === TileState.Active;
        });
        if (tiles.length === 0) {
            let ballNotDone = false;
            for (let i = 0; i < this.ballsCount; i++) {
                if (this.balls[i].ballState != BallState.Done) {
                    ballNotDone = true;
                }
            }
            if (ballNotDone) {
                for (let i = 0; i < this.ballsCount; i++) {
                    this.balls[i].ballState = BallState.Done;
                }
                this.win();
            }
        }
        for (let i = 0; i < this.haikus.length; i++) {
            this.haikus[i].update(dt);
        }
        if (this.balls[0].ballState === BallState.Move || this.balls[0].ballState === BallState.Fall || this.balls[0].ballState === BallState.Flybacking) {
            this.playTimer += dt;
            this.game.setPlayTimer(this.playTimer);
        }
        this._globalTime += dt;
        this._timer += dt;
        if (this._timer > 0.25) {
            this._timer = 0;
            let fps = this.game.engine.getFps();
            if (isFinite(fps)) {
                this._smoothedFPS = 0.9 * this._smoothedFPS + 0.1 * fps;
            }
            let context = this.fpsTexture.getContext();
            context.fillStyle = "#e0c872ff";
            context.fillRect(0, 0, 800, 100);
            context.fillStyle = "#473a2fFF";
            context.font = "900 90px Julee";
            context.fillText(this._smoothedFPS.toFixed(0).padStart(3, " "), 30, 77);
            context.fillText("fps", 170, 77);
            this.fpsTexture.update();
        }
    }
}
function CLEAN_IPuzzleData(data) {
    if (data.id != null && typeof (data.id) === "string") {
        data.id = parseInt(data.id);
    }
    if (data.score != null && typeof (data.score) === "string") {
        data.score = parseInt(data.score);
    }
    if (data.state != null && typeof (data.state) === "string") {
        data.state = parseInt(data.state);
    }
    if (data.story_order != null && typeof (data.story_order) === "string") {
        data.story_order = parseInt(data.story_order);
    }
}
function CLEAN_IPuzzlesData(data) {
    for (let i = 0; i < data.puzzles.length; i++) {
        if (data.puzzles[i].id != null && typeof (data.puzzles[i].id) === "string") {
            data.puzzles[i].id = parseInt(data.puzzles[i].id);
        }
        if (data.puzzles[i].score != null && typeof (data.puzzles[i].score) === "string") {
            data.puzzles[i].score = parseInt(data.puzzles[i].score);
        }
        if (data.puzzles[i].state != null && typeof (data.puzzles[i].state) === "string") {
            data.puzzles[i].state = parseInt(data.puzzles[i].state);
        }
        if (data.puzzles[i].story_order != null && typeof (data.puzzles[i].story_order) === "string") {
            data.puzzles[i].story_order = parseInt(data.puzzles[i].story_order);
        }
    }
}
class PuzzleMiniatureMaker {
    static Generate(content) {
        content = content.replaceAll("\r\n", "");
        content = content.replaceAll("\n", "");
        let lines = content.split("x");
        let h = 4;
        let w = 4;
        if (lines.length > 3) {
            let ballLine = lines.splice(0, 1)[0].split("u");
            let ballX = parseInt(ballLine[0]);
            let ballZ = parseInt(ballLine[1]);
            let ballColor = TileColor.North;
            if (ballLine.length > 2) {
                ballColor = parseInt(ballLine[2]);
            }
            h = lines.length;
            w = lines[0].length;
        }
        let canvas = document.createElement("canvas");
        let max = Math.max(w, h);
        let f = 1;
        if (max < 7) {
            f = 2;
        }
        f = 6;
        let b = 6 * f;
        let m = 1 * f;
        canvas.width = b * w;
        canvas.height = b * h;
        let context = canvas.getContext("2d");
        //context.fillStyle = "#2b2821";
        //context.fillRect(2 * m, 2 * m, canvas.width - 4 * m, canvas.height - 4 * m);
        context.fillStyle = "#d9ac8b";
        context.fillRect(0, 0, canvas.width, canvas.height);
        let buildColor = "#f9dcAb";
        if (lines.length > 3) {
            for (let j = 0; j < lines.length; j++) {
                let line = lines[lines.length - 1 - j];
                for (let i = 0; i < line.length; i++) {
                    let c = line[i];
                    let x = i * b;
                    let y = (h - 1 - j) * b;
                    let s = b;
                    if (c === "B") {
                        let x = (i) * b;
                        let y = (h - 1 - j - 1) * b;
                        let s = b;
                        context.fillStyle = buildColor;
                        context.fillRect(x, y, 2 * s, 2 * s);
                    }
                    if (c === "U") {
                        let x = (i) * b;
                        let y = (h - 1 - j - 1) * b;
                        let s = b;
                        context.fillStyle = buildColor;
                        context.fillRect(x, y, 4 * s, 2 * s);
                    }
                    if (c === "R") {
                        let x = (i) * b;
                        let y = (h - 1 - j - 2) * b;
                        let s = b;
                        context.fillStyle = buildColor;
                        context.fillRect(x, y, 2 * s, 3 * s);
                    }
                }
            }
        }
        if (lines.length > 3) {
            for (let j = 0; j < lines.length; j++) {
                let line = lines[lines.length - 1 - j];
                for (let i = 0; i < line.length; i++) {
                    let c = line[i];
                    let x = i * b + m;
                    let y = (h - 1 - j) * b + m;
                    let s = b - 2 * m;
                    if (c === "O") {
                        let x = i * b;
                        let y = (h - 1 - j) * b;
                        let s = b;
                        context.fillStyle = "#2d4245";
                        context.fillRect(x, y, s, s);
                    }
                    if (c === "p") {
                        context.fillStyle = "#624c3c";
                        context.fillRect(x, y, s, s);
                    }
                    if (c === "q") {
                        let x = i * b;
                        let y = (h - 1 - j) * b;
                        let s = b;
                        context.fillStyle = "#647d9c";
                        context.fillRect(x, y, s, s);
                    }
                    if (c === "r") {
                        context.fillStyle = "#5d7275";
                        context.fillRect(x, y, s, s);
                    }
                    if (c === "a") {
                        let x = i * b;
                        let y = (h - 1 - j) * b;
                        let s = b;
                        context.fillStyle = "#1b1811";
                        context.fillRect(x, y, s, s);
                    }
                    if (c === "N") {
                        context.fillStyle = "#624c3c";
                        context.fillRect(x, y, s, s);
                        context.fillStyle = "#b03a48";
                        context.fillRect(x + m, y + m, s - 2 * m, s - 2 * m);
                    }
                    if (c === "n") {
                        context.fillStyle = "#b03a48";
                        context.fillRect(x, y, s, s);
                    }
                    if (c === "E") {
                        context.fillStyle = "#624c3c";
                        context.fillRect(x, y, s, s);
                        context.fillStyle = "#e0c872";
                        context.fillRect(x + m, y + m, s - 2 * m, s - 2 * m);
                    }
                    if (c === "e") {
                        context.fillStyle = "#e0c872";
                        context.fillRect(x, y, s, s);
                    }
                    if (c === "S") {
                        context.fillStyle = "#624c3c";
                        context.fillRect(x, y, s, s);
                        context.fillStyle = "#243d5c";
                        context.fillRect(x + m, y + m, s - 2 * m, s - 2 * m);
                    }
                    if (c === "s") {
                        context.fillStyle = "#243d5c";
                        context.fillRect(x, y, s, s);
                    }
                    if (c === "W") {
                        context.fillStyle = "#624c3c";
                        context.fillRect(x, y, s, s);
                        context.fillStyle = "#3e6958";
                        context.fillRect(x + m, y + m, s - 2 * m, s - 2 * m);
                    }
                    if (c === "w") {
                        context.fillStyle = "#3e6958";
                        context.fillRect(x, y, s, s);
                    }
                }
            }
        }
        return canvas;
    }
}
function SaveAsText(puzzle) {
    let lines = [];
    for (let j = 0; j < puzzle.h; j++) {
        lines[j] = [];
        for (let i = 0; i < puzzle.w; i++) {
            lines[j][i] = "o";
        }
    }
    puzzle.tiles.forEach(tile => {
        let i = tile.i;
        let j = tile.j;
        if (tile instanceof BlockTile) {
            if (tile.color === TileColor.North) {
                lines[j][i] = "n";
            }
            else if (tile.color === TileColor.East) {
                lines[j][i] = "e";
            }
            else if (tile.color === TileColor.South) {
                lines[j][i] = "s";
            }
            else if (tile.color === TileColor.West) {
                lines[j][i] = "w";
            }
        }
        else if (tile instanceof SwitchTile) {
            if (tile.color === TileColor.North) {
                lines[j][i] = "N";
            }
            else if (tile.color === TileColor.East) {
                lines[j][i] = "E";
            }
            else if (tile.color === TileColor.South) {
                lines[j][i] = "S";
            }
            else if (tile.color === TileColor.West) {
                lines[j][i] = "W";
            }
        }
        else if (tile instanceof PushTile) {
            lines[j][i] = "p";
        }
        else if (tile instanceof HoleTile) {
            lines[j][i] = "O";
        }
        else if (tile instanceof WallTile) {
            lines[j][i] = "a";
        }
        else if (tile instanceof WaterTile) {
            lines[j][i] = "q";
        }
    });
    puzzle.buildings.forEach(building => {
        let i = building.i;
        let j = building.j;
        if (building instanceof Ramp) {
            lines[j][i] = "R";
        }
        if (building instanceof Bridge) {
            lines[j][i] = "U";
        }
    });
    lines.reverse();
    let lines2 = lines.map((l1) => { return l1.reduce((c1, c2) => { return c1 + c2; }); });
    let ballLine = "";
    for (let i = 0; i < puzzle.ballsCount; i++) {
        ballLine += puzzle.balls[i].i.toFixed(0) + "u" + puzzle.balls[i].j.toFixed(0) + "u" + puzzle.balls[i].color.toFixed(0);
        if (i < puzzle.ballsCount - 1) {
            ballLine += "u";
        }
    }
    lines2.splice(0, 0, ballLine);
    let buildingBlocksLine = "BB";
    for (let j = 0; j < puzzle.h; j++) {
        for (let i = 0; i < puzzle.w; i++) {
            buildingBlocksLine = buildingBlocksLine + puzzle.buildingBlockGet(i, j).toFixed(0);
        }
    }
    lines2.push(buildingBlocksLine);
    return lines2.reduce((l1, l2) => { return l1 + "x" + l2; });
}
class PuzzleUI {
    constructor(puzzle) {
        this.puzzle = puzzle;
        this._inputUp = () => {
            if (this.successPanel.style.display === "") {
                if (this.hoveredElement === undefined) {
                    this.setHoveredElement(this.successNextButton);
                }
                else if (this.hoveredElement === this.successNextButton) {
                    this.setHoveredElement(this.successReplayButton);
                }
                else if (this.hoveredElement === this.successReplayButton) {
                    if (this.highscoreContainer.style.display === "block") {
                        if (this.scoreSubmitBtn.style.display === "inline-block" && !this.scoreSubmitBtn.classList.contains("locked")) {
                            this.setHoveredElement(this.scoreSubmitBtn);
                        }
                        else {
                            this.setHoveredElement(this.highscorePlayerLine);
                        }
                    }
                }
                else if (this.hoveredElement === this.scoreSubmitBtn) {
                    this.setHoveredElement(this.highscorePlayerLine);
                }
                else if (this.hoveredElement === this.highscorePlayerLine) {
                    this.setHoveredElement(this.successNextButton);
                }
            }
            else if (this.gameoverPanel.style.display === "") {
            }
        };
        this._inputLat = () => {
            if (this.successPanel.style.display === "") {
                if (this.hoveredElement === undefined) {
                    this.setHoveredElement(this.successNextButton);
                }
                else if (this.hoveredElement === this.successReplayButton) {
                    this.setHoveredElement(this.successNextButton);
                }
                else if (this.hoveredElement === this.successNextButton) {
                    this.setHoveredElement(this.successReplayButton);
                }
            }
            else if (this.gameoverPanel.style.display === "") {
                if (this.hoveredElement === undefined) {
                    this.setHoveredElement(this.gameoverReplayButton);
                }
                else if (this.hoveredElement === this.gameoverBackButton) {
                    this.setHoveredElement(this.gameoverReplayButton);
                }
                else if (this.hoveredElement === this.gameoverReplayButton) {
                    this.setHoveredElement(this.gameoverBackButton);
                }
            }
        };
        this._inputDown = () => {
            if (this.successPanel.style.display === "") {
                if (this.hoveredElement === undefined) {
                    this.setHoveredElement(this.successNextButton);
                }
                else if (this.hoveredElement === this.highscorePlayerLine) {
                    if (this.scoreSubmitBtn.style.display === "inline-block" && !this.scoreSubmitBtn.classList.contains("locked")) {
                        this.setHoveredElement(this.scoreSubmitBtn);
                    }
                    else {
                        this.setHoveredElement(this.successReplayButton);
                    }
                }
                else if (this.hoveredElement === this.scoreSubmitBtn) {
                    this.setHoveredElement(this.successReplayButton);
                }
                else if (this.hoveredElement === this.successReplayButton) {
                    this.setHoveredElement(this.successNextButton);
                }
                else if (this.hoveredElement === this.successNextButton) {
                    if (this.highscoreContainer.style.display === "block") {
                        this.setHoveredElement(this.highscorePlayerLine);
                    }
                }
            }
            else if (this.gameoverPanel.style.display === "") {
            }
        };
        this._inputEnter = () => {
            if (this.successPanel.style.display === "" || this.gameoverPanel.style.display === "") {
                if (this.hoveredElement instanceof HTMLButtonElement) {
                    if (this.hoveredElement.parentElement instanceof HTMLAnchorElement) {
                        location.hash = this.hoveredElement.parentElement.href.split("/").pop();
                    }
                    else if (this.hoveredElement.onclick) {
                        this.hoveredElement.onclick(undefined);
                    }
                }
                else if (this.hoveredElement === this.highscorePlayerLine) {
                    document.querySelector("#score-player-input").focus();
                }
            }
        };
        this._inputBack = () => {
            if (this.successPanel.style.display === "") {
            }
            else if (this.gameoverPanel.style.display === "") {
            }
        };
        this._inputDropControl = () => {
            this.setHoveredElement(undefined);
        };
        this.ingameTimer = document.querySelector("#play-timer");
        this.failMessage = document.querySelector("#success-score-fail-message");
        this.highscoreContainer = document.querySelector("#success-highscore-container");
        this.highscorePlayerLine = document.querySelector("#score-player-input").parentElement;
        this.highscoreTwoPlayersLine = document.querySelector("#score-2-players-input").parentElement;
        this.scoreSubmitBtn = document.querySelector("#success-score-submit-btn");
        this.scorePendingBtn = document.querySelector("#success-score-pending-btn");
        this.scoreDoneBtn = document.querySelector("#success-score-done-btn");
        this.successReplayButton = document.querySelector("#success-replay-btn");
        this.successReplayButton.onclick = () => {
            this.puzzle.reset();
            this.puzzle.skipIntro();
        };
        this.successNextButton = document.querySelector("#success-next-btn");
        this.gameoverBackButton = document.querySelector("#gameover-back-btn");
        this.gameoverReplayButton = document.querySelector("#gameover-replay-btn");
        this.gameoverReplayButton.onclick = () => {
            this.puzzle.reset();
            this.puzzle.skipIntro();
        };
        this.successPanel = document.querySelector("#play-success-panel");
        this.gameoverPanel = document.querySelector("#play-gameover-panel");
        this.game.router.playUI.onshow = () => { this._registerToInputManager(); };
        this.game.router.playUI.onhide = () => { this._unregisterFromInputManager(); };
    }
    get hoveredElement() {
        return this._hoveredElement;
    }
    setHoveredElement(e) {
        if (this.hoveredElement) {
            this.hoveredElement.classList.remove("hovered");
        }
        this._hoveredElement = e;
        if (this.hoveredElement) {
            this.hoveredElement.classList.add("hovered");
        }
    }
    get game() {
        return this.puzzle.game;
    }
    win() {
        this.successPanel.style.display = "";
        this.gameoverPanel.style.display = "none";
        this.ingameTimer.style.display = "none";
        if (this.game.uiInputManager.inControl) {
            this.setHoveredElement(this.successNextButton);
        }
    }
    lose() {
        this.successPanel.style.display = "none";
        this.gameoverPanel.style.display = "";
        this.ingameTimer.style.display = "none";
        if (this.game.uiInputManager.inControl) {
            this.setHoveredElement(this.gameoverReplayButton);
        }
    }
    reset() {
        if (this.successPanel) {
            this.successPanel.style.display = "none";
        }
        if (this.gameoverPanel) {
            this.gameoverPanel.style.display = "none";
        }
        if (this.ingameTimer) {
            this.ingameTimer.style.display = "";
        }
    }
    setHighscoreState(state) {
        let twoPlayerCase = this.puzzle.ballsCount === 2;
        this.highscorePlayerLine.style.display = twoPlayerCase ? "none" : "block";
        this.highscoreTwoPlayersLine.style.display = twoPlayerCase ? "block" : "none";
        this.failMessage.style.display = "none";
        if (state === 0) {
            // Not enough for Highscore
            this.highscoreContainer.style.display = "none";
        }
        else if (state === 1) {
            // Enough for Highscore, waiting for player action.
            this.highscoreContainer.style.display = "block";
            if (twoPlayerCase) {
                this.highscoreTwoPlayersLine.querySelector("input").value = this.puzzle.game.player1Name + " & " + this.puzzle.game.player2Name;
                this.scoreSubmitBtn.classList.remove("locked");
            }
            this.scoreSubmitBtn.style.display = "inline-block";
            this.scorePendingBtn.style.display = "none";
            this.scoreDoneBtn.style.display = "none";
        }
        else if (state === 2) {
            // Sending Highscore.
            this.highscoreContainer.style.display = "block";
            this.scoreSubmitBtn.style.display = "none";
            this.scorePendingBtn.style.display = "inline-block";
            this.scoreDoneBtn.style.display = "none";
        }
        else if (state === 3) {
            // Highscore sent with success.
            this.highscoreContainer.style.display = "block";
            this.scoreSubmitBtn.style.display = "none";
            this.scorePendingBtn.style.display = "none";
            this.scoreDoneBtn.style.display = "inline-block";
            if (this.game.uiInputManager.inControl) {
                this.setHoveredElement(this.successNextButton);
            }
        }
    }
    _registerToInputManager() {
        this.game.uiInputManager.onUpCallbacks.push(this._inputUp);
        this.game.uiInputManager.onLeftCallbacks.push(this._inputLat);
        this.game.uiInputManager.onDownCallbacks.push(this._inputDown);
        this.game.uiInputManager.onRightCallbacks.push(this._inputLat);
        this.game.uiInputManager.onEnterCallbacks.push(this._inputEnter);
        this.game.uiInputManager.onBackCallbacks.push(this._inputBack);
        this.game.uiInputManager.onDropControlCallbacks.push(this._inputDropControl);
    }
    _unregisterFromInputManager() {
        this.game.uiInputManager.onUpCallbacks.remove(this._inputUp);
        this.game.uiInputManager.onLeftCallbacks.remove(this._inputLat);
        this.game.uiInputManager.onDownCallbacks.remove(this._inputDown);
        this.game.uiInputManager.onRightCallbacks.remove(this._inputLat);
        this.game.uiInputManager.onEnterCallbacks.remove(this._inputEnter);
        this.game.uiInputManager.onBackCallbacks.remove(this._inputBack);
        this.game.uiInputManager.onDropControlCallbacks.remove(this._inputDropControl);
    }
}
function SineFlashVisibility(target, duration, min = 0, max = 1) {
    return new Promise(resolve => {
        let t0 = performance.now();
        let step = () => {
            let f = (performance.now() - t0) / 1000 / duration;
            if (f < 1) {
                target.visibility = min + Math.sin(f * Math.PI) * max;
                requestAnimationFrame(step);
            }
            else {
                target.visibility = min;
                resolve();
            }
        };
        step();
    });
}
function MakeQuad(i0, i1, i2, i3, indices, positions, flatShadingPositions) {
    if (positions && flatShadingPositions) {
        let l = flatShadingPositions.length / 3;
        let x0 = positions[3 * i0];
        let y0 = positions[3 * i0 + 1];
        let z0 = positions[3 * i0 + 2];
        let x1 = positions[3 * i1];
        let y1 = positions[3 * i1 + 1];
        let z1 = positions[3 * i1 + 2];
        let x2 = positions[3 * i2];
        let y2 = positions[3 * i2 + 1];
        let z2 = positions[3 * i2 + 2];
        let x3 = positions[3 * i3];
        let y3 = positions[3 * i3 + 1];
        let z3 = positions[3 * i3 + 2];
        flatShadingPositions.push(x0, y0, z0, x1, y1, z1, x2, y2, z2, x3, y3, z3);
        indices.push(l, l + 1, l + 2);
        indices.push(l, l + 2, l + 3);
    }
    else {
        indices.push(i0, i1, i2);
        indices.push(i0, i2, i3);
    }
}
function CreatePlaqueVertexData(w, h, m) {
    let plaqueData = new BABYLON.VertexData();
    let positions = [];
    let indices = [];
    let uvs = [];
    let xs = [0, m, w - m, w];
    let zs = [0, m, h - m, h];
    for (let j = 0; j < 4; j++) {
        for (let i = 0; i < 4; i++) {
            let l = positions.length / 3;
            let y = 0;
            if (i > 0 && i < 3 && j > 0 && j < 3) {
                y = m;
            }
            positions.push(xs[i], y, zs[j]);
            if (i < 3 && j < 3) {
                if (i === 0 && j === 2 || i === 2 && j === 0) {
                    indices.push(l, l + 1, l + 4);
                    indices.push(l + 4, l + 1, l + 1 + 4);
                }
                else {
                    indices.push(l, l + 1, l + 1 + 4);
                    indices.push(l, l + 1 + 4, l + 4);
                }
            }
            uvs.push(xs[i] / w, zs[j] / h);
        }
    }
    plaqueData.positions = positions;
    plaqueData.indices = indices;
    plaqueData.uvs = uvs;
    let normals = [];
    BABYLON.VertexData.ComputeNormals(positions, indices, normals);
    plaqueData.normals = normals;
    Mummu.TranslateVertexDataInPlace(plaqueData, new BABYLON.Vector3(-w * 0.5, 0, -h * 0.5));
    return plaqueData;
}
function CreateBoxFrameVertexData(props) {
    if (!isFinite(props.w)) {
        props.w = 1;
    }
    if (!isFinite(props.wBase)) {
        props.wBase = props.w;
    }
    if (!isFinite(props.wTop)) {
        props.wTop = props.w;
    }
    if (!isFinite(props.h)) {
        props.h = props.w;
    }
    if (!isFinite(props.d)) {
        props.d = 1;
    }
    if (!isFinite(props.dBase)) {
        props.dBase = props.d;
    }
    if (!isFinite(props.dTop)) {
        props.dTop = props.d;
    }
    if (!isFinite(props.thickness)) {
        props.thickness = props.w * 0.1;
    }
    if (!isFinite(props.innerHeight)) {
        props.innerHeight = props.h * 0.25;
    }
    let w2 = props.w / 2;
    let wBase2 = props.wBase / 2;
    let wTop2 = props.wTop / 2;
    let d2 = props.d / 2;
    let dBase2 = props.dBase / 2;
    let dTop2 = props.dTop / 2;
    let h = props.h;
    let t = props.thickness;
    let hh = props.innerHeight;
    let positions = [
        -wBase2, 0, -dBase2,
        wBase2, 0, -dBase2,
        wBase2, 0, dBase2,
        -wBase2, 0, dBase2,
        -w2, h, -d2,
        w2, h, -d2,
        w2, h, d2,
        -w2, h, d2,
        -w2 + t, h, -d2 + t,
        w2 - t, h, -d2 + t,
        w2 - t, h, d2 - t,
        -w2 + t, h, d2 - t,
        -wTop2 + t, h - hh, -dTop2 + t,
        wTop2 - t, h - hh, -dTop2 + t,
        wTop2 - t, h - hh, dTop2 - t,
        -wTop2 + t, h - hh, dTop2 - t
    ];
    let normalVec3s = [];
    let n0 = new BABYLON.Vector3(-1, props.bottomCap ? -1 : 0, -1);
    let n4 = new BABYLON.Vector3(-1, 1, -1);
    let n8 = new BABYLON.Vector3(1, 1, 1);
    let n12 = new BABYLON.Vector3(1, props.topCap ? 1 : 0, 1);
    normalVec3s.push(n0);
    normalVec3s.push(Mummu.Rotate(n0, BABYLON.Axis.Y, -Math.PI * 0.5 * 1));
    normalVec3s.push(Mummu.Rotate(n0, BABYLON.Axis.Y, -Math.PI * 0.5 * 2));
    normalVec3s.push(Mummu.Rotate(n0, BABYLON.Axis.Y, -Math.PI * 0.5 * 3));
    normalVec3s.push(n4);
    normalVec3s.push(Mummu.Rotate(n4, BABYLON.Axis.Y, -Math.PI * 0.5 * 1));
    normalVec3s.push(Mummu.Rotate(n4, BABYLON.Axis.Y, -Math.PI * 0.5 * 2));
    normalVec3s.push(Mummu.Rotate(n4, BABYLON.Axis.Y, -Math.PI * 0.5 * 3));
    normalVec3s.push(n8);
    normalVec3s.push(Mummu.Rotate(n8, BABYLON.Axis.Y, -Math.PI * 0.5 * 1));
    normalVec3s.push(Mummu.Rotate(n8, BABYLON.Axis.Y, -Math.PI * 0.5 * 2));
    normalVec3s.push(Mummu.Rotate(n8, BABYLON.Axis.Y, -Math.PI * 0.5 * 3));
    normalVec3s.push(n12);
    normalVec3s.push(Mummu.Rotate(n12, BABYLON.Axis.Y, -Math.PI * 0.5 * 1));
    normalVec3s.push(Mummu.Rotate(n12, BABYLON.Axis.Y, -Math.PI * 0.5 * 2));
    normalVec3s.push(Mummu.Rotate(n12, BABYLON.Axis.Y, -Math.PI * 0.5 * 3));
    let normals = [];
    for (let i = 0; i < normalVec3s.length; i++) {
        normalVec3s[i].normalize();
        normals.push(normalVec3s[i].x, normalVec3s[i].y, normalVec3s[i].z);
    }
    let basePositions = undefined;
    if (props.flatShading) {
        basePositions = [...positions];
        positions = [];
    }
    let indices = [];
    MakeQuad(0, 1, 5, 4, indices, basePositions, positions);
    MakeQuad(1, 2, 6, 5, indices, basePositions, positions);
    MakeQuad(2, 3, 7, 6, indices, basePositions, positions);
    MakeQuad(3, 0, 4, 7, indices, basePositions, positions);
    MakeQuad(4, 5, 9, 8, indices, basePositions, positions);
    MakeQuad(5, 6, 10, 9, indices, basePositions, positions);
    MakeQuad(6, 7, 11, 10, indices, basePositions, positions);
    MakeQuad(7, 4, 8, 11, indices, basePositions, positions);
    MakeQuad(8, 9, 13, 12, indices, basePositions, positions);
    MakeQuad(9, 10, 14, 13, indices, basePositions, positions);
    MakeQuad(10, 11, 15, 14, indices, basePositions, positions);
    MakeQuad(11, 8, 12, 15, indices, basePositions, positions);
    if (props.bottomCap) {
        MakeQuad(0, 3, 2, 1, indices, basePositions, positions);
    }
    if (props.topCap) {
        MakeQuad(12, 13, 14, 15, indices, basePositions, positions);
    }
    if (props.flatShading) {
        normals = [];
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
    }
    let colors = [];
    for (let i = 0; i < positions.length / 3; i++) {
        let y = positions[3 * i + 1];
        if (props.topCapColor && y === props.h - props.innerHeight) {
            colors.push(...props.topCapColor.asArray());
        }
        else {
            colors.push(1, 1, 1, 1);
        }
    }
    let vertexData = new BABYLON.VertexData();
    vertexData.positions = positions;
    vertexData.indices = indices;
    vertexData.normals = normals;
    vertexData.colors = colors;
    return vertexData;
}
function CreateTrailVertexData(props) {
    let data = new BABYLON.VertexData();
    let positions = [];
    let normals = [];
    let indices = [];
    let uvs = [];
    let path = [...props.path];
    let up = BABYLON.Vector3.Up();
    if (props.up) {
        up.copyFrom(props.up);
    }
    let n = path.length;
    let directions = [];
    let prev = path[0];
    let next = path[1];
    directions[0] = next.subtract(prev).normalize();
    for (let i = 1; i < n - 1; i++) {
        let prev = path[i - 1];
        let next = path[i + 1];
        directions[i] = next.subtract(prev).normalize();
    }
    prev = path[n - 2];
    next = path[n - 1];
    directions[n - 1] = next.subtract(prev).normalize();
    let cumulLength = 0;
    for (let i = 0; i < n; i++) {
        let p = path[i];
        if (i > 0) {
            cumulLength += BABYLON.Vector3.Distance(p, path[i - 1]);
        }
        let dir = directions[i];
        let xDir = BABYLON.Vector3.Cross(up, dir).normalize();
        let normal = BABYLON.Vector3.Cross(dir, xDir).normalize();
        let r = props.radius;
        if (props.radiusFunc) {
            r = props.radiusFunc(i / (n - 1));
        }
        let l = positions.length / 3;
        positions.push(p.x + xDir.x * r, p.y + xDir.y * r, p.z + xDir.z * r);
        positions.push(p.x - xDir.x * r, p.y - xDir.y * r, p.z - xDir.z * r);
        if (i < n - 1) {
            indices.push(l, l + 2, l + 1);
            indices.push(l + 1, l + 2, l + 3);
        }
        normals.push(normal.x, normal.y, normal.z);
        normals.push(normal.x, normal.y, normal.z);
        uvs.push(1, i / (n - 1));
        uvs.push(0, i / (n - 1));
    }
    data.positions = positions;
    data.indices = indices;
    data.normals = normals;
    data.uvs = uvs;
    if (props.color) {
        let colors = [];
        let colArray = props.color.asArray();
        for (let i = 0; i < positions.length / 3; i++) {
            colors.push(...colArray);
        }
        data.colors = colors;
    }
    return data;
}
function CreateBiDiscVertexData(props) {
    let data = new BABYLON.VertexData();
    let positions = [];
    let normals = [];
    let indices = [];
    let uvs = [];
    let r1 = props.r1;
    let r2 = props.r2;
    let d = BABYLON.Vector3.Distance(props.p1, props.p2);
    let alpha = 0;
    if (d + r2 > r1) {
        alpha = Math.acos((r1 - r2) / d);
    }
    positions.push(0, 0, 0);
    let count1 = Math.round((2 * Math.PI - 2 * alpha) / (Math.PI / 32));
    let dA1 = (2 * Math.PI - 2 * alpha) / count1;
    for (let n = 0; n <= count1; n++) {
        let l = positions.length / 3;
        let a = Math.PI - alpha - n * dA1;
        let x = Math.cos(a) * r1;
        let z = Math.sin(a) * r1;
        positions.push(x, 0, z);
        if (n < count1) {
            indices.push(0, l + 1, l);
        }
    }
    if (alpha > 0) {
        let indexC2 = positions.length / 3;
        indices.push(indexC2, 0, 1);
        indices.push(indexC2, indexC2 - 1, 0);
        indices.push(indexC2, indexC2 + 1, indexC2 - 1);
        positions.push(-d, 0, 0);
        let count2 = Math.round((2 * alpha) / (Math.PI / 32));
        let dA2 = (2 * alpha) / count2;
        for (let n = 0; n <= count2; n++) {
            let l = positions.length / 3;
            let a = Math.PI + alpha - n * dA2;
            let x = -d + Math.cos(a) * r2;
            let z = Math.sin(a) * r2;
            positions.push(x, 0, z);
            if (n < count2) {
                indices.push(indexC2, l + 1, l);
            }
        }
        indices.push(positions.length / 3 - 1, indexC2, 1);
    }
    data.positions = positions;
    data.indices = indices;
    for (let i = 0; i < positions.length / 3; i++) {
        normals.push(0, 1, 0);
    }
    data.normals = normals;
    data.uvs = uvs;
    if (props.color) {
        let colors = [];
        let colArray = props.color.asArray();
        for (let i = 0; i < positions.length / 3; i++) {
            colors.push(...colArray);
        }
        data.colors = colors;
    }
    if (d + r2 > r1) {
        let rot = Mummu.AngleFromToAround(new BABYLON.Vector3(-1, 0, 0), props.p2.subtract(props.p1), BABYLON.Axis.Y);
        Mummu.RotateAngleAxisVertexDataInPlace(data, rot, BABYLON.Axis.Y);
    }
    Mummu.TranslateVertexDataInPlace(data, props.p1);
    return data;
}
