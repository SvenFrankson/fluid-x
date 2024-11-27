interface TileProps {
    color?: TileColor;
    value?: number;
    i?: number;
    j?: number;
    h?: number;
    noShadow?: boolean;
}

enum TileState {
    Active,
    Dying,
    Moving
}

abstract class Tile extends BABYLON.Mesh {

    public tileState: TileState = TileState.Active;
    public shadow: BABYLON.Mesh;

    public animateSize = Mummu.AnimationFactory.EmptyNumberCallback;
    public color: TileColor;

    public get size(): number {
        return this.scaling.x;
    }
    public set size(s: number) {
        this.scaling.copyFromFloats(s, s, s);
    }

    public get i(): number {
        return Math.round(this.position.x / 1.1);
    }
    public set i(v: number) {
        this.position.x = v * 1.1;
    }
    public get j(): number {
        return Math.round(this.position.z / 1.1);
    }
    public set j(v: number) {
        this.position.z = v * 1.1;
    }

    constructor(public game: Game, public props: TileProps) {
        super("tile");
        this.color = props.color;
        if (isFinite(props.i)) {
            this.i = props.i;
        }
        if (isFinite(props.j)) {
            this.j = props.j;
        }
        if (isFinite(props.h)) {
            this.position.y = props.h;
        }
        this.game.puzzle.tiles.push(this);
        this.game.puzzle.updateGriddedStack(this, true);

        if (props.noShadow != true) {
            this.shadow = new BABYLON.Mesh("shadow");
            this.shadow.position.x = -0.015;
            this.shadow.position.y = 0.01;
            this.shadow.position.z = -0.015;
            this.shadow.parent = this;
    
            this.shadow.material = this.game.shadow9Material;
        }

        this.animateSize = Mummu.AnimationFactory.CreateNumber(this, this, "size");
    }

    public async instantiate(): Promise<void> {
        if (this.props.noShadow != true) {
            let m = 0.06;
            let shadowData = Mummu.Create9SliceVertexData({
                width: 1 + 2 * m,
                height: 1 + 2 * m,
                margin: m
            });
            Mummu.RotateVertexDataInPlace(shadowData, BABYLON.Quaternion.FromEulerAngles(Math.PI * 0.5, 0, 0));
            shadowData.applyToMesh(this.shadow);
        }
    }

    public async bump(duration: number = 0.2): Promise<void> {
        await this.animateSize(1.1, duration * 0.5);
        await this.animateSize(1, duration * 0.5);
    }

    public async shrink(): Promise<void> {
        await this.animateSize(1.1, 0.1, Nabu.Easing.easeOutSine);
        await this.animateSize(0.4, 0.3, Nabu.Easing.easeInSine);
    }

    public dispose(): void {
        let index = this.game.puzzle.tiles.indexOf(this);
        if (index != -1) {
            this.game.puzzle.tiles.splice(index, 1);
        }
        this.game.puzzle.removeFromGriddedStack(this);
        super.dispose();
    }

    public collide(ball: Ball, impact: BABYLON.Vector3): boolean {
        if (Math.abs(ball.position.y - this.position.y) > 0.5) {
            return false;
        }
        if (ball.position.x + ball.radius < this.position.x - 0.5) {
            return false;
        }
        if (ball.position.x - ball.radius > this.position.x + 0.5) {
            return false;
        }
        if (ball.position.z + ball.radius < this.position.z - 0.5) {
            return false;
        }
        if (ball.position.z - ball.radius > this.position.z + 0.5) {
            return false;
        }

        let dx = ball.position.x - Nabu.MinMax(ball.position.x, this.position.x - 0.5, this.position.x + 0.5);
        let dz = ball.position.z - Nabu.MinMax(ball.position.z, this.position.z - 0.5, this.position.z + 0.5);

        let dd = dx * dx + dz * dz;
        if (dd < ball.radius * ball.radius) {
            impact.x = Nabu.MinMax(ball.position.x, this.position.x - 0.5, this.position.x + 0.5);
            impact.y = ball.position.y;
            impact.z = Nabu.MinMax(ball.position.z, this.position.z - 0.5, this.position.z + 0.5);
            return true;
        }

        return false;
    }

    public getWinPath(dest: BABYLON.Vector3): BABYLON.Vector3 [] {

        let origin = this.position.clone();
        let dir = dest.subtract(origin).normalize();
        let c = (t: number) => {
            let p = BABYLON.Vector3.Lerp(origin, dest, t);
            p.y += 2 * Math.sin(t * Math.PI)
            return p;
        }
        let a0 = 2 * Math.PI * Math.random();
        let spireCount = (Math.floor(Math.random() * 6) + 2);
        let a = (t: number) => {
            return a0 + t * spireCount * Math.PI;
        }
        let r = (t: number) => {
            return Math.sin(t * Math.PI);
        }

        let p = (t: number) => {
            let p = dir.scale(r(t));
            Mummu.RotateInPlace(p, BABYLON.Axis.Y, a(t));
            p.addInPlace(c(t));
            return p;
        }

        let path: BABYLON.Vector3[] = [];
        for (let i = 0; i <= 100; i++) {
            path[i] = p(i / 100);
        }

        return path;
    }

    public shootStar(): void {
        let dy = 0.4;
        let dest = this.game.puzzle.fetchWinSlotPos(this.color);
        dest.y += dy;
        let path = this.getWinPath(dest);

        let star = BABYLON.MeshBuilder.CreateBox("star", { size: 0.4 });
        this.game.puzzle.stars.push(star);
        let tileData = CreateBoxFrameVertexData({
            w: 1,
            d: 1,
            h: 0.35,
            thickness: 0.05,
            flatShading: true,
            topCap: false,
            bottomCap: true,
        })
        tileData.applyToMesh(star);
        star.material = this.material;
        star.position.copyFrom(this.position);

        let starTop = BABYLON.CreateGround("startop", { width: 0.9, height: 0.9 });
        starTop.position.y = 0.3;
        starTop.parent = star;
        starTop.material = this.game.tileColorMaterials[this.color];

        star.scaling.copyFromFloats(0.4, 0.4, 0.4);

        let tail: BABYLON.Mesh;
        let tailPoints: BABYLON.Vector3[];
        if (this.game.performanceWatcher.worst > 24) {
            tail = new BABYLON.Mesh("tail");
            tail.visibility = 1;
            tail.material = this.game.tileStarTailMaterial;
            tailPoints = [];
        }
        

        this.game.puzzle.wooshSound.play();
        let t0 = performance.now();
        let duration = 1.5;
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
                star.rotation.y = f * 2 * Math.PI;
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
                        let start = Math.floor((- 1.1 + 2.2 * f) * path.length);
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
                                return 0.02 * f + 0.01;
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
                if (tail) {
                    tail.dispose();
                }
                star.position.copyFrom(dest);
                star.setParent(this.game.puzzle.border);

                let index = this.game.puzzle.stars.indexOf(star);
                if (index != -1) {
                    this.game.puzzle.stars.splice(index, 1);
                }

                let animateY = Mummu.AnimationFactory.CreateNumber(star, star.position, "y");
                animateY(star.position.y - dy, 0.4, Nabu.Easing.easeInOutSine).then(() => {
                    star.freezeWorldMatrix();
                    starTop.freezeWorldMatrix();
                    let flash = Mummu.Create9Slice("flash", {
                        width: 1.2,
                        height: 1.2,
                        margin: 0.1
                    });
                    flash.material = this.game.whiteShadow9Material;
                    flash.parent = star;
                    flash.position.y = 0.29;
                    flash.rotation.x = Math.PI * 0.5;
                    SineFlashVisibility(flash, 0.3).then(() => {
                        flash.dispose();
                    });

                    this.game.puzzle.clicSound.play();
                });
            }
        }
        step();
    }
}