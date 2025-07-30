class ButtonTile extends Tile {

    public value: number = 0;
    public tileTop: BABYLON.Mesh;
    public tileBottom: BABYLON.Mesh;
    public tileFrame: BABYLON.Mesh;

    constructor(game: Game, props: TileProps) {
        super(game, props);

        if (isNaN(this.props.value)) {
            this.props.value = 0;
        }
        this.value = this.props.value;

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
        this.bump();
        let animateWait = Mummu.AnimationFactory.CreateWait(this);
        let animateRotation = Mummu.AnimationFactory.CreateNumber(this.tileFrame, this.tileFrame.rotation, "x");
        await animateRotation(- Math.PI * 0.75, 0.25, Nabu.Easing.easeInSine);
        this.game.puzzle.cricSound.play();
        await animateWait(0.1);
        await animateRotation(0, 0.35, Nabu.Easing.easeInSine);
        this.game.puzzle.cracSound.play();
    }

    public async shootUnlock(targetDoor: DoorTile, duration: number = 0.6): Promise<void> {
        let dy = 0.5;
        let dest = targetDoor.position.clone();
        dest.y += dy;
        let path = this.getSwooshPath(dest, 0);

        let star = new BABYLON.Mesh("star");
        this.game.puzzle.stars.push(star);
        star.position.copyFrom(this.position);

        let tail: BABYLON.Mesh;
        let tailPoints: BABYLON.Vector3[];
        if (this.game.performanceWatcher.worst > 24) {
            tail = new BABYLON.Mesh("tail");
            tail.visibility = 1;
            tail.material = this.game.materials.tileStarTailMaterial;
            tailPoints = [];
        }

        this.game.puzzle.wooshSound.play();
        let t0 = performance.now();

        return new Promise<void>(resolve => {
            let step = () => {
                if (star.isDisposed()) {
                    if (tail) {
                        tail.dispose();
                        return;
                    }
                }
                let f = (performance.now() - t0) / 1000 / duration;
                if (f < 1) {
                    f = Nabu.Easing.easeOutSine(f);
                    Mummu.EvaluatePathToRef(f, path, star.position);
                    if (tail) {
                        let n = Math.floor(f * path.length);
                        if (f < 0.5) {
                            if (0 < n - 3 - 1) {
                                tailPoints = path.slice(0, n - 3);
                            }
                            else {
                                tailPoints = [];
                            }
                        }
                        else {
                            let start = Math.floor((- 4 + 5 * f) * path.length);
                            start = Math.max(start, 0);
                            if (start < n - 3 - 1) {
                                tailPoints = path.slice(start, n - 3);
                            }
                            else {
                                tailPoints = [];
                            }
                        }
                        if (tailPoints.length > 2) {
                            let data = CreateTrailVertexData({
                                path: [...tailPoints],
                                up: BABYLON.Axis.Y,
                                radiusFunc: (f) => {
                                    return 0.03 * f + 0.01;
                                },
                                color: new BABYLON.Color4(1, 1, 1, 1)
                            });
                            data.applyToMesh(tail);
                            tail.isVisible = true;
                        }
                        else {
                            tail.isVisible = false;
                        }
                    }
                    requestAnimationFrame(step);
                }
                else {
                    let index = this.game.puzzle.stars.indexOf(star);
                    if (index != -1) {
                        this.game.puzzle.stars.splice(index, 1);
                    }

                    if (tail) {
                        tail.dispose();
                    }
                    if (star) {
                        star.dispose();
                    }

                    resolve();
                }
            }
            step();
        });
    }
}