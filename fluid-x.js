class Ball extends BABYLON.Mesh {
    constructor(game, props) {
        super("ball");
        this.game = game;
        this.bounceVX = 0;
        this.vZ = 1;
        this.radius = 0.4;
        this.leftDown = false;
        this.rightDown = false;
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
        document.addEventListener("keydown", (ev) => {
            if (ev.code === "KeyA") {
                this.leftDown = true;
            }
            else if (ev.code === "KeyD") {
                this.rightDown = true;
            }
        });
        document.addEventListener("keyup", (ev) => {
            if (ev.code === "KeyA") {
                this.leftDown = false;
            }
            else if (ev.code === "KeyD") {
                this.rightDown = false;
            }
        });
    }
    setColor(color) {
        this.color = color;
        if (this.ballTop) {
            this.ballTop.material = this.game.colorMaterials[this.color];
        }
    }
    async instantiate() {
        let ballDatas = await this.game.vertexDataLoader.get("./datas/meshes/ball.babylon");
        ballDatas[0].applyToMesh(this);
        ballDatas[1].applyToMesh(this.ballTop);
    }
    update() {
        let vX = 0;
        if (Math.abs(this.bounceVX) > 0.01) {
            vX = this.bounceVX;
            if (this.bounceVX < 0 && this.leftDown) {
                vX = -1;
            }
            else if (this.bounceVX > 0 && this.rightDown) {
                vX = 1;
            }
            this.bounceVX -= Math.sign(this.bounceVX) * 0.015;
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
        speed.normalize().scaleInPlace(1);
        this.position.addInPlace(speed.scale(1 / 60));
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
        let impact = BABYLON.Vector3.Zero();
        for (let i = 0; i < this.game.terrain.borders.length; i++) {
            let border = this.game.terrain.borders[i];
            if (border.collide(this, impact)) {
                let dir = this.position.subtract(impact);
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
        for (let i = 0; i < this.game.terrain.tiles.length; i++) {
            let tile = this.game.terrain.tiles[i];
            if (tile.collide(this, impact)) {
                let dir = this.position.subtract(impact);
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
                if (tile instanceof SwitchTile) {
                    tile.bump();
                    this.setColor(tile.color);
                }
                else {
                    if (tile.color === this.color) {
                        tile.dispose();
                    }
                }
                break;
            }
        }
        let ray = new BABYLON.Ray(this.position.add(new BABYLON.Vector3(0, 0.3, 0)), new BABYLON.Vector3(0, -1, 0));
        let hit = this.game.scene.pickWithRay(ray, (mesh) => {
            return mesh.name === "floor" || mesh.name === "building-floor";
        });
        if (hit.hit) {
            this.position.y = hit.pickedPoint.y;
            let q = Mummu.QuaternionFromYZAxis(hit.getNormal(true), BABYLON.Axis.Z);
            BABYLON.Quaternion.SlerpToRef(this.rotationQuaternion, q, 0.1, this.rotationQuaternion);
        }
    }
}
class Tile extends BABYLON.Mesh {
    constructor(game, props) {
        super("tile");
        this.game = game;
        this.animateSize = Mummu.AnimationFactory.EmptyNumberCallback;
        this.color = props.color;
        if (isFinite(props.i)) {
            this.position.x = props.i * 1.1;
        }
        if (isFinite(props.j)) {
            this.position.z = props.j * 1.1;
        }
        if (isFinite(props.h)) {
            this.position.y = props.h;
        }
        this.shadow = new BABYLON.Mesh("shadow");
        this.shadow.position.x = -0.015;
        this.shadow.position.y = 0.01;
        this.shadow.position.z = -0.015;
        this.shadow.parent = this;
        this.shadow.material = this.game.shadowMaterial;
        this.animateSize = Mummu.AnimationFactory.CreateNumber(this, this, "size");
    }
    get size() {
        return this.scaling.x;
    }
    set size(s) {
        this.scaling.copyFromFloats(s, s, s);
    }
    async instantiate() {
        let index = this.game.terrain.tiles.indexOf(this);
        if (index === -1) {
            this.game.terrain.tiles.push(this);
        }
        let m = 0.05;
        let shadowData = Mummu.Create9SliceVertexData({
            width: 1 + 2 * m,
            height: 1 + 2 * m,
            margin: m
        });
        Mummu.RotateVertexDataInPlace(shadowData, BABYLON.Quaternion.FromEulerAngles(Math.PI * 0.5, 0, 0));
        shadowData.applyToMesh(this.shadow);
    }
    async bump() {
        await this.animateSize(1.1, 0.1);
        await this.animateSize(1, 0.1);
    }
    dispose() {
        let index = this.game.terrain.tiles.indexOf(this);
        if (index != -1) {
            this.game.terrain.tiles.splice(index, 1);
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
    constructor(game, ghost = true) {
        super("tile");
        this.game = game;
        this.ghost = ghost;
        this.w = 0.1;
        this.d = 1;
        this.material = this.game.blackMaterial;
    }
    get vertical() {
        return this.rotation.y === 0;
    }
    set vertical(v) {
        this.rotation.y = v ? 0 : Math.PI * 0.5;
        this.w = v ? 0.1 : 1;
        this.d = v ? 1 : 0.1;
    }
    async instantiate() {
        let index = this.game.terrain.borders.indexOf(this);
        if (index === -1) {
            this.game.terrain.borders.push(this);
        }
        if (!this.ghost) {
            let data = BABYLON.CreateBoxVertexData({ width: 0.1, height: 0.3, depth: 1.2 });
            Mummu.TranslateVertexDataInPlace(data, new BABYLON.Vector3(0, 0.15, 0));
            data.applyToMesh(this);
        }
    }
    dispose() {
        let index = this.game.terrain.borders.indexOf(this);
        if (index != -1) {
            this.game.terrain.borders.splice(index, 1);
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
        let dx = ball.position.x - Nabu.MinMax(ball.position.x, this.position.x - this.w, this.position.x + this.w);
        let dz = ball.position.z - Nabu.MinMax(ball.position.z, this.position.z - this.d, this.position.z + this.d);
        let dd = dx * dx + dz * dz;
        if (dd < ball.radius * ball.radius) {
            impact.x = Nabu.MinMax(ball.position.x, this.position.x - this.w, this.position.x + this.w);
            impact.y = ball.position.y;
            impact.z = Nabu.MinMax(ball.position.z, this.position.z - this.d, this.position.z + this.d);
            return true;
        }
        return false;
    }
}
class Build extends BABYLON.Mesh {
    constructor(game, boxProps) {
        super("tile");
        this.game = game;
        this.boxProps = boxProps;
        this.borders = [];
        if (isFinite(boxProps.i)) {
            this.position.x = boxProps.i * 1.1;
        }
        if (isFinite(boxProps.j)) {
            this.position.z = boxProps.j * 1.1;
        }
        this.floor = new BABYLON.Mesh("building-floor");
        this.floor.parent = this;
        this.floor.material = this.game.darkFloorMaterial;
        this.shadow = new BABYLON.Mesh("shadow");
        this.shadow.position.y = 0.01;
        this.shadow.parent = this;
        this.shadow.material = this.game.shadowMaterial;
    }
    async instantiate() { }
    async bump() {
    }
    dispose() {
        let index = this.game.terrain.build.indexOf(this);
        if (index != -1) {
            this.game.terrain.build.splice(index, 1);
        }
        super.dispose();
    }
}
class Ramp extends Build {
    constructor(game, props) {
        super(game, props);
        let border = new Border(this.game, true);
        border.position.copyFrom(this.position);
        border.position.x -= 0.5 * 1.1;
        border.position.y += 0.5;
        this.borders.push(border);
        border = new Border(this.game, true);
        border.position.copyFrom(this.position);
        border.position.x += 1.5 * 1.1;
        border.position.y += 0.5;
        this.borders.push(border);
        border = new Border(this.game, true);
        border.position.copyFrom(this.position);
        border.position.x -= 0.5 * 1.1;
        border.position.y += 0.5;
        border.position.z += 1.1;
        this.borders.push(border);
        border = new Border(this.game, true);
        border.position.copyFrom(this.position);
        border.position.x += 1.5 * 1.1;
        border.position.y += 0.5;
        border.position.z += 1.1;
        this.borders.push(border);
        border = new Border(this.game, true);
        border.position.copyFrom(this.position);
        border.position.x -= 0.5 * 1.1;
        border.position.y += 0.5;
        border.position.z += 2 * 1.1;
        this.borders.push(border);
        border = new Border(this.game, true);
        border.position.copyFrom(this.position);
        border.position.x += 1.5 * 1.1;
        border.position.y += 0.5;
        border.position.z += 2 * 1.1;
        this.borders.push(border);
        border = new Border(this.game, true);
        border.vertical = false;
        border.position.copyFrom(this.position);
        border.position.z += 2.5 * 1.1;
        this.borders.push(border);
        border = new Border(this.game, true);
        border.vertical = false;
        border.position.copyFrom(this.position);
        border.position.x += 1 * 1.1;
        border.position.z += 2.5 * 1.1;
        this.borders.push(border);
        this.scaling.copyFromFloats(1.1, 1, 1.1);
        this.material = this.game.salmonMaterial;
        this.builtInBorder = new BABYLON.Mesh("ramp-border");
        this.builtInBorder.parent = this;
        this.builtInBorder.material = this.game.blackMaterial;
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
    constructor(game, boxProps) {
        super(game, boxProps);
        this.boxProps = boxProps;
        let border = new Border(this.game, true);
        border.position.copyFrom(this.position);
        border.position.x -= 0.5 * 1.1;
        this.borders.push(border);
        border = new Border(this.game, true);
        border.position.copyFrom(this.position);
        border.position.x -= 0.5 * 1.1;
        border.position.z += 1.1;
        this.borders.push(border);
        if (boxProps.borderLeft) {
            border = new Border(this.game, false);
            border.position.copyFrom(this.position);
            border.position.x -= 0.5 * 1.1;
            border.position.y += 1;
            this.borders.push(border);
            border = new Border(this.game, false);
            border.position.copyFrom(this.position);
            border.position.x -= 0.5 * 1.1;
            border.position.y += 1;
            border.position.z += 1.1;
            this.borders.push(border);
        }
        border = new Border(this.game, true);
        border.position.copyFrom(this.position);
        border.position.x += 1.5 * 1.1;
        this.borders.push(border);
        border = new Border(this.game, true);
        border.position.copyFrom(this.position);
        border.position.x += 1.5 * 1.1;
        border.position.z += 1.1;
        this.borders.push(border);
        if (boxProps.borderRight) {
            border = new Border(this.game, false);
            border.position.copyFrom(this.position);
            border.position.x += 1.5 * 1.1;
            border.position.y += 1;
            this.borders.push(border);
            border = new Border(this.game, false);
            border.position.copyFrom(this.position);
            border.position.x += 1.5 * 1.1;
            border.position.y += 1;
            border.position.z += 1.1;
            this.borders.push(border);
        }
        border = new Border(this.game, true);
        border.vertical = false;
        border.position.copyFrom(this.position);
        border.position.z -= 0.5 * 1.1;
        this.borders.push(border);
        border = new Border(this.game, true);
        border.vertical = false;
        border.position.copyFrom(this.position);
        border.position.x += 1 * 1.1;
        border.position.z -= 0.5 * 1.1;
        this.borders.push(border);
        if (boxProps.borderBottom) {
            border = new Border(this.game, false);
            border.vertical = false;
            border.position.copyFrom(this.position);
            border.position.y += 1;
            border.position.z -= 0.5 * 1.1;
            this.borders.push(border);
            border = new Border(this.game, false);
            border.vertical = false;
            border.position.copyFrom(this.position);
            border.position.x += 1 * 1.1;
            border.position.y += 1;
            border.position.z -= 0.5 * 1.1;
            this.borders.push(border);
        }
        border = new Border(this.game, true);
        border.vertical = false;
        border.position.copyFrom(this.position);
        border.position.z += 1.5 * 1.1;
        this.borders.push(border);
        border = new Border(this.game, true);
        border.vertical = false;
        border.position.copyFrom(this.position);
        border.position.x += 1 * 1.1;
        border.position.z += 1.5 * 1.1;
        this.borders.push(border);
        if (boxProps.borderTop) {
            border = new Border(this.game, false);
            border.vertical = false;
            border.position.copyFrom(this.position);
            border.position.z += 1.5 * 1.1;
            border.position.y += 1;
            this.borders.push(border);
            border = new Border(this.game, false);
            border.vertical = false;
            border.position.copyFrom(this.position);
            border.position.x += 1 * 1.1;
            border.position.y += 1;
            border.position.z += 1.5 * 1.1;
            this.borders.push(border);
        }
        this.scaling.copyFromFloats(1.1, 1, 1.1);
        this.material = this.game.salmonMaterial;
    }
    async instantiate() {
        for (let i = 0; i < this.borders.length; i++) {
            await this.borders[i].instantiate();
        }
        let data = await this.game.vertexDataLoader.get("./datas/meshes/building.babylon");
        data[6].applyToMesh(this);
        data[7].applyToMesh(this.floor);
        let m = 0.2;
        let shadowData = Mummu.Create9SliceVertexData({
            width: 2 + 2 * m,
            height: 2 + 2 * m,
            margin: m,
            cutTop: this.boxProps.borderTop ? false : true,
            cutRight: this.boxProps.borderRight ? false : true,
            cutBottom: this.boxProps.borderBottom ? false : true,
            cutLeft: this.boxProps.borderLeft ? false : true,
        });
        Mummu.RotateVertexDataInPlace(shadowData, BABYLON.Quaternion.FromEulerAngles(Math.PI * 0.5, 0, 0));
        Mummu.TranslateVertexDataInPlace(shadowData, new BABYLON.Vector3(0.5, 0, 0.5));
        shadowData.applyToMesh(this.shadow);
    }
}
class Bridge extends Build {
    constructor(game, props) {
        super(game, props);
        let border = new Border(this.game, true);
        border.position.copyFrom(this.position);
        border.position.x += 0.5 * 1.1;
        this.borders.push(border);
        border = new Border(this.game, true);
        border.position.copyFrom(this.position);
        border.position.x += 0.5 * 1.1;
        border.position.z += 1.1;
        this.borders.push(border);
        border = new Border(this.game, true);
        border.position.copyFrom(this.position);
        border.position.x += 2.5 * 1.1;
        this.borders.push(border);
        border = new Border(this.game, true);
        border.position.copyFrom(this.position);
        border.position.x += 2.5 * 1.1;
        border.position.z += 1.1;
        this.borders.push(border);
        border = new Border(this.game, true);
        border.vertical = false;
        border.position.copyFrom(this.position);
        border.position.z -= 0.5 * 1.1;
        this.borders.push(border);
        border = new Border(this.game, true);
        border.vertical = false;
        border.position.copyFrom(this.position);
        border.position.z += 1.5 * 1.1;
        this.borders.push(border);
        border = new Border(this.game, true);
        border.vertical = false;
        border.position.copyFrom(this.position);
        border.position.x += 3 * 1.1;
        border.position.z -= 0.5 * 1.1;
        this.borders.push(border);
        border = new Border(this.game, true);
        border.vertical = false;
        border.position.copyFrom(this.position);
        border.position.x += 3 * 1.1;
        border.position.z += 1.5 * 1.1;
        this.borders.push(border);
        if (props.borderTop) {
            border = new Border(this.game, false);
            border.vertical = false;
            border.position.copyFrom(this.position);
            border.position.y += 1;
            border.position.z += 1.5 * 1.1;
            this.borders.push(border);
            border = new Border(this.game, false);
            border.vertical = false;
            border.position.copyFrom(this.position);
            border.position.x += 1 * 1.1;
            border.position.y += 1;
            border.position.z += 1.5 * 1.1;
            this.borders.push(border);
            border = new Border(this.game, false);
            border.vertical = false;
            border.position.copyFrom(this.position);
            border.position.x += 2 * 1.1;
            border.position.y += 1;
            border.position.z += 1.5 * 1.1;
            this.borders.push(border);
            border = new Border(this.game, false);
            border.vertical = false;
            border.position.copyFrom(this.position);
            border.position.x += 3 * 1.1;
            border.position.y += 1;
            border.position.z += 1.5 * 1.1;
            this.borders.push(border);
        }
        if (props.borderBottom) {
            border = new Border(this.game, false);
            border.vertical = false;
            border.position.copyFrom(this.position);
            border.position.y += 1;
            border.position.z -= 0.5 * 1.1;
            this.borders.push(border);
            border = new Border(this.game, false);
            border.vertical = false;
            border.position.copyFrom(this.position);
            border.position.x += 1 * 1.1;
            border.position.y += 1;
            border.position.z -= 0.5 * 1.1;
            this.borders.push(border);
            border = new Border(this.game, false);
            border.vertical = false;
            border.position.copyFrom(this.position);
            border.position.x += 2 * 1.1;
            border.position.y += 1;
            border.position.z -= 0.5 * 1.1;
            this.borders.push(border);
            border = new Border(this.game, false);
            border.vertical = false;
            border.position.copyFrom(this.position);
            border.position.x += 3 * 1.1;
            border.position.y += 1;
            border.position.z -= 0.5 * 1.1;
            this.borders.push(border);
        }
        this.scaling.copyFromFloats(1.1, 1, 1.1);
        this.material = this.game.salmonMaterial;
        this.builtInBorder = new BABYLON.Mesh("ramp-border");
        this.builtInBorder.parent = this;
        this.builtInBorder.material = this.game.blackMaterial;
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
            cutRight: true,
            cutLeft: true,
        });
        Mummu.RotateVertexDataInPlace(shadowData, BABYLON.Quaternion.FromEulerAngles(Math.PI * 0.5, 0, 0));
        Mummu.TranslateVertexDataInPlace(shadowData, new BABYLON.Vector3(1.5, 0, 0.5));
        shadowData.applyToMesh(this.shadow);
    }
}
/// <reference path="../lib/nabu/nabu.d.ts"/>
/// <reference path="../lib/mummu/mummu.d.ts"/>
/// <reference path="../lib/babylon.d.ts"/>
var MRS_VERSION = 3;
var MRS_VERSION2 = 3;
var MRS_VERSION3 = 8;
var VERSION = MRS_VERSION * 1000 + MRS_VERSION2 * 100 + MRS_VERSION3;
var CONFIGURATION_VERSION = MRS_VERSION * 1000 + MRS_VERSION2 * 100 + MRS_VERSION3;
var observed_progress_speed_percent_second;
var PlayerHasInteracted = false;
var IsTouchScreen = -1;
var IsMobile = -1;
var HasLocalStorage = false;
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
    console.log("onFirstPlayerInteractionTouch");
    ev.stopPropagation();
    PlayerHasInteracted = true;
    document.body.removeEventListener("touchstart", onFirstPlayerInteractionTouch);
    document.body.removeEventListener("click", onFirstPlayerInteractionClic);
    document.body.removeEventListener("keydown", onFirstPlayerInteractionKeyboard);
    //Game.Instance.showGraphicAutoUpdateAlert("Touch");
    document.getElementById("click-anywhere-screen").style.display = "none";
    Game.Instance.onResize();
    IsTouchScreen = 1;
    IsMobile = /(?:phone|windows\s+phone|ipod|blackberry|(?:android|bb\d+|meego|silk|googlebot) .+? mobile|palm|windows\s+ce|opera\smini|avantgo|mobilesafari|docomo)/i.test(navigator.userAgent) ? 1 : 0;
    if (IsMobile === 1) {
        document.body.classList.add("mobile");
    }
};
let onFirstPlayerInteractionClic = (ev) => {
    console.log("onFirstPlayerInteractionClic");
    ev.stopPropagation();
    PlayerHasInteracted = true;
    document.body.removeEventListener("touchstart", onFirstPlayerInteractionTouch);
    document.body.removeEventListener("click", onFirstPlayerInteractionClic);
    document.body.removeEventListener("keydown", onFirstPlayerInteractionKeyboard);
    //Game.Instance.showGraphicAutoUpdateAlert("Clic");
    document.getElementById("click-anywhere-screen").style.display = "none";
    Game.Instance.onResize();
    IsTouchScreen = 0;
    IsMobile = /(?:phone|windows\s+phone|ipod|blackberry|(?:android|bb\d+|meego|silk|googlebot) .+? mobile|palm|windows\s+ce|opera\smini|avantgo|mobilesafari|docomo)/i.test(navigator.userAgent) ? 1 : 0;
    if (IsMobile === 1) {
        document.body.classList.add("mobile");
    }
};
let onFirstPlayerInteractionKeyboard = (ev) => {
    console.log("onFirstPlayerInteractionKeyboard");
    ev.stopPropagation();
    PlayerHasInteracted = true;
    document.body.removeEventListener("touchstart", onFirstPlayerInteractionTouch);
    document.body.removeEventListener("click", onFirstPlayerInteractionClic);
    document.body.removeEventListener("keydown", onFirstPlayerInteractionKeyboard);
    //Game.Instance.showGraphicAutoUpdateAlert("Keyboard");
    document.getElementById("click-anywhere-screen").style.display = "none";
    Game.Instance.onResize();
    IsTouchScreen = 0;
    IsMobile = /(?:phone|windows\s+phone|ipod|blackberry|(?:android|bb\d+|meego|silk|googlebot) .+? mobile|palm|windows\s+ce|opera\smini|avantgo|mobilesafari|docomo)/i.test(navigator.userAgent) ? 1 : 0;
    if (IsMobile === 1) {
        document.body.classList.add("mobile");
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
class Game {
    constructor(canvasElement) {
        this.DEBUG_MODE = true;
        this.DEBUG_USE_LOCAL_STORAGE = true;
        this.screenRatio = 1;
        this.cameraOrtho = false;
        this.onResize = () => {
            this.screenRatio = window.innerWidth / window.innerHeight;
            if (this.screenRatio < 1) {
                document.body.classList.add("vertical");
            }
            else {
                document.body.classList.remove("vertical");
            }
            this.engine.resize();
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
        Game.Instance = this;
        this.canvas = document.getElementById(canvasElement);
        this.canvas.requestPointerLock = this.canvas.requestPointerLock || this.canvas.msRequestPointerLock || this.canvas.mozRequestPointerLock || this.canvas.webkitRequestPointerLock;
        this.canvasCurtain = document.getElementById("canvas-curtain");
        this.engine = new BABYLON.Engine(this.canvas, true, undefined, false);
        BABYLON.Engine.ShadersRepository = "./shaders/";
        BABYLON.Engine.audioEngine.useCustomUnlockedButton = true;
        window.addEventListener("click", () => {
            if (!BABYLON.Engine.audioEngine.unlocked) {
                BABYLON.Engine.audioEngine.unlock();
            }
        }, { once: true });
    }
    getScene() {
        return this.scene;
    }
    async createScene() {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = BABYLON.Color4.FromHexString("#A1CFDBFF");
        this.vertexDataLoader = new Mummu.VertexDataLoader(this.scene);
        this.screenRatio = window.innerWidth / window.innerHeight;
        if (this.screenRatio < 1) {
            document.body.classList.add("vertical");
        }
        else {
            document.body.classList.remove("vertical");
        }
        this.light = new BABYLON.HemisphericLight("light", (new BABYLON.Vector3(2, 4, 3)).normalize(), this.scene);
        this.light.groundColor.copyFromFloats(0.3, 0.3, 0.3);
        this.camera = new BABYLON.FreeCamera("camera", BABYLON.Vector3.Zero());
        this.camera.rotation.x = Math.atan(15 / 5);
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
        this.shadowMaterial = new BABYLON.StandardMaterial("shadow-material");
        this.shadowMaterial.diffuseColor.copyFromFloats(0.1, 0.1, 0.1);
        this.shadowMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/shadow-9.png");
        this.shadowMaterial.diffuseTexture.hasAlpha = true;
        this.shadowMaterial.useAlphaFromDiffuseTexture = true;
        this.shadowMaterial.alpha = 0.4;
        this.shadowMaterial.specularColor.copyFromFloats(0, 0, 0);
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
        this.blackMaterial = new BABYLON.StandardMaterial("black-material");
        this.blackMaterial.diffuseColor = BABYLON.Color3.FromHexString("#2b2821");
        this.blackMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.terrain = new Terrain(this);
        await this.terrain.instantiate();
        for (let i = 0; i <= 10; i++) {
            let tile = new BlockTile(this, {
                color: Math.floor(Math.random() * 4),
                i: i,
                j: 10
            });
            await tile.instantiate();
        }
        let tile = new BlockTile(this, {
            color: Math.floor(Math.random() * 4),
            i: 0,
            j: 0
        });
        await tile.instantiate();
        let tileA = new BlockTile(this, {
            color: Math.floor(Math.random() * 4),
            i: 4,
            j: 9
        });
        await tileA.instantiate();
        let tileB = new BlockTile(this, {
            color: Math.floor(Math.random() * 4),
            i: 6,
            j: 9
        });
        await tileB.instantiate();
        let tileC = new BlockTile(this, {
            color: Math.floor(Math.random() * 4),
            i: 4,
            j: 8
        });
        await tileC.instantiate();
        let tileD = new BlockTile(this, {
            color: Math.floor(Math.random() * 4),
            i: 6,
            j: 8
        });
        await tileD.instantiate();
        let tileE = new BlockTile(this, {
            color: Math.floor(Math.random() * 4),
            i: 4,
            j: 7
        });
        await tileE.instantiate();
        let tileF = new BlockTile(this, {
            color: Math.floor(Math.random() * 4),
            i: 6,
            j: 7
        });
        await tileF.instantiate();
        let switchNorth = new SwitchTile(this, {
            color: TileColor.North,
            i: 8,
            j: 7,
            h: 1
        });
        await switchNorth.instantiate();
        let switchEast = new SwitchTile(this, {
            color: TileColor.East,
            i: 12,
            j: 7,
            h: 1
        });
        await switchEast.instantiate();
        let switchSouth = new SwitchTile(this, {
            color: TileColor.South,
            i: 8,
            j: 0,
            h: 0
        });
        await switchSouth.instantiate();
        let switchWest = new SwitchTile(this, {
            color: TileColor.West,
            i: 1,
            j: 5,
            h: 0
        });
        await switchWest.instantiate();
        let ramp0 = new Ramp(this, {
            i: 3,
            j: 3
        });
        await ramp0.instantiate();
        let ramp = new Ramp(this, {
            i: 8,
            j: 3
        });
        await ramp.instantiate();
        let box = new Box(this, {
            i: 8,
            j: 6,
            borderLeft: true,
            borderTop: true
        });
        await box.instantiate();
        let box2 = new Box(this, {
            i: 10,
            j: 6,
            borderBottom: true,
            borderTop: true
        });
        await box2.instantiate();
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
        this.ball = new Ball(this, { color: TileColor.North });
        await this.ball.instantiate();
        this.ball.position.x = 5;
        this.ball.position.z = 5;
        this.canvas.addEventListener("pointerdown", this.onPointerDown);
        this.canvas.addEventListener("pointerup", this.onPointerUp);
        this.canvas.addEventListener("wheel", this.onWheelEvent);
        document.body.addEventListener("touchstart", onFirstPlayerInteractionTouch);
        document.body.addEventListener("click", onFirstPlayerInteractionClic);
        document.body.addEventListener("keydown", onFirstPlayerInteractionKeyboard);
        document.getElementById("click-anywhere-screen").style.display = "none";
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
    update() {
        let rawDT = this.scene.deltaTime / 1000;
        let targetCameraPos = this.ball.position.clone();
        targetCameraPos.x = Nabu.MinMax(targetCameraPos.x, this.terrain.xMin + 4.5, this.terrain.xMax - 4.5);
        targetCameraPos.z = Nabu.MinMax(targetCameraPos.z, this.terrain.zMin + 4.5, this.terrain.zMax - 4.5);
        targetCameraPos.y += 15;
        targetCameraPos.z -= 5;
        BABYLON.Vector3.LerpToRef(this.camera.position, targetCameraPos, 0.005, this.camera.position);
        if (this.ball) {
            this.ball.update();
        }
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
    createAndInit();
});
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
class Terrain {
    constructor(game) {
        this.game = game;
        this.tiles = [];
        this.borders = [];
        this.build = [];
        this.w = 20;
        this.h = 10;
    }
    get xMin() {
        return -0.55;
    }
    get xMax() {
        return this.w * 1.1 + 0.55;
    }
    get zMin() {
        return -0.55;
    }
    get zMax() {
        return this.h * 1.1 + 0.55;
    }
    async instantiate() {
        this.border = new BABYLON.Mesh("border");
        let floor = Mummu.CreateQuad("floor", { width: this.xMax - this.xMin, height: this.zMax - this.xMin, uvInWorldSpace: true, uvSize: 1.1 });
        floor.position.x = 0.5 * (this.xMin + this.xMax);
        floor.position.z = 0.5 * (this.zMin + this.zMax);
        floor.rotation.x = Math.PI * 0.5;
        floor.material = this.game.floorMaterial;
        let top = BABYLON.MeshBuilder.CreateBox("top", { width: this.xMax - this.xMin + 1, height: 0.2, depth: 0.5 });
        top.position.x = 0.5 * (this.xMin + this.xMax);
        top.position.y = 0.1;
        top.position.z = this.zMax + 0.25;
        top.material = this.game.blackMaterial;
        let right = BABYLON.MeshBuilder.CreateBox("right", { width: 0.5, height: 0.2, depth: this.zMax - this.zMin });
        right.position.x = this.xMax + 0.25;
        right.position.y = 0.1;
        right.position.z = 0.5 * (this.zMin + this.zMax);
        right.material = this.game.blackMaterial;
        let bottom = BABYLON.MeshBuilder.CreateBox("bottom", { width: this.xMax - this.xMin + 1, height: 0.2, depth: 0.5 });
        bottom.position.x = 0.5 * (this.xMin + this.xMax);
        bottom.position.y = 0.1;
        bottom.position.z = this.zMin - 0.25;
        bottom.material = this.game.blackMaterial;
        let left = BABYLON.MeshBuilder.CreateBox("left", { width: 0.5, height: 0.2, depth: this.zMax - this.zMin });
        left.position.x = this.xMin - 0.25;
        left.position.y = 0.1;
        left.position.z = 0.5 * (this.zMin + this.zMax);
        left.material = this.game.blackMaterial;
    }
}
