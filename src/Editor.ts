enum EditorBrush {
    None,
    Delete,
    Tile,
    Switch,
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
    public holeButton: HTMLButtonElement;
    public boxButton: HTMLButtonElement;
    public rampButton: HTMLButtonElement;
    public bridgeButton: HTMLButtonElement;

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
        (document.querySelector("#width-value stroke-text") as StrokeText).setContent(this.game.terrain.w.toFixed(0));
        (document.querySelector("#height-value stroke-text") as StrokeText).setContent(this.game.terrain.h.toFixed(0));

        document.getElementById("ball-i-minus").onclick = () => {
            this.game.ball.i = Math.max(this.game.ball.i - 1, 0);
            (document.querySelector("#ball-i-value stroke-text") as StrokeText).setContent(this.game.ball.i.toFixed(0));
        };

        document.getElementById("ball-i-plus").onclick = () => {
            this.game.ball.i = Math.min(this.game.ball.i + 1, this.game.terrain.w - 1);
            (document.querySelector("#ball-i-value stroke-text") as StrokeText).setContent(this.game.ball.i.toFixed(0));
        };
        
        document.getElementById("ball-j-minus").onclick = () => {
            this.game.ball.j = Math.max(this.game.ball.j - 1, 0);
            (document.querySelector("#ball-j-value stroke-text") as StrokeText).setContent(this.game.ball.j.toFixed(0));
        };

        document.getElementById("ball-j-plus").onclick = () => {
            this.game.ball.j = Math.min(this.game.ball.j + 1, this.game.terrain.h - 1);
            (document.querySelector("#ball-j-value stroke-text") as StrokeText).setContent(this.game.ball.j.toFixed(0));
        };

        document.getElementById("width-minus").onclick = () => {
            this.game.terrain.w = Math.max(this.game.terrain.w - 1, 3);
            (document.querySelector("#width-value stroke-text") as StrokeText).setContent(this.game.terrain.w.toFixed(0));
            this.game.terrain.rebuildFloor();
        };

        document.getElementById("width-plus").onclick = () => {
            this.game.terrain.w = Math.min(this.game.terrain.w + 1, 100);
            (document.querySelector("#width-value stroke-text") as StrokeText).setContent(this.game.terrain.w.toFixed(0));
            this.game.terrain.rebuildFloor();
        };

        document.getElementById("height-minus").onclick = () => {
            this.game.terrain.h = Math.max(this.game.terrain.h - 1, 3);
            (document.querySelector("#height-value stroke-text") as StrokeText).setContent(this.game.terrain.h.toFixed(0));
            this.game.terrain.rebuildFloor();
        };

        document.getElementById("height-plus").onclick = () => {
            this.game.terrain.h = Math.min(this.game.terrain.h + 1, 100);
            (document.querySelector("#height-value stroke-text") as StrokeText).setContent(this.game.terrain.h.toFixed(0));
            this.game.terrain.rebuildFloor();
        };

        this.switchTileNorthButton = document.getElementById("switch-north-btn") as HTMLButtonElement;
        this.switchTileEastButton = document.getElementById("switch-east-btn") as HTMLButtonElement;
        this.switchTileSouthButton = document.getElementById("switch-south-btn") as HTMLButtonElement;
        this.switchTileWestButton = document.getElementById("switch-west-btn") as HTMLButtonElement;
        this.blockTileNorthButton = document.getElementById("tile-north-btn") as HTMLButtonElement;
        this.blockTileEastButton = document.getElementById("tile-east-btn") as HTMLButtonElement;
        this.blockTileSouthButton = document.getElementById("tile-south-btn") as HTMLButtonElement;
        this.blockTileWestButton = document.getElementById("tile-west-btn") as HTMLButtonElement;
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
            this.holeButton,
            this.boxButton,
            this.rampButton,
            this.bridgeButton
        ];

        let makeBrushButton = (button: HTMLButtonElement, brush: EditorBrush, brushColor?: TileColor) => {
            button.onclick = () => {
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

        makeBrushButton(this.holeButton, EditorBrush.Hole);
        makeBrushButton(this.boxButton, EditorBrush.Box);
        makeBrushButton(this.rampButton, EditorBrush.Ramp);
        makeBrushButton(this.bridgeButton, EditorBrush.Bridge);
        
        
        document.getElementById("play-btn").onclick = async () => {
            this.dropBrush();
            this.game.terrain.data = {
                id: -1,
                title: "Current Machine",
                author: "Editor",
                content: this.game.terrain.saveAsText()
            };
            this.game.terrain.reset();
            location.hash = "#editor-preview";
        };

        document.getElementById("save-btn").onclick = () => {
            this.dropBrush();
            let content = this.game.terrain.saveAsText();
            Nabu.download("puzzle.txt", content);
        };
        
        document.getElementById("load-btn").onclick = () => {
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
                    this.game.terrain.loadFromData({
                        id: 42,
                        title: "No Title",
                        author: "No Author",
                        content: content
                    });
                    this.game.terrain.instantiate();
                });
                reader.readAsText(file);
            }
            document.getElementById("load-btn").style.display = "";
            document.getElementById("load-file-input").style.display = "none";
        };
        
        document.getElementById("publish-btn").onclick = async () => {
            this.dropBrush();
            document.getElementById("editor-publish-form").style.display = "";
        };
        
        document.getElementById("publish-confirm-btn").onclick = async () => {
            let data = {
                title: (document.querySelector("#title-input") as HTMLInputElement).value,
                author: (document.querySelector("#author-input") as HTMLInputElement).value,
                content: this.game.terrain.saveAsText()
            }
            console.log(data);
            let dataString = JSON.stringify(data);
            const response = await fetch("http://localhost/index.php/publish_puzzle", {
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-Type": "application/json",
                },
                body: dataString,
            });
        };
        
        document.getElementById("publish-cancel-btn").onclick = async () => {
            document.getElementById("editor-publish-form").style.display = "none";
        };

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
                    let tile = this.game.terrain.tiles.find(tile => {
                        return tile.i === i && tile.j === j && Math.abs(tile.position.y - pick.pickedPoint.y) < 0.3;
                    });
                    if (tile) {
                        tile.dispose();
                        this.game.terrain.rebuildFloor();
                    }
                }
                else if (ev.button === 0) {
                    let i = Math.round(pick.pickedPoint.x / 1.1);
                    let j = Math.round(pick.pickedPoint.z / 1.1);
                    let tile = this.game.terrain.tiles.find(tile => {
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
                        if (tile) {
                            tile.instantiate();
                            this.game.terrain.rebuildFloor();
                        }
                    }
                }
            }     
        }
    }
}