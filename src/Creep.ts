class Creep extends BABYLON.Mesh {

    public radius: number = 0.4;

    public shell: BABYLON.Mesh;
    public shellColored: BABYLON.Mesh;
    public spikes: BABYLON.Mesh;
    public slash: BABYLON.Mesh;
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

    public get size(): number {
        return this.shell.scaling.x;
    }
    public set size(s: number) {
        this.shell.scaling.copyFromFloats(s, s, s);
        this.shadow.scaling.copyFromFloats(s * 1.2, s * 1.2, s * 1.2);
    }

    public get slashSize(): number {
        return this.slash.scaling.x;
    }
    public set slashSize(s: number) {
        this.slash.scaling.copyFromFloats(s, s, s);
    }

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
        
        this.slash = new BABYLON.Mesh("slash");
        this.slash.parent = this.shell;
        this.slash.position.y = 0.1;
        this.slash.material = this.game.creepSlashMaterial;
        this.slashSize = 0.1;

        this.shadow = new BABYLON.Mesh("shadow");
        this.shadow.position.x = 0;
        this.shadow.position.y = 0.05;
        this.shadow.position.z = 0;
        this.shadow.parent = this;

        this.shadow.material = this.game.shadowDiscMaterial;

        this.animateSize = Mummu.AnimationFactory.CreateNumber(this, this, "size");
    }

    public async instantiate(): Promise<void> {
        //await RandomWait();
        let data = await this.game.vertexDataLoader.get("./datas/meshes/creep.babylon");
        data[0].applyToMesh(this.shell);
        data[1].applyToMesh(this.shellColored);
        data[2].applyToMesh(this.spikes);
        BABYLON.CreateGroundVertexData({ width: 0.8, height: 0.8 }).applyToMesh(this.shadow);
        BABYLON.CreateGroundVertexData({ width: 0.8, height: 0.8 }).applyToMesh(this.slash);
    }

    public async shrink(): Promise<void> {
        //await RandomWait();
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

    public canGoFromTo(fromI: number, fromJ: number, toI: number, toJ: number): boolean {
        let h = this.puzzle.hMapGet(toI, toJ);
        if (Math.abs(h - this.position.y) < 0.5) {
            if (this.isFree(toI, toJ)) {
                let dirI = Math.round(toI - fromI);
                let dirJ = Math.round(toJ - fromJ);
                if (dirI > 0) {
                    let stack = this.game.puzzle.getGriddedBorderStack(fromI, fromJ);
                    if (stack && stack.array.find((b) => { return b.vertical && Math.abs(b.position.y - this.position.y) < 0.6; })) {
                        return false;
                    }
                }
                else if (dirI < 0) {
                    let stack = this.game.puzzle.getGriddedBorderStack(toI, fromJ);
                    if (stack && stack.array.find((b) => { return b.vertical && Math.abs(b.position.y - this.position.y) < 0.6; })) {
                        return false;
                    }
                }
                else if (dirJ > 0) {
                    let stack = this.game.puzzle.getGriddedBorderStack(fromI, fromJ);
                    if (stack && stack.array.find((b) => { return !b.vertical && Math.abs(b.position.y - this.position.y) < 0.6; })) {
                        return false;
                    }
                }
                else if (dirJ < 0) {
                    let stack = this.game.puzzle.getGriddedBorderStack(fromI, toJ);
                    if (stack && stack.array.find((b) => { return !b.vertical && Math.abs(b.position.y - this.position.y) < 0.6; })) {
                        return false;
                    }
                }
                return true;
            }
        }
        return false;
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

        if (!this.canGoFromTo(this.i - this.dir.x, this.j - this.dir.y, backRightI, backRightJ) && this.canGoFromTo(this.i, this.j, rightI, rightJ)) {
            this.dir.copyFrom(right);
            this.destI = rightI;
            this.destJ = rightJ;
            return;
        }

        let forwardI = Math.round(this.i + this.dir.x);
        let forwardJ = Math.round(this.j + this.dir.y);
        if (this.canGoFromTo(this.i, this.j, forwardI, forwardJ)) {
            this.destI = forwardI;
            this.destJ = forwardJ;
            return;
        }

        let leftI = Math.round(this.i + left.x);
        let leftJ = Math.round(this.j + left.y);
        if (this.canGoFromTo(this.i, this.j, leftI, leftJ)) {
            this.dir.copyFrom(left);
            this.destI = leftI;
            this.destJ = leftJ;
            return;
        }

        if (this.canGoFromTo(this.i, this.j, rightI, rightJ)) {
            this.dir.copyFrom(right);
            this.destI = rightI;
            this.destJ = rightJ;
            return;
        }

        let backI = Math.round(this.i - this.dir.x);
        let backJ = Math.round(this.j - this.dir.y);
        if (this.canGoFromTo(this.i, this.j, backI, backJ)) {
            this.dir.scaleInPlace(-1);
            this.destI = backI;
            this.destJ = backJ;
            return;
        }
    }

    public stopMove: boolean = false;
    public moveTo(destination: BABYLON.Vector3, duration: number = 1): Promise<void> {
        return new Promise<void>(resolve => {
            let t0 = performance.now();
            let origin = this.position.clone();
            let step = () => {
                if (this.stopMove) {
                    return;
                }
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

    public bump(duration: number = 1): Promise<void> {
        return new Promise<void>(resolve => {
            let pY0 = this.shell.position.y;
            let rX0 = this.shell.rotation.x;
            let rY0 = this.shell.rotation.z;
            let rZ0 = this.shell.rotation.z;
            let t0 = performance.now();
            this.puzzle.wiishSound.play();
            let step = () => {
                let dt = (performance.now() - t0) / 1000;
                let f = dt / duration;
                if (f < 1) {
                    let popD = 0.25;
                    if (f < popD) {
                        let fSize = f / popD;
                        fSize = Nabu.Easing.easeOutSine(fSize);
                        this.size = 1 + 0.3 * fSize;
                    }
                    else {
                        let fSize = 1 - (f - popD) / (1 - popD);
                        fSize = Nabu.Easing.easeInOutSine(fSize);
                        this.size = 1 + 0.3 * fSize;
                    }

                    f = Nabu.Easing.easeOutSine(f);
                    this.shell.position.y = pY0 * (1 - f);
                    this.shell.rotation.x = rX0 * (1 - f);
                    this.shell.rotation.y = rY0 * (1 - f) + (rY0 + 3 * Math.PI) * f;
                    this.shell.rotation.z = rZ0 * (1 - f);
                    this.slash.rotation.y = f * 4 * Math.PI;
                    requestAnimationFrame(step);

                    let slashD = 0.2;
                    let fSlash = f / slashD;
                    if (f > 1 - slashD) {
                        fSlash = 1 - (f - (1 - slashD)) / slashD;
                    }
                    fSlash = Nabu.MinMax(fSlash, 0, 1);
                    fSlash = Nabu.Easing.easeOutCubic(fSlash);
                    this.slashSize = 0.1 + 1.2 * fSlash;
                }
                else {
                    this.size = 1;
                    this.shell.position.y = 0;
                    this.shell.rotation.y = rY0 + 3 * Math.PI;
                    this.shell.rotation.x = 0;
                    this.shell.rotation.z = 0;
                    this.slashSize = 0.1;
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
                let dest = new BABYLON.Vector3(this.destI * 1.1, this.puzzle.hMapGet(this.destI, this.destJ), this.destJ * 1.1);
                if (Mummu.IsFinite(dest)) {
                    this._moving = true;
                    this.moveTo(dest, 1).then(() => { this._moving = false; });
                }
                
            }
        }
    }
}