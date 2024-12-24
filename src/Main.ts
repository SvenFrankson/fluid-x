/// <reference path="../lib/nabu/nabu.d.ts"/>
/// <reference path="../lib/mummu/mummu.d.ts"/>
/// <reference path="../lib/babylon.d.ts"/>

//mklink /D C:\Users\tgames\OneDrive\Documents\GitHub\fluid-x\lib\nabu\ C:\Users\tgames\OneDrive\Documents\GitHub\nabu

var MAJOR_VERSION: number = 2;
var MINOR_VERSION: number = 0;
var PATCH_VERSION: number = 3;
var VERSION: number = MAJOR_VERSION * 1000 + MINOR_VERSION * 100 + PATCH_VERSION;
var CONFIGURATION_VERSION: number = MAJOR_VERSION * 1000 + MINOR_VERSION * 100 + PATCH_VERSION;

var observed_progress_speed_percent_second;
var setProgressIndex;
var GLOBAL_GAME_LOAD_CURRENT_STEP;
var USE_POKI_SDK;
var USE_CG_SDK;
var OFFLINE_MODE;
var NO_VERTEX_DATA_LOADER;
var ADVENT_CAL;
var PokiSDK: any;
var CrazySDK: any;
var LOCALE = "en";

var SDKPlaying: boolean = false;
function SDKGameplayStart(): void {
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
function SDKGameplayStop(): void {
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
var IsMobile = - 1;
var HasLocalStorage = false;

function StorageGetItem(key: string): string {
    if (USE_CG_SDK) {
        return CrazySDK.data.getItem(key);
    }
    else {
        return localStorage.getItem(key);
    }
}

function StorageSetItem(key: string, value: string): void {
    if (USE_CG_SDK) {
        CrazySDK.data.setItem(key, value);
    }
    else {
        localStorage.setItem(key, value);
    }
}

var SHARE_SERVICE_PATH: string = "https://carillion.tiaratum.com/index.php/";
if (location.host.startsWith("127.0.0.1")) {
    //SHARE_SERVICE_PATH = "http://localhost/index.php/";
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

function firstPlayerInteraction(): void {
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

let onFirstPlayerInteractionTouch = (ev: Event) => {
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
}

let onFirstPlayerInteractionClick = (ev: MouseEvent) => {
    if (!Game.Instance.gameLoaded) {
        return;
    }
    console.log("onFirstPlayerInteractionClic");
    ev.stopPropagation();
    document.body.removeEventListener("click", onFirstPlayerInteractionClick);

    if (!PlayerHasInteracted) {
        firstPlayerInteraction();
    }
}

let onFirstPlayerInteractionKeyboard = (ev: KeyboardEvent) => {
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
    public performanceWatcher: PerformanceWatcher;

    public camera: BABYLON.ArcRotateCamera;
    public menuCamAlpha: number = - Math.PI * 0.75;
    public menuCamBeta: number = Math.PI * 0.3;
    public menuCamRadius: number = 15;
    //public playCameraRange: number = 15;
    public playCameraRadiusFactor: number = 0;
    public playCameraRadius: number = 20;
    public playCameraMinRadius: number = 10;
    public playCameraMaxRadius: number = 50;

    public cameraOrtho: boolean = false;

    public light: BABYLON.HemisphericLight;
    public spotlight: BABYLON.SpotLight;
    public animLightIntensity = Mummu.AnimationFactory.EmptyNumberCallback;
    public animSpotlightIntensity = Mummu.AnimationFactory.EmptyNumberCallback;
    public shadowGenerator: BABYLON.ShadowGenerator;
    public skybox: BABYLON.Mesh;

    public noiseTexture: BABYLON.RawTexture3D;
    public vertexDataLoader: Mummu.VertexDataLoader;
    public materials: CarillionMaterials;

    public puzzle: Puzzle;
    public stamp: StampEffect;

    public player1Name: string = "";
    public player2Name: string = "";

    public loadedStoryPuzzles: IPuzzlesData;
    public loadedExpertPuzzles: IPuzzlesData;
    public loadedXMasPuzzles: IPuzzlesData;
    public dayOfXMasCal: number = 1;
    public loadedCommunityPuzzles: IPuzzlesData;
    public loadedMultiplayerPuzzles: IPuzzlesData;

    public puzzleCompletion: PuzzleCompletion;
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

    public gameLoaded: boolean = false;

    private _bodyColorIndex = 0;
    public get bodyColorIndex(): number {
        return this._bodyColorIndex;
    }
    public set bodyColorIndex(v: number) {
        this._bodyColorIndex = v;

        this.scene.clearColor = BABYLON.Color4.FromHexString(hexColors[5] + "FF");
        this.scene.clearColor.a = 1;
    }

    private _bodyPatternIndex = 0;
    public get bodyPatternIndex(): number {
        return this._bodyPatternIndex;
    }
    public set bodyPatternIndex(v: number) {
        this._bodyPatternIndex = v;
    }

    constructor(canvasElement: string) {
        Game.Instance = this;
        
		this.canvas = document.getElementById(canvasElement) as unknown as HTMLCanvasElement;
        this.canvas.requestPointerLock = this.canvas.requestPointerLock || this.canvas.msRequestPointerLock || this.canvas.mozRequestPointerLock || this.canvas.webkitRequestPointerLock;
		this.canvasCurtain = document.getElementById("canvas-curtain") as HTMLDivElement;
		this.engine = new BABYLON.Engine(this.canvas, true, undefined, false);
		BABYLON.Engine.ShadersRepository = "./shaders/";
        BABYLON.Engine.audioEngine.useCustomUnlockedButton = true;
        BABYLON.Engine.audioEngine.lock();
        this.soundManager = new SoundManager();
        this.uiInputManager = new UserInterfaceInputManager(this);
        this.performanceWatcher = new PerformanceWatcher(this);
	}

    public async createScene(): Promise<void> {
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
        skyboxMaterial.emissiveColor = BABYLON.Color3.FromHexString("#5c8b93").scaleInPlace(0.7);
        this.skybox.material = skyboxMaterial;

        this.stamp = new StampEffect(this);

        this.bodyColorIndex = 5;
        this.bodyPatternIndex = 0;

        this.camera = new BABYLON.ArcRotateCamera("camera", - Math.PI * 0.5, Math.PI * 0.1, 15, BABYLON.Vector3.Zero());
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
        })

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

        (document.querySelector("#success-score-submit-btn") as HTMLButtonElement).onpointerup = () => {
            this.puzzle.submitHighscore();
        }

        (document.querySelector("#reset-btn") as HTMLButtonElement).onpointerup = async () => {
            await this.puzzle.reset(true);
            this.puzzle.skipIntro();
        }

        (document.querySelector("#zoom-out-btn") as HTMLButtonElement).onpointerup = () => {
            this.playCameraRadiusFactor += 1;
            this.playCameraRadiusFactor = Nabu.MinMax(this.playCameraRadiusFactor, -3, 3);
            this.updatePlayCameraRadius();
        }

        (document.querySelector("#zoom-in-btn") as HTMLButtonElement).onpointerup = () => {
            this.playCameraRadiusFactor -= 1;
            this.playCameraRadiusFactor = Nabu.MinMax(this.playCameraRadiusFactor, -3, 3);
            this.updatePlayCameraRadius();
        }

        (document.querySelector("#sound-btn") as HTMLButtonElement).onpointerup = () => {
            if (this.soundManager.isSoundOn()) {
                this.soundManager.soundOff();
            }
            else {
                this.soundManager.soundOn();
            }
        }
        if (this.soundManager.isSoundOn()) {
            (document.querySelector("#sound-btn") as HTMLButtonElement).classList.remove("mute");
        }
        else {
            (document.querySelector("#sound-btn") as HTMLButtonElement).classList.add("mute");
        }

        (document.querySelector("#dev-mode-activate-btn") as HTMLButtonElement).onpointerup = () => {
            DEV_ACTIVATE();
        }

        (document.querySelector("#eula-back-btn") as HTMLButtonElement).onpointerup = () => {
            this.router.eulaPage.hide(0);
        }

        (document.querySelector("#title-version") as HTMLDivElement).innerHTML = (OFFLINE_MODE ? "offline" : "online") + " version " + MAJOR_VERSION + "." + MINOR_VERSION + "." + PATCH_VERSION;

        let devSecret = 0;
        let devSecretTimout: number = 0;
        (document.querySelector("#home-menu h1") as HTMLHeadingElement).style.pointerEvents = "auto";
        (document.querySelector("#home-menu h1") as HTMLHeadingElement).onpointerup = () => {
            if (devSecret < 6) {
                devSecret++;
            }
            else {
                (document.querySelector("#home-menu h1 span") as HTMLHeadingElement).classList.add("secret-dev-mode");
                (document.querySelector("#credits-tiaratum-anchor") as HTMLAnchorElement).href = "#dev";
                (document.querySelector("#credits-tiaratum-anchor") as HTMLAnchorElement).target = "";
            }
            clearTimeout(devSecretTimout);

            devSecretTimout = setTimeout(() => {
                (document.querySelector("#home-menu h1 span") as HTMLHeadingElement).classList.remove("secret-dev-mode");
                (document.querySelector("#credits-tiaratum-anchor") as HTMLAnchorElement).href = "https://tiaratum.com/";
                (document.querySelector("#credits-tiaratum-anchor") as HTMLAnchorElement).target = "_blank";
                devSecret = 0;
            }, devSecret < 6 ? 1000 : 6000);
        }

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

    public async loadPuzzles(): Promise<void> {
        //await RandomWait();
        let storyModePuzzles: IPuzzlesData;
        if (OFFLINE_MODE) {
            const response = await fetch("./datas/levels/tiaratum_story_levels.json", {
                method: "GET",
            });
            storyModePuzzles = await response.json() as IPuzzlesData;
            CLEAN_IPuzzlesData(storyModePuzzles);
        }
        else {
            try {
                const response = await fetch(SHARE_SERVICE_PATH + "get_puzzles/0/200/2", {
                    method: "GET",
                    mode: "cors",
                    signal: (AbortSignal as any).timeout(5000)
                });
                if (!response.ok) {
                    throw new Error("Response status: " + response.status);
                }
                storyModePuzzles = await response.json() as IPuzzlesData;
        
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
                storyModePuzzles = await response.json() as IPuzzlesData;
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

        let expertPuzzles: IPuzzlesData;
        if (OFFLINE_MODE) {
            const response = await fetch("./datas/levels/tiaratum_expert_levels.json", {
                method: "GET"
            });
            expertPuzzles = await response.json() as IPuzzlesData;
            CLEAN_IPuzzlesData(expertPuzzles);
        }
        else {
            try {
                const response = await fetch(SHARE_SERVICE_PATH + "get_puzzles/0/200/3", {
                    method: "GET",
                    mode: "cors",
                    signal: (AbortSignal as any).timeout(5000)
                });
                if (!response.ok) {
                    throw new Error("Response status: " + response.status);
                }
                expertPuzzles = await response.json() as IPuzzlesData;
        
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
                expertPuzzles = await response.json() as IPuzzlesData;
                CLEAN_IPuzzlesData(expertPuzzles);
            }
        }

        this.loadedExpertPuzzles = expertPuzzles;

        let xMasPuzzles: IPuzzlesData;
        if (OFFLINE_MODE) {
            const response = await fetch("./datas/levels/tiaratum_xmas_levels.json", {
                method: "GET"
            });
            xMasPuzzles = await response.json() as IPuzzlesData;
            CLEAN_IPuzzlesData(xMasPuzzles);
        }
        else {
            try {
                const response = await fetch(SHARE_SERVICE_PATH + "get_puzzles/0/200/8", {
                    method: "GET",
                    mode: "cors",
                    signal: (AbortSignal as any).timeout(5000)
                });
                if (!response.ok) {
                    throw new Error("Response status: " + response.status);
                }
                xMasPuzzles = await response.json() as IPuzzlesData;

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
                xMasPuzzles = await response.json() as IPuzzlesData;
                CLEAN_IPuzzlesData(xMasPuzzles);
            }
        }

        this.dayOfXMasCal = new Date().getDate();
        this.dayOfXMasCal = Nabu.MinMax(this.dayOfXMasCal, 1, 24);
        
        let iFallback = 0;
        for (let i = xMasPuzzles.puzzles.length; i < this.dayOfXMasCal; i++) {
            let puzzleData: IPuzzleData = {
                id: xMasPuzzles.puzzles[iFallback].id,
                title: "December " + (i + 1).toFixed(0) + ".\nSurprise !",
                author: "TiaratumGames",
                content: xMasPuzzles.puzzles[iFallback].content,
                difficulty: 2
            }
            xMasPuzzles.puzzles[i] = puzzleData;
            iFallback = (iFallback + 1) % xMasPuzzles.puzzles.length;
        }
        let i0 = Math.min(this.dayOfXMasCal, xMasPuzzles.puzzles.length);
        for (let i = i0; i < 24; i++) {
            let puzzleData: IPuzzleData = {
                id: null,
                title: "December " + (i + 1).toFixed(0) + ".\nSurprise !",
                author: "TiaratumGames",
                content: "11u14u5u9u2xoooooooooooxooosssssoooxoosssssssooxossooooossoxossooooossoxoosooooossoxoooooosssooxooooossooooxooooossooooxooooosoooooxoooooooooooxoooosssooooxoooosssooooxoooooooooooxBB0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                difficulty: 2
            }
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

        let communityPuzzles: IPuzzlesData;
        if (OFFLINE_MODE) {
            const response = await fetch("./datas/levels/tiaratum_community_levels.json", {
                method: "GET"
            });
            communityPuzzles = await response.json() as IPuzzlesData;
            CLEAN_IPuzzlesData(communityPuzzles);
        }
        else {
            try {
                const response = await fetch(SHARE_SERVICE_PATH + "get_puzzles/0/200/1", {
                    method: "GET",
                    mode: "cors",
                    signal: (AbortSignal as any).timeout(5000)
                });
                if (!response.ok) {
                    throw new Error("Response status: " + response.status);
                }
                communityPuzzles = await response.json() as IPuzzlesData;
                CLEAN_IPuzzlesData(communityPuzzles);
            }
            catch (e) {
                console.error(e);
                OFFLINE_MODE = true;
                const response = await fetch("./datas/levels/tiaratum_community_levels.json", {
                    method: "GET"
                });
                communityPuzzles = await response.json() as IPuzzlesData;
                CLEAN_IPuzzlesData(communityPuzzles);
            }
        }

        this.loadedCommunityPuzzles = communityPuzzles;

        let multiplayerPuzzles: IPuzzlesData;
        if (OFFLINE_MODE) {
            const response = await fetch("./datas/levels/tiaratum_multiplayer_levels.json", {
                method: "GET"
            });
            multiplayerPuzzles = await response.json() as IPuzzlesData;
            CLEAN_IPuzzlesData(multiplayerPuzzles);
        }
        else {
            try {
                const response = await fetch(SHARE_SERVICE_PATH + "get_puzzles/0/200/4", {
                    method: "GET",
                    mode: "cors",
                    signal: (AbortSignal as any).timeout(5000)
                });
                if (!response.ok) {
                    throw new Error("Response status: " + response.status);
                }
                multiplayerPuzzles = await response.json() as IPuzzlesData;
                CLEAN_IPuzzlesData(multiplayerPuzzles);
            }
            catch (e) {
                console.error(e);
                OFFLINE_MODE = true;
                const response = await fetch("./datas/levels/tiaratum_multiplayer_levels.json", {
                    method: "GET"
                });
                multiplayerPuzzles = await response.json() as IPuzzlesData;
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
                    signal: (AbortSignal as any).timeout(5000)
                });
                if (!response.ok) {
                    throw new Error("Response status: " + response.status);
                }
                let table = await response.json();
                for (let n  = 0; n < table.length; n++) {
                    if (typeof(table[n].story_id) === "string") {
                        table[n].story_id = parseInt(table[n].story_id);
                    }
                    if (typeof(table[n].expert_id) === "string") {
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

    public async getPuzzleDataById(id: number): Promise<IPuzzleData> {
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
            this.playCameraMinRadius = 20;
        }
        else {
            document.body.classList.remove("vertical");
        }
        this.engine.resize(true);
        this.canvas.setAttribute("width", Math.floor(rect.width * this.performanceWatcher.devicePixelRatio).toFixed(0));
        this.canvas.setAttribute("height", Math.floor(rect.height * this.performanceWatcher.devicePixelRatio).toFixed(0));
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
        let fov = this.getCameraHorizontalFOV();
        let rect = this.canvas.getBoundingClientRect();
        let w = rect.width / (70 / Math.sqrt(window.devicePixelRatio));
        let f = Math.exp(this.playCameraRadiusFactor / 5);
        this.playCameraRadius = Nabu.MinMax((0.5 * w) / Math.tan(fov / 2), this.playCameraMinRadius, this.playCameraMaxRadius) * f;
    }

    public updateMenuCameraRadius(): void {
        let fov = this.getCameraHorizontalFOV();
        let rect = this.canvas.getBoundingClientRect();
        let w = rect.width / (70 / Math.sqrt(window.devicePixelRatio));
        this.menuCamRadius = Nabu.MinMax((0.5 * w) / Math.tan(fov / 2), this.playCameraMinRadius, this.playCameraMaxRadius);
    }

    public movieIdleDir: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public factoredTimeSinceGameStart: number = 0;
    public averagedFPS: number = 0;
    public updateConfigTimeout: number = - 1;
    public globalTimer: number = 0;
    public update(): void {
        let rawDT = this.scene.deltaTime / 1000;
        this.performanceWatcher.update(rawDT);
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
                while (this.camera.alpha > Math.PI / 2) {
                    this.camera.alpha -= 2 * Math.PI;
                }
                while (this.camera.alpha < - 3 * Math.PI / 2) {
                    this.camera.alpha += 2 * Math.PI;
                }
                let targetCameraPos = this.puzzle.balls[0].absolutePosition.clone();
                if (this.puzzle.ballsCount === 2) {
                    targetCameraPos.addInPlace(this.puzzle.balls[1].absolutePosition).scaleInPlace(0.5);
                }
                rawDT = Math.min(rawDT, 1);
                targetCameraPos.y = Math.max(targetCameraPos.y, - 2.5);
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
                let targetCamAlpha = - 0.5 * Math.PI;
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
                while (this.camera.alpha < - 3 * Math.PI / 2) {
                    this.camera.alpha += 2 * Math.PI;
                }
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
            
            (this.materials.waterMaterial.diffuseTexture as BABYLON.Texture).vOffset += 0.5 * rawDT;
            if ((this.materials.waterMaterial.diffuseTexture as BABYLON.Texture).vOffset > 1) {
                (this.materials.waterMaterial.diffuseTexture as BABYLON.Texture).vOffset -= 1;
            }
            if (this.skybox) {
                this.skybox.rotation.y += 0.02 * rawDT;
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

    public storyExpertTable: { story_id: number, expert_id: number }[] = [];
    public storyIdToExpertId(storyId: number): number {
        let element = this.storyExpertTable.find(e => { return e.story_id === storyId; });
        if (element) {
            return element.expert_id; 
        }
    }
    public expertIdToStoryId(expertId: number): number[] {
        let element = this.storyExpertTable.filter(e => { return e.expert_id === expertId; });
        if (element) {
            return element.map(e => { return e.story_id; }); 
        }
        return [];
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
        //await RandomWait();
        return new Promise<void>(resolve => {
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
                }
                this.fadeIntroDir = 1;
                step();
            }
        });
    }

    public async fadeOutIntro(duration: number = 1): Promise<void> {
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

async function RandomWait(): Promise<void> {
    return new Promise<void>(resolve => {
        if (Math.random() < 0.9) {
            resolve();
        }
        else {
            setTimeout(() => {
                resolve()
            }, Math.random() * 500);
        }
    });
}

async function DEV_GENERATE_ALL_LEVEL_FILES(): Promise<void> {
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
var DEV_MODE_ACTIVATED: boolean = false;
var var1: string = "";
function DEV_ACTIVATE(): void {
    DEV_MODE_ACTIVATED = true;
    var1 = (document.querySelector("#dev-pass-input") as HTMLInputElement).value;
    (document.querySelector("#dev-page .dev-active") as HTMLDivElement).style.display = "block";
    (document.querySelector("#dev-back-btn") as HTMLButtonElement).style.display = "block";
    (document.querySelector("#dev-page .dev-not-active") as HTMLDivElement).style.display = "none";
    
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

    let devStateBtns: HTMLButtonElement[] = [];
    for (let i = 0; i <= 8; i++) {
        let btn = document.getElementById("dev-state-" + i.toFixed(0) + "-btn") as HTMLButtonElement;
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
        }
    }

    (document.querySelector("#dev-story-order") as HTMLDivElement).style.display = "block";
    let devStoryOrderBtns = document.querySelectorAll("#dev-story-order button");
    let devStoryOrderMinus = devStoryOrderBtns[0] as HTMLButtonElement;
    devStoryOrderMinus.onpointerup = () => {
        Game.Instance.puzzle.data.story_order--;
        DEV_UPDATE_STATE_UI();
    }
    let devStoryOrderPlus = devStoryOrderBtns[1] as HTMLButtonElement;
    devStoryOrderPlus.onpointerup = () => {
        Game.Instance.puzzle.data.story_order++;
        DEV_UPDATE_STATE_UI();
    }
    let devStoryOrderSend = devStoryOrderBtns[2] as HTMLButtonElement;
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
    }
    
    let devDifficulty = (document.querySelector("#dev-difficulty") as HTMLDivElement);
    devDifficulty.style.display = "block";
    let devDifficultyInput = devDifficulty.querySelector("num-value-input") as NumValueInput;
    devDifficultyInput.onValueChange = (v: number) => {
        Game.Instance.puzzle.data.difficulty = v;
    }
    devDifficultyInput.valueToString = (v: number) => {
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
    }
    let devDifficultySend = devDifficulty.querySelector("#dev-difficulty-send") as HTMLButtonElement;
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
    }

    let devXpertPuzzle = (document.querySelector("#dev-xpert-puzzle")) as HTMLDivElement;
    devXpertPuzzle.style.display = "block";
    let devXpertPuzzleInput = devXpertPuzzle.querySelector("#dev-xpert-puzzle-input") as HTMLInputElement;
    devXpertPuzzleInput.onchange = () => {
        Game.Instance.puzzle.data.expert_puzzle_id = parseInt(devXpertPuzzleInput.value);
    }
    let devXpertPuzzleSend = devXpertPuzzle.querySelector("#dev-xpert-puzzle-send") as HTMLButtonElement;
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
    }
}

function DEV_UPDATE_STATE_UI(): void {
    let devStateBtns: HTMLButtonElement[] = [];
    for (let i = 0; i <= 7; i++) {
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

    let difficultyInput = document.querySelector("#dev-difficulty num-value-input") as NumValueInput;
    difficultyInput.setValue(isFinite(Game.Instance.puzzle.data.difficulty) ? Game.Instance.puzzle.data.difficulty : 0);

    let devXpertPuzzleInput = document.querySelector("#dev-xpert-puzzle-input") as HTMLInputElement;
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
    let main: Game = new Game("render-canvas");
    await main.createScene();
    main.initialize().then(() => {
        main.animate();
    });
}

requestAnimationFrame(async () => {
    if (USE_POKI_SDK) {
        PokiSDK.init().then(() => {
            createAndInit();
        })
    }
    else if (USE_CG_SDK) {
        CrazySDK = (window as any).CrazyGames.SDK;
        await CrazySDK.init();
        createAndInit();
    }
    else {
        createAndInit();
    }
});