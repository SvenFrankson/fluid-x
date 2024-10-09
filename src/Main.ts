/// <reference path="../lib/nabu/nabu.d.ts"/>
/// <reference path="../lib/mummu/mummu.d.ts"/>
/// <reference path="../lib/babylon.d.ts"/>

var MRS_VERSION: number = 3;
var MRS_VERSION2: number = 3;
var MRS_VERSION3: number = 8;
var VERSION: number = MRS_VERSION * 1000 + MRS_VERSION2 * 100 + MRS_VERSION3;
var CONFIGURATION_VERSION: number = MRS_VERSION * 1000 + MRS_VERSION2 * 100 + MRS_VERSION3;

var observed_progress_speed_percent_second;

var PlayerHasInteracted = false;
var IsTouchScreen = - 1;
var IsMobile = - 1;
var HasLocalStorage = false;

async function WaitPlayerInteraction(): Promise<void> {
    return new Promise<void>(resolve => {
        let wait = () => {
            if (PlayerHasInteracted) {
                resolve();
            }
            else {
                requestAnimationFrame(wait);
            }
        }
        wait();
    })
}

let onFirstPlayerInteractionTouch = (ev: Event) => {
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
}

let onFirstPlayerInteractionClic = (ev: Event) => {
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
}

let onFirstPlayerInteractionKeyboard = (ev: Event) => {
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
}

function addLine(text: string): void {
    let e = document.createElement("div");
    e.classList.add("debug-log");
    e.innerText = text;
    document.body.appendChild(e);
}

function StopPointerProgatation(ev: PointerEvent) {
    ev.stopPropagation();
}

function StopPointerProgatationAndMonkeys(ev: PointerEvent) {
    console.log("StopPointerProgatationAndMonkeys");
    ev.stopPropagation();
}

enum TileColor {
    North,
    East,
    South,
    West
}

class Game {
    
    public static Instance: Game;
    public DEBUG_MODE: boolean = true;
    public DEBUG_USE_LOCAL_STORAGE: boolean = true;

	public canvas: HTMLCanvasElement;
    public canvasCurtain: HTMLDivElement;
	public engine: BABYLON.Engine;
    public scene: BABYLON.Scene;
    public getScene(): BABYLON.Scene {
        return this.scene;
    }
    public screenRatio: number = 1;

    public camera: BABYLON.FreeCamera;

    public cameraOrtho: boolean = false;

    public light: BABYLON.HemisphericLight;
    public shadowGenerator: BABYLON.ShadowGenerator;

    public vertexDataLoader: Mummu.VertexDataLoader;

    public colorMaterials: BABYLON.Material[];
    public whiteMaterial: BABYLON.StandardMaterial;
    public salmonMaterial: BABYLON.StandardMaterial;
    public brownMaterial: BABYLON.StandardMaterial;
    public blackMaterial: BABYLON.StandardMaterial;
    public floorMaterial: BABYLON.StandardMaterial;
    public terrain: Terrain;
    public tiles: Tile[] = [];
    public ball: Ball;

    constructor(canvasElement: string) {
        Game.Instance = this;
        
		this.canvas = document.getElementById(canvasElement) as unknown as HTMLCanvasElement;
        this.canvas.requestPointerLock = this.canvas.requestPointerLock || this.canvas.msRequestPointerLock || this.canvas.mozRequestPointerLock || this.canvas.webkitRequestPointerLock;
		this.canvasCurtain = document.getElementById("canvas-curtain") as HTMLDivElement;
		this.engine = new BABYLON.Engine(this.canvas, true, undefined, false);
		BABYLON.Engine.ShadersRepository = "./shaders/";
        BABYLON.Engine.audioEngine.useCustomUnlockedButton = true;

        window.addEventListener(
            "click",
            () => {
              if (!BABYLON.Engine.audioEngine.unlocked) {
                BABYLON.Engine.audioEngine.unlock();
              }
            },
            { once: true },
        );
	}

    public async createScene(): Promise<void> {
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
        this.camera.rotation.x = Math.atan(15 / 3);

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
        this.floorMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/floor.png");

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
            this.tiles.push(tile);
            await tile.instantiate();
        }

        let tile = new BlockTile(this, {
            color: Math.floor(Math.random() * 4),
            i: 0,
            j: 0
        });
        this.tiles.push(tile);
        await tile.instantiate();

        let tileA = new BlockTile(this, {
            color: Math.floor(Math.random() * 4),
            i: 4,
            j: 9
        });
        this.tiles.push(tileA);
        await tileA.instantiate();

        let tileB = new BlockTile(this, {
            color: Math.floor(Math.random() * 4),
            i: 6,
            j: 9
        });
        this.tiles.push(tileB);
        await tileB.instantiate();

        let tileC = new BlockTile(this, {
            color: Math.floor(Math.random() * 4),
            i: 4,
            j: 8
        });
        this.tiles.push(tileC);
        await tileC.instantiate();

        let tileD = new BlockTile(this, {
            color: Math.floor(Math.random() * 4),
            i: 6,
            j: 8
        });
        this.tiles.push(tileD);
        await tileD.instantiate();

        let tileE = new BlockTile(this, {
            color: Math.floor(Math.random() * 4),
            i: 4,
            j: 7
        });
        this.tiles.push(tileE);
        await tileE.instantiate();

        let tileF = new BlockTile(this, {
            color: Math.floor(Math.random() * 4),
            i: 6,
            j: 7
        });
        this.tiles.push(tileF);
        await tileF.instantiate();

        let border = new Border(this);
        border.position.copyFromFloats(3.5 * 1.1, 0, 5 * 1.1);
        await border.instantiate();

        let ramp = new Ramp(this, {
            i: 12,
            j: 5
        });
        await ramp.instantiate();

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

    public onResize = () => {
        this.screenRatio = window.innerWidth / window.innerHeight;
        if (this.screenRatio < 1) {
            document.body.classList.add("vertical");
        }
        else {
            document.body.classList.remove("vertical");
        }
        this.engine.resize();
    }

	public animate(): void {
		this.engine.runRenderLoop(() => {
			this.scene.render();
			this.update();
		});
        
		window.onresize = this.onResize;
        if (screen && screen.orientation) {
            screen.orientation.onchange = this.onResize;
        }
	}

    public async initialize(): Promise<void> {
        
    }

    public movieIdleDir: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public factoredTimeSinceGameStart: number = 0;
    public averagedFPS: number = 0;
    public updateConfigTimeout: number = - 1;
    public update(): void {
        let rawDT = this.scene.deltaTime / 1000;
        let targetCameraPos = this.ball.position.clone();
        targetCameraPos.x = Nabu.MinMax(targetCameraPos.x, this.terrain.xMin + 4.5, this.terrain.xMax - 4.5);
        targetCameraPos.z = Nabu.MinMax(targetCameraPos.z, this.terrain.zMin + 4.5, this.terrain.zMax - 4.5);
        
        targetCameraPos.y += 15;
        targetCameraPos.z -= 3;

        BABYLON.Vector3.LerpToRef(this.camera.position, targetCameraPos, 0.01, this.camera.position);
        
        if (this.ball) {
            this.ball.update();
        }
    }

    public machineEditorContainerIsDisplayed: boolean = false;
    public machineEditorContainerHeight: number = - 1;
    public machineEditorContainerWidth: number = - 1;
    public canvasLeft: number = 0;

    private _pointerDownX: number = 0;
    private _pointerDownY: number = 0;
    public onPointerDown = (event: PointerEvent) => {
        this._pointerDownX = this.scene.pointerX;
        this._pointerDownY = this.scene.pointerY;
    }

    public onPointerUp = (event: PointerEvent) => {
        
    }

    public onWheelEvent = (event: WheelEvent) => {
        
    }

    private _curtainOpacity: number = 0;
    public get curtainOpacity(): number {
        return this._curtainOpacity;
    }
    public set curtainOpacity(v: number) {
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

function DEBUG_LOG_MESHES_NAMES(): void {
    let meshes = Game.Instance.scene.meshes.map(m => { return m.name; });
    let countedMeshNames: Array<{ name: string, count: number }> = [];
    meshes.forEach(meshName => {
        let existing = countedMeshNames.find(e => { return e.name === meshName; });
        if (!existing) {
            countedMeshNames.push({name: meshName, count: 1});
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
    let main: Game = new Game("render-canvas");
    await main.createScene();
    main.initialize().then(() => {
        main.animate();
    });
}

requestAnimationFrame(() => {
    createAndInit();
});