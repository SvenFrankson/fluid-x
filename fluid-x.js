class Ball extends BABYLON.Mesh {
    constructor(game, props) {
        super("ball");
        this.game = game;
        this.bounceVX = 0;
        this.vZ = 1;
        this.radius = 0.4;
        this.leftDown = false;
        this.rightDown = false;
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
var CameraMode;
(function (CameraMode) {
    CameraMode[CameraMode["Dev"] = 0] = "Dev";
    CameraMode[CameraMode["None"] = 1] = "None";
    CameraMode[CameraMode["Ball"] = 2] = "Ball";
    CameraMode[CameraMode["Landscape"] = 3] = "Landscape";
    CameraMode[CameraMode["Selected"] = 4] = "Selected";
    CameraMode[CameraMode["Focusing"] = 5] = "Focusing";
    CameraMode[CameraMode["FocusingSelected"] = 6] = "FocusingSelected";
    CameraMode[CameraMode["Transition"] = 7] = "Transition";
    CameraMode[CameraMode["Movie"] = 8] = "Movie";
    CameraMode[CameraMode["MovieIdle"] = 9] = "MovieIdle";
    CameraMode[CameraMode["FirstPersonBall"] = 10] = "FirstPersonBall";
    CameraMode[CameraMode["SideViewBall"] = 11] = "SideViewBall";
})(CameraMode || (CameraMode = {}));
class Game {
    constructor(canvasElement) {
        this.DEBUG_MODE = true;
        this.DEBUG_USE_LOCAL_STORAGE = true;
        this.screenRatio = 1;
        this.cameraOrtho = false;
        this.tiles = [];
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
        this.arcCamera = new BABYLON.ArcRotateCamera("camera", -Math.PI * 0.5, 0.1, 20, new BABYLON.Vector3(5, 0, 5));
        this.arcCamera.wheelPrecision *= 10;
        this.arcCamera.lowerRadiusLimit = 1;
        this.arcCamera.upperRadiusLimit = 200;
        this.arcCamera.upperBetaLimit = Math.PI * 0.5;
        this.terrain = new Terrain(this);
        await this.terrain.instantiate();
        for (let i = 0; i <= 10; i++) {
            let tile = new Tile(this, {
                color: Math.floor(Math.random() * 4),
                i: i,
                j: 10
            });
            this.tiles.push(tile);
            await tile.instantiate();
        }
        let tile = new Tile(this, {
            color: Math.floor(Math.random() * 4),
            i: 0,
            j: 0
        });
        this.tiles.push(tile);
        await tile.instantiate();
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
        if (this.ball) {
            this.ball.update();
        }
    }
    getCameraMinFOV() {
        let ratio = this.engine.getRenderWidth() / this.engine.getRenderHeight();
        let fov = this.arcCamera.fov;
        if (ratio > 1) {
            return fov;
        }
        return fov * ratio;
    }
    getCameraHorizontalFOV() {
        return 2 * Math.atan(this.screenRatio * Math.tan(this.arcCamera.fov / 2));
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
class Terrain {
    constructor(game) {
        this.game = game;
        this.w = 10;
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
        let top = BABYLON.MeshBuilder.CreateBox("top", { width: this.xMax - this.xMin + 1, height: 0.2, depth: 0.5 });
        top.position.x = 0.5 * (this.xMin + this.xMax);
        top.position.y = 0.1;
        top.position.z = this.zMax + 0.25;
        let right = BABYLON.MeshBuilder.CreateBox("right", { width: 0.5, height: 0.2, depth: this.zMax - this.zMin });
        right.position.x = this.xMax + 0.25;
        right.position.y = 0.1;
        right.position.z = 0.5 * (this.zMin + this.zMax);
        let bottom = BABYLON.MeshBuilder.CreateBox("bottom", { width: this.xMax - this.xMin + 1, height: 0.2, depth: 0.5 });
        bottom.position.x = 0.5 * (this.xMin + this.xMax);
        bottom.position.y = 0.1;
        bottom.position.z = this.zMin - 0.25;
        let left = BABYLON.MeshBuilder.CreateBox("left", { width: 0.5, height: 0.2, depth: this.zMax - this.zMin });
        left.position.x = this.xMin - 0.25;
        left.position.y = 0.1;
        left.position.z = 0.5 * (this.zMin + this.zMax);
    }
}
var TileColor;
(function (TileColor) {
    TileColor[TileColor["North"] = 0] = "North";
    TileColor[TileColor["East"] = 1] = "East";
    TileColor[TileColor["South"] = 2] = "South";
    TileColor[TileColor["West"] = 3] = "West";
})(TileColor || (TileColor = {}));
class Tile extends BABYLON.Mesh {
    constructor(game, props) {
        super("tile");
        this.game = game;
        this.color = props.color;
        if (isFinite(props.i)) {
            this.position.x = props.i * 1.1;
        }
        if (isFinite(props.j)) {
            this.position.z = props.j * 1.1;
        }
        this.tileTop = new BABYLON.Mesh("tile-top");
        this.tileTop.parent = this;
        this.tileTop.position.y = 0.3;
        let boxMaterial = new BABYLON.StandardMaterial("box-material");
        boxMaterial.diffuseColor = BABYLON.Color3.FromHexString("#e3cfb4");
        boxMaterial.specularColor.copyFromFloats(0, 0, 0);
        //boxMaterial.emissiveColor.copyFromFloats(0.1, 0.1, 0.1);
        this.material = boxMaterial;
        let tileTopMaterial = new BABYLON.StandardMaterial("tiletop-material");
        tileTopMaterial.specularColor.copyFromFloats(0, 0, 0);
        //tileTopMaterial.emissiveColor.copyFromFloats(0.1, 0.1, 0.1);
        if (this.color === TileColor.North) {
            tileTopMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/red-north-wind.png");
        }
        if (this.color === TileColor.South) {
            tileTopMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/blue-south-wind.png");
        }
        if (this.color === TileColor.East) {
            tileTopMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/yellow-east-wind.png");
        }
        if (this.color === TileColor.West) {
            tileTopMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/green-west-wind.png");
        }
        this.tileTop.material = tileTopMaterial;
    }
    async instantiate() {
        let tileData = this.game.vertexDataLoader.getAtIndex("./datas/meshes/box.babylon");
        (await tileData).applyToMesh(this);
        BABYLON.CreateGroundVertexData({ width: 0.9, height: 0.9 }).applyToMesh(this.tileTop);
    }
    collide(ball) {
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
        return true;
    }
}
