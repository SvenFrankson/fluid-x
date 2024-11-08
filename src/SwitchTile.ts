/// <reference path="./Tile.ts"/>

class SwitchTile extends Tile {

    public tileTop: BABYLON.Mesh;
    public tileBottom: BABYLON.Mesh;
    public tileFrame: BABYLON.Mesh;

    constructor(game: Game, props: TileProps) {
        super(game, props);

        this.material = this.game.brownMaterial;

        this.renderOutline = true;
        this.outlineColor = BABYLON.Color3.Black();
        this.outlineWidth = 0.02;

        this.tileFrame = new BABYLON.Mesh("tile-frame");
        this.tileFrame.parent = this;

        this.tileFrame.material = this.game.blackMaterial;

        this.tileFrame.renderOutline = true;
        this.tileFrame.outlineColor = BABYLON.Color3.Black();
        this.tileFrame.outlineWidth = 0.02;

        this.tileTop = new BABYLON.Mesh("tile-top");
        this.tileTop.parent = this;
        
        this.tileTop.material = this.game.tileColorMaterials[this.color];

        this.tileBottom = new BABYLON.Mesh("tile-bottom");
        this.tileBottom.parent = this;
        
        this.tileBottom.material = this.game.salmonMaterial;
    }

    public async instantiate(): Promise<void> {
        await super.instantiate();
        let tileData = await this.game.vertexDataLoader.get("./datas/meshes/switchbox.babylon");
        tileData[0].applyToMesh(this);
        tileData[1].applyToMesh(this.tileFrame);
        tileData[2].applyToMesh(this.tileTop);
        tileData[3].applyToMesh(this.tileBottom);
    }
}

class ButtonTile extends Tile {

    public tileTop: BABYLON.Mesh;
    public tileBottom: BABYLON.Mesh;
    public tileFrame: BABYLON.Mesh;

    constructor(game: Game, props: TileProps) {
        super(game, props);

        if (isNaN(this.props.value)) {
            this.props.value = 0;
        }

        this.material = this.game.blackMaterial;

        this.renderOutline = true;
        this.outlineColor = BABYLON.Color3.Black();
        this.outlineWidth = 0.02;

        this.tileFrame = new BABYLON.Mesh("tile-frame");
        this.tileFrame.parent = this;

        this.tileFrame.material = this.game.blackMaterial;

        this.tileFrame.renderOutline = true;
        this.tileFrame.outlineColor = BABYLON.Color3.Black();
        this.tileFrame.outlineWidth = 0.02;

        this.tileTop = new BABYLON.Mesh("tile-top");
        this.tileTop.parent = this;
        
        this.tileTop.material = this.game.tileNumberMaterials[this.props.value - 1];

        this.tileBottom = new BABYLON.Mesh("tile-bottom");
        this.tileBottom.parent = this;
        
        this.tileBottom.material = this.game.grayMaterial;
    }

    public async instantiate(): Promise<void> {
        await super.instantiate();
        let tileData = await this.game.vertexDataLoader.get("./datas/meshes/switchbox.babylon");
        tileData[0].applyToMesh(this);
        tileData[1].applyToMesh(this.tileFrame);
        tileData[2].applyToMesh(this.tileTop);
        tileData[3].applyToMesh(this.tileBottom);
    }
}

class DoorTile extends Tile {

    public closed: boolean = false;
    public tileTop: BABYLON.Mesh;
    public tileBox: BABYLON.Mesh;

    public animateTopPosY = Mummu.AnimationFactory.EmptyNumberCallback;
    public animateTopRotY = Mummu.AnimationFactory.EmptyNumberCallback;
    public animateBoxPosY = Mummu.AnimationFactory.EmptyNumberCallback;

    constructor(game: Game, props: TileProps) {
        super(game, props);

        if (isNaN(this.props.value)) {
            this.props.value = 0;
        }

        this.material = this.game.grayMaterial;

        this.renderOutline = true;
        this.outlineColor = BABYLON.Color3.Black();
        this.outlineWidth = 0.02;

        this.tileBox = new BABYLON.Mesh("tile-frame");
        this.tileBox.position.y = 0.02;
        this.tileBox.parent = this;

        this.tileBox.material = this.game.brownMaterial;

        this.tileBox.renderOutline = true;
        this.tileBox.outlineColor = BABYLON.Color3.Black();
        this.tileBox.outlineWidth = 0.01;

        this.tileTop = new BABYLON.Mesh("tile-top");
        this.tileTop.parent = this;
        
        this.tileTop.material = this.game.tileNumberMaterials[this.props.value - 1];
        
        this.animateTopPosY = Mummu.AnimationFactory.CreateNumber(this, this.tileTop.position, "y");
        this.animateTopRotY = Mummu.AnimationFactory.CreateNumber(this.tileTop, this.tileTop.rotation, "y");
        this.animateBoxPosY = Mummu.AnimationFactory.CreateNumber(this.tileBox, this.tileBox.position, "y");
    }

    public async instantiate(): Promise<void> {
        await super.instantiate();
        let tileData = await this.game.vertexDataLoader.get("./datas/meshes/door.babylon");
        //tileData[0].applyToMesh(this);
        tileData[1].applyToMesh(this.tileBox);
        tileData[2].applyToMesh(this.tileTop);
    }

    public async open(duration: number = 1): Promise<void> {
        this.animateTopPosY(0, duration, Nabu.Easing.easeInOutSine);
        this.animateTopRotY(0, duration, Nabu.Easing.easeInOutSine);
        setTimeout(() => {
            this.tileBox.material = this.game.brownMaterial;
        }, duration * 500);
        await this.animateBoxPosY(0.02, duration, Nabu.Easing.easeInOutSine);
        this.closed = false;
    }

    public async close(duration: number = 1): Promise<void> {
        this.closed = true;
        this.animateTopPosY(0.15, duration, Nabu.Easing.easeInOutSine);
        this.animateTopRotY(2 * Math.PI, duration, Nabu.Easing.easeInOutSine);
        setTimeout(() => {
            this.tileBox.material = this.game.blackMaterial;
        }, duration * 500);
        await this.animateBoxPosY(0.3, duration, Nabu.Easing.easeInOutSine);
    }
}