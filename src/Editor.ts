enum EditorBrush {
    None,
    Delete,
    Tile,
    Switch,
    Button,
    Door,
    Push,
    Hole,
    Wall,
    Water,
    Box,
    Ramp,
    Bridge,
    Creep,
    Tree,
    Nobori
}

class Editor {

    public active: boolean = false;

    public cursor: BABYLON.Mesh;
    public cursorOffset: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public cursorI: number = 0;
    public cursorJ: number = 0;
    public cursorH: number = 0;
    public get cursorW(): number {
        return Math.round(this.cursor.scaling.x / 1.1);
    }
    public get cursorD(): number {
        return Math.round(this.cursor.scaling.z / 1.1);
    }

    public brush: EditorBrush = EditorBrush.None;
    public brushColor: TileColor = TileColor.North;

    public ballCountButton: HTMLButtonElement;

    public p1OriginColorInput: NumValueInput;
    public p1OriginIInput: NumValueInput;
    public p1OriginJInput: NumValueInput;

    public p2OriginColorInput: NumValueInput;
    public p2OriginIInput: NumValueInput;
    public p2OriginJInput: NumValueInput;

    public widthInput: NumValueInput;
    public widthInsert: HTMLButtonElement;
    public widthDelete: HTMLButtonElement;
    public heightInput: NumValueInput;
    public heightInsert: HTMLButtonElement;
    public heightDelete: HTMLButtonElement;
    public floorMaterialInput: NumValueInput;

    public switchTileNorthButton: HTMLButtonElement;
    public switchTileEastButton: HTMLButtonElement;
    public switchTileSouthButton: HTMLButtonElement;
    public switchTileWestButton: HTMLButtonElement;
    public blockTileNorthButton: HTMLButtonElement;
    public blockTileEastButton: HTMLButtonElement;
    public blockTileSouthButton: HTMLButtonElement;
    public blockTileWestButton: HTMLButtonElement;
    public buttonTileOneButton: HTMLButtonElement;
    public buttonTileTwoButton: HTMLButtonElement;
    public buttonTileThreeButton: HTMLButtonElement;
    public doorTileOneButton: HTMLButtonElement;
    public doorTileTwoButton: HTMLButtonElement;
    public doorTileThreeButton: HTMLButtonElement;
    public pushTileButton: HTMLButtonElement;
    public holeButton: HTMLButtonElement;
    public wallButton: HTMLButtonElement;
    public waterButton: HTMLButtonElement;
    public boxButton: HTMLButtonElement;
    public ramp1Button: HTMLButtonElement;
    public ramp2Button: HTMLButtonElement;
    public ramp3Button: HTMLButtonElement;
    public ramp4Button: HTMLButtonElement;
    public bridgeButton: HTMLButtonElement;
    public creepButton: HTMLButtonElement;
    public treeButton: HTMLButtonElement;
    public noboriNButton: HTMLButtonElement;
    public noboriEButton: HTMLButtonElement;
    public noboriSButton: HTMLButtonElement;
    public noboriWButton: HTMLButtonElement;
    public deleteButton: HTMLButtonElement;

    public selectableButtons: HTMLButtonElement[] = [];

    public haikuIInput: NumValueInput;
    public haikuJInput: NumValueInput;
    public haikuContent: HTMLTextAreaElement;
    public haikuUpdateButton: HTMLButtonElement;

    public doClearButton: HTMLButtonElement;
    public clearButton: HTMLButtonElement;

    public publishForm: HTMLDivElement;
    public publishFormEdit: HTMLDivElement;
    public publishFormSuccess: HTMLDivElement;
    public publishFormFailure: HTMLDivElement;

    public publishCancelButton: HTMLButtonElement;
    public publishConfirmButton: HTMLButtonElement;
    public publishPendingButton: HTMLButtonElement;

    public titleInput: HTMLInputElement;
    public get title(): string {
        if (this.titleInput) {
            return this.titleInput.value;
        }
        return "";
    }
    public authorInput: HTMLInputElement;
    public get author(): string {
        if (this.authorInput) {
            return this.authorInput.value;
        }
        return "";
    }
    public puzzleIdInput: HTMLInputElement;
    public eulaCheckbox: HTMLInputElement;
    public get eulaAccepted(): boolean {
        if (this.eulaCheckbox) {
            return this.eulaCheckbox.checked;
        }
        return false;
    }

    public getScene(): BABYLON.Scene {
        return this.game.scene;
    }

    private _pendingPublish: boolean = false;

    public get puzzle(): Puzzle {
        return this.game.puzzle;
    }

    constructor(public game: Game) {

        this.cursor = Mummu.CreateLineBox("cursor", {
            width: 1,
            height: 1,
            depth: 1,
            color: new BABYLON.Color4(0, 1, 0, 1)
        });
        this.setCursorSize({ w: 1, h: 0, d: 1 });
    }

    public initValues(): void {
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

    public activate(): void {
        if (location.host.startsWith("127.0.0.1")) {
            (document.querySelector("#editor-haiku-container") as HTMLElement).style.display = "block";
        }
        this.ballCountButton = document.getElementById("ball-count-btn") as HTMLButtonElement;
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
        }

        this.p1OriginColorInput = document.getElementById("editor-p1-origin-color") as NumValueInput;
        this.p1OriginColorInput.onValueChange = (v: number) => {
            let color = v;
            this.puzzle.balls[0].setColor(color);
        }
        this.p1OriginColorInput.valueToString = (v: number) => {
            return TileColorNames[v];
        }

        this.p1OriginIInput = document.getElementById("editor-p1-origin-i") as NumValueInput;
        this.p1OriginIInput.onValueChange = (v: number) => {
            this.dropClear();
            this.puzzle.balls[0].i = Math.min(v, this.puzzle.w - 1);
        }

        this.p1OriginJInput = document.getElementById("editor-p1-origin-j") as NumValueInput;
        this.p1OriginJInput.onValueChange = (v: number) => {
            this.dropClear();
            this.puzzle.balls[0].j = Math.min(v, this.puzzle.h - 1);
        }

        this.p2OriginColorInput = document.getElementById("editor-p2-origin-color") as NumValueInput;
        this.p2OriginColorInput.onValueChange = (v: number) => {
            let color = v;
            if (this.puzzle.balls[1]) {
                this.puzzle.balls[1].setColor(color);
            }
        }
        this.p2OriginColorInput.valueToString = (v: number) => {
            return TileColorNames[v];
        }

        this.p2OriginIInput = document.getElementById("editor-p2-origin-i") as NumValueInput;
        this.p2OriginIInput.onValueChange = (v: number) => {
            this.dropClear();
            if (this.puzzle.balls[1]) {
                this.puzzle.balls[1].i = Math.min(v, this.puzzle.w - 1);
            }
        }

        this.p2OriginJInput = document.getElementById("editor-p2-origin-j") as NumValueInput;
        this.p2OriginJInput.onValueChange = (v: number) => {
            this.dropClear();
            if (this.puzzle.balls[1]) {
                this.puzzle.balls[1].j = Math.min(v, this.puzzle.h - 1);
            }
        }

        this.widthInput = document.getElementById("editor-width") as NumValueInput;
        this.widthInput.onValueChange = (v: number) => {
            this.dropClear();
            this.puzzle.w = Math.max(v, 3);
            this.puzzle.rebuildFloor();
        }

        this.floorMaterialInput = document.getElementById("editor-floor-material-index") as NumValueInput;
        this.floorMaterialInput.onValueChange = (v: number) => {
            this.puzzle.floorMaterialIndex = (v + this.game.materials.floorMaterials.length) % this.game.materials.floorMaterials.length;
            this.puzzle.rebuildFloor();
        }

        this.widthInsert = document.getElementById("editor-width-insert") as HTMLButtonElement;
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
            buildingBlocks = [new Array<number>(this.puzzle.h).fill(0, 0, this.puzzle.h), ...buildingBlocks];
            text = text + "x" + SerializeBuildingBlocks(buildingBlocks);

            this.puzzle.data.content = text;
            this.puzzle.reset();
            this.initValues();
        }

        this.widthDelete = document.getElementById("editor-width-delete") as HTMLButtonElement;
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
        }

        this.heightInput = document.getElementById("editor-height") as NumValueInput;
        this.heightInput.onValueChange = (v: number) => {
            this.dropClear();
            this.puzzle.h = Math.max(v, 3);
            this.puzzle.rebuildFloor();
        }

        this.heightInsert = document.getElementById("editor-height-insert") as HTMLButtonElement;
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
            })
            text = text + "x" + SerializeBuildingBlocks(buildingBlocks);

            this.puzzle.data.content = text;
            this.puzzle.reset();
            this.initValues();
        }

        this.heightDelete = document.getElementById("editor-height-delete") as HTMLButtonElement;
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
            })
            text = text + "x" + SerializeBuildingBlocks(buildingBlocks);

            this.puzzle.data.content = text;
            this.puzzle.reset();
            this.initValues();
        }

        this.switchTileNorthButton = document.getElementById("switch-north-btn") as HTMLButtonElement;
        this.switchTileEastButton = document.getElementById("switch-east-btn") as HTMLButtonElement;
        this.switchTileSouthButton = document.getElementById("switch-south-btn") as HTMLButtonElement;
        this.switchTileWestButton = document.getElementById("switch-west-btn") as HTMLButtonElement;
        this.blockTileNorthButton = document.getElementById("tile-north-btn") as HTMLButtonElement;
        this.blockTileEastButton = document.getElementById("tile-east-btn") as HTMLButtonElement;
        this.blockTileSouthButton = document.getElementById("tile-south-btn") as HTMLButtonElement;
        this.blockTileWestButton = document.getElementById("tile-west-btn") as HTMLButtonElement;
        this.buttonTileOneButton = document.getElementById("button-one-btn") as HTMLButtonElement;
        this.buttonTileTwoButton = document.getElementById("button-two-btn") as HTMLButtonElement;
        this.buttonTileThreeButton = document.getElementById("button-three-btn") as HTMLButtonElement;
        this.doorTileOneButton = document.getElementById("door-one-btn") as HTMLButtonElement;
        this.doorTileTwoButton = document.getElementById("door-two-btn") as HTMLButtonElement;
        this.doorTileThreeButton = document.getElementById("door-three-btn") as HTMLButtonElement;
        this.pushTileButton = document.getElementById("push-tile-btn") as HTMLButtonElement;
        this.holeButton = document.getElementById("hole-btn") as HTMLButtonElement;
        this.wallButton = document.getElementById("wall-btn") as HTMLButtonElement;
        this.waterButton = document.getElementById("water-btn") as HTMLButtonElement;
        this.boxButton = document.getElementById("box-btn") as HTMLButtonElement;
        this.ramp1Button = document.getElementById("ramp-1-btn") as HTMLButtonElement;
        this.ramp2Button = document.getElementById("ramp-2-btn") as HTMLButtonElement;
        this.ramp3Button = document.getElementById("ramp-3-btn") as HTMLButtonElement;
        this.ramp4Button = document.getElementById("ramp-4-btn") as HTMLButtonElement;
        this.bridgeButton = document.getElementById("bridge-btn") as HTMLButtonElement;
        this.creepButton = document.getElementById("creep-btn") as HTMLButtonElement;
        this.treeButton = document.getElementById("tree-btn") as HTMLButtonElement;
        this.noboriNButton = document.getElementById("nobori-n-btn") as HTMLButtonElement;
        this.noboriEButton = document.getElementById("nobori-e-btn") as HTMLButtonElement;
        this.noboriSButton = document.getElementById("nobori-s-btn") as HTMLButtonElement;
        this.noboriWButton = document.getElementById("nobori-w-btn") as HTMLButtonElement;
        this.deleteButton = document.getElementById("delete-btn") as HTMLButtonElement;

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
            this.noboriNButton,
            this.noboriEButton,
            this.noboriSButton,
            this.noboriWButton
        ];

        let makeBrushButton = (button: HTMLButtonElement, brush: EditorBrush, value?: number, cursorSize?: { w?: number, h?: number, d?: number }) => {
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
            }
        }

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
        makeBrushButton(this.noboriNButton, EditorBrush.Nobori, TileColor.North);
        makeBrushButton(this.noboriEButton, EditorBrush.Nobori, TileColor.East);
        makeBrushButton(this.noboriSButton, EditorBrush.Nobori, TileColor.South);
        makeBrushButton(this.noboriWButton, EditorBrush.Nobori, TileColor.West);

        makeBrushButton(this.deleteButton, EditorBrush.Delete);

        this.haikuIInput = document.getElementById("haiku-i") as NumValueInput;
        this.haikuIInput.onValueChange = (v) => {
            if (this.puzzle.haiku) {
                this.puzzle.haiku.position.x = v * 0.55;
            }
        }
        this.haikuJInput = document.getElementById("haiku-j") as NumValueInput;
        this.haikuJInput.onValueChange = (v) => {
            if (this.puzzle.haiku) {
                this.puzzle.haiku.position.z = v * 0.55;
            }
        }
        this.haikuContent = document.getElementById("haiku-content") as HTMLTextAreaElement;
        this.haikuUpdateButton = document.getElementById("haiku-update") as HTMLButtonElement;
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
        }
        
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

        document.getElementById("load-file-input").onchange = (event: Event) => {            
            let files = (event.target as HTMLInputElement).files;
            let file = files[0];
            if (file) {
                const reader = new FileReader();
                reader.addEventListener('load', async (event) => {
                    let content = event.target.result as string;
                    let haiku: string;
                    if (content && typeof(content) === "string") {
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
        
        this.publishForm = document.getElementById("editor-publish-form") as HTMLDivElement;
        this.publishFormEdit = document.getElementById("editor-publish-form-edit") as HTMLDivElement;
        this.publishFormSuccess = document.getElementById("editor-publish-form-success") as HTMLDivElement;
        this.publishFormFailure = document.getElementById("editor-publish-form-failure") as HTMLDivElement;

        this.publishCancelButton = document.querySelector("#publish-cancel-btn") as HTMLButtonElement;
        this.publishConfirmButton = document.querySelector("#publish-confirm-btn") as HTMLButtonElement;
        this.publishPendingButton = document.querySelector("#publish-pending-btn") as HTMLButtonElement;

        this.titleInput = document.querySelector("#title-input") as HTMLInputElement;
        this.authorInput = document.querySelector("#author-input") as HTMLInputElement;
        this.puzzleIdInput = document.querySelector("#id-input") as HTMLInputElement;
        this.eulaCheckbox = document.querySelector("#eula-checkbox") as HTMLInputElement;

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
                }
                let headers: any = {
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
                (document.querySelector("#publish-generated-url-go").parentElement as HTMLAnchorElement).href = url;
                (document.querySelector("#publish-generated-url-copy") as HTMLButtonElement).onpointerup = () => { navigator.clipboard.writeText(url); };
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
            (btn as HTMLButtonElement).onpointerup = () => {
                this.publishForm.style.display = "none";
            }
        })

        this.clearButton = document.getElementById("clear-btn") as HTMLButtonElement;
        this.doClearButton = document.getElementById("doclear-btn") as HTMLButtonElement;

        this.clearButton.onpointerup = () => {
            this.clearButton.parentElement.style.display = "none";
            this.doClearButton.parentElement.style.display = "block";
        }

        this.doClearButton.onpointerup = async () => {
            this.dropClear();
            await this.puzzle.loadFromFile("./datas/levels/min.txt");
            await this.puzzle.instantiate();
            this.initValues();
            this.updatePublishText();
        }

        this.game.canvas.addEventListener("pointerdown", this.pointerDown);
        this.game.canvas.addEventListener("pointerup", this.pointerUp);

        this.game.camera.attachControl();

        this.updatePublishText();
        this.initValues();

        this.active = true;
    }

    public deactivate(): void {
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

    public dropClear(): void {
        this.clearButton.parentElement.style.display = "";
        this.doClearButton.parentElement.style.display = "none";
    }

    public dropBrush(): void {
        this.unselectAllButtons();
        this.brush = EditorBrush.None;
    }

    public unselectAllButtons(): void {
        this.selectableButtons.forEach(button => {
            button.classList.remove("selected");
        })
    }

    public updatePublishText(): void {
        if (DEV_MODE_ACTIVATED) {
            this.puzzleIdInput.parentElement.style.display = "";
            if (this.puzzle.data.id) {
                (this.puzzleIdInput as HTMLInputElement).value = this.puzzle.data.id.toFixed(0);
            }
            this.titleInput.value = this.puzzle.data.title;
            this.authorInput.value = this.puzzle.data.author;
        }
        else {
            this.puzzleIdInput.parentElement.style.display = "none";
        }
    }

    public updatePublishBtn = () => {
        if (this.title.length > 2 && this.author.length > 2 && this.eulaAccepted) {
            document.getElementById("publish-confirm-btn").classList.add("lightblue");
            document.getElementById("publish-confirm-btn").classList.remove("locked");
        }
        else {
            document.getElementById("publish-confirm-btn").classList.remove("lightblue");
            document.getElementById("publish-confirm-btn").classList.add("locked");
        }
    }

    public setPublishState(state: number): void {
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

    public setCursorSize(size: { w?: number, h?: number, d?: number }): void {
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

    private _pointerX: number = 0;
    private _pointerY: number = 0;

    public update = (dt: number) => {
        if (this.active) {
            let pick = this.game.scene.pick(
                this.game.scene.pointerX * window.devicePixelRatio,
                this.game.scene.pointerY * window.devicePixelRatio,
                (mesh) => {
                    return mesh.name === "floor" || mesh.name === "building-floor" || mesh === this.puzzle.invisiFloorTM;
                }
            )
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
    }

    public pointerDown = (ev: PointerEvent) => {
        this._pointerX = ev.clientX;
        this._pointerY = ev.clientY;    
    }

    public pointerUp = (ev: PointerEvent) => {
        let dx = ev.clientX - this._pointerX;
        let dy = ev.clientY - this._pointerY;
        let dd = dx * dx + dy * dy;
        if (dd < 9) {
            let pick = this.game.scene.pick(
                this.game.scene.pointerX * window.devicePixelRatio,
                this.game.scene.pointerY * window.devicePixelRatio,
                (mesh) => {
                    return mesh.name === "floor" || mesh.name === "building-floor" || mesh === this.puzzle.invisiFloorTM;
                }
            )
            if (pick.hit) {
                if (ev.button === 2 || this.brush === EditorBrush.Delete) {
                    let tile = this.puzzle.tiles.find(tile => {
                        return tile.isDecor && tile.i === this.cursorI && tile.j === this.cursorJ && Math.abs(tile.position.y - this.cursorH) < 0.3;
                    });
                    if (!tile) {
                        tile = this.puzzle.tiles.find(tile => {
                            return tile.i === this.cursorI && tile.j === this.cursorJ && Math.abs(tile.position.y - this.cursorH) < 0.3;
                        });
                    }

                    if (tile instanceof DoorTile && !tile.closed) {
                        tile.close(0);
                    }
                    else if (tile instanceof HoleTile && !tile.covered) {
                        tile.covered = true;
                        tile.instantiate();
                    }
                    else if (tile instanceof Nobori && !tile.rightSide) {
                        tile.rightSide = true;
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
                        return tile.isDecor && tile.i === this.cursorI && tile.j === this.cursorJ && Math.abs(tile.position.y - this.cursorH) < 0.3;
                    });
                    if (!tile) {
                        tile = this.puzzle.tiles.find(tile => {
                            return tile.i === this.cursorI && tile.j === this.cursorJ && Math.abs(tile.position.y - this.cursorH) < 0.3;
                        });
                    }

                    if (this.brush === EditorBrush.Tile && (!tile || tile.isDecor)) {
                        tile = new BlockTile(
                            this.game,
                            {
                                i: this.cursorI,
                                j: this.cursorJ,
                                h: this.cursorH,
                                color: this.brushColor
                            }
                        )
                    }
                    else if (this.brush === EditorBrush.Switch && (!tile || tile.isDecor)) {
                        tile = new SwitchTile(
                            this.game,
                            {
                                i: this.cursorI,
                                j: this.cursorJ,
                                h: this.cursorH,
                                color: this.brushColor
                            }
                        )
                    }
                    else if (this.brush === EditorBrush.Button && (!tile || tile.isDecor)) {
                        tile = new ButtonTile(
                            this.game,
                            {
                                i: this.cursorI,
                                j: this.cursorJ,
                                h: this.cursorH,
                                color: this.brushColor,
                                value: this.brushColor
                            }
                        )
                    }
                    else if (this.brush === EditorBrush.Door && (!tile || tile.isDecor)) {
                        tile = new DoorTile(
                            this.game,
                            {
                                i: this.cursorI,
                                j: this.cursorJ,
                                h: this.cursorH,
                                color: this.brushColor,
                                value: this.brushColor
                            }
                        )
                    }
                    else if (this.brush === EditorBrush.Push && (!tile || tile.isDecor)) {
                        tile = new PushTile(
                            this.game,
                            {
                                i: this.cursorI,
                                j: this.cursorJ,
                                h: this.cursorH,
                                color: this.brushColor
                            }
                        )
                    }
                    else if (this.brush === EditorBrush.Hole && (!tile || tile.isDecor)) {
                        tile = new HoleTile(
                            this.game,
                            {
                                i: this.cursorI,
                                j: this.cursorJ,
                                color: this.brushColor,
                                noShadow: true
                            }
                        )
                    }
                    else if (this.brush === EditorBrush.Wall && (!tile || tile.isDecor)) {
                        tile = new WallTile(
                            this.game,
                            {
                                i: this.cursorI,
                                j: this.cursorJ,
                                color: this.brushColor,
                                noShadow: true
                            }
                        )
                    }
                    else if (this.brush === EditorBrush.Water && (!tile || tile.isDecor)) {
                        tile = new WaterTile(
                            this.game,
                            {
                                i: this.cursorI,
                                j: this.cursorJ,
                                color: this.brushColor,
                                noShadow: true
                            }
                        )
                    }
                    else if (this.brush === EditorBrush.Box && (!tile || tile.isDecor)) {
                        this.puzzle.buildingBlockSet(1, this.cursorI, this.cursorJ);
                        this.puzzle.editorRegenerateBuildings();
                    }
                    else if (this.brush === EditorBrush.Ramp && (!tile || tile.isDecor)) {
                        let box = new Ramp(
                            this.game,
                            {
                                i: this.cursorI,
                                j: this.cursorJ,
                                size: this.brushColor
                            }
                        );
                        this.puzzle.editorRegenerateBuildings();
                    }
                    else if (this.brush === EditorBrush.Bridge && (!tile || tile.isDecor)) {
                        let box = new Bridge(
                            this.game,
                            {
                                i: this.cursorI,
                                j: this.cursorJ
                            }
                        );
                        this.puzzle.editorRegenerateBuildings();
                    }
                    else if (this.brush === EditorBrush.Creep && (!tile || tile.isDecor)) {
                        let creep = new Creep(
                            this.puzzle,
                            {
                                i: this.cursorI,
                                j: this.cursorJ,
                                h: this.cursorH
                            }
                        );
                        creep.instantiate();
                    }
                    else if (this.brush === EditorBrush.Tree && (!tile || tile.isDecor)) {
                        tile = new CherryTree(
                            this.game,
                            {
                                i: this.cursorI,
                                j: this.cursorJ,
                                color: this.brushColor,
                                noShadow: true
                            }
                        )
                    }
                    else if (this.brush === EditorBrush.Nobori && (!tile || !tile.isDecor)) {
                        tile = new Nobori(
                            this.game,
                            {
                                i: this.cursorI,
                                j: this.cursorJ,
                                h: this.cursorH,
                                color: this.brushColor
                            }
                        )
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

    public SwitchToMiniatureCamera(): void {
        let cam = this.game.camera;
        cam.mode = 1;

        cam.orthoTop = 5;
        cam.orthoBottom = -5;
        cam.orthoRight = 5 * this.game.screenRatio;
        cam.orthoLeft = -5 * this.game.screenRatio;

        cam.target.x = 0.5 * (this.puzzle.xMin + this.puzzle.xMax);
        cam.target.y = 0;
        cam.target.z = 0.5 * (this.puzzle.zMin + this.puzzle.zMax);

        cam.alpha = - Math.PI * 0.6;
        cam.beta = Math.PI * 0.2;
    }
}