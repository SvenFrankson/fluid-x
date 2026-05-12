class IceTile extends Tile {

    constructor(game: Game, props: TileProps) {
        super(game, props);

        this.material = this.game.materials.iceMaterial;

        this.renderOutline = true;
        this.outlineColor = BABYLON.Color3.Black();
        this.outlineWidth = 0.02;
    }

    public async instantiate(): Promise<void> {
        //await RandomWait();
        await super.instantiate();
        let tileData = await this.game.vertexDataLoader.getAtIndex("./datas/meshes/icecube.babylon", 0);
        //tileData[0].applyToMesh(this);
        tileData.applyToMesh(this);
    }

    public async shoot(ball: Ball, duration: number = 0.4): Promise<void> {
        let projectile = this.clone();
        projectile.parent = undefined;

        let cap = this.clone();
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
                let s = 0.4 + 0.6 * (1 - f);
                f = Math.sqrt(f);

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