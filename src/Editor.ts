enum EditorBrush {
    None,
    Delete,
    Tile,
    Switch,
    Push,
    Hole,
    Rock,
    Box,
    Ramp,
    Bridge
}

class Editor {

    public active: boolean = false;

    public cursor: BABYLON.Mesh;
    public cursorOffset: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public cursorI: number = 0;
    public cursorJ: number = 0;
    public cursorH: number = 0;

    public invisiFloorTM: BABYLON.Mesh;
    public brush: EditorBrush = EditorBrush.None;
    public brushColor: TileColor = TileColor.North;

    public originColorInput: NumValueInput;
    public originIInput: NumValueInput;
    public originJInput: NumValueInput;
    public widthInput: NumValueInput;
    public heightInput: NumValueInput;

    public switchTileNorthButton: HTMLButtonElement;
    public switchTileEastButton: HTMLButtonElement;
    public switchTileSouthButton: HTMLButtonElement;
    public switchTileWestButton: HTMLButtonElement;
    public blockTileNorthButton: HTMLButtonElement;
    public blockTileEastButton: HTMLButtonElement;
    public blockTileSouthButton: HTMLButtonElement;
    public blockTileWestButton: HTMLButtonElement;
    public pushTileButton: HTMLButtonElement;
    public holeButton: HTMLButtonElement;
    public rockButton: HTMLButtonElement;
    public boxButton: HTMLButtonElement;
    public rampButton: HTMLButtonElement;
    public bridgeButton: HTMLButtonElement;
    public deleteButton: HTMLButtonElement;
    public doClearButton: HTMLButtonElement;
    public clearButton: HTMLButtonElement;

    public selectableButtons: HTMLButtonElement[] = [];

    constructor(public game: Game) {
        this.invisiFloorTM = BABYLON.MeshBuilder.CreateGround("invisifloor", { width: 10, height: 10 } );
        this.invisiFloorTM.position.x = 5 - 0.55;
        this.invisiFloorTM.position.y = - 0.01;
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

    public initValues(): void {
        this.originColorInput.setValue(this.game.ball.color);
        this.originIInput.setValue(this.game.ball.i);
        this.originJInput.setValue(this.game.ball.j);
        this.widthInput.setValue(this.game.puzzle.w);
        this.heightInput.setValue(this.game.puzzle.h);
    }

    public activate(): void {
        this.originColorInput = document.getElementById("editor-origin-color") as NumValueInput;
        this.originColorInput.onValueChange = (v: number) => {
            let color = v;
            this.game.ball.setColor(color);
        }
        this.originColorInput.valueToString = (v: number) => {
            return TileColorNames[v];
        }

        this.originIInput = document.getElementById("editor-origin-i") as NumValueInput;
        this.originIInput.onValueChange = (v: number) => {
            this.dropClear();
            this.game.ball.i = Math.min(v, this.game.puzzle.w - 1);
        }

        this.originJInput = document.getElementById("editor-origin-j") as NumValueInput;
        this.originJInput.onValueChange = (v: number) => {
            this.dropClear();
            this.game.ball.j = Math.min(v, this.game.puzzle.h - 1);
        }

        this.widthInput = document.getElementById("editor-width") as NumValueInput;
        this.widthInput.onValueChange = (v: number) => {
            this.dropClear();
            this.game.puzzle.w = Math.max(v, 3);
            this.game.puzzle.rebuildFloor();
            this.updateInvisifloorTM();
        }

        this.heightInput = document.getElementById("editor-height") as NumValueInput;
        this.heightInput.onValueChange = (v: number) => {
            this.dropClear();
            this.game.puzzle.h = Math.max(v, 3);
            this.game.puzzle.rebuildFloor();
            this.updateInvisifloorTM();
        }

        this.switchTileNorthButton = document.getElementById("switch-north-btn") as HTMLButtonElement;
        this.switchTileEastButton = document.getElementById("switch-east-btn") as HTMLButtonElement;
        this.switchTileSouthButton = document.getElementById("switch-south-btn") as HTMLButtonElement;
        this.switchTileWestButton = document.getElementById("switch-west-btn") as HTMLButtonElement;
        this.blockTileNorthButton = document.getElementById("tile-north-btn") as HTMLButtonElement;
        this.blockTileEastButton = document.getElementById("tile-east-btn") as HTMLButtonElement;
        this.blockTileSouthButton = document.getElementById("tile-south-btn") as HTMLButtonElement;
        this.blockTileWestButton = document.getElementById("tile-west-btn") as HTMLButtonElement;
        this.pushTileButton = document.getElementById("push-tile-btn") as HTMLButtonElement;
        this.holeButton = document.getElementById("hole-btn") as HTMLButtonElement;
        this.rockButton = document.getElementById("rock-btn") as HTMLButtonElement;
        this.boxButton = document.getElementById("box-btn") as HTMLButtonElement;
        this.rampButton = document.getElementById("ramp-btn") as HTMLButtonElement;
        this.bridgeButton = document.getElementById("bridge-btn") as HTMLButtonElement;
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
            this.pushTileButton,
            this.holeButton,
            this.rockButton,
            this.boxButton,
            this.rampButton,
            this.bridgeButton
        ];

        let makeBrushButton = (button: HTMLButtonElement, brush: EditorBrush, brushColor?: TileColor, cursorSize?: { w?: number, h?: number, d?: number }) => {
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

        makeBrushButton(this.pushTileButton, EditorBrush.Push);
        makeBrushButton(this.holeButton, EditorBrush.Hole);
        makeBrushButton(this.rockButton, EditorBrush.Rock);
        makeBrushButton(this.boxButton, EditorBrush.Box, undefined, { w: 2, h: 1, d: 2 });
        makeBrushButton(this.rampButton, EditorBrush.Ramp, undefined, { w: 2, h: 1, d: 3 });
        makeBrushButton(this.bridgeButton, EditorBrush.Bridge, undefined, { w: 4, h: 1, d: 2 });

        makeBrushButton(this.deleteButton, EditorBrush.Delete);
        
        
        document.getElementById("play-btn").onclick = async () => {
            this.dropClear();
            this.dropBrush();
            this.game.puzzle.data = {
                id: -1,
                title: "Custom Machine",
                author: "Editor",
                content: this.game.puzzle.saveAsText()
            };
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

        document.getElementById("load-file-input").onchange = (event: Event) => {            
            let files = (event.target as HTMLInputElement).files;
            let file = files[0];
            if (file) {
                const reader = new FileReader();
                reader.addEventListener('load', async (event) => {
                    let content = event.target.result as string;
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
        
        document.getElementById("publish-btn").onclick = async () => {
            this.dropClear();
            this.dropBrush();
            document.getElementById("editor-publish-form").style.display = "";
            document.getElementById("editor-publish-form-edit").style.display = "block";
            document.getElementById("editor-publish-form-success").style.display = "none";
            document.getElementById("editor-publish-form-failure").style.display = "none";
            (document.getElementById("eula-checkbox") as HTMLInputElement).checked = false;
            document.getElementById("publish-confirm-btn").classList.remove("lightblue");
            document.getElementById("publish-confirm-btn").classList.add("locked");
        };

        (document.getElementById("eula-checkbox") as HTMLInputElement).onchange = () => {
            if ((document.getElementById("eula-checkbox") as HTMLInputElement).checked) {
                document.getElementById("publish-confirm-btn").classList.add("lightblue");
                document.getElementById("publish-confirm-btn").classList.remove("locked");
            }
            else {
                document.getElementById("publish-confirm-btn").classList.remove("lightblue");
                document.getElementById("publish-confirm-btn").classList.add("locked");
            }
        }
        
        document.getElementById("publish-confirm-btn").onclick = async () => {
            let data = {
                title: (document.querySelector("#title-input") as HTMLInputElement).value,
                author: (document.querySelector("#author-input") as HTMLInputElement).value,
                content: this.game.puzzle.saveAsText()
            }
            let dataString = JSON.stringify(data);
            try {
                const response = await fetch(SHARE_SERVICE_PATH + "publish_puzzle", {
                    method: "POST",
                    mode: "cors",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: dataString,
                });
                let id = parseInt(await response.text());
                let url = "https://html-classic.itch.zone/html/11779106/carillion-build/index.html?puzzle=" + id.toFixed(0);
                document.querySelector("#publish-generated-url").setAttribute("value", url);
                document.getElementById("editor-publish-form-edit").style.display = "none";
                document.getElementById("editor-publish-form-success").style.display = "block";
                document.getElementById("editor-publish-form-failure").style.display = "none";
            }
            catch (e) {
                document.getElementById("editor-publish-form-edit").style.display = "none";
                document.getElementById("editor-publish-form-success").style.display = "none";
                document.getElementById("editor-publish-form-failure").style.display = "block";
            }
        };
        
        document.getElementById("publish-read-eula-btn").onclick = async () => {
            this.game.router.eulaPage.show(0);
        };
        
        document.getElementById("publish-cancel-btn").onclick = async () => {
            document.getElementById("editor-publish-form").style.display = "none";
        };

        document.querySelectorAll(".publish-ok-btn").forEach(btn => {
            (btn as HTMLButtonElement).onclick = () => {
                document.getElementById("editor-publish-form").style.display = "none";
            }
        })

        this.clearButton = document.getElementById("clear-btn") as HTMLButtonElement;
        this.doClearButton = document.getElementById("doclear-btn") as HTMLButtonElement;

        this.clearButton.onclick = () => {
            this.clearButton.parentElement.style.display = "none";
            this.doClearButton.parentElement.style.display = "block";
        }

        this.doClearButton.onclick = async () => {
            this.dropClear();
            await this.game.puzzle.loadFromFile("./datas/levels/min.txt");
            await this.game.puzzle.instantiate();
            this.initValues();
        }

        this.game.canvas.addEventListener("pointerdown", this.pointerDown);
        this.game.canvas.addEventListener("pointerup", this.pointerUp);

        this.game.camera.attachControl();

        this.updateInvisifloorTM();
        this.initValues();

        this.active = true;
    }

    public deactivate(): void {
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

    public updateInvisifloorTM(): void {
        let w = this.game.puzzle.xMax - this.game.puzzle.xMin;
        let h = this.game.puzzle.zMax - this.game.puzzle.zMin;
        BABYLON.CreateGroundVertexData({ width: w, height: h }).applyToMesh(this.invisiFloorTM);
        this.invisiFloorTM.position.x = 0.5 * w;
        this.invisiFloorTM.position.z = 0.5 * h;
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
                this.game.scene.pointerX,
                this.game.scene.pointerY,
                (mesh) => {
                    return mesh.name === "floor" || mesh.name === "building-floor" || mesh === this.invisiFloorTM;
                }
            )
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
                this.game.scene.pointerX,
                this.game.scene.pointerY,
                (mesh) => {
                    return mesh.name === "floor" || mesh.name === "building-floor" || mesh === this.invisiFloorTM;
                }
            )
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
                        else if (this.brush === EditorBrush.Switch) {
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
                        else if (this.brush === EditorBrush.Push) {
                            tile = new PushTile(
                                this.game,
                                {
                                    i: this.cursorI,
                                    j: this.cursorJ,
                                    color: this.brushColor
                                }
                            )
                        }
                        else if (this.brush === EditorBrush.Hole) {
                            tile = new HoleTile(
                                this.game,
                                {
                                    i: this.cursorI,
                                    j: this.cursorJ,
                                    color: this.brushColor
                                }
                            )
                        }
                        else if (this.brush === EditorBrush.Rock) {
                            tile = new RockTile(
                                this.game,
                                {
                                    i: this.cursorI,
                                    j: this.cursorJ,
                                    color: this.brushColor
                                }
                            )
                        }
                        else if (this.brush === EditorBrush.Box) {
                            let box = new Box(
                                this.game,
                                {
                                    i: this.cursorI,
                                    j: this.cursorJ
                                }
                            );
                            this.game.puzzle.editorRegenerateBuildings();
                        }
                        else if (this.brush === EditorBrush.Ramp) {
                            let box = new Ramp(
                                this.game,
                                {
                                    i: this.cursorI,
                                    j: this.cursorJ
                                }
                            );
                            this.game.puzzle.editorRegenerateBuildings();
                        }
                        else if (this.brush === EditorBrush.Bridge) {
                            let box = new Bridge(
                                this.game,
                                {
                                    i: this.cursorI,
                                    j: this.cursorJ
                                }
                            );
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
    }
}