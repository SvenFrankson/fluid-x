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

    constructor(public game: Game) {
        this.invisiFloorTM = BABYLON.MeshBuilder.CreateGround("invisifloor", { width: 100, height: 100 } );
        this.invisiFloorTM.position.x = 50 - 0.55;
        this.invisiFloorTM.position.y = - 0.01;
        this.invisiFloorTM.position.z = 50 - 0.55;
        this.invisiFloorTM.isVisible = false;
    }

    public activate(): void {
        (document.querySelector("#width-value stroke-text") as StrokeText).setContent(this.game.terrain.w.toFixed(0));
        (document.querySelector("#height-value stroke-text") as StrokeText).setContent(this.game.terrain.h.toFixed(0));

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

        document.getElementById("switch-north-btn").onclick = () => {
            this.brush = EditorBrush.Switch;
            this.brushColor = TileColor.North;
        };
        document.getElementById("switch-east-btn").onclick = () => {
            this.brush = EditorBrush.Switch;
            this.brushColor = TileColor.East;
        };
        document.getElementById("switch-south-btn").onclick = () => {
            this.brush = EditorBrush.Switch;
            this.brushColor = TileColor.South;
        };
        document.getElementById("switch-west-btn").onclick = () => {
            this.brush = EditorBrush.Switch;
            this.brushColor = TileColor.West;
        };
        
        document.getElementById("tile-north-btn").onclick = () => {
            this.brush = EditorBrush.Tile;
            this.brushColor = TileColor.North;
        };
        document.getElementById("tile-east-btn").onclick = () => {
            this.brush = EditorBrush.Tile;
            this.brushColor = TileColor.East;
        };
        document.getElementById("tile-south-btn").onclick = () => {
            this.brush = EditorBrush.Tile;
            this.brushColor = TileColor.South;
        };
        document.getElementById("tile-west-btn").onclick = () => {
            this.brush = EditorBrush.Tile;
            this.brushColor = TileColor.West;
        };

        document.getElementById("box-btn").onclick = () => {
            this.brush = EditorBrush.Box;
        };
        document.getElementById("ramp-btn").onclick = () => {
            this.brush = EditorBrush.Ramp;
        };
        document.getElementById("bridge-btn").onclick = () => {
            this.brush = EditorBrush.Bridge;
        };
        document.getElementById("hole-btn").onclick = () => {
            this.brush = EditorBrush.Hole;
        };
        
        document.getElementById("save-btn").onclick = () => {
            let content = this.game.terrain.saveAsText();
            Nabu.download("puzzle.txt", content);
        };
        
        document.getElementById("load-btn").onclick = () => {
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
                    await this.game.terrain.loadFromText(content);
                    this.game.terrain.instantiate();
                });
                reader.readAsText(file);
            }
            document.getElementById("load-btn").style.display = "";
            document.getElementById("load-file-input").style.display = "none";
        };
        
        document.getElementById("play-btn").onclick = async () => {
            await this.game.terrain.loadFromText(this.game.terrain.saveAsText());
            location.hash = "#editor-preview";
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

    public pointerDown = (ev: PointerEvent) => {
        
    }

    public pointerUp = (ev: PointerEvent) => {
        console.log(ev);
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