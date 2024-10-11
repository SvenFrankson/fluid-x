/// <reference path="./Tile.ts"/>

class HoleTile extends Tile {

    public tileDark: BABYLON.Mesh;

    constructor(game: Game, props: TileProps) {
        props.noShadow = true;
        super(game, props);
        this.color = props.color;

        this.scaling.copyFromFloats(1.1, 1, 1.1);
        this.material = this.game.blackMaterial;

        this.tileDark = new BABYLON.Mesh("tile-top");
        this.tileDark.parent = this;

        this.tileDark.material = this.game.grayMaterial;
    }

    public fallsIn(ball: Ball): boolean {
        if (ball.position.x < this.position.x - 0.5) {
            return false;
        }
        if (ball.position.x > this.position.x + 0.5) {
            return false;
        }
        if (ball.position.z < this.position.z - 0.5) {
            return false;
        }
        if (ball.position.z > this.position.z + 0.5) {
            return false;
        }
        return true;
    }
}