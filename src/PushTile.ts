/// <reference path="./Tile.ts"/>

class PushTile extends Tile {

    public pushSound: MySound;
    public fallImpactSound: MySound;

    public tileTop: BABYLON.Mesh;
    public animatePosition = Mummu.AnimationFactory.EmptyVector3Callback;
    public animateRotX = Mummu.AnimationFactory.EmptyNumberCallback;
    public animateRotZ = Mummu.AnimationFactory.EmptyNumberCallback;
    public animateWait = Mummu.AnimationFactory.EmptyVoidCallback;

    constructor(game: Game, props: TileProps) {
        super(game, props);
        this.color = props.color;

        this.animatePosition = Mummu.AnimationFactory.CreateVector3(this, this, "position");
        this.animateRotX = Mummu.AnimationFactory.CreateNumber(this, this.rotation, "x");
        this.animateRotZ = Mummu.AnimationFactory.CreateNumber(this, this.rotation, "z");
        this.animateWait = Mummu.AnimationFactory.CreateWait(this);

        this.material = this.game.materials.brownMaterial;

        this.renderOutline = true;
        this.outlineColor = BABYLON.Color3.Black();
        this.outlineWidth = 0.02;

        this.tileTop = new BABYLON.Mesh("tile-top");
        this.tileTop.parent = this;

        this.tileTop.material = this.game.materials.pushTileTopMaterial;

        this.pushSound = this.game.soundManager.createSound("push-wood-drag", "./datas/sounds/wood-wood-drag.wav", undefined, undefined, { autoplay: false, loop: false, volume: 0.8 });
        this.fallImpactSound = this.game.soundManager.createSound("push-tile-fall-impact", "./datas/sounds/fall-impact.wav", undefined, undefined, { autoplay: false, loop: false });
    }

    public async instantiate(): Promise<void> {
        //await RandomWait();
        await super.instantiate();
        
        let tileData = CreateBoxFrameVertexData({
            w: 1,
            d: 1,
            h: 0.35,
            thickness: 0.05,
            flatShading: false,
            topCap: false,
            bottomCap: true,
        })
        tileData.applyToMesh(this);

        this.tileTop.position.y = 0.3;
        BABYLON.CreateGroundVertexData({ width: 0.9, height: 0.9 }).applyToMesh(this.tileTop);
    }

    private _pushCallback = () => {};

    public async push(dir: BABYLON.Vector3): Promise<void> {
        //await RandomWait();
        if (this.tileState === TileState.Moving) {
            this._pushCallback = () => {
                this.push(dir);
            }
        }
        else if (this.tileState === TileState.Active) {
            dir = dir.clone();
            if (Math.abs(dir.x) > Math.abs(dir.z)) {
                dir.x = Math.sign(dir.x);
                dir.z = 0;
            }
            else {
                dir.x = 0;
                dir.z = Math.sign(dir.z);
            }
    
            let newI = this.i + dir.x;
            let newJ = this.j + dir.z;
    
            if (newI >= 0 && newI < this.game.puzzle.w) {
                if (newJ >= 0 && newJ < this.game.puzzle.h) {

                    let borderBlock = false;
                    if (dir.x > 0) {
                        let stack = this.game.puzzle.getGriddedBorderStack(this.i, this.j);
                        if (stack && stack.array.find((b) => { return b.vertical && Math.abs(b.position.y - this.position.y) < 0.6; })) {
                            borderBlock = true;
                        }
                    }
                    else if (dir.x < 0) {
                        let stack = this.game.puzzle.getGriddedBorderStack(newI, this.j);
                        if (stack && stack.array.find((b) => { return b.vertical && Math.abs(b.position.y - this.position.y) < 0.6; })) {
                            borderBlock = true;
                        }
                    }
                    else if (dir.z > 0) {
                        let stack = this.game.puzzle.getGriddedBorderStack(this.i, this.j);
                        if (stack && stack.array.find((b) => { return !b.vertical && Math.abs(b.position.y - this.position.y) < 0.6; })) {
                            borderBlock = true;
                        }
                    }
                    else if (dir.z < 0) {
                        let stack = this.game.puzzle.getGriddedBorderStack(this.i, newJ);
                        if (stack && stack.array.find((b) => { return !b.vertical && Math.abs(b.position.y - this.position.y) < 0.6; })) {
                            borderBlock = true;
                        }
                    }

                    if (!borderBlock) {
                        let stackAtDestination = this.game.puzzle.getGriddedStack(newI, newJ);
                        let tileAtDestination: Tile;
                        if (stackAtDestination) {
                            tileAtDestination = stackAtDestination.array.find(tile => {
                                return (tile.position.y - this.position.y) < 0.6;
                            })
                        }
                        if (tileAtDestination instanceof HoleTile) {
                            let newPos = this.position.clone();
                            newPos.x = (this.i + dir.x * 0.75) * 1.1;
                            newPos.z = (this.j + dir.z * 0.75) * 1.1;
            
                            this.tileState = TileState.Moving;
                            this.pushSound.play();
                            if (tileAtDestination.covered) {
                                this.animateWait(0.1).then(() => {
                                    (tileAtDestination as HoleTile).destroyCover();
                                })
                            }
                            await this.animatePosition(newPos, 0.5, Nabu.Easing.easeOutSquare);

                            if (dir.x === 1) {
                                this.animateRotZ(- Math.PI, 0.4);
                            }
                            else if (dir.x === -1) {
                                this.animateRotZ(Math.PI, 0.4);
                            }
                            if (dir.z === 1) {
                                this.animateRotX(Math.PI, 0.4);
                            }
                            else if (dir.z === -1) {
                                this.animateRotX(- Math.PI, 0.4);
                            }
                            await this.animateWait(0.2);
                            newPos.y -= 5.5
                            await this.animatePosition(newPos, 0.5, Nabu.Easing.easeInSquare);
                            if (this.game.performanceWatcher.worst > 24) {
                                let explosionCloud = new Explosion(this.game);
                                let p = this.position.clone();
                                p.y = -1;
                                explosionCloud.origin.copyFrom(p);
                                explosionCloud.setRadius(0.4);
                                explosionCloud.color = new BABYLON.Color3(0.5, 0.5, 0.5);
                                explosionCloud.lifespan = 4;
                                explosionCloud.maxOffset = new BABYLON.Vector3(0, 0.4, 0);
                                explosionCloud.tZero = 0.9;
                                explosionCloud.boom();
                            }
                            this.fallImpactSound.play();
                            this.dispose();
                        }
                        else if (tileAtDestination) {

                        }
                        else {
                            let targetRotX = 0;
                            let newPos = this.position.clone();
                            newPos.x = newI * 1.1;
                            newPos.y = this.game.puzzle.hMapGet(newI, newJ);
                            newPos.z = newJ * 1.1;

                            let ray = new BABYLON.Ray(newPos.add(new BABYLON.Vector3(0, 0.3, 0)), new BABYLON.Vector3(0, -1, 0), 1);
                            let hit = this.game.scene.pickWithRay(
                                ray,
                                (mesh) => {
                                    return mesh.name === "floor" || mesh.name === "building-floor";
                                }
                            )
                            if (hit.hit) {
                                let n = hit.getNormal(true);
                                targetRotX = Mummu.AngleFromToAround(BABYLON.Axis.Y, n, BABYLON.Axis.X);
                            }
            
                            this.tileState = TileState.Moving;
                            setTimeout(() => {
                                this._pushCallback = undefined;
                            }, 500);
                            this.pushSound.play();
                            this.animateRotX(targetRotX, 1);
                            await this.animatePosition(newPos, 1, Nabu.Easing.easeOutSquare);
                            this.game.puzzle.updateGriddedStack(this);
                            this.tileState = TileState.Active;

                            let hIJ = this.game.puzzle.hMapGet(this.i, this.j);
                            let hIJm = this.game.puzzle.hMapGet(this.i, this.j - 1);
                            if (hIJ > hIJm) {
                                this.push(new BABYLON.Vector3(0, 0, -1));
                            }
                            else if (this._pushCallback) {
                                this._pushCallback();
                            }
                        }
                    }
                }
            }
        }
    }
}