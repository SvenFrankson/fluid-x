/// <reference path="./Tile.ts"/>

class WallTile extends Tile {

    constructor(game: Game, props: TileProps) {
        super(game, props);
        this.color = props.color;

        this.material = this.game.blackMaterial;
    }

    public async instantiate(): Promise<void> {
        await super.instantiate();
        
        let xPlus = 0;
        let xMinus = 0;
        if (this.i === 0) {
            xMinus = - 0.1;
        }
        else if (this.game.puzzle.tiles.find(tile => { return tile instanceof WallTile && tile.i === (this.i - 1) && tile.j === this.j })) {
            xMinus = - 0.05;
        }
        if (this.i === this.game.puzzle.w - 1) {
            xPlus = 0.1;
        }
        else if (this.game.puzzle.tiles.find(tile => { return tile instanceof WallTile && tile.i === (this.i + 1) && tile.j === this.j })) {
            xPlus = 0.05;
        }

        let zPlus = 0;
        let zMinus = 0;
        if (this.j === 0) {
            zMinus = - 0.1;
        }
        else if (this.game.puzzle.tiles.find(tile => { return tile instanceof WallTile && tile.i === this.i && tile.j === (this.j - 1) })) {
            zMinus = - 0.05;
        }
        if (this.j === this.game.puzzle.h - 1) {
            zPlus = 0.1;
        }
        else if (this.game.puzzle.tiles.find(tile => { return tile instanceof WallTile && tile.i === this.i && tile.j === (this.j + 1) })) {
            zPlus = 0.05;
        }

        let data = BABYLON.CreateBoxVertexData({ width: 1 + xPlus - xMinus, height: 0.3, depth: 1 + zPlus - zMinus });
        Mummu.TranslateVertexDataInPlace(data, new BABYLON.Vector3(
            xPlus * 0.5 + xMinus * 0.5,
            0.15,
            zPlus * 0.5 + zMinus * 0.5
        ));
        data.applyToMesh(this);
    }
}