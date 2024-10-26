var BallState;
(function (BallState) {
    BallState[BallState["Ready"] = 0] = "Ready";
    BallState[BallState["Move"] = 1] = "Move";
    BallState[BallState["Fall"] = 2] = "Fall";
    BallState[BallState["Done"] = 3] = "Done";
})(BallState || (BallState = {}));
class Ball extends BABYLON.Mesh {
    constructor(game, props) {
        super("ball");
        this.game = game;
        this.ballState = BallState.Ready;
        this.fallTimer = 0;
        this.vZ = 1;
        this.radius = 0.3;
        this.leftDown = false;
        this.rightDown = false;
        this.animateSpeed = Mummu.AnimationFactory.EmptyNumberCallback;
        this.playTimer = 0;
        this.xForce = 1;
        this.speed = 2;
        this.moveDir = BABYLON.Vector3.Up();
        this.inputSpeed = 1000;
        this.bounceXValue = 0;
        this.bounceXTimer = 0;
        this.bounceXDelay = 1.09;
        this.trailTimer = 0;
        this.trailPoints = [];
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
        document.addEventListener("keydown", (ev) => {
            if (ev.code === "KeyA" || ev.code === "ArrowLeft") {
                this.leftDown = true;
            }
            else if (ev.code === "KeyD" || ev.code === "ArrowRight") {
                this.rightDown = true;
            }
        });
        document.addEventListener("keyup", (ev) => {
            if (ev.code === "KeyA" || ev.code === "ArrowLeft") {
                this.leftDown = false;
            }
            else if (ev.code === "KeyD" || ev.code === "ArrowRight") {
                this.rightDown = false;
            }
        });
        let inputLeft = document.querySelector("#input-left");
        if (inputLeft) {
            inputLeft.addEventListener("pointerdown", () => {
                this.leftDown = true;
            });
            inputLeft.addEventListener("pointerup", () => {
                this.leftDown = false;
            });
        }
        let inputRight = document.querySelector("#input-right");
        if (inputRight) {
            inputRight.addEventListener("pointerdown", () => {
                this.rightDown = true;
            });
            inputRight.addEventListener("pointerup", () => {
                this.rightDown = false;
            });
        }
    }
    setColor(color) {
        this.color = color;
        if (this.ballTop) {
            this.ballTop.material = this.game.colorMaterials[this.color];
        }
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
        let ballDatas = await this.game.vertexDataLoader.get("./datas/meshes/ball.babylon");
        ballDatas[0].applyToMesh(this);
        ballDatas[1].applyToMesh(this.ballTop);
        BABYLON.CreateGroundVertexData({ width: 0.8, height: 0.8 }).applyToMesh(this.shadow);
    }
    update(dt) {
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
                let last = this.trailPoints[this.trailPoints.length - 1];
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
                        Mummu.RotateInPlace(pDir, BABYLON.Axis.Y, -(a - Math.PI * 0.3));
                        p.copyFrom(pDir).addInPlace(last);
                    }
                    if (a < -Math.PI * 0.3) {
                        Mummu.RotateInPlace(pDir, BABYLON.Axis.Y, -(a + Math.PI * 0.3));
                        p.copyFrom(pDir).addInPlace(last);
                    }
                }
                this.trailPoints.push(p);
                if (this.trailPoints.length > 15) {
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
                if (USE_POKI_SDK) {
                    PokiGameplayStart();
                }
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
            this.moveDir.copyFromFloats(this.xForce * vX * (1.2 - 2 * this.radius) / 0.55, 0, this.vZ).normalize();
            let speed = this.moveDir.scale(this.speed);
            this.position.addInPlace(speed.scale(dt));
            if (this.position.z + this.radius > this.game.puzzle.zMax + 0.05) {
                this.vZ = -1;
                this.woodChocSound2.play();
            }
            else if (this.position.z - this.radius < this.game.puzzle.zMin - 0.05) {
                this.vZ = 1;
                this.woodChocSound2.play();
            }
            if (this.position.x + this.radius > this.game.puzzle.xMax + 0.05) {
                this.bounceXValue = -1;
                this.bounceXTimer = this.bounceXDelay;
                this.woodChocSound2.play();
                this.woodChocSound2.play();
            }
            else if (this.position.x - this.radius < this.game.puzzle.xMin - 0.05) {
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
            let hit = this.game.scene.pickWithRay(ray, (mesh) => {
                return mesh.name === "floor" || mesh.name === "building-floor";
            });
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
        this.game.puzzle.tiles.push(this);
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
            let m = 0.05;
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
        await this.animateSize(0.01, 0.3);
    }
    dispose() {
        let index = this.game.puzzle.tiles.indexOf(this);
        if (index != -1) {
            this.game.puzzle.tiles.splice(index, 1);
        }
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
}
/// <reference path="./Tile.ts"/>
class BlockTile extends Tile {
    constructor(game, props) {
        super(game, props);
        this.color = props.color;
        this.material = this.game.brownMaterial;
        this.tileTop = new BABYLON.Mesh("tile-top");
        this.tileTop.parent = this;
        this.tileTop.material = this.game.colorMaterials[this.color];
    }
    async instantiate() {
        await super.instantiate();
        let tileData = await this.game.vertexDataLoader.getAtIndex("./datas/meshes/box.babylon");
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
        this.material = this.game.blackMaterial;
        let index = this.game.puzzle.borders.indexOf(this);
        if (index === -1) {
            this.game.puzzle.borders.push(this);
        }
    }
    get vertical() {
        return this.rotation.y === 0;
    }
    set vertical(v) {
        this.rotation.y = v ? 0 : Math.PI * 0.5;
        this.w = v ? 0 : 1;
        this.d = v ? 1 : 0;
    }
    static BorderLeft(game, i, j, y = 0, ghost = false) {
        let border = new Border(game, ghost);
        border.position.x = (i - 0.5) * 1.1;
        border.position.y = y;
        border.position.z = j * 1.1;
        return border;
    }
    static BorderRight(game, i, j, y = 0, ghost = false) {
        let border = new Border(game, ghost);
        border.position.x = (i + 0.5) * 1.1;
        border.position.y = y;
        border.position.z = j * 1.1;
        return border;
    }
    static BorderTop(game, i, j, y = 0, ghost = false) {
        let border = new Border(game, ghost);
        border.vertical = false;
        border.position.x = i * 1.1;
        border.position.y = y;
        border.position.z = (j + 0.5) * 1.1;
        return border;
    }
    static BorderBottom(game, i, j, y = 0, ghost = false) {
        let border = new Border(game, ghost);
        border.vertical = false;
        border.position.x = i * 1.1;
        border.position.y = y;
        border.position.z = (j - 0.5) * 1.1;
        return border;
    }
    async instantiate() {
        if (!this.ghost) {
            let data = BABYLON.CreateBoxVertexData({ width: 0.1, height: 0.3, depth: 1.2 });
            Mummu.TranslateVertexDataInPlace(data, new BABYLON.Vector3(0, 0.15, 0));
            data.applyToMesh(this);
        }
    }
    dispose() {
        let index = this.game.puzzle.borders.indexOf(this);
        if (index != -1) {
            this.game.puzzle.borders.splice(index, 1);
        }
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
        this.floor.material = this.game.darkFloorMaterial;
        this.shadow = new BABYLON.Mesh("shadow");
        this.shadow.position.y = 0.01;
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
    }
    get j() {
        return Math.round(this.position.z / 1.1);
    }
    set j(v) {
        this.position.z = v * 1.1;
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
}
class Ramp extends Build {
    constructor(game, props) {
        super(game, props);
        this.scaling.copyFromFloats(1.1, 1, 1.1);
        this.material = this.game.salmonMaterial;
        this.builtInBorder = new BABYLON.Mesh("ramp-border");
        this.builtInBorder.parent = this;
        this.builtInBorder.material = this.game.blackMaterial;
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
        let data = await this.game.vertexDataLoader.get("./datas/meshes/building.babylon");
        data[0].applyToMesh(this);
        data[1].applyToMesh(this.floor);
        data[2].applyToMesh(this.builtInBorder);
        let m = 0.2;
        let shadowData = Mummu.Create9SliceVertexData({
            width: 2 + 2 * m,
            height: 3 + m,
            margin: m,
            cutTop: true
        });
        Mummu.RotateVertexDataInPlace(shadowData, BABYLON.Quaternion.FromEulerAngles(Math.PI * 0.5, 0, 0));
        Mummu.TranslateVertexDataInPlace(shadowData, new BABYLON.Vector3(0.5, 0, 1 + 0.5 * m));
        shadowData.applyToMesh(this.shadow);
    }
}
class Box extends Build {
    constructor(game, props) {
        super(game, props);
        this.scaling.copyFromFloats(1.1, 1, 1.1);
        this.material = this.game.salmonMaterial;
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
        if (this.puzzle.hMapGet(this.i - 1, this.j) != 1 || this.puzzle.hMapGet(this.i - 1, this.j + 1) != 1) {
            this.props.borderLeft = true;
            this.borders.push(Border.BorderLeft(this.game, this.i, this.j, 1));
            this.borders.push(Border.BorderLeft(this.game, this.i, this.j + 1, 1));
        }
        if (this.puzzle.hMapGet(this.i + 2, this.j) != 1 || this.puzzle.hMapGet(this.i + 2, this.j + 1) != 1) {
            this.props.borderRight = true;
            this.borders.push(Border.BorderRight(this.game, this.i + 1, this.j, 1));
            this.borders.push(Border.BorderRight(this.game, this.i + 1, this.j + 1, 1));
        }
        if (this.puzzle.hMapGet(this.i, this.j - 1) != 1 || this.puzzle.hMapGet(this.i + 1, this.j - 1) != 1) {
            this.props.borderBottom = true;
            this.borders.push(Border.BorderBottom(this.game, this.i, this.j, 1));
            this.borders.push(Border.BorderBottom(this.game, this.i + 1, this.j, 1));
        }
        if (this.puzzle.hMapGet(this.i, this.j + 2) != 1 || this.puzzle.hMapGet(this.i + 1, this.j + 2) != 1) {
            this.props.borderTop = true;
            this.borders.push(Border.BorderTop(this.game, this.i, this.j + 1, 1));
            this.borders.push(Border.BorderTop(this.game, this.i + 1, this.j + 1, 1));
        }
    }
    async instantiate() {
        for (let i = 0; i < this.borders.length; i++) {
            await this.borders[i].instantiate();
        }
        let data = await this.game.vertexDataLoader.get("./datas/meshes/building.babylon");
        data[6].applyToMesh(this);
        data[7].applyToMesh(this.floor);
        console.log(this.props);
        let m = 0.2;
        let shadowData = Mummu.Create9SliceVertexData({
            width: 2 + 2 * m,
            height: 2 + 2 * m,
            margin: m,
            cutTop: this.props.borderTop ? false : true,
            cutRight: this.props.borderRight ? false : true,
            cutBottom: this.props.borderBottom ? false : true,
            cutLeft: this.props.borderLeft ? false : true,
        });
        Mummu.RotateVertexDataInPlace(shadowData, BABYLON.Quaternion.FromEulerAngles(Math.PI * 0.5, 0, 0));
        Mummu.TranslateVertexDataInPlace(shadowData, new BABYLON.Vector3(0.5, 0, 0.5));
        shadowData.applyToMesh(this.shadow);
    }
}
class Bridge extends Build {
    constructor(game, props) {
        super(game, props);
        this.scaling.copyFromFloats(1.1, 1, 1.1);
        this.material = this.game.salmonMaterial;
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
        data[4].applyToMesh(this.floor);
        data[5].applyToMesh(this.builtInBorder);
        let m = 0.2;
        let shadowData = Mummu.Create9SliceVertexData({
            width: 4 + 2 * m,
            height: 2 + 2 * m,
            margin: m,
            cutRight: this.props.borderRight ? false : true,
            cutLeft: this.props.borderLeft ? false : true
        });
        Mummu.RotateVertexDataInPlace(shadowData, BABYLON.Quaternion.FromEulerAngles(Math.PI * 0.5, 0, 0));
        Mummu.TranslateVertexDataInPlace(shadowData, new BABYLON.Vector3(1.5, 0, 0.5));
        shadowData.applyToMesh(this.shadow);
    }
}
class CarillonRouter extends Nabu.Router {
    constructor(game) {
        super();
        this.game = game;
    }
    onFindAllPages() {
        console.log("onFindAllPages");
        this.homeMenu = new HomePage("#home-menu", this);
        this.baseLevelPage = new BaseLevelPage("#base-levels-page", this);
        this.communityLevelPage = new CommunityLevelPage("#community-levels-page", this);
        this.devLevelPage = new DevLevelPage("#dev-levels-page", this);
        this.creditsPage = document.querySelector("#credits-page");
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
        console.log("onHRefChange previous " + previousPage + " now " + page);
        //?gdmachineId=1979464530
        for (let i = 0; i < this.pages.length; i++) {
            await this.pages[i].waitLoaded();
        }
        this.game.mode = GameMode.Menu;
        this.game.editor.deactivate();
        if (page.startsWith("#options")) {
        }
        else if (page.startsWith("#credits")) {
            await this.show(this.creditsPage, false, 0);
        }
        else if (page === "#dev") {
            await this.show(this.devPage, false, 0);
        }
        else if (page.startsWith("#community")) {
            await this.show(this.communityLevelPage.nabuPage, false, 0);
            this.communityLevelPage.redraw();
        }
        else if (page.startsWith("#dev-levels")) {
            if (!DEV_MODE_ACTIVATED) {
                location.hash = "#dev";
                return;
            }
            await this.show(this.devLevelPage.nabuPage, false, 0);
            if (page.indexOf("#dev-levels-") != -1) {
                let state = parseInt(page.replace("#dev-levels-", ""));
                this.devLevelPage.levelStateToFetch = state;
            }
            else {
                this.devLevelPage.levelStateToFetch = 0;
            }
            this.devLevelPage.redraw();
        }
        else if (page.startsWith("#editor-preview")) {
            this.game.puzzle.puzzleUI.successBackButton.parentElement.href = "#editor";
            this.game.puzzle.puzzleUI.successNextButton.parentElement.href = "#editor";
            this.game.puzzle.puzzleUI.gameoverBackButton.parentElement.href = "#editor";
            await this.show(this.playUI, false, 0);
            document.querySelector("#editor-btn").style.display = "";
            await this.game.puzzle.reset();
            this.game.mode = GameMode.Play;
        }
        else if (page.startsWith("#editor")) {
            await this.show(this.editorUI, false, 0);
            await this.game.puzzle.reset();
            this.game.editor.activate();
            this.game.mode = GameMode.Editor;
        }
        else if (page.startsWith("#level-")) {
            this.playBackButton.parentElement.href = "#levels";
            this.game.puzzle.puzzleUI.successBackButton.parentElement.href = "#levels";
            this.game.puzzle.puzzleUI.gameoverBackButton.parentElement.href = "#levels";
            let numLevel = parseInt(page.replace("#level-", ""));
            this.game.puzzle.puzzleUI.successNextButton.parentElement.href = "#level-" + (numLevel + 1).toFixed(0);
            if (this.game.puzzle.data.numLevel != numLevel) {
                let data = this.game.tiaratumGameTutorialLevels;
                if (data.puzzles[numLevel - 1]) {
                    this.game.puzzle.loadFromData(data.puzzles[numLevel - 1]);
                }
                else {
                    location.hash = "#levels";
                    return;
                }
            }
            await this.game.puzzle.reset();
            await this.show(this.playUI, false, 0);
            document.querySelector("#editor-btn").style.display = DEV_MODE_ACTIVATED ? "" : "none";
            this.game.mode = GameMode.Play;
        }
        else if (page.startsWith("#play-community-")) {
            this.playBackButton.parentElement.href = "#community";
            this.game.puzzle.puzzleUI.successBackButton.parentElement.href = "#community";
            this.game.puzzle.puzzleUI.successNextButton.parentElement.href = "#community";
            this.game.puzzle.puzzleUI.gameoverBackButton.parentElement.href = "#community";
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
                this.game.puzzle.loadFromData(data);
            }
            await this.game.puzzle.reset();
            await this.show(this.playUI, false, 0);
            document.querySelector("#editor-btn").style.display = DEV_MODE_ACTIVATED ? "" : "none";
            this.game.mode = GameMode.Play;
        }
        else if (page.startsWith("#levels")) {
            await this.show(this.baseLevelPage.nabuPage, false, 0);
            this.baseLevelPage.redraw();
        }
        else if (page.startsWith("#home")) {
            await this.show(this.homeMenu.nabuPage, false, 0);
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
    EditorBrush[EditorBrush["Rock"] = 6] = "Rock";
    EditorBrush[EditorBrush["Wall"] = 7] = "Wall";
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
                    return mesh.name === "floor" || mesh.name === "building-floor" || mesh === this.invisiFloorTM;
                });
                if (pick.hit) {
                    this.cursorI = Math.round(pick.pickedPoint.x / 1.1);
                    this.cursorJ = Math.round(pick.pickedPoint.z / 1.1);
                    this.cursorH = this.game.puzzle.hMapGet(this.cursorI, this.cursorJ);
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
                    return mesh.name === "floor" || mesh.name === "building-floor" || mesh === this.invisiFloorTM;
                });
                if (pick.hit) {
                    if (ev.button === 2 || this.brush === EditorBrush.Delete) {
                        let tile = this.game.puzzle.tiles.find(tile => {
                            return tile.i === this.cursorI && tile.j === this.cursorJ && Math.abs(tile.position.y - this.cursorH) < 0.3;
                        });
                        if (tile) {
                            tile.dispose();
                            this.game.puzzle.rebuildFloor();
                            this.updateInvisifloorTM();
                        }
                        else {
                            let building = this.game.puzzle.buildings.find(build => {
                                return build.i === this.cursorI && build.j === this.cursorJ;
                            });
                            if (building) {
                                building.dispose();
                                this.game.puzzle.editorRegenerateBuildings();
                            }
                        }
                    }
                    else if (ev.button === 0) {
                        let tile = this.game.puzzle.tiles.find(tile => {
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
                            else if (this.brush === EditorBrush.Rock) {
                                tile = new RockTile(this.game, {
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
                            else if (this.brush === EditorBrush.Box) {
                                let box = new Box(this.game, {
                                    i: this.cursorI,
                                    j: this.cursorJ
                                });
                                this.game.puzzle.editorRegenerateBuildings();
                            }
                            else if (this.brush === EditorBrush.Ramp) {
                                let box = new Ramp(this.game, {
                                    i: this.cursorI,
                                    j: this.cursorJ
                                });
                                this.game.puzzle.editorRegenerateBuildings();
                            }
                            else if (this.brush === EditorBrush.Bridge) {
                                let box = new Bridge(this.game, {
                                    i: this.cursorI,
                                    j: this.cursorJ
                                });
                                this.game.puzzle.editorRegenerateBuildings();
                            }
                            if (tile) {
                                tile.instantiate();
                                this.game.puzzle.rebuildFloor();
                                this.updateInvisifloorTM();
                            }
                        }
                    }
                }
            }
        };
        this.invisiFloorTM = BABYLON.MeshBuilder.CreateGround("invisifloor", { width: 10, height: 10 });
        this.invisiFloorTM.position.x = 5 - 0.55;
        this.invisiFloorTM.position.y = -0.01;
        this.invisiFloorTM.position.z = 5 - 0.55;
        this.invisiFloorTM.isVisible = false;
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
    initValues() {
        this.originColorInput.setValue(this.game.ball.color);
        this.originIInput.setValue(this.game.ball.i);
        this.originJInput.setValue(this.game.ball.j);
        this.widthInput.setValue(this.game.puzzle.w);
        this.heightInput.setValue(this.game.puzzle.h);
    }
    activate() {
        this.originColorInput = document.getElementById("editor-origin-color");
        this.originColorInput.onValueChange = (v) => {
            let color = v;
            this.game.ball.setColor(color);
        };
        this.originColorInput.valueToString = (v) => {
            return TileColorNames[v];
        };
        this.originIInput = document.getElementById("editor-origin-i");
        this.originIInput.onValueChange = (v) => {
            this.dropClear();
            this.game.ball.i = Math.min(v, this.game.puzzle.w - 1);
        };
        this.originJInput = document.getElementById("editor-origin-j");
        this.originJInput.onValueChange = (v) => {
            this.dropClear();
            this.game.ball.j = Math.min(v, this.game.puzzle.h - 1);
        };
        this.widthInput = document.getElementById("editor-width");
        this.widthInput.onValueChange = (v) => {
            this.dropClear();
            this.game.puzzle.w = Math.max(v, 3);
            this.game.puzzle.rebuildFloor();
            this.updateInvisifloorTM();
        };
        this.heightInput = document.getElementById("editor-height");
        this.heightInput.onValueChange = (v) => {
            this.dropClear();
            this.game.puzzle.h = Math.max(v, 3);
            this.game.puzzle.rebuildFloor();
            this.updateInvisifloorTM();
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
        this.rockButton = document.getElementById("rock-btn");
        this.wallButton = document.getElementById("wall-btn");
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
            this.rockButton,
            this.wallButton,
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
        makeBrushButton(this.rockButton, EditorBrush.Rock);
        makeBrushButton(this.wallButton, EditorBrush.Wall);
        makeBrushButton(this.boxButton, EditorBrush.Box, undefined, { w: 2, h: 1, d: 2 });
        makeBrushButton(this.rampButton, EditorBrush.Ramp, undefined, { w: 2, h: 1, d: 3 });
        makeBrushButton(this.bridgeButton, EditorBrush.Bridge, undefined, { w: 4, h: 1, d: 2 });
        makeBrushButton(this.deleteButton, EditorBrush.Delete);
        document.getElementById("play-btn").onclick = async () => {
            this.dropClear();
            this.dropBrush();
            this.game.puzzle.reset();
            location.hash = "#editor-preview";
        };
        document.getElementById("save-btn").onclick = () => {
            this.dropClear();
            this.dropBrush();
            let content = this.game.puzzle.saveAsText();
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
                    console.log(content);
                    this.game.puzzle.loadFromData({
                        id: 42,
                        title: "Custom Machine",
                        author: "Editor",
                        content: content
                    });
                    await this.game.puzzle.instantiate();
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
                    content: this.game.puzzle.saveAsText(),
                    id: null
                };
                let headers = {
                    "Content-Type": "application/json",
                };
                if (DEV_MODE_ACTIVATED && this.game.puzzle.data.id != null) {
                    data.id = this.game.puzzle.data.id;
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
                console.log(text);
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
            await this.game.puzzle.loadFromFile("./datas/levels/min.txt");
            await this.game.puzzle.instantiate();
            this.initValues();
            this.updatePublishText();
        };
        this.game.canvas.addEventListener("pointerdown", this.pointerDown);
        this.game.canvas.addEventListener("pointerup", this.pointerUp);
        this.game.camera.attachControl();
        this.updatePublishText();
        this.updateInvisifloorTM();
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
        if (DEV_MODE_ACTIVATED && this.game.puzzle.data.id != null) {
            document.querySelector("#publish-btn stroke-text").innerHTML = "Update";
            this.publishConfirmButton.querySelector("stroke-text").innerHTML = "Update";
            this.titleInput.value = this.game.puzzle.data.title;
            this.authorInput.value = this.game.puzzle.data.author;
        }
        else {
            document.querySelector("#publish-btn stroke-text").innerHTML = "Publish";
            this.publishConfirmButton.querySelector("stroke-text").innerHTML = "Publish";
        }
    }
    updateInvisifloorTM() {
        let w = this.game.puzzle.xMax - this.game.puzzle.xMin;
        let h = this.game.puzzle.zMax - this.game.puzzle.zMin;
        BABYLON.CreateGroundVertexData({ width: w, height: h }).applyToMesh(this.invisiFloorTM);
        this.invisiFloorTM.position.x = 0.5 * w;
        this.invisiFloorTM.position.z = 0.5 * h;
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
        context.font = "900 130px Shalimar";
        context.fillText(this.title, 100, 150);
        context.fillText(this.text1, 30, 550);
        context.fillText(this.text2, 30, 700);
        context.fillText(this.text3, 30, 850);
        this.dynamicTexture.update();
        this.animateVisibility = Mummu.AnimationFactory.CreateNumber(this, this, "visibility");
    }
    update(dt) {
        if (this.game.ball.ballState === BallState.Move) {
            let dx = Math.abs(this.position.x - this.game.ball.position.x);
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
                console.log("A");
                return;
            }
            if (this.buttons.length === 0) {
                console.log("B");
                return;
            }
            let btn = this.buttons[this._hoveredButtonIndex];
            if (btn && btn.onclick) {
                btn.onclick(undefined);
                console.log("C");
                return;
            }
            console.log("D");
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
        this.colCount = Math.floor(rect.width / 150);
        this.rowCount = Math.floor(rect.height / 150);
        while (this.colCount < 3) {
            this.colCount++;
        }
        while (this.rowCount < 4) {
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
                    squareButton.style.visibility = "hidden";
                }
                else {
                    if (puzzleTileData[n].locked) {
                        squareButton.classList.add("locked");
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
                    if (this.router.game.isPuzzleCompleted(puzzleTileData[n].data.id)) {
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
        line = document.createElement("div");
        line.classList.add("square-btn-container-halfline");
        container.appendChild(line);
        let prevButton = document.createElement("button");
        this.buttons.push(prevButton);
        prevButton.classList.add("square-btn", "bluegrey");
        if (this.page === 0) {
            prevButton.innerHTML = "<stroke-text>BACK</stroke-text>";
            prevButton.onclick = () => {
                location.hash = "#home";
            };
        }
        else {
            prevButton.innerHTML = "<stroke-text>PREV</stroke-text>";
            prevButton.onclick = () => {
                this.page--;
                this.redraw();
            };
        }
        line.appendChild(prevButton);
        for (let j = 1; j < this.colCount - 1; j++) {
            let squareButton = document.createElement("button");
            this.buttons.push(squareButton);
            squareButton.classList.add("square-btn");
            squareButton.style.visibility = "hidden";
            line.appendChild(squareButton);
        }
        let nextButton = document.createElement("button");
        this.buttons.push(nextButton);
        nextButton.classList.add("square-btn", "bluegrey");
        if (puzzleTileData.length === this.levelsPerPage) {
            nextButton.innerHTML = "<stroke-text>NEXT</stroke-text>";
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
        console.log(this.className + ".setHoveredButtonIndex " + v);
        console.log(this.buttons);
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
        for (let i = 0; i < levelsPerPage && i < data.puzzles.length; i++) {
            let n = i + page * levelsPerPage;
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
            if (data.puzzles[n]) {
                puzzleData[i] = {
                    data: data.puzzles[n],
                    onclick: () => {
                        this.router.game.puzzle.loadFromData(data.puzzles[n]);
                        location.hash = "level-" + (n + 1).toFixed(0);
                    },
                    locked: locked
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
                        this.router.game.puzzle.loadFromData(data.puzzles[i]);
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
                        this.router.game.puzzle.loadFromData(data.puzzles[n]);
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
        console.log(var1);
        const response = await fetch(SHARE_SERVICE_PATH + "get_puzzles/" + page.toFixed(0) + "/" + levelsPerPage.toFixed(0) + "/" + this.levelStateToFetch.toFixed(0), {
            method: "GET",
            mode: "cors",
            headers: {
                "Authorization": 'Basic ' + btoa("carillon:" + var1)
            }
        });
        if (response.status === 200) {
            let text = await response.text();
            console.log(text);
            let data = JSON.parse(text);
            CLEAN_IPuzzlesData(data);
            for (let i = 0; i < levelsPerPage && i < data.puzzles.length; i++) {
                let id = data.puzzles[i].id;
                puzzleData[i] = {
                    data: data.puzzles[i],
                    onclick: () => {
                        this.router.game.puzzle.loadFromData(data.puzzles[i]);
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
var MRS_VERSION = 0;
var MRS_VERSION2 = 0;
var MRS_VERSION3 = 3;
var VERSION = MRS_VERSION * 1000 + MRS_VERSION2 * 100 + MRS_VERSION3;
var CONFIGURATION_VERSION = MRS_VERSION * 1000 + MRS_VERSION2 * 100 + MRS_VERSION3;
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
    document.body.removeEventListener("click", onFirstPlayerInteractionClick);
    document.body.removeEventListener("keydown", onFirstPlayerInteractionKeyboard);
    //Game.Instance.showGraphicAutoUpdateAlert("Touch");
    setTimeout(() => {
        document.getElementById("click-anywhere-screen").style.display = "none";
    }, 500);
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
    document.getElementById("click-anywhere-screen").style.display = "none";
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
    document.getElementById("click-anywhere-screen").style.display = "none";
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
    GameMode[GameMode["Play"] = 1] = "Play";
    GameMode[GameMode["Editor"] = 2] = "Editor";
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
        this.playCameraRange = 12;
        this.playCameraRadius = 20;
        this.playCameraMinRadius = 15;
        this.cameraOrtho = false;
        this.mode = GameMode.Menu;
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
        }
        else {
            document.body.classList.remove("vertical");
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
        await this.router.waitForAllPagesLoaded();
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
        this.floorMaterial = new BABYLON.StandardMaterial("floor-material");
        this.floorMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.floorMaterial.diffuseColor.copyFromFloats(0.8, 0.8, 0.8);
        this.floorMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/floor.png");
        this.darkFloorMaterial = new BABYLON.StandardMaterial("dark-floor-material");
        this.darkFloorMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.darkFloorMaterial.diffuseColor.copyFromFloats(1, 1, 1);
        this.darkFloorMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/floor.png");
        this.shadow9Material = new BABYLON.StandardMaterial("shadow-material");
        this.shadow9Material.diffuseColor.copyFromFloats(0.1, 0.1, 0.1);
        this.shadow9Material.diffuseTexture = new BABYLON.Texture("./datas/textures/shadow-9.png");
        this.shadow9Material.diffuseTexture.hasAlpha = true;
        this.shadow9Material.useAlphaFromDiffuseTexture = true;
        this.shadow9Material.alpha = 0.4;
        this.shadow9Material.specularColor.copyFromFloats(0, 0, 0);
        this.shadowDiscMaterial = new BABYLON.StandardMaterial("shadow-material");
        this.shadowDiscMaterial.diffuseColor.copyFromFloats(0.1, 0.1, 0.1);
        this.shadowDiscMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/shadow-disc.png");
        this.shadowDiscMaterial.diffuseTexture.hasAlpha = true;
        this.shadowDiscMaterial.useAlphaFromDiffuseTexture = true;
        this.shadowDiscMaterial.alpha = 0.4;
        this.shadowDiscMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.colorMaterials = [];
        this.colorMaterials[TileColor.North] = northMaterial;
        this.colorMaterials[TileColor.South] = southMaterial;
        this.colorMaterials[TileColor.East] = eastMaterial;
        this.colorMaterials[TileColor.West] = westMaterial;
        this.whiteMaterial = new BABYLON.StandardMaterial("white-material");
        this.whiteMaterial.diffuseColor = BABYLON.Color3.FromHexString("#e3cfb4");
        this.whiteMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.salmonMaterial = new BABYLON.StandardMaterial("salmon-material");
        this.salmonMaterial.diffuseColor = BABYLON.Color3.FromHexString("#d9ac8b");
        this.salmonMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.brownMaterial = new BABYLON.StandardMaterial("brown-material");
        this.brownMaterial.diffuseColor = BABYLON.Color3.FromHexString("#624c3c");
        this.brownMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.grayMaterial = new BABYLON.StandardMaterial("gray-material");
        this.grayMaterial.diffuseColor = BABYLON.Color3.FromHexString("#5d7275");
        this.grayMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.blackMaterial = new BABYLON.StandardMaterial("black-material");
        this.blackMaterial.diffuseColor = BABYLON.Color3.FromHexString("#2b2821");
        this.blackMaterial.specularColor.copyFromFloats(0, 0, 0);
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
            for (let i = 0; i < offlinePuzzles.puzzles.length; i++) {
                offlinePuzzles.puzzles[i].title = (i + 1).toFixed(0) + ". " + offlinePuzzles.puzzles[i].title;
            }
            this.tiaratumGameOfflinePuzzleLevels = offlinePuzzles;
            for (let i = 0; i < this.tiaratumGameOfflinePuzzleLevels.puzzles.length; i++) {
                this.tiaratumGameOfflinePuzzleLevels.puzzles[i].numLevel = (i + 1);
            }
        }
        this.ball = new Ball(this, { color: TileColor.North });
        this.ball.position.x = 0;
        this.ball.position.z = 0;
        this.puzzle = new Puzzle(this);
        await this.puzzle.loadFromFile("./datas/levels/test.txt");
        await this.puzzle.instantiate();
        await this.ball.instantiate();
        this.ball.ballState = BallState.Ready;
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
        document.querySelector("#score-player-input").onchange = () => {
            let v = document.querySelector("#score-player-input").value;
            if (v.length > 2) {
                document.querySelector("#success-score-submit-btn").classList.remove("locked");
                document.querySelector("#success-score-submit-btn").classList.add("orange");
            }
            else {
                document.querySelector("#success-score-submit-btn").classList.remove("orange");
                document.querySelector("#success-score-submit-btn").classList.add("locked");
            }
        };
        document.querySelector("#success-score-submit-btn").onclick = () => {
            this.puzzle.submitHighscore();
        };
        this.router.start();
        document.querySelector("#reset-btn").onclick = () => {
            this.puzzle.reset();
        };
        document.querySelector("#dev-mode-activate-btn").onclick = () => {
            DEV_ACTIVATE();
        };
        document.querySelector("#eula-back-btn").onclick = () => {
            this.router.eulaPage.hide(0);
        };
        let devSecret = 0;
        let devSecretTimout = 0;
        document.querySelector("#home h1").style.pointerEvents = "auto";
        document.querySelector("#home h1").onclick = () => {
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
        let updateCamMenuData = () => {
            this.menuCamAlpha = -Math.PI * 0.5 + (Math.random() - 0.5) * 2 * Math.PI * 0.4;
            this.menuCamBeta = Math.PI * 0.3 + (Math.random() - 0.5) * 2 * Math.PI * 0.1;
            this.menuCamRadius = 15 + (Math.random() - 0.5) * 2 * 5;
            setTimeout(updateCamMenuData, 2000 + 4000 * Math.random());
        };
        updateCamMenuData();
        let ambient = this.soundManager.createSound("ambient", "./datas/sounds/zen-ambient.mp3", this.scene, () => {
            ambient.setVolume(0.2);
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
            //document.getElementById("click-anywhere-screen").style.display = "none";
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
        this.playCameraRadius = Math.max(this.playCameraMinRadius, this.playCameraRange / Math.tan(minFov));
    }
    update() {
        let rawDT = this.scene.deltaTime / 1000;
        if (isFinite(rawDT)) {
            if (this.mode === GameMode.Play) {
                rawDT = Math.min(rawDT, 1);
                let targetCameraPos = this.ball.position.clone();
                let margin = 4;
                if (this.puzzle.xMax - this.puzzle.xMin > 2 * margin) {
                    targetCameraPos.x = Nabu.MinMax(targetCameraPos.x, this.puzzle.xMin + margin, this.puzzle.xMax - margin);
                }
                else {
                    targetCameraPos.x = (this.puzzle.xMin + this.puzzle.xMax) * 0.5;
                }
                if (this.puzzle.zMax - this.puzzle.zMin > 2 * margin) {
                    targetCameraPos.z = Nabu.MinMax(targetCameraPos.z, this.puzzle.zMin + margin * 1.15, this.puzzle.zMax - margin * 0.85);
                }
                else {
                    targetCameraPos.z = (this.puzzle.zMin * 1.15 + this.puzzle.zMax * 0.85) * 0.5;
                }
                let f = Nabu.Easing.smooth2Sec(1 / rawDT);
                BABYLON.Vector3.LerpToRef(this.camera.target, targetCameraPos, (1 - f), this.camera.target);
                let f3 = Nabu.Easing.smooth3Sec(1 / rawDT);
                this.camera.alpha = this.camera.alpha * f3 + (-Math.PI * 0.5) * (1 - f3);
                this.camera.beta = this.camera.beta * f3 + (Math.PI * 0.1) * (1 - f3);
                this.camera.radius = this.camera.radius * f3 + (this.playCameraRadius) * (1 - f3);
                if (this.ball) {
                    this.ball.update(rawDT);
                }
                if (this.puzzle) {
                    this.puzzle.update(rawDT);
                }
            }
            else if (this.mode === GameMode.Menu) {
                rawDT = Math.min(rawDT, 1);
                let targetCameraPos = new BABYLON.Vector3(0.5 * (this.puzzle.xMin + this.puzzle.xMax), 0, 0.5 * (this.puzzle.zMin + this.puzzle.zMax));
                let f3 = Nabu.Easing.smoothNSec(1 / rawDT, 5);
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
    for (let i = 0; i <= 5; i++) {
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
                console.log(await response.text());
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
            console.log(await response.text());
        }
    };
}
function DEV_UPDATE_STATE_UI() {
    let devStateBtns = [];
    for (let i = 0; i <= 5; i++) {
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
        let tileData = await this.game.vertexDataLoader.getAtIndex("./datas/meshes/box.babylon");
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
                        this.tileState = TileState.Active;
                    }
                }
            }
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
class Puzzle {
    constructor(game) {
        this.game = game;
        this.data = {
            id: -1,
            title: "No Title",
            author: "No Author",
            content: ""
        };
        this.tiles = [];
        this.borders = [];
        this.buildings = [];
        this.w = 10;
        this.h = 10;
        this._pendingPublish = false;
        this.haikus = [];
        this.floor = new BABYLON.Mesh("floor");
        this.floor.material = this.game.floorMaterial;
        this.holeWall = new BABYLON.Mesh("hole-wall");
        this.holeWall.material = this.game.grayMaterial;
        this.puzzleUI = new PuzzleUI(this);
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
        return -0.55;
    }
    get xMax() {
        return this.w * 1.1 - 0.55;
    }
    get zMin() {
        return -0.55;
    }
    get zMax() {
        return this.h * 1.1 - 0.55;
    }
    win() {
        let score = Math.floor(this.game.ball.playTimer * 100);
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
            if (this.game.ball.ballState === BallState.Done) {
                this.game.stamp.play(this.puzzleUI.successPanel.querySelector(".stamp"));
                this.puzzleUI.win();
                if (!OFFLINE_MODE && (this.data.score === null || score < this.data.score)) {
                    this.puzzleUI.setHighscoreState(1);
                }
                else {
                    this.puzzleUI.setHighscoreState(0);
                }
            }
        }, 1000);
    }
    lose() {
        setTimeout(() => {
            if (this.game.ball.ballState === BallState.Done) {
                this.puzzleUI.lose();
            }
        }, 1000);
    }
    async submitHighscore() {
        if (this._pendingPublish) {
            return;
        }
        this._pendingPublish = true;
        let score = Math.round(this.game.ball.playTimer * 100);
        let puzzleId = this.data.id;
        let player = document.querySelector("#score-player-input").value;
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
    async reset() {
        if (this.data) {
            this.loadFromData(this.data);
            await this.instantiate();
        }
        this.puzzleUI.reset();
        document.querySelector("#puzzle-title stroke-text").setContent(this.data.title);
        document.querySelector("#puzzle-author stroke-text").setContent("created by " + this.data.author);
        this.game.fadeInIntro();
    }
    async loadFromFile(path) {
        let file = await fetch(path);
        let content = await file.text();
        this.loadFromData({
            id: null,
            title: "No Title",
            author: "No Author",
            content: content
        });
    }
    loadFromData(data) {
        while (this.tiles.length > 0) {
            this.tiles[0].dispose();
        }
        while (this.buildings.length > 0) {
            this.buildings[0].dispose();
        }
        while (this.haikus.length > 0) {
            this.haikus.pop().dispose();
        }
        this.data = data;
        DEV_UPDATE_STATE_UI();
        if (isFinite(data.id)) {
            this.game.bodyColorIndex = 5;
            this.game.bodyPatternIndex = Math.floor(Math.random() * 2);
        }
        console.log(this.data);
        let content = this.data.content;
        content = content.replaceAll("\r\n", "");
        content = content.replaceAll("\n", "");
        let lines = content.split("x");
        console.log(lines);
        let ballLine = lines.splice(0, 1)[0].split("u");
        this.game.ball.position.x = parseInt(ballLine[0]) * 1.1;
        this.game.ball.position.y = 0;
        this.game.ball.position.z = parseInt(ballLine[1]) * 1.1;
        this.game.ball.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.game.ball.trailPoints = [];
        this.game.ball.trailMesh.isVisible = false;
        if (ballLine.length > 2) {
            this.game.ball.setColor(parseInt(ballLine[2]));
        }
        else {
            this.game.ball.setColor(TileColor.North);
        }
        this.game.ball.ballState = BallState.Ready;
        this.game.setPlayTimer(0);
        this.game.ball.vZ = 1;
        this.h = lines.length;
        this.w = lines[0].length;
        console.log(this.w + " " + this.h);
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
                    let rock = new RockTile(this.game, {
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
                    let box = new Box(this.game, {
                        i: i,
                        j: j,
                        borderBottom: true,
                        borderRight: true,
                        borderLeft: true,
                        borderTop: true
                    });
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
    }
    saveAsText() {
        let lines = [];
        for (let j = 0; j < this.h; j++) {
            lines[j] = [];
            for (let i = 0; i < this.w; i++) {
                lines[j][i] = "o";
            }
        }
        this.tiles.forEach(tile => {
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
            else if (tile instanceof RockTile) {
                lines[j][i] = "r";
            }
            else if (tile instanceof WallTile) {
                lines[j][i] = "a";
            }
        });
        this.buildings.forEach(building => {
            let i = building.i;
            let j = building.j;
            if (building instanceof Box) {
                lines[j][i] = "B";
            }
            if (building instanceof Ramp) {
                lines[j][i] = "R";
            }
            if (building instanceof Bridge) {
                lines[j][i] = "U";
            }
        });
        lines.reverse();
        let lines2 = lines.map((l1) => { return l1.reduce((c1, c2) => { return c1 + c2; }); });
        lines2.splice(0, 0, this.game.ball.i.toFixed(0) + "u" + this.game.ball.j.toFixed(0) + "u" + this.game.ball.color.toFixed(0));
        return lines2.reduce((l1, l2) => { return l1 + "x" + l2; });
    }
    async instantiate() {
        this.regenerateHeightMap();
        for (let i = 0; i < this.tiles.length; i++) {
            let t = this.tiles[i];
            t.position.y = this.hMapGet(t.i, t.j);
        }
        for (let i = 0; i < this.tiles.length; i++) {
            await this.tiles[i].instantiate();
        }
        for (let i = 0; i < this.buildings.length; i++) {
            this.buildings[i].regenerateBorders();
            await this.buildings[i].instantiate();
        }
        this.rebuildFloor();
    }
    regenerateHeightMap() {
        this.heightMap = [];
        for (let i = 0; i < this.w; i++) {
            this.heightMap[i] = [];
            for (let j = 0; j < this.h; j++) {
                this.heightMap[i][j] = 0;
            }
        }
        this.buildings.forEach(building => {
            building.fillHeightmap();
        });
    }
    async editorRegenerateBuildings() {
        this.regenerateHeightMap();
        for (let i = 0; i < this.buildings.length; i++) {
            this.buildings[i].regenerateBorders();
            await this.buildings[i].instantiate();
        }
    }
    rebuildFloor() {
        if (this.border) {
            this.border.dispose();
        }
        this.border = new BABYLON.Mesh("border");
        let top = BABYLON.MeshBuilder.CreateBox("top", { width: this.xMax - this.xMin + 1, height: 0.2, depth: 0.5 });
        top.position.x = 0.5 * (this.xMin + this.xMax);
        top.position.y = 0.1;
        top.position.z = this.zMax + 0.25;
        top.material = this.game.blackMaterial;
        top.parent = this.border;
        let topPanel = BABYLON.MeshBuilder.CreateGround("top-panel", { width: this.xMax - this.xMin + 1, height: 5.5 });
        topPanel.position.x = 0.5 * (this.xMin + this.xMax);
        topPanel.position.y = -5.5 * 0.5;
        topPanel.position.z = this.zMax + 0.5;
        topPanel.rotation.x = Math.PI * 0.5;
        topPanel.material = this.game.blackMaterial;
        topPanel.parent = this.border;
        let right = BABYLON.MeshBuilder.CreateBox("right", { width: 0.5, height: 0.2, depth: this.zMax - this.zMin });
        right.position.x = this.xMax + 0.25;
        right.position.y = 0.1;
        right.position.z = 0.5 * (this.zMin + this.zMax);
        right.material = this.game.blackMaterial;
        right.parent = this.border;
        let rightPanel = BABYLON.MeshBuilder.CreateGround("right-panel", { width: 5.5, height: this.zMax - this.zMin + 1 });
        rightPanel.position.x = this.xMax + 0.5;
        rightPanel.position.y = -5.5 * 0.5;
        rightPanel.position.z = 0.5 * (this.zMin + this.zMax);
        rightPanel.rotation.z = -Math.PI * 0.5;
        rightPanel.material = this.game.blackMaterial;
        rightPanel.parent = this.border;
        let bottom = BABYLON.MeshBuilder.CreateBox("bottom", { width: this.xMax - this.xMin + 1, height: 0.2, depth: 0.5 });
        bottom.position.x = 0.5 * (this.xMin + this.xMax);
        bottom.position.y = 0.1;
        bottom.position.z = this.zMin - 0.25;
        bottom.material = this.game.blackMaterial;
        bottom.parent = this.border;
        let bottomPanel = BABYLON.MeshBuilder.CreateGround("bottom-panel", { width: this.xMax - this.xMin + 1, height: 5.5 });
        bottomPanel.position.x = 0.5 * (this.xMin + this.xMax);
        bottomPanel.position.y = -5.5 * 0.5;
        bottomPanel.position.z = this.zMin - 0.5;
        bottomPanel.rotation.x = -Math.PI * 0.5;
        bottomPanel.material = this.game.blackMaterial;
        bottomPanel.parent = this.border;
        let left = BABYLON.MeshBuilder.CreateBox("left", { width: 0.5, height: 0.2, depth: this.zMax - this.zMin });
        left.position.x = this.xMin - 0.25;
        left.position.y = 0.1;
        left.position.z = 0.5 * (this.zMin + this.zMax);
        left.material = this.game.blackMaterial;
        left.parent = this.border;
        let leftPanel = BABYLON.MeshBuilder.CreateGround("left-panel", { width: 5.5, height: this.zMax - this.zMin + 1 });
        leftPanel.position.x = this.xMin - 0.5;
        leftPanel.position.y = -5.5 * 0.5;
        leftPanel.position.z = 0.5 * (this.zMin + this.zMax);
        leftPanel.rotation.z = Math.PI * 0.5;
        leftPanel.material = this.game.blackMaterial;
        leftPanel.parent = this.border;
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
                    let tileData = BABYLON.CreateGroundVertexData({ width: 1.1, height: 1.1 });
                    Mummu.TranslateVertexDataInPlace(tileData, new BABYLON.Vector3(i * 1.1, 0, j * 1.1));
                    Mummu.ColorizeVertexDataInPlace(tileData, BABYLON.Color3.White());
                    floorDatas.push(tileData);
                }
            }
        }
        for (let n = 0; n < holes.length; n++) {
            let hole = holes[n];
            let i = hole.i;
            let j = hole.j;
            let left = holes.find(h => { return h.i === i - 1 && h.j === j; });
            if (!left) {
                let holeData = Mummu.CreateQuadVertexData({ width: 1.1, height: 5 });
                holeData.colors = [
                    0, 0, 0, 1,
                    0, 0, 0, 1,
                    1, 1, 1, 1,
                    1, 1, 1, 1
                ];
                Mummu.RotateVertexDataInPlace(holeData, BABYLON.Quaternion.FromEulerAngles(0, -Math.PI * 0.5, 0));
                Mummu.TranslateVertexDataInPlace(holeData, new BABYLON.Vector3((i - 0.5) * 1.1, -2.5, j * 1.1));
                holeDatas.push(holeData);
            }
            let right = holes.find(h => { return h.i === i + 1 && h.j === j; });
            if (!right) {
                let holeData = Mummu.CreateQuadVertexData({ width: 1.1, height: 5 });
                holeData.colors = [
                    0, 0, 0, 1,
                    0, 0, 0, 1,
                    1, 1, 1, 1,
                    1, 1, 1, 1
                ];
                Mummu.RotateVertexDataInPlace(holeData, BABYLON.Quaternion.FromEulerAngles(0, Math.PI * 0.5, 0));
                Mummu.TranslateVertexDataInPlace(holeData, new BABYLON.Vector3((i + 0.5) * 1.1, -2.5, j * 1.1));
                holeDatas.push(holeData);
            }
            let up = holes.find(h => { return h.i === i && h.j === j + 1; });
            if (!up) {
                let holeData = Mummu.CreateQuadVertexData({ width: 1.1, height: 5 });
                holeData.colors = [
                    0, 0, 0, 1,
                    0, 0, 0, 1,
                    1, 1, 1, 1,
                    1, 1, 1, 1
                ];
                Mummu.TranslateVertexDataInPlace(holeData, new BABYLON.Vector3(i * 1.1, -2.5, (j + 0.5) * 1.1));
                holeDatas.push(holeData);
            }
            let down = holes.find(h => { return h.i === i && h.j === j - 1; });
            if (!down) {
                let holeData = Mummu.CreateQuadVertexData({ width: 1.1, height: 5 });
                holeData.colors = [
                    0, 0, 0, 1,
                    0, 0, 0, 1,
                    1, 1, 1, 1,
                    1, 1, 1, 1
                ];
                Mummu.RotateVertexDataInPlace(holeData, BABYLON.Quaternion.FromEulerAngles(0, Math.PI, 0));
                Mummu.TranslateVertexDataInPlace(holeData, new BABYLON.Vector3(i * 1.1, -2.5, (j - 0.5) * 1.1));
                holeDatas.push(holeData);
            }
        }
        Mummu.MergeVertexDatas(...floorDatas).applyToMesh(this.floor);
        if (holeDatas.length > 0) {
            Mummu.MergeVertexDatas(...holeDatas).applyToMesh(this.holeWall);
            this.holeWall.isVisible = true;
        }
        else {
            this.holeWall.isVisible = false;
        }
    }
    update(dt) {
        let tiles = this.tiles.filter(t => {
            return t instanceof BlockTile && t.tileState === TileState.Active;
        });
        if (tiles.length === 0 && this.game.ball.ballState != BallState.Done) {
            this.game.ball.ballState = BallState.Done;
            this.win();
        }
        for (let i = 0; i < this.haikus.length; i++) {
            this.haikus[i].update(dt);
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
class PuzzleUI {
    constructor(puzzle) {
        this.puzzle = puzzle;
        this._inputUp = () => {
            if (this.successPanel.style.display === "") {
                if (this.hoveredElement === undefined) {
                    this.setHoveredElement(this.successNextButton);
                }
                else if (this.hoveredElement === this.successBackButton || this.hoveredElement === this.successNextButton) {
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
                else if (this.hoveredElement === this.successBackButton) {
                    this.setHoveredElement(this.successNextButton);
                }
                else if (this.hoveredElement === this.successNextButton) {
                    this.setHoveredElement(this.successBackButton);
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
                else if (this.hoveredElement === this.successBackButton || this.hoveredElement === this.successNextButton) {
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
        this.failMessage = document.querySelector("#success-score-fail-message");
        this.highscoreContainer = document.querySelector("#success-highscore-container");
        this.highscorePlayerLine = document.querySelector("#score-player-input").parentElement;
        this.scoreSubmitBtn = document.querySelector("#success-score-submit-btn");
        this.scorePendingBtn = document.querySelector("#success-score-pending-btn");
        this.scoreDoneBtn = document.querySelector("#success-score-done-btn");
        this.successReplayButton = document.querySelector("#success-replay-btn");
        this.successReplayButton.onclick = () => {
            this.puzzle.reset();
        };
        this.successBackButton = document.querySelector("#success-back-btn");
        this.successNextButton = document.querySelector("#success-next-btn");
        this.gameoverBackButton = document.querySelector("#gameover-back-btn");
        this.gameoverReplayButton = document.querySelector("#gameover-replay-btn");
        this.gameoverReplayButton.onclick = () => {
            this.puzzle.reset();
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
        if (this.game.uiInputManager.inControl) {
            this.setHoveredElement(this.successNextButton);
        }
    }
    lose() {
        this.successPanel.style.display = "none";
        this.gameoverPanel.style.display = "";
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
    }
    setHighscoreState(state) {
        this.failMessage.style.display = "none";
        if (state === 0) {
            // Not enough for Highscore
            this.highscoreContainer.style.display = "none";
        }
        else if (state === 1) {
            // Enough for Highscore, waiting for player action.
            this.highscoreContainer.style.display = "block";
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
/// <reference path="./Tile.ts"/>
class RockTile extends Tile {
    constructor(game, props) {
        super(game, props);
        this.color = props.color;
        this.material = this.game.brownMaterial;
        this.tileTop = new BABYLON.Mesh("tile-top");
        this.tileTop.parent = this;
        this.tileTop.material = this.game.whiteMaterial;
        this.rock = new BABYLON.Mesh("tile-top");
        this.rock.rotation.y = Math.random() * Math.PI * 2;
        this.rock.parent = this;
        this.rock.material = this.game.whiteMaterial;
    }
    async instantiate() {
        await super.instantiate();
        let tileData = await this.game.vertexDataLoader.get("./datas/meshes/rock-tile.babylon");
        tileData[0].applyToMesh(this);
        tileData[1].applyToMesh(this.tileTop);
        tileData[2].applyToMesh(this.rock);
    }
}
class WallTile extends Tile {
    constructor(game, props) {
        super(game, props);
        this.color = props.color;
        this.material = this.game.blackMaterial;
    }
    async instantiate() {
        await super.instantiate();
        let data = BABYLON.CreateBoxVertexData({ width: 1.1, height: 0.2, depth: 1.1 });
        Mummu.TranslateVertexDataInPlace(data, new BABYLON.Vector3(0, 0.1, 0));
        data.applyToMesh(this);
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
        this.style.position = "relative";
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
        this.tileFrame = new BABYLON.Mesh("tile-frame");
        this.tileFrame.parent = this;
        this.tileFrame.material = this.game.blackMaterial;
        this.tileTop = new BABYLON.Mesh("tile-top");
        this.tileTop.parent = this;
        this.tileTop.material = this.game.colorMaterials[this.color];
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
        console.log(min + " " + max);
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
