interface TileProps {
    color: TileColor;
    i?: number;
    j?: number;
    h?: number;
}

abstract class Tile extends BABYLON.Mesh {

    public shadow: BABYLON.Mesh;

    public animateSize = Mummu.AnimationFactory.EmptyNumberCallback;
    public color: TileColor;

    public get size(): number {
        return this.scaling.x;
    }
    public set size(s: number) {
        this.scaling.copyFromFloats(s, s, s);
    }

    constructor(public game: Game, props: TileProps) {
        super("tile");
        this.color = props.color;
        if (isFinite(props.i)) {
            this.position.x = props.i * 1.1;
        }
        if (isFinite(props.j)) {
            this.position.z = props.j * 1.1;
        }
        if (isFinite(props.h)) {
            this.position.y = props.h;
        }

        this.shadow = new BABYLON.Mesh("shadow");
        this.shadow.position.x = -0.015;
        this.shadow.position.y = 0.01;
        this.shadow.position.z = -0.015;
        this.shadow.parent = this;

        this.shadow.material = this.game.shadow9Material;

        this.animateSize = Mummu.AnimationFactory.CreateNumber(this, this, "size");
    }

    public async instantiate(): Promise<void> {
        let index = this.game.terrain.tiles.indexOf(this);
        if (index === -1) {
            this.game.terrain.tiles.push(this);
        }

        let m = 0.05;
        let shadowData = Mummu.Create9SliceVertexData({
            width: 1 + 2 * m,
            height: 1 + 2 * m,
            margin: m
        });
        Mummu.RotateVertexDataInPlace(shadowData, BABYLON.Quaternion.FromEulerAngles(Math.PI * 0.5, 0, 0));
        shadowData.applyToMesh(this.shadow);
    }

    public async bump(): Promise<void> {
        await this.animateSize(1.1, 0.1);
        await this.animateSize(1, 0.1);
    }

    public dispose(): void {
        let index = this.game.terrain.tiles.indexOf(this);
        if (index != -1) {
            this.game.terrain.tiles.splice(index, 1);
        }
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
}