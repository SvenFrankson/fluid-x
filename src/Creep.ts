class Creep extends BABYLON.Mesh {

    public shell: BABYLON.Mesh;
    public shellColored: BABYLON.Mesh;
    public spikes: BABYLON.Mesh;
    public shadow: BABYLON.Mesh;
    public dir: BABYLON.Vector2 = new BABYLON.Vector2(1, 0);
    public destI: number;
    public destJ: number;

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

    public animateSize = Mummu.AnimationFactory.EmptyNumberCallback;

    public get game(): Game {
        return this.puzzle.game;
    }

    constructor(public puzzle: Puzzle, public props: TileProps) {
        super("creep");

        if (isFinite(props.i)) {
            this.i = props.i;
        }
        if (isFinite(props.j)) {
            this.j = props.j;
        }
        if (isFinite(props.h)) {
            this.position.y = props.h;
        }

        puzzle.creeps.push(this);
        
        this.shell = new BABYLON.Mesh("shell");
        this.shell.parent = this;
        this.shell.material = this.game.whiteMaterial;

        this.shell.renderOutline = true;
        this.shell.outlineColor = BABYLON.Color3.Black();
        this.shell.outlineWidth = 0.02;
        
        this.shellColored = new BABYLON.Mesh("shell-colored");
        this.shellColored.parent = this.shell;
        this.shellColored.material = this.game.redMaterial;

        this.shellColored.renderOutline = true;
        this.shellColored.outlineColor = BABYLON.Color3.Black();
        this.shellColored.outlineWidth = 0.02;
        
        this.spikes = new BABYLON.Mesh("spikes");
        this.spikes.parent = this.shell;
        this.spikes.material = this.game.trueWhiteMaterial;

        this.spikes.renderOutline = true;
        this.spikes.outlineColor = BABYLON.Color3.Black();
        this.spikes.outlineWidth = 0.02;

        this.shadow = new BABYLON.Mesh("shadow");
        this.shadow.position.x = 0;
        this.shadow.position.y = 0.05;
        this.shadow.position.z = 0;
        this.shadow.parent = this;

        this.shadow.material = this.game.shadowDiscMaterial;

        this.animateSize = Mummu.AnimationFactory.CreateNumber(this, this, "size");
    }

    public async instantiate(): Promise<void> {
        let data = await this.game.vertexDataLoader.get("./datas/meshes/creep.babylon");
        data[0].applyToMesh(this.shell);
        data[1].applyToMesh(this.shellColored);
        data[2].applyToMesh(this.spikes);
        BABYLON.CreateGroundVertexData({ width: 0.8, height: 0.8 }).applyToMesh(this.shadow);
    }

    public async bump(): Promise<void> {
        await this.animateSize(1.1, 0.1);
        await this.animateSize(1, 0.1);
    }

    public async shrink(): Promise<void> {
        await this.animateSize(1.1, 0.1);
        await this.animateSize(0.4, 0.3);
    }

    public dispose(): void {
        let index = this.puzzle.creeps.indexOf(this);
        if (index != -1) {
            this.puzzle.creeps.splice(index, 1);
        }
        super.dispose();
    }

    public isFree(i: number, j: number): boolean {
        if (i < 0 || i >= this.puzzle.w) {
            return false;
        }
        if (j < 0 || j >= this.puzzle.h) {
            return false;
        }
        let stack = this.puzzle.getGriddedStack(i, j);
        if (stack) {
            let tile = stack.array.find(t => { return Math.abs(t.position.y - this.position.y) < 0.6; });
            if (tile) {
                if (tile instanceof DoorTile && !tile.closed) {
                    return true;
                }
                if (tile instanceof HoleTile && tile.covered) {
                    return true;
                }
                return false;
            }
        }
        return true;
    }

    public updateDest(): void {
        let left = new BABYLON.Vector2(
            - this.dir.y,
            this.dir.x
        );
        
        let right = new BABYLON.Vector2(
            this.dir.y,
            - this.dir.x
        );

        let backRightI = Math.round(this.i + right.x - this.dir.x);
        let backRightJ = Math.round(this.j + right.y - this.dir.y);

        let rightI = Math.round(this.i + right.x);
        let rightJ = Math.round(this.j + right.y);

        if (!this.isFree(backRightI, backRightJ) && this.isFree(rightI, rightJ)) {
            this.dir.copyFrom(right);
            this.destI = rightI;
            this.destJ = rightJ;
            return;
        }

        let forwardI = Math.round(this.i + this.dir.x);
        let forwardJ = Math.round(this.j + this.dir.y);
        if (this.isFree(forwardI, forwardJ)) {
            this.destI = forwardI;
            this.destJ = forwardJ;
            return;
        }

        let leftI = Math.round(this.i + left.x);
        let leftJ = Math.round(this.j + left.y);
        if (this.isFree(leftI, leftJ)) {
            this.dir.copyFrom(left);
            this.destI = leftI;
            this.destJ = leftJ;
            return;
        }

        let backI = Math.round(this.i - this.dir.x);
        let backJ = Math.round(this.j - this.dir.y);
        if (this.isFree(backI, backJ)) {
            this.dir.scaleInPlace(-1);
            this.destI = backI;
            this.destJ = backJ;
            return;
        }

        if (this.isFree(rightI, rightJ)) {
            this.dir.copyFrom(right);
            this.destI = rightI;
            this.destJ = rightJ;
            return;
        }
    }

    public moveTo(destination: BABYLON.Vector3, duration: number = 1): Promise<void> {
        return new Promise<void>(resolve => {
            let t0 = performance.now();
            let origin = this.position.clone();
            let step = () => {
                let dt = (performance.now() - t0) / 1000;
                let f = dt / duration;
                if (f < 1) {
                    f = Nabu.Easing.easeInOutSine(f);
                    BABYLON.Vector3.LerpToRef(origin, destination, f, this.position);
                    this.shell.position.y = 0.4 * Math.sin(f * Math.PI);
                    this.shell.rotation.x = 0.3 * Math.sin(f * 2 * Math.PI);
                    this.shell.rotation.z = 0.3 * Math.sin(f * 2 * Math.PI);
                    this.shell.rotation.y = f * 2 * Math.PI;
                    requestAnimationFrame(step);
                }
                else {
                    this.position.copyFrom(destination);
                    this.shell.position.y = 0;
                    this.shell.rotation.x = 0;
                    this.shell.rotation.y = 0;
                    resolve();
                }
            }
            step();
        });
    }

    private _moving: boolean = false;
    public update(rawDT: number): void {
        if (this.puzzle.puzzleState === PuzzleState.Playing) {
            if (!this._moving) {
                this.updateDest();
                console.log(this.dir);
                let dest = new BABYLON.Vector3(this.destI * 1.1, 0, this.destJ * 1.1);
                if (Mummu.IsFinite(dest)) {
                    this._moving = true;
                    this.moveTo(dest, 1).then(() => { this._moving = false; });
                }
                
            }
        }
    }
}