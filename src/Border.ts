
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

    public static BorderLeft(game: Game, i: number, j: number, y: number = 0, ghost: boolean = false): Border {
        let border = new Border(game, ghost);
        border.position.x = (i - 0.5) * 1.1;
        border.position.y = y;
        border.position.z = j * 1.1;
        
        return border;
    }

    public static BorderRight(game: Game, i: number, j: number, y: number = 0, ghost: boolean = false): Border {
        let border = new Border(game, ghost);
        border.position.x = (i + 0.5) * 1.1;
        border.position.y = y;
        border.position.z = j * 1.1;
        
        return border;
    }

    public static BorderTop(game: Game, i: number, j: number, y: number = 0, ghost: boolean = false): Border {
        let border = new Border(game, ghost);
        border.vertical = false;
        border.position.x = i * 1.1;
        border.position.y = y;
        border.position.z = (j + 0.5) * 1.1;
        
        return border;
    }

    public static BorderBottom(game: Game, i: number, j: number, y: number = 0, ghost: boolean = false): Border {
        let border = new Border(game, ghost);
        border.vertical = false;
        border.position.x = i * 1.1;
        border.position.y = y;
        border.position.z = (j - 0.5) * 1.1;
        
        return border;
    }

    constructor(public game: Game, public ghost = false) {
        super("tile");

        this.material = this.game.blackMaterial;
        let index = this.game.puzzle.borders.indexOf(this);
        if (index === -1) {
            this.game.puzzle.borders.push(this);
        }
    }

    public async instantiate(): Promise<void> {
        if (!this.ghost) {
            let data = BABYLON.CreateBoxVertexData({ width: 0.1, height: 0.3, depth: 1.2 });
            Mummu.TranslateVertexDataInPlace(data, new BABYLON.Vector3(0, 0.15, 0));
            data.applyToMesh(this);
        }
    }


    public dispose(): void {
        let index = this.game.puzzle.borders.indexOf(this);
        if (index != -1) {
            this.game.puzzle.borders.splice(index, 1);
        }
        super.dispose();
    }

    public collide(ball: Ball, impact: BABYLON.Vector3): boolean {
        if (Math.abs(ball.position.y - this.position.y) > 0.6) {
            return false;
        }
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