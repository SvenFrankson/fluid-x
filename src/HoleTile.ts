/// <reference path="./Tile.ts"/>

class HoleTile extends Tile {

    public covered: boolean = false;
    public rumbling: boolean = false;
    public cracking: boolean = false;
    public covers: BABYLON.Mesh[];

    constructor(game: Game, props: TileProps) {
        super(game, props);
        this.color = props.color;
    }

    public async instantiate(): Promise<void> {
        await super.instantiate();
        
        if (this.covered) {
            if (!this.covers) {
                let datas = await this.game.vertexDataLoader.get("./datas/meshes/cracked-tile.babylon");
                let r = Math.floor(4 * Math.random()) * Math.PI * 0.5;

                this.covers = [];
                for (let n = 0; n < 3; n++) {
                    this.covers[n] = new BABYLON.Mesh("cover");
                    this.covers[n].parent = this;
                    this.covers[n].material = this.game.puzzle.floorMaterial;
                }
                this.covers[0].position.copyFromFloats(-0.15, 0, 0.25);
                Mummu.RotateInPlace(this.covers[0].position, BABYLON.Axis.Y, r);
                this.covers[1].position.copyFromFloats(0.3, 0, -0.15);
                Mummu.RotateInPlace(this.covers[1].position, BABYLON.Axis.Y, r);
                this.covers[2].position.copyFromFloats(-0.25, 0, -0.25);
                Mummu.RotateInPlace(this.covers[2].position, BABYLON.Axis.Y, r);
                
                for (let n = 0; n < 3; n++) {
                    let data = Mummu.CloneVertexData(datas[n]);
                    Mummu.RotateAngleAxisVertexDataInPlace(data, r, BABYLON.Axis.Y);
                    for (let i = 0; i < data.positions.length / 3; i++) {
                        data.uvs[2 * i] = 0.5 * (data.positions[3 * i] + this.position.x + this.covers[n].position.x);
                        data.uvs[2 * i + 1] = 0.5 * (data.positions[3 * i + 2] + this.position.z + this.covers[n].position.z) - 0.5;
                    }
                    data.applyToMesh(this.covers[n]);
                }
            }
        }
    }

    public fallsIn(ball: Ball): boolean {
        if (ball.position.x < this.position.x - 0.55) {
            return false;
        }
        if (ball.position.x > this.position.x + 0.55) {
            return false;
        }
        if (ball.position.z < this.position.z - 0.55) {
            return false;
        }
        if (ball.position.z > this.position.z + 0.55) {
            return false;
        }
        return true;
    }

    public async rumble(): Promise<void> {
        if (this.rumbling) {
            return;
        }
        this.game.puzzle.longCrackSound.play();

        this.rumbling = true;
        let t0 = performance.now() / 1000;
        let rumblingLoop = () => {
            if (this.cracking || this.isDisposed()) {
                return;
            }
            else {
                let dt = performance.now() / 1000 - t0;
                for (let i = 0; i < this.covers.length; i++) {
                    this.covers[i].position.y = 0.02 * Math.sin(i * Math.PI / 1.5 + 4 * 2 * Math.PI * dt);
                }
                let onePuckStillOn = false;
                let puzzle = this.game.puzzle;
                for (let i = 0; i < puzzle.ballsCount; i++) {
                    if (this.fallsIn(puzzle.balls[i])) {
                        onePuckStillOn = true;
                    }
                }

                if (onePuckStillOn) {
                    requestAnimationFrame(rumblingLoop);
                }
                else {
                    this.destroyCover();
                }
            }
        }
        rumblingLoop();
    }

    public async destroyCover(): Promise<void> {
        if (this.cracking) {
            return;
        }
        this.rumbling = false;
        this.cracking = true;
        this.covered = false;

        let wait = Mummu.AnimationFactory.CreateWait(this);
        let axisUp = BABYLON.Vector3.Cross(this.covers[0].position, BABYLON.Axis.Y);
        let dropUp = Mummu.AnimationFactory.CreateNumber(this.covers[0], this.covers[0].position, "y", () => {
            this.covers[0].rotate(axisUp, 0.02);
        });
        let axisRight = BABYLON.Vector3.Cross(this.covers[1].position, BABYLON.Axis.Y);
        let dropRight = Mummu.AnimationFactory.CreateNumber(this.covers[1], this.covers[1].position, "y", () => {
            this.covers[1].rotate(axisRight, 0.02);
        });
        let axisBottom = BABYLON.Vector3.Cross(this.covers[2].position, BABYLON.Axis.Y);
        let dropBottom = Mummu.AnimationFactory.CreateNumber(this.covers[2], this.covers[2].position, "y", () => {
            this.covers[2].rotate(axisBottom, 0.02);
        });

        /*
        this.game.toonSoundManager.start({
            text: "KRRRK",
            pos: this.covers[0].absolutePosition.clone(),
            color: "#5d7275",
            size: 0.2,
            duration: 0.3,
            type: ToonSoundType.Poc
        });
        */
        this.game.puzzle.snapBassSound.play();
        dropUp(-6, 1, Nabu.Easing.easeInSine).then(() => { this.covers[0].dispose(); this.game.puzzle.fallImpactSound.play(); });
        await wait(0.3);
        /*
        this.game.toonSoundManager.start({
            text: "KRRK",
            pos: this.covers[1].absolutePosition.clone(),
            color: "#5d7275",
            size: 0.2,
            duration: 0.3,
            type: ToonSoundType.Poc
        });
        */
        dropRight(-6, 1, Nabu.Easing.easeInSine).then(() => { this.covers[1].dispose(); this.game.puzzle.fallImpactSound.play(); });
        await wait(0.3);
        /*
        this.game.toonSoundManager.start({
            text: "KRRRRK",
            pos: this.covers[2].absolutePosition.clone(),
            color: "#5d7275",
            size: 0.2,
            duration: 0.3,
            type: ToonSoundType.Poc
        });
        */
        await dropBottom(-6, 1, Nabu.Easing.easeInSine).then(() => { this.covers[2].dispose(); this.game.puzzle.fallImpactSound.play(); });

        this.covers = [];
    }
}