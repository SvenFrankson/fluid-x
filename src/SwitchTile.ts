/// <reference path="./Tile.ts"/>

class SwitchTile extends Tile {

    public tileTop: BABYLON.Mesh;
    public tileBottom: BABYLON.Mesh;
    public tileFrame: BABYLON.Mesh;

    constructor(game: Game, props: TileProps) {
        super(game, props);

        this.material = this.game.materials.brownMaterial;

        this.renderOutline = true;
        this.outlineColor = BABYLON.Color3.Black();
        this.outlineWidth = 0.02;

        this.tileFrame = new BABYLON.Mesh("tile-frame");
        this.tileFrame.parent = this;

        this.tileFrame.material = this.game.materials.blackMaterial;

        this.tileFrame.renderOutline = true;
        this.tileFrame.outlineColor = BABYLON.Color3.Black();
        this.tileFrame.outlineWidth = 0.02;

        this.tileTop = new BABYLON.Mesh("tile-top");
        this.tileTop.parent = this;
        
        this.tileTop.material = this.game.materials.tileColorMaterials[this.color];

        this.tileBottom = new BABYLON.Mesh("tile-bottom");
        this.tileBottom.parent = this;
        
        this.tileBottom.material = this.game.materials.salmonMaterial;
    }

    public async instantiate(): Promise<void> {
        //await RandomWait();
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

        this.material = this.game.materials.brownMaterial;

        this.renderOutline = true;
        this.outlineColor = BABYLON.Color3.Black();
        this.outlineWidth = 0.02;

        this.tileFrame = new BABYLON.Mesh("tile-frame");
        this.tileFrame.position.y = 0.25;
        this.tileFrame.rotation.y = Math.PI * 0.25;
        this.tileFrame.parent = this;

        this.tileFrame.material = this.game.materials.blackMaterial;

        this.tileFrame.renderOutline = true;
        this.tileFrame.outlineColor = BABYLON.Color3.Black();
        this.tileFrame.outlineWidth = 0.02;

        this.tileTop = new BABYLON.Mesh("tile-top");
        this.tileTop.parent = this.tileFrame;
        
        this.tileTop.material = this.game.materials.tileNumberMaterials[this.props.value - 1];

        this.tileBottom = new BABYLON.Mesh("tile-bottom");
        this.tileBottom.parent = this;
        
        this.tileBottom.material = this.game.materials.grayMaterial;
    }

    public async instantiate(): Promise<void> {
        //await RandomWait();
        await super.instantiate();
        let tileData = await this.game.vertexDataLoader.get("./datas/meshes/buttonbox.babylon");
        tileData[0].applyToMesh(this);
        tileData[1].applyToMesh(this.tileFrame);
        tileData[2].applyToMesh(this.tileTop);
        tileData[3].applyToMesh(this.tileBottom);
    }

    public async clicClack(): Promise<void> {
        //await RandomWait();
        this.bump();
        let animateWait = Mummu.AnimationFactory.CreateWait(this);
        let animateRotation = Mummu.AnimationFactory.CreateNumber(this.tileFrame, this.tileFrame.rotation, "x");
        await animateRotation(- Math.PI * 0.75, 0.25, Nabu.Easing.easeInSine);
        this.game.puzzle.cricSound.play();
        await animateWait(0.1);
        await animateRotation(0, 0.35, Nabu.Easing.easeInSine);
        this.game.puzzle.cracSound.play();
    }
}

class DoorTile extends Tile {

    public closed: boolean = false;
    public tileTop: BABYLON.Mesh;
    public tileTopFrame: BABYLON.Mesh;
    public tileBox: BABYLON.Mesh;

    public animateTopPosY = Mummu.AnimationFactory.EmptyNumberCallback;
    public animateTopRotY = Mummu.AnimationFactory.EmptyNumberCallback;
    public animateBoxPosY = Mummu.AnimationFactory.EmptyNumberCallback;

    constructor(game: Game, props: TileProps) {
        super(game, props);

        if (isNaN(this.props.value)) {
            this.props.value = 0;
        }

        this.material = this.game.materials.grayMaterial;

        this.renderOutline = true;
        this.outlineColor = BABYLON.Color3.Black();
        this.outlineWidth = 0.02;

        this.tileBox = new BABYLON.Mesh("tile-frame");
        this.tileBox.position.y = -0.26;
        this.tileBox.parent = this;
        this.tileBox.material = this.game.materials.blackMaterial;

        //this.tileBox.renderOutline = true;
        //this.tileBox.outlineColor = BABYLON.Color3.Black();
        //this.tileBox.outlineWidth = 0.02;

        this.tileTop = new BABYLON.Mesh("tile-top");
        this.tileTop.parent = this;
        this.tileTop.material = this.game.materials.tileNumberMaterials[this.props.value - 1];

        this.tileTopFrame = new BABYLON.Mesh("tile-top-frame");
        this.tileTopFrame.parent = this.tileTop;
        this.tileTopFrame.material = this.game.materials.blackMaterial;

        this.tileTopFrame.renderOutline = true;
        this.tileTopFrame.outlineColor = BABYLON.Color3.Black();
        this.tileTopFrame.outlineWidth = 0.02;
        
        this.animateTopPosY = Mummu.AnimationFactory.CreateNumber(this, this.tileTop.position, "y");
        this.animateTopRotY = Mummu.AnimationFactory.CreateNumber(this.tileTop, this.tileTop.rotation, "y");
        this.animateBoxPosY = Mummu.AnimationFactory.CreateNumber(this.tileBox, this.tileBox.position, "y");
    }

    public async instantiate(): Promise<void> {
        //await RandomWait();
        await super.instantiate();
        let tileData = await this.game.vertexDataLoader.get("./datas/meshes/door.babylon");
        //tileData[0].applyToMesh(this);

        CreateBoxFrameVertexData({
            w: 1,
            d: 1,
            h: 0.3,
            thickness: 0.05,
            innerHeight: 0.22,
            flatShading: true,
            topCap: true
        }).applyToMesh(this.tileBox);

        tileData[0].applyToMesh(this.tileTop);
        tileData[1].applyToMesh(this.tileTopFrame);
    }

    public async open(duration: number = 0.5): Promise<void> {
        //await RandomWait();
        this.animateTopPosY(0, duration, Nabu.Easing.easeOutCubic);
        this.animateTopRotY(0, duration, Nabu.Easing.easeOutCubic);
        await this.animateBoxPosY(-0.26, duration, Nabu.Easing.easeOutCubic);
        this.closed = false;
    }

    public async close(duration: number = 0.5): Promise<void> {
        //await RandomWait();
        this.closed = true;
        this.animateTopPosY(0.1, duration, Nabu.Easing.easeOutCubic);
        this.animateTopRotY(2 * Math.PI, duration, Nabu.Easing.easeOutCubic);
        await this.animateBoxPosY(0, duration, Nabu.Easing.easeOutCubic);
    }
}