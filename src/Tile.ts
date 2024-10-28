interface TileProps {
    color: TileColor;
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
            let m = 0.05;
            let shadowData = Mummu.Create9SliceVertexData({
                width: 1 + 2 * m,
                height: 1 + 2 * m,
                margin: m
            });
            Mummu.RotateVertexDataInPlace(shadowData, BABYLON.Quaternion.FromEulerAngles(Math.PI * 0.5, 0, 0));
            shadowData.applyToMesh(this.shadow);
        }
    }

    public async bump(): Promise<void> {
        await this.animateSize(1.1, 0.1);
        await this.animateSize(1, 0.1);
    }

    public async shrink(): Promise<void> {
        await this.animateSize(1.1, 0.1);
        await this.animateSize(0.01, 0.4);
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
        let spireCount = (Math.floor(Math.random() * 2) + 1) * 2;
        let a = (t: number) => {
            return t * spireCount * Math.PI;
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

        let dest = this.game.puzzle.fetchWinSlotPos(this.color);
        let path = this.getWinPath(dest);

        let star = BABYLON.MeshBuilder.CreateBox("star", { size: 0.4 });
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


        let tail = new BABYLON.Mesh("tail");
        tail.visibility = 0.6;
        tail.material = this.game.colorMaterials[this.color];
        let tailPoints: BABYLON.Vector3[] = [path[0]];

        let n = 0;
        let step = () => {
            let d = BABYLON.Vector3.Distance(star.position, path[n]);
            if (d < 0.4) {
                n++;
                if (!path[n]) {
                    tail.dispose();
                    star.setParent(this.game.puzzle.border);
                    return;
                }
                tailPoints.push(path[n]);
                if (tailPoints.length > 20) {
                    tailPoints.splice(0, 1);
                }
            }
            Mummu.StepToRef(star.position, path[n], 0.4, star.position);
            if (tailPoints.length > 2) {
                let data = Mummu.CreateWireVertexData({
                    path: [...tailPoints, star.position],
                    pathUps: [...tailPoints.map(p => { return BABYLON.Axis.Y; }), BABYLON.Axis.Y],
                    radiusFunc: (f) => {
                        return 0.1 * f + 0.01;
                    },
                    color: new BABYLON.Color4(1, 0.4, 0.4, 1)
                });
                data.applyToMesh(tail);
            }
            requestAnimationFrame(step);
        }
        step();
    }
}