/// <reference path="./Tile.ts"/>

class SwitchTile extends Tile {

    public tileTop: BABYLON.Mesh;
    public tileBottom: BABYLON.Mesh;
    public tileFrame: BABYLON.Mesh;

    constructor(game: Game, props: TileProps) {
        super(game, props);

        this.material = this.game.materials.blackMaterial;

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
        
        this.tileBottom.material = this.game.materials.brownMaterial;
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

    public async shoot(ball: Ball, duration: number = 0.4): Promise<void> {
        let projectile = this.tileFrame.clone();
        projectile.parent = undefined;

        let cap = this.tileTop.clone();
        cap.parent = projectile;

        projectile.position.copyFrom(this.position);

        let tail: BABYLON.Mesh;
        let tailPoints: BABYLON.Vector3[];
        if (this.game.performanceWatcher.worst > 24) {
            tail = new BABYLON.Mesh("tail");
            tail.visibility = 1;
            tail.material = this.game.materials.tileStarTailMaterial;
            tailPoints = [];
        }

        return new Promise<void>(resolve => {
            let t0 = performance.now();
            let step = () => {
                let f = (performance.now() - t0) / 1000 / duration;
                f = Math.sqrt(f);
                let s = 0.4 + 0.6 * f;

                if (tail) {
                    tailPoints.push(projectile.position.add(new BABYLON.Vector3(0, 0.2 * s, 0)));
                    while (tailPoints.length > 40) {
                        tailPoints.splice(0, 1);
                    }
                    if (tailPoints.length > 2) {
                        let color = this.game.materials.colorMaterials[this.color].diffuseColor.toColor4(1);
                        let data = CreateTrailVertexData({
                            path: [...tailPoints],
                            up: BABYLON.Axis.Y,
                            radiusFunc: (f) => {
                                return 0.03 * f + 0.01;
                            },
                            color: color
                        });
                        data.applyToMesh(tail);
                        tail.isVisible = true;
                    }
                    else {
                        tail.isVisible = false;
                    }
                }

                if (f < 1) {
                    BABYLON.Vector3.LerpToRef(this.position, ball.position, f, projectile.position);
                    projectile.position.y += 2 * (1 - (2 * f - 1) * (2 * f - 1));
                    projectile.rotation.y = f * 2 * Math.PI;
                    projectile.scaling.copyFromFloats(s, s, s);
                    requestAnimationFrame(step);
                }
                else {
                    projectile.dispose();
                    if (tail) {
                        tail.dispose();
                    }
                    resolve();
                }
            }
            step();
        });
    }
}

class DoorTile extends Tile {

    public value: number = 0;
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
        this.value = this.props.value;

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