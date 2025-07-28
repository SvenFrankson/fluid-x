var BallState;
(function (BallState) {
    BallState[BallState["Ready"] = 0] = "Ready";
    BallState[BallState["Move"] = 1] = "Move";
    BallState[BallState["Fall"] = 2] = "Fall";
    BallState[BallState["Split"] = 3] = "Split";
    BallState[BallState["Flybacking"] = 4] = "Flybacking";
    BallState[BallState["Wining"] = 5] = "Wining";
    BallState[BallState["Done"] = 6] = "Done";
})(BallState || (BallState = {}));
class Ball extends BABYLON.Mesh {
    constructor(puzzle, props, ballIndex = 0) {
        super("ball");
        this.puzzle = puzzle;
        this.ballIndex = ballIndex;
        this.ballState = BallState.Ready;
        this.fallTimer = 0;
        this.trailColor = new BABYLON.Color4(0, 0, 0, 0);
        this.canBoost = true;
        this._boost = false;
        this.nominalSpeed = 2.3;
        this.vZ = 1;
        this.radius = 0.25;
        this.bounceXDelay = 0.93;
        this.bounceXDelayWall = 0.7;
        this.xForceAccelDelay = 0.8 * this.bounceXDelay;
        this._loseTimout = 0;
        this.isControlLocked = false;
        this._lockControlTimout = 0;
        this.leftPressed = 0;
        this.rightPressed = 0;
        this.upPressed = 0;
        this.downPressed = 0;
        this.animateSpeed = Mummu.AnimationFactory.EmptyNumberCallback;
        this.mouseInControl = false;
        this._pointerDown = false;
        this.pointerDown = (ev) => {
            if (this.game.mode === GameMode.Preplay) {
                if (!this.game.router.tutoPage.shown) {
                    this.puzzle.skipIntro();
                    this.lockControl(0.2);
                }
            }
        };
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
        this.dumdumFactor = 1;
        this.dumdumFactorTarget = 1;
        this.moveDir = BABYLON.Vector3.Forward();
        this.smoothedMoveDir = BABYLON.Vector3.Forward();
        this.inputSpeed = 1000;
        this.bounceXValue = 0;
        this.bounceXTimer = 0;
        this.trailTimer = 0;
        this.trailPoints = [];
        this.trailPointColors = [];
        this.animPos = Mummu.AnimationFactory.EmptyVector3Callback;
        this.animWinTrailRadius = Mummu.AnimationFactory.EmptyNumberCallback;
        this.animRotX = Mummu.AnimationFactory.EmptyNumberCallback;
        this.animRotY = Mummu.AnimationFactory.EmptyNumberCallback;
        this.animRotZ = Mummu.AnimationFactory.EmptyNumberCallback;
        this.winTrailPos0 = BABYLON.Vector3.Zero();
        this.winTrailPos1 = BABYLON.Vector3.Zero();
        this.winTrailPoints0 = [];
        this.winTrailPoints1 = [];
        this._shadowGroundY = 0;
        this.winTrailRadius = 0.5;
        this._winTrailTimer = 0;
        this._updateWin = () => {
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
                let pt1 = new BABYLON.Vector3(-1, 0, -1).normalize();
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
        };
        this.winIndex = 0;
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
                });
                inputLeft.addEventListener("pointerup", () => {
                    this.mouseInControl = false;
                    this.leftPressed = 0;
                });
            }
            let inputRight = document.querySelector("#input-right");
            if (inputRight) {
                inputRight.addEventListener("pointerdown", () => {
                    this.mouseInControl = false;
                    this.rightPressed = 1;
                });
                inputRight.addEventListener("pointerup", () => {
                    this.mouseInControl = false;
                    this.rightPressed = 0;
                });
            }
            let inputBoost = document.querySelector("#input-boost");
            inputBoost.addEventListener("pointerdown", () => {
                if (this.boost) {
                    this.boost = false;
                }
                else {
                    this.boost = true;
                }
                this.puzzle.puzzleUI.boostLabel.style.opacity = "0";
            });
            this.game.canvas.addEventListener("pointerdown", this.pointerDown);
            document.addEventListener("keydown", (ev) => {
                if (ev.code === "KeyW") {
                    if (this.wasdCanControl) {
                        if (this.mouseCanControl) {
                            this.mouseInControl = false;
                        }
                        this.boost = true;
                    }
                }
                if (ev.code === "ArrowUp") {
                    if (this.arrowCanControl) {
                        if (this.mouseCanControl) {
                            this.mouseInControl = false;
                        }
                        this.boost = true;
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
                        this.boost = true;
                    }
                }
                if (ev.code === "ArrowDown") {
                    if (this.arrowCanControl) {
                        if (this.mouseCanControl) {
                            this.mouseInControl = false;
                        }
                        this.boost = true;
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
                        this.puzzle.puzzleUI.boostLabel.style.opacity = "0";
                        this.boost = true;
                    }
                }
            });
            document.addEventListener("keyup", (ev) => {
                if (ev.code === "KeyW") {
                    if (this.wasdCanControl) {
                        if (this.mouseCanControl) {
                            this.mouseInControl = false;
                        }
                        this.boost = false;
                    }
                }
                if (ev.code === "ArrowUp") {
                    if (this.arrowCanControl) {
                        if (this.mouseCanControl) {
                            this.mouseInControl = false;
                        }
                        this.boost = false;
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
                        this.boost = false;
                    }
                }
                if (ev.code === "ArrowDown") {
                    if (this.arrowCanControl) {
                        if (this.mouseCanControl) {
                            this.mouseInControl = false;
                        }
                        this.boost = false;
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
                        this.puzzle.puzzleUI.boostLabel.style.opacity = "0";
                        this.boost = false;
                    }
                }
            });
        }
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
    get boost() {
        return this._boost;
    }
    set boost(v) {
        this._boost = v;
        this.shadow.material = this._boost ? this.game.materials.lightDiscMaterial : this.game.materials.shadowDiscMaterial;
        let inputBoost = document.querySelector("#input-boost");
        if (inputBoost) {
            if (this._boost) {
                inputBoost.classList.add("active");
            }
            else {
                inputBoost.classList.remove("active");
            }
        }
    }
    lockControl(duration = 0.2) {
        clearTimeout(this._lockControlTimout);
        this.isControlLocked = true;
        this._lockControlTimout = setTimeout(() => {
            this.isControlLocked = false;
        }, duration * 1000);
    }
    setColor(color, delay = 0) {
        this.color = color;
        if (delay === 0) {
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
        else {
            setTimeout(() => {
                if (this.ballTop) {
                    this.ballTop.material = this.game.materials.tileColorShinyMaterials[this.color];
                }
                if (this.leftTop) {
                    this.leftTop.material = this.game.materials.tileColorShinyMaterials[this.color];
                }
                if (this.rightTop) {
                    this.rightTop.material = this.game.materials.tileColorShinyMaterials[this.color];
                }
            }, delay);
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
    connectMouse() {
        this.game.canvas.addEventListener("pointerdown", this.mouseDown);
        this.game.canvas.addEventListener("pointerup", this.mouseUp);
        this.game.canvas.addEventListener("pointerleave", this.mouseUp);
        this.game.canvas.addEventListener("pointerout", this.mouseUp);
    }
    get wasdCanControl() {
        return this.puzzle.ballsCount === 1 || this.ballIndex === 0;
    }
    get arrowCanControl() {
        return this.puzzle.ballsCount === 1 || this.ballIndex === 1;
    }
    get mouseCanControl() {
        return (IsTouchScreen === 0) && (this.puzzle.ballsCount === 1 || this.ballIndex === 0);
    }
    async instantiate() {
        //await RandomWait();
        let ballDatas;
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
    get boostedSpeed() {
        return this.speed * this.dumdumFactor;
    }
    update(dt) {
        if (this.mouseCanControl && this.mouseInControl) {
            this.rightPressed = 0;
            this.leftPressed = 0;
            this.upPressed = 0;
            this.downPressed = 0;
            if (this._pointerDown) {
                let pick = this.game.scene.pick(this.game.scene.pointerX * window.devicePixelRatio, this.game.scene.pointerY * window.devicePixelRatio, (mesh) => {
                    return mesh.name === "floor" || mesh.name === "building-floor" || mesh === this.puzzle.invisiFloorTM;
                });
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
                    let last = this.trailPoints[this.trailPoints.length - 1];
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
                    let colors = [];
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
            let speed;
            if (!this.water) {
                this.moveDir.copyFromFloats(this.xForce * vX * (1.2 - 2 * this.radius) / 0.55, 0, this.vZ).normalize();
                speed = this.moveDir.scale(this.boostedSpeed);
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
                this.bounceXValue = -1;
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
                                        this.bounceXValue = -1;
                                        this.bounceXTimer = this.bounceXDelayWall;
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
                            else if (tile instanceof Nobori) {
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
                                                this.bounceXValue = -1;
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
                                                if (tile.color != this.color) {
                                                    tile.shoot(this, 0.5).then(() => {
                                                        let explosionFire = new Explosion(this.game);
                                                        explosionFire.origin.copyFrom(this.absolutePosition).addInPlaceFromFloats(0, 0.2, 0);
                                                        explosionFire.setRadius(0.4);
                                                        explosionFire.color = this.game.materials.colorMaterials[this.color].diffuseColor;
                                                        explosionFire.lifespan = 0.5;
                                                        explosionFire.tZero = 0.45;
                                                        explosionFire.boom();
                                                        this.puzzle.wiishSound.play();
                                                    });
                                                    this.setColor(tile.color, 500);
                                                }
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
                                                });
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
    split() {
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
    reset() {
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
    async animStand(duration) {
        let standingP = this.animContainer.position.clone();
        standingP.y += 0.1;
        standingP.z -= 0.3;
        let r = this.animContainer.rotation.x - Math.PI * 0.5;
        this.animRotX(r, duration, Nabu.Easing.easeInSine);
        await this.animPos(standingP, duration, Nabu.Easing.easeInSine);
        //this.sparkle();
    }
    async animSit(duration) {
        let sitP = this.animContainer.position.clone();
        sitP.y -= 0.1;
        sitP.z += 0.3;
        let r = this.animContainer.rotation.x + Math.PI * 0.5;
        this.animRotX(r, duration, Nabu.Easing.easeInSine);
        await this.animPos(sitP, duration, Nabu.Easing.easeInSine);
        //this.sparkle();
    }
    async backFlip(turns, duration) {
        let r = this.animContainer.rotation.x + turns * 2 * Math.PI;
        setTimeout(() => {
            this.puzzle.wiishSound.play();
        }, duration * 100);
        await this.animRotX(r, duration, Nabu.Easing.easeInOutSine);
    }
    async frontFlip(turns, duration) {
        let r = this.animContainer.rotation.x - turns * 2 * Math.PI;
        setTimeout(() => {
            this.puzzle.wiishSound.play();
        }, duration * 100);
        await this.animRotX(r, duration, Nabu.Easing.easeInOutSine);
    }
    async spin(turns, duration) {
        let r = this.animContainer.rotation.y + turns * 2 * Math.PI;
        setTimeout(() => {
            this.puzzle.wiishSound.play();
        }, duration * 100);
        await this.animRotY(r, duration, Nabu.Easing.easeInOutSine);
    }
    async jump(h, duration) {
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
    sparkle(color = BABYLON.Color3.FromHexString("#ffffff")) {
        let explosionFire = new Explosion(this.game);
        explosionFire.origin.copyFrom(this.absolutePosition);
        explosionFire.setRadius(0.4);
        explosionFire.color = color;
        explosionFire.lifespan = 1;
        explosionFire.tZero = 1.1;
        explosionFire.boom();
    }
    async popWinTrailRadius(duration) {
        this.winTrailRadius = 0.4;
        await this.animWinTrailRadius(0.8, duration * 0.5, Nabu.Easing.easeOutCubic);
        await this.animWinTrailRadius(0.4, duration * 0.5, Nabu.Easing.easeInCubic);
    }
    async winAnimation() {
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
        if (this.ballState != BallState.Wining) {
            return;
        }
        this.killWinAnim();
    }
    killWinAnim() {
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
    async win1() {
        let wait = Mummu.AnimationFactory.CreateWait(this);
        this.popWinTrailRadius(3.5);
        await this.animStand(0.5);
        if (this.ballState != BallState.Wining) {
            return;
        }
        this.popWinTrailRadius(2);
        let d = 1.2;
        this.jump(2.5, d);
        await wait(0.2 * d);
        if (this.ballState != BallState.Wining) {
            return;
        }
        await this.backFlip(2, 0.8 * d);
        if (this.ballState != BallState.Wining) {
            return;
        }
        this.sparkle();
        d = 0.8;
        this.jump(1.5, d);
        await wait(0.2 * d);
        if (this.ballState != BallState.Wining) {
            return;
        }
        await this.frontFlip(1, 0.8 * d);
        if (this.ballState != BallState.Wining) {
            return;
        }
        this.sparkle();
        await this.animSit(0.5);
        if (this.ballState != BallState.Wining) {
            return;
        }
    }
    async win2() {
        let wait = Mummu.AnimationFactory.CreateWait(this);
        await this.animStand(0.5);
        if (this.ballState != BallState.Wining) {
            return;
        }
        this.popWinTrailRadius(2);
        let d = 1.2;
        this.jump(2.5, d);
        await wait(0.2 * d);
        if (this.ballState != BallState.Wining) {
            return;
        }
        await this.spin(2, 0.8 * d);
        if (this.ballState != BallState.Wining) {
            return;
        }
        this.sparkle();
        d = 0.8;
        this.jump(1.5, d);
        await wait(0.2 * d);
        if (this.ballState != BallState.Wining) {
            return;
        }
        await this.spin(1, 0.8 * d);
        if (this.ballState != BallState.Wining) {
            return;
        }
        this.sparkle();
        await this.animSit(0.5);
    }
    async win3() {
        let wait = Mummu.AnimationFactory.CreateWait(this);
        await wait(0.5);
        if (this.ballState != BallState.Wining) {
            return;
        }
        this.popWinTrailRadius(2);
        let d = 1.2;
        this.jump(2.5, d);
        await wait(0.2 * d);
        if (this.ballState != BallState.Wining) {
            return;
        }
        await this.backFlip(2, 0.8 * d);
        if (this.ballState != BallState.Wining) {
            return;
        }
        this.sparkle();
        d = 0.8;
        this.jump(1.5, d);
        await wait(0.2 * d);
        if (this.ballState != BallState.Wining) {
            return;
        }
        await this.frontFlip(1, 0.8 * d);
        if (this.ballState != BallState.Wining) {
            return;
        }
        this.sparkle();
        await wait(0.5);
        if (this.ballState != BallState.Wining) {
            return;
        }
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
            this.shadow.material = this.game.materials.shadow9Material;
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
        //await RandomWait();
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
    async bump(duration = 0.2) {
        //await RandomWait();
        await this.animateSize(1.1, duration * 0.5);
        await this.animateSize(1, duration * 0.5);
    }
    async shrink() {
        //await RandomWait();
        await this.animateSize(1.1, 0.1, Nabu.Easing.easeOutSine);
        await this.animateSize(0.4, 0.3, Nabu.Easing.easeInSine);
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
        starTop.material = this.game.materials.tileColorMaterials[this.color];
        star.scaling.copyFromFloats(0.4, 0.4, 0.4);
        let tail;
        let tailPoints;
        if (this.game.performanceWatcher.worst > 24) {
            tail = new BABYLON.Mesh("tail");
            tail.visibility = 1;
            tail.material = this.game.materials.tileStarTailMaterial;
            tailPoints = [];
        }
        this.game.puzzle.wooshSound.play();
        let t0 = performance.now();
        let duration = 1.5;
        let step = () => {
            if (star.isDisposed()) {
                if (tail) {
                    tail.dispose();
                    return;
                }
            }
            let f = (performance.now() - t0) / 1000 / duration;
            if (f < 1) {
                f = Nabu.Easing.easeOutSine(f);
                Mummu.EvaluatePathToRef(f, path, star.position);
                star.rotation.y = f * 2 * Math.PI;
                if (tail) {
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
                }
                requestAnimationFrame(step);
            }
            else {
                if (tail) {
                    tail.dispose();
                }
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
                    flash.material = this.game.materials.whiteShadow9Material;
                    flash.parent = star;
                    flash.position.y = 0.29;
                    flash.rotation.x = Math.PI * 0.5;
                    SineFlashVisibility(flash, 0.3).then(() => {
                        flash.dispose();
                    });
                    this.game.puzzle.clicSound.play();
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
        this.material = this.game.materials.brownMaterial;
        this.tileTop = new BABYLON.Mesh("tile-top");
        this.tileTop.parent = this;
        this.tileTop.material = this.game.materials.tileColorMaterials[this.color];
        this.renderOutline = true;
        this.outlineColor = BABYLON.Color3.Black();
        this.outlineWidth = 0.02;
        this.game.puzzle.blockTiles.push(this);
    }
    async instantiate() {
        //await RandomWait();
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
    dispose() {
        let index = this.game.puzzle.blockTiles.indexOf(this);
        if (index != -1) {
            this.game.puzzle.blockTiles.splice(index, 1);
        }
        super.dispose();
    }
}
class Border {
    constructor(game, ghost = false) {
        this.game = game;
        this.ghost = ghost;
        this.position = BABYLON.Vector3.Zero();
        this.rotationY = 0;
        this.w = 0;
        this.d = 1;
    }
    get vertical() {
        return this.rotationY === 0;
    }
    set vertical(v) {
        this.rotationY = v ? 0 : Math.PI * 0.5;
        this.w = v ? 0 : 1;
        this.d = v ? 1 : 0;
    }
    get i() {
        if (this.vertical) {
            return Math.floor(this.position.x / 1.1);
        }
        else {
            return Math.round(this.position.x / 1.1);
        }
    }
    get j() {
        if (this.vertical) {
            return Math.round(this.position.z / 1.1);
        }
        else {
            return Math.floor(this.position.z / 1.1);
        }
    }
    static BorderLeft(game, i, j, y = 0, ghost = false) {
        let border = new Border(game, ghost);
        border.position.x = (i - 0.5) * 1.1;
        border.position.y = y;
        border.position.z = j * 1.1;
        border.game.puzzle.updateGriddedBorderStack(border, true);
        //let haikuDebug = new HaikuDebug(game, border.i + " " + border.j);
        //haikuDebug.position.copyFrom(border.position);
        //haikuDebug.position.y += 0.5;
        return border;
    }
    static BorderRight(game, i, j, y = 0, ghost = false) {
        let border = new Border(game, ghost);
        border.position.x = (i + 0.5) * 1.1;
        border.position.y = y;
        border.position.z = j * 1.1;
        border.game.puzzle.updateGriddedBorderStack(border, true);
        //let haikuDebug = new HaikuDebug(game, border.i + " " + border.j);
        //haikuDebug.position.copyFrom(border.position);
        //haikuDebug.position.y += 0.5;
        return border;
    }
    static BorderTop(game, i, j, y = 0, ghost = false) {
        let border = new Border(game, ghost);
        border.vertical = false;
        border.position.x = i * 1.1;
        border.position.y = y;
        border.position.z = (j + 0.5) * 1.1;
        border.game.puzzle.updateGriddedBorderStack(border, true);
        //let haikuDebug = new HaikuDebug(game, border.i + " " + border.j);
        //haikuDebug.position.copyFrom(border.position);
        //haikuDebug.position.y += 0.5;
        return border;
    }
    static BorderBottom(game, i, j, y = 0, ghost = false) {
        let border = new Border(game, ghost);
        border.vertical = false;
        border.position.x = i * 1.1;
        border.position.y = y;
        border.position.z = (j - 0.5) * 1.1;
        border.game.puzzle.updateGriddedBorderStack(border, true);
        //let haikuDebug = new HaikuDebug(game, border.i + " " + border.j);
        //haikuDebug.position.copyFrom(border.position);
        //haikuDebug.position.y += 0.5;
        return border;
    }
    async getVertexData() {
        //await RandomWait();
        if (!this.ghost) {
            let borderDatas = await this.game.vertexDataLoader.get("./datas/meshes/border.babylon");
            if (this.vertical) {
                let jPlusStack = this.game.puzzle.getGriddedBorderStack(this.i, this.j + 1);
                let jPlusConn = jPlusStack && jPlusStack.array.find(brd => { return brd.position.y === this.position.y && brd.vertical === this.vertical; });
                let jMinusStack = this.game.puzzle.getGriddedBorderStack(this.i, this.j - 1);
                let jMinusConn = jMinusStack && jMinusStack.array.find(brd => { return brd.position.y === this.position.y && brd.vertical === this.vertical; });
                if (jPlusConn && jMinusConn) {
                    return Mummu.CloneVertexData(borderDatas[0]);
                }
                else if (jPlusConn) {
                    return Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(borderDatas[3]), Math.PI, BABYLON.Axis.Y);
                }
                else if (jMinusConn) {
                    return Mummu.CloneVertexData(borderDatas[3]);
                }
                else {
                    return Mummu.CloneVertexData(borderDatas[4]);
                }
            }
            else {
                let iPlusStack = this.game.puzzle.getGriddedBorderStack(this.i + 1, this.j);
                let iPlusConn = iPlusStack && iPlusStack.array.find(brd => { return brd.position.y === this.position.y && !brd.vertical; });
                let iMinusStack = this.game.puzzle.getGriddedBorderStack(this.i - 1, this.j);
                let iMinusConn = iMinusStack && iMinusStack.array.find(brd => { return brd.position.y === this.position.y && !brd.vertical; });
                if (iPlusConn && iMinusConn) {
                    return Mummu.CloneVertexData(borderDatas[0]);
                }
                else if (iPlusConn) {
                    return Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(borderDatas[1]), Math.PI, BABYLON.Axis.Y);
                }
                else if (iMinusConn) {
                    return Mummu.CloneVertexData(borderDatas[1]);
                }
                else {
                    return Mummu.CloneVertexData(borderDatas[2]);
                }
            }
        }
    }
    dispose() {
        this.game.puzzle.removeFromGriddedBorderStack(this);
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
        this.parent = this.game.puzzle.buildingsContainer;
        this.floor = new BABYLON.Mesh("building-floor");
        this.floor.parent = this;
        this.floor.material = this.game.materials.woodFloorMaterial;
        this.shadow = new BABYLON.Mesh("shadow");
        this.shadow.position.y = 0.005;
        this.shadow.parent = this;
        this.shadow.material = this.game.materials.shadow9Material;
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
        this.w = 2;
        this.material = this.game.materials.brickWallMaterial;
        if (props.size) {
            this.w = props.size;
        }
        this.builtInBorderLeft = new BABYLON.Mesh("ramp-border");
        this.builtInBorderLeft.position.x = -0.55;
        this.builtInBorderLeft.parent = this;
        this.builtInBorderLeft.material = this.game.materials.borderMaterial;
        this.builtInBorderLeft.renderOutline = true;
        this.builtInBorderLeft.outlineColor = BABYLON.Color3.Black();
        this.builtInBorderLeft.outlineWidth = 0.01;
        this.builtInBorderRight = new BABYLON.Mesh("ramp-border");
        this.builtInBorderRight.position.x = (this.w - 0.5) * 1.1;
        this.builtInBorderRight.parent = this;
        this.builtInBorderRight.material = this.game.materials.borderMaterial;
        this.builtInBorderRight.renderOutline = true;
        this.builtInBorderRight.outlineColor = BABYLON.Color3.Black();
        this.builtInBorderRight.outlineWidth = 0.01;
    }
    fillHeightmap() {
        for (let ii = 0; ii < this.w; ii++) {
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
        let hideUpperSideBorderLeft = true;
        if (this.puzzle.hMapGet(this.i - 1, this.j + 2) === 1) {
            hideUpperSideBorderLeft = false;
        }
        this.borders.push(Border.BorderLeft(this.game, this.i, this.j + 2, 1, hideUpperSideBorderLeft));
        this.borders.push(Border.BorderRight(this.game, this.i + this.w - 1, this.j, 0, true));
        this.borders.push(Border.BorderRight(this.game, this.i + this.w - 1, this.j + 1, 0.5, true));
        this.borders.push(Border.BorderRight(this.game, this.i + this.w - 1, this.j + 2, 0, true));
        let hideUpperSideBorderRight = true;
        if (this.puzzle.hMapGet(this.i + this.w, this.j + 2) === 1) {
            hideUpperSideBorderRight = false;
        }
        this.borders.push(Border.BorderRight(this.game, this.i + this.w - 1, this.j + 2, 1, hideUpperSideBorderRight));
        for (let i = 0; i < this.w; i++) {
            this.borders.push(Border.BorderTop(this.game, this.i + i, this.j + 2, 0, true));
        }
        this.props.borderLeft = true;
        this.props.borderRight = true;
        /*
        if (this.puzzle.hMapGet(this.i, this.j + 2) != 1 || this.puzzle.hMapGet(this.i + 1, this.j + 2) != 1) {
            this.props.borderTop = true;
            this.borders.push(Border.BorderTop(this.game, this.i, this.j + 2, 1));
            this.borders.push(Border.BorderTop(this.game, this.i + 1, this.j + 2, 1));
        }
        */
    }
    async instantiate() {
        let data = await this.game.vertexDataLoader.get("./datas/meshes/ramp.babylon");
        let wallData = Mummu.CloneVertexData(data[0]);
        let floorData = Mummu.CloneVertexData(data[1]);
        for (let i = 0; i < wallData.positions.length / 3; i++) {
            let x = wallData.positions[3 * i];
            if (x > 0) {
                wallData.positions[3 * i] = x + 1.1 * (this.w - 2);
            }
        }
        for (let i = 0; i < floorData.positions.length / 3; i++) {
            let x = floorData.positions[3 * i];
            if (x > 0) {
                floorData.positions[3 * i] = x + 1.1 * (this.w - 2);
            }
        }
        wallData.applyToMesh(this);
        for (let i = 0; i < floorData.positions.length / 3; i++) {
            floorData.uvs[2 * i] = 0.55 * (floorData.positions[3 * i] + this.position.x);
            floorData.uvs[2 * i + 1] = 0.55 * (floorData.positions[3 * i + 2] + this.position.z);
        }
        floorData.applyToMesh(this.floor);
        let showLeftBorder = true;
        for (let j = 0; j < 3; j++) {
            let rampH = (j + 1) / 3;
            let puzzleH = this.puzzle.hMapGet(this.i - 1, this.j + j);
            if (puzzleH > rampH) {
                showLeftBorder = false;
            }
        }
        if (showLeftBorder) {
            let jPlusLeftStack = this.game.puzzle.getGriddedBorderStack(this.i - 1, this.j + 3);
            let jPlusLeftConn = jPlusLeftStack && jPlusLeftStack.array.find(brd => { return brd.position.y === this.position.y + 1 && brd.vertical === true; });
            if (jPlusLeftConn) {
                data[2].applyToMesh(this.builtInBorderLeft);
            }
            else {
                data[3].applyToMesh(this.builtInBorderLeft);
            }
        }
        let showRightBorder = true;
        for (let j = 0; j < 3; j++) {
            let rampH = (j + 1) / 3;
            let puzzleH = this.puzzle.hMapGet(this.i + this.w, this.j + j);
            if (puzzleH > rampH) {
                showRightBorder = false;
            }
        }
        if (showRightBorder) {
            let jPlusRightStack = this.game.puzzle.getGriddedBorderStack(this.i + this.w - 1, this.j + 3);
            let jPlusRightConn = jPlusRightStack && jPlusRightStack.array.find(brd => { return brd.position.y === this.position.y + 1 && brd.vertical === true; });
            if (jPlusRightConn) {
                data[2].applyToMesh(this.builtInBorderRight);
            }
            else {
                data[3].applyToMesh(this.builtInBorderRight);
            }
        }
        let m = 0.2;
        let shadowData = Mummu.Create9SliceVertexData({
            width: 1.1 * this.w + 2 * m,
            height: 3.3 + m,
            margin: m,
            cutTop: true
        });
        Mummu.RotateVertexDataInPlace(shadowData, BABYLON.Quaternion.FromEulerAngles(Math.PI * 0.5, 0, 0));
        Mummu.TranslateVertexDataInPlace(shadowData, new BABYLON.Vector3(0.55 * (this.w - 1), 0, 1.1 + 0.5 * m));
        shadowData.applyToMesh(this.shadow);
    }
}
class BuildingBlock {
    static async GenerateVertexDatas(puzzle) {
        //await RandomWait();
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
class Bridge extends Build {
    constructor(game, props) {
        super(game, props);
        this.material = this.game.materials.brickWallMaterial;
        this.builtInBorder = new BABYLON.Mesh("ramp-border");
        this.builtInBorder.parent = this;
        this.builtInBorder.material = this.game.materials.blackMaterial;
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
class CarillionMaterials {
    constructor(game) {
        this.game = game;
        let northMaterial = new BABYLON.StandardMaterial("north-material");
        northMaterial.specularColor.copyFromFloats(0, 0, 0);
        northMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/red-north-wind.png");
        northMaterial.freeze();
        let eastMaterial = new BABYLON.StandardMaterial("east-material");
        eastMaterial.specularColor.copyFromFloats(0, 0, 0);
        eastMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/yellow-east-wind.png");
        eastMaterial.freeze();
        let southMaterial = new BABYLON.StandardMaterial("south-material");
        southMaterial.specularColor.copyFromFloats(0, 0, 0);
        southMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/blue-south-wind.png");
        southMaterial.freeze();
        let westMaterial = new BABYLON.StandardMaterial("west-material");
        westMaterial.specularColor.copyFromFloats(0, 0, 0);
        westMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/green-west-wind.png");
        westMaterial.freeze();
        this.waterMaterial = new BABYLON.StandardMaterial("floor-material");
        this.waterMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.waterMaterial.diffuseColor.copyFromFloats(1, 1, 1);
        this.waterMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/water.png");
        this.boostMaterial = new BABYLON.StandardMaterial("boost-material");
        this.boostMaterial.diffuseColor = BABYLON.Color3.FromHexString("#624c3c");
        this.boostMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.boostMaterial.freeze();
        this.floorMaterial = new BABYLON.StandardMaterial("floor-material");
        this.floorMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.floorMaterial.diffuseColor.copyFromFloats(1, 1, 1);
        this.floorMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/floor_2.png");
        this.floorMaterial.freeze();
        this.floorMaterial2 = new BABYLON.StandardMaterial("floor-material");
        this.floorMaterial2.specularColor.copyFromFloats(0, 0, 0);
        this.floorMaterial2.diffuseColor.copyFromFloats(1, 1, 1);
        this.floorMaterial2.diffuseTexture = new BABYLON.Texture("./datas/textures/floor_3.png");
        this.floorMaterial2.freeze();
        this.floorGrass = new BABYLON.StandardMaterial("floor-material");
        this.floorGrass.specularColor.copyFromFloats(0, 0, 0);
        this.floorGrass.diffuseColor.copyFromFloats(1, 1, 1);
        this.floorGrass.diffuseTexture = new BABYLON.Texture("./datas/textures/ground_008.png");
        this.floorGrass.freeze();
        this.floorStoneRect = new BABYLON.StandardMaterial("floor-material");
        this.floorStoneRect.specularColor.copyFromFloats(0, 0, 0);
        this.floorStoneRect.diffuseColor.copyFromFloats(1, 1, 1);
        this.floorStoneRect.diffuseTexture = new BABYLON.Texture("./datas/textures/Stone_02.png");
        this.floorStoneRect.freeze();
        this.floorLogs = new BABYLON.StandardMaterial("floor-material");
        this.floorLogs.specularColor.copyFromFloats(0, 0, 0);
        this.floorLogs.diffuseColor.copyFromFloats(1, 1, 1);
        this.floorLogs.diffuseTexture = new BABYLON.Texture("./datas/textures/logs.png");
        this.floorLogs.freeze();
        this.floorMossLogs = new BABYLON.StandardMaterial("floor-material");
        this.floorMossLogs.specularColor.copyFromFloats(0, 0, 0);
        this.floorMossLogs.diffuseColor.copyFromFloats(1, 1, 1);
        this.floorMossLogs.diffuseTexture = new BABYLON.Texture("./datas/textures/logs_mossy.png");
        this.floorMossLogs.freeze();
        this.woodFloorMaterial = new BABYLON.StandardMaterial("dark-floor-material");
        this.woodFloorMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.woodFloorMaterial.diffuseColor.copyFromFloats(1, 1, 1);
        this.woodFloorMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/wood-plank.png");
        this.woodFloorMaterial.freeze();
        this.roofMaterial = new BABYLON.StandardMaterial("roof-material");
        this.roofMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.roofMaterial.diffuseColor = BABYLON.Color3.FromHexString("#243d5c");
        this.roofMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/wall.png");
        this.roofMaterial.diffuseTexture.uScale = 5;
        this.roofMaterial.diffuseTexture.vScale = 5;
        this.roofMaterial.freeze();
        this.woodMaterial = new BABYLON.StandardMaterial("wood-material");
        this.woodMaterial.diffuseColor = BABYLON.Color3.FromHexString("#624c3c");
        this.woodMaterial.specularColor.copyFromFloats(0, 0, 0);
        //this.woodMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/roof.png");
        //(this.woodMaterial.diffuseTexture as BABYLON.Texture).uScale = 10;
        //(this.woodMaterial.diffuseTexture as BABYLON.Texture).vScale = 10;
        this.roofMaterial.freeze();
        this.wallMaterial = new BABYLON.StandardMaterial("wall-material");
        this.wallMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.wallMaterial.diffuseColor = BABYLON.Color3.FromHexString("#e3cfb4");
        this.wallMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/wall.png");
        this.wallMaterial.freeze();
        this.brickWallMaterial = new BABYLON.StandardMaterial("wall-material");
        this.brickWallMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.brickWallMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/Stone_05.png");
        this.brickWallMaterial.freeze();
        this.holeMaterial = new BABYLON.StandardMaterial("roof-material");
        this.holeMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.holeMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/Stone_01.png");
        this.holeMaterial.freeze();
        this.shadow9Material = new BABYLON.StandardMaterial("shadow-material");
        this.shadow9Material.diffuseColor.copyFromFloats(0.1, 0.1, 0.1);
        this.shadow9Material.diffuseTexture = new BABYLON.Texture("./datas/textures/shadow-9.png");
        this.shadow9Material.diffuseTexture.hasAlpha = true;
        this.shadow9Material.useAlphaFromDiffuseTexture = true;
        this.shadow9Material.alpha = 0.4;
        this.shadow9Material.specularColor.copyFromFloats(0, 0, 0);
        this.shadow9Material.freeze();
        this.whiteShadow9Material = new BABYLON.StandardMaterial("white-shadow9-material");
        this.whiteShadow9Material.diffuseColor.copyFromFloats(1, 1, 1);
        this.whiteShadow9Material.diffuseTexture = new BABYLON.Texture("./datas/textures/shadow-9.png");
        this.whiteShadow9Material.diffuseTexture.hasAlpha = true;
        this.whiteShadow9Material.useAlphaFromDiffuseTexture = true;
        this.whiteShadow9Material.alpha = 1;
        this.whiteShadow9Material.specularColor.copyFromFloats(0, 0, 0);
        this.whiteShadow9Material.freeze();
        this.shadowDiscMaterial = new BABYLON.StandardMaterial("shadow-material");
        this.shadowDiscMaterial.diffuseColor.copyFromFloats(0.1, 0.1, 0.1);
        this.shadowDiscMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/shadow-disc.png");
        this.shadowDiscMaterial.diffuseTexture.hasAlpha = true;
        this.shadowDiscMaterial.useAlphaFromDiffuseTexture = true;
        this.shadowDiscMaterial.alpha = 0.4;
        this.shadowDiscMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.shadowDiscMaterial.freeze();
        this.lightDiscMaterial = new BABYLON.StandardMaterial("light-disc-material");
        this.lightDiscMaterial.diffuseColor.copyFromFloats(1, 1, 1);
        this.lightDiscMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/shadow-disc.png");
        this.lightDiscMaterial.diffuseTexture.hasAlpha = true;
        this.lightDiscMaterial.useAlphaFromDiffuseTexture = true;
        this.lightDiscMaterial.alpha = 0.4;
        this.lightDiscMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.lightDiscMaterial.freeze();
        this.puckSideMaterial = new BABYLON.StandardMaterial("shadow-material");
        this.puckSideMaterial.diffuseColor.copyFromFloats(1, 1, 1);
        this.puckSideMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/puck-side-arrow.png");
        this.puckSideMaterial.diffuseTexture.hasAlpha = true;
        this.puckSideMaterial.emissiveColor.copyFromFloats(1, 1, 1);
        this.puckSideMaterial.useAlphaFromDiffuseTexture = true;
        this.puckSideMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.puckSideMaterial.freeze();
        this.creepSlashMaterial = new BABYLON.StandardMaterial("creep-slash-material");
        this.creepSlashMaterial.diffuseColor.copyFromFloats(1, 1, 1);
        this.creepSlashMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/creep-slash.png");
        this.creepSlashMaterial.diffuseTexture.hasAlpha = true;
        this.creepSlashMaterial.emissiveColor.copyFromFloats(1, 1, 1);
        this.creepSlashMaterial.useAlphaFromDiffuseTexture = true;
        this.creepSlashMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.creepSlashMaterial.freeze();
        this.tileStarTailMaterial = new BABYLON.StandardMaterial("tail-material");
        this.tileStarTailMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.tileStarTailMaterial.emissiveColor.copyFromFloats(0.5, 0.5, 0.5);
        this.tileStarTailMaterial.freeze();
        this.pushTileTopMaterial = new BABYLON.StandardMaterial("push-tile-material");
        this.pushTileTopMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.pushTileTopMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/push-tile-top.png");
        this.pushTileTopMaterial.freeze();
        this.tileColorMaterials = [];
        this.tileColorMaterials[TileColor.North] = northMaterial;
        this.tileColorMaterials[TileColor.South] = southMaterial;
        this.tileColorMaterials[TileColor.East] = eastMaterial;
        this.tileColorMaterials[TileColor.West] = westMaterial;
        /*
        let collectedTileTexture = new BABYLON.DynamicTexture("collected-tile-texture", { width: 512, height: 512 });
        let northTexture = new Image(256, 256);
        northTexture.src = "./datas/textures/red-north-wind.png";
        northTexture.onload = () => {
            let eastTexture = new Image(256, 256);
            eastTexture.src = "./datas/textures/yellow-east-wind.png";
            eastTexture.onload = () => {
                let southTexture = new Image(256, 256);
                southTexture.src = "./datas/textures/blue-south-wind.png";
                southTexture.onload = () => {
                    let greenTexture = new Image(256, 256);
                    greenTexture.src = "./datas/textures/green-west-wind.png";
                    greenTexture.onload = () => {
                        let context = collectedTileTexture.getContext();
                        context.drawImage(northTexture, 0, 0, 256, 256, 0, 0, 256, 256);
                        context.drawImage(eastTexture, 0, 0, 256, 256, 256, 0, 256, 256);
                        context.drawImage(southTexture, 0, 0, 256, 256, 0, 256, 256, 256);
                        context.drawImage(greenTexture, 0, 0, 256, 256, 256, 256, 256, 256);
                        collectedTileTexture.update();
                    }
                }
            }
        }
        this.collectedTileMaterial = new BABYLON.StandardMaterial("collected-tile-material");
        this.collectedTileMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.collectedTileMaterial.diffuseTexture = collectedTileTexture;
        */
        let oneMaterial = new BABYLON.StandardMaterial("one-material");
        //oneMaterial.diffuseColor.copyFromFloats(0.7, 0.7, 0.7);
        //oneMaterial.diffuseColor = BABYLON.Color3.FromHexString("#272838");
        //oneMaterial.diffuseColor = BABYLON.Color3.FromHexString("#272932").scale(0.8);
        oneMaterial.specularColor.copyFromFloats(0, 0, 0);
        oneMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/door-one.png");
        oneMaterial.freeze();
        let twoMaterial = new BABYLON.StandardMaterial("two-material");
        //twoMaterial.diffuseColor.copyFromFloats(0.7, 0.7, 0.7);
        //twoMaterial.diffuseColor = BABYLON.Color3.FromHexString("#5D536B");
        //twoMaterial.diffuseColor = BABYLON.Color3.FromHexString("#828489").scale(1.2);
        twoMaterial.specularColor.copyFromFloats(0, 0, 0);
        twoMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/door-two.png");
        twoMaterial.freeze();
        let threeMaterial = new BABYLON.StandardMaterial("three-material");
        //threeMaterial.diffuseColor.copyFromFloats(0.7, 0.7, 0.7);
        //threeMaterial.diffuseColor = BABYLON.Color3.FromHexString("#7D6B91");
        //threeMaterial.diffuseColor = BABYLON.Color3.Lerp(oneMaterial.diffuseColor, twoMaterial.diffuseColor, 0.3);
        threeMaterial.specularColor.copyFromFloats(0, 0, 0);
        threeMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/door-three.png");
        threeMaterial.freeze();
        this.tileNumberMaterials = [];
        this.tileNumberMaterials[0] = oneMaterial;
        this.tileNumberMaterials[1] = twoMaterial;
        this.tileNumberMaterials[2] = threeMaterial;
        this.tileColorShinyMaterials = [];
        this.tileColorShinyMaterials[TileColor.North] = northMaterial.clone(northMaterial.name + "-shiny");
        this.tileColorShinyMaterials[TileColor.East] = eastMaterial.clone(eastMaterial.name + "-shiny");
        this.tileColorShinyMaterials[TileColor.South] = southMaterial.clone(southMaterial.name + "-shiny");
        this.tileColorShinyMaterials[TileColor.West] = westMaterial.clone(westMaterial.name + "-shiny");
        this.tileColorShinyMaterials.forEach(shinyMat => {
            shinyMat.freeze();
        });
        this.trueWhiteMaterial = new BABYLON.StandardMaterial("true-white-material");
        this.trueWhiteMaterial.diffuseColor = BABYLON.Color3.FromHexString("#ffffff");
        this.trueWhiteMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.trueWhiteMaterial.freeze();
        this.fullAutolitWhiteMaterial = new BABYLON.StandardMaterial("full-autolit-white-material");
        this.fullAutolitWhiteMaterial.diffuseColor = BABYLON.Color3.FromHexString("#ffffff");
        this.fullAutolitWhiteMaterial.emissiveColor = BABYLON.Color3.FromHexString("#ffffff");
        this.fullAutolitWhiteMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.fullAutolitWhiteMaterial.freeze();
        this.whiteMaterial = new BABYLON.StandardMaterial("white-material");
        this.whiteMaterial.diffuseColor = BABYLON.Color3.FromHexString("#e3cfb4");
        this.whiteMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.whiteMaterial.freeze();
        this.grayMaterial = new BABYLON.StandardMaterial("gray-material");
        this.grayMaterial.diffuseColor = BABYLON.Color3.FromHexString("#5d6265");
        this.grayMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.grayMaterial.freeze();
        this.blackMaterial = new BABYLON.StandardMaterial("black-material");
        this.blackMaterial.diffuseColor = BABYLON.Color3.FromHexString("#2b2821");
        this.blackMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.blackMaterial.freeze();
        this.brownMaterial = new BABYLON.StandardMaterial("brown-material");
        this.brownMaterial.diffuseColor = BABYLON.Color3.FromHexString("#624c3c");
        this.brownMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.brownMaterial.freeze();
        this.salmonMaterial = new BABYLON.StandardMaterial("salmon-material");
        this.salmonMaterial.diffuseColor = BABYLON.Color3.FromHexString("#d9ac8b");
        this.salmonMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.salmonMaterial.freeze();
        this.blueMaterial = new BABYLON.StandardMaterial("blue-material");
        this.blueMaterial.diffuseColor = BABYLON.Color3.FromHexString("#243d5c");
        this.blueMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.blueMaterial.freeze();
        this.redMaterial = new BABYLON.StandardMaterial("red-material");
        this.redMaterial.diffuseColor = BABYLON.Color3.FromHexString("#b03a48");
        this.redMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.redMaterial.freeze();
        this.yellowMaterial = new BABYLON.StandardMaterial("yellow-material");
        this.yellowMaterial.diffuseColor = BABYLON.Color3.FromHexString("#e0c872");
        this.yellowMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.yellowMaterial.freeze();
        this.greenMaterial = new BABYLON.StandardMaterial("green-material");
        this.greenMaterial.diffuseColor = BABYLON.Color3.FromHexString("#3e6958");
        this.greenMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.greenMaterial.freeze();
        this.colorMaterials = [
            this.redMaterial,
            this.yellowMaterial,
            this.blueMaterial,
            this.greenMaterial
        ];
        this.floorMaterials = [
            this.floorMaterial,
            this.floorMaterial2,
            this.floorGrass,
            this.floorStoneRect,
            this.floorLogs,
            this.floorMossLogs,
            this.woodFloorMaterial,
            this.brickWallMaterial,
            this.holeMaterial
        ];
    }
    get borderMaterial() {
        return this.brownMaterial;
    }
}
class CarillonRouter extends Nabu.Router {
    constructor(game) {
        super();
        this.game = game;
    }
    async postInitialize() {
        //await RandomWait();
        for (let i = 0; i < this.pages.length; i++) {
            await this.pages[i].waitLoaded();
        }
        this.homeMenu = new HomePage("#home-menu", this);
        this.storyPuzzlesPage = new StoryPuzzlesPage("#base-puzzles-page", this);
        this.expertPuzzlesPage = new ExpertPuzzlesPage("#expert-puzzles-page", this);
        this.xmasPuzzlesPage = new XMasPuzzlesPage("#xmas-puzzles-page", this);
        this.communityPuzzlesPage = new CommunityPuzzlesPage("#community-puzzles-page", this);
        this.devPuzzlesPage = new DevPuzzlesPage("#dev-puzzles-page", this);
        this.multiplayerPuzzlesPage = new MultiplayerPuzzlesPage("#multiplayer-puzzles-page", this);
        this.creditsPage = document.querySelector("#credits-page");
        this.multiplayerPage = new MultiplayerPage("#multiplayer-page", this);
        this.playUI = document.querySelector("#play-ui");
        this.editorUI = document.querySelector("#editor-ui");
        this.devPage = document.querySelector("#dev-page");
        this.tutoPage = new TutoPage("#tuto-page", this);
        this.eulaPage = document.querySelector("#eula-page");
        this.playBackButton = document.querySelector("#play-ui .back-btn");
        this.timerText = document.querySelector("#play-timer");
        this.puzzleIntro = document.querySelector("#puzzle-intro");
    }
    onUpdate() { }
    async onHRefChange(page, previousPage) {
        //await RandomWait();
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
            SDKGameplayStop();
        }
        else if (page.startsWith("#credits")) {
            SDKGameplayStop();
            await this.show(this.creditsPage, false, showTime);
        }
        else if (page === "#dev") {
            SDKGameplayStop();
            await this.show(this.devPage, false, showTime);
        }
        else if (page.startsWith("#editor-preview")) {
            this.game.puzzle.puzzleUI.successNextButton.onpointerup = () => {
                this.game.puzzle.puzzleUI.autoNext = false;
                location.hash = "#editor";
            };
            this.show(this.playUI, false, showTime);
            document.querySelector("#editor-btn").style.display = "";
            this.game.mode = GameMode.Preplay;
            await this.game.puzzle.reset(true);
            this.game.puzzle.editorOrEditorPreview = true;
            this.game.puzzle.skipIntro();
            this.game.globalTimer = 0;
        }
        else if (page.startsWith("#editor")) {
            this.show(this.editorUI, false, showTime);
            this.game.mode = GameMode.Editor;
            await this.game.puzzle.reset(true);
            this.game.puzzle.editorOrEditorPreview = true;
            this.game.editor.activate();
        }
        else if (page.startsWith("#level-")) {
            let numLevel = parseInt(page.replace("#level-", ""));
            this.game.puzzle.puzzleUI.successNextButton.onpointerup = () => {
                this.game.puzzle.puzzleUI.autoNext = false;
                location.hash = "#level-" + (numLevel + 1).toFixed(0);
            };
            this.game.puzzle.puzzleUI.gameoverBackButton.parentElement.href = "#levels";
            if (this.game.puzzle.data.numLevel != numLevel) {
                let data = this.game.loadedStoryPuzzles;
                if (data.puzzles[numLevel - 1]) {
                    this.game.puzzle.resetFromData(data.puzzles[numLevel - 1]);
                }
                else {
                    location.hash = "#levels";
                    return;
                }
            }
            this.show(this.playUI, false, showTime);
            this.game.mode = GameMode.Preplay;
            await this.game.puzzle.reset();
            this.game.puzzle.editorOrEditorPreview = false;
            document.querySelector("#editor-btn").style.display = DEV_MODE_ACTIVATED ? "" : "none";
            this.game.globalTimer = 0;
        }
        else if (page.startsWith("#puzzle-")) {
            let puzzleId = parseInt(page.replace("#puzzle-", ""));
            if (this.game.puzzle.data.id != puzzleId) {
                let data = await this.game.getPuzzleDataById(puzzleId);
                if (!data) {
                    console.error("Puzzle #" + puzzleId + " not found.");
                    location.hash = "#home";
                    return;
                }
                this.game.puzzle.resetFromData(data);
            }
            if (this.game.puzzle.data.state === 8) {
                this.game.puzzle.puzzleUI.successNextButton.onpointerup = () => {
                    this.game.puzzle.puzzleUI.autoNext = false;
                    location.hash = "#xmas-puzzles";
                };
                this.game.puzzle.puzzleUI.gameoverBackButton.parentElement.href = "#xmas-puzzles";
            }
            else if (this.game.puzzle.data.state === 4) {
                this.game.puzzle.puzzleUI.successNextButton.onpointerup = () => {
                    this.game.puzzle.puzzleUI.autoNext = false;
                    location.hash = "#multiplayer-puzzles";
                };
                this.game.puzzle.puzzleUI.gameoverBackButton.parentElement.href = "#multiplayer-puzzles";
            }
            else if (this.game.puzzle.data.state === 3) {
                this.game.puzzle.puzzleUI.successNextButton.onpointerup = () => {
                    this.game.puzzle.puzzleUI.autoNext = false;
                    location.hash = "#expert-puzzles";
                };
                this.game.puzzle.puzzleUI.gameoverBackButton.parentElement.href = "#expert-puzzles";
            }
            else {
                this.game.puzzle.puzzleUI.successNextButton.onpointerup = () => {
                    this.game.puzzle.puzzleUI.autoNext = false;
                    location.hash = "#community-puzzles";
                };
                this.game.puzzle.puzzleUI.gameoverBackButton.parentElement.href = "#community-puzzles";
            }
            this.show(this.playUI, false, showTime);
            this.game.mode = GameMode.Preplay;
            await this.game.puzzle.reset();
            this.game.puzzle.editorOrEditorPreview = false;
            document.querySelector("#editor-btn").style.display = DEV_MODE_ACTIVATED ? "" : "none";
            this.game.globalTimer = 0;
        }
        else if (page.startsWith("#levels")) {
            SDKGameplayStop();
            this.show(this.storyPuzzlesPage.nabuPage, false, showTime);
            requestAnimationFrame(() => {
                this.storyPuzzlesPage.redraw();
            });
        }
        else if (page.startsWith("#expert-puzzles")) {
            SDKGameplayStop();
            this.show(this.expertPuzzlesPage.nabuPage, false, showTime);
            requestAnimationFrame(() => {
                this.expertPuzzlesPage.redraw();
            });
        }
        else if (page.startsWith("#xmas-puzzles")) {
            SDKGameplayStop();
            this.show(this.xmasPuzzlesPage.nabuPage, false, showTime);
            requestAnimationFrame(() => {
                this.xmasPuzzlesPage.redraw();
            });
        }
        else if (page.startsWith("#community-puzzles")) {
            SDKGameplayStop();
            this.show(this.communityPuzzlesPage.nabuPage, false, showTime);
            requestAnimationFrame(() => {
                this.communityPuzzlesPage.redraw();
            });
        }
        else if (page.startsWith("#multiplayer-puzzles")) {
            SDKGameplayStop();
            this.show(this.multiplayerPuzzlesPage.nabuPage, false, showTime);
            requestAnimationFrame(() => {
                this.multiplayerPuzzlesPage.redraw();
            });
        }
        else if (page.startsWith("#multiplayer")) {
            SDKGameplayStop();
            await this.show(this.multiplayerPage.nabuPage, false, showTime);
        }
        else if (page.startsWith("#dev-puzzles")) {
            SDKGameplayStop();
            if (!DEV_MODE_ACTIVATED) {
                location.hash = "#dev";
                return;
            }
            this.show(this.devPuzzlesPage.nabuPage, false, showTime);
            if (page.indexOf("#dev-puzzles-") != -1) {
                let state = parseInt(page.replace("#dev-puzzles-", ""));
                this.devPuzzlesPage.levelStateToFetch = state;
            }
            else {
                this.devPuzzlesPage.levelStateToFetch = 0;
            }
            requestAnimationFrame(() => {
                this.devPuzzlesPage.redraw();
            });
        }
        else if (page.startsWith("#home")) {
            if (ADVENT_CAL) {
                location.hash = "#xmas-puzzles";
            }
            SDKGameplayStop();
            this.homeMenu.updateCompletionBars();
            await this.show(this.homeMenu.nabuPage, false, showTime);
        }
        else {
            location.hash = "#home";
            return;
        }
    }
}
class CompletionBar extends HTMLElement {
    constructor() {
        super(...arguments);
        this.value = 0;
        this.showText = true;
    }
    static get observedAttributes() {
        return ["value", "show-text"];
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "value") {
            this.setValue(parseFloat(newValue));
        }
        if (name === "show-text") {
            this.showText = newValue === "true" ? true : false;
            this.setValue(this.value);
        }
    }
    connectedCallback() {
        this.completedBar = document.createElement("div");
        this.completedBar.classList.add("completed");
        this.completedBar.style.position = "absolute";
        this.completedBar.style.top = "-1px";
        this.completedBar.style.left = "-1px";
        this.completedBar.style.height = "inherit";
        this.completedBar.style.border = "inherit";
        this.completedBar.style.borderRadius = "inherit";
        this.appendChild(this.completedBar);
        this.valueText = document.createElement("span");
        this.valueText.classList.add("completed-text");
        this.valueText.style.position = "relative";
        this.valueText.style.display = "none";
        this.valueText.style.marginRight = "5px";
        this.valueText.style.marginLeft = "5px";
        this.valueText.style.display = "inline-block";
        this.valueText.style.color = "white";
        this.valueText.style.fontWeight = "500";
        this.appendChild(this.valueText);
        if (this.hasAttribute("value")) {
            this.setValue(parseFloat(this.getAttribute("value")));
        }
    }
    animateValueTo(v, duration = 1) {
        let t0 = performance.now();
        let vOrigin = this.value;
        let vDestination = v;
        let step = () => {
            let t = (performance.now() - t0) / 1000;
            let f = t / duration;
            if (f < 1) {
                let val = vOrigin * (1 - f) + vDestination * f;
                let currPercent = Math.floor(this.value * 100);
                let valPercent = Math.floor(val * 100);
                if (currPercent != valPercent) {
                    this.setValue(val);
                }
                requestAnimationFrame(step);
            }
            else {
                this.classList.remove("animating");
                this.setValue(vDestination);
            }
        };
        this.classList.add("animating");
        step();
    }
    setValue(v) {
        if (this.completedBar && this.valueText) {
            this.value = v;
            let percent = Math.floor(v * 100);
            let percentString = percent.toFixed(0) + "%";
            if (percent === 0) {
                this.completedBar.style.display = "none";
            }
            else {
                let invPercentString = (100 - percent).toFixed(0) + "%";
                this.completedBar.style.display = "block";
                this.completedBar.style.width = percentString;
                this.completedBar.style.backgroundColor = "color-mix(in srgb, #e0c872 " + percentString + ", #624c3c " + invPercentString + ")";
            }
            this.valueText.innerHTML = percentString + " completed";
            if (percent > 50) {
                this.completedBar.appendChild(this.valueText);
                this.style.textAlign = "left";
                this.valueText.style.display = this.showText ? "block" : "none";
                this.valueText.style.color = "black";
                this.valueText.style.fontWeight = "900";
            }
            else {
                this.appendChild(this.valueText);
                this.style.textAlign = "right";
                this.valueText.style.display = this.showText ? "block" : "none";
                this.valueText.style.color = "white";
                this.valueText.style.fontWeight = "500";
            }
            if (percent > 70) {
                this.valueText.style.color = "black";
                this.valueText.style.fontWeight = "900";
            }
            else {
                this.valueText.style.color = "white";
                this.valueText.style.fontWeight = "500";
            }
        }
    }
}
customElements.define("completion-bar", CompletionBar);
class Creep extends BABYLON.Mesh {
    constructor(puzzle, props) {
        super("creep");
        this.puzzle = puzzle;
        this.props = props;
        this.radius = 0.4;
        this.dir = new BABYLON.Vector2(1, 0);
        this.animateSize = Mummu.AnimationFactory.EmptyNumberCallback;
        this.stopMove = false;
        this._moving = false;
        if (isFinite(props.i)) {
            this.i = props.i;
        }
        if (isFinite(props.j)) {
            this.j = props.j;
        }
        if (isFinite(props.h)) {
            this.position.y = props.h;
        }
        puzzle.creeps.push(this);
        this.shell = new BABYLON.Mesh("shell");
        this.shell.parent = this;
        this.shell.material = this.game.materials.whiteMaterial;
        this.shell.renderOutline = true;
        this.shell.outlineColor = BABYLON.Color3.Black();
        this.shell.outlineWidth = 0.02;
        this.shellColored = new BABYLON.Mesh("shell-colored");
        this.shellColored.parent = this.shell;
        this.shellColored.material = this.game.materials.redMaterial;
        this.shellColored.renderOutline = true;
        this.shellColored.outlineColor = BABYLON.Color3.Black();
        this.shellColored.outlineWidth = 0.02;
        this.spikes = new BABYLON.Mesh("spikes");
        this.spikes.parent = this.shell;
        this.spikes.material = this.game.materials.trueWhiteMaterial;
        this.spikes.renderOutline = true;
        this.spikes.outlineColor = BABYLON.Color3.Black();
        this.spikes.outlineWidth = 0.02;
        this.slash = new BABYLON.Mesh("slash");
        this.slash.parent = this.shell;
        this.slash.position.y = 0.1;
        this.slash.material = this.game.materials.creepSlashMaterial;
        this.slashSize = 0.1;
        this.shadow = new BABYLON.Mesh("shadow");
        this.shadow.position.x = 0;
        this.shadow.position.y = 0.05;
        this.shadow.position.z = 0;
        this.shadow.parent = this;
        this.shadow.material = this.game.materials.shadowDiscMaterial;
        this.animateSize = Mummu.AnimationFactory.CreateNumber(this, this, "size");
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
    get size() {
        return this.shell.scaling.x;
    }
    set size(s) {
        this.shell.scaling.copyFromFloats(s, s, s);
        this.shadow.scaling.copyFromFloats(s * 1.2, s * 1.2, s * 1.2);
    }
    get slashSize() {
        return this.slash.scaling.x;
    }
    set slashSize(s) {
        this.slash.scaling.copyFromFloats(s, s, s);
    }
    get game() {
        return this.puzzle.game;
    }
    async instantiate() {
        //await RandomWait();
        let data = await this.game.vertexDataLoader.get("./datas/meshes/creep.babylon");
        data[0].applyToMesh(this.shell);
        data[1].applyToMesh(this.shellColored);
        data[2].applyToMesh(this.spikes);
        BABYLON.CreateGroundVertexData({ width: 0.8, height: 0.8 }).applyToMesh(this.shadow);
        BABYLON.CreateGroundVertexData({ width: 0.8, height: 0.8 }).applyToMesh(this.slash);
    }
    async shrink() {
        //await RandomWait();
        await this.animateSize(1.1, 0.1);
        await this.animateSize(0.4, 0.3);
    }
    dispose() {
        let index = this.puzzle.creeps.indexOf(this);
        if (index != -1) {
            this.puzzle.creeps.splice(index, 1);
        }
        super.dispose();
    }
    isFree(i, j) {
        if (i < 0 || i >= this.puzzle.w) {
            return false;
        }
        if (j < 0 || j >= this.puzzle.h) {
            return false;
        }
        let stack = this.puzzle.getGriddedStack(i, j);
        if (stack) {
            let tile = stack.array.find(t => { return Math.abs(t.position.y - this.position.y) < 0.6; });
            if (tile) {
                if (tile instanceof DoorTile && !tile.closed) {
                    return true;
                }
                if (tile instanceof HoleTile && tile.covered) {
                    return true;
                }
                return false;
            }
        }
        return true;
    }
    canGoFromTo(fromI, fromJ, toI, toJ) {
        let h = this.puzzle.hMapGet(toI, toJ);
        if (Math.abs(h - this.position.y) < 0.5) {
            if (this.isFree(toI, toJ)) {
                let dirI = Math.round(toI - fromI);
                let dirJ = Math.round(toJ - fromJ);
                if (dirI > 0) {
                    let stack = this.game.puzzle.getGriddedBorderStack(fromI, fromJ);
                    if (stack && stack.array.find((b) => { return b.vertical && Math.abs(b.position.y - this.position.y) < 0.6; })) {
                        return false;
                    }
                }
                else if (dirI < 0) {
                    let stack = this.game.puzzle.getGriddedBorderStack(toI, fromJ);
                    if (stack && stack.array.find((b) => { return b.vertical && Math.abs(b.position.y - this.position.y) < 0.6; })) {
                        return false;
                    }
                }
                else if (dirJ > 0) {
                    let stack = this.game.puzzle.getGriddedBorderStack(fromI, fromJ);
                    if (stack && stack.array.find((b) => { return !b.vertical && Math.abs(b.position.y - this.position.y) < 0.6; })) {
                        return false;
                    }
                }
                else if (dirJ < 0) {
                    let stack = this.game.puzzle.getGriddedBorderStack(fromI, toJ);
                    if (stack && stack.array.find((b) => { return !b.vertical && Math.abs(b.position.y - this.position.y) < 0.6; })) {
                        return false;
                    }
                }
                return true;
            }
        }
        return false;
    }
    updateDest() {
        let left = new BABYLON.Vector2(-this.dir.y, this.dir.x);
        let right = new BABYLON.Vector2(this.dir.y, -this.dir.x);
        let backRightI = Math.round(this.i + right.x - this.dir.x);
        let backRightJ = Math.round(this.j + right.y - this.dir.y);
        let rightI = Math.round(this.i + right.x);
        let rightJ = Math.round(this.j + right.y);
        if (!this.canGoFromTo(this.i - this.dir.x, this.j - this.dir.y, backRightI, backRightJ) && this.canGoFromTo(this.i, this.j, rightI, rightJ)) {
            this.dir.copyFrom(right);
            this.destI = rightI;
            this.destJ = rightJ;
            return;
        }
        let forwardI = Math.round(this.i + this.dir.x);
        let forwardJ = Math.round(this.j + this.dir.y);
        if (this.canGoFromTo(this.i, this.j, forwardI, forwardJ)) {
            this.destI = forwardI;
            this.destJ = forwardJ;
            return;
        }
        let leftI = Math.round(this.i + left.x);
        let leftJ = Math.round(this.j + left.y);
        if (this.canGoFromTo(this.i, this.j, leftI, leftJ)) {
            this.dir.copyFrom(left);
            this.destI = leftI;
            this.destJ = leftJ;
            return;
        }
        if (this.canGoFromTo(this.i, this.j, rightI, rightJ)) {
            this.dir.copyFrom(right);
            this.destI = rightI;
            this.destJ = rightJ;
            return;
        }
        let backI = Math.round(this.i - this.dir.x);
        let backJ = Math.round(this.j - this.dir.y);
        if (this.canGoFromTo(this.i, this.j, backI, backJ)) {
            this.dir.scaleInPlace(-1);
            this.destI = backI;
            this.destJ = backJ;
            return;
        }
    }
    moveTo(destination, duration = 1) {
        return new Promise(resolve => {
            let t0 = performance.now();
            let origin = this.position.clone();
            let step = () => {
                if (this.stopMove) {
                    return;
                }
                let dt = (performance.now() - t0) / 1000;
                let f = dt / duration;
                if (f < 1) {
                    f = Nabu.Easing.easeInOutSine(f);
                    BABYLON.Vector3.LerpToRef(origin, destination, f, this.position);
                    this.shell.position.y = 0.4 * Math.sin(f * Math.PI);
                    this.shell.rotation.x = 0.3 * Math.sin(f * 2 * Math.PI);
                    this.shell.rotation.z = 0.3 * Math.sin(f * 2 * Math.PI);
                    this.shell.rotation.y = f * 2 * Math.PI;
                    requestAnimationFrame(step);
                }
                else {
                    this.position.copyFrom(destination);
                    this.shell.position.y = 0;
                    this.shell.rotation.x = 0;
                    this.shell.rotation.y = 0;
                    resolve();
                }
            };
            step();
        });
    }
    bump(duration = 1) {
        return new Promise(resolve => {
            let pY0 = this.shell.position.y;
            let rX0 = this.shell.rotation.x;
            let rY0 = this.shell.rotation.z;
            let rZ0 = this.shell.rotation.z;
            let t0 = performance.now();
            this.puzzle.wiishSound.play();
            let step = () => {
                let dt = (performance.now() - t0) / 1000;
                let f = dt / duration;
                if (f < 1) {
                    let popD = 0.25;
                    if (f < popD) {
                        let fSize = f / popD;
                        fSize = Nabu.Easing.easeOutSine(fSize);
                        this.size = 1 + 0.3 * fSize;
                    }
                    else {
                        let fSize = 1 - (f - popD) / (1 - popD);
                        fSize = Nabu.Easing.easeInOutSine(fSize);
                        this.size = 1 + 0.3 * fSize;
                    }
                    f = Nabu.Easing.easeOutSine(f);
                    this.shell.position.y = pY0 * (1 - f);
                    this.shell.rotation.x = rX0 * (1 - f);
                    this.shell.rotation.y = rY0 * (1 - f) + (rY0 + 3 * Math.PI) * f;
                    this.shell.rotation.z = rZ0 * (1 - f);
                    this.slash.rotation.y = f * 4 * Math.PI;
                    requestAnimationFrame(step);
                    let slashD = 0.2;
                    let fSlash = f / slashD;
                    if (f > 1 - slashD) {
                        fSlash = 1 - (f - (1 - slashD)) / slashD;
                    }
                    fSlash = Nabu.MinMax(fSlash, 0, 1);
                    fSlash = Nabu.Easing.easeOutCubic(fSlash);
                    this.slashSize = 0.1 + 1.2 * fSlash;
                }
                else {
                    this.size = 1;
                    this.shell.position.y = 0;
                    this.shell.rotation.y = rY0 + 3 * Math.PI;
                    this.shell.rotation.x = 0;
                    this.shell.rotation.z = 0;
                    this.slashSize = 0.1;
                    resolve();
                }
            };
            step();
        });
    }
    update(rawDT) {
        if (this.puzzle.puzzleState === PuzzleState.Playing) {
            if (!this._moving) {
                this.updateDest();
                let dest = new BABYLON.Vector3(this.destI * 1.1, this.puzzle.hMapGet(this.destI, this.destJ), this.destJ * 1.1);
                if (Mummu.IsFinite(dest)) {
                    this._moving = true;
                    this.moveTo(dest, 1).then(() => { this._moving = false; });
                }
            }
        }
    }
}
var EditorBrush;
(function (EditorBrush) {
    EditorBrush[EditorBrush["None"] = 0] = "None";
    EditorBrush[EditorBrush["Delete"] = 1] = "Delete";
    EditorBrush[EditorBrush["Tile"] = 2] = "Tile";
    EditorBrush[EditorBrush["Switch"] = 3] = "Switch";
    EditorBrush[EditorBrush["Button"] = 4] = "Button";
    EditorBrush[EditorBrush["Door"] = 5] = "Door";
    EditorBrush[EditorBrush["Push"] = 6] = "Push";
    EditorBrush[EditorBrush["Hole"] = 7] = "Hole";
    EditorBrush[EditorBrush["Wall"] = 8] = "Wall";
    EditorBrush[EditorBrush["Water"] = 9] = "Water";
    EditorBrush[EditorBrush["Box"] = 10] = "Box";
    EditorBrush[EditorBrush["Ramp"] = 11] = "Ramp";
    EditorBrush[EditorBrush["Bridge"] = 12] = "Bridge";
    EditorBrush[EditorBrush["Creep"] = 13] = "Creep";
    EditorBrush[EditorBrush["Tree"] = 14] = "Tree";
    EditorBrush[EditorBrush["Nobori"] = 15] = "Nobori";
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
                let pick = this.game.scene.pick(this.game.scene.pointerX * window.devicePixelRatio, this.game.scene.pointerY * window.devicePixelRatio, (mesh) => {
                    return mesh.name === "floor" || mesh.name === "building-floor" || mesh === this.puzzle.invisiFloorTM;
                });
                if (pick.hit) {
                    this.cursorI = Math.round(pick.pickedPoint.x / 1.1);
                    this.cursorI = Nabu.MinMax(this.cursorI, 0, this.puzzle.w - this.cursorW);
                    this.cursorJ = Math.round(pick.pickedPoint.z / 1.1);
                    this.cursorJ = Nabu.MinMax(this.cursorJ, 0, this.puzzle.h - this.cursorD);
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
                let pick = this.game.scene.pick(this.game.scene.pointerX * window.devicePixelRatio, this.game.scene.pointerY * window.devicePixelRatio, (mesh) => {
                    return mesh.name === "floor" || mesh.name === "building-floor" || mesh === this.puzzle.invisiFloorTM;
                });
                if (pick.hit) {
                    if (ev.button === 2 || this.brush === EditorBrush.Delete) {
                        let tile = this.puzzle.tiles.find(tile => {
                            return tile.i === this.cursorI && tile.j === this.cursorJ && Math.abs(tile.position.y - this.cursorH) < 0.3;
                        });
                        if (tile instanceof DoorTile && !tile.closed) {
                            tile.close(0);
                        }
                        else if (tile instanceof HoleTile && !tile.covered) {
                            tile.covered = true;
                            tile.instantiate();
                        }
                        else if (tile) {
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
                            else {
                                let creep = this.puzzle.creeps.find(creep => {
                                    return creep.i === this.cursorI && creep.j === this.cursorJ;
                                });
                                if (creep) {
                                    creep.dispose();
                                }
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
                            else if (this.brush === EditorBrush.Button) {
                                tile = new ButtonTile(this.game, {
                                    i: this.cursorI,
                                    j: this.cursorJ,
                                    h: this.cursorH,
                                    color: this.brushColor,
                                    value: this.brushColor
                                });
                            }
                            else if (this.brush === EditorBrush.Door) {
                                tile = new DoorTile(this.game, {
                                    i: this.cursorI,
                                    j: this.cursorJ,
                                    h: this.cursorH,
                                    color: this.brushColor,
                                    value: this.brushColor
                                });
                            }
                            else if (this.brush === EditorBrush.Push) {
                                tile = new PushTile(this.game, {
                                    i: this.cursorI,
                                    j: this.cursorJ,
                                    h: this.cursorH,
                                    color: this.brushColor
                                });
                            }
                            else if (this.brush === EditorBrush.Hole) {
                                tile = new HoleTile(this.game, {
                                    i: this.cursorI,
                                    j: this.cursorJ,
                                    color: this.brushColor,
                                    noShadow: true
                                });
                            }
                            else if (this.brush === EditorBrush.Wall) {
                                tile = new WallTile(this.game, {
                                    i: this.cursorI,
                                    j: this.cursorJ,
                                    color: this.brushColor,
                                    noShadow: true
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
                                    j: this.cursorJ,
                                    size: this.brushColor
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
                            else if (this.brush === EditorBrush.Creep) {
                                let creep = new Creep(this.puzzle, {
                                    i: this.cursorI,
                                    j: this.cursorJ,
                                    h: this.cursorH
                                });
                                creep.instantiate();
                            }
                            else if (this.brush === EditorBrush.Tree) {
                                tile = new CherryTree(this.game, {
                                    i: this.cursorI,
                                    j: this.cursorJ,
                                    color: this.brushColor,
                                    noShadow: true
                                });
                            }
                            else if (this.brush === EditorBrush.Nobori) {
                                tile = new Nobori(this.game, {
                                    i: this.cursorI,
                                    j: this.cursorJ,
                                    h: this.cursorH,
                                    color: this.brushColor
                                });
                            }
                            if (tile) {
                                if (tile instanceof WaterTile) {
                                    this.puzzle.editorRegenerateWaterTiles();
                                }
                                else {
                                    tile.instantiate();
                                }
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
    get cursorW() {
        return Math.round(this.cursor.scaling.x / 1.1);
    }
    get cursorD() {
        return Math.round(this.cursor.scaling.z / 1.1);
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
        if (this.puzzle.balls[1]) {
            this.p2OriginColorInput.setValue(this.puzzle.balls[1].color);
            this.p2OriginIInput.setValue(this.puzzle.balls[1].i);
            this.p2OriginJInput.setValue(this.puzzle.balls[1].j);
        }
        this.widthInput.setValue(this.puzzle.w);
        this.heightInput.setValue(this.puzzle.h);
        this.floorMaterialInput.setValue(this.puzzle.floorMaterialIndex);
        document.getElementById("p2-ball").style.display = this.puzzle.ballsCount === 2 ? "block" : "none";
        this.ballCountButton.querySelector("stroke-text").innerHTML = this.puzzle.ballsCount === 2 ? "2 PLAYERS" : "1 PLAYER";
        if (this.puzzle.haiku) {
            this.puzzle.haiku.visibility = 1;
            this.haikuIInput.setValue(Math.round(this.puzzle.haiku.position.x / 0.55));
            this.haikuJInput.setValue(Math.round(this.puzzle.haiku.position.z / 0.55));
            this.haikuContent.value = this.puzzle.haiku.text;
        }
    }
    activate() {
        if (location.host.startsWith("127.0.0.1")) {
            document.querySelector("#editor-haiku-container").style.display = "block";
        }
        this.ballCountButton = document.getElementById("ball-count-btn");
        this.ballCountButton.onpointerup = () => {
            if (this.puzzle.ballsCount === 1) {
                this.puzzle.ballsCount = 2;
                if (this.puzzle.balls[1]) {
                    this.puzzle.balls[1].instantiate();
                    this.puzzle.balls[1].setVisible(true);
                }
            }
            else if (this.puzzle.ballsCount === 2) {
                this.puzzle.ballsCount = 1;
                if (this.puzzle.balls[1]) {
                    this.puzzle.balls[1].setVisible(false);
                }
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
            if (this.puzzle.balls[1]) {
                this.puzzle.balls[1].setColor(color);
            }
        };
        this.p2OriginColorInput.valueToString = (v) => {
            return TileColorNames[v];
        };
        this.p2OriginIInput = document.getElementById("editor-p2-origin-i");
        this.p2OriginIInput.onValueChange = (v) => {
            this.dropClear();
            if (this.puzzle.balls[1]) {
                this.puzzle.balls[1].i = Math.min(v, this.puzzle.w - 1);
            }
        };
        this.p2OriginJInput = document.getElementById("editor-p2-origin-j");
        this.p2OriginJInput.onValueChange = (v) => {
            this.dropClear();
            if (this.puzzle.balls[1]) {
                this.puzzle.balls[1].j = Math.min(v, this.puzzle.h - 1);
            }
        };
        this.widthInput = document.getElementById("editor-width");
        this.widthInput.onValueChange = (v) => {
            this.dropClear();
            this.puzzle.w = Math.max(v, 3);
            this.puzzle.rebuildFloor();
        };
        this.floorMaterialInput = document.getElementById("editor-floor-material-index");
        this.floorMaterialInput.onValueChange = (v) => {
            this.puzzle.floorMaterialIndex = (v + this.game.materials.floorMaterials.length) % this.game.materials.floorMaterials.length;
            this.puzzle.rebuildFloor();
        };
        this.widthInsert = document.getElementById("editor-width-insert");
        this.widthInsert.onpointerup = () => {
            let text = SaveAsText(this.puzzle);
            let split = text.split("x");
            split.pop();
            let splitFirstLine = split[0].split("u");
            splitFirstLine[0] = (this.puzzle.w + 1).toFixed(0);
            split[0] = splitFirstLine.reduce((s1, s2) => { return s1 + "u" + s2; });
            text = split.reduce((s1, s2) => { return s1 + "x" + s2; });
            text = text.replaceAll("x", "xo");
            this.puzzle.forceFullBuildingBlockGrid();
            let buildingBlocks = this.puzzle.buildingBlocks;
            buildingBlocks = [new Array(this.puzzle.h).fill(0, 0, this.puzzle.h), ...buildingBlocks];
            text = text + "x" + SerializeBuildingBlocks(buildingBlocks);
            this.puzzle.data.content = text;
            this.puzzle.reset();
            this.initValues();
        };
        this.widthDelete = document.getElementById("editor-width-delete");
        this.widthDelete.onpointerup = () => {
            if (this.puzzle.w <= 3) {
                return;
            }
            let text = SaveAsText(this.puzzle);
            let split = text.split("x");
            split.pop();
            let splitFirstLine = split[0].split("u");
            splitFirstLine[0] = (this.puzzle.w - 1).toFixed(0);
            split[0] = splitFirstLine.reduce((s1, s2) => { return s1 + "u" + s2; });
            for (let i = 1; i < split.length - 1; i++) {
                split[i] = split[i].substring(1);
            }
            text = split.reduce((s1, s2) => { return s1 + "x" + s2; });
            this.puzzle.forceFullBuildingBlockGrid();
            let buildingBlocks = this.puzzle.buildingBlocks;
            buildingBlocks.splice(0, 1);
            text = text + "x" + SerializeBuildingBlocks(buildingBlocks);
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
        this.heightInsert.onpointerup = () => {
            let text = SaveAsText(this.puzzle);
            let split = text.split("x");
            split.pop();
            let splitFirstLine = split[0].split("u");
            splitFirstLine[1] = (this.puzzle.h + 1).toFixed(0);
            split[0] = splitFirstLine.reduce((s1, s2) => { return s1 + "u" + s2; });
            split.push(("").padStart(this.puzzle.w, "o"));
            text = split.reduce((s1, s2) => { return s1 + "x" + s2; });
            this.puzzle.forceFullBuildingBlockGrid();
            let buildingBlocks = this.puzzle.buildingBlocks;
            buildingBlocks.forEach(col => {
                col.splice(0, 0, 0);
            });
            text = text + "x" + SerializeBuildingBlocks(buildingBlocks);
            this.puzzle.data.content = text;
            this.puzzle.reset();
            this.initValues();
        };
        this.heightDelete = document.getElementById("editor-height-delete");
        this.heightDelete.onpointerup = () => {
            if (this.puzzle.h <= 3) {
                return;
            }
            let text = SaveAsText(this.puzzle);
            let split = text.split("x");
            split.pop();
            let splitFirstLine = split[0].split("u");
            splitFirstLine[1] = (this.puzzle.h - 1).toFixed(0);
            split[0] = splitFirstLine.reduce((s1, s2) => { return s1 + "u" + s2; });
            split.pop();
            text = split.reduce((s1, s2) => { return s1 + "x" + s2; });
            this.puzzle.forceFullBuildingBlockGrid();
            let buildingBlocks = this.puzzle.buildingBlocks;
            buildingBlocks.forEach(col => {
                col.splice(0, 1);
            });
            text = text + "x" + SerializeBuildingBlocks(buildingBlocks);
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
        this.buttonTileOneButton = document.getElementById("button-one-btn");
        this.buttonTileTwoButton = document.getElementById("button-two-btn");
        this.buttonTileThreeButton = document.getElementById("button-three-btn");
        this.doorTileOneButton = document.getElementById("door-one-btn");
        this.doorTileTwoButton = document.getElementById("door-two-btn");
        this.doorTileThreeButton = document.getElementById("door-three-btn");
        this.pushTileButton = document.getElementById("push-tile-btn");
        this.holeButton = document.getElementById("hole-btn");
        this.wallButton = document.getElementById("wall-btn");
        this.waterButton = document.getElementById("water-btn");
        this.boxButton = document.getElementById("box-btn");
        this.ramp1Button = document.getElementById("ramp-1-btn");
        this.ramp2Button = document.getElementById("ramp-2-btn");
        this.ramp3Button = document.getElementById("ramp-3-btn");
        this.ramp4Button = document.getElementById("ramp-4-btn");
        this.bridgeButton = document.getElementById("bridge-btn");
        this.creepButton = document.getElementById("creep-btn");
        this.treeButton = document.getElementById("tree-btn");
        this.noboriButton = document.getElementById("nobori-btn");
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
            this.buttonTileOneButton,
            this.buttonTileTwoButton,
            this.buttonTileThreeButton,
            this.doorTileOneButton,
            this.doorTileTwoButton,
            this.doorTileThreeButton,
            this.pushTileButton,
            this.holeButton,
            this.wallButton,
            this.waterButton,
            this.boxButton,
            this.ramp1Button,
            this.ramp2Button,
            this.ramp3Button,
            this.ramp4Button,
            this.bridgeButton,
            this.creepButton,
            this.treeButton,
            this.noboriButton
        ];
        let makeBrushButton = (button, brush, value, cursorSize) => {
            if (!cursorSize) {
                cursorSize = {};
            }
            button.onpointerup = () => {
                this.dropClear();
                this.unselectAllButtons();
                if (this.brush != brush || (isFinite(value) && this.brushColor != value)) {
                    this.brush = brush;
                    this.brushColor = value;
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
        makeBrushButton(this.buttonTileOneButton, EditorBrush.Button, 1);
        makeBrushButton(this.buttonTileTwoButton, EditorBrush.Button, 2);
        makeBrushButton(this.buttonTileThreeButton, EditorBrush.Button, 3);
        makeBrushButton(this.doorTileOneButton, EditorBrush.Door, 1);
        makeBrushButton(this.doorTileTwoButton, EditorBrush.Door, 2);
        makeBrushButton(this.doorTileThreeButton, EditorBrush.Door, 3);
        makeBrushButton(this.pushTileButton, EditorBrush.Push);
        makeBrushButton(this.holeButton, EditorBrush.Hole);
        makeBrushButton(this.wallButton, EditorBrush.Wall);
        makeBrushButton(this.waterButton, EditorBrush.Water);
        makeBrushButton(this.boxButton, EditorBrush.Box, undefined, { w: 1, h: 1, d: 1 });
        makeBrushButton(this.ramp1Button, EditorBrush.Ramp, 1, { w: 1, h: 1, d: 3 });
        makeBrushButton(this.ramp2Button, EditorBrush.Ramp, 2, { w: 2, h: 1, d: 3 });
        makeBrushButton(this.ramp3Button, EditorBrush.Ramp, 3, { w: 3, h: 1, d: 3 });
        makeBrushButton(this.ramp4Button, EditorBrush.Ramp, 4, { w: 4, h: 1, d: 3 });
        makeBrushButton(this.bridgeButton, EditorBrush.Bridge, undefined, { w: 4, h: 1, d: 2 });
        makeBrushButton(this.creepButton, EditorBrush.Creep);
        makeBrushButton(this.treeButton, EditorBrush.Tree);
        makeBrushButton(this.noboriButton, EditorBrush.Nobori);
        makeBrushButton(this.deleteButton, EditorBrush.Delete);
        this.haikuIInput = document.getElementById("haiku-i");
        this.haikuIInput.onValueChange = (v) => {
            if (this.puzzle.haiku) {
                this.puzzle.haiku.position.x = v * 0.55;
            }
        };
        this.haikuJInput = document.getElementById("haiku-j");
        this.haikuJInput.onValueChange = (v) => {
            if (this.puzzle.haiku) {
                this.puzzle.haiku.position.z = v * 0.55;
            }
        };
        this.haikuContent = document.getElementById("haiku-content");
        this.haikuUpdateButton = document.getElementById("haiku-update");
        this.haikuUpdateButton.onpointerup = () => {
            let content = this.haikuContent.value;
            if (content === "") {
                this.puzzle.data.haiku = undefined;
                if (this.puzzle.haiku) {
                    this.puzzle.haiku.dispose();
                    this.puzzle.haiku = undefined;
                }
            }
            else {
                if (!this.puzzle.haiku) {
                    let haiku = new Haiku(this.game, "");
                    haiku.position.y = 0.1;
                    this.puzzle.haiku = haiku;
                }
                this.puzzle.haiku.setText(content);
            }
        };
        document.getElementById("play-btn").onpointerup = async () => {
            this.dropClear();
            this.dropBrush();
            this.puzzle.data.content = SaveAsText(this.puzzle);
            this.puzzle.reset(true);
            location.hash = "#editor-preview";
        };
        document.getElementById("save-btn").onpointerup = () => {
            this.dropClear();
            this.dropBrush();
            let content = SaveAsText(this.puzzle, true);
            Nabu.download("puzzle.txt", content);
        };
        document.getElementById("load-btn").onpointerup = () => {
            this.dropClear();
            this.dropBrush();
            document.getElementById("load-file-input").style.display = "";
        };
        document.getElementById("load-file-input").onchange = (event) => {
            let files = event.target.files;
            let file = files[0];
            if (file) {
                const reader = new FileReader();
                reader.addEventListener('load', async (event) => {
                    let content = event.target.result;
                    let haiku;
                    if (content && typeof (content) === "string") {
                        if (content.indexOf("[HAIKU]") != -1) {
                            let pslit = content.split("[HAIKU]");
                            content = pslit[0];
                            haiku = pslit[1].replaceAll("\\n", "\n");
                        }
                    }
                    this.puzzle.resetFromData({
                        id: null,
                        title: "Custom Machine",
                        author: "Editor",
                        content: content,
                        haiku: haiku
                    });
                    await this.puzzle.instantiate();
                    this.initValues();
                });
                reader.readAsText(file);
            }
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
        this.puzzleIdInput = document.querySelector("#id-input");
        this.eulaCheckbox = document.querySelector("#eula-checkbox");
        document.getElementById("publish-btn").onpointerup = async () => {
            this.dropClear();
            this.dropBrush();
            this.setPublishState(0);
            this.eulaCheckbox.checked = false;
            this.updatePublishBtn();
        };
        if (OFFLINE_MODE) {
            document.getElementById("publish-btn").classList.add("locked");
        }
        else {
            document.getElementById("publish-btn").classList.remove("locked");
        }
        this.titleInput.onchange = this.updatePublishBtn;
        this.authorInput.onchange = this.updatePublishBtn;
        this.eulaCheckbox.onchange = this.updatePublishBtn;
        this.publishConfirmButton.onpointerup = async () => {
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
                    content: SaveAsText(this.puzzle, true),
                    id: null
                };
                let headers = {
                    "Content-Type": "application/json",
                };
                if (DEV_MODE_ACTIVATED) {
                    let puzzleId = null;
                    let idStr = this.puzzleIdInput.value;
                    if (idStr != "") {
                        puzzleId = parseInt(idStr);
                    }
                    data.id = puzzleId;
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
                let url = "https://carillion.tiaratum.com/#puzzle-" + id.toFixed(0);
                document.querySelector("#publish-generated-url").setAttribute("value", url);
                document.querySelector("#publish-generated-url-go").parentElement.href = url;
                document.querySelector("#publish-generated-url-copy").onpointerup = () => { navigator.clipboard.writeText(url); };
                this.setPublishState(2);
                this._pendingPublish = false;
            }
            catch (e) {
                this.setPublishState(3);
                this._pendingPublish = false;
            }
        };
        document.getElementById("publish-read-eula-btn").onpointerup = async () => {
            this.game.router.eulaPage.show(0);
        };
        this.publishCancelButton.onpointerup = async () => {
            this.publishForm.style.display = "none";
        };
        document.querySelectorAll(".publish-ok-btn").forEach(btn => {
            btn.onpointerup = () => {
                this.publishForm.style.display = "none";
            };
        });
        this.clearButton = document.getElementById("clear-btn");
        this.doClearButton = document.getElementById("doclear-btn");
        this.clearButton.onpointerup = () => {
            this.clearButton.parentElement.style.display = "none";
            this.doClearButton.parentElement.style.display = "block";
        };
        this.doClearButton.onpointerup = async () => {
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
        document.getElementById("switch-north-btn").onpointerup = undefined;
        document.getElementById("switch-east-btn").onpointerup = undefined;
        document.getElementById("switch-south-btn").onpointerup = undefined;
        document.getElementById("switch-west-btn").onpointerup = undefined;
        document.getElementById("tile-north-btn").onpointerup = undefined;
        document.getElementById("tile-east-btn").onpointerup = undefined;
        document.getElementById("tile-south-btn").onpointerup = undefined;
        document.getElementById("tile-west-btn").onpointerup = undefined;
        document.getElementById("box-btn").onpointerup = undefined;
        document.getElementById("ramp-1-btn").onpointerup = undefined;
        document.getElementById("ramp-2-btn").onpointerup = undefined;
        document.getElementById("ramp-3-btn").onpointerup = undefined;
        document.getElementById("ramp-4-btn").onpointerup = undefined;
        document.getElementById("bridge-btn").onpointerup = undefined;
        document.getElementById("hole-btn").onpointerup = undefined;
        document.getElementById("save-btn").onpointerup = undefined;
        document.getElementById("load-btn").onpointerup = undefined;
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
        if (DEV_MODE_ACTIVATED) {
            this.puzzleIdInput.parentElement.style.display = "";
            if (this.puzzle.data.id) {
                this.puzzleIdInput.value = this.puzzle.data.id.toFixed(0);
            }
            this.titleInput.value = this.puzzle.data.title;
            this.authorInput.value = this.puzzle.data.author;
        }
        else {
            this.puzzleIdInput.parentElement.style.display = "none";
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
    SwitchToMiniatureCamera() {
        let cam = this.game.camera;
        cam.mode = 1;
        cam.orthoTop = 5;
        cam.orthoBottom = -5;
        cam.orthoRight = 5 * this.game.screenRatio;
        cam.orthoLeft = -5 * this.game.screenRatio;
        cam.target.x = 0.5 * (this.puzzle.xMin + this.puzzle.xMax);
        cam.target.y = 0;
        cam.target.z = 0.5 * (this.puzzle.zMin + this.puzzle.zMax);
        cam.alpha = -Math.PI * 0.6;
        cam.beta = Math.PI * 0.2;
    }
}
class HaikuMaker {
    static GetTranslatedHaikuText(puzzle, locale) {
        if (!locale) {
            locale = LOCALE;
        }
        if (puzzle.data.id === 74) {
            return GetTranslatedTitle(puzzle.data) + "\n\n" + I18Nizer.GetText("lesson-1-haiku", locale);
        }
        if (puzzle.data.id === 157) {
            return I18Nizer.GetText("lesson-2-haiku", locale).replaceAll("\n", " ");
        }
        if (puzzle.data.id === 158) {
            return GetTranslatedTitle(puzzle.data) + "\n\n" + I18Nizer.GetText("lesson-3-haiku", locale);
        }
        if (puzzle.data.id === 159) {
            return GetTranslatedTitle(puzzle.data) + "\n\n" + I18Nizer.GetText("lesson-4-haiku", locale);
        }
        if (puzzle.data.id === 161) {
            return GetTranslatedTitle(puzzle.data) + "\n\n" + I18Nizer.GetText("lesson-5-haiku", locale);
        }
        if (puzzle.data.id === 164) {
            return GetTranslatedTitle(puzzle.data) + "\n\n" + I18Nizer.GetText("lesson-6-haiku", locale);
        }
        if (puzzle.data.id === 162) {
            return GetTranslatedTitle(puzzle.data) + "\n\n" + I18Nizer.GetText("lesson-7-haiku", locale);
        }
        if (puzzle.data.id === 165) {
            return GetTranslatedTitle(puzzle.data) + "\n\n" + I18Nizer.GetText("lesson-8-haiku", locale);
        }
        if (puzzle.data.id === 166) {
            return GetTranslatedTitle(puzzle.data) + "\n\n" + I18Nizer.GetText("lesson-9-haiku", locale);
        }
        if (puzzle.data.id === 174) {
            return I18Nizer.GetText("challenge-bridge-haiku", locale);
        }
        if (puzzle.data.id === 175) {
            return I18Nizer.GetText("challenge-gates-haiku", locale);
        }
        return undefined;
    }
    static MakeHaiku(puzzle) {
        if (puzzle.data.id === 74 && puzzle.data.state === 2) {
            let tile = puzzle.tiles.filter((tile) => {
                return tile instanceof BlockTile;
            });
            tile = tile.sort((t1, t2) => {
                return (t1.i + t1.j) - (t2.i + t2.j);
            });
            if (tile[0]) {
                let tileHaiku = new HaikuTile(puzzle.game, "", tile[0]);
                puzzle.tileHaikus.push(tileHaiku);
            }
            for (let i = 1; i < tile.length; i++) {
                if (tile[i]) {
                    let tileHaiku = new HaikuTile(puzzle.game, "", tile[i]);
                    puzzle.tileHaikus.push(tileHaiku);
                }
            }
        }
        if (puzzle.data.id === 161 && puzzle.data.state === 2) {
            let buttonTile = puzzle.tiles.filter((tile) => {
                return tile instanceof ButtonTile;
            });
            if (buttonTile[0]) {
                let tileHaiku = new HaikuTile(puzzle.game, "", buttonTile[0]);
                puzzle.tileHaikus.push(tileHaiku);
            }
            let doorTiles = puzzle.tiles.filter((tile) => {
                return tile instanceof DoorTile;
            });
            doorTiles = doorTiles.sort((t1, t2) => {
                return (t1.i + t1.j) - (t2.i + t2.j);
            });
            if (doorTiles[0]) {
                let tileHaiku = new HaikuTile(puzzle.game, "", doorTiles[0], 1);
                puzzle.tileHaikus.push(tileHaiku);
            }
        }
        if (puzzle.data.id === 157 && puzzle.data.state === 2) {
            let switchTiles = puzzle.tiles.filter((tile) => {
                return tile instanceof SwitchTile;
            });
            if (switchTiles[0]) {
                let tileHaiku = new HaikuTile(puzzle.game, "", switchTiles[0]);
                puzzle.tileHaikus.push(tileHaiku);
            }
            if (switchTiles[1]) {
                let tileHaiku = new HaikuTile(puzzle.game, "", switchTiles[1]);
                puzzle.tileHaikus.push(tileHaiku);
            }
        }
        if (puzzle.data.id === 151 && puzzle.data.state === 8) {
            let switchTile = puzzle.tiles.filter((tile) => {
                return tile instanceof SwitchTile && tile.color === 3;
            });
            if (switchTile[0]) {
                let tileHaiku = new HaikuTile(puzzle.game, "", switchTile[0]);
                puzzle.tileHaikus.push(tileHaiku);
            }
        }
    }
}
class Haiku extends BABYLON.Mesh {
    constructor(game, text, w = 1000, h = 1000) {
        super("haiku");
        this.game = game;
        this.w = w;
        this.h = h;
        this.animateVisibility = Mummu.AnimationFactory.EmptyNumberCallback;
        this.inRange = false;
        BABYLON.CreateGroundVertexData({ width: 5 * this.w / 1000, height: 5 * this.h / 1000 }).applyToMesh(this);
        let haikuMaterial = new BABYLON.StandardMaterial("test-haiku-material");
        this.dynamicTexture = new BABYLON.DynamicTexture("haiku-texture", { width: this.w, height: this.h });
        this.dynamicTexture.hasAlpha = true;
        haikuMaterial.diffuseTexture = this.dynamicTexture;
        haikuMaterial.specularColor.copyFromFloats(0, 0, 0);
        haikuMaterial.useAlphaFromDiffuseTexture = true;
        this.material = haikuMaterial;
        this.setText(text);
        this.animateVisibility = Mummu.AnimationFactory.CreateNumber(this, this, "visibility");
        this.visibility = 0;
    }
    dispose() {
        this.material.dispose(true, true);
        super.dispose(false, true);
    }
    setText(text) {
        if (IsTouchScreen) {
            text = text.replaceAll("[A]", " <- ");
            text = text.replaceAll("[D]", " -> ");
        }
        this.text = text;
        let lines = text.split("\n");
        let context = this.dynamicTexture.getContext();
        context.clearRect(0, 0, this.w, this.h);
        //context.fillStyle = "#00000020";
        //context.fillRect(0, 0, this.w, this.h);
        context.fillStyle = "#473a2fFF";
        context.fillStyle = this.game.puzzle.haikuColor;
        context.font = "90px Julee";
        let lineHeight = 120;
        if (LOCALE === "de") {
            context.font = "70px Julee";
            lineHeight = 90;
        }
        for (let l = 0; l < lines.length; l++) {
            let textLength = context.measureText(lines[l]).width;
            context.fillText(lines[l], this.w * 0.5 - textLength * 0.5, 120 + lineHeight * l);
        }
        this.dynamicTexture.update();
    }
    update(dt) {
        if (this.game.puzzle.balls[0].ballState === BallState.Move) {
            let dx = Math.abs(this.position.x - this.game.puzzle.balls[0].position.x);
            if (!this.inRange) {
                if (dx < 10) {
                    this.inRange = true;
                    this.animateVisibility(1, 2, Nabu.Easing.easeInOutSine);
                }
                return;
            }
            else if (this.inRange) {
                if (dx > 10.5) {
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
        context.clearRect(0, 0, 1000, 1000);
        context.strokeStyle = "#473a2fFF";
        context.fillStyle = "#e3cfb4ff";
        context.lineWidth = 6;
        for (let i = 0; i < 4; i++) {
            let a1 = i * Math.PI * 0.5 + Math.PI * 0.1;
            let a2 = (i + 1) * Math.PI * 0.5 - Math.PI * 0.1;
            context.beginPath();
            context.arc(500, 500, 80, a1, a2);
            context.stroke();
        }
        context.fillStyle = "#473a2fFF";
        context.fillStyle = "#231d17FF";
        context.font = "130px Julee";
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
class HaikuTile extends BABYLON.Mesh {
    constructor(game, text, tile, align = 0) {
        super("haiku");
        this.game = game;
        this.text = text;
        this.tile = tile;
        this.align = align;
        this.animateVisibility = Mummu.AnimationFactory.EmptyNumberCallback;
        this.shown = false;
        BABYLON.CreateGroundVertexData({ width: 5, height: 5 }).applyToMesh(this);
        this.position.copyFrom(this.tile.position);
        this.position.y += 0.01;
        let haikuMaterial = new BABYLON.StandardMaterial("test-haiku-material");
        this.dynamicTexture = new BABYLON.DynamicTexture("haiku-texture", { width: 1000, height: 1000 });
        this.dynamicTexture.hasAlpha = true;
        haikuMaterial.diffuseTexture = this.dynamicTexture;
        haikuMaterial.specularColor.copyFromFloats(0, 0, 0);
        haikuMaterial.useAlphaFromDiffuseTexture = true;
        this.material = haikuMaterial;
        let context = this.dynamicTexture.getContext();
        context.clearRect(0, 0, 1000, 1000);
        context.strokeStyle = "#e3cfb4ff";
        context.lineWidth = 8;
        for (let i = 0; i < 4; i++) {
            let a1 = i * Math.PI * 0.5 + Math.PI * 0.1 - Math.PI * 0.25;
            let a2 = (i + 1) * Math.PI * 0.5 - Math.PI * 0.1 - Math.PI * 0.25;
            context.beginPath();
            context.arc(500, 500, 140, a1, a2);
            context.stroke();
        }
        context.fillStyle = "#e3cfb4ff";
        context.font = "90px Julee";
        if (align === -1) {
            let l = context.measureText(this.text).width;
            context.fillText(this.text, 500 - 180 - l, 530);
        }
        else if (align === 1) {
            let l = context.measureText(this.text).width;
            context.fillText(this.text, 500 + 180, 530);
        }
        else {
            let l = context.measureText(this.text).width;
            context.fillText(this.text, Math.floor(500 - l * 0.5), 740);
        }
        this.dynamicTexture.update();
        this.visibility = 0;
        this.animateVisibility = Mummu.AnimationFactory.CreateNumber(this, this, "visibility");
    }
    show() {
        this.shown = true;
        this.animateVisibility(1, 2, Nabu.Easing.easeInOutSine);
    }
    hide() {
        this.shown = false;
        this.animateVisibility(0, 1, Nabu.Easing.easeInOutSine);
    }
}
class HaikuDebug extends BABYLON.Mesh {
    constructor(game, text) {
        super("haiku");
        this.game = game;
        this.text = text;
        BABYLON.CreateGroundVertexData({ width: 1, height: 0.5 }).applyToMesh(this);
        let haikuMaterial = new BABYLON.StandardMaterial("test-haiku-material");
        this.dynamicTexture = new BABYLON.DynamicTexture("haiku-texture", { width: 200, height: 100 });
        this.dynamicTexture.hasAlpha = true;
        haikuMaterial.diffuseTexture = this.dynamicTexture;
        haikuMaterial.specularColor.copyFromFloats(0, 0, 0);
        haikuMaterial.useAlphaFromDiffuseTexture = true;
        this.material = haikuMaterial;
        let context = this.dynamicTexture.getContext();
        context.fillStyle = "#00000000";
        context.fillRect(0, 0, 200, 100);
        context.fillStyle = "#231d17FF";
        context.font = "100px Julee";
        let l = context.measureText(this.text).width;
        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                context.fillText(this.text, Math.floor(100 - l * 0.5) + x, 80 + y);
            }
        }
        this.dynamicTexture.update();
    }
}
/// <reference path="./Tile.ts"/>
class HoleTile extends Tile {
    constructor(game, props) {
        super(game, props);
        this.covered = false;
        this.rumbling = false;
        this.cracking = false;
        this.color = props.color;
    }
    async instantiate() {
        //await RandomWait();
        await super.instantiate();
        if (this.covered) {
            if (!this.covers) {
                let datas = await this.game.vertexDataLoader.get("./datas/meshes/cracked-tile.babylon");
                let r = Math.floor(4 * Math.random()) * Math.PI * 0.5;
                this.covers = [];
                for (let n = 0; n < 3; n++) {
                    this.covers[n] = new BABYLON.Mesh("cover");
                    this.covers[n].parent = this;
                    this.covers[n].material = this.game.puzzle.floorMaterial;
                }
                this.covers[0].position.copyFromFloats(-0.15, 0, 0.25);
                Mummu.RotateInPlace(this.covers[0].position, BABYLON.Axis.Y, r);
                this.covers[1].position.copyFromFloats(0.3, 0, -0.15);
                Mummu.RotateInPlace(this.covers[1].position, BABYLON.Axis.Y, r);
                this.covers[2].position.copyFromFloats(-0.25, 0, -0.25);
                Mummu.RotateInPlace(this.covers[2].position, BABYLON.Axis.Y, r);
                for (let n = 0; n < 3; n++) {
                    let data = Mummu.CloneVertexData(datas[n]);
                    Mummu.RotateAngleAxisVertexDataInPlace(data, r, BABYLON.Axis.Y);
                    for (let i = 0; i < data.positions.length / 3; i++) {
                        data.uvs[2 * i] = 0.5 * (data.positions[3 * i] + this.position.x + this.covers[n].position.x);
                        data.uvs[2 * i + 1] = 0.5 * (data.positions[3 * i + 2] + this.position.z + this.covers[n].position.z) - 0.5;
                    }
                    data.applyToMesh(this.covers[n]);
                }
            }
        }
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
    async rumble() {
        //await RandomWait();
        if (this.rumbling) {
            return;
        }
        this.game.puzzle.longCrackSound.play();
        this.rumbling = true;
        let t0 = performance.now() / 1000;
        let rumblingLoop = () => {
            if (this.cracking || this.isDisposed()) {
                return;
            }
            else {
                let dt = performance.now() / 1000 - t0;
                for (let i = 0; i < this.covers.length; i++) {
                    this.covers[i].position.y = 0.02 * Math.sin(i * Math.PI / 1.5 + 4 * 2 * Math.PI * dt);
                }
                let onePuckStillOn = false;
                let puzzle = this.game.puzzle;
                for (let i = 0; i < puzzle.ballsCount; i++) {
                    if (this.fallsIn(puzzle.balls[i])) {
                        onePuckStillOn = true;
                    }
                }
                if (onePuckStillOn) {
                    requestAnimationFrame(rumblingLoop);
                }
                else {
                    this.destroyCover();
                }
            }
        };
        rumblingLoop();
    }
    async destroyCover() {
        //await RandomWait();
        if (this.cracking) {
            return;
        }
        this.rumbling = false;
        this.cracking = true;
        this.covered = false;
        let wait = Mummu.AnimationFactory.CreateWait(this);
        let axisUp = BABYLON.Vector3.Cross(this.covers[0].position, BABYLON.Axis.Y);
        let dropUp = Mummu.AnimationFactory.CreateNumber(this.covers[0], this.covers[0].position, "y", () => {
            this.covers[0].rotate(axisUp, 0.02);
        });
        let axisRight = BABYLON.Vector3.Cross(this.covers[1].position, BABYLON.Axis.Y);
        let dropRight = Mummu.AnimationFactory.CreateNumber(this.covers[1], this.covers[1].position, "y", () => {
            this.covers[1].rotate(axisRight, 0.02);
        });
        let axisBottom = BABYLON.Vector3.Cross(this.covers[2].position, BABYLON.Axis.Y);
        let dropBottom = Mummu.AnimationFactory.CreateNumber(this.covers[2], this.covers[2].position, "y", () => {
            this.covers[2].rotate(axisBottom, 0.02);
        });
        /*
        this.game.toonSoundManager.start({
            text: "KRRRK",
            pos: this.covers[0].absolutePosition.clone(),
            color: "#5d7275",
            size: 0.2,
            duration: 0.3,
            type: ToonSoundType.Poc
        });
        */
        this.game.puzzle.snapBassSound.play();
        dropUp(-6, 1, Nabu.Easing.easeInSine).then(() => { this.covers[0].dispose(); this.game.puzzle.fallImpactSound.play(); });
        await wait(0.3);
        /*
        this.game.toonSoundManager.start({
            text: "KRRK",
            pos: this.covers[1].absolutePosition.clone(),
            color: "#5d7275",
            size: 0.2,
            duration: 0.3,
            type: ToonSoundType.Poc
        });
        */
        dropRight(-6, 1, Nabu.Easing.easeInSine).then(() => { this.covers[1].dispose(); this.game.puzzle.fallImpactSound.play(); });
        await wait(0.3);
        /*
        this.game.toonSoundManager.start({
            text: "KRRRRK",
            pos: this.covers[2].absolutePosition.clone(),
            color: "#5d7275",
            size: 0.2,
            duration: 0.3,
            type: ToonSoundType.Poc
        });
        */
        await dropBottom(-6, 1, Nabu.Easing.easeInSine).then(() => { this.covers[2].dispose(); this.game.puzzle.fallImpactSound.play(); });
        this.covers = [];
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
        //await RandomWait();
        return this.nabuPage.show(duration);
    }
    async hide(duration) {
        //await RandomWait();
        return this.nabuPage.hide(duration);
    }
    updateCompletionBars() {
        if (this.router.game.puzzleCompletion) {
            let storyCompletion = this.router.game.puzzleCompletion.storyPuzzleCompletion;
            document.querySelector("#home-story-btn completion-bar").setAttribute("value", storyCompletion.toFixed(2));
            let expertCompletion = this.router.game.puzzleCompletion.expertPuzzleCompletion;
            document.querySelector("#home-expert-btn completion-bar").setAttribute("value", expertCompletion.toFixed(2));
            let communityCompletion = this.router.game.puzzleCompletion.communityPuzzleCompletion;
            document.querySelector("#home-community-btn completion-bar").setAttribute("value", communityCompletion.toFixed(2));
        }
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
        //public page: number = 0;
        //public levelsPerPage: number = 9;
        this.levelCount = 0;
        this.buttons = [];
        this.containerHeight = 500;
        this.containerLineHeight = 150;
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
            console.log(this.nabuPage.querySelector(".square-btn-container").scrollTop);
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
            console.log(this.nabuPage.querySelector(".square-btn-container").scrollTop);
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
            console.log(this.nabuPage.querySelector(".square-btn-container").scrollTop);
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
            console.log(this.nabuPage.querySelector(".square-btn-container").scrollTop);
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
        //await RandomWait();
        return this.nabuPage.show(duration);
    }
    async hide(duration) {
        //await RandomWait();
        return this.nabuPage.hide(duration);
    }
    setSquareButtonOnpointerup(squareButton, n) {
    }
    onPageRedrawn() {
    }
    async redraw() {
        //await RandomWait();
        this.buttons = [];
        this.container = this.nabuPage.querySelector(".square-btn-container");
        let scroll = this.container.scrollTop;
        this.container.innerHTML = "";
        let rect = this.container.getBoundingClientRect();
        this.containerHeight = rect.height;
        this.colCount = Math.floor(rect.width / 156);
        while (this.colCount < 2) {
            this.colCount++;
        }
        let size = Math.floor(rect.width / this.colCount - 16);
        //this.levelsPerPage = this.colCount * (this.rowCount - 1);
        let puzzleTileDatas = await this.getPuzzlesData(0, 200);
        this.rowCount = Math.ceil(puzzleTileDatas.length / this.colCount);
        for (let n = 0; n < puzzleTileDatas.length; n++) {
            let squareButton = document.createElement("button");
            squareButton.style.width = size.toFixed(0) + "px";
            squareButton.style.height = size.toFixed(0) + "px";
            this.container.appendChild(squareButton);
            this.buttons.push(squareButton);
            squareButton.classList.add("square-btn-panel", "bluegrey");
            if (puzzleTileDatas[n].locked) {
                squareButton.classList.add("locked");
            }
            if (puzzleTileDatas[n].classList) {
                squareButton.classList.add(...puzzleTileDatas[n].classList);
            }
            squareButton.onclick = puzzleTileDatas[n].onpointerup;
            let titleField = document.createElement("div");
            titleField.classList.add("square-btn-title");
            let titleText = document.createElement("stroke-text");
            titleText.setContent(GetTranslatedTitle(puzzleTileDatas[n].data));
            titleField.appendChild(titleText);
            squareButton.appendChild(titleField);
            let miniature = PuzzleMiniatureMaker.Generate(puzzleTileDatas[n].data.content);
            miniature.classList.add("square-btn-miniature");
            squareButton.appendChild(miniature);
            let difficultyField = document.createElement("div");
            difficultyField.classList.add("square-btn-difficulty");
            let difficulty = puzzleTileDatas[n].data.difficulty;
            if (difficulty === 0) {
                if (DEV_MODE_ACTIVATED) {
                    difficultyField.classList.add("beige");
                    difficultyField.innerHTML = "UKNWN";
                }
                else {
                    difficultyField.classList.add("blue");
                    difficultyField.innerHTML = "MEDIUM";
                }
            }
            else if (difficulty === 1) {
                difficultyField.classList.add("green");
                difficultyField.innerHTML = "EASY";
            }
            else if (difficulty === 2) {
                difficultyField.classList.add("blue");
                difficultyField.innerHTML = "MEDIUM";
            }
            else if (difficulty === 3) {
                difficultyField.classList.add("orange");
                difficultyField.innerHTML = "HARD";
            }
            else if (difficulty === 4) {
                difficultyField.classList.add("red");
                difficultyField.innerHTML = "EXPERT";
            }
            squareButton.appendChild(difficultyField);
            let authorField = document.createElement("div");
            authorField.classList.add("square-btn-author");
            let authorText = document.createElement("stroke-text");
            authorField.appendChild(authorText);
            squareButton.appendChild(authorField);
            if (puzzleTileDatas[n].data.score != null) {
                let val = "# 1 " + puzzleTileDatas[n].data.player + " " + Game.ScoreToString(puzzleTileDatas[n].data.score);
                authorText.setContent(val);
            }
            else {
                authorText.setContent(puzzleTileDatas[n].data.author);
            }
            if (puzzleTileDatas[n].data.id != null && this.router.game.puzzleCompletion.isPuzzleCompleted(puzzleTileDatas[n].data.id)) {
                let completedStamp = document.createElement("div");
                let starCount = this.router.game.puzzleCompletion.getStarCount(puzzleTileDatas[n].data.id);
                completedStamp.classList.add("stamp");
                completedStamp.classList.add("stamp-" + starCount);
                squareButton.appendChild(completedStamp);
                squareButton.style.borderColor = "var(--color-yellow)";
            }
            else if (puzzleTileDatas[n].new) {
                squareButton.classList.add("highlit", "lightblue");
            }
        }
        if (puzzleTileDatas.length % this.colCount > 0) {
            for (let i = puzzleTileDatas.length; i < Math.ceil(puzzleTileDatas.length / this.colCount) * this.colCount; i++) {
                let squareButton = document.createElement("button");
                squareButton.classList.add("square-btn-panel", "locked");
                squareButton.style.width = size.toFixed(0) + "px";
                squareButton.style.height = size.toFixed(0) + "px";
                squareButton.style.opacity = "0.2";
                this.container.appendChild(squareButton);
            }
        }
        this.container.scrollTop = scroll;
        requestAnimationFrame(() => {
            if (this.buttons.length > this.colCount) {
                let rect0 = this.buttons[0].getBoundingClientRect();
                let rect1 = this.buttons[this.colCount].getBoundingClientRect();
                this.containerLineHeight = rect1.top - rect0.top;
            }
            else {
                this.containerLineHeight = 142;
            }
        });
        if (this.router.game.uiInputManager.inControl) {
            this.setHoveredButtonIndex(this.hoveredButtonIndex);
        }
        this.onPageRedrawn();
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
            return false;
        }
        else if ((!filter || filter(btn))) {
            if (btn) {
                btn.classList.add("hovered");
                let rowIndex = Math.floor(v / this.colCount);
                let delta = (this.containerHeight - this.containerLineHeight) / 2;
                let scrollTop = rowIndex * this.containerLineHeight - delta;
                this.nabuPage.querySelector(".square-btn-container").scrollTo({
                    top: scrollTop,
                    behavior: "smooth"
                });
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
class StoryPuzzlesPage extends LevelPage {
    constructor(queryString, router) {
        super(queryString, router);
        this.nabuPage.querySelector(".puzzle-level-title stroke-text").innerHTML = "Story Mode";
        this.className = "BaseLevelPage";
    }
    onPageRedrawn() {
        if (this.router.game.puzzleCompletion) {
            this.nabuPage.querySelector(".puzzle-level-completion completion-bar").setAttribute("value", this.router.game.puzzleCompletion.storyPuzzleCompletion.toFixed(2));
        }
    }
    async getPuzzlesData(page, levelsPerPage) {
        //await RandomWait();
        let puzzleData = [];
        let data = this.router.game.loadedStoryPuzzles;
        CLEAN_IPuzzlesData(data);
        let completedPuzzles = this.router.game.puzzleCompletion.storyPuzzles.filter(puzzleComp => { return puzzleComp.getStarsCount() > 0; });
        let unlockCount = completedPuzzles.length;
        unlockCount += Math.floor(unlockCount / 4);
        let nextLevelIndex;
        for (let i = 0; i < data.puzzles.length; i++) {
            if (!completedPuzzles.find(e => { return e.puzzleId === data.puzzles[i].id; })) {
                nextLevelIndex = i;
                break;
            }
        }
        for (let i = 0; i < levelsPerPage && i < data.puzzles.length + 2; i++) {
            let n = i + page * levelsPerPage;
            if (data.puzzles[n]) {
                let locked = false;
                let isNew = false;
                if (n === nextLevelIndex) {
                    isNew = true;
                }
                puzzleData[i] = {
                    data: data.puzzles[n],
                    onpointerup: () => {
                        this.router.game.puzzle.resetFromData(data.puzzles[n]);
                        location.hash = "level-" + (n + 1).toFixed(0);
                    },
                    locked: locked,
                    new: isNew
                };
            }
            else if (n === data.puzzles.length) {
                puzzleData[i] = {
                    data: {
                        id: null,
                        title: "Try the Expert Mode",
                        author: "Expert Mode",
                        content: "0u0u0xaoooooooaxoowwnnnoaxonnwnnnorxonnwNoooOxonnwWoooOxonnwwnnorxoowwwnnoaxooooooooa",
                    },
                    onpointerup: () => {
                        location.hash = "#expert-puzzles";
                    },
                    classList: ["red"]
                };
            }
            else if (n === data.puzzles.length + 1) {
                puzzleData[i] = {
                    data: {
                        id: null,
                        title: "Enjoy many more Custom Puzzles !",
                        author: "Community",
                        content: "0u0u0xaoooooooaxoowwnnnoaxonnwnnnorxonnwNoooOxonnwWoooOxonnwwnnorxoowwwnnoaxooooooooa",
                    },
                    onpointerup: () => {
                        location.hash = "#community-puzzles";
                    },
                    classList: ["green"]
                };
            }
        }
        return puzzleData;
    }
}
class XMasPuzzlesPage extends LevelPage {
    constructor(queryString, router) {
        super(queryString, router);
        this.nabuPage.querySelector(".puzzle-level-title stroke-text").innerHTML = "Advent Cal. 2024";
        this.className = "XMasPuzzlesPage";
    }
    onPageRedrawn() {
        if (this.router.game.puzzleCompletion) {
            this.nabuPage.querySelector(".puzzle-level-completion completion-bar").setAttribute("value", this.router.game.puzzleCompletion.xmasPuzzleCompletion.toFixed(2));
        }
    }
    async getPuzzlesData(page, levelsPerPage) {
        //await RandomWait();
        let puzzleData = [];
        let data = this.router.game.loadedXMasPuzzles;
        CLEAN_IPuzzlesData(data);
        for (let i = 0; i < levelsPerPage && i < data.puzzles.length; i++) {
            let n = i + page * levelsPerPage;
            if (data.puzzles[n]) {
                let locked = true;
                if (data.puzzles[n].numLevel <= this.router.game.dayOfXMasCal) {
                    locked = false;
                }
                puzzleData[i] = {
                    data: data.puzzles[n],
                    onpointerup: () => {
                        this.router.game.puzzle.resetFromData(data.puzzles[n]);
                        location.hash = "puzzle-" + data.puzzles[n].id.toFixed(0);
                    },
                    locked: locked
                };
            }
        }
        let externalLinkData = {
            data: {
                id: null,
                title: "Play Carillion original puzzles !\n\n(clic to leave this page)",
                author: "Tiaratum Games",
                content: "11u14u5u9u2xoooooooooooxoooosssooooxoooosssooooxoooosssooooxoooososooooxoooosssooooxoooosssooooxoooosssooooxoooosssooooxooooosoooooxoooooooooooxoooosssooooxoooosssooooxooooooooooo",
            },
            onpointerup: () => {
                let a = document.createElement("a");
                a.href = "https://svenfrankson.itch.io/monkeymind";
                a.target = "_blank";
                a.click();
            },
            classList: ["green"]
        };
        puzzleData.splice(this.router.game.dayOfXMasCal, 0, externalLinkData);
        return puzzleData;
    }
}
class ExpertPuzzlesPage extends LevelPage {
    constructor(queryString, router) {
        super(queryString, router);
        this.nabuPage.querySelector(".puzzle-level-title stroke-text").innerHTML = "Expert Mode";
        this.className = "ExpertLevelPage";
    }
    onPageRedrawn() {
        if (this.router.game.puzzleCompletion) {
            this.nabuPage.querySelector(".puzzle-level-completion completion-bar").setAttribute("value", this.router.game.puzzleCompletion.expertPuzzleCompletion.toFixed(2));
        }
    }
    async getPuzzlesData(page, levelsPerPage) {
        //await RandomWait();
        let puzzleData = [];
        let data = this.router.game.loadedExpertPuzzles;
        CLEAN_IPuzzlesData(data);
        for (let i = 0; i < levelsPerPage && i < data.puzzles.length + 2; i++) {
            let n = i + page * levelsPerPage;
            if (data.puzzles[n]) {
                let locked = true;
                let storyIds = this.router.game.expertIdToStoryId(data.puzzles[n].id);
                for (let j = 0; j < storyIds.length; j++) {
                    if (this.router.game.puzzleCompletion.isPuzzleCompleted(storyIds[j])) {
                        locked = false;
                    }
                }
                puzzleData[i] = {
                    data: data.puzzles[n],
                    onpointerup: () => {
                        this.router.game.puzzle.resetFromData(data.puzzles[n]);
                        location.hash = "puzzle-" + data.puzzles[n].id.toFixed(0);
                    },
                    locked: locked
                };
            }
            else if (n === data.puzzles.length) {
                puzzleData[i] = {
                    data: {
                        id: null,
                        title: "Back to Story Mode",
                        author: "Story Mode",
                        content: "0u0u0xaoooooooaxoowwnnnoaxonnwnnnorxonnwNoooOxonnwWoooOxonnwwnnorxoowwwnnoaxooooooooa",
                    },
                    onpointerup: () => {
                        location.hash = "#levels";
                    },
                    classList: ["lightblue"]
                };
            }
            else if (n === data.puzzles.length + 1) {
                puzzleData[i] = {
                    data: {
                        id: null,
                        title: "Enjoy many more Custom Puzzles !",
                        author: "Community",
                        content: "0u0u0xaoooooooaxoowwnnnoaxonnwnnnorxonnwNoooOxonnwWoooOxonnwwnnorxoowwwnnoaxooooooooa",
                    },
                    onpointerup: () => {
                        location.hash = "#community-puzzles";
                    },
                    classList: ["green"]
                };
            }
        }
        return puzzleData;
    }
}
class CommunityPuzzlesPage extends LevelPage {
    constructor(queryString, router) {
        super(queryString, router);
        this.nabuPage.querySelector(".puzzle-level-title stroke-text").innerHTML = "Community Puzzles";
        this.className = "CommunityLevelPage";
    }
    onPageRedrawn() {
        if (this.router.game.puzzleCompletion) {
            this.nabuPage.querySelector(".puzzle-level-completion completion-bar").setAttribute("value", this.router.game.puzzleCompletion.communityPuzzleCompletion.toFixed(2));
        }
    }
    async getPuzzlesData(page, levelsPerPage) {
        //await RandomWait();
        if (true) {
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
                    onpointerup: () => {
                        this.router.game.puzzle.resetFromData(data.puzzles[i]);
                        location.hash = "puzzle-" + id;
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
        //await RandomWait();
        let puzzleData = [];
        let data = this.router.game.loadedCommunityPuzzles;
        for (let i = 0; i < levelsPerPage && i < data.puzzles.length; i++) {
            let n = i + page * levelsPerPage;
            if (data.puzzles[n]) {
                puzzleData[i] = {
                    data: data.puzzles[n],
                    onpointerup: () => {
                        this.router.game.puzzle.resetFromData(data.puzzles[n]);
                        location.hash = "puzzle-" + data.puzzles[n].id;
                    }
                };
            }
        }
        return puzzleData;
    }
}
class DevPuzzlesPage extends LevelPage {
    constructor(queryString, router) {
        super(queryString, router);
        this.levelStateToFetch = 0;
        this.nabuPage.querySelector(".puzzle-level-title stroke-text").innerHTML = "Dev Puzzles";
        this.className = "DevLevelPage";
    }
    onPageRedrawn() {
        this.nabuPage.querySelector(".puzzle-level-title stroke-text").innerHTML = "DevMode : " + DEV_MODES_NAMES[this.levelStateToFetch] + " Puzzles";
    }
    async getPuzzlesData(page, levelsPerPage) {
        //await RandomWait();
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
                if (this.levelStateToFetch === 2 || this.levelStateToFetch === 3) {
                    data.puzzles[i].title += " (" + data.puzzles[i].story_order.toFixed(0) + ")" + " #" + data.puzzles[i].id.toFixed(0);
                }
                puzzleData[i] = {
                    data: data.puzzles[i],
                    onpointerup: () => {
                        this.router.game.puzzle.resetFromData(data.puzzles[i]);
                        location.hash = "puzzle-" + id;
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
class MultiplayerPuzzlesPage extends LevelPage {
    constructor(queryString, router) {
        super(queryString, router);
        this.levelStateToFetch = 0;
        this.nabuPage.querySelector(".puzzle-level-title stroke-text").innerHTML = "Multiplayer Mode";
        this.className = "MultiplayerLevelPage";
    }
    async getPuzzlesData(page, levelsPerPage) {
        //await RandomWait();
        let puzzleData = [];
        let data = this.router.game.loadedMultiplayerPuzzles;
        CLEAN_IPuzzlesData(data);
        for (let i = 0; i < levelsPerPage && i < data.puzzles.length + 1; i++) {
            let n = i + page * levelsPerPage;
            if (data.puzzles[n]) {
                puzzleData[i] = {
                    data: data.puzzles[n],
                    onpointerup: () => {
                        this.router.game.puzzle.resetFromData(data.puzzles[n]);
                        location.hash = "puzzle-" + data.puzzles[n].id.toFixed(0);
                    }
                };
            }
        }
        return puzzleData;
    }
}
/// <reference path="../lib/nabu/nabu.d.ts"/>
/// <reference path="../lib/mummu/mummu.d.ts"/>
/// <reference path="../lib/babylon.d.ts"/>
//mklink /D C:\Users\tgames\OneDrive\Documents\GitHub\fluid-x\lib\nabu\ C:\Users\tgames\OneDrive\Documents\GitHub\nabu
var MAJOR_VERSION = 2;
var MINOR_VERSION = 0;
var PATCH_VERSION = 3;
var VERSION = MAJOR_VERSION * 1000 + MINOR_VERSION * 100 + PATCH_VERSION;
var CONFIGURATION_VERSION = MAJOR_VERSION * 1000 + MINOR_VERSION * 100 + PATCH_VERSION;
var observed_progress_speed_percent_second;
var setProgressIndex;
var GLOBAL_GAME_LOAD_CURRENT_STEP;
var USE_POKI_SDK;
var USE_CG_SDK;
var OFFLINE_MODE;
var NO_VERTEX_DATA_LOADER;
var ADVENT_CAL;
var PokiSDK;
var CrazySDK;
var LOCALE = "en";
var SDKPlaying = false;
function SDKGameplayStart() {
    if (!SDKPlaying) {
        console.log("SDK Gameplay Start");
        if (USE_POKI_SDK) {
            PokiSDK.gameplayStart();
        }
        else if (USE_CG_SDK) {
            CrazySDK.game.gameplayStart();
        }
        SDKPlaying = true;
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
function SDKGameplayStop() {
    if (SDKPlaying) {
        console.log("SDK Gameplay Stop");
        if (USE_POKI_SDK) {
            PokiSDK.gameplayStop();
        }
        else if (USE_CG_SDK) {
            CrazySDK.game.gameplayStop();
        }
        SDKPlaying = false;
    }
}
var PlayerHasInteracted = false;
var IsTouchScreen = 1;
var IsMobile = -1;
var HasLocalStorage = false;
function StorageGetItem(key) {
    if (USE_CG_SDK) {
        return CrazySDK.data.getItem(key);
    }
    else {
        return localStorage.getItem(key);
    }
}
function StorageSetItem(key, value) {
    if (USE_CG_SDK) {
        CrazySDK.data.setItem(key, value);
    }
    else {
        localStorage.setItem(key, value);
    }
}
var SHARE_SERVICE_PATH = "https://carillion.tiaratum.com/index.php/";
if (location.host.startsWith("127.0.0.1")) {
    //SHARE_SERVICE_PATH = "http://localhost/index.php/";
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
function firstPlayerInteraction() {
    Game.Instance.onResize();
    setTimeout(() => {
        document.getElementById("click-anywhere-screen").style.display = "none";
        if (Game.Instance.puzzleCompletion.completedPuzzles.length === 0) {
            if (location.hash != "#level-1") {
                location.hash = "#level-1";
            }
        }
        else {
            console.error("Welcome back");
        }
    }, 300);
    IsMobile = /(?:phone|windows\s+phone|ipod|blackberry|(?:android|bb\d+|meego|silk|googlebot) .+? mobile|palm|windows\s+ce|opera\smini|avantgo|mobilesafari|docomo)/i.test(navigator.userAgent) ? 1 : 0;
    if (IsMobile === 1) {
        document.body.classList.add("mobile");
    }
    PlayerHasInteracted = true;
}
let onFirstPlayerInteractionTouch = (ev) => {
    if (!Game.Instance.gameLoaded) {
        return;
    }
    console.log("onFirstPlayerInteractionTouch");
    ev.stopPropagation();
    document.body.removeEventListener("touchstart", onFirstPlayerInteractionTouch);
    IsTouchScreen = 1;
    document.body.classList.add("touchscreen");
    Game.Instance.camera.panningSensibility *= 0.4;
    if (!PlayerHasInteracted) {
        firstPlayerInteraction();
    }
};
let onFirstPlayerInteractionClick = (ev) => {
    if (!Game.Instance.gameLoaded) {
        return;
    }
    console.log("onFirstPlayerInteractionClic");
    ev.stopPropagation();
    document.body.removeEventListener("click", onFirstPlayerInteractionClick);
    if (!PlayerHasInteracted) {
        firstPlayerInteraction();
    }
};
let onFirstPlayerInteractionKeyboard = (ev) => {
    if (!ev.code) {
        return;
    }
    if (!Game.Instance.gameLoaded) {
        return;
    }
    console.log("onFirstPlayerInteractionKeyboard");
    ev.stopPropagation();
    document.body.removeEventListener("keydown", onFirstPlayerInteractionKeyboard);
    IsTouchScreen = 0;
    document.body.classList.remove("touchscreen");
    if (!PlayerHasInteracted) {
        firstPlayerInteraction();
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
        //public playCameraRange: number = 15;
        this.playCameraRadiusFactor = 0;
        this.playCameraRadius = 20;
        this.playCameraMinRadius = 10;
        this.playCameraMaxRadius = 50;
        this.cameraOrtho = false;
        this.animLightIntensity = Mummu.AnimationFactory.EmptyNumberCallback;
        this.animSpotlightIntensity = Mummu.AnimationFactory.EmptyNumberCallback;
        this.player1Name = "";
        this.player2Name = "";
        this.dayOfXMasCal = 1;
        this._mode = GameMode.Menu;
        this.gameLoaded = false;
        this._bodyColorIndex = 0;
        this._bodyPatternIndex = 0;
        this.onResize = () => {
            let rect = this.canvas.getBoundingClientRect();
            this.screenRatio = rect.width / rect.height;
            if (this.screenRatio < 1) {
                document.body.classList.add("vertical");
                this.playCameraMinRadius = 20;
            }
            else {
                document.body.classList.remove("vertical");
            }
            this.engine.resize(true);
            this.canvas.setAttribute("width", Math.floor(rect.width * this.performanceWatcher.devicePixelRatio).toFixed(0));
            this.canvas.setAttribute("height", Math.floor(rect.height * this.performanceWatcher.devicePixelRatio).toFixed(0));
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
        this.storyExpertTable = [];
        this._curtainOpacity = 0;
        this.fadeIntroDir = 0;
        Game.Instance = this;
        this.canvas = document.getElementById(canvasElement);
        this.canvas.requestPointerLock = this.canvas.requestPointerLock || this.canvas.msRequestPointerLock || this.canvas.mozRequestPointerLock || this.canvas.webkitRequestPointerLock;
        this.canvasCurtain = document.getElementById("canvas-curtain");
        this.engine = new BABYLON.Engine(this.canvas, true, undefined, false);
        BABYLON.Engine.ShadersRepository = "./shaders/";
        BABYLON.Engine.audioEngine.useCustomUnlockedButton = true;
        BABYLON.Engine.audioEngine.lock();
        this.soundManager = new SoundManager();
        this.uiInputManager = new UserInterfaceInputManager(this);
        this.performanceWatcher = new PerformanceWatcher(this);
    }
    getScene() {
        return this.scene;
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
        this._bodyColorIndex = v;
        this.scene.clearColor = BABYLON.Color4.FromHexString(hexColors[5] + "FF");
        this.scene.clearColor.a = 1;
    }
    get bodyPatternIndex() {
        return this._bodyPatternIndex;
    }
    set bodyPatternIndex(v) {
        this._bodyPatternIndex = v;
    }
    async createScene() {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = BABYLON.Color4.FromHexString("#00000000");
        this.vertexDataLoader = new Mummu.VertexDataLoader(this.scene);
        if (NO_VERTEX_DATA_LOADER) {
            let datas = await fetch("./datas/meshes/vertexDatas.json");
            this.vertexDataLoader.deserialize(await datas.json());
        }
        setProgressIndex(GLOBAL_GAME_LOAD_CURRENT_STEP++, "fetch VertexDataLoader");
        let rect = this.canvas.getBoundingClientRect();
        this.screenRatio = rect.width / rect.height;
        if (this.screenRatio < 1) {
            document.body.classList.add("vertical");
            this.playCameraMinRadius = 20;
        }
        else {
            document.body.classList.remove("vertical");
        }
        this.canvas.setAttribute("width", Math.floor(rect.width * this.performanceWatcher.devicePixelRatio).toFixed(0));
        this.canvas.setAttribute("height", Math.floor(rect.height * this.performanceWatcher.devicePixelRatio).toFixed(0));
        this.light = new BABYLON.HemisphericLight("light", (new BABYLON.Vector3(2, 4, 3)).normalize(), this.scene);
        this.light.groundColor.copyFromFloats(0.3, 0.3, 0.3);
        this.spotlight = new BABYLON.SpotLight("spotlight", BABYLON.Vector3.Zero(), BABYLON.Vector3.Down(), Math.PI / 6, 10, this.scene);
        this.spotlight.intensity = 0;
        this.animLightIntensity = Mummu.AnimationFactory.CreateNumber(this.light, this.light, "intensity");
        this.animSpotlightIntensity = Mummu.AnimationFactory.CreateNumber(this.spotlight, this.spotlight, "intensity");
        let skyBoxHolder = new BABYLON.Mesh("skybox-holder");
        skyBoxHolder.rotation.x = Math.PI * 0.3;
        this.skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1500 }, this.scene);
        this.skybox.parent = skyBoxHolder;
        let skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
        skyboxMaterial.backFaceCulling = false;
        let skyTexture = new BABYLON.CubeTexture("./datas/skyboxes/cloud", this.scene, ["-px.jpg", "-py.jpg", "-pz.jpg", "-nx.jpg", "-ny.jpg", "-nz.jpg"]);
        skyboxMaterial.reflectionTexture = skyTexture;
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.emissiveColor = BABYLON.Color3.FromHexString("#5c8b93").scaleInPlace(0.7);
        this.skybox.material = skyboxMaterial;
        this.stamp = new StampEffect(this);
        this.bodyColorIndex = 5;
        this.bodyPatternIndex = 0;
        this.camera = new BABYLON.ArcRotateCamera("camera", -Math.PI * 0.5, Math.PI * 0.1, 15, BABYLON.Vector3.Zero());
        this.camera.wheelPrecision *= 10;
        this.camera.pinchPrecision *= 10;
        this.updatePlayCameraRadius();
        this.router = new CarillonRouter(this);
        this.router.initialize();
        await this.router.postInitialize();
        setProgressIndex(GLOBAL_GAME_LOAD_CURRENT_STEP++, "router initialized");
        this.uiInputManager.initialize();
        this.materials = new CarillionMaterials(this);
        if (this.engine.webGLVersion === 2) {
            try {
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
                this.performanceWatcher.supportTexture3D = true;
            }
            catch (e) {
                console.error("[ERROR FALLBACKED] No support for 3DTexture, explosion effects are disabled.");
                this.performanceWatcher.supportTexture3D = false;
            }
        }
        else {
            this.performanceWatcher.supportTexture3D = false;
        }
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
        let doorDatas = await this.vertexDataLoader.get("./datas/meshes/door.babylon");
        Mummu.ColorizeVertexDataInPlace(doorDatas[1], this.materials.woodMaterial.diffuseColor, BABYLON.Color3.Red());
        Mummu.ColorizeVertexDataInPlace(doorDatas[1], this.materials.blackMaterial.diffuseColor, BABYLON.Color3.Green());
        await this.loadPuzzles();
        setProgressIndex(GLOBAL_GAME_LOAD_CURRENT_STEP++, "puzzles loaded");
        this.puzzle = new Puzzle(this);
        await this.puzzle.loadFromFile("./datas/levels/test.txt");
        this.puzzle.instantiate();
        this.puzzleCompletion = new PuzzleCompletion(this);
        await this.puzzleCompletion.initialize();
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
        if (USE_CG_SDK) {
            console.log("Use CrazyGames SDK");
            if (this.puzzleCompletion.completedPuzzles.length === 0) {
                console.log("CGStep 0");
                if (location.hash != "#level-1") {
                    console.log("CGStep 1");
                    location.hash = "#level-1";
                }
                else {
                    console.log(location.hash);
                }
            }
        }
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
        document.querySelector("#success-score-submit-btn").onpointerup = () => {
            this.puzzle.submitHighscore();
        };
        document.querySelector("#reset-btn").onpointerup = async () => {
            await this.puzzle.reset(true);
            this.puzzle.skipIntro();
        };
        document.querySelector("#zoom-out-btn").onpointerup = () => {
            this.playCameraRadiusFactor += 1;
            this.playCameraRadiusFactor = Nabu.MinMax(this.playCameraRadiusFactor, -3, 3);
            this.updatePlayCameraRadius();
        };
        document.querySelector("#zoom-in-btn").onpointerup = () => {
            this.playCameraRadiusFactor -= 1;
            this.playCameraRadiusFactor = Nabu.MinMax(this.playCameraRadiusFactor, -3, 3);
            this.updatePlayCameraRadius();
        };
        document.querySelector("#sound-btn").onpointerup = () => {
            if (this.soundManager.isSoundOn()) {
                this.soundManager.soundOff();
            }
            else {
                this.soundManager.soundOn();
            }
        };
        if (this.soundManager.isSoundOn()) {
            document.querySelector("#sound-btn").classList.remove("mute");
        }
        else {
            document.querySelector("#sound-btn").classList.add("mute");
        }
        document.querySelector("#dev-mode-activate-btn").onpointerup = () => {
            DEV_ACTIVATE();
        };
        document.querySelector("#eula-back-btn").onpointerup = () => {
            this.router.eulaPage.hide(0);
        };
        document.querySelector("#title-version").innerHTML = (OFFLINE_MODE ? "offline" : "online") + " version " + MAJOR_VERSION + "." + MINOR_VERSION + "." + PATCH_VERSION;
        let devSecret = 0;
        let devSecretTimout = 0;
        document.querySelector("#home-menu h1").style.pointerEvents = "auto";
        document.querySelector("#home-menu h1").onpointerup = () => {
            if (devSecret < 6) {
                devSecret++;
            }
            else {
                document.querySelector("#home-menu h1 span").classList.add("secret-dev-mode");
                document.querySelector("#credits-tiaratum-anchor").href = "#dev";
                document.querySelector("#credits-tiaratum-anchor").target = "";
            }
            clearTimeout(devSecretTimout);
            devSecretTimout = setTimeout(() => {
                document.querySelector("#home-menu h1 span").classList.remove("secret-dev-mode");
                document.querySelector("#credits-tiaratum-anchor").href = "https://tiaratum.com/";
                document.querySelector("#credits-tiaratum-anchor").target = "_blank";
                devSecret = 0;
            }, devSecret < 6 ? 1000 : 6000);
        };
        let ambient = this.soundManager.createSound("ambient", "./datas/sounds/zen-ambient.mp3", this.scene, () => {
            ambient.setVolume(0.15);
        }, {
            autoplay: true,
            loop: true
        });
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
        I18Nizer.Translate(LOCALE);
        if (USE_POKI_SDK) {
            PokiSDK.gameLoadingFinished();
        }
        document.body.addEventListener("touchstart", onFirstPlayerInteractionTouch);
        document.body.addEventListener("click", onFirstPlayerInteractionClick);
        document.body.addEventListener("keydown", onFirstPlayerInteractionKeyboard);
        if (location.host.startsWith("127.0.0.1")) {
            //document.getElementById("click-anywhere-screen").style.display = "none";
            //(document.querySelector("#dev-pass-input") as HTMLInputElement).value = "Crillion";
            //DEV_ACTIVATE();
        }
        if (USE_CG_SDK) {
            document.getElementById("click-anywhere-screen").style.display = "none";
        }
        //this.performanceWatcher.showDebug();
    }
    async loadPuzzles() {
        //await RandomWait();
        let storyModePuzzles;
        if (OFFLINE_MODE) {
            const response = await fetch("./datas/levels/tiaratum_story_levels.json", {
                method: "GET",
            });
            storyModePuzzles = await response.json();
            CLEAN_IPuzzlesData(storyModePuzzles);
        }
        else {
            try {
                const response = await fetch(SHARE_SERVICE_PATH + "get_puzzles/0/200/2", {
                    method: "GET",
                    mode: "cors",
                    signal: AbortSignal.timeout(5000)
                });
                if (!response.ok) {
                    throw new Error("Response status: " + response.status);
                }
                storyModePuzzles = await response.json();
                let n = 1;
                for (let i = 0; i < storyModePuzzles.puzzles.length; i++) {
                    let title = storyModePuzzles.puzzles[i].title;
                    if (title.startsWith("lesson") || title.startsWith("challenge") || title.startsWith("Bonus")) {
                    }
                    else {
                        storyModePuzzles.puzzles[i].title = n.toFixed(0) + ". " + title;
                        n++;
                    }
                    storyModePuzzles.puzzles[i].author = "Story Mode";
                }
                CLEAN_IPuzzlesData(storyModePuzzles);
            }
            catch (e) {
                console.error(e);
                OFFLINE_MODE = true;
                const response = await fetch("./datas/levels/tiaratum_story_levels.json", {
                    method: "GET"
                });
                storyModePuzzles = await response.json();
                CLEAN_IPuzzlesData(storyModePuzzles);
            }
        }
        this.loadedStoryPuzzles = storyModePuzzles;
        let lessonIndex = 1;
        for (let i = 0; i < this.loadedStoryPuzzles.puzzles.length; i++) {
            this.loadedStoryPuzzles.puzzles[i].numLevel = (i + 1);
            if (this.loadedStoryPuzzles.puzzles[i].title.startsWith("lesson-")) {
                this.loadedStoryPuzzles.puzzles[i].lessonIndex = lessonIndex;
                lessonIndex++;
            }
        }
        let expertPuzzles;
        if (OFFLINE_MODE) {
            const response = await fetch("./datas/levels/tiaratum_expert_levels.json", {
                method: "GET"
            });
            expertPuzzles = await response.json();
            CLEAN_IPuzzlesData(expertPuzzles);
        }
        else {
            try {
                const response = await fetch(SHARE_SERVICE_PATH + "get_puzzles/0/200/3", {
                    method: "GET",
                    mode: "cors",
                    signal: AbortSignal.timeout(5000)
                });
                if (!response.ok) {
                    throw new Error("Response status: " + response.status);
                }
                expertPuzzles = await response.json();
                for (let i = 0; i < expertPuzzles.puzzles.length; i++) {
                    expertPuzzles.puzzles[i].title = (i + 1).toFixed(0) + ". " + expertPuzzles.puzzles[i].title;
                    expertPuzzles.puzzles[i].author = "Expert Mode";
                }
                CLEAN_IPuzzlesData(expertPuzzles);
            }
            catch (e) {
                console.error(e);
                OFFLINE_MODE = true;
                const response = await fetch("./datas/levels/tiaratum_expert_levels.json", {
                    method: "GET"
                });
                expertPuzzles = await response.json();
                CLEAN_IPuzzlesData(expertPuzzles);
            }
        }
        this.loadedExpertPuzzles = expertPuzzles;
        let xMasPuzzles;
        if (OFFLINE_MODE) {
            const response = await fetch("./datas/levels/tiaratum_xmas_levels.json", {
                method: "GET"
            });
            xMasPuzzles = await response.json();
            CLEAN_IPuzzlesData(xMasPuzzles);
        }
        else {
            try {
                const response = await fetch(SHARE_SERVICE_PATH + "get_puzzles/0/200/8", {
                    method: "GET",
                    mode: "cors",
                    signal: AbortSignal.timeout(5000)
                });
                if (!response.ok) {
                    throw new Error("Response status: " + response.status);
                }
                xMasPuzzles = await response.json();
                for (let i = 0; i < xMasPuzzles.puzzles.length; i++) {
                    xMasPuzzles.puzzles[i].title = "December " + (i + 1).toFixed(0) + ".\n" + xMasPuzzles.puzzles[i].title;
                }
                CLEAN_IPuzzlesData(xMasPuzzles);
            }
            catch (e) {
                console.error(e);
                OFFLINE_MODE = true;
                const response = await fetch("./datas/levels/tiaratum_xmas_levels.json", {
                    method: "GET"
                });
                xMasPuzzles = await response.json();
                CLEAN_IPuzzlesData(xMasPuzzles);
            }
        }
        this.dayOfXMasCal = new Date().getDate();
        this.dayOfXMasCal = Nabu.MinMax(this.dayOfXMasCal, 1, 24);
        let iFallback = 0;
        for (let i = xMasPuzzles.puzzles.length; i < this.dayOfXMasCal; i++) {
            let puzzleData = {
                id: xMasPuzzles.puzzles[iFallback].id,
                title: "December " + (i + 1).toFixed(0) + ".\nSurprise !",
                author: "TiaratumGames",
                content: xMasPuzzles.puzzles[iFallback].content,
                difficulty: 2
            };
            xMasPuzzles.puzzles[i] = puzzleData;
            iFallback = (iFallback + 1) % xMasPuzzles.puzzles.length;
        }
        let i0 = Math.min(this.dayOfXMasCal, xMasPuzzles.puzzles.length);
        for (let i = i0; i < 24; i++) {
            let puzzleData = {
                id: null,
                title: "December " + (i + 1).toFixed(0) + ".\nSurprise !",
                author: "TiaratumGames",
                content: "11u14u5u9u2xoooooooooooxooosssssoooxoosssssssooxossooooossoxossooooossoxoosooooossoxoooooosssooxooooossooooxooooossooooxooooosoooooxoooooooooooxoooosssooooxoooosssooooxoooooooooooxBB0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                difficulty: 2
            };
            if (i % 3 === 0) {
                puzzleData.content = puzzleData.content.replaceAll("s", "n");
            }
            else if (i % 3 === 2) {
                puzzleData.content = puzzleData.content.replaceAll("s", "w");
            }
            xMasPuzzles.puzzles[i] = puzzleData;
        }
        this.loadedXMasPuzzles = xMasPuzzles;
        for (let i = 0; i < this.loadedXMasPuzzles.puzzles.length; i++) {
            this.loadedXMasPuzzles.puzzles[i].numLevel = (i + 1);
        }
        let communityPuzzles;
        if (OFFLINE_MODE) {
            const response = await fetch("./datas/levels/tiaratum_community_levels.json", {
                method: "GET"
            });
            communityPuzzles = await response.json();
            CLEAN_IPuzzlesData(communityPuzzles);
        }
        else {
            try {
                const response = await fetch(SHARE_SERVICE_PATH + "get_puzzles/0/200/1", {
                    method: "GET",
                    mode: "cors",
                    signal: AbortSignal.timeout(5000)
                });
                if (!response.ok) {
                    throw new Error("Response status: " + response.status);
                }
                communityPuzzles = await response.json();
                CLEAN_IPuzzlesData(communityPuzzles);
            }
            catch (e) {
                console.error(e);
                OFFLINE_MODE = true;
                const response = await fetch("./datas/levels/tiaratum_community_levels.json", {
                    method: "GET"
                });
                communityPuzzles = await response.json();
                CLEAN_IPuzzlesData(communityPuzzles);
            }
        }
        this.loadedCommunityPuzzles = communityPuzzles;
        let multiplayerPuzzles;
        if (OFFLINE_MODE) {
            const response = await fetch("./datas/levels/tiaratum_multiplayer_levels.json", {
                method: "GET"
            });
            multiplayerPuzzles = await response.json();
            CLEAN_IPuzzlesData(multiplayerPuzzles);
        }
        else {
            try {
                const response = await fetch(SHARE_SERVICE_PATH + "get_puzzles/0/200/4", {
                    method: "GET",
                    mode: "cors",
                    signal: AbortSignal.timeout(5000)
                });
                if (!response.ok) {
                    throw new Error("Response status: " + response.status);
                }
                multiplayerPuzzles = await response.json();
                CLEAN_IPuzzlesData(multiplayerPuzzles);
            }
            catch (e) {
                console.error(e);
                OFFLINE_MODE = true;
                const response = await fetch("./datas/levels/tiaratum_multiplayer_levels.json", {
                    method: "GET"
                });
                multiplayerPuzzles = await response.json();
                CLEAN_IPuzzlesData(multiplayerPuzzles);
            }
        }
        this.loadedMultiplayerPuzzles = multiplayerPuzzles;
        if (OFFLINE_MODE) {
            const response = await fetch("./datas/levels/story_expert_table.json", {
                method: "GET"
            });
            this.storyExpertTable = await response.json();
        }
        else {
            try {
                const response = await fetch(SHARE_SERVICE_PATH + "get_story_expert_table", {
                    method: "GET",
                    mode: "cors",
                    signal: AbortSignal.timeout(5000)
                });
                if (!response.ok) {
                    throw new Error("Response status: " + response.status);
                }
                let table = await response.json();
                for (let n = 0; n < table.length; n++) {
                    if (typeof (table[n].story_id) === "string") {
                        table[n].story_id = parseInt(table[n].story_id);
                    }
                    if (typeof (table[n].expert_id) === "string") {
                        table[n].expert_id = parseInt(table[n].expert_id);
                    }
                }
                this.storyExpertTable = table;
            }
            catch (e) {
                console.error(e);
                OFFLINE_MODE = true;
                const response = await fetch("./datas/levels/story_expert_table.json", {
                    method: "GET"
                });
                this.storyExpertTable = await response.json();
            }
        }
    }
    async getPuzzleDataById(id) {
        if (id === null || isNaN(id)) {
            return undefined;
        }
        let puzzle = this.loadedStoryPuzzles.puzzles.find(e => { return e.id === id; });
        if (puzzle) {
            return puzzle;
        }
        puzzle = this.loadedExpertPuzzles.puzzles.find(e => { return e.id === id; });
        if (puzzle) {
            return puzzle;
        }
        puzzle = this.loadedMultiplayerPuzzles.puzzles.find(e => { return e.id === id; });
        if (puzzle) {
            return puzzle;
        }
        puzzle = this.loadedXMasPuzzles.puzzles.find(e => { return e.id === id; });
        if (puzzle) {
            return puzzle;
        }
        puzzle = this.loadedCommunityPuzzles.puzzles.find(e => { return e.id === id; });
        if (puzzle) {
            return puzzle;
        }
        try {
            let headers = {};
            if (var1) {
                headers = {
                    "Authorization": 'Basic ' + btoa("carillon:" + var1)
                };
            }
            const response = await fetch(SHARE_SERVICE_PATH + "puzzle/" + id.toFixed(0), {
                method: "GET",
                mode: "cors",
                headers: headers
            });
            puzzle = await response.json();
            CLEAN_IPuzzleData(puzzle);
        }
        catch (e) {
            console.error(e);
        }
        return puzzle;
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
        let fov = this.getCameraHorizontalFOV();
        let rect = this.canvas.getBoundingClientRect();
        let w = rect.width / (70 / Math.sqrt(window.devicePixelRatio));
        let f = Math.exp(this.playCameraRadiusFactor / 5);
        this.playCameraRadius = Nabu.MinMax((0.5 * w) / Math.tan(fov / 2), this.playCameraMinRadius, this.playCameraMaxRadius) * f;
    }
    updateMenuCameraRadius() {
        let fov = this.getCameraHorizontalFOV();
        let rect = this.canvas.getBoundingClientRect();
        let w = rect.width / (70 / Math.sqrt(window.devicePixelRatio));
        this.menuCamRadius = Nabu.MinMax((0.5 * w) / Math.tan(fov / 2), this.playCameraMinRadius, this.playCameraMaxRadius);
    }
    update() {
        let rawDT = this.scene.deltaTime / 1000;
        this.performanceWatcher.update(rawDT);
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
                while (this.camera.alpha > Math.PI / 2) {
                    this.camera.alpha -= 2 * Math.PI;
                }
                while (this.camera.alpha < -3 * Math.PI / 2) {
                    this.camera.alpha += 2 * Math.PI;
                }
                let targetCameraPos = this.puzzle.balls[0].absolutePosition.clone();
                if (this.puzzle.ballsCount === 2) {
                    targetCameraPos.addInPlace(this.puzzle.balls[1].absolutePosition).scaleInPlace(0.5);
                }
                rawDT = Math.min(rawDT, 1);
                targetCameraPos.y = Math.max(targetCameraPos.y, -2.5);
                let margin = 3;
                if (this.puzzle.puzzleState === PuzzleState.Wining) {
                    margin = 0;
                }
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
                let targetCamAlpha = -0.5 * Math.PI;
                let targetCamBeta = Math.PI * 0.01 * relZPos + Math.PI * 0.15 * (1 - relZPos);
                targetCamBeta = 0.1 * Math.PI;
                if (this.puzzle.puzzleState === PuzzleState.Wining) {
                    targetCamAlpha = 0.2 * Math.PI;
                    targetCamBeta = 0.2 * Math.PI;
                    let f3 = Nabu.Easing.smoothNSec(1 / rawDT, this.puzzle.winAnimationTime);
                    this.camera.alpha = this.camera.alpha * f3 + targetCamAlpha * (1 - f3);
                    this.camera.beta = this.camera.beta * f3 + targetCamBeta * (1 - f3);
                }
                else {
                    let f3 = Nabu.Easing.smoothNSec(1 / rawDT, Math.max(0.5, 3 - this.globalTimer));
                    this.camera.alpha = this.camera.alpha * f3 + targetCamAlpha * (1 - f3);
                    this.camera.beta = this.camera.beta * f3 + targetCamBeta * (1 - f3);
                }
                let f = Nabu.Easing.smoothNSec(1 / rawDT, Math.max(1, 3 - this.globalTimer));
                BABYLON.Vector3.LerpToRef(this.camera.target, targetCameraPos, (1 - f), this.camera.target);
                if (this.puzzle.puzzleState === PuzzleState.Wining) {
                    let f4 = Nabu.Easing.smoothNSec(1 / rawDT, this.puzzle.winAnimationTime);
                    this.camera.radius = this.camera.radius * f4 + 5 * (1 - f4);
                }
                else {
                    let f4 = Nabu.Easing.smoothNSec(1 / rawDT, Math.max(0.25, 2.25 - this.globalTimer));
                    this.camera.radius = this.camera.radius * f4 + (this.playCameraRadius) * (1 - f4);
                }
            }
            else if (this.mode === GameMode.Menu || this.mode === GameMode.Preplay) {
                while (this.camera.alpha > Math.PI / 2) {
                    this.camera.alpha -= 2 * Math.PI;
                }
                while (this.camera.alpha < -3 * Math.PI / 2) {
                    this.camera.alpha += 2 * Math.PI;
                }
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
                    this.puzzle.update(Math.min(rawDT, 0.03));
                }
                if (this.materials.boostMaterial && this.materials.brownMaterial) {
                    let fBoostMaterial = 0.5 * (Math.sin(this.globalTimer * 0.9 * 2 * Math.PI) + 1);
                    fBoostMaterial = fBoostMaterial * fBoostMaterial * fBoostMaterial * 0.1;
                    let fBoostMaterial2 = 0.5 * (Math.sin(this.globalTimer * 0.9 * 2 * Math.PI + 0.66 * Math.PI) + 1);
                    fBoostMaterial2 = fBoostMaterial2 * fBoostMaterial2 * fBoostMaterial2 * 0.1;
                    /*
                    this.boostMaterial.diffuseColor = BABYLON.Color3.Lerp(
                        this.brownMaterial.diffuseColor,
                        BABYLON.Color3.White(),
                        Math.max(fBoostMaterial, fBoostMaterial2)
                    );
                    */
                }
            }
            this.materials.waterMaterial.diffuseTexture.vOffset += 0.5 * rawDT;
            if (this.materials.waterMaterial.diffuseTexture.vOffset > 1) {
                this.materials.waterMaterial.diffuseTexture.vOffset -= 1;
            }
            if (this.skybox) {
                this.skybox.rotation.y += 0.02 * rawDT;
            }
        }
    }
    storyIdToExpertId(storyId) {
        let element = this.storyExpertTable.find(e => { return e.story_id === storyId; });
        if (element) {
            return element.expert_id;
        }
    }
    expertIdToStoryId(expertId) {
        let element = this.storyExpertTable.filter(e => { return e.expert_id === expertId; });
        if (element) {
            return element.map(e => { return e.story_id; });
        }
        return [];
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
        //await RandomWait();
        return new Promise(resolve => {
            if (this.router.puzzleIntro) {
                this.router.puzzleIntro.style.opacity = "0";
                this.router.puzzleIntro.style.display = "";
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
                        this.router.puzzleIntro.style.display = "";
                        resolve();
                    }
                };
                this.fadeIntroDir = 1;
                step();
            }
        });
    }
    async fadeOutIntro(duration = 1) {
        //await RandomWait();
        if (this.router.puzzleIntro) {
            this.router.puzzleIntro.style.opacity = "1";
            this.router.puzzleIntro.style.display = "";
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
                    this.router.puzzleIntro.style.display = "none";
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
async function RandomWait() {
    return new Promise(resolve => {
        if (Math.random() < 0.9) {
            resolve();
        }
        else {
            setTimeout(() => {
                resolve();
            }, Math.random() * 500);
        }
    });
}
async function DEV_GENERATE_ALL_LEVEL_FILES() {
    Nabu.download("tiaratum_story_levels.json", JSON.stringify(Game.Instance.loadedStoryPuzzles));
    Nabu.download("tiaratum_expert_levels.json", JSON.stringify(Game.Instance.loadedExpertPuzzles));
    Nabu.download("tiaratum_xmas_levels.json", JSON.stringify(Game.Instance.loadedXMasPuzzles));
    Nabu.download("tiaratum_community_levels.json", JSON.stringify(Game.Instance.loadedCommunityPuzzles));
    Nabu.download("tiaratum_multiplayer_levels.json", JSON.stringify(Game.Instance.loadedMultiplayerPuzzles));
    Nabu.download("story_expert_table.json", JSON.stringify(Game.Instance.storyExpertTable));
}
var DEV_MODES_NAMES = [
    "TBD",
    "OKAY",
    "STORY",
    "XPERT",
    "MULTI",
    "TRASH",
    "PRBLM",
    "INFO",
    "XMAS"
];
var DEV_MODE_ACTIVATED = false;
var var1 = "";
function DEV_ACTIVATE() {
    DEV_MODE_ACTIVATED = true;
    var1 = document.querySelector("#dev-pass-input").value;
    document.querySelector("#dev-page .dev-active").style.display = "block";
    document.querySelector("#dev-back-btn").style.display = "block";
    document.querySelector("#dev-page .dev-not-active").style.display = "none";
    let devPuzzleId = document.createElement("div");
    devPuzzleId.id = "dev-puzzle-id";
    if (Game.Instance.puzzle.data.id != null) {
        devPuzzleId.innerHTML = "puzzle_id #" + Game.Instance.puzzle.data.id.toFixed(0);
    }
    else {
        devPuzzleId.innerHTML = "puzzle_id #null";
    }
    devPuzzleId.style.position = "fixed";
    devPuzzleId.style.left = "50%";
    devPuzzleId.style.width = "fit-content";
    devPuzzleId.style.top = "0px";
    devPuzzleId.style.fontSize = "20px";
    devPuzzleId.style.fontFamily = "monospace";
    devPuzzleId.style.color = "lime";
    devPuzzleId.style.textAlign = "left";
    devPuzzleId.style.padding = "2px 2px 2px 2px";
    devPuzzleId.style.pointerEvents = "none";
    document.body.appendChild(devPuzzleId);
    let info = document.createElement("div");
    info.innerHTML = "[DEV MODE : ON] with great power comes great responsibilities";
    info.style.position = "fixed";
    info.style.left = "0px";
    info.style.width = "fit-content";
    info.style.bottom = "0px";
    info.style.fontSize = "14px";
    info.style.fontFamily = "monospace";
    info.style.color = "lime";
    info.style.textAlign = "left";
    info.style.padding = "2px 2px 2px 2px";
    info.style.pointerEvents = "none";
    document.body.appendChild(info);
    let devStateBtns = [];
    for (let i = 0; i <= 8; i++) {
        let btn = document.getElementById("dev-state-" + i.toFixed(0) + "-btn");
        devStateBtns.push(btn);
    }
    for (let i = 0; i < devStateBtns.length; i++) {
        devStateBtns[i].style.display = "block";
        let state = i;
        devStateBtns[i].onpointerup = async () => {
            let id = parseInt(location.hash.replace("#puzzle-", ""));
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
    devStoryOrderMinus.onpointerup = () => {
        Game.Instance.puzzle.data.story_order--;
        DEV_UPDATE_STATE_UI();
    };
    let devStoryOrderPlus = devStoryOrderBtns[1];
    devStoryOrderPlus.onpointerup = () => {
        Game.Instance.puzzle.data.story_order++;
        DEV_UPDATE_STATE_UI();
    };
    let devStoryOrderSend = devStoryOrderBtns[2];
    devStoryOrderSend.onpointerup = async () => {
        let id = parseInt(location.hash.replace("#puzzle-", ""));
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
    let devDifficulty = document.querySelector("#dev-difficulty");
    devDifficulty.style.display = "block";
    let devDifficultyInput = devDifficulty.querySelector("num-value-input");
    devDifficultyInput.onValueChange = (v) => {
        Game.Instance.puzzle.data.difficulty = v;
    };
    devDifficultyInput.valueToString = (v) => {
        if (v === 0) {
            return "UKNWN";
        }
        if (v === 1) {
            return "EASY";
        }
        if (v === 2) {
            return "MID";
        }
        if (v === 3) {
            return "HARD";
        }
        if (v === 4) {
            return "HARD*";
        }
    };
    let devDifficultySend = devDifficulty.querySelector("#dev-difficulty-send");
    devDifficultySend.onpointerup = async () => {
        let id = parseInt(location.hash.replace("#puzzle-", ""));
        if (isFinite(id)) {
            let data = {
                id: id,
                difficulty: Game.Instance.puzzle.data.difficulty
            };
            let dataString = JSON.stringify(data);
            const response = await fetch(SHARE_SERVICE_PATH + "set_puzzle_difficulty", {
                method: "POST",
                mode: "cors",
                headers: {
                    "Authorization": 'Basic ' + btoa("carillon:" + var1)
                },
                body: dataString,
            });
        }
    };
    let devXpertPuzzle = (document.querySelector("#dev-xpert-puzzle"));
    devXpertPuzzle.style.display = "block";
    let devXpertPuzzleInput = devXpertPuzzle.querySelector("#dev-xpert-puzzle-input");
    devXpertPuzzleInput.onchange = () => {
        Game.Instance.puzzle.data.expert_puzzle_id = parseInt(devXpertPuzzleInput.value);
    };
    let devXpertPuzzleSend = devXpertPuzzle.querySelector("#dev-xpert-puzzle-send");
    devXpertPuzzleSend.onpointerup = async () => {
        let id = parseInt(location.hash.replace("#puzzle-", ""));
        if (isFinite(id)) {
            let data = {
                id: id,
                expert_puzzle_id: Game.Instance.puzzle.data.expert_puzzle_id
            };
            let dataString = JSON.stringify(data);
            const response = await fetch(SHARE_SERVICE_PATH + "set_expert_puzzle_id", {
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
    for (let i = 0; i <= 7; i++) {
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
    let difficultyInput = document.querySelector("#dev-difficulty num-value-input");
    difficultyInput.setValue(isFinite(Game.Instance.puzzle.data.difficulty) ? Game.Instance.puzzle.data.difficulty : 0);
    let devXpertPuzzleInput = document.querySelector("#dev-xpert-puzzle-input");
    devXpertPuzzleInput.value = isFinite(Game.Instance.puzzle.data.expert_puzzle_id) ? Game.Instance.puzzle.data.expert_puzzle_id.toFixed(0) : "0";
    let devPuzzleId = document.querySelector("#dev-puzzle-id");
    if (devPuzzleId) {
        if (Game.Instance.puzzle.data.id != null) {
            devPuzzleId.innerHTML = "puzzle_id #" + Game.Instance.puzzle.data.id.toFixed(0);
        }
        else {
            devPuzzleId.innerHTML = "puzzle_id #null";
        }
    }
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
requestAnimationFrame(async () => {
    if (USE_POKI_SDK) {
        PokiSDK.init().then(() => {
            createAndInit();
        });
    }
    else if (USE_CG_SDK) {
        CrazySDK = window.CrazyGames.SDK;
        await CrazySDK.init();
        createAndInit();
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
        this.selectLocalBtn.onpointerup = () => {
            this.setPanel(MultiplayerPagePanel.Local);
        };
        this.selectPublicBtn = document.querySelector("#multiplayer-select-public");
        this.selectPrivateBtn = document.querySelector("#multiplayer-select-private");
        this.localPlayBtn = this.panels[MultiplayerPagePanel.Local].querySelector(".multiplayer-play");
        this.panels[MultiplayerPagePanel.Local].querySelector(".multiplayer-back").onpointerup = () => {
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
        this.buttonMinus.onpointerup = () => {
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
        this.buttonPlus.onpointerup = () => {
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
class PerformanceWatcher {
    constructor(game) {
        this.game = game;
        this.supportTexture3D = false;
        this.average = 24;
        this.worst = 24;
        this.isWorstTooLow = false;
        this.devicePixelRationess = 5;
        this.targetDevicePixelRationess = this.devicePixelRationess;
        this.devicePixelRatioSteps = 10;
        this.resizeCD = 0;
    }
    get devicePixelRatio() {
        let f = this.devicePixelRationess / this.devicePixelRatioSteps;
        return window.devicePixelRatio * f + 0.5 * (1 - f);
    }
    setDevicePixelRationess(v) {
        if (isFinite(v)) {
            v = Nabu.MinMax(v, 0, this.devicePixelRatioSteps);
            if (this.devicePixelRationess != v) {
                this.devicePixelRationess = v;
                let rect = this.game.canvas.getBoundingClientRect();
                requestAnimationFrame(() => {
                    let w = Math.floor(rect.width * this.devicePixelRatio).toFixed(0);
                    let h = Math.floor(rect.height * this.devicePixelRatio).toFixed(0);
                    this.game.canvas.setAttribute("width", w);
                    this.game.canvas.setAttribute("height", h);
                    console.log("update canvas resolution to " + w + " " + h);
                });
                this.resizeCD = 1;
            }
        }
    }
    update(rawDt) {
        let fps = 1 / rawDt;
        if (isFinite(fps)) {
            this.average = 0.95 * this.average + 0.05 * fps;
            let devicePixelRationess = Math.round((this.average - 24) / (60 - 24) * this.devicePixelRatioSteps);
            devicePixelRationess = Nabu.MinMax(devicePixelRationess, this.devicePixelRationess - 1, this.devicePixelRationess + 1);
            if (devicePixelRationess != this.targetDevicePixelRationess) {
                this.resizeCD = 1;
                this.targetDevicePixelRationess = devicePixelRationess;
            }
            this.resizeCD = Math.max(0, this.resizeCD - rawDt);
            if (this.resizeCD <= 0 && this.targetDevicePixelRationess != this.devicePixelRationess) {
                this.setDevicePixelRationess(this.targetDevicePixelRationess);
            }
            /*
            this.worst = Math.min(fps, this.worst);
            this.worst = 0.995 * this.worst + 0.005 * this.average;

            if (this.worst < 24) {
                this.isWorstTooLow = true;
            }
            else if (this.worst > 26) {
                this.isWorstTooLow = false;
            }
            */
        }
    }
    showDebug() {
        let s = 0.3;
        if (document.body.classList.contains("vertical")) {
            s = 0.2;
        }
        let quad = BABYLON.CreateGround("quad", { width: s, height: s * 1.5 });
        quad.parent = this.game.camera;
        let hFov = this.game.getCameraHorizontalFOV();
        let a = hFov / 2;
        quad.position.z = 3;
        quad.position.x = -Math.tan(a) * quad.position.z + s * 0.5;
        quad.position.y = 2 * s;
        quad.rotation.x = -0.5 * Math.PI;
        let debugMaterial = new BABYLON.StandardMaterial("test-haiku-material");
        let dynamicTexture = new BABYLON.DynamicTexture("haiku-texture", { width: 150, height: 225 });
        dynamicTexture.hasAlpha = true;
        debugMaterial.diffuseTexture = dynamicTexture;
        debugMaterial.emissiveColor.copyFromFloats(1, 1, 1);
        debugMaterial.specularColor.copyFromFloats(0, 0, 0);
        debugMaterial.useAlphaFromDiffuseTexture = true;
        quad.material = debugMaterial;
        let update = () => {
            let context = dynamicTexture.getContext();
            context.clearRect(0, 0, 150, 225);
            context.fillStyle = "#00000080";
            context.fillRect(0, 0, 150, 225);
            context.fillStyle = "white";
            context.font = "35px monospace";
            let lineHeight = 40;
            context.fillText(this.average.toFixed(0) + " fa", 15, lineHeight);
            context.fillText(this.worst.toFixed(0) + " fm", 15, 2 * lineHeight);
            let meshesCount = this.game.scene.meshes.length;
            context.fillText(meshesCount.toFixed(0) + " me", 15, 3 * lineHeight);
            let materialsCount = this.game.scene.materials.length;
            context.fillText(materialsCount.toFixed(0) + " ma", 15, 4 * lineHeight);
            let trianglesCount = 0;
            this.game.scene.meshes.forEach(mesh => {
                let indices = mesh.getIndices();
                trianglesCount += indices.length / 3;
            });
            //context.fillText(Math.floor(trianglesCount / 1000).toFixed(0) + " kt", 15, 5 * lineHeight);
            context.fillText(this.devicePixelRatio.toFixed(4), 15, 5 * lineHeight);
            dynamicTexture.update();
        };
        setInterval(update, 100);
    }
}
/// <reference path="./Tile.ts"/>
class PushTile extends Tile {
    constructor(game, props) {
        super(game, props);
        this.animatePosition = Mummu.AnimationFactory.EmptyVector3Callback;
        this.animateRotX = Mummu.AnimationFactory.EmptyNumberCallback;
        this.animateRotZ = Mummu.AnimationFactory.EmptyNumberCallback;
        this.animateWait = Mummu.AnimationFactory.EmptyVoidCallback;
        this._pushCallback = () => { };
        this.color = props.color;
        this.animatePosition = Mummu.AnimationFactory.CreateVector3(this, this, "position");
        this.animateRotX = Mummu.AnimationFactory.CreateNumber(this, this.rotation, "x");
        this.animateRotZ = Mummu.AnimationFactory.CreateNumber(this, this.rotation, "z");
        this.animateWait = Mummu.AnimationFactory.CreateWait(this);
        this.material = this.game.materials.brownMaterial;
        this.renderOutline = true;
        this.outlineColor = BABYLON.Color3.Black();
        this.outlineWidth = 0.02;
        this.tileTop = new BABYLON.Mesh("tile-top");
        this.tileTop.parent = this;
        this.tileTop.material = this.game.materials.pushTileTopMaterial;
        this.pushSound = this.game.soundManager.createSound("push-wood-drag", "./datas/sounds/wood-wood-drag.wav", undefined, undefined, { autoplay: false, loop: false, volume: 0.8 });
        this.fallImpactSound = this.game.soundManager.createSound("push-tile-fall-impact", "./datas/sounds/fall-impact.wav", undefined, undefined, { autoplay: false, loop: false });
    }
    async instantiate() {
        //await RandomWait();
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
        //await RandomWait();
        if (this.tileState === TileState.Moving) {
            this._pushCallback = () => {
                this.push(dir);
            };
        }
        else if (this.tileState === TileState.Active) {
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
                        if (stack && stack.array.find((b) => { return b.vertical && Math.abs(b.position.y - this.position.y) < 0.6; })) {
                            borderBlock = true;
                        }
                    }
                    else if (dir.x < 0) {
                        let stack = this.game.puzzle.getGriddedBorderStack(newI, this.j);
                        if (stack && stack.array.find((b) => { return b.vertical && Math.abs(b.position.y - this.position.y) < 0.6; })) {
                            borderBlock = true;
                        }
                    }
                    else if (dir.z > 0) {
                        let stack = this.game.puzzle.getGriddedBorderStack(this.i, this.j);
                        if (stack && stack.array.find((b) => { return !b.vertical && Math.abs(b.position.y - this.position.y) < 0.6; })) {
                            borderBlock = true;
                        }
                    }
                    else if (dir.z < 0) {
                        let stack = this.game.puzzle.getGriddedBorderStack(this.i, newJ);
                        if (stack && stack.array.find((b) => { return !b.vertical && Math.abs(b.position.y - this.position.y) < 0.6; })) {
                            borderBlock = true;
                        }
                    }
                    if (!borderBlock) {
                        let stackAtDestination = this.game.puzzle.getGriddedStack(newI, newJ);
                        let tileAtDestination;
                        if (stackAtDestination) {
                            tileAtDestination = stackAtDestination.array.find(tile => {
                                return (tile.position.y - this.position.y) < 0.6;
                            });
                        }
                        if (tileAtDestination instanceof HoleTile) {
                            let newPos = this.position.clone();
                            newPos.x = (this.i + dir.x * 0.75) * 1.1;
                            newPos.z = (this.j + dir.z * 0.75) * 1.1;
                            this.tileState = TileState.Moving;
                            this.pushSound.play();
                            if (tileAtDestination.covered) {
                                this.animateWait(0.1).then(() => {
                                    tileAtDestination.destroyCover();
                                });
                            }
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
                            if (this.game.performanceWatcher.worst > 24) {
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
                            }
                            this.fallImpactSound.play();
                            this.dispose();
                        }
                        else if (tileAtDestination) {
                        }
                        else {
                            let targetRotX = 0;
                            let newPos = this.position.clone();
                            newPos.x = newI * 1.1;
                            newPos.y = this.game.puzzle.hMapGet(newI, newJ);
                            newPos.z = newJ * 1.1;
                            let ray = new BABYLON.Ray(newPos.add(new BABYLON.Vector3(0, 0.3, 0)), new BABYLON.Vector3(0, -1, 0), 1);
                            let hit = this.game.scene.pickWithRay(ray, (mesh) => {
                                return mesh.name === "floor" || mesh.name === "building-floor";
                            });
                            if (hit.hit) {
                                let n = hit.getNormal(true);
                                targetRotX = Mummu.AngleFromToAround(BABYLON.Axis.Y, n, BABYLON.Axis.X);
                            }
                            this.tileState = TileState.Moving;
                            setTimeout(() => {
                                this._pushCallback = undefined;
                            }, 500);
                            this.pushSound.play();
                            this.animateRotX(targetRotX, 1);
                            await this.animatePosition(newPos, 1, Nabu.Easing.easeOutSquare);
                            this.game.puzzle.updateGriddedStack(this);
                            this.tileState = TileState.Active;
                            let hIJ = this.game.puzzle.hMapGet(this.i, this.j);
                            let hIJm = this.game.puzzle.hMapGet(this.i, this.j - 1);
                            if (hIJ > hIJm) {
                                this.push(new BABYLON.Vector3(0, 0, -1));
                            }
                            else if (this._pushCallback) {
                                this._pushCallback();
                            }
                        }
                    }
                }
            }
        }
    }
}
class PuzzleCompletionElement {
    constructor(puzzleId, score = Infinity, highscore = null) {
        this.puzzleId = puzzleId;
        this.score = score;
        this.highscore = highscore;
    }
    getStarsCount() {
        if (!isFinite(this.score) || this.score === null || this.score === 0) {
            return 0;
        }
        if (this.highscore === null) {
            return 4;
        }
        let ratio = this.highscore / this.score;
        let starsCount = 1;
        let s1 = ratio > 0.3 ? 1 : 0;
        let s2 = ratio > 0.55 ? 1 : 0;
        let s3 = ratio > 0.8 ? 1 : 0;
        return starsCount + s1 + s2 + s3;
    }
}
class PuzzleCompletion {
    constructor(game) {
        this.game = game;
        this.completedPuzzles = [];
        this.storyPuzzleCompletion = 0;
        this.expertPuzzleCompletion = 0;
        this.xmasPuzzleCompletion = 0;
        this.communityPuzzleCompletion = 0;
        this.storyPuzzles = [];
        this.expertPuzzles = [];
        this.xmasPuzzles = [];
        this.communityPuzzles = [];
        if (HasLocalStorage) {
            let dataString = StorageGetItem("completed-puzzles-v" + MAJOR_VERSION.toFixed(0));
            if (dataString) {
                this.completedPuzzles = JSON.parse(dataString);
            }
        }
        this.recentUnlocks = new Nabu.UniqueList();
    }
    getPuzzleCompletionElementById(id) {
        let storyElement = this.storyPuzzles.find(e => { return e.puzzleId === id; });
        if (storyElement) {
            return storyElement;
        }
        let expertElement = this.expertPuzzles.find(e => { return e.puzzleId === id; });
        if (expertElement) {
            return expertElement;
        }
        let xmasElement = this.xmasPuzzles.find(e => { return e.puzzleId === id; });
        if (xmasElement) {
            return xmasElement;
        }
        let communityElement = this.communityPuzzles.find(e => { return e.puzzleId === id; });
        if (communityElement) {
            return communityElement;
        }
    }
    getStarCount(id) {
        let element = this.getPuzzleCompletionElementById(id);
        if (element) {
            return element.getStarsCount();
        }
        return 0;
    }
    _updateStoryPuzzleCompletion() {
        let max = this.storyPuzzles.length * 4;
        if (max < 1) {
            return;
        }
        let totalStarsCount = 0;
        this.storyPuzzles.forEach(e => {
            totalStarsCount += e.getStarsCount();
        });
        this.storyPuzzleCompletion = totalStarsCount / max;
    }
    _updateExpertPuzzleCompletion() {
        let max = this.expertPuzzles.length * 4;
        if (max < 1) {
            return;
        }
        let totalStarsCount = 0;
        this.expertPuzzles.forEach(e => {
            totalStarsCount += e.getStarsCount();
        });
        this.expertPuzzleCompletion = totalStarsCount / max;
    }
    _updateXmasPuzzleCompletion() {
        let max = this.xmasPuzzles.length * 4;
        if (max < 1) {
            return;
        }
        let totalStarsCount = 0;
        this.xmasPuzzles.forEach(e => {
            totalStarsCount += e.getStarsCount();
        });
        this.xmasPuzzleCompletion = totalStarsCount / max;
    }
    _updateCommunityPuzzleCompletion() {
        let max = this.communityPuzzles.length * 4;
        if (max < 1) {
            return;
        }
        let totalStarsCount = 0;
        this.communityPuzzles.forEach(e => {
            totalStarsCount += e.getStarsCount();
        });
        this.communityPuzzleCompletion = totalStarsCount / max;
    }
    async initialize() {
        //await RandomWait();
        this.game.loadedStoryPuzzles.puzzles.forEach(puzzle => {
            let score = this.getPersonalBestScore(puzzle.id);
            this.storyPuzzles.push(new PuzzleCompletionElement(puzzle.id, score, puzzle.score));
        });
        this.game.loadedCommunityPuzzles.puzzles.forEach(puzzle => {
            let score = this.getPersonalBestScore(puzzle.id);
            this.communityPuzzles.push(new PuzzleCompletionElement(puzzle.id, score, puzzle.score));
        });
        this.game.loadedExpertPuzzles.puzzles.forEach(puzzle => {
            let score = this.getPersonalBestScore(puzzle.id);
            this.expertPuzzles.push(new PuzzleCompletionElement(puzzle.id, score, puzzle.score));
        });
        this.game.loadedXMasPuzzles.puzzles.forEach(puzzle => {
            let score = this.getPersonalBestScore(puzzle.id);
            this.xmasPuzzles.push(new PuzzleCompletionElement(puzzle.id, score, puzzle.score));
        });
        this._updateStoryPuzzleCompletion();
        this._updateExpertPuzzleCompletion();
        this._updateXmasPuzzleCompletion();
        this._updateCommunityPuzzleCompletion();
    }
    completePuzzle(id, score) {
        if (id != null && isFinite(id)) {
            let comp = this.completedPuzzles.find(comp => { return comp.id === id; });
            if (!comp) {
                comp = { id: id, score: score };
                this.completedPuzzles.push(comp);
                this.recentUnlocks.push(id);
            }
            else if (comp.score > score) {
                comp.score = Math.min(comp.score, score);
            }
            let e = this.getPuzzleCompletionElementById(id);
            if (e) {
                e.score = Math.min(e.score, score);
            }
            this._updateStoryPuzzleCompletion();
            this._updateExpertPuzzleCompletion();
            this._updateXmasPuzzleCompletion();
            this._updateCommunityPuzzleCompletion();
            if (HasLocalStorage) {
                StorageSetItem("completed-puzzles-v" + MAJOR_VERSION.toFixed(0), JSON.stringify(this.completedPuzzles));
            }
        }
    }
    isPuzzleCompleted(id) {
        return this.completedPuzzles.findIndex(comp => { return comp.id === id; }) != -1;
    }
    getPersonalBestScore(id) {
        let comp = this.completedPuzzles.find(comp => { return comp.id === id; });
        if (comp && comp.score > 0) {
            return comp.score;
        }
        return Infinity;
    }
}
class MySound {
    constructor(soundManager, _name, _urlOrArrayBuffer, _scene, _readyToPlayCallback, _options, instancesCount = 1) {
        this.soundManager = soundManager;
        this._name = _name;
        this._urlOrArrayBuffer = _urlOrArrayBuffer;
        this._scene = _scene;
        this._readyToPlayCallback = _readyToPlayCallback;
        this._options = _options;
        this.instancesCount = instancesCount;
        this._loaded = false;
        this._sounds = [];
    }
    get duration() {
        if (this._sounds[0]) {
            return this._sounds[0].getAudioBuffer().duration;
        }
        return 0;
    }
    load() {
        if (this._loaded) {
            return;
        }
        this._sounds[0] = new BABYLON.Sound(this._name, this._urlOrArrayBuffer, this._scene, this._readyToPlayCallback, this._options);
        for (let i = 1; i < this.instancesCount; i++) {
            this._sounds[i] = this._sounds[0].clone();
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
        let mySound = new MySound(this, name, urlOrArrayBuffer, scene, readyToPlayCallback, options, instancesCount);
        if (BABYLON.Engine.audioEngine.unlocked) {
            mySound.load();
        }
        this.managedSounds.push(mySound);
        return mySound;
    }
    isSoundOn() {
        if (BABYLON.Engine.audioEngine.unlocked && BABYLON.Engine.audioEngine.getGlobalVolume() > 0) {
            return true;
        }
        return false;
    }
    soundOn() {
        BABYLON.Engine.audioEngine.unlock();
        BABYLON.Engine.audioEngine.setGlobalVolume(1);
        for (let i = 0; i < this.managedSounds.length; i++) {
            this.managedSounds[i].load();
        }
        document.querySelector("#sound-btn").classList.remove("mute");
    }
    soundOff() {
        BABYLON.Engine.audioEngine.setGlobalVolume(0);
        document.querySelector("#sound-btn").classList.add("mute");
    }
}
class StrokeText extends HTMLElement {
    connectedCallback() {
        this.style.position = "relative";
        let o = (1 / window.devicePixelRatio).toFixed(1) + "px";
        o = "1px";
        this.style.textShadow = "1px 1px 0px #e3cfb4ff, -1px 1px 0px #e3cfb4ff, -1px -1px 0px #e3cfb4ff, 1px -1px 0px #e3cfb4ff";
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
        this.material = this.game.materials.blackMaterial;
        this.renderOutline = true;
        this.outlineColor = BABYLON.Color3.Black();
        this.outlineWidth = 0.02;
        this.tileFrame = new BABYLON.Mesh("tile-frame");
        this.tileFrame.parent = this;
        this.tileFrame.material = this.game.materials.blackMaterial;
        this.tileFrame.renderOutline = true;
        this.tileFrame.outlineColor = BABYLON.Color3.Black();
        this.tileFrame.outlineWidth = 0.02;
        this.tileTop = new BABYLON.Mesh("tile-top");
        this.tileTop.parent = this;
        this.tileTop.material = this.game.materials.tileColorMaterials[this.color];
        this.tileBottom = new BABYLON.Mesh("tile-bottom");
        this.tileBottom.parent = this;
        this.tileBottom.material = this.game.materials.brownMaterial;
    }
    async instantiate() {
        //await RandomWait();
        await super.instantiate();
        let tileData = await this.game.vertexDataLoader.get("./datas/meshes/switchbox.babylon");
        tileData[0].applyToMesh(this);
        tileData[1].applyToMesh(this.tileFrame);
        tileData[2].applyToMesh(this.tileTop);
        tileData[3].applyToMesh(this.tileBottom);
    }
    async shoot(ball, duration = 0.4) {
        let projectile = this.tileFrame.clone();
        projectile.parent = undefined;
        let cap = this.tileTop.clone();
        cap.parent = projectile;
        projectile.position.copyFrom(this.position);
        let tail;
        let tailPoints;
        if (this.game.performanceWatcher.worst > 24 || true) {
            tail = new BABYLON.Mesh("tail");
            tail.visibility = 1;
            tail.material = this.game.materials.tileStarTailMaterial;
            tailPoints = [];
        }
        return new Promise(resolve => {
            let t0 = performance.now();
            let step = () => {
                let f = (performance.now() - t0) / 1000 / duration;
                f = Math.sqrt(f);
                let s = 0.4 + 0.6 * f;
                if (tail) {
                    tailPoints.push(projectile.position.add(new BABYLON.Vector3(0, 0.2 * s, 0)));
                    while (tailPoints.length > 40) {
                        tailPoints.splice(0, 1);
                    }
                    if (tailPoints.length > 2) {
                        let color = this.game.materials.colorMaterials[this.color].diffuseColor.toColor4(1);
                        let data = CreateTrailVertexData({
                            path: [...tailPoints],
                            up: BABYLON.Axis.Y,
                            radiusFunc: (f) => {
                                return 0.03 * f + 0.01;
                            },
                            color: color
                        });
                        data.applyToMesh(tail);
                        tail.isVisible = true;
                    }
                    else {
                        tail.isVisible = false;
                    }
                }
                if (f < 1) {
                    BABYLON.Vector3.LerpToRef(this.position, ball.position, f, projectile.position);
                    projectile.position.y += 2 * (1 - (2 * f - 1) * (2 * f - 1));
                    projectile.rotation.y = f * 2 * Math.PI;
                    projectile.scaling.copyFromFloats(s, s, s);
                    requestAnimationFrame(step);
                }
                else {
                    projectile.dispose();
                    if (tail) {
                        tail.dispose();
                    }
                    resolve();
                }
            };
            step();
        });
    }
}
class ButtonTile extends Tile {
    constructor(game, props) {
        super(game, props);
        if (isNaN(this.props.value)) {
            this.props.value = 0;
        }
        this.material = this.game.materials.brownMaterial;
        this.renderOutline = true;
        this.outlineColor = BABYLON.Color3.Black();
        this.outlineWidth = 0.02;
        this.tileFrame = new BABYLON.Mesh("tile-frame");
        this.tileFrame.position.y = 0.25;
        this.tileFrame.rotation.y = Math.PI * 0.25;
        this.tileFrame.parent = this;
        this.tileFrame.material = this.game.materials.blackMaterial;
        this.tileFrame.renderOutline = true;
        this.tileFrame.outlineColor = BABYLON.Color3.Black();
        this.tileFrame.outlineWidth = 0.02;
        this.tileTop = new BABYLON.Mesh("tile-top");
        this.tileTop.parent = this.tileFrame;
        this.tileTop.material = this.game.materials.tileNumberMaterials[this.props.value - 1];
        this.tileBottom = new BABYLON.Mesh("tile-bottom");
        this.tileBottom.parent = this;
        this.tileBottom.material = this.game.materials.grayMaterial;
    }
    async instantiate() {
        //await RandomWait();
        await super.instantiate();
        let tileData = await this.game.vertexDataLoader.get("./datas/meshes/buttonbox.babylon");
        tileData[0].applyToMesh(this);
        tileData[1].applyToMesh(this.tileFrame);
        tileData[2].applyToMesh(this.tileTop);
        tileData[3].applyToMesh(this.tileBottom);
    }
    async clicClack() {
        //await RandomWait();
        this.bump();
        let animateWait = Mummu.AnimationFactory.CreateWait(this);
        let animateRotation = Mummu.AnimationFactory.CreateNumber(this.tileFrame, this.tileFrame.rotation, "x");
        await animateRotation(-Math.PI * 0.75, 0.25, Nabu.Easing.easeInSine);
        this.game.puzzle.cricSound.play();
        await animateWait(0.1);
        await animateRotation(0, 0.35, Nabu.Easing.easeInSine);
        this.game.puzzle.cracSound.play();
    }
}
class DoorTile extends Tile {
    constructor(game, props) {
        super(game, props);
        this.closed = false;
        this.animateTopPosY = Mummu.AnimationFactory.EmptyNumberCallback;
        this.animateTopRotY = Mummu.AnimationFactory.EmptyNumberCallback;
        this.animateBoxPosY = Mummu.AnimationFactory.EmptyNumberCallback;
        if (isNaN(this.props.value)) {
            this.props.value = 0;
        }
        this.material = this.game.materials.grayMaterial;
        this.renderOutline = true;
        this.outlineColor = BABYLON.Color3.Black();
        this.outlineWidth = 0.02;
        this.tileBox = new BABYLON.Mesh("tile-frame");
        this.tileBox.position.y = -0.26;
        this.tileBox.parent = this;
        this.tileBox.material = this.game.materials.blackMaterial;
        //this.tileBox.renderOutline = true;
        //this.tileBox.outlineColor = BABYLON.Color3.Black();
        //this.tileBox.outlineWidth = 0.02;
        this.tileTop = new BABYLON.Mesh("tile-top");
        this.tileTop.parent = this;
        this.tileTop.material = this.game.materials.tileNumberMaterials[this.props.value - 1];
        this.tileTopFrame = new BABYLON.Mesh("tile-top-frame");
        this.tileTopFrame.parent = this.tileTop;
        this.tileTopFrame.material = this.game.materials.blackMaterial;
        this.tileTopFrame.renderOutline = true;
        this.tileTopFrame.outlineColor = BABYLON.Color3.Black();
        this.tileTopFrame.outlineWidth = 0.02;
        this.animateTopPosY = Mummu.AnimationFactory.CreateNumber(this, this.tileTop.position, "y");
        this.animateTopRotY = Mummu.AnimationFactory.CreateNumber(this.tileTop, this.tileTop.rotation, "y");
        this.animateBoxPosY = Mummu.AnimationFactory.CreateNumber(this.tileBox, this.tileBox.position, "y");
    }
    async instantiate() {
        //await RandomWait();
        await super.instantiate();
        let tileData = await this.game.vertexDataLoader.get("./datas/meshes/door.babylon");
        //tileData[0].applyToMesh(this);
        CreateBoxFrameVertexData({
            w: 1,
            d: 1,
            h: 0.3,
            thickness: 0.05,
            innerHeight: 0.22,
            flatShading: true,
            topCap: true
        }).applyToMesh(this.tileBox);
        tileData[0].applyToMesh(this.tileTop);
        tileData[1].applyToMesh(this.tileTopFrame);
    }
    async open(duration = 0.5) {
        //await RandomWait();
        this.animateTopPosY(0, duration, Nabu.Easing.easeOutCubic);
        this.animateTopRotY(0, duration, Nabu.Easing.easeOutCubic);
        await this.animateBoxPosY(-0.26, duration, Nabu.Easing.easeOutCubic);
        this.closed = false;
    }
    async close(duration = 0.5) {
        //await RandomWait();
        this.closed = true;
        this.animateTopPosY(0.1, duration, Nabu.Easing.easeOutCubic);
        this.animateTopRotY(2 * Math.PI, duration, Nabu.Easing.easeOutCubic);
        await this.animateBoxPosY(0, duration, Nabu.Easing.easeOutCubic);
    }
}
/*
enum ToonSoundType {
    Poc,
    Rumble
}

interface IToonSoundProp {
    text?: string,
    texts?: string[],
    pos: BABYLON.Vector3,
    color: string,
    size: number,
    duration: number,
    type: ToonSoundType
}

class ToonSound extends BABYLON.Mesh {

    public dynamicTexture: BABYLON.DynamicTexture;
    public animateVisibility = Mummu.AnimationFactory.EmptyNumberCallback;

    private _timer: number = 0;
    public get active(): boolean {
        return this.isVisible;
    }
    public soundProp: IToonSoundProp;
    public get scale(): number {
        return this.scaling.x;
    }
    public set scale(v: number) {
        this.scaling.copyFromFloats(v, v, v);
    }

    constructor(
        public game: Game
    ) {
        super("haiku");
        BABYLON.CreateGroundVertexData({ width: 5, height: 1 }).applyToMesh(this);
        this.renderingGroupId = 1;
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.isVisible = false;

        let haikuMaterial = new BABYLON.StandardMaterial("toon-sound-material");
        this.dynamicTexture = new BABYLON.DynamicTexture("toon-sound-texture", { width: 200, height: 40 });
        this.dynamicTexture.hasAlpha = true;
        haikuMaterial.diffuseTexture = this.dynamicTexture;
        haikuMaterial.specularColor.copyFromFloats(0, 0, 0);
        haikuMaterial.useAlphaFromDiffuseTexture = true;
        this.material = haikuMaterial;

        this.animateVisibility = Mummu.AnimationFactory.CreateNumber(this, this, "visibility");
    }

    public start(soundProps: IToonSoundProp): void {
        this.soundProp = soundProps;

        if (this.soundProp.text) {
            this.writeText(this.soundProp.text);
        }
        else if (this.soundProp.texts) {
            this.writeText(this.soundProp.texts[0]);
            this._lastDrawnTextIndex = 0;
        }

        this.position.copyFrom(this.soundProp.pos);
        this.rotDir = ((this.soundProp.pos.x - this.game.camera.target.x) > 0) ? 1 : - 1;

        this._timer = 0;
        this.scale = 0;
        this.isVisible = true;
    }

    public writeText(text: string): void {
        let context = this.dynamicTexture.getContext();
        context.clearRect(0, 0, 200, 40);

        context.font = "40px Julee";
        let l = context.measureText(text).width;

        let color = BABYLON.Color3.FromHexString(this.soundProp.color);
        let avg = (color.r + color.g + color.b) / 3;
        if (avg > 0.5) {
            context.fillStyle = "black";
        }
        else {
            context.fillStyle = "white";
        }
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                context.fillText(text, 100 - l * 0.5 + x, 34 + y);
            }
        }

        context.fillStyle = this.soundProp.color;
        context.fillText(text, 100 - l * 0.5, 34);

        this.dynamicTexture.update();
    }

    public rotDir: number = 1;
    private _lastDrawnTextIndex: number = 0;
    private _dir: BABYLON.Vector3 = BABYLON.Vector3.Up();
    public update(dt: number): void {

        this._timer += dt;
        if (this._timer >= this.soundProp.duration) {
            this.isVisible = false;
        }
        else {
            if (this.soundProp.texts) {
                let textIndex = Math.floor(this._timer / this.soundProp.duration * this.soundProp.texts.length);
                if (textIndex != this._lastDrawnTextIndex) {
                    this.writeText(this.soundProp.texts[textIndex]);
                    this._lastDrawnTextIndex = textIndex;
                }
            }
            if (this.soundProp.type === ToonSoundType.Poc) {
                let fScale = 4 * this._timer / this.soundProp.duration;
                fScale = Nabu.MinMax(fScale, 0, 1);
                this.scale = fScale * this.soundProp.size;

                let fPos = 2 * this._timer / this.soundProp.duration;
                fPos = Nabu.MinMax(fPos, 0, 1);
                fPos = Nabu.Easing.easeOutSine(fPos);
                this.position.copyFrom(this.soundProp.pos);
                this.position.x += fPos * this.rotDir * this.soundProp.size * 0.5;
                this.position.z += fPos * this.soundProp.size * 0.5;

                this._dir.copyFrom(this.game.camera.globalPosition).subtractInPlace(this.position);
                Mummu.QuaternionFromYZAxisToRef(this._dir, BABYLON.Axis.Z.add(BABYLON.Axis.X.scale(0.1 * fPos * this.rotDir)), this.rotationQuaternion);

                this.visibility = 1;
            }
            else if (this.soundProp.type === ToonSoundType.Rumble) {
                this._dir.copyFrom(this.game.camera.globalPosition).subtractInPlace(this.position);
                Mummu.QuaternionFromYZAxisToRef(this._dir, BABYLON.Axis.Z.add(BABYLON.Axis.X.scale(0.1 * Math.sin(4 * 2 * Math.PI * this._timer))), this.rotationQuaternion);

                let f = 4 * this._timer / this.soundProp.duration;
                f = Nabu.MinMax(f, 0, 1);
                f = Nabu.Easing.easeOutCubic(f);
                this.scale = f * this.soundProp.size;
                this.position.copyFrom(this.soundProp.pos);
                this.position.y += f * 0.5 + 0.05 * Math.sin(6 * 2 * Math.PI * this._timer);
    
                this.visibility = 1;
            }
        }
    }
}

class ToonSoundManager {
    
    public sounds: ToonSound[] = [];

    constructor(
        public game: Game
    ) {
        this.sounds = [];
        for (let i = 0; i < 10; i++) {
            this.sounds[i] = new ToonSound(this.game);
        }
    }

    public start(soundProps: IToonSoundProp): void {
        return;
        for (let i = 0; i < 10; i++) {
            if (!this.sounds[i].active) {
                this.sounds[i].start(soundProps);
                return;
            }
        }
    }

    public update(dt: number): void {
        return;
        for (let i = 0; i < 10; i++) {
            if (this.sounds[i].active) {
                this.sounds[i].update(dt);
            }
        }
    }
}
*/ 
class TutoPage {
    constructor(queryString, router) {
        this.router = router;
        this._tuto2Path = [
            new BABYLON.Vector2(50, 130),
            new BABYLON.Vector2(50, 90),
            new BABYLON.Vector2(70, 70),
            new BABYLON.Vector2(110, 110),
            new BABYLON.Vector2(110, 130)
        ];
        this._tuto2SumNormalizedDist = [0];
        this._tuto3Path = [
            new BABYLON.Vector2(50, 130),
            new BABYLON.Vector2(50, 90),
            new BABYLON.Vector2(70, 70),
            new BABYLON.Vector2(110, 110),
            new BABYLON.Vector2(110, 130)
        ];
        this._tuto3SumNormalizedDist = [0];
        this._timer = 0;
        this.update = () => {
            let dt = this.router.game.scene.deltaTime / 1000;
            this._timer += dt;
            if (this._tutoIndex === 0) {
                this.svgBall.setAttribute("transform", "translate(80 105)");
            }
            else if (this._tutoIndex === 1) {
                let P = 3;
                let t = this._timer - Math.floor(this._timer / P) * P;
                if (t > P / 2) {
                    t = P - t;
                }
                t = t / (P / 2);
                let y = 75 + 60 * t;
                this.svgBall.setAttribute("transform", "translate(80 " + y.toFixed(1) + ")");
            }
            else if (this._tutoIndex === 2) {
                let P = 6;
                let t = this._timer - Math.floor(this._timer / P) * P;
                let tBase = t;
                if (t > P / 2) {
                    t = P - t;
                }
                t = t / (P / 2);
                if (tBase > this._tuto2SumNormalizedDist[1] * P / 2 && tBase < this._tuto2SumNormalizedDist[2] * P / 2) {
                    this.svgKeyD.setAttribute("transform", "translate(0 5)");
                    this.svgKeyD.querySelector("rect").setAttribute("fill", "white");
                    this.svgElement.querySelector("#tutorial-key-d-base").setAttribute("stroke-width", "4");
                    this.svgBallArrowRight.setAttribute("opacity", "1");
                }
                else {
                    this.svgKeyD.setAttribute("transform", "translate(0 0)");
                    this.svgKeyD.querySelector("rect").setAttribute("fill", "#808080");
                    this.svgElement.querySelector("#tutorial-key-d-base").setAttribute("stroke-width", "2");
                    this.svgBallArrowRight.setAttribute("opacity", "0");
                }
                if (tBase > (P - this._tuto2SumNormalizedDist[2] * P / 2) &&
                    tBase < (P - this._tuto2SumNormalizedDist[1] * P / 2)) {
                    this.svgKeyA.setAttribute("transform", "translate(0 5)");
                    this.svgKeyA.querySelector("rect").setAttribute("fill", "white");
                    this.svgElement.querySelector("#tutorial-key-a-base").setAttribute("stroke-width", "4");
                    this.svgBallArrowLeft.setAttribute("opacity", "1");
                }
                else {
                    this.svgKeyA.setAttribute("transform", "translate(0 0)");
                    this.svgKeyA.querySelector("rect").setAttribute("fill", "#808080");
                    this.svgElement.querySelector("#tutorial-key-a-base").setAttribute("stroke-width", "2");
                    this.svgBallArrowLeft.setAttribute("opacity", "0");
                }
                let p = this._evaluatePath(t, this._tuto2Path, this._tuto2SumNormalizedDist);
                this.svgBall.setAttribute("transform", "translate(" + p.x.toFixed(1) + " " + p.y.toFixed(1) + ")");
                this.svgBallArrowRight.setAttribute("transform", "translate(" + p.x.toFixed(1) + " " + p.y.toFixed(1) + ")");
                this.svgBallArrowLeft.setAttribute("transform", "translate(" + p.x.toFixed(1) + " " + p.y.toFixed(1) + ")");
            }
            else if (this._tutoIndex === 3) {
                let P = 4;
                let t = this._timer - Math.floor(this._timer / P) * P;
                let tBase = t;
                t = t / P;
                if (tBase > this._tuto3SumNormalizedDist[2] * P && tBase < this._tuto3SumNormalizedDist[5] * P) {
                    this.svgElement.querySelector("#tutorial-tile-2").setAttribute("opacity", "0");
                }
                else {
                    this.svgElement.querySelector("#tutorial-tile-2").setAttribute("opacity", "1");
                }
                if (tBase > this._tuto3SumNormalizedDist[4] * P && tBase < this._tuto3SumNormalizedDist[5] * P) {
                    this.svgElement.querySelector("#tutorial-tile-1").setAttribute("opacity", "0");
                }
                else {
                    this.svgElement.querySelector("#tutorial-tile-1").setAttribute("opacity", "1");
                }
                let p = this._evaluatePath(t, this._tuto3Path, this._tuto3SumNormalizedDist);
                this.svgBall.setAttribute("transform", "translate(" + p.x.toFixed(1) + " " + p.y.toFixed(1) + ")");
            }
        };
        this._animating = false;
        this._tutoIndex = 0;
        this._inputLeft = () => {
            if (!this.shown) {
                return;
            }
            this.setTutoIndex(this._tutoIndex - 1);
        };
        this._inputRight = () => {
            if (!this.shown) {
                return;
            }
            if (this._tutoIndex < 3) {
                this.setTutoIndex(this._tutoIndex + 1);
            }
            else {
                this.hide(0.5);
                this.router.game.fadeInIntro();
                this.router.game.puzzle.skipIntro();
            }
        };
        this.nabuPage = document.querySelector(queryString);
        this.tutoContainer = this.nabuPage.querySelector(".tutorial-container");
        this.tutoPrev = [...this.nabuPage.querySelectorAll(".tutorial-prev-btn")];
        this.tutoPrev.forEach(btn => btn.onclick = () => {
            this.setTutoIndex(this._tutoIndex - 1);
        });
        this.tutoNext = [...this.nabuPage.querySelectorAll(".tutorial-next-btn")];
        this.tutoNext.forEach(btn => btn.onclick = () => {
            if (this._tutoIndex < 3) {
                this.setTutoIndex(this._tutoIndex + 1);
            }
            else {
                this.hide(0.5);
                this.router.game.fadeInIntro();
                this.router.game.puzzle.skipIntro();
            }
        });
        this.tutoText = this.tutoContainer.querySelector(".tutorial-text");
        this.svgBall = this.tutoContainer.querySelector("#tutorial-ball");
        this.svgBallArrowRight = this.tutoContainer.querySelector("#tutorial-ball-arrow-r");
        this.svgBallArrowLeft = this.tutoContainer.querySelector("#tutorial-ball-arrow-l");
        this.svgKeyA = this.tutoContainer.querySelector("#tutorial-key-a");
        this.svgKeyD = this.tutoContainer.querySelector("#tutorial-key-d");
        this.svgElement = this.tutoContainer.querySelector("svg");
        this._tuto2Path = [
            new BABYLON.Vector2(60, 135),
            new BABYLON.Vector2(60, 125),
            new BABYLON.Vector2(100, 85),
            new BABYLON.Vector2(100, 75),
            new BABYLON.Vector2(100, 135),
        ];
        this._tuto2SumNormalizedDist = [0];
        for (let i = 1; i < this._tuto2Path.length; i++) {
            this._tuto2SumNormalizedDist[i] = BABYLON.Vector2.Distance(this._tuto2Path[i], this._tuto2Path[i - 1]) + this._tuto2SumNormalizedDist[i - 1];
        }
        let l2 = this._tuto2SumNormalizedDist[this._tuto2SumNormalizedDist.length - 1];
        for (let i = 0; i < this._tuto2Path.length; i++) {
            this._tuto2SumNormalizedDist[i] = this._tuto2SumNormalizedDist[i] / l2;
        }
        this._tuto3Path = [
            new BABYLON.Vector2(50, 75),
            new BABYLON.Vector2(50, 135),
            new BABYLON.Vector2(70, 122),
            new BABYLON.Vector2(70 - 17, 105),
            new BABYLON.Vector2(70, 88),
            new BABYLON.Vector2(50, 75)
        ];
        this._tuto3SumNormalizedDist = [0];
        for (let i = 1; i < this._tuto3Path.length; i++) {
            this._tuto3SumNormalizedDist[i] = BABYLON.Vector2.Distance(this._tuto3Path[i], this._tuto3Path[i - 1]) + this._tuto3SumNormalizedDist[i - 1];
        }
        let l3 = this._tuto3SumNormalizedDist[this._tuto3SumNormalizedDist.length - 1];
        for (let i = 0; i < this._tuto3Path.length; i++) {
            this._tuto3SumNormalizedDist[i] = this._tuto3SumNormalizedDist[i] / l3;
        }
    }
    _evaluatePath(f, path, sumDist) {
        let n = 0;
        while (n + 1 < sumDist.length &&
            n + 1 < path.length &&
            f > sumDist[n + 1]) {
            n++;
        }
        let d1 = sumDist[n];
        let d2 = sumDist[n + 1];
        let ff = (f - d1) / (d2 - d1);
        return BABYLON.Vector2.Lerp(path[n], path[n + 1], ff);
    }
    get shown() {
        return this.nabuPage.shown;
    }
    async show(duration) {
        //await RandomWait();
        this.router.game.scene.onBeforeRenderObservable.add(this.update);
        this.setTutoIndex(0, true);
        this.router.game.puzzle.puzzleUI.hideTouchInput();
        return new Promise(resolve => {
            requestAnimationFrame(async () => {
                requestAnimationFrame(() => {
                    CenterPanel(this.nabuPage, 0, 0);
                });
                await this.nabuPage.show(duration);
                this._registerToInputManager();
                resolve();
            });
        });
    }
    async hide(duration) {
        //await RandomWait();
        this.router.game.scene.onBeforeRenderObservable.removeCallback(this.update);
        this.router.game.puzzle.puzzleUI.showTouchInput();
        this._unregisterFromInputManager();
        return this.nabuPage.hide(duration);
    }
    async fadeOutBoard(duration = 1) {
        if (this.svgElement) {
            return new Promise(resolve => {
                this.svgElement.style.opacity = "1";
                this.tutoText.style.opacity = "1";
                let t0 = performance.now();
                let step = () => {
                    let f = (performance.now() - t0) / 1000 / duration;
                    if (f < 1) {
                        f = Nabu.Easing.easeInOutSine(f);
                        this.svgElement.style.opacity = (1 - f).toFixed(2);
                        this.tutoText.style.opacity = (1 - f).toFixed(2);
                        requestAnimationFrame(step);
                    }
                    else {
                        this.svgElement.style.opacity = "0";
                        this.tutoText.style.opacity = "0";
                        resolve();
                    }
                };
                step();
            });
        }
    }
    async fadeInBoard(duration = 1) {
        if (this.svgElement) {
            return new Promise(resolve => {
                this.svgElement.style.opacity = "0";
                this.tutoText.style.opacity = "0";
                let t0 = performance.now();
                let step = () => {
                    let f = (performance.now() - t0) / 1000 / duration;
                    if (f < 1) {
                        f = Nabu.Easing.easeInOutSine(f);
                        this.svgElement.style.opacity = f.toFixed(2);
                        this.tutoText.style.opacity = f.toFixed(2);
                        requestAnimationFrame(step);
                    }
                    else {
                        this.svgElement.style.opacity = "1";
                        this.tutoText.style.opacity = "1";
                        resolve();
                    }
                };
                step();
            });
        }
    }
    async setTutoIndex(v, force) {
        if (this._animating) {
            return;
        }
        v = Nabu.MinMax(v, 0, 3);
        if (v != this._tutoIndex || force) {
            if (force) {
                this._animating = true;
                await this.fadeOutBoard(0);
            }
            else {
                this._animating = true;
                await this.fadeOutBoard(0.25);
            }
            this._tutoIndex = v;
            this._timer = 0;
            document.querySelector("#tutorial-panel-0").setAttribute("visibility", "hidden");
            document.querySelector("#tutorial-panel-1").setAttribute("visibility", "hidden");
            document.querySelector("#tutorial-panel-2").setAttribute("visibility", "hidden");
            document.querySelector("#tutorial-panel-3").setAttribute("visibility", "hidden");
            if (this._tutoIndex === 0) {
                this.showTuto0();
            }
            else if (this._tutoIndex === 1) {
                this.showTuto1();
            }
            else if (this._tutoIndex === 2) {
                this.showTuto2();
            }
            else if (this._tutoIndex === 3) {
                this.showTuto3();
            }
            await this.fadeInBoard(0.25);
            this._animating = false;
        }
    }
    async showTuto0() {
        this.tutoText.innerHTML = "&nbsp;&nbsp;&nbsp;<i>1) " + I18Nizer.GetText("tuto-0-label", LOCALE) + "</i><br/>" + I18Nizer.GetText("tuto-0-text", LOCALE);
        document.querySelector("#tutorial-panel-0").setAttribute("visibility", "visible");
    }
    async showTuto1() {
        this.tutoText.innerHTML = "&nbsp;&nbsp;&nbsp;<i>2) " + I18Nizer.GetText("tuto-1-label", LOCALE) + "</i><br/>" + I18Nizer.GetText("tuto-1-text", LOCALE);
        document.querySelector("#tutorial-panel-1").setAttribute("visibility", "visible");
    }
    async showTuto2() {
        this.tutoText.innerHTML = "&nbsp;&nbsp;&nbsp;<i>3) " + I18Nizer.GetText("tuto-2-label", LOCALE) + "</i><br/>" + I18Nizer.GetText("tuto-2-text", LOCALE);
        if (IsTouchScreen) {
            this.svgKeyA.querySelector("text").innerHTML = "&lt;";
            this.svgKeyD.querySelector("text").innerHTML = "&gt;";
        }
        else {
            this.svgKeyA.querySelector("text").innerHTML = "A";
            this.svgKeyD.querySelector("text").innerHTML = "D";
        }
        document.querySelector("#tutorial-panel-2").setAttribute("visibility", "visible");
    }
    async showTuto3() {
        this.tutoText.innerHTML = "&nbsp;&nbsp;&nbsp;<i>4) " + I18Nizer.GetText("tuto-3-label", LOCALE) + "</i><br/>" + I18Nizer.GetText("tuto-3-text", LOCALE);
        document.querySelector("#tutorial-panel-3").setAttribute("visibility", "visible");
    }
    _registerToInputManager() {
        this.router.game.uiInputManager.onLeftCallbacks.push(this._inputLeft);
        this.router.game.uiInputManager.onRightCallbacks.push(this._inputRight);
    }
    _unregisterFromInputManager() {
        this.router.game.uiInputManager.onLeftCallbacks.remove(this._inputLeft);
        this.router.game.uiInputManager.onRightCallbacks.remove(this._inputRight);
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
            if (document.activeElement instanceof HTMLTextAreaElement) {
                return;
            }
            this.inControl = true;
            if (ev.code === "KeyW" || ev.code === "ArrowUp") {
                ev.preventDefault();
                this.onUpCallbacks.forEach(cb => {
                    cb();
                });
            }
            if (ev.code === "KeyA" || ev.code === "ArrowLeft") {
                ev.preventDefault();
                this.onLeftCallbacks.forEach(cb => {
                    cb();
                });
            }
            if (ev.code === "KeyS" || ev.code === "ArrowDown") {
                ev.preventDefault();
                this.onDownCallbacks.forEach(cb => {
                    cb();
                });
            }
            if (ev.code === "KeyD" || ev.code === "ArrowRight") {
                ev.preventDefault();
                this.onRightCallbacks.forEach(cb => {
                    cb();
                });
            }
            if (ev.code === "Enter" || ev.code === "Space" || ev.code === "KeyE") {
                ev.preventDefault();
                this.onEnterCallbacks.forEach(cb => {
                    cb();
                });
            }
            if (ev.code === "Backspace" || ev.code === "KeyX") {
                ev.preventDefault();
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
        this.material = this.game.materials.blackMaterial;
    }
    async instantiate() {
        //await RandomWait();
        await super.instantiate();
        let xPlus = 0;
        let xMinus = 0;
        if (this.i === 0) {
            xMinus = -0.1;
        }
        else {
            let stack = this.game.puzzle.getGriddedStack(this.i - 1, this.j);
            if (stack && stack.array.find(t => { return t instanceof WallTile; })) {
                xMinus = -0.05;
            }
        }
        if (this.i === this.game.puzzle.w - 1) {
            xPlus = 0.1;
        }
        else {
            let stack = this.game.puzzle.getGriddedStack(this.i + 1, this.j);
            if (stack && stack.array.find(t => { return t instanceof WallTile; })) {
                xPlus = 0.05;
            }
        }
        let zPlus = 0;
        let zMinus = 0;
        if (this.j === 0) {
            zMinus = -0.1;
        }
        else {
            let stack = this.game.puzzle.getGriddedStack(this.i, this.j - 1);
            if (stack && stack.array.find(t => { return t instanceof WallTile; })) {
                zMinus = -0.05;
            }
        }
        if (this.j === this.game.puzzle.h - 1) {
            zPlus = 0.1;
        }
        else {
            let stack = this.game.puzzle.getGriddedStack(this.i, this.j + 1);
            if (stack && stack.array.find(t => { return t instanceof WallTile; })) {
                zPlus = 0.05;
            }
        }
        let data = BABYLON.CreateBoxVertexData({ width: 1 + xPlus - xMinus, height: 0.3, depth: 1 + zPlus - zMinus });
        Mummu.TranslateVertexDataInPlace(data, new BABYLON.Vector3(xPlus * 0.5 + xMinus * 0.5, 0.15, zPlus * 0.5 + zMinus * 0.5));
        data.applyToMesh(this);
    }
}
class CherryTree extends Tile {
    constructor(game, props) {
        super(game, props);
        this.material = this.game.materials.brownMaterial;
        this.renderOutline = true;
        this.outlineColor = BABYLON.Color3.Black();
        this.outlineWidth = 0.02;
        this.tileTop = new BABYLON.Mesh("tile-top");
        this.tileTop.parent = this;
        this.tileTop.position.y = 0.2;
        this.tileTop.material = this.game.materials.whiteMaterial;
        this.trunk = new BABYLON.Mesh("trunk");
        this.trunk.parent = this;
        this.trunk.position.y = 0.2;
        this.trunk.material = this.game.materials.trueWhiteMaterial;
        this.trunk.renderOutline = true;
        this.trunk.outlineColor = BABYLON.Color3.Black();
        this.trunk.outlineWidth = 0.02;
        this.flower = new BABYLON.Mesh("flower");
        this.flower.parent = this;
        this.flower.position.y = 0.2;
        this.flower.material = this.game.materials.trueWhiteMaterial;
        this.flower.renderOutline = true;
        this.flower.outlineColor = BABYLON.Color3.Black();
        this.flower.outlineWidth = 0.02;
    }
    async instantiate() {
        await super.instantiate();
        let tileData = CreateBoxFrameVertexData({
            w: 1,
            d: 1,
            h: 0.3,
            thickness: 0.05,
            innerHeight: 0.1,
            flatShading: false,
            topCap: false,
            bottomCap: true,
        });
        tileData.applyToMesh(this);
        BABYLON.CreateGroundVertexData({ width: 0.9, height: 0.9 }).applyToMesh(this.tileTop);
        let datas = await this.game.vertexDataLoader.get("./datas/meshes/cherry.babylon");
        datas[0].applyToMesh(this.trunk);
        datas[1].applyToMesh(this.flower);
    }
}
class Nobori extends Tile {
    constructor(game, props) {
        super(game, props);
        this.mast = new BABYLON.Mesh("nobori-mast");
        this.mast.parent = this;
        this.mast.position.x = -0.5;
        this.mast.position.z = 0.5;
        this.mast.material = this.game.materials.brownMaterial;
        this.mast.renderOutline = true;
        this.mast.outlineColor = BABYLON.Color3.Black();
        this.mast.outlineWidth = 0.02;
        this.flag = new BABYLON.Mesh("nobori-flag");
        this.flag.parent = this.mast;
        this.flag.position.x = 0.35;
        this.flag.position.y = 3;
        this.flag.material = this.game.materials.redMaterial;
        this.flag.renderOutline = true;
        this.flag.outlineColor = BABYLON.Color3.Black();
        this.flag.outlineWidth = 0.02;
    }
    async instantiate() {
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
            this.shadow.position.z = -0.015;
            shadowData.applyToMesh(this.shadow);
        }
        let datas = await this.game.vertexDataLoader.get("./datas/meshes/nobori.babylon");
        datas[0].applyToMesh(this.mast);
        datas[1].applyToMesh(this.flag);
    }
}
/// <reference path="./Tile.ts"/>
class WaterTile extends Tile {
    constructor(game, props) {
        super(game, props);
        this.path = [];
        this.distFromSource = Infinity;
        this.color = props.color;
        this.material = this.game.materials.blackMaterial;
        this.renderOutline = true;
        this.outlineColor = BABYLON.Color3.Black();
        this.outlineWidth = 0.01;
        this.shoreMesh = new BABYLON.Mesh("shore");
        this.shoreMesh.parent = this;
        this.shoreMesh.material = this.game.materials.whiteMaterial;
        this.waterMesh = new BABYLON.Mesh("water");
        this.waterMesh.parent = this;
        this.waterMesh.material = this.game.materials.waterMaterial;
        this.floorMesh = new BABYLON.Mesh("floor");
        this.floorMesh.parent = this;
        this.floorMesh.material = this.game.puzzle.floorMaterial;
        let floorData = BABYLON.CreateGroundVertexData({ width: 1.1, height: 1.1 });
        for (let i = 0; i < floorData.positions.length / 3; i++) {
            floorData.uvs[2 * i] = 0.5 * (floorData.positions[3 * i] + this.position.x);
            floorData.uvs[2 * i + 1] = 0.5 * (floorData.positions[3 * i + 2] + this.position.z) - 0.5;
        }
        floorData.applyToMesh(this.floorMesh);
    }
    get size() {
        return this.scaling.y;
    }
    set size(s) {
        this.scaling.copyFromFloats(1, s, 1);
    }
    disconnect() {
        this.distFromSource = Infinity;
        this.iMinusWater = undefined;
        this.iPlusWater = undefined;
        this.jMinusWater = undefined;
        this.jPlusWater = undefined;
        if (this.sculptMesh) {
            this.sculptMesh.dispose();
            this.sculptMesh = undefined;
        }
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
        let downStack = this.game.puzzle.getGriddedStack(this.i, this.j - 1);
        let downWaterTile;
        if (downStack) {
            downWaterTile = downStack.array.find(tile => { return tile instanceof WaterTile; });
        }
        if (downWaterTile && (!this.jMinusWater || this.jMinusWater.distFromSource > d + 1)) {
            this.jMinusWater = downWaterTile;
            downWaterTile.jPlusWater = this;
            downWaterTile.recursiveConnect(d + 1);
            return;
        }
        let rightStack = this.game.puzzle.getGriddedStack(this.i + 1, this.j);
        let rightWaterTile;
        if (rightStack) {
            rightWaterTile = rightStack.array.find(tile => { return tile instanceof WaterTile; });
        }
        if (rightWaterTile && (!this.iPlusWater || this.iPlusWater.distFromSource > d + 1)) {
            this.iPlusWater = rightWaterTile;
            rightWaterTile.iMinusWater = this;
            rightWaterTile.recursiveConnect(d + 1);
            return;
        }
        let leftStack = this.game.puzzle.getGriddedStack(this.i - 1, this.j);
        let leftWaterTile;
        if (leftStack) {
            leftWaterTile = leftStack.array.find(tile => { return tile instanceof WaterTile; });
        }
        if (leftWaterTile && (!this.iMinusWater || this.iMinusWater.distFromSource > d + 1)) {
            this.iMinusWater = leftWaterTile;
            leftWaterTile.iPlusWater = this;
            leftWaterTile.recursiveConnect(d + 1);
            return;
        }
        let upStack = this.game.puzzle.getGriddedStack(this.i, this.j + 1);
        let upWaterTile;
        if (upStack) {
            upWaterTile = upStack.array.find(tile => { return tile instanceof WaterTile; });
        }
        if (upWaterTile && (!this.jPlusWater || this.jPlusWater.distFromSource > d + 1)) {
            this.jPlusWater = upWaterTile;
            upWaterTile.jMinusWater = this;
            upWaterTile.recursiveConnect(d + 1);
            return;
        }
    }
    async instantiate() {
        //await RandomWait();
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
                    this.sculptMesh.material = this.game.materials.grayMaterial;
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
                    this.sculptMesh.material = this.game.materials.grayMaterial;
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
        this.floorMesh.material = this.game.puzzle.floorMaterial;
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
            if (!this.game.performanceWatcher.supportTexture3D) {
                return;
            }
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
        if (this.game.performanceWatcher.supportTexture3D) {
            this.bubbleMaterial = new ExplosionMaterial("explosion-material", this.game.scene);
            this.bubbleMaterial.setUseLightFromPOV(true);
            this.bubbleMaterial.setAutoLight(0.8);
        }
    }
    setRadius(v) {
        this.radiusXZ = v;
        this.radiusY = v;
        this.particuleRadius = v;
    }
    get color() {
        if (this.bubbleMaterial) {
            return this.bubbleMaterial.diffuse;
        }
        return BABYLON.Color3.White();
    }
    set color(c) {
        if (this.bubbleMaterial) {
            this.bubbleMaterial.setDiffuse(c);
        }
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
        //await RandomWait();
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
        if (!this.game.performanceWatcher.supportTexture3D) {
            return;
        }
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
        //await RandomWait();
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
        this.lineMesh.material = this.puzzle.game.materials.trueWhiteMaterial;
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
        Mummu.ColorizeVertexDataInPlace(magnet, this.puzzle.game.materials.blackMaterial.diffuseColor);
        let line = BABYLON.CreateCylinderVertexData({ diameter: 0.05, height: 100, tessellation: 12, cap: BABYLON.Mesh.NO_CAP });
        Mummu.ColorizeVertexDataInPlace(line, this.puzzle.game.materials.brownMaterial.diffuseColor.scale(1.5));
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
var PuzzleState;
(function (PuzzleState) {
    PuzzleState[PuzzleState["Loading"] = 0] = "Loading";
    PuzzleState[PuzzleState["Ready"] = 1] = "Ready";
    PuzzleState[PuzzleState["Playing"] = 2] = "Playing";
    PuzzleState[PuzzleState["Wining"] = 3] = "Wining";
    PuzzleState[PuzzleState["Done"] = 4] = "Done";
})(PuzzleState || (PuzzleState = {}));
class Puzzle {
    constructor(game) {
        this.game = game;
        this.editorOrEditorPreview = false;
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
        this._winloseTimout = 0;
        this.puzzleState = PuzzleState.Done;
        this.playTimer = 0;
        this.fishingPolesCount = 0;
        this.creeps = [];
        this.tiles = [];
        this.blockTiles = [];
        this.griddedTiles = [];
        this.griddedBorders = [];
        this.buildings = [];
        this.buildingBlocks = [];
        this.buildingBlocksBorders = [];
        this.showFPS = false;
        this.w = 10;
        this.h = 10;
        this._pendingPublish = false;
        this.tileHaikus = [];
        this.playerHaikus = [];
        this.floorMaterialIndex = 0;
        this.winAnimationTime = 4;
        this.buildingUpStep = 0.1;
        this.buildingUpValue = 1;
        this._ballCollisionTimeStamp = 0;
        this._timer = 0;
        this._globalTime = 0;
        this.balls = [
            new Ball(this, { color: TileColor.North }, 0),
        ];
        this.fishingPole = new FishingPole(this);
        this.floor = new BABYLON.Mesh("floor");
        this.floor.material = this.game.materials.floorMaterial;
        this.invisiFloorTM = BABYLON.MeshBuilder.CreateGround("invisifloor", { width: 10, height: 10 });
        this.invisiFloorTM.position.x = 5 - 0.55;
        this.invisiFloorTM.position.y = -0.01;
        this.invisiFloorTM.position.z = 5 - 0.55;
        this.invisiFloorTM.isVisible = false;
        this.holeWall = new BABYLON.Mesh("hole-wall");
        this.holeWall.material = this.game.materials.holeMaterial;
        this.buildingsContainer = new BABYLON.Mesh("boxes-container");
        this.boxesWall = new BABYLON.Mesh("building-wall");
        this.boxesWall.material = this.game.materials.wallMaterial;
        this.boxesWall.parent = this.buildingsContainer;
        this.boxesWood = new BABYLON.Mesh("building-wood");
        this.boxesWood.material = this.game.materials.brownMaterial;
        this.boxesWood.parent = this.buildingsContainer;
        this.boxesFloor = new BABYLON.Mesh("building-floor");
        this.boxesFloor.material = this.game.materials.woodFloorMaterial;
        this.boxesFloor.parent = this.buildingsContainer;
        this.bordersMesh = new BABYLON.Mesh("borders-mesh");
        this.bordersMesh.material = this.game.materials.borderMaterial;
        this.bordersMesh.parent = this.buildingsContainer;
        this.bordersMesh.renderOutline = true;
        this.bordersMesh.outlineColor = BABYLON.Color3.Black();
        this.bordersMesh.outlineWidth = 0.01;
        this.puzzleUI = new PuzzleUI(this);
        if (this.showFPS) {
            this.fpsMaterial = new BABYLON.StandardMaterial("test-haiku-material");
            this.fpsTexture = new BABYLON.DynamicTexture("haiku-texture", { width: 600, height: 200 });
            this.fpsTexture.hasAlpha = true;
            this.fpsMaterial.diffuseTexture = this.fpsTexture;
            this.fpsMaterial.specularColor.copyFromFloats(0.3, 0.3, 0.3);
            this.fpsMaterial.useAlphaFromDiffuseTexture = true;
        }
        this.clicSound = this.game.soundManager.createSound("clic", "./datas/sounds/clic.wav", undefined, undefined, { autoplay: false, loop: false, volume: 0.15 }, 3);
        this.cricSound = this.game.soundManager.createSound("cric", "./datas/sounds/clic.wav", undefined, undefined, { autoplay: false, loop: false, volume: 0.25, playbackRate: 0.92 }, 3);
        this.cracSound = this.game.soundManager.createSound("crac", "./datas/sounds/clic.wav", undefined, undefined, { autoplay: false, loop: false, volume: 0.25, playbackRate: 0.84 }, 3);
        this.tingSound = this.game.soundManager.createSound("ting", "./datas/sounds/A (18).mp3", undefined, undefined, { autoplay: false, loop: false, volume: 0.2, playbackRate: 1 }, 2);
        this.wiishSound = this.game.soundManager.createSound("wiish", "./datas/sounds/wind.mp3", undefined, undefined, { autoplay: false, loop: false, volume: 0.15, playbackRate: 1 }, 3);
        this.wooshSound = this.game.soundManager.createSound("woosh", "./datas/sounds/wind.mp3", undefined, undefined, { autoplay: false, loop: false, volume: 0.1, playbackRate: 0.8 }, 3);
        this.longCrackSound = this.game.soundManager.createSound("long-crack", "./datas/sounds/long_crack_bass.mp3", undefined, undefined, { autoplay: false, loop: false, volume: 1 }, 3);
        this.fallImpactSound = this.game.soundManager.createSound("fall-impact", "./datas/sounds/fall-impact.wav", undefined, undefined, { autoplay: false, loop: false, volume: 0.4 }, 3);
        this.slashSound = this.game.soundManager.createSound("slash", "./datas/sounds/slash.mp3", undefined, undefined, { autoplay: false, loop: false, volume: 0.4 });
        this.snapBassSound = this.game.soundManager.createSound("snap-bass", "./datas/sounds/snap_bass.mp3", undefined, undefined, { autoplay: false, loop: false, volume: 0.6 }, 3);
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
                        console.warn("It's been found elsewhere.");
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
    forceFullBuildingBlockGrid() {
        for (let i = 0; i < this.w; i++) {
            for (let j = 0; j < this.h; j++) {
                this.buildingBlockSet(this.buildingBlockGet(i, j), i, j);
            }
        }
    }
    get floorMaterial() {
        let index = this.floorMaterialIndex % this.game.materials.floorMaterials.length;
        return this.game.materials.floorMaterials[index];
    }
    get haikuColor() {
        if (this.floorMaterialIndex === 6) {
            return "#e3d8caff";
        }
        if (this.floorMaterialIndex === 5) {
            return "#e3d8caff";
        }
        return "#e3cfb4ff";
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
        if (i >= 0 && i < this.heightMap.length) {
            if (j >= 0 && j < this.heightMap[i].length) {
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
    async reset(replaying) {
        //await RandomWait();
        this.game.fadeOutIntro(0);
        this.fishingPole.stop = true;
        this.puzzleUI.reset();
        if (this.data) {
            this.resetFromData(this.data, replaying);
            await this.instantiate(replaying);
        }
        document.querySelector("#puzzle-title").innerHTML = GetTranslatedTitle(this.data);
        document.querySelector("#puzzle-author").innerHTML = "created by " + this.data.author;
        document.querySelector("#puzzle-skip-intro").style.display = "";
        document.querySelector("#puzzle-ready").style.display = "none";
        if (!this.editorOrEditorPreview && this.data.state === PuzzleDataState.STORY && this.data.numLevel === 1) {
            this.game.router.tutoPage.show(1);
        }
        else {
            this.game.fadeInIntro();
        }
    }
    skipIntro() {
        document.querySelector("#puzzle-skip-intro").style.display = "none";
        document.querySelector("#puzzle-ready").style.display = "";
        this.game.mode = GameMode.Play;
        SDKGameplayStart();
        this.puzzleUI.showTouchInput();
    }
    win() {
        SDKGameplayStop();
        this.puzzleState = PuzzleState.Wining;
        let score = Math.floor(this.playTimer * 100);
        let previousCompletion = 0;
        if (this.data.state === PuzzleDataState.OKAY) {
            previousCompletion = this.game.puzzleCompletion.communityPuzzleCompletion;
        }
        else if (this.data.state === PuzzleDataState.STORY) {
            previousCompletion = this.game.puzzleCompletion.storyPuzzleCompletion;
        }
        else if (this.data.state === PuzzleDataState.XPERT) {
            previousCompletion = this.game.puzzleCompletion.expertPuzzleCompletion;
        }
        else if (this.data.state === PuzzleDataState.XMAS) {
            previousCompletion = this.game.puzzleCompletion.xmasPuzzleCompletion;
        }
        let firstTimeCompleted = !this.game.puzzleCompletion.isPuzzleCompleted(this.data.id);
        this.game.puzzleCompletion.completePuzzle(this.data.id, score);
        this.puzzleUI.successPanel.querySelector("#success-timer").innerHTML = Game.ScoreToString(score);
        clearTimeout(this._winloseTimout);
        setTimeout(() => {
            this.puzzleUI.hideTouchInput();
            this.balls[0].winAnimation();
        }, 500);
        setTimeout(() => {
            this.puzzleUI.winSound.play();
        }, 1000);
        this._winloseTimout = setTimeout(() => {
            this.puzzleUI.win(firstTimeCompleted, previousCompletion);
            if (!this.editorOrEditorPreview && !OFFLINE_MODE && (this.data.score === null || score < this.data.score)) {
                this.puzzleUI.setHighscoreState(1);
            }
            else {
                this.puzzleUI.setHighscoreState(0);
            }
            this.puzzleState = PuzzleState.Done;
            this.game.mode = GameMode.Menu;
        }, this.winAnimationTime * 1000);
    }
    lose() {
        SDKGameplayStop();
        clearTimeout(this._winloseTimout);
        this._winloseTimout = setTimeout(() => {
            this.puzzleUI.hideTouchInput();
            this.puzzleState = PuzzleState.Done;
            this.puzzleUI.lose();
        }, 1000);
    }
    async submitHighscore() {
        //await RandomWait();
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
                let puzzleData = await this.game.getPuzzleDataById(this.data.id);
                puzzleData.player = player;
                puzzleData.score = score;
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
        //await RandomWait();
        let file = await fetch(path);
        let content = await file.text();
        this.resetFromData({
            id: null,
            title: "No Title",
            author: "No Author",
            content: content
        });
    }
    resetFromData(data, replaying) {
        clearTimeout(this._winloseTimout);
        if (!replaying) {
            while (this.buildings.length > 0) {
                this.buildings[0].dispose();
            }
            while (this.buildingBlocksBorders.length > 0) {
                this.buildingBlocksBorders.pop().dispose();
            }
            this.griddedBorders = [];
        }
        while (this.tiles.length > 0) {
            this.tiles[0].dispose();
        }
        while (this.creeps.length > 0) {
            this.creeps.pop().dispose();
        }
        if (this.haiku) {
            this.haiku.dispose();
            this.haiku = undefined;
        }
        if (this.titleHaiku) {
            this.titleHaiku.dispose();
            this.titleHaiku = undefined;
        }
        while (this.tileHaikus.length > 0) {
            this.tileHaikus.pop().dispose();
        }
        while (this.playerHaikus.length > 0) {
            this.playerHaikus.pop().dispose();
        }
        this.blockTiles = [];
        this.griddedTiles = [];
        this.data = data;
        DEV_UPDATE_STATE_UI();
        if (isFinite(data.id)) {
            if (data.difficulty === 1) {
                this.game.bodyColorIndex = 10;
            }
            if (data.difficulty === 2) {
                this.game.bodyColorIndex = 3;
            }
            if (data.difficulty === 3) {
                this.game.bodyColorIndex = 8;
            }
            if (data.difficulty === 4) {
                this.game.bodyColorIndex = 7;
            }
            if (data.difficulty === 0) {
                this.game.bodyColorIndex = 5;
            }
            this.game.bodyPatternIndex = Math.floor(Math.random() * 2);
        }
        let content = this.data.content;
        content = content.replaceAll("\r\n", "");
        content = content.replaceAll("\n", "");
        let lines = content.split("x");
        let ballLine = lines.splice(0, 1)[0].split("u");
        this.ballsCount = 1;
        if (ballLine.length === 8 || ballLine.length === 9) {
            this.ballsCount = 2;
            this.ballsCount = 1;
        }
        let bIndexZero = 0;
        if (ballLine.length === 5 || ballLine.length === 8) {
            bIndexZero = 2;
        }
        else if (ballLine.length === 6 || ballLine.length === 9) {
            bIndexZero = 3;
        }
        for (let bIndex = 0; bIndex < this.ballsCount; bIndex++) {
            this.balls[bIndex].reset();
            this.balls[bIndex].position.x = parseInt(ballLine[bIndexZero + 0 + 3 * bIndex]) * 1.1;
            this.balls[bIndex].position.y = 0;
            this.balls[bIndex].position.z = parseInt(ballLine[bIndexZero + 1 + 3 * bIndex]) * 1.1;
            this.ballsPositionZero[bIndex].copyFrom(this.balls[bIndex].position);
            if (ballLine.length > 2) {
                this.balls[bIndex].setColor(parseInt(ballLine[bIndexZero + 2 + 3 * bIndex]));
            }
            else {
                this.balls[bIndex].setColor(TileColor.North);
            }
            this.balls[bIndex].lockControl(0.2);
            this.game.setPlayTimer(0);
        }
        for (let bIndex = this.ballsCount; bIndex < this.balls.length; bIndex++) {
            this.balls[bIndex].setVisible(false);
        }
        if (this.ballsCount === 1) {
            this.balls[0].material = this.game.materials.brownMaterial;
        }
        else if (this.ballsCount === 2) {
            this.balls[0].material = this.game.materials.whiteMaterial;
            this.balls[1].material = this.game.materials.blackMaterial;
            this.playerHaikus[0] = new HaikuPlayerStart(this.game, this.game.player1Name.toLocaleUpperCase(), this.balls[0]);
            this.playerHaikus[1] = new HaikuPlayerStart(this.game, this.game.player2Name.toLocaleUpperCase(), this.balls[1]);
        }
        this.ballCollision.copyFromFloats(-10, 0, -10);
        this.ballCollisionDone = [true, true];
        this.fishingPolesCount = 0;
        let buildingBlocksLine = lines[lines.length - 1];
        if (buildingBlocksLine.startsWith("BB")) {
            lines.pop();
        }
        else {
            buildingBlocksLine = "";
        }
        if (ballLine.length === 5 || ballLine.length === 8) {
            this.w = parseInt(ballLine[0]);
            this.h = parseInt(ballLine[1]);
        }
        else {
            this.h = lines.length;
            this.w = lines[0].length;
        }
        if (ballLine.length === 6 || ballLine.length === 9) {
            this.floorMaterialIndex = parseInt(ballLine[2]);
        }
        else {
            this.floorMaterialIndex = 0;
        }
        if (!replaying) {
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
        }
        for (let j = 0; j < lines.length && j < this.h; j++) {
            let line = lines[lines.length - 1 - j];
            let i = 0;
            for (let ii = 0; ii < line.length && i < this.w; ii++) {
                let c = line[ii];
                if (c === "p") {
                    let push = new PushTile(this.game, {
                        color: TileColor.North,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                else if (c === "O") {
                    let hole = new HoleTile(this.game, {
                        color: TileColor.North,
                        i: i,
                        j: j,
                        h: 0,
                        noShadow: true
                    });
                }
                else if (c === "Q") {
                    let hole = new HoleTile(this.game, {
                        color: TileColor.North,
                        i: i,
                        j: j,
                        h: 0,
                        noShadow: true
                    });
                    hole.covered = true;
                }
                else if (c === "r") {
                    let rock = new WallTile(this.game, {
                        color: TileColor.North,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                else if (c === "a") {
                    let wall = new WallTile(this.game, {
                        color: TileColor.North,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                else if (c === "b") {
                    let nobori = new Nobori(this.game, {
                        color: TileColor.North,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                else if (c === "q") {
                    let water = new WaterTile(this.game, {
                        color: TileColor.North,
                        i: i,
                        j: j,
                        h: 0,
                        noShadow: true
                    });
                }
                else if (c === "N") {
                    let block = new SwitchTile(this.game, {
                        color: TileColor.North,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                else if (c === "n") {
                    let block = new BlockTile(this.game, {
                        color: TileColor.North,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                else if (c === "E") {
                    let block = new SwitchTile(this.game, {
                        color: TileColor.East,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                else if (c === "e") {
                    let block = new BlockTile(this.game, {
                        color: TileColor.East,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                else if (c === "S") {
                    let block = new SwitchTile(this.game, {
                        color: TileColor.South,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                else if (c === "s") {
                    let block = new BlockTile(this.game, {
                        color: TileColor.South,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                else if (c === "W") {
                    let block = new SwitchTile(this.game, {
                        color: TileColor.West,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                else if (c === "w") {
                    let block = new BlockTile(this.game, {
                        color: TileColor.West,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                else if (c === "I") {
                    let button = new ButtonTile(this.game, {
                        color: TileColor.North,
                        value: 1,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                else if (c === "D") {
                    let button = new ButtonTile(this.game, {
                        color: TileColor.North,
                        value: 2,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                else if (c === "T") {
                    let button = new ButtonTile(this.game, {
                        color: TileColor.North,
                        value: 3,
                        i: i,
                        j: j,
                        h: 0
                    });
                }
                else if (c === "i") {
                    let button = new DoorTile(this.game, {
                        color: TileColor.North,
                        value: 1,
                        i: i,
                        j: j,
                        h: 0,
                        noShadow: true
                    });
                }
                else if (c === "j") {
                    let button = new DoorTile(this.game, {
                        color: TileColor.North,
                        value: 1,
                        i: i,
                        j: j,
                        h: 0,
                        noShadow: true
                    });
                    button.close(0);
                }
                else if (c === "d") {
                    let button = new DoorTile(this.game, {
                        color: TileColor.North,
                        value: 2,
                        i: i,
                        j: j,
                        h: 0,
                        noShadow: true
                    });
                }
                else if (c === "f") {
                    let button = new DoorTile(this.game, {
                        color: TileColor.North,
                        value: 2,
                        i: i,
                        j: j,
                        h: 0,
                        noShadow: true
                    });
                    button.close(0);
                }
                else if (c === "t") {
                    let button = new DoorTile(this.game, {
                        color: TileColor.North,
                        value: 3,
                        i: i,
                        j: j,
                        h: 0,
                        noShadow: true
                    });
                }
                else if (c === "u") {
                    let button = new DoorTile(this.game, {
                        color: TileColor.North,
                        value: 3,
                        i: i,
                        j: j,
                        h: 0,
                        noShadow: true
                    });
                    button.close(0);
                }
                else if (c === "c") {
                    let creep = new Creep(this, {
                        i: i,
                        j: j
                    });
                }
                else if (c === "B") {
                    if (!replaying) {
                        this.buildingBlocks[i][j] = 1;
                        this.buildingBlocks[i + 1][j] = 1;
                        this.buildingBlocks[i][j + 1] = 1;
                        this.buildingBlocks[i + 1][j + 1] = 1;
                    }
                }
                else if (c === "R") {
                    let s = parseInt(line[ii + 1]);
                    if (isNaN(s)) {
                        if (!replaying) {
                            let ramp = new Ramp(this.game, {
                                i: i,
                                j: j,
                                size: 2
                            });
                        }
                    }
                    else {
                        if (!replaying) {
                            let ramp = new Ramp(this.game, {
                                i: i,
                                j: j,
                                size: s
                            });
                        }
                        ii++;
                    }
                }
                else if (c === "U") {
                    if (!replaying) {
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
                i++;
            }
        }
        if (data.haiku) {
            let split = data.haiku.split("x");
            let x = parseInt(split[0]) * 0.55;
            let z = parseInt(split[1]) * 0.55;
            let haiku;
            if (z < -2) {
                haiku = new Haiku(this.game, "", 2000, 200);
                haiku.position.copyFromFloats((this.w - 1) * 1.1 * 0.5, 0.32, -1);
                this.titleHaiku = new Haiku(this.game, "", 2000, 200);
                this.titleHaiku.position.copyFromFloats((this.w - 1) * 1.1 * 0.5, 0.32, this.h * 1.1 - 0.15);
                this.titleHaiku.setText(GetTranslatedTitle(this.data));
            }
            else {
                haiku = new Haiku(this.game, "");
                haiku.position.copyFromFloats(x, 0.02, z);
            }
            this.haiku = haiku;
            let translatedText = HaikuMaker.GetTranslatedHaikuText(this);
            if (translatedText) {
                haiku.setText(translatedText);
            }
            else {
                split = data.haiku.split("x");
                split.splice(0, 2);
                let text = split.reduce((s1, s2) => { return s1 + "x" + s2; });
                haiku.setText(text);
            }
        }
        this.game.updateMenuCameraRadius();
    }
    connectWaterTiles() {
        let waterTiles = this.tiles.filter(t => { return t instanceof WaterTile; });
        waterTiles.forEach(waterTile => {
            waterTile.disconnect();
        });
        while (waterTiles.length > 2) {
            waterTiles = waterTiles.sort((t1, t2) => {
                if (t2.j === t1.j) {
                    return t1.i - t2.i;
                }
                return t2.j - t1.j;
            });
            if (waterTiles[0]) {
                waterTiles[0].recursiveConnect(0);
            }
            waterTiles = this.tiles.filter(t => { return t instanceof WaterTile && t.distFromSource === Infinity; });
        }
    }
    async NextFrame() {
        return new Promise(resolve => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    resolve();
                });
            });
        });
    }
    async SkipNextFrame() {
        return new Promise(resolve => {
            requestAnimationFrame(() => {
                resolve();
            });
        });
    }
    async instantiate(replaying) {
        //await RandomWait();
        this.puzzleState = PuzzleState.Loading;
        if (!replaying) {
            this.boxesWall.isVisible = false;
            this.boxesWood.isVisible = false;
            this.boxesFloor.isVisible = false;
            this.bordersMesh.isVisible = false;
            this.buildingsContainer.scaling.y = 0.01;
            let instantiatableTiles = this.tiles.filter(tile => {
                return tile instanceof BlockTile ||
                    tile instanceof SwitchTile ||
                    tile instanceof ButtonTile ||
                    tile instanceof DoorTile ||
                    tile instanceof HoleTile && tile.covered ||
                    tile instanceof WaterTile;
            });
            if (instantiatableTiles.length > 0) {
                this.buildingUpStep = 1 / instantiatableTiles.length;
            }
            else {
                this.buildingUpStep = 1;
            }
            this.buildingUpValue = 0;
            this.regenerateHeightMap();
            await this.SkipNextFrame();
        }
        this.rebuildFloor();
        await this.SkipNextFrame();
        if (!replaying) {
            for (let i = 0; i < this.buildings.length; i++) {
                this.buildings[i].regenerateBorders();
            }
            this.regenerateBuildingBlocksBorders();
            for (let i = 0; i < this.buildings.length; i++) {
                await this.buildings[i].instantiate();
            }
            let bordersVertexDatas = [];
            for (let i = 0; i < this.buildings.length; i++) {
                let building = this.buildings[i];
                for (let j = 0; j < building.borders.length; j++) {
                    let border = building.borders[j];
                    let data = await border.getVertexData();
                    if (data) {
                        Mummu.RotateAngleAxisVertexDataInPlace(data, border.rotationY, BABYLON.Axis.Y);
                        Mummu.TranslateVertexDataInPlace(data, border.position);
                        bordersVertexDatas.push(data);
                    }
                }
                await this.SkipNextFrame();
            }
            for (let i = 0; i < this.buildingBlocksBorders.length; i++) {
                let data = await this.buildingBlocksBorders[i].getVertexData();
                if (data) {
                    Mummu.RotateAngleAxisVertexDataInPlace(data, this.buildingBlocksBorders[i].rotationY, BABYLON.Axis.Y);
                    Mummu.TranslateVertexDataInPlace(data, this.buildingBlocksBorders[i].position);
                    bordersVertexDatas.push(data);
                }
                if (i > 0 && i % 10 === 0) {
                    await this.SkipNextFrame();
                }
            }
            if (bordersVertexDatas.length > 0) {
                this.bordersMesh.isVisible = true;
                Mummu.MergeVertexDatas(...bordersVertexDatas).applyToMesh(this.bordersMesh);
            }
            else {
                this.bordersMesh.isVisible = false;
            }
            await this.NextFrame();
            let datas = await BuildingBlock.GenerateVertexDatas(this);
            datas[0].applyToMesh(this.boxesWall);
            datas[1].applyToMesh(this.boxesWood);
            datas[2].applyToMesh(this.boxesFloor);
            this.boxesWall.isVisible = true;
            this.boxesWood.isVisible = true;
            this.boxesFloor.isVisible = true;
            let buildingScalingYAnimation = Mummu.AnimationFactory.CreateNumber(this.buildingsContainer, this.buildingsContainer.scaling, "y");
            buildingScalingYAnimation(1, 2, Nabu.Easing.easeOutSine);
            await this.NextFrame();
        }
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
        this.connectWaterTiles();
        for (let i = 0; i < this.tiles.length; i++) {
            let tile = this.tiles[i];
            await tile.instantiate();
            if (!replaying) {
                if (tile instanceof BlockTile ||
                    tile instanceof SwitchTile ||
                    tile instanceof ButtonTile ||
                    tile instanceof DoorTile ||
                    tile instanceof HoleTile && tile.covered ||
                    tile instanceof WaterTile ||
                    tile instanceof Nobori) {
                    tile.size = 0;
                    tile.bump(1);
                    await this.NextFrame();
                }
                else if (tile instanceof WallTile) {
                    await this.SkipNextFrame();
                }
            }
        }
        for (let i = 0; i < this.creeps.length; i++) {
            this.creeps[i].position.y = this.hMapGet(this.creeps[i].i, this.creeps[i].j);
            await this.creeps[i].instantiate();
            if (!replaying) {
                await this.NextFrame();
            }
        }
        for (let i = 0; i < this.ballsCount; i++) {
            await this.balls[i].instantiate();
            if (!replaying) {
                await this.NextFrame();
            }
        }
        if (this.ballsCount === 2) {
            this.playerHaikus[0].show();
            this.playerHaikus[1].show();
        }
        HaikuMaker.MakeHaiku(this);
        if (!replaying) {
            await this.NextFrame();
        }
        this.puzzleState = PuzzleState.Ready;
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
    async editorRegenerateWaterTiles() {
        this.connectWaterTiles();
        let waterTiles = this.tiles.filter(t => { return t instanceof WaterTile; });
        for (let i = 0; i < waterTiles.length; i++) {
            await waterTiles[i].instantiate();
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
        let bordersVertexDatas = [];
        for (let i = 0; i < this.buildings.length; i++) {
            let building = this.buildings[i];
            for (let j = 0; j < building.borders.length; j++) {
                let border = building.borders[j];
                let data = await border.getVertexData();
                if (data) {
                    Mummu.RotateAngleAxisVertexDataInPlace(data, border.rotationY, BABYLON.Axis.Y);
                    Mummu.TranslateVertexDataInPlace(data, border.position);
                    bordersVertexDatas.push(data);
                }
            }
        }
        for (let i = 0; i < this.buildingBlocksBorders.length; i++) {
            let data = await this.buildingBlocksBorders[i].getVertexData();
            if (data) {
                Mummu.RotateAngleAxisVertexDataInPlace(data, this.buildingBlocksBorders[i].rotationY, BABYLON.Axis.Y);
                Mummu.TranslateVertexDataInPlace(data, this.buildingBlocksBorders[i].position);
                bordersVertexDatas.push(data);
            }
        }
        if (bordersVertexDatas.length > 0) {
            this.bordersMesh.isVisible = true;
            Mummu.MergeVertexDatas(...bordersVertexDatas).applyToMesh(this.bordersMesh);
        }
        else {
            this.bordersMesh.isVisible = false;
        }
        let datas = await BuildingBlock.GenerateVertexDatas(this);
        datas[0].applyToMesh(this.boxesWall);
        datas[1].applyToMesh(this.boxesWood);
        datas[2].applyToMesh(this.boxesFloor);
    }
    updateInvisifloorTM() {
        let w = this.xMax - this.xMin + 2.2 + 50;
        let h = this.zMax - this.zMin + 2.2 + 50;
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
        let puzzleFrame = CreateBoxFrameVertexData({
            w: width + 2 * this.winSlotRows * bThickness,
            d: depth + 2 * this.winSlotRows * bThickness,
            wTop: width + 2 * this.winSlotRows * bThickness - 0.1,
            dTop: depth + 2 * this.winSlotRows * bThickness - 0.1,
            h: 5.5 + bHeight,
            thickness: this.winSlotRows * bThickness,
            innerHeight: bHeight,
            flatShading: true
        });
        Mummu.TranslateVertexDataInPlace(puzzleFrame, new BABYLON.Vector3(0, -5.5, 0));
        this.border.position.copyFromFloats((this.xMax + this.xMin) * 0.5, 0, (this.zMax + this.zMin) * 0.5);
        this.border.material = this.game.materials.blackMaterial;
        Mummu.MergeVertexDatas(puzzleFrame).applyToMesh(this.border);
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
        if (this.showFPS) {
            let fpsPlaqueData = CreatePlaqueVertexData(1.8, 0.64, 0.03);
            Mummu.TranslateVertexDataInPlace(fpsPlaqueData, new BABYLON.Vector3(0.9, 0, 0.32));
            let fpsPlaque = new BABYLON.Mesh("tiaratum-fps");
            fpsPlaqueData.applyToMesh(fpsPlaque);
            fpsPlaque.parent = this.border;
            fpsPlaque.position.copyFromFloats(-width * 0.5 - bThickness + 0.1, bHeight, -depth * 0.5 - bThickness + 0.1);
            fpsPlaque.material = this.fpsMaterial;
            Mummu.TranslateVertexDataInPlace(fpsPlaqueData, new BABYLON.Vector3(0.9, 0, 0.32).scale(-2));
            let fpsPlaque2 = new BABYLON.Mesh("tiaratum-fps-2");
            fpsPlaqueData.applyToMesh(fpsPlaque2);
            fpsPlaque2.parent = this.border;
            fpsPlaque2.position.copyFromFloats(width * 0.5 + bThickness - 0.1, bHeight, depth * 0.5 + bThickness - 0.1);
            fpsPlaque2.material = this.fpsMaterial;
        }
        this.winSlotsIndexes = [0, 0, 0, 0];
        for (let color = TileColor.North; color <= TileColor.West; color++) {
            this.winSlots[color] = new BABYLON.Mesh("winslots-south");
            this.winSlots[color].material = this.game.materials.blackMaterial;
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
        this.floor.material = this.floorMaterial;
        if (holeOutlinePoints.length > 0) {
            this.holeOutline = BABYLON.MeshBuilder.CreateLineSystem("hole-outline", {
                lines: holeOutlinePoints,
                colors: holeOutlineColors
            }, this.game.scene);
        }
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
            this.balls[i].vZ = 1;
            this.balls[i].animateSpeed(this.balls[i].nominalSpeed, 0.2, Nabu.Easing.easeInCubic);
            if (this.playerHaikus[i]) {
                this.playerHaikus[i].hide();
            }
        }
        for (let i = 0; i < this.tileHaikus.length; i++) {
            this.tileHaikus[i].show();
        }
        this.puzzleState = PuzzleState.Playing;
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
        if (this.puzzleState != PuzzleState.Loading) {
            for (let i = 0; i < this.ballsCount; i++) {
                this.balls[i].update(dt);
            }
            for (let i = 0; i < this.creeps.length; i++) {
                this.creeps[i].update(dt);
            }
            if (this.puzzleState === PuzzleState.Playing) {
                let noBlockTile = true;
                for (let i = 0; i < this.blockTiles.length; i++) {
                    if (this.blockTiles[i].tileState === TileState.Active) {
                        noBlockTile = false;
                        break;
                    }
                }
                if (noBlockTile) {
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
            }
            if (this.balls[0].ballState === BallState.Move || this.balls[0].ballState === BallState.Fall || this.balls[0].ballState === BallState.Flybacking) {
                this.playTimer += dt;
                this.game.setPlayTimer(this.playTimer);
            }
        }
        if (this.haiku) {
            this.haiku.update(dt);
        }
        if (this.titleHaiku) {
            this.titleHaiku.update(dt);
        }
        for (let i = 0; i < this.tileHaikus.length; i++) {
            let tileHaiku = this.tileHaikus[i];
            if (tileHaiku.shown && tileHaiku.tile.isDisposed()) {
                tileHaiku.hide();
            }
        }
        this._globalTime += dt;
        this._timer += dt;
        if (this.showFPS) {
            let refreshRate = 0.1;
            if (this.game.performanceWatcher.worst < 24) {
                refreshRate = 1;
            }
            if (this._timer > refreshRate) {
                this._timer = 0;
                let context = this.fpsTexture.getContext();
                context.fillStyle = "#e0c872ff";
                context.fillRect(0, 0, 600, 200);
                context.fillStyle = "#473a2fFF";
                context.font = "900 90px Julee";
                context.fillText(this.game.performanceWatcher.average.toFixed(0).padStart(3, " "), 60, 77);
                context.fillText("fps (avg)", 200, 77);
                context.fillStyle = "#473a2fFF";
                context.font = "900 90px Julee";
                context.fillText(this.game.performanceWatcher.worst.toFixed(0).padStart(3, " "), 60, 177);
                context.fillText("fps (min)", 200, 177);
                this.fpsTexture.update();
            }
        }
    }
}
var PuzzleDataState;
(function (PuzzleDataState) {
    PuzzleDataState[PuzzleDataState["TBD"] = 0] = "TBD";
    PuzzleDataState[PuzzleDataState["OKAY"] = 1] = "OKAY";
    PuzzleDataState[PuzzleDataState["STORY"] = 2] = "STORY";
    PuzzleDataState[PuzzleDataState["XPERT"] = 3] = "XPERT";
    PuzzleDataState[PuzzleDataState["MULTI"] = 4] = "MULTI";
    PuzzleDataState[PuzzleDataState["TRASH"] = 5] = "TRASH";
    PuzzleDataState[PuzzleDataState["PRBLM"] = 6] = "PRBLM";
    PuzzleDataState[PuzzleDataState["INFO"] = 7] = "INFO";
    PuzzleDataState[PuzzleDataState["XMAS"] = 8] = "XMAS";
})(PuzzleDataState || (PuzzleDataState = {}));
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
    if (data.difficulty != null && typeof (data.difficulty) === "string") {
        data.difficulty = parseInt(data.difficulty);
    }
    if (data.expert_puzzle_id != null && typeof (data.expert_puzzle_id) === "string") {
        data.expert_puzzle_id = parseInt(data.expert_puzzle_id);
    }
    if (data.content && typeof (data.content) === "string") {
        if (data.content.indexOf("[HAIKU]") != -1) {
            let pslit = data.content.split("[HAIKU]");
            data.content = pslit[0];
            data.haiku = pslit[1].replaceAll("\\n", "\n");
        }
    }
}
function CLEAN_IPuzzlesData(data) {
    for (let i = 0; i < data.puzzles.length; i++) {
        CLEAN_IPuzzleData(data.puzzles[i]);
    }
}
function GetTranslatedTitle(data, locale) {
    if (!locale) {
        locale = LOCALE;
    }
    if (data.title.startsWith("lesson-") || data.title.startsWith("challenge-")) {
        let translatedTitle = I18Nizer.GetText(data.title, locale);
        if (translatedTitle) {
            if (isFinite(data.lessonIndex)) {
                return translatedTitle.replace(" - ", " " + data.lessonIndex.toFixed(0) + " - ");
            }
            else {
                return translatedTitle;
            }
        }
    }
    return data.title;
}
class PuzzleMiniatureMaker {
    static Generate(content) {
        content = content.replaceAll("\r\n", "");
        content = content.replaceAll("\n", "");
        let lines = content.split("x");
        let buildingBlocksLine = "";
        if (lines[lines.length - 1].startsWith("BB")) {
            buildingBlocksLine = lines.pop();
        }
        let h = 4;
        let w = 4;
        if (lines.length > 3) {
            let ballLine = lines.splice(0, 1)[0].split("u");
            if (ballLine.length === 5 || ballLine.length === 8) {
                w = parseInt(ballLine[0]);
                h = parseInt(ballLine[1]);
            }
            else {
                h = lines.length;
                w = lines[0].length;
            }
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
        if (buildingBlocksLine != "") {
            buildingBlocksLine = buildingBlocksLine.replace("BB", "");
            for (let j = 0; j < h; j++) {
                for (let i = 0; i < w; i++) {
                    let n = i + j * w;
                    if (n < buildingBlocksLine.length) {
                        let blockHeight = parseInt(buildingBlocksLine[n]);
                        if (blockHeight === 1) {
                            let x = (i) * b;
                            let y = (h - j - 1) * b;
                            let s = b;
                            context.fillStyle = buildColor;
                            context.fillRect(x, y, s, s);
                        }
                    }
                }
            }
        }
        if (lines.length > 3) {
            for (let j = 0; j < lines.length; j++) {
                let line = lines[lines.length - 1 - j];
                let i = 0;
                for (let ii = 0; ii < line.length; ii++) {
                    let c = line[ii];
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
                        let rampW = parseInt(line[ii + 1]);
                        if (isNaN(rampW)) {
                            rampW = 2;
                        }
                        else {
                            ii++;
                        }
                        let x = (i) * b;
                        let y = (h - 1 - j - 2) * b;
                        let s = b;
                        context.fillStyle = buildColor;
                        context.fillRect(x, y, rampW * s, 3 * s);
                    }
                    i++;
                }
            }
        }
        if (lines.length > 3) {
            for (let j = 0; j < lines.length; j++) {
                let line = lines[lines.length - 1 - j];
                let i = 0;
                for (let ii = 0; ii < line.length; ii++) {
                    let c = line[ii];
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
                    if (c === "R") {
                        let rampW = parseInt(line[ii + 1]);
                        if (isNaN(rampW)) {
                            rampW = 2;
                        }
                        else {
                            ii++;
                        }
                    }
                    i++;
                }
            }
        }
        return canvas;
    }
}
function SaveAsText(puzzle, withHaiku) {
    let lines = [];
    for (let j = 0; j < puzzle.h; j++) {
        lines[j] = [];
        for (let i = 0; i < puzzle.w; i++) {
            lines[j][i] = ["o"];
        }
    }
    puzzle.tiles.forEach(tile => {
        let i = tile.i;
        let j = tile.j;
        if (j >= 0 && j < lines.length) {
            if (i >= 0 && i < lines[j].length) {
                if (tile instanceof BlockTile) {
                    if (tile.color === TileColor.North) {
                        lines[j][i] = ["n"];
                    }
                    else if (tile.color === TileColor.East) {
                        lines[j][i] = ["e"];
                    }
                    else if (tile.color === TileColor.South) {
                        lines[j][i] = ["s"];
                    }
                    else if (tile.color === TileColor.West) {
                        lines[j][i] = ["w"];
                    }
                }
                else if (tile instanceof SwitchTile) {
                    if (tile.color === TileColor.North) {
                        lines[j][i] = ["N"];
                    }
                    else if (tile.color === TileColor.East) {
                        lines[j][i] = ["E"];
                    }
                    else if (tile.color === TileColor.South) {
                        lines[j][i] = ["S"];
                    }
                    else if (tile.color === TileColor.West) {
                        lines[j][i] = ["W"];
                    }
                }
                else if (tile instanceof ButtonTile) {
                    if (tile.props.value === 1) {
                        lines[j][i] = ["I"];
                    }
                    else if (tile.props.value === 2) {
                        lines[j][i] = ["D"];
                    }
                    else if (tile.props.value === 3) {
                        lines[j][i] = ["T"];
                    }
                }
                else if (tile instanceof DoorTile) {
                    if (tile.props.value === 1) {
                        lines[j][i] = tile.closed ? ["j"] : ["i"];
                    }
                    else if (tile.props.value === 2) {
                        lines[j][i] = tile.closed ? ["f"] : ["d"];
                    }
                    else if (tile.props.value === 3) {
                        lines[j][i] = tile.closed ? ["u"] : ["t"];
                    }
                }
                else if (tile instanceof PushTile) {
                    lines[j][i] = ["p"];
                }
                else if (tile instanceof HoleTile) {
                    if (tile.covered) {
                        lines[j][i] = ["Q"];
                    }
                    else {
                        lines[j][i] = ["O"];
                    }
                }
                else if (tile instanceof WallTile) {
                    lines[j][i] = ["a"];
                }
                else if (tile instanceof Nobori) {
                    lines[j][i] = ["b"];
                }
                else if (tile instanceof WaterTile) {
                    lines[j][i] = ["q"];
                }
            }
        }
    });
    puzzle.buildings.forEach(building => {
        let i = building.i;
        let j = building.j;
        if (building instanceof Ramp) {
            lines[j][i] = ["R" + building.w.toFixed(0)];
        }
        if (building instanceof Bridge) {
            lines[j][i] = ["U"];
        }
    });
    puzzle.creeps.forEach(creep => {
        let i = creep.i;
        let j = creep.j;
        lines[j][i] = ["c"];
    });
    lines.reverse();
    let lines3 = lines.map((l1) => {
        return l1.map(l2 => {
            return l2.reduce((c1, c2) => { return c1 + c2; });
        });
    });
    let lines2 = lines3.map((l1) => { return l1.reduce((c1, c2) => { return c1 + c2; }); });
    let ballLine = puzzle.w.toFixed(0) + "u" + puzzle.h.toFixed(0) + "u" + puzzle.floorMaterialIndex.toFixed(0) + "u";
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
    let content = lines2.reduce((l1, l2) => { return l1 + "x" + l2; });
    if (withHaiku && puzzle.haiku) {
        let haikuLine = "[HAIKU]";
        haikuLine += (puzzle.haiku.position.x / 0.55).toFixed(0) + "x";
        haikuLine += (puzzle.haiku.position.z / 0.55).toFixed(0) + "x";
        haikuLine += (puzzle.haiku.text.replaceAll("\n", "\\n"));
        content += haikuLine;
    }
    return content;
}
function SerializeBuildingBlocks(buildingBlocks) {
    let buildingBlocksLine = "BB";
    let w = buildingBlocks.length;
    let h = buildingBlocks[0].length;
    for (let j = 0; j < h; j++) {
        for (let i = 0; i < w; i++) {
            buildingBlocksLine = buildingBlocksLine + buildingBlocks[i][j].toFixed(0);
        }
    }
    return buildingBlocksLine;
}
class PuzzleUI {
    constructor(puzzle) {
        this.puzzle = puzzle;
        this.autoNext = true;
        this._inputUp = () => {
            if (this.successPanel.style.display === "") {
                if (this.hoveredElement === undefined) {
                    this.setHoveredElement(this.successNextButton);
                }
                else if (this.hoveredElement === this.successNextButton) {
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
                this.disableAutoNext();
            }
            else if (this.gameoverPanel.style.display === "") {
                if (this.hoveredElement === this.gameoverBackButton) {
                    this.setHoveredElement(this.gameoverReplayButton);
                }
                else if (this.hoveredElement === this.gameoverReplayButton) {
                    this.setHoveredElement(this.gameoverBackButton);
                }
                this.disableAutoNext();
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
                        this.setHoveredElement(this.successNextButton);
                    }
                }
                else if (this.hoveredElement === this.scoreSubmitBtn) {
                    this.setHoveredElement(this.successNextButton);
                }
                else if (this.hoveredElement === this.successNextButton) {
                    if (this.highscoreContainer.style.display === "block") {
                        this.setHoveredElement(this.highscorePlayerLine);
                    }
                }
                this.disableAutoNext();
            }
            else if (this.gameoverPanel.style.display === "") {
                if (this.hoveredElement === this.gameoverBackButton) {
                    this.setHoveredElement(this.gameoverReplayButton);
                }
                else if (this.hoveredElement === this.gameoverReplayButton) {
                    this.setHoveredElement(this.gameoverBackButton);
                }
                this.disableAutoNext();
            }
        };
        this._inputLeft = () => {
            if (this.gameoverPanel.style.display === "") {
                if (this.hoveredElement === this.gameoverBackButton) {
                    this.setHoveredElement(this.gameoverReplayButton);
                }
                else if (this.hoveredElement === this.gameoverReplayButton) {
                    this.setHoveredElement(this.gameoverBackButton);
                }
                this.disableAutoNext();
            }
        };
        this._inputRight = () => {
            if (this.gameoverPanel.style.display === "") {
                if (this.hoveredElement === this.gameoverBackButton) {
                    this.setHoveredElement(this.gameoverReplayButton);
                }
                else if (this.hoveredElement === this.gameoverReplayButton) {
                    this.setHoveredElement(this.gameoverBackButton);
                }
                this.disableAutoNext();
            }
        };
        this._inputEnter = () => {
            if (this.successPanel.style.display === "" || this.gameoverPanel.style.display === "") {
                if (this.hoveredElement instanceof HTMLButtonElement) {
                    if (this.hoveredElement.parentElement instanceof HTMLAnchorElement) {
                        location.hash = this.hoveredElement.parentElement.href.split("/").pop();
                    }
                    else if (this.hoveredElement.onpointerup) {
                        this.hoveredElement.onpointerup(undefined);
                    }
                }
                else if (this.hoveredElement === this.highscorePlayerLine) {
                    document.querySelector("#score-player-input").focus();
                }
                this.disableAutoNext();
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
        this.successNextLabel = document.querySelector("#success-next-label");
        this.completionBarLabel = document.querySelector("#play-success-completion-label");
        this.completionBar = document.querySelector("#play-success-panel-completion-container completion-bar");
        this.highscoreContainer = document.querySelector("#success-highscore-container");
        this.highscorePlayerLine = document.querySelector("#score-player-input").parentElement;
        document.querySelector("#score-player-input").addEventListener("pointerup", () => {
            this.disableAutoNext();
        });
        this.highscoreTwoPlayersLine = document.querySelector("#score-2-players-input").parentElement;
        this.scoreSubmitBtn = document.querySelector("#success-score-submit-btn");
        this.scorePendingBtn = document.querySelector("#success-score-pending-btn");
        this.scoreDoneBtn = document.querySelector("#success-score-done-btn");
        this.successNextButton = document.querySelector("#success-next-btn");
        //this.unlockTryButton = document.querySelector("#play-unlock-try-btn") as HTMLButtonElement;
        this.gameoverBackButton = document.querySelector("#gameover-back-btn");
        this.gameoverReplayButton = document.querySelector("#gameover-replay-btn");
        this.gameoverReplayButton.onpointerup = async () => {
            //await RandomWait();
            await this.puzzle.reset(true);
            this.puzzle.skipIntro();
        };
        this.successPanel = document.querySelector("#play-success-panel");
        this.gameoverPanel = document.querySelector("#play-gameover-panel");
        this.unlockContainer = document.querySelector("#play-unlock-container");
        this.touchInput = document.querySelector("#touch-input");
        this.boostLabel = document.querySelector("#input-boost-label");
        this.winSound = this.game.soundManager.createSound("ambient", "./datas/sounds/marimba-win-e-2-209686.mp3", this.game.scene, undefined, {
            autoplay: false,
            volume: 0.3
        });
        this.loseSound = this.game.soundManager.createSound("ambient", "./datas/sounds/violin-lose-1-175615.mp3", this.game.scene, undefined, {
            autoplay: false,
            volume: 0.2
        });
        this.game.router.playUI.onshow = () => { this._registerToInputManager(); };
        this.game.router.playUI.onhide = () => { this._unregisterFromInputManager(); };
    }
    disableAutoNext() {
        this.autoNext = false;
        let autoNextBar = document.querySelector("#success-next-auto-bar");
        autoNextBar.style.display = "none";
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
    win(firstTimeCompleted, previousCompletion) {
        let stamp = this.successPanel.querySelector(".stamp");
        stamp.style.visibility = "hidden";
        this.successPanel.style.display = "";
        let panelDX = document.body.classList.contains("vertical") ? 0 : -50;
        let panelDY = document.body.classList.contains("vertical") ? 70 : 10;
        if (firstTimeCompleted) {
            this.tryShowUnlockPanel().then(() => {
                CenterPanel(this.successPanel, panelDX, panelDY);
                requestAnimationFrame(() => {
                    CenterPanel(this.successPanel, panelDX, panelDY);
                });
            });
        }
        else {
            this.unlockContainer.style.display = "none";
        }
        this.gameoverPanel.style.display = "none";
        this.ingameTimer.style.display = "none";
        this.successNextLabel.style.display = "none";
        this.successNextButton.innerText = I18Nizer.GetText("success-continue", LOCALE);
        ;
        let completion = 1;
        if (this.puzzle.data.state === PuzzleDataState.OKAY) {
            completion = this.game.puzzleCompletion.communityPuzzleCompletion;
            this.completionBarLabel.innerHTML = "Community";
        }
        else if (this.puzzle.data.state === PuzzleDataState.STORY) {
            completion = this.game.puzzleCompletion.storyPuzzleCompletion;
            this.completionBarLabel.innerHTML = "Story";
        }
        else if (this.puzzle.data.state === PuzzleDataState.XPERT) {
            completion = this.game.puzzleCompletion.expertPuzzleCompletion;
            this.completionBarLabel.innerHTML = "Expert";
        }
        else if (this.puzzle.data.state === PuzzleDataState.XMAS) {
            completion = this.game.puzzleCompletion.xmasPuzzleCompletion;
            this.completionBarLabel.innerHTML = "Christmas";
        }
        if (previousCompletion != completion) {
            this.completionBar.setValue(previousCompletion);
            this.completionBar.animateValueTo(completion, 3);
        }
        else {
            this.completionBar.setValue(completion);
        }
        if (this.puzzle.data.state === 2) {
            let nextPuzzle = this.game.loadedStoryPuzzles.puzzles[this.puzzle.data.numLevel];
            if (nextPuzzle) {
                this.successNextLabel.innerHTML = "Next - " + GetTranslatedTitle(nextPuzzle);
                this.successNextLabel.style.display = "";
                this.successNextButton.innerText = I18Nizer.GetText("success-next-level", LOCALE);
            }
        }
        if (this.game.uiInputManager.inControl) {
            this.setHoveredElement(this.successNextButton);
        }
        let starCount = this.game.puzzleCompletion.getStarCount(this.puzzle.data.id);
        stamp.classList.remove("stamp-0", "stamp-1", "stamp-2", "stamp-3");
        stamp.classList.add("stamp-" + starCount);
        setTimeout(() => {
            this.game.stamp.play(this.successPanel.querySelector(".stamp"));
        }, 500);
        CenterPanel(this.successPanel, panelDX, panelDY);
        requestAnimationFrame(() => {
            CenterPanel(this.successPanel, panelDX, panelDY);
        });
        let autoNextBar = document.querySelector("#success-next-auto-bar");
        if (this.puzzle.data.state === PuzzleDataState.STORY && this.autoNext) {
            let currentHash = location.hash;
            autoNextBar.showText = false;
            autoNextBar.setValue(0);
            autoNextBar.animateValueTo(1, 5);
            setTimeout(() => {
                if (this.autoNext) {
                    if (location.hash === currentHash) {
                        this.successNextButton.onpointerup(undefined);
                    }
                }
            }, 5000);
        }
        else {
            autoNextBar.style.display = "none";
        }
        console.log("PuzzleUI win");
    }
    lose() {
        let panelDX = document.body.classList.contains("vertical") ? 0 : -50;
        this.successPanel.style.display = "none";
        this.unlockContainer.style.display = "none";
        this.gameoverPanel.style.display = "";
        this.ingameTimer.style.display = "none";
        if (this.game.uiInputManager.inControl) {
            this.setHoveredElement(this.gameoverReplayButton);
        }
        this.loseSound.play();
        CenterPanel(this.gameoverPanel, panelDX, 0);
        requestAnimationFrame(() => {
            CenterPanel(this.gameoverPanel, panelDX, 0);
        });
        console.log("PuzzleUI lose");
    }
    reset() {
        if (this.successPanel) {
            this.successPanel.style.display = "none";
        }
        if (this.unlockContainer) {
            this.unlockContainer.style.display = "none";
        }
        if (this.gameoverPanel) {
            this.gameoverPanel.style.display = "none";
        }
        if (this.ingameTimer) {
            this.ingameTimer.style.display = "";
        }
        this.hideTouchInput();
        this.boostLabel.style.opacity = "inherit";
    }
    async tryShowUnlockPanel() {
        //await RandomWait();
        let expertId = this.game.storyIdToExpertId(this.puzzle.data.id);
        if (isFinite(expertId)) {
            let data = await this.game.getPuzzleDataById(expertId);
            if (data) {
                let squareBtn = this.unlockContainer.querySelector(".square-btn-panel");
                squareBtn.querySelector(".square-btn-title stroke-text").innerHTML = GetTranslatedTitle(data);
                squareBtn.querySelector(".square-btn-author stroke-text").innerHTML = "Expert Mode";
                let existingImg = squareBtn.querySelector(".square-btn-miniature");
                if (existingImg) {
                    squareBtn.removeChild(existingImg);
                }
                let newIcon = PuzzleMiniatureMaker.Generate(data.content);
                newIcon.classList.add("square-btn-miniature");
                squareBtn.appendChild(newIcon);
                this.unlockContainer.style.display = "";
            }
            else {
                console.error("Puzzle Expert #" + expertId + " not found.");
                this.unlockContainer.style.display = "none";
            }
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
    showTouchInput() {
        this.touchInput.style.opacity = "1";
    }
    hideTouchInput() {
        this.touchInput.style.opacity = "0";
    }
    _registerToInputManager() {
        this.game.uiInputManager.onUpCallbacks.push(this._inputUp);
        this.game.uiInputManager.onDownCallbacks.push(this._inputDown);
        this.game.uiInputManager.onLeftCallbacks.push(this._inputLeft);
        this.game.uiInputManager.onRightCallbacks.push(this._inputRight);
        this.game.uiInputManager.onEnterCallbacks.push(this._inputEnter);
        this.game.uiInputManager.onBackCallbacks.push(this._inputBack);
        this.game.uiInputManager.onDropControlCallbacks.push(this._inputDropControl);
    }
    _unregisterFromInputManager() {
        this.game.uiInputManager.onUpCallbacks.remove(this._inputUp);
        this.game.uiInputManager.onDownCallbacks.remove(this._inputDown);
        this.game.uiInputManager.onLeftCallbacks.remove(this._inputLeft);
        this.game.uiInputManager.onRightCallbacks.remove(this._inputRight);
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
    let colors = [];
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
        if (props.colors) {
            let col = props.colors[i];
            colors.push(col.r, col.g, col.b, col.a);
            colors.push(col.r, col.g, col.b, col.a);
        }
        else if (props.color) {
            let col = props.color;
            colors.push(col.r, col.g, col.b, col.a);
            colors.push(col.r, col.g, col.b, col.a);
        }
        else {
            colors.push(1, 1, 1, 1);
        }
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
    data.colors = colors;
    data.indices = indices;
    data.normals = normals;
    data.uvs = uvs;
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
var supportedLocales = [
    "en",
    "fr",
    "pl",
    "de",
    "nl",
    "pt",
    "it",
    "es"
];
let languages = navigator.languages;
for (let i = 0; i < languages.length; i++) {
    let language = languages[i];
    let languageRoot = language.split("-")[0];
    if (supportedLocales.indexOf(languageRoot) != -1) {
        LOCALE = languageRoot;
        break;
    }
}
class I18Nizer {
    static GetText(key, lang) {
        if (i18nData[key]) {
            if (i18nData[key][lang]) {
                return i18nData[key][lang];
            }
            return i18nData[key]["en"];
        }
        return "uknwn";
    }
    static Translate(lang) {
        let elements = document.querySelectorAll("[i18n-key]");
        elements.forEach(element => {
            if (element instanceof HTMLElement) {
                let key = element.getAttribute("i18n-key");
                if (key) {
                    element.innerText = I18Nizer.GetText(key, lang);
                }
            }
        });
    }
}
var i18nData = {};
// Homepage
i18nData["play"] = {
    "en": "PLAY",
    "fr": "JOUER"
};
i18nData["completed"] = {
    "en": "completed",
    "fr": "completé"
};
i18nData["home-story-mode"] = {
    "en": "story mode",
    "fr": "mode histoire"
};
i18nData["home-expert-mode"] = {
    "en": "expert mode",
    "fr": "mode expert"
};
i18nData["home-community-mode"] = {
    "en": "community puzzles",
    "fr": "puzzles maison"
};
// Intro Screen
i18nData["intro-to-play-keyboard"] = {
    "en": "Click to play",
    "fr": "Cliquez pour démarrer",
};
i18nData["intro-to-play-touch"] = {
    "en": "Touch to play",
    "fr": "Pressez pour démarrer",
};
i18nData["intro-tip-keyboard"] = {
    "en": "Hold [A] and [D] or [<] and [>] to move the ball",
    "fr": "Pressez [A] et [D] ou [<] et [>] pour diriger la balle",
};
i18nData["intro-tip-touch"] = {
    "en": "Hold [<] and [>] to move the ball",
    "fr": "Pressez [<] et [>] pour diriger la balle",
};
// Success Panel
i18nData["success-title"] = {
    "en": "SUCCESS !",
    "fr": "VICTOIRE !"
};
i18nData["success-submit-score"] = {
    "en": "Submit Score",
    "fr": "Publier Score"
};
i18nData["success-sending-score"] = {
    "en": "Sending...",
    "fr": "Envoi..."
};
i18nData["success-well-played"] = {
    "en": "Well Played !",
    "fr": "Bien Joué !"
};
i18nData["success-continue"] = {
    "en": "Continue",
    "fr": "Continuer"
};
i18nData["success-next-level"] = {
    "en": "Next Level",
    "fr": "Niveau Suivant"
};
i18nData["success-expert-unlocked"] = {
    "en": "puzzle unlocked",
    "fr": "puzzle déverrouillé"
};
// Tutorial
i18nData["tuto-title"] = {
    "en": "Tutorial",
    "fr": "Instructions"
};
i18nData["tuto-0-label"] = {
    "en": "Context",
    "fr": "Contexte"
};
i18nData["tuto-0-text"] = {
    "en": "This is the Ball.",
    "fr": "Ceci est la Balle."
};
i18nData["tuto-1-label"] = {
    "en": "Rule",
    "fr": "Règle"
};
i18nData["tuto-1-text"] = {
    "en": "The Ball always moves up and down.",
    "fr": "La balle se déplace toujours verticalement."
};
i18nData["tuto-2-label"] = {
    "en": "Control",
    "fr": "Contrôle"
};
i18nData["tuto-2-text"] = {
    "en": "You can only steer the Ball Left or Right.",
    "fr": "Vous pouvez contrôler la balle horizontalement."
};
i18nData["tuto-3-label"] = {
    "en": "Objective",
    "fr": "Objectif"
};
i18nData["tuto-3-text"] = {
    "en": "Collect all the Tiles to complete the Puzzle !",
    "fr": "Collectez tous les Blocs pour terminer le Puzzle !"
};
// Puzzle Titles
i18nData["lesson-control"] = {
    "en": "Lesson - Control",
    "fr": "Leçon - Contrôle",
};
i18nData["lesson-color"] = {
    "en": "Lesson - Color",
    "fr": "Leçon - Couleur ",
};
i18nData["lesson-hole"] = {
    "en": "Lesson - Hole",
    "fr": "Leçon - Trou",
};
i18nData["lesson-push"] = {
    "en": "Lesson - Push",
    "fr": "Leçon - Pousser",
};
i18nData["lesson-door"] = {
    "en": "Lesson - The Doors",
    "fr": "Leçon - Les Portes",
};
i18nData["lesson-crack"] = {
    "en": "Lesson - Crack",
    "fr": "Leçon - Fissure",
};
i18nData["lesson-water"] = {
    "en": "Lesson - Water",
    "fr": "Leçon - Eau",
};
i18nData["lesson-spikes"] = {
    "en": "Lesson - Spikes",
    "fr": "Leçon - Piquants",
};
i18nData["lesson-gap"] = {
    "en": "Lesson - Gap",
    "fr": "Leçon - Passage",
};
i18nData["challenge-bridge"] = {
    "en": "Challenge 1 - Bridge",
    "fr": "Challenge 1 - Pont",
};
i18nData["challenge-gates"] = {
    "en": "Challenge 2 - Gates",
    "fr": "Challenge 2 - Portes",
};
// Translated Haikus
i18nData["lesson-1-haiku"] = {
    "en": "Use [A] and [D] to\nmove Left and Right.",
    "fr": "Pressez [A] et [D] pour\naller à Gauche ou à Droite.",
};
i18nData["lesson-2-haiku"] = {
    "en": "Hit a Drum to\nchange Color.",
    "fr": "Touchez un disque\npour changer de Couleur.",
};
i18nData["lesson-3-haiku"] = {
    "en": "Do not fall in a hole.",
    "fr": "Ne tombez pas dans un trou.",
};
i18nData["lesson-4-haiku"] = {
    "en": "Wooden Boxes\ncan be Pushed.",
    "fr": "Les Blocs en bois\npeuvent être Poussés.",
};
i18nData["lesson-5-haiku"] = {
    "en": "Hit a Key Tile\nto open Door Tiles.",
    "fr": "Touchez une Clef\npour ouvrir les Portes.",
};
i18nData["lesson-6-haiku"] = {
    "en": "Cracked Tiles can\nonly be crossed once.",
    "fr": "Une Dalle fendue\ncède après un passage.",
};
i18nData["lesson-7-haiku"] = {
    "en": "Water flows\nto the bottom.",
    "fr": "L'eau s'écoule\nvers le bas.",
};
i18nData["lesson-8-haiku"] = {
    "en": "Spikes are dangerous\navoid the Spikes.",
    "fr": "Attention ! Piquants !\nEvitez les Piquants.",
};
i18nData["lesson-9-haiku"] = {
    "en": "Use the Tiles to\navoid the crevass.",
    "fr": "Utilisez les blocs\npour éviter le gouffre.",
};
i18nData["challenge-bridge-haiku"] = {
    "en": "Challenge - 1\nOver the Bridge",
    "fr": "Challenge - 1\nPar le Pont",
};
i18nData["challenge-gates-haiku"] = {
    "en": "Challenge - 2\nWater & Gates",
    "fr": "Challenge - 2\nEau & Portes",
};
i18nData["play"]["pl"] = "GRAJ";
i18nData["completed"]["pl"] = "ukończone";
i18nData["home-story-mode"]["pl"] = "tryb opowieści";
i18nData["home-expert-mode"]["pl"] = "tryb eksperta";
i18nData["home-community-mode"]["pl"] = "zagadki społeczności";
i18nData["intro-to-play-keyboard"]["pl"] = "Kliknij, aby zagrać";
i18nData["intro-to-play-touch"]["pl"] = "Dotknij, aby zagrać";
i18nData["intro-tip-keyboard"]["pl"] = "Przytrzymaj [A] i [D] lub [<] i [>], aby przesunąć piłkę";
i18nData["intro-tip-touch"]["pl"] = "Przytrzymaj [<] i [>], aby przesunąć piłkę";
i18nData["success-title"]["pl"] = "SUKCES!";
i18nData["success-submit-score"]["pl"] = "Prześlij wynik";
i18nData["success-sending-score"]["pl"] = "Wysyłanie...";
i18nData["success-well-played"]["pl"] = "Dobrze zagrane!";
i18nData["success-continue"]["pl"] = "Kontynuuj";
i18nData["success-next-level"]["pl"] = "Następny poziom";
i18nData["success-expert-unlocked"]["pl"] = "zagadka odblokowana";
i18nData["tuto-title"]["pl"] = "Samouczek";
i18nData["tuto-0-label"]["pl"] = "Kontekst";
i18nData["tuto-0-text"]["pl"] = "To jest piłka.";
i18nData["tuto-1-label"]["pl"] = "Zasada";
i18nData["tuto-1-text"]["pl"] = "Piłka zawsze porusza się w górę i w dół.";
i18nData["tuto-2-label"]["pl"] = "Kontrola";
i18nData["tuto-2-text"]["pl"] = "Możesz sterować piłką tylko w lewo lub w prawo.";
i18nData["tuto-3-label"]["pl"] = "Cel";
i18nData["tuto-3-text"]["pl"] = "Zbierz wszystkie kafelki, aby ukończyć zagadkę!";
i18nData["lesson-control"]["pl"] = "Lekcja - Kontrola";
i18nData["lesson-color"]["pl"] = "Lekcja - Kolor";
i18nData["lesson-hole"]["pl"] = "Lekcja - Otwór";
i18nData["lesson-push"]["pl"] = "Lekcja - Pchnięcie";
i18nData["lesson-door"]["pl"] = "Lekcja - Drzwi";
i18nData["lesson-crack"]["pl"] = "Lekcja - Pęknięcie";
i18nData["lesson-water"]["pl"] = "Lekcja - Woda";
i18nData["lesson-spikes"]["pl"] = "Lekcja - Kolce";
i18nData["lesson-gap"]["pl"] = "Lekcja - Szczelina";
i18nData["lesson-1-haiku"]["pl"] = "Używaj [A] i [D], aby\nporuszać się w lewo i prawo.";
i18nData["lesson-2-haiku"]["pl"] = "Uderz w bęben,\naby zmienić kolor.";
i18nData["lesson-3-haiku"]["pl"] = "Nie wpadnij do dziury.";
i18nData["lesson-4-haiku"]["pl"] = "Drewniane skrzynki\nmożna pchać.";
i18nData["lesson-5-haiku"]["pl"] = "Uderz w kluczowy kafelek,\naby otworzyć kafelki drzwi.";
i18nData["lesson-6-haiku"]["pl"] = "Popękane kafelki można\nprzekroczyć tylko raz.";
i18nData["lesson-7-haiku"]["pl"] = "Woda spływa\nna dół.";
i18nData["lesson-8-haiku"]["pl"] = "Kolce są niebezpieczne,\nunikaj kolców.";
i18nData["lesson-9-haiku"]["pl"] = "Używaj kafelków,\naby uniknąć szczeliny.";
i18nData["play"]["de"] = "SPIELEN";
i18nData["completed"]["de"] = "abgeschlossen";
i18nData["home-story-mode"]["de"] = "Story-Modus";
i18nData["home-expert-mode"]["de"] = "Experten modus";
i18nData["home-community-mode"]["de"] = "Community-Rätsel";
i18nData["intro-to-play-keyboard"]["de"] = "Zum Spielen klicken";
i18nData["intro-to-play-touch"]["de"] = "Zum Spielen berühren";
i18nData["intro-tip-keyboard"]["de"] = "Halten Sie [A] und [D] oder [<] und [>] gedrückt, um den Ball zu bewegen";
i18nData["intro-tip-touch"]["de"] = "Halten Sie [<] und [>] gedrückt, um den Ball zu bewegen";
i18nData["success-title"]["de"] = "ERFOLGREICH!";
i18nData["success-submit-score"]["de"] = "Punktzahl übermitteln";
i18nData["success-sending-score"]["de"] = "Senden...";
i18nData["success-well-played"]["de"] = "Gut gespielt!";
i18nData["success-continue"]["de"] = "Weiter";
i18nData["success-next-level"]["de"] = "Nächstes Level";
i18nData["success-expert-unlocked"]["de"] = "Rätsel freigeschaltet";
i18nData["tuto-title"]["de"] = "Tutorial";
i18nData["tuto-0-label"]["de"] = "Kontext";
i18nData["tuto-0-text"]["de"] = "Das ist der Ball.";
i18nData["tuto-1-label"]["de"] = "Regel";
i18nData["tuto-1-text"]["de"] = "Der Ball bewegt sich immer auf und ab.";
i18nData["tuto-2-label"]["de"] = "Steuerung";
i18nData["tuto-2-text"]["de"] = "Sie können den Ball nur nach links oder rechts lenken.";
i18nData["tuto-3-label"]["de"] = "Ziel";
i18nData["tuto-3-text"]["de"] = "Sammeln Sie alle Kacheln, um das Rätsel zu lösen!";
i18nData["lesson-control"]["de"] = "Lektion - Steuerung";
i18nData["lesson-color"]["de"] = "Lektion - Farbe";
i18nData["lesson-hole"]["de"] = "Lektion - Loch";
i18nData["lesson-push"]["de"] = "Lektion - Stoßen";
i18nData["lesson-door"]["de"] = "Lektion - Die Türen";
i18nData["lesson-crack"]["de"] = "Lektion - Riss";
i18nData["lesson-water"]["de"] = "Lektion - Wasser";
i18nData["lesson-spikes"]["de"] = "Lektion - Stacheln";
i18nData["lesson-gap"]["de"] = "Lektion - Lücke";
i18nData["lesson-1-haiku"]["de"] = "Verwenden Sie [A] und [D],\num sich nach links\nund rechts zu bewegen.";
i18nData["lesson-2-haiku"]["de"] = "Schlagen Sie auf eine Trommel,\num die Farbe zu ändern.";
i18nData["lesson-3-haiku"]["de"] = "Fallen Sie nicht in ein Loch.";
i18nData["lesson-4-haiku"]["de"] = "Holzkisten können geschoben werden.";
i18nData["lesson-5-haiku"]["de"] = "Schlagen Sie auf eine\nSchlüsselkachel, um Türkacheln\nzu öffnen.";
i18nData["lesson-6-haiku"]["de"] = "Gesprungene Kacheln können\nnur einmal überquert werden.";
i18nData["lesson-7-haiku"]["de"] = "Wasser fließt nach unten.";
i18nData["lesson-8-haiku"]["de"] = "Spikes sind gefährlich,\nvermeiden Sie die Spikes.";
i18nData["lesson-9-haiku"]["de"] = "Verwenden Sie die Kacheln,\num der Gletscherspalte auszuweichen.";
i18nData["play"]["pt"] = "JOGAR";
i18nData["completed"]["pt"] = "concluído";
i18nData["home-story-mode"]["pt"] = "modo história";
i18nData["home-expert-mode"]["pt"] = "modo especialista";
i18nData["home-community-mode"]["pt"] = "quebra-cabeças da comunidade";
i18nData["intro-to-play-keyboard"]["pt"] = "Clique para jogar";
i18nData["intro-to-play-touch"]["pt"] = "Toque para jogar";
i18nData["intro-tip-keyboard"]["pt"] = "Segure [A] e [D] ou [<] e [>] para mover a bola";
i18nData["intro-tip-touch"]["pt"] = "Segure [<] e [>] para mover a bola";
i18nData["success-title"]["pt"] = "SUCESSO!";
i18nData["success-submit-score"]["pt"] = "Enviar pontuação";
i18nData["success-sending-score"]["pt"] = "Enviando...";
i18nData["success-well-played"]["pt"] = "Bem jogado!";
i18nData["success-continue"]["pt"] = "Continuar";
i18nData["success-next-level"]["pt"] = "Próximo nível";
i18nData["success-expert-unlocked"]["pt"] = "quebra-cabeça desbloqueado";
i18nData["tuto-title"]["pt"] = "Tutorial";
i18nData["tuto-0-label"]["pt"] = "Contexto";
i18nData["tuto-0-text"]["pt"] = "Esta é a bola.";
i18nData["tuto-1-label"]["pt"] = "Regra";
i18nData["tuto-1-text"]["pt"] = "A bola sempre se move para cima e para baixo.";
i18nData["tuto-2-label"]["pt"] = "Controle";
i18nData["tuto-2-text"]["pt"] = "Você só pode dirigir a bola para a esquerda ou direita.";
i18nData["tuto-3-label"]["pt"] = "Objetivo";
i18nData["tuto-3-text"]["pt"] = "Colete todas as peças para completar o quebra-cabeça!";
i18nData["lesson-control"]["pt"] = "Lição - Controle";
i18nData["lesson-color"]["pt"] = "Lição - Cor";
i18nData["lesson-hole"]["pt"] = "Lição - Buraco";
i18nData["lesson-push"]["pt"] = "Lição - Empurrar";
i18nData["lesson-door"]["pt"] = "Lição - As portas";
i18nData["lesson-crack"]["pt"] = "Lição - Rachadura";
i18nData["lesson-water"]["pt"] = "Lição - Água";
i18nData["lesson-spikes"]["pt"] = "Lição - Picos";
i18nData["lesson-gap"]["pt"] = "Lição - Lacuna";
i18nData["lesson-1-haiku"]["pt"] = "Use [A] e [D] para mover\npara a esquerda e direita.";
i18nData["lesson-2-haiku"]["pt"] = "Bata em um tambor\npara mudar de cor.";
i18nData["lesson-3-haiku"]["pt"] = "Não caia em um buraco.";
i18nData["lesson-4-haiku"]["pt"] = "Caixas de madeira\npodem ser empurradas.";
i18nData["lesson-5-haiku"]["pt"] = "Bata em uma Key Tile\npara abrir Door Tiles.";
i18nData["lesson-6-haiku"]["pt"] = "Tiles rachadas só podem\nser cruzadas uma vez.";
i18nData["lesson-7-haiku"]["pt"] = "A água flui\npara o fundo.";
i18nData["lesson-8-haiku"]["pt"] = "Spikes são perigosos,\nevite os Spikes.";
i18nData["lesson-9-haiku"]["pt"] = "Use os Tiles\npara evitar a fenda.";
i18nData["play"]["it"] = "GIOCA";
i18nData["completed"]["it"] = "completato";
i18nData["home-story-mode"]["it"] = "modalità storia";
i18nData["home-expert-mode"]["it"] = "modalità esperto";
i18nData["home-community-mode"]["it"] = "puzzle della comunità";
i18nData["intro-to-play-keyboard"]["it"] = "Clicca per giocare";
i18nData["intro-to-play-touch"]["it"] = "Tocca per giocare";
i18nData["intro-tip-keyboard"]["it"] = "Tieni premuti [A] e [D] o [<] e [>] per muovere la palla";
i18nData["intro-tip-touch"]["it"] = "Tieni premuti [<] e [>] per muovere la palla";
i18nData["success-title"]["it"] = "SUCCESSO !";
i18nData["success-submit-score"]["it"] = "Invia punteggio";
i18nData["success-sending-score"]["it"] = "Invio in corso...";
i18nData["success-well-played"]["it"] = "Ben giocato !";
i18nData["success-continue"]["it"] = "Continua";
i18nData["success-next-level"]["it"] = "Livello successivo";
i18nData["success-expert-unlocked"]["it"] = "puzzle sbloccato";
i18nData["tuto-title"]["it"] = "Tutorial";
i18nData["tuto-0-label"]["it"] = "Contesto";
i18nData["tuto-0-text"]["it"] = "Questa è la palla.";
i18nData["tuto-1-label"]["it"] = "Regola";
i18nData["tuto-1-text"]["it"] = "La palla si muove sempre su e giù.";
i18nData["tuto-2-label"]["it"] = "Controllo";
i18nData["tuto-2-text"]["it"] = "Puoi solo guidare la palla a sinistra o a destra.";
i18nData["tuto-3-label"]["it"] = "Obiettivo";
i18nData["tuto-3-text"]["it"] = "Raccogli tutte le tessere per completare il puzzle!";
i18nData["lesson-control"]["it"] = "Lezione - Controllo";
i18nData["lesson-color"]["it"] = "Lezione - Colore";
i18nData["lesson-hole"]["it"] = "Lezione - Buco";
i18nData["lesson-push"]["it"] = "Lezione - Spingi";
i18nData["lesson-door"]["it"] = "Lezione - Le porte";
i18nData["lesson-crack"]["it"] = "Lezione - Crepa";
i18nData["lesson-water"]["it"] = "Lezione - Acqua";
i18nData["lesson-spikes"]["it"] = "Lezione - Punte";
i18nData["lesson-gap"]["it"] = "Lezione - Spazio";
i18nData["lesson-1-haiku"]["it"] = "Usa [A] e [D] per muoverti\na sinistra e a destra.";
i18nData["lesson-2-haiku"]["it"] = "Colpisci un tamburo\nper cambiare colore.";
i18nData["lesson-3-haiku"]["it"] = "Non cadere in un buco.";
i18nData["lesson-4-haiku"]["it"] = "Le scatole di legno\npossono essere spinte.";
i18nData["lesson-5-haiku"]["it"] = "Colpisci una tessera chiave\nper aprire le tessere porta.";
i18nData["lesson-6-haiku"]["it"] = "Le tessere incrinate possono\nessere attraversate solo una volta.";
i18nData["lesson-7-haiku"]["it"] = "L'acqua scorre\nverso il basso.";
i18nData["lesson-8-haiku"]["it"] = "Le punte sono pericolose,\nevita le punte.";
i18nData["lesson-9-haiku"]["it"] = "Usa le tessere per\nevitare il crepaccio.";
i18nData["play"]["es"] = "JUGAR";
i18nData["completed"]["es"] = "completado";
i18nData["home-story-mode"]["es"] = "modo historia";
i18nData["home-expert-mode"]["es"] = "modo experto";
i18nData["home-community-mode"]["es"] = "rompecabezas de la comunidad";
i18nData["intro-to-play-keyboard"]["es"] = "Haz clic para jugar";
i18nData["intro-to-play-touch"]["es"] = "Toca para jugar";
i18nData["intro-tip-keyboard"]["es"] = "Mantén presionados [A] y [D] o [<] y [>] para mover la pelota";
i18nData["intro-tip-touch"]["es"] = "Mantén presionados [<] y [>] para mover la pelota";
i18nData["success-title"]["es"] = "¡ÉXITO!";
i18nData["success-submit-score"]["es"] = "Enviar puntaje";
i18nData["success-sending-score"]["es"] = "Enviando...";
i18nData["success-well-played"]["es"] = "¡Bien jugado!";
i18nData["success-continue"]["es"] = "Continuar";
i18nData["success-next-level"]["es"] = "Siguiente nivel";
i18nData["success-expert-unlocked"]["es"] = "rompecabezas desbloqueado";
i18nData["tuto-title"]["es"] = "Tutorial";
i18nData["tuto-0-label"]["es"] = "Contexto";
i18nData["tuto-0-text"]["es"] = "Esta es la pelota.";
i18nData["tuto-1-label"]["es"] = "Regla";
i18nData["tuto-1-text"]["es"] = "La pelota siempre se mueve hacia arriba y hacia abajo.";
i18nData["tuto-2-label"]["es"] = "Control";
i18nData["tuto-2-text"]["es"] = "Solo puedes dirigir la pelota hacia la izquierda o la derecha.";
i18nData["tuto-3-label"]["es"] = "Objetivo";
i18nData["tuto-3-text"]["es"] = "¡Reúne todas las fichas para completar el rompecabezas!";
i18nData["lesson-control"]["es"] = "Lección - Control";
i18nData["lesson-color"]["es"] = "Lección - Color";
i18nData["lesson-hole"]["es"] = "Lección - Agujero";
i18nData["lesson-push"]["es"] = "Lección - Empujar";
i18nData["lesson-door"]["es"] = "Lección - Las puertas";
i18nData["lesson-crack"]["es"] = "Lección - Grieta";
i18nData["lesson-water"]["es"] = "Lección - Agua";
i18nData["lesson-spikes"]["es"] = "Lección - Púas";
i18nData["lesson-gap"]["es"] = "Lección - Hueco";
i18nData["lesson-1-haiku"]["es"] = "Usa [A] y [D] para moverte\nhacia la izquierda y la derecha.";
i18nData["lesson-2-haiku"]["es"] = "Golpea un tambor\npara cambiar de color.";
i18nData["lesson-3-haiku"]["es"] = "No caigas en un agujero.";
i18nData["lesson-4-haiku"]["es"] = "Las cajas de madera\nse pueden empujar.";
i18nData["lesson-5-haiku"]["es"] = "Golpea una llave\npara abrir las puertas.";
i18nData["lesson-6-haiku"]["es"] = "Las fichas agrietadas\nsolo se pueden cruzar una vez.";
i18nData["lesson-7-haiku"]["es"] = "El agua fluye\nhacia el fondo.";
i18nData["lesson-8-haiku"]["es"] = "Los pinchos son peligrosos,\nevítalos.";
i18nData["lesson-9-haiku"]["es"] = "Usa las fichas\npara evitar la grieta.";
i18nData["play"]["nl"] = "SPELEN";
i18nData["completed"]["nl"] = "voltooid";
i18nData["home-story-mode"]["nl"] = "verhaalmodus";
i18nData["home-expert-mode"]["nl"] = "expertmodus";
i18nData["home-community-mode"]["nl"] = "communitypuzzels";
i18nData["intro-to-play-keyboard"]["nl"] = "Klik om te spelen";
i18nData["intro-to-play-touch"]["nl"] = "Aanraken om te spelen";
i18nData["intro-tip-keyboard"]["nl"] = "Houd [A] en [D] of [<] en [>] ingedrukt om de bal te verplaatsen";
i18nData["intro-tip-touch"]["nl"] = "Houd [<] en [>] ingedrukt om de bal te verplaatsen";
i18nData["success-title"]["nl"] = "SUCCES!";
i18nData["success-submit-score"]["nl"] = "Score indienen";
i18nData["success-sending-score"]["nl"] = "Verzenden...";
i18nData["success-well-played"]["nl"] = "Goed gespeeld!";
i18nData["success-continue"]["nl"] = "Doorgaan";
i18nData["success-next-level"]["nl"] = "Volgend niveau";
i18nData["success-expert-unlocked"]["nl"] = "puzzel ontgrendeld";
i18nData["tuto-title"]["nl"] = "Tutorial";
i18nData["tuto-0-label"]["nl"] = "Context";
i18nData["tuto-0-text"]["nl"] = "Dit is de bal.";
i18nData["tuto-1-label"]["nl"] = "Regel";
i18nData["tuto-1-text"]["nl"] = "De bal beweegt altijd omhoog en omlaag.";
i18nData["tuto-2-label"]["nl"] = "Besturing";
i18nData["tuto-2-text"]["nl"] = "Je kunt de bal alleen naar links of rechts sturen.";
i18nData["tuto-3-label"]["nl"] = "Doel";
i18nData["tuto-3-text"]["nl"] = "Verzamel alle tegels om de puzzel te voltooien!";
i18nData["lesson-control"]["nl"] = "Les - Besturing";
i18nData["lesson-color"]["nl"] = "Les - Kleur";
i18nData["lesson-hole"]["nl"] = "Les - Gat";
i18nData["lesson-push"]["nl"] = "Les - Duwen";
i18nData["lesson-door"]["nl"] = "Les - De deuren";
i18nData["lesson-crack"]["nl"] = "Les - Barst";
i18nData["lesson-water"]["nl"] = "Les - Water";
i18nData["lesson-spikes"]["nl"] = "Les - Spikes";
i18nData["lesson-gap"]["nl"] = "Les - Gap";
i18nData["lesson-1-haiku"]["nl"] = "Gebruik [A] en [D] om naar\nlinks en rechts te bewegen.";
i18nData["lesson-2-haiku"]["nl"] = "Sla op een trommel om\nvan kleur te veranderen.";
i18nData["lesson-3-haiku"]["nl"] = "Val niet in een gat.";
i18nData["lesson-4-haiku"]["nl"] = "Houten kisten kunnen\nworden geduwd.";
i18nData["lesson-5-haiku"]["nl"] = "Sla op een sleuteltegel\nom deurtegels te openen.";
i18nData["lesson-6-haiku"]["nl"] = "Gebarsten tegels kunnen maar\néén keer worden overgestoken.";
i18nData["lesson-7-haiku"]["nl"] = "Water stroomt\nnaar de bodem.";
i18nData["lesson-8-haiku"]["nl"] = "Spikes zijn gevaarlijk,\nvermijd de spikes.";
i18nData["lesson-9-haiku"]["nl"] = "Gebruik de tegels om\nde spleet te vermijden.";
let fullEnglishText = "";
for (const key in i18nData) {
    fullEnglishText += i18nData[key]["en"].replaceAll("\n", " ") + "\n";
}
function AddTranslation(locale, text) {
    let lines = text.split("\n");
    let n = 0;
    let output = "";
    for (const key in i18nData) {
        output += "i18nData[\"" + key + "\"][\"" + locale + "\"] = \"" + lines[n] + "\";\n";
        n++;
    }
    console.log(output);
}
function CenterPanel(panel, dx = 0, dy = 0) {
    let bodyRect = document.body.getBoundingClientRect();
    let panelRect = panel.getBoundingClientRect();
    if (bodyRect.width * 0.95 < panelRect.width) {
        let f = bodyRect.width / panelRect.width * 0.95;
        panel.style.transformOrigin = "top left";
        panel.style.transform = "scale(" + f.toFixed(3) + ", " + f.toFixed(3) + ")";
        panel.style.left = "2.5%";
        panel.style.right = "auto";
    }
    else {
        let left = Math.floor((bodyRect.width - panelRect.width) * 0.5 + dx / window.devicePixelRatio);
        panel.style.left = left.toFixed(0) + "px";
        panel.style.right = "auto";
    }
    if (bodyRect.height * 0.95 < panelRect.height) {
        let f = bodyRect.height / panelRect.height * 0.95;
        panel.style.transformOrigin = "top left";
        panel.style.transform = "scale(" + f.toFixed(3) + ", " + f.toFixed(3) + ")";
        panel.style.top = "2.5%";
        panel.style.bottom = "auto";
    }
    else {
        let top = Math.floor((bodyRect.height - panelRect.height) * 0.5 + dy / window.devicePixelRatio);
        panel.style.top = top.toFixed(0) + "px";
        panel.style.bottom = "auto";
    }
}
