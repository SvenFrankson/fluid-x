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

    public initialize(): void {
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
    }
}