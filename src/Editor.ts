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

    public brush: EditorBrush = EditorBrush.None;
    public brushColor: TileColor = TileColor.North;

    constructor(public game: Game) {

    }

    public activate(): void {
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

        this.game.canvas.addEventListener("pointerdown", this.pointerDown);
        this.game.canvas.addEventListener("pointerup", this.pointerUp);
    }

    public deactivate(): void {
        document.getElementById("switch-north-btn").onclick = undefined;
        document.getElementById("switch-east-btn").onclick = undefined;
        document.getElementById("switch-south-btn").onclick = undefined;
        document.getElementById("switch-west-btn").onclick = undefined;
        
        document.getElementById("tile-north-btn").onclick = undefined;
        document.getElementById("tile-east-btn").onclick = undefined;
        document.getElementById("tile-south-btn").onclick = undefined;
        document.getElementById("tile-west-btn").onclick = undefined;
        
        this.game.canvas.removeEventListener("pointerdown", this.pointerDown);
        this.game.canvas.removeEventListener("pointerup", this.pointerUp);
    }

    public pointerDown = (ev: PointerEvent) => {
        
    }

    public pointerUp = (ev: PointerEvent) => {
        console.log(ev);
        let pick = this.game.scene.pick(
            this.game.scene.pointerX,
            this.game.scene.pointerY,
            (mesh) => {
                return mesh.name === "floor" || mesh.name === "building-floor";
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
                    if (tile) {
                        tile.instantiate();
                    }
                }
            }
        }
    }
}