
class Border extends BABYLON.Mesh {

    public get vertical(): boolean {
        return this.rotation.y === 0;
    }
    public set vertical(v: boolean) {
        this.rotation.y = v ? 0 : Math.PI * 0.5;
        this.w = v ? 0.1 : 1;
        this.d = v ? 1 : 0.1;
    }

    public w: number = 0.1;
    public d: number = 1;

    constructor(public game: Game) {
        super("tile");

        this.material = this.game.blackMaterial;
    }

    public async instantiate(): Promise<void> {
        let index = this.game.terrain.borders.indexOf(this);
        if (index === -1) {
            this.game.terrain.borders.push(this);
        }
        BABYLON.CreateBoxVertexData({ width: 0.1, height: 0.6, depth: 1 }).applyToMesh(this);
    }


    public dispose(): void {
        let index = this.game.terrain.borders.indexOf(this);
        if (index != -1) {
            this.game.terrain.borders.splice(index, 1);
        }
        super.dispose();
    }

    public collide(ball: Ball, impact: BABYLON.Vector3): boolean {
        if (ball.position.x + ball.radius < this.position.x - 0.5 * this.w) {
            return false;
        }
        if (ball.position.x - ball.radius > this.position.x + 0.5 * this.w) {
            return false;
        }
        if (ball.position.z + ball.radius < this.position.z - 0.5 * this.d) {
            return false;
        }
        if (ball.position.z - ball.radius > this.position.z + 0.5 * this.d) {
            return false;
        }

        let dx = ball.position.x - Nabu.MinMax(ball.position.x, this.position.x - this.w, this.position.x + this.w);
        let dz = ball.position.z - Nabu.MinMax(ball.position.z, this.position.z - this.d, this.position.z + this.d);

        let dd = dx * dx + dz * dz;
        if (dd < ball.radius * ball.radius) {
            impact.x = Nabu.MinMax(ball.position.x, this.position.x - this.w, this.position.x + this.w);
            impact.y = ball.position.y;
            impact.z = Nabu.MinMax(ball.position.z, this.position.z - this.d, this.position.z + this.d);
            return true;
        }

        return false;
    }
}