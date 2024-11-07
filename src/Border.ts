
class Border extends BABYLON.Mesh {

    public get vertical(): boolean {
        return this.rotation.y === 0;
    }
    public set vertical(v: boolean) {
        this.rotation.y = v ? 0 : Math.PI * 0.5;
        this.w = v ? 0 : 1;
        this.d = v ? 1 : 0;
    }

    public w: number = 0;
    public d: number = 1;

    public get i(): number {
        return Math.floor(this.position.x / 1.1);
    }

    public get j(): number {
        return Math.floor(this.position.z / 1.1);
    }

    public static BorderLeft(game: Game, i: number, j: number, y: number = 0, ghost: boolean = false): Border {
        let border = new Border(game, ghost);
        border.position.x = (i - 0.5) * 1.1;
        border.position.y = y;
        border.position.z = j * 1.1;
        
        border.game.puzzle.updateGriddedBorderStack(border, true);
        
        return border;
    }

    public static BorderRight(game: Game, i: number, j: number, y: number = 0, ghost: boolean = false): Border {
        let border = new Border(game, ghost);
        border.position.x = (i + 0.5) * 1.1;
        border.position.y = y;
        border.position.z = j * 1.1;
        
        border.game.puzzle.updateGriddedBorderStack(border, true);
        
        return border;
    }

    public static BorderTop(game: Game, i: number, j: number, y: number = 0, ghost: boolean = false): Border {
        let border = new Border(game, ghost);
        border.vertical = false;
        border.position.x = i * 1.1;
        border.position.y = y;
        border.position.z = (j + 0.5) * 1.1;
        
        border.game.puzzle.updateGriddedBorderStack(border, true);
        
        return border;
    }

    public static BorderBottom(game: Game, i: number, j: number, y: number = 0, ghost: boolean = false): Border {
        let border = new Border(game, ghost);
        border.vertical = false;
        border.position.x = i * 1.1;
        border.position.y = y;
        border.position.z = (j - 0.5) * 1.1;
        
        border.game.puzzle.updateGriddedBorderStack(border, true);

        return border;
    }

    constructor(public game: Game, public ghost = false) {
        super("tile");

        this.material = this.game.borderMaterial;

        this.renderOutline = true;
        this.outlineColor = BABYLON.Color3.Black();
        this.outlineWidth = 0.01;
    }

    public async instantiate(): Promise<void> {
        if (!this.ghost) {
            let borderDatas = await this.game.vertexDataLoader.get("./datas/meshes/border.babylon");
            if (this.vertical) {
                let jPlusStack = this.game.puzzle.getGriddedBorderStack(this.i, this.j + 1);
                let jPlusConn = jPlusStack && jPlusStack.array.find(brd => { return brd.position.y === this.position.y && brd.vertical === this.vertical; });

                let jMinusStack = this.game.puzzle.getGriddedBorderStack(this.i, this.j - 1);
                let jMinusConn = jMinusStack && jMinusStack.array.find(brd => { return brd.position.y === this.position.y && brd.vertical === this.vertical; });

                if (jPlusConn && jMinusConn) {
                    borderDatas[0].applyToMesh(this);
                }
                else if (jPlusConn) {
                    Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(borderDatas[3]), Math.PI, BABYLON.Axis.Y).applyToMesh(this);
                }
                else if (jMinusConn) {
                    borderDatas[3].applyToMesh(this);
                }
                else {
                    borderDatas[4].applyToMesh(this);
                }
            }
            else {
                let iPlusStack = this.game.puzzle.getGriddedBorderStack(this.i + 1, this.j);
                let iPlusConn = iPlusStack && iPlusStack.array.find(brd => { return brd.position.y === this.position.y && !brd.vertical });

                let iMinusStack = this.game.puzzle.getGriddedBorderStack(this.i - 1, this.j);
                let iMinusConn = iMinusStack && iMinusStack.array.find(brd => { return brd.position.y === this.position.y && !brd.vertical });

                if (iPlusConn && iMinusConn) {
                    borderDatas[0].applyToMesh(this);
                }
                else if (iPlusConn) {
                    Mummu.RotateAngleAxisVertexDataInPlace(Mummu.CloneVertexData(borderDatas[1]), Math.PI, BABYLON.Axis.Y).applyToMesh(this);
                }
                else if (iMinusConn) {
                    borderDatas[1].applyToMesh(this);
                }
                else {
                    borderDatas[2].applyToMesh(this);
                }
            }
        }
    }


    public dispose(): void {
        this.game.puzzle.removeFromGriddedBorderStack(this);
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

        let dx = ball.position.x - Nabu.MinMax(ball.position.x, this.position.x - 0.5 * this.w, this.position.x + 0.5 * this.w);
        let dz = ball.position.z - Nabu.MinMax(ball.position.z, this.position.z - 0.5 * this.d, this.position.z + 0.5 * this.d);

        let dd = dx * dx + dz * dz;
        if (dd < ball.radius * ball.radius) {
            impact.x = Nabu.MinMax(ball.position.x, this.position.x - 0.5 * this.w, this.position.x + 0.5 * this.w);
            impact.y = ball.position.y;
            impact.z = Nabu.MinMax(ball.position.z, this.position.z - 0.5 * this.d, this.position.z + 0.5 * this.d);
            return true;
        }

        return false;
    }
}