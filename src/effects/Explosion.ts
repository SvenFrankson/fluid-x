class /*Macron*/ Explosion {

    public origin: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public lifespan: number = 2;
    public tZero: number = 0;

    public particles: BABYLON.Mesh[] = [];
    public particulesCount: number = 10;
    public particuleRadius: number = 1;
    public targetPositions: BABYLON.Vector3[] = [];
    public delays: number[] = [];

    public radiusXZ: number = 1;
    public radiusY: number = 1;
    public setRadius(v: number): void {
        this.radiusXZ = v;
        this.radiusY = v;
        this.particuleRadius = v;
    }
    public maxOffset: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    
    public bubbleMaterial: ExplosionMaterial;
    public get color(): BABYLON.Color3 {
        if (this.bubbleMaterial) {
            return this.bubbleMaterial.diffuse;
        }
        return BABYLON.Color3.White();
    }
    public set color(c: BABYLON.Color3) {
        if (this.bubbleMaterial) {
            this.bubbleMaterial.setDiffuse(c);
        }
    }
    
    public keepAlive: boolean = false;
    public sizeEasing: (v: number) => number;

    constructor(public game: Game) {
        if (this.game.performanceWatcher.supportTexture3D) {
            this.bubbleMaterial = new ExplosionMaterial("explosion-material", this.game.scene);
            this.bubbleMaterial.setUseLightFromPOV(true);
            this.bubbleMaterial.setAutoLight(0.8);
        }
    }

    public static RandomInSphere(): BABYLON.Vector3 {
        let p = new BABYLON.Vector3(
            - 1 + 2 * Math.random(),
            - 1 + 2 * Math.random(),
            - 1 + 2 * Math.random(),
        );
        while (p.lengthSquared() > 1) {
            p.copyFromFloats(
                - 1 + 2 * Math.random(),
                - 1 + 2 * Math.random(),
                - 1 + 2 * Math.random(),
            );
        }
        return p;
    }

    public dispose(): void {
        this.game.scene.onBeforeRenderObservable.removeCallback(this.update);
        while (this.particles.length > 0) {
            this.particles.pop().dispose();
        }
    }

    public async MakeNoisedBlob(radius: number): Promise<BABYLON.VertexData> {
        //await RandomWait();
        let data = await this.game.vertexDataLoader.getAtIndex("datas/meshes/explosion.babylon", 0);
        data = Mummu.CloneVertexData(data);
        data = Mummu.ScaleVertexDataInPlace(data, radius);
        let positions = [...data.positions];
        let delta = new BABYLON.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
        delta.scaleInPlace(radius * 0.5 * Math.random());
        for (let i = 0; i < positions.length / 3; i++) {
            positions[3 * i + 0] += delta.x;
            positions[3 * i + 1] += delta.y;
            positions[3 * i + 2] += delta.z;
        }
        data.positions = positions;
        return data;
    }

    public async boom(): Promise<void> {
        if (!this.game.performanceWatcher.supportTexture3D) {
            return
        }
        this.game.scene.onBeforeRenderObservable.removeCallback(this.update);
        if (this.particles.length > 0 && this.particles.length != this.particulesCount) {
            while (this.particles.length > 0) {
                this.particles.pop().dispose();
            }
            this.targetPositions = [];
        }

        this._timer = 0;
        this.bubbleMaterial.setFloat("time", 0);
        this.bubbleMaterial.setVector3("origin", this.origin);
        this.bubbleMaterial.setFloat("radius", 2 * this.radiusXZ);
        this.bubbleMaterial.setTexture("noiseTexture", this.game.noiseTexture);

        for (let i = 0; i < this.particulesCount; i++) {
            let bubble = this.particles[i];
            if (!bubble) {
                bubble = new BABYLON.Mesh("bubble-" + i);
            }
            (await this.MakeNoisedBlob((0.6 + 0.4 * Math.random()) * this.particuleRadius)).applyToMesh(bubble);
            bubble.position.copyFrom(this.origin);
            bubble.material = this.bubbleMaterial;
            bubble.rotation.copyFromFloats(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            )
            bubble.isVisible = true;

            let targetPosition = Explosion.RandomInSphere().multiplyInPlace(new BABYLON.Vector3(this.radiusXZ, this.radiusY, this.radiusXZ));
            targetPosition.addInPlace(this.origin);
            targetPosition.addInPlace(this.maxOffset);            

            this.particles[i] = bubble;
            this.targetPositions[i] = targetPosition;
            this.delays[i] = 0.2 * Math.random() * this.lifespan;
        }

        this.game.scene.onBeforeRenderObservable.add(this.update);
    }

    private _timer: number = 0;
    public update = () => {
        if (!this.game.performanceWatcher.supportTexture3D) {
            return
        }
        this._timer += this.game.scene.deltaTime / 1000;
        
        let globalF = 1;
        let done = true;
        for (let i = 0; i < this.particles.length; i++) {
            let bubble = this.particles[i];
            let f = (this._timer - this.delays[i]) / this.lifespan;
            if (f < 1) {
                done = false;
            }
            globalF = Math.min(globalF, f);
            f = Nabu.MinMax(f, 0, 1);
            let fScale = 0;
            let fPos = 0;
            if (this.sizeEasing) {
                fScale = this.sizeEasing(f);
                fPos = this.sizeEasing(f);
            }
            else {
                fScale = Nabu.Easing.easeOutCubic(Nabu.Easing.easeOutCubic(f));
                fPos = Nabu.Easing.easeOutCubic(Nabu.Easing.easeOutCubic(f));
            }
            BABYLON.Vector3.LerpToRef(this.origin, this.targetPositions[i], fPos, bubble.position);
            bubble.rotate(BABYLON.Axis.Y, 0.01, BABYLON.Space.LOCAL);
            bubble.scaling.copyFromFloats(fScale, fScale, fScale);
        }
        
        this.bubbleMaterial.setFloat("time", 2 * globalF + this.tZero);

        if (done) {
            if (this.keepAlive) {
                for (let i = 0; i < this.particles.length; i++) {
                    this.particles[i].isVisible = false;
                }
                this.game.scene.onBeforeRenderObservable.removeCallback(this.update);
            }
            else {
                this.dispose();
            }
        }
    }
}