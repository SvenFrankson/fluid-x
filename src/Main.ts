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
    document.getElementById("touch-input").style.display = "";
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

var TileColorNames = [
    "North",
    "East",
    "South",
    "West"
]

enum GameMode {
    Menu,
    Play,
    Editor
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

    public camera: BABYLON.ArcRotateCamera;
    public menuCamAlpha: number = - Math.PI * 0.75;
    public menuCamBeta: number = Math.PI * 0.3;
    public menuCamRadius: number = 15;
    public playCameraRange: number = 12;
    public playCameraRadius: number = 20;
    public playCameraMinRadius: number = 15;

    public cameraOrtho: boolean = false;

    public light: BABYLON.HemisphericLight;
    public shadowGenerator: BABYLON.ShadowGenerator;

    public noiseTexture: BABYLON.RawTexture3D;
    public vertexDataLoader: Mummu.VertexDataLoader;

    public colorMaterials: BABYLON.Material[];
    public whiteMaterial: BABYLON.StandardMaterial;
    public salmonMaterial: BABYLON.StandardMaterial;
    public brownMaterial: BABYLON.StandardMaterial;
    public grayMaterial: BABYLON.StandardMaterial;
    public blackMaterial: BABYLON.StandardMaterial;
    public floorMaterial: BABYLON.StandardMaterial;
    public darkFloorMaterial: BABYLON.StandardMaterial;
    public shadow9Material: BABYLON.StandardMaterial;
    public shadowDiscMaterial: BABYLON.StandardMaterial;
    public puzzle: Puzzle;
    public ball: Ball;

    public tiaratumGameLevels: IPuzzlesData;
    public router: CarillonRouter;
    public timerText: HTMLDivElement;
    public puzzleIntro: HTMLDivElement;
    public successPanel: HTMLDivElement;
    public gameoverPanel: HTMLDivElement;
    public editor: Editor;
    public mode: GameMode = GameMode.Menu;

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

        this.timerText = document.querySelector("#play-timer");
        this.puzzleIntro = document.querySelector("#puzzle-intro");
        this.successPanel = document.querySelector("#play-success-panel");
        this.gameoverPanel = document.querySelector("#play-gameover-panel");

        this.light = new BABYLON.HemisphericLight("light", (new BABYLON.Vector3(2, 4, 3)).normalize(), this.scene);
        this.light.groundColor.copyFromFloats(0.3, 0.3, 0.3);

        this.camera = new BABYLON.ArcRotateCamera("camera", - Math.PI * 0.5, Math.PI * 0.1, 15, BABYLON.Vector3.Zero());
        this.camera.wheelPrecision *= 10;
        this.updatePlayCameraRadius();

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

        let storyModePuzzlesContent: string = "";
        try {
            const response = await fetch(SHARE_SERVICE_PATH + "get_puzzles/0/20/2", {
                method: "GET",
                mode: "cors"
            });
            storyModePuzzlesContent = await response.text();
        }
        catch (e) {
            const response = await fetch("./datas/levels/tiaratum_levels.json", {
                method: "GET",
                mode: "cors"
            });
            storyModePuzzlesContent = await response.text();
        }
        
        let data = JSON.parse(storyModePuzzlesContent) as IPuzzlesData;
        CLEAN_IPuzzlesData(data);
        for (let i = 0; i < data.puzzles.length; i++) {
            data.puzzles[i].title = (i + 1).toFixed(0) + ". " + data.puzzles[i].title;
        }

        this.tiaratumGameLevels = data;
        for (let i = 0; i < this.tiaratumGameLevels.puzzles.length; i++) {
            this.tiaratumGameLevels.puzzles[i].numLevel = (i + 1);
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
        
        document.body.addEventListener("touchstart", onFirstPlayerInteractionTouch);
        document.body.addEventListener("click", onFirstPlayerInteractionClic);
        document.body.addEventListener("keydown", onFirstPlayerInteractionKeyboard);
        
        document.getElementById("click-anywhere-screen").style.display = "none";

        (document.querySelector("#success-score-btn") as HTMLButtonElement).onclick = () => {
            this.puzzle.submitHighscore();
        }

        this.router = new CarillonRouter(this);
        this.router.initialize();
        this.router.start();

        (document.querySelector("#reset-btn") as HTMLButtonElement).onclick = () => {
            this.puzzle.reset();
        }

        (document.querySelector("#dev-mode-activate-btn") as HTMLButtonElement).onclick = () => {
            DEV_ACTIVATE();
        }

        (document.querySelector("#eula-back-btn") as HTMLButtonElement).onclick = () => {
            this.router.eulaPage.hide(0);
        }

        let devSecret = 0;
        let devSecretTimout: number = 0;
        (document.querySelector("#home h1") as HTMLHeadingElement).style.pointerEvents = "auto";
        (document.querySelector("#home h1") as HTMLDivElement).onclick = () => {
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

        let updateCamMenuData = () => {
            this.menuCamAlpha = - Math.PI * 0.5 + (Math.random() - 0.5) * 2 * Math.PI * 0.4;
            this.menuCamBeta = Math.PI * 0.3 + (Math.random() - 0.5) * 2 * Math.PI * 0.1;
            this.menuCamRadius = 15 + (Math.random() - 0.5) * 2 * 5;

            setTimeout(updateCamMenuData, 2000 + 4000 * Math.random());
        }
        updateCamMenuData();

        let ambient = new BABYLON.Sound("ambient", "./datas/sounds/zen-ambient.mp3", this.scene, undefined, {
            autoplay: true,
            loop: true
        });
        ambient.setVolume(0.2);

        var url = window.location;
        console.log(url);

        let puzzleId: number;
        if (location.search != "") {
            let puzzleIdStr = location.search.replace("?puzzle=", "");
            if (puzzleIdStr) {
                puzzleId = parseInt(puzzleIdStr);
                if (puzzleId) {
                    location.hash = "#play-community-" + puzzleId;
                }
            }
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

        if (this.timerText) {
            let strokes = this.timerText.querySelectorAll("stroke-text") as NodeListOf<StrokeText>;
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
        this.playCameraRadius = Math.max(this.playCameraMinRadius, this.playCameraRange / Math.tan(minFov));
    }

    public movieIdleDir: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public factoredTimeSinceGameStart: number = 0;
    public averagedFPS: number = 0;
    public updateConfigTimeout: number = - 1;
    public update(): void {
        let rawDT = this.scene.deltaTime / 1000;
        if (isFinite(rawDT)) {
            if (this.mode === GameMode.Play) {
                rawDT = Math.min(rawDT, 1);
                let targetCameraPos = this.ball.position.clone();
                let margin = 5;
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
                    targetCameraPos.z = (this.puzzle.zMin + this.puzzle.zMax) * 0.5;
                }
                
                let f = Nabu.Easing.smooth1Sec(1 / rawDT);
                BABYLON.Vector3.LerpToRef(this.camera.target, targetCameraPos, (1 - f), this.camera.target);
                let f3 = Nabu.Easing.smooth3Sec(1 / rawDT);
                this.camera.alpha = this.camera.alpha * f3 + (- Math.PI * 0.5) * (1 - f3);
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
                let targetCameraPos = new BABYLON.Vector3(
                    0.5 * (this.puzzle.xMin + this.puzzle.xMax),
                    0,
                    0.5 * (this.puzzle.zMin + this.puzzle.zMax)
                )
                
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

    public fadeIntroDir: number = 0;

    public async fadeInIntro(duration: number = 1): Promise<void> {
        this.puzzleIntro.style.opacity = "0";

        let t0 = performance.now();
        let step = () => {
            if (this.fadeIntroDir < 0) {
                return;
            }
            let f = (performance.now() - t0) / 1000 / duration;
            if (f < 1) {
                this.puzzleIntro.style.opacity = f.toFixed(2);
                requestAnimationFrame(step);
            }
            else {
                this.puzzleIntro.style.opacity = "1";
            }
        }
        this.fadeIntroDir = 1;
        step();
    }

    public async fadeOutIntro(duration: number = 1): Promise<void> {
        this.puzzleIntro.style.opacity = "1";

        let t0 = performance.now();
        let step = () => {
            if (this.fadeIntroDir > 0) {
                return;
            }
            let f = (performance.now() - t0) / 1000 / duration;
            if (f < 1) {
                this.puzzleIntro.style.opacity = (1 - f).toFixed(2);
                requestAnimationFrame(step);
            }
            else {
                this.puzzleIntro.style.opacity = "0";
            }
        }
        this.fadeIntroDir = -1;
        step();
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

async function DEV_GENERATE_STORYMODE_LEVEL_FILE(): Promise<void> {
    const response = await fetch(SHARE_SERVICE_PATH + "get_puzzles/0/20/2", {
        method: "GET",
        mode: "cors"
    });

    if (response.status === 200) {
        let data = await response.json();
        Nabu.download("tiaratum_levels.json", JSON.stringify(data));
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
    for (let i = 0; i <= 5; i++) {
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
                console.log(await response.text());
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
            console.log(await response.text());
        }
    }
}

function DEV_UPDATE_STATE_UI(): void {
    let devStateBtns: HTMLButtonElement[] = [];
    for (let i = 0; i <= 5; i++) {
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
    createAndInit();
});