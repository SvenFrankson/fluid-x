/// <reference path="../lib/nabu/nabu.d.ts"/>
/// <reference path="../lib/mummu/mummu.d.ts"/>
/// <reference path="../lib/babylon.d.ts"/>

var CRL_VERSION: number = 0;
var CRL_VERSION2: number = 0;
var CRL_VERSION3: number = 22;
var VERSION: number = CRL_VERSION * 1000 + CRL_VERSION2 * 100 + CRL_VERSION3;
var CONFIGURATION_VERSION: number = CRL_VERSION * 1000 + CRL_VERSION2 * 100 + CRL_VERSION3;

var observed_progress_speed_percent_second;
var USE_POKI_SDK: boolean = true;
var PokiSDK: any;

var PokiSDKPlaying: boolean = false;
function PokiGameplayStart(): void {
    if (!PokiSDKPlaying) {
        console.log("PokiSDK.gameplayStart");
        PokiSDK.gameplayStart();
        PokiSDKPlaying = true;
    }
}
var CanStartCommercialBreak: boolean = false;
async function PokiCommercialBreak(): Promise<void> {
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
function PokiGameplayStop(): void {
    if (PokiSDKPlaying) {
        PokiSDK.gameplayStop();
        PokiSDKPlaying = false;
    }
}

var PlayerHasInteracted = false;
var IsTouchScreen = - 1;
var IsMobile = - 1;
var HasLocalStorage = false;

var OFFLINE_MODE = true;
var SHARE_SERVICE_PATH: string = "https://carillion.tiaratum.com/index.php/";
if (location.host.startsWith("127.0.0.1")) {
    SHARE_SERVICE_PATH = "http://localhost/index.php/";
}

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
}

let onFirstPlayerInteractionClick = (ev: Event) => {
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
}

let onFirstPlayerInteractionKeyboard = (ev: Event) => {
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

var TileColorNames = [
    "North",
    "East",
    "South",
    "West"
]

enum GameMode {
    Menu,
    Preplay,
    Play,
    Editor
}

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
    public soundManager: SoundManager;
    public uiInputManager: UserInterfaceInputManager;
    public screenRatio: number = 1;

    public camera: BABYLON.ArcRotateCamera;
    public menuCamAlpha: number = - Math.PI * 0.75;
    public menuCamBeta: number = Math.PI * 0.3;
    public menuCamRadius: number = 15;
    public playCameraRange: number = 15;
    public playCameraRadius: number = 20;
    public playCameraMinRadius: number = 5;
    public playCameraMaxRadius: number = 100;

    public cameraOrtho: boolean = false;

    public light: BABYLON.HemisphericLight;
    public shadowGenerator: BABYLON.ShadowGenerator;
    public skybox: BABYLON.Mesh;

    public noiseTexture: BABYLON.RawTexture3D;
    public vertexDataLoader: Mummu.VertexDataLoader;

    public tileColorMaterials: BABYLON.StandardMaterial[];
    public tileColorShinyMaterials: BABYLON.StandardMaterial[];
    public tileNumberMaterials: BABYLON.StandardMaterial[];
    public colorMaterials: BABYLON.Material[];
    public trueWhiteMaterial: BABYLON.StandardMaterial;
    public whiteMaterial: BABYLON.StandardMaterial;
    public grayMaterial: BABYLON.StandardMaterial;
    public blackMaterial: BABYLON.StandardMaterial;
    public brownMaterial: BABYLON.StandardMaterial;
    public salmonMaterial: BABYLON.StandardMaterial;
    public blueMaterial: BABYLON.StandardMaterial;
    public redMaterial: BABYLON.StandardMaterial;
    public yellowMaterial: BABYLON.StandardMaterial;
    public greenMaterial: BABYLON.StandardMaterial;

    public waterMaterial: BABYLON.StandardMaterial;
    public floorMaterial: BABYLON.StandardMaterial;
    public woodFloorMaterial: BABYLON.StandardMaterial;
    public roofMaterial: BABYLON.StandardMaterial;
    public woodMaterial: BABYLON.StandardMaterial;
    public wallMaterial: BABYLON.StandardMaterial;
    public brickWallMaterial: BABYLON.StandardMaterial;
    public holeMaterial: BABYLON.StandardMaterial;
    public shadow9Material: BABYLON.StandardMaterial;
    public whiteShadow9Material: BABYLON.StandardMaterial;
    public shadowDiscMaterial: BABYLON.StandardMaterial;
    public puckSideMaterial: BABYLON.StandardMaterial;
    public get borderMaterial() {
        return this.brownMaterial;
    }
    public puzzle: Puzzle;
    public bottom: BABYLON.Mesh;
    public stamp: StampEffect;

    public player1Name: string = "";
    public player2Name: string = "";

    public tiaratumGameTutorialLevels: IPuzzlesData;
    public tiaratumGameOfflinePuzzleLevels: IPuzzlesData;
    public router: CarillonRouter;
    public editor: Editor;
    private _mode: GameMode = GameMode.Menu;
    public get mode(): GameMode {
        return this._mode;
    }
    public set mode(m: GameMode) {
        if (m != this._mode) {
            this._mode = m;
            this.globalTimer = 0;
        }
    }

    public completedPuzzles: { id: number, score: number }[] = [];
    public gameLoaded: boolean = false;

    private _bodyColorIndex = 0;
    public get bodyColorIndex(): number {
        return this._bodyColorIndex;
    }
    public set bodyColorIndex(v: number) {
        document.body.classList.remove(cssColors[this._bodyColorIndex]);
        this._bodyColorIndex = v;
        document.body.classList.add(cssColors[this._bodyColorIndex]);

        (this.bottom.material as BABYLON.StandardMaterial).diffuseColor = BABYLON.Color3.FromHexString(hexColors[this._bodyColorIndex]);
    }

    private _bodyPatternIndex = 0;
    public get bodyPatternIndex(): number {
        return this._bodyPatternIndex;
    }
    public set bodyPatternIndex(v: number) {
        //document.body.classList.remove(cssPatterns[this._bodyPatternIndex]);
        this._bodyPatternIndex = v;
        //document.body.classList.add(cssPatterns[this._bodyPatternIndex]);

        if (v === 0) {
            (this.bottom.material as BABYLON.StandardMaterial).emissiveTexture = new BABYLON.Texture("./datas/textures/cube_pattern_emissive.png");
            this.bottom.scaling.copyFromFloats(1.12, 1.95, 1);
        }
        else {
            (this.bottom.material as BABYLON.StandardMaterial).emissiveTexture = new BABYLON.Texture("./datas/textures/rainbow_pattern_emissive.png");
            this.bottom.scaling.copyFromFloats(0.98, 1.11, 1);
        }
    }

    constructor(canvasElement: string) {
        Game.Instance = this;
        
		this.canvas = document.getElementById(canvasElement) as unknown as HTMLCanvasElement;
        this.canvas.requestPointerLock = this.canvas.requestPointerLock || this.canvas.msRequestPointerLock || this.canvas.mozRequestPointerLock || this.canvas.webkitRequestPointerLock;
		this.canvasCurtain = document.getElementById("canvas-curtain") as HTMLDivElement;
		this.engine = new BABYLON.Engine(this.canvas, true, undefined, false);
		BABYLON.Engine.ShadersRepository = "./shaders/";
        BABYLON.Engine.audioEngine.useCustomUnlockedButton = true;
        this.soundManager = new SoundManager();
        this.uiInputManager = new UserInterfaceInputManager(this);
	}

    public async createScene(): Promise<void> {
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

        this.camera = new BABYLON.ArcRotateCamera("camera", - Math.PI * 0.5, Math.PI * 0.1, 15, BABYLON.Vector3.Zero());
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
        (this.roofMaterial.diffuseTexture as BABYLON.Texture).uScale = 5;
        (this.roofMaterial.diffuseTexture as BABYLON.Texture).vScale = 5;
            
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

        let oneMaterial = new BABYLON.StandardMaterial("one-material");
        //oneMaterial.diffuseColor.copyFromFloats(0.7, 0.7, 0.7);
        //oneMaterial.diffuseColor = BABYLON.Color3.FromHexString("#272838");
        //oneMaterial.diffuseColor = BABYLON.Color3.FromHexString("#272932").scale(0.8);
        oneMaterial.specularColor.copyFromFloats(0, 0, 0);
        oneMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/door-one.png");
            
        let twoMaterial = new BABYLON.StandardMaterial("two-material");
        //twoMaterial.diffuseColor.copyFromFloats(0.7, 0.7, 0.7);
        //twoMaterial.diffuseColor = BABYLON.Color3.FromHexString("#5D536B");
        //twoMaterial.diffuseColor = BABYLON.Color3.FromHexString("#828489").scale(1.2);
        twoMaterial.specularColor.copyFromFloats(0, 0, 0);
        twoMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/door-two.png");

        let threeMaterial = new BABYLON.StandardMaterial("three-material");
        //threeMaterial.diffuseColor.copyFromFloats(0.7, 0.7, 0.7);
        //threeMaterial.diffuseColor = BABYLON.Color3.FromHexString("#7D6B91");
        //threeMaterial.diffuseColor = BABYLON.Color3.Lerp(oneMaterial.diffuseColor, twoMaterial.diffuseColor, 0.3);
        threeMaterial.specularColor.copyFromFloats(0, 0, 0);
        threeMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/door-three.png");

        console.log("1 " + oneMaterial.diffuseColor.toHexString());
        console.log("2 " + twoMaterial.diffuseColor.toHexString());
        console.log("3 " + threeMaterial.diffuseColor.toHexString());

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
            //shinyMat.specularColor.copyFromFloats(1, 1, 1);
            //shinyMat.specularPower = 256;
        })

        this.trueWhiteMaterial = new BABYLON.StandardMaterial("true-white-material");
        this.trueWhiteMaterial.diffuseColor = BABYLON.Color3.FromHexString("#ffffff");
        this.trueWhiteMaterial.specularColor.copyFromFloats(0, 0, 0);

        this.whiteMaterial = new BABYLON.StandardMaterial("white-material");
        this.whiteMaterial.diffuseColor = BABYLON.Color3.FromHexString("#e3cfb4");
        this.whiteMaterial.specularColor.copyFromFloats(0, 0, 0);

        this.grayMaterial = new BABYLON.StandardMaterial("gray-material");
        this.grayMaterial.diffuseColor = BABYLON.Color3.FromHexString("#5d6265");
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
        ]

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
        })

        let doorDatas = await this.vertexDataLoader.get("./datas/meshes/door.babylon");
        Mummu.ColorizeVertexDataInPlace(doorDatas[1], this.woodMaterial.diffuseColor, BABYLON.Color3.Red());
        Mummu.ColorizeVertexDataInPlace(doorDatas[1], this.blackMaterial.diffuseColor, BABYLON.Color3.Green());

        if (HasLocalStorage) {
            let dataString = window.localStorage.getItem("completed-puzzles-v" + VERSION.toFixed(0));
            if (dataString) {
                this.completedPuzzles = JSON.parse(dataString);
            }
        }

        let tutorialPuzzles: IPuzzlesData;
        if (OFFLINE_MODE) {
            const response = await fetch("./datas/levels/tiaratum_tutorial_levels.json", {
                method: "GET",
                mode: "cors"
            });
            tutorialPuzzles = await response.json() as IPuzzlesData;
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
                tutorialPuzzles = await response.json() as IPuzzlesData;
                CLEAN_IPuzzlesData(tutorialPuzzles);
            }
            catch (e) {
                console.error(e);
                OFFLINE_MODE = true;
                const response = await fetch("./datas/levels/tiaratum_tutorial_levels.json", {
                    method: "GET",
                    mode: "cors"
                });
                tutorialPuzzles = await response.json() as IPuzzlesData;
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
            let offlinePuzzles: IPuzzlesData;
            const response = await fetch("./datas/levels/tiaratum_offline_levels.json", {
                method: "GET",
                mode: "cors"
            });
            offlinePuzzles = await response.json() as IPuzzlesData;
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
                        (document.querySelector("#success-score-submit-btn") as HTMLButtonElement).classList.remove("locked");
                    }
                    else {
                        (document.querySelector("#success-score-submit-btn") as HTMLButtonElement).classList.add("locked");
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
                }
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
                }
            }
        });

        (document.querySelector("#success-score-submit-btn") as HTMLButtonElement).onclick = () => {
            this.puzzle.submitHighscore();
        }

        (document.querySelector("#reset-btn") as HTMLButtonElement).onclick = async () => {
            await this.puzzle.reset();
            this.puzzle.skipIntro();
        }

        (document.querySelector("#zoom-out-btn") as HTMLButtonElement).onclick = () => {
            this.playCameraRange += 1;
            this.updatePlayCameraRadius();
        }

        (document.querySelector("#zoom-in-btn") as HTMLButtonElement).onclick = () => {
            this.playCameraRange -= 1;
            this.updatePlayCameraRadius();
        }

        (document.querySelector("#dev-mode-activate-btn") as HTMLButtonElement).onclick = () => {
            DEV_ACTIVATE();
        }

        (document.querySelector("#eula-back-btn") as HTMLButtonElement).onclick = () => {
            this.router.eulaPage.hide(0);
        }

        (document.querySelector("#title-version") as HTMLDivElement).innerHTML = "confidential build - v" + CRL_VERSION + "." + CRL_VERSION2 + "." + CRL_VERSION3;

        let devSecret = 0;
        let devSecretTimout: number = 0;
        (document.querySelector("#home-menu h1") as HTMLHeadingElement).style.pointerEvents = "auto";
        (document.querySelector("#home-menu h1") as HTMLDivElement).onclick = () => {
            if (devSecret < 6) {
                devSecret++;
            }
            console.log(devSecret);
            clearTimeout(devSecretTimout);
            devSecretTimout = setTimeout(() => {
                devSecret = 0;
            }, 3000);
        }

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
        })

        let ambient = this.soundManager.createSound(
            "ambient",
            "./datas/sounds/zen-ambient.mp3",
            this.scene,
            () => {
                ambient.setVolume(0.15)
            },
            {
                autoplay: true,
                loop: true
            }
        );

        if (this.completedPuzzles.length > 0) {
            //page = "#home";
        }
        let puzzleId: number;
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
            //(document.querySelector("#dev-pass-input") as HTMLInputElement).value = "Crillion";
            //DEV_ACTIVATE();
        }
	}

    public static ScoreToString(t: number): string {
        t = t / 100;
        let min = Math.floor(t / 60);
        let sec = Math.floor(t - 60 * min);
        let centi = Math.floor((t - 60 * min - sec) * 100);

        return min.toFixed(0).padStart(2, "0") + ":" + sec.toFixed(0).padStart(2, "0") + ":" + centi.toFixed(0).padStart(2, "0");
    }

    public setPlayTimer(t: number): void {
        let min = Math.floor(t / 60);
        let sec = Math.floor(t - 60 * min);
        let centi = Math.floor((t - 60 * min - sec) * 100);

        if (this.router && this.router.timerText) {
            let strokes = this.router && this.router.timerText.querySelectorAll("stroke-text") as NodeListOf<StrokeText>;
            strokes[0].setContent(min.toFixed(0).padStart(2, "0") + ":");
            strokes[1].setContent(sec.toFixed(0).padStart(2, "0") + ":");
            strokes[2].setContent(centi.toFixed(0).padStart(2, "0"));
        }
    }

    public onResize = () => {
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

    public getCameraHorizontalFOV(): number {
        return 2 * Math.atan(this.screenRatio * Math.tan(this.camera.fov / 2));
    }

    public updatePlayCameraRadius(): void {
        let minFov = Math.min(this.camera.fov, this.getCameraHorizontalFOV());
        this.playCameraRadius = Nabu.MinMax(this.playCameraRange / Math.tan(minFov), this.playCameraMinRadius, this.playCameraMaxRadius);
    }

    public updateMenuCameraRadius(): void {
        let minFov = Math.min(this.camera.fov, this.getCameraHorizontalFOV());
        this.menuCamRadius = Nabu.MinMax(Math.min(this.playCameraRange, Math.max(this.puzzle.w, this.puzzle.h) * 1.1) / Math.tan(minFov), this.playCameraMinRadius, this.playCameraMaxRadius);
    }

    public movieIdleDir: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public factoredTimeSinceGameStart: number = 0;
    public averagedFPS: number = 0;
    public updateConfigTimeout: number = - 1;
    public globalTimer: number = 0;
    public update(): void {
        let rawDT = this.scene.deltaTime / 1000;
        if (isFinite(rawDT)) {
            this.globalTimer += rawDT;
            
            let aLeft = - Math.PI * 0.9;
            let aRight = - Math.PI * 0.3;
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
                targetCameraPos.y = Math.max(targetCameraPos.y, - 2.5);
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
                this.camera.alpha = this.camera.alpha * f3 + (- Math.PI * 0.5) * (1 - f3);
                this.camera.beta = this.camera.beta * f3 + targetCamBeta * (1 - f3);
                let f4 = Nabu.Easing.smoothNSec(1 / rawDT, Math.max(0.25, 2.25 - this.globalTimer));
                this.camera.radius = this.camera.radius * f4 + (this.playCameraRadius) * (1 - f4);
            }
            else if (this.mode === GameMode.Menu || this.mode === GameMode.Preplay) {
                rawDT = Math.min(rawDT, 1);
                let w = this.puzzle.xMax - this.puzzle.xMin;
                let d = this.puzzle.zMax - this.puzzle.zMin;
                let targetCameraPos = new BABYLON.Vector3(
                    0.5 * (this.puzzle.xMin + this.puzzle.xMax) + 0.2 * w * Math.cos(this.globalTimer / 30 * 2 * Math.PI),
                    0,
                    0.4 * (this.puzzle.zMin + this.puzzle.zMax) + 0.2 * d * Math.sin(this.globalTimer / 30 * 2 * Math.PI)
                )
                
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
            
            (this.waterMaterial.diffuseTexture as BABYLON.Texture).vOffset += 0.5 * rawDT;
            if ((this.waterMaterial.diffuseTexture as BABYLON.Texture).vOffset > 1) {
                (this.waterMaterial.diffuseTexture as BABYLON.Texture).vOffset -= 1;
            }
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

    public completePuzzle(id: number, score: number): void {
        let comp = this.completedPuzzles.find(comp => { return comp.id === id });
        if (!comp) {
            comp = { id: id, score: score };
            this.completedPuzzles.push(comp)
        }
        else if (comp.score > score) {
            comp.score = Math.min(comp.score, score);
        }

        if (HasLocalStorage) {
            window.localStorage.setItem("completed-puzzles-v" + VERSION.toFixed(0), JSON.stringify(this.completedPuzzles));
        }
    }

    public isPuzzleCompleted(id: number): boolean {
        return this.completedPuzzles.findIndex(comp => { return comp.id === id }) != -1;
    }

    public getPersonalBestScore(id: number): number {
        let comp = this.completedPuzzles.find(comp => { return comp.id === id });
        if (comp) {
            return comp.score;
        }
        return Infinity;
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

    public fadeIntroDir: number = 0;

    public async fadeInIntro(duration: number = 1): Promise<void> {
        console.log("fadin");
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
            }
            this.fadeIntroDir = 1;
            step();
        }
    }

    public async fadeOutIntro(duration: number = 1): Promise<void> {
        console.log("fadout");
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
            }
            this.fadeIntroDir = -1;
            step();
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

async function DEV_GENERATE_TUTORIAL_LEVEL_FILE(): Promise<void> {
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

async function DEV_GENERATE_PUZZLE_LEVEL_FILE(): Promise<void> {
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

var DEV_MODE_ACTIVATED: boolean = false;
var var1: string = "";
function DEV_ACTIVATE(): void {
    DEV_MODE_ACTIVATED = true;
    var1 = (document.querySelector("#dev-pass-input") as HTMLInputElement).value;
    (document.querySelector("#dev-page .dev-active") as HTMLDivElement).style.display = "block";
    (document.querySelector("#dev-back-btn") as HTMLButtonElement).style.display = "block";
    (document.querySelector("#dev-page .dev-not-active") as HTMLDivElement).style.display = "none";
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
    let devStateBtns: HTMLButtonElement[] = [];
    for (let i = 0; i <= 6; i++) {
        let btn = document.getElementById("dev-state-" + i.toFixed(0) + "-btn") as HTMLButtonElement;
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
        }
    }

    (document.querySelector("#dev-story-order") as HTMLDivElement).style.display = "block";
    let devStoryOrderBtns = document.querySelectorAll("#dev-story-order button");
    let devStoryOrderMinus = devStoryOrderBtns[0] as HTMLButtonElement;
    devStoryOrderMinus.onclick = () => {
        Game.Instance.puzzle.data.story_order--;
        DEV_UPDATE_STATE_UI();
    }
    let devStoryOrderPlus = devStoryOrderBtns[1] as HTMLButtonElement;
    devStoryOrderPlus.onclick = () => {
        Game.Instance.puzzle.data.story_order++;
        DEV_UPDATE_STATE_UI();
    }
    let devStoryOrderSend = devStoryOrderBtns[2] as HTMLButtonElement;
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
    }
}

function DEV_UPDATE_STATE_UI(): void {
    let devStateBtns: HTMLButtonElement[] = [];
    for (let i = 0; i <= 6; i++) {
        let btn = document.getElementById("dev-state-" + i.toFixed(0) + "-btn") as HTMLButtonElement;
        devStateBtns.push(btn);
    }
    devStateBtns.forEach(btn => {
        btn.classList.remove("selected");
    })
    if (devStateBtns[Game.Instance.puzzle.data.state]) {
        devStateBtns[Game.Instance.puzzle.data.state].classList.add("selected");
    }

    let storyOrderVal = document.querySelector("#dev-story-order span stroke-text") as StrokeText;
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
    let main: Game = new Game("render-canvas");
    await main.createScene();
    main.initialize().then(() => {
        main.animate();
    });
}

requestAnimationFrame(() => {
    if (USE_POKI_SDK) {
        PokiSDK.init().then(() => {
            createAndInit();
        })
    }
    else {
        createAndInit();
    }
});