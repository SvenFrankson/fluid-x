/// <reference path="./Tile.ts"/>

class RockTile extends Tile {

    public tileTop: BABYLON.Mesh;
    public rock: BABYLON.Mesh;

    constructor(game: Game, props: TileProps) {
        super(game, props);
        this.color = props.color;

        this.material = this.game.brownMaterial;

        this.tileTop = new BABYLON.Mesh("tile-top");
        this.tileTop.parent = this;
        this.tileTop.material = this.game.whiteMaterial;

        this.rock = new BABYLON.Mesh("tile-top");
        this.rock.rotation.y = Math.random() * Math.PI * 2;
        this.rock.parent = this;
        this.rock.material = this.game.whiteMaterial;

    }

    public async instantiate(): Promise<void> {
        await super.instantiate();
        
        let tileData = await this.game.vertexDataLoader.get("./datas/meshes/rock-tile.babylon");
        tileData[0].applyToMesh(this);

        tileData[1].applyToMesh(this.tileTop);

        tileData[2].applyToMesh(this.rock);
    }
}