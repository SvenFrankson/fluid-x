enum EditorBrush {
    None,
    Delete,
    Tile,
    Switch,
    Push,
    Hole,
    Box,
    Ramp,
    Bridge
}

class Editor {

    public invisiFloorTM: BABYLON.Mesh;
    public brush: EditorBrush = EditorBrush.None;
    public brushColor: TileColor = TileColor.North;

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
    public boxButton: HTMLButtonElement;
    public rampButton: HTMLButtonElement;
    public bridgeButton: HTMLButtonElement;
    public doClearButton: HTMLButtonElement;
    public clearButton: HTMLButtonElement;

    public selectableButtons: HTMLButtonElement[] = [];

    constructor(public game: Game) {
        this.invisiFloorTM = BABYLON.MeshBuilder.CreateGround("invisifloor", { width: 100, height: 100 } );
        this.invisiFloorTM.position.x = 50 - 0.55;
        this.invisiFloorTM.position.y = - 0.01;
        this.invisiFloorTM.position.z = 50 - 0.55;
        this.invisiFloorTM.isVisible = false;
    }

    public activate(): void {
        (document.querySelector("#ball-i-value stroke-text") as StrokeText).setContent(this.game.ball.i.toFixed(0));
        (document.querySelector("#ball-j-value stroke-text") as StrokeText).setContent(this.game.ball.j.toFixed(0));
        (document.querySelector("#width-value stroke-text") as StrokeText).setContent(this.game.puzzle.w.toFixed(0));
        (document.querySelector("#height-value stroke-text") as StrokeText).setContent(this.game.puzzle.h.toFixed(0));

        document.getElementById("ball-i-minus").onclick = () => {
            this.dropClear();
            this.game.ball.i = Math.max(this.game.ball.i - 1, 0);
            (document.querySelector("#ball-i-value stroke-text") as StrokeText).setContent(this.game.ball.i.toFixed(0));
        };

        document.getElementById("ball-i-plus").onclick = () => {
            this.dropClear();
            this.game.ball.i = Math.min(this.game.ball.i + 1, this.game.puzzle.w - 1);
            (document.querySelector("#ball-i-value stroke-text") as StrokeText).setContent(this.game.ball.i.toFixed(0));
        };
        
        document.getElementById("ball-j-minus").onclick = () => {
            this.dropClear();
            this.game.ball.j = Math.max(this.game.ball.j - 1, 0);
            (document.querySelector("#ball-j-value stroke-text") as StrokeText).setContent(this.game.ball.j.toFixed(0));
        };

        document.getElementById("ball-j-plus").onclick = () => {
            this.dropClear();
            this.game.ball.j = Math.min(this.game.ball.j + 1, this.game.puzzle.h - 1);
            (document.querySelector("#ball-j-value stroke-text") as StrokeText).setContent(this.game.ball.j.toFixed(0));
        };

        document.getElementById("width-minus").onclick = () => {
            this.dropClear();
            this.game.puzzle.w = Math.max(this.game.puzzle.w - 1, 3);
            (document.querySelector("#width-value stroke-text") as StrokeText).setContent(this.game.puzzle.w.toFixed(0));
            this.game.puzzle.rebuildFloor();
        };

        document.getElementById("width-plus").onclick = () => {
            this.dropClear();
            this.game.puzzle.w = Math.min(this.game.puzzle.w + 1, 100);
            (document.querySelector("#width-value stroke-text") as StrokeText).setContent(this.game.puzzle.w.toFixed(0));
            this.game.puzzle.rebuildFloor();
        };

        document.getElementById("height-minus").onclick = () => {
            this.dropClear();
            this.game.puzzle.h = Math.max(this.game.puzzle.h - 1, 3);
            (document.querySelector("#height-value stroke-text") as StrokeText).setContent(this.game.puzzle.h.toFixed(0));
            this.game.puzzle.rebuildFloor();
        };

        document.getElementById("height-plus").onclick = () => {
            this.dropClear();
            this.game.puzzle.h = Math.min(this.game.puzzle.h + 1, 100);
            (document.querySelector("#height-value stroke-text") as StrokeText).setContent(this.game.puzzle.h.toFixed(0));
            this.game.puzzle.rebuildFloor();
        };

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
        this.boxButton = document.getElementById("box-btn") as HTMLButtonElement;
        this.rampButton = document.getElementById("ramp-btn") as HTMLButtonElement;
        this.bridgeButton = document.getElementById("bridge-btn") as HTMLButtonElement;

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
            this.boxButton,
            this.rampButton,
            this.bridgeButton
        ];

        let makeBrushButton = (button: HTMLButtonElement, brush: EditorBrush, brushColor?: TileColor) => {
            button.onclick = () => {
                this.dropClear();
                this.unselectAllButtons();
                if (this.brush != brush || (isFinite(brushColor) && this.brushColor != brushColor)) {
                    this.brush = brush;
                    this.brushColor = brushColor;
                    button.classList.add("selected");
                }
                else {
                    this.brush = EditorBrush.None;
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
        makeBrushButton(this.boxButton, EditorBrush.Box);
        makeBrushButton(this.rampButton, EditorBrush.Ramp);
        makeBrushButton(this.bridgeButton, EditorBrush.Bridge);
        
        
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
                    this.game.puzzle.instantiate();
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
        };
        
        document.getElementById("publish-confirm-btn").onclick = async () => {
            let data = {
                title: (document.querySelector("#title-input") as HTMLInputElement).value,
                author: (document.querySelector("#author-input") as HTMLInputElement).value,
                content: this.game.puzzle.saveAsText()
            }
            console.log(data);
            let dataString = JSON.stringify(data);
            const response = await fetch(SHARE_SERVICE_PATH + "publish_puzzle", {
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-Type": "application/json",
                },
                body: dataString,
            });
            console.log(await response.text());
        };
        
        document.getElementById("publish-cancel-btn").onclick = async () => {
            document.getElementById("editor-publish-form").style.display = "none";
        };

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
        }

        this.game.canvas.addEventListener("pointerdown", this.pointerDown);
        this.game.canvas.addEventListener("pointerup", this.pointerUp);

        this.game.camera.attachControl();
    }

    public deactivate(): void {
        document.getElementById("width-minus").onclick = undefined;
        document.getElementById("width-plus").onclick = undefined;
        document.getElementById("height-minus").onclick = undefined;
        document.getElementById("height-plus").onclick = undefined;

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

    private _pointerX: number = 0;
    private _pointerY: number = 0;

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
                    let i = Math.round(pick.pickedPoint.x / 1.1);
                    let j = Math.round(pick.pickedPoint.z / 1.1);
                    let tile = this.game.puzzle.tiles.find(tile => {
                        return tile.i === i && tile.j === j && Math.abs(tile.position.y - pick.pickedPoint.y) < 0.3;
                    });
                    if (tile) {
                        tile.dispose();
                        this.game.puzzle.rebuildFloor();
                    }
                    else {
                        let building = this.game.puzzle.buildings.find(build => {
                            return build.i === i && build.j === j && Math.abs(build.position.y - pick.pickedPoint.y) < 0.3;
                        });
                        if (building) {
                            building.dispose();
                            this.game.puzzle.editorRegenerateBuildings();
                        }
                    }
                }
                else if (ev.button === 0) {
                    let i = Math.round(pick.pickedPoint.x / 1.1);
                    let j = Math.round(pick.pickedPoint.z / 1.1);
                    let tile = this.game.puzzle.tiles.find(tile => {
                        return tile.i === i && tile.j === j && Math.abs(tile.position.y - pick.pickedPoint.y) < 0.3;
                    });
                    if (!tile) {
                        if (this.brush === EditorBrush.Tile) {
                            tile = new BlockTile(
                                this.game,
                                {
                                    i: i,
                                    j: j,
                                    h: Math.round(pick.pickedPoint.y),
                                    color: this.brushColor
                                }
                            )
                        }
                        else if (this.brush === EditorBrush.Switch) {
                            tile = new SwitchTile(
                                this.game,
                                {
                                    i: i,
                                    j: j,
                                    h: Math.round(pick.pickedPoint.y),
                                    color: this.brushColor
                                }
                            )
                        }
                        else if (this.brush === EditorBrush.Push) {
                            tile = new PushTile(
                                this.game,
                                {
                                    i: i,
                                    j: j,
                                    color: this.brushColor
                                }
                            )
                        }
                        else if (this.brush === EditorBrush.Hole) {
                            tile = new HoleTile(
                                this.game,
                                {
                                    i: i,
                                    j: j,
                                    color: this.brushColor
                                }
                            )
                        }
                        else if (this.brush === EditorBrush.Box) {
                            let box = new Box(
                                this.game,
                                {
                                    i: i,
                                    j: j,
                                    borderBottom: true,
                                    borderRight: true,
                                    borderLeft: true,
                                    borderTop: true
                                }
                            );
                            this.game.puzzle.editorRegenerateBuildings();
                        }
                        else if (this.brush === EditorBrush.Ramp) {
                            let box = new Ramp(
                                this.game,
                                {
                                    i: i,
                                    j: j
                                }
                            );
                            this.game.puzzle.editorRegenerateBuildings();
                        }
                        else if (this.brush === EditorBrush.Bridge) {
                            let box = new Bridge(
                                this.game,
                                {
                                    i: i,
                                    j: j,
                                    borderBottom: true,
                                    borderRight: true,
                                    borderLeft: true,
                                    borderTop: true
                                }
                            );
                            this.game.puzzle.editorRegenerateBuildings();
                        }
                        if (tile) {
                            tile.instantiate();
                            this.game.puzzle.rebuildFloor();
                        }
                    }
                }
            }     
        }
    }
}