interface TileProps {
    color: TileColor;
    i?: number;
    j?: number;
}

abstract class Tile extends BABYLON.Mesh {

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

        this.animateSize = Mummu.AnimationFactory.CreateNumber(this, this, "size");
    }

    public async instantiate(): Promise<void> { }

    public async bump(): Promise<void> {
        await this.animateSize(1.1, 0.1);
        await this.animateSize(1, 0.1);
    }

    public dispose(): void {
        let index = this.game.tiles.indexOf(this);
        if (index != -1) {
            this.game.tiles.splice(index, 1);
        }
        super.dispose();
    }

    public collide(ball: Ball): boolean {
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
        return true;
    }
}