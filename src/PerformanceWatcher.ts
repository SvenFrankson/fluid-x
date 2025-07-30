class PerformanceWatcher {

    public supportTexture3D: boolean = false;
    public average: number = 24;
    public worst: number = 24;

    public isWorstTooLow: boolean = false;
    public devicePixelRationess: number = 5;
    public targetDevicePixelRationess: number = this.devicePixelRationess;
    public devicePixelRatioSteps: number = 10;
    public get devicePixelRatio(): number {
        let f = this.devicePixelRationess / this.devicePixelRatioSteps;
        return window.devicePixelRatio * f + 0.5 * (1 - f);
    }

    public resizeCD = 0;
    public setDevicePixelRationess(v: number): void {
        if (isFinite(v)) {
            v = Nabu.MinMax(v, 0, this.devicePixelRatioSteps);
            if (this.devicePixelRationess != v) {
                this.devicePixelRationess = v;
                let rect = this.game.canvas.getBoundingClientRect();
                requestAnimationFrame(() => {
                    let w = Math.floor(rect.width * this.devicePixelRatio).toFixed(0);
                    let h = Math.floor(rect.height * this.devicePixelRatio).toFixed(0);
                    this.game.canvas.setAttribute("width", w);
                    this.game.canvas.setAttribute("height", h);
                    console.log("update canvas resolution to " + w + " " + h);
                })
                this.resizeCD = 1;
            }
        }
    }

    constructor(public game: Game) {
        
    }

    public update(rawDt: number): void {
        let fps = 1 / rawDt;
        if (isFinite(fps)) {
            this.average = 0.95 * this.average + 0.05 * fps;

            let devicePixelRationess = Math.round((this.average - 24) / (60 - 24) * this.devicePixelRatioSteps);
            devicePixelRationess = Nabu.MinMax(devicePixelRationess, this.devicePixelRationess - 1, this.devicePixelRationess + 1);
            if (devicePixelRationess != this.targetDevicePixelRationess) {
                this.resizeCD = 1;
                this.targetDevicePixelRationess = devicePixelRationess;
            }

            this.resizeCD = Math.max(0, this.resizeCD - rawDt);
            if (this.resizeCD <= 0 && this.targetDevicePixelRationess != this.devicePixelRationess) {
                this.setDevicePixelRationess(this.targetDevicePixelRationess);
            }

            this.worst = Math.min(fps, this.worst);
            this.worst = 0.995 * this.worst + 0.005 * this.average;

            if (this.worst < 24) {
                this.isWorstTooLow = true;
            }
            else if (this.worst > 26) {
                this.isWorstTooLow = false;
            }
        }
    }

    public showDebug(): void {
        let s = 0.3;
        if (document.body.classList.contains("vertical")) {
            s = 0.2;
        }
        let quad = BABYLON.CreateGround("quad", { width: s, height: s * 1.5 });
        quad.parent = this.game.camera;
        let hFov = this.game.getCameraHorizontalFOV();
        let a = hFov / 2;
        quad.position.z = 3;
        quad.position.x = - Math.tan(a) * quad.position.z + s * 0.5;
        quad.position.y = 2 * s;
        quad.rotation.x = - 0.5 * Math.PI;

        let debugMaterial = new BABYLON.StandardMaterial("test-haiku-material");
        let dynamicTexture = new BABYLON.DynamicTexture("haiku-texture", { width: 150, height: 225 });
        dynamicTexture.hasAlpha = true;
        debugMaterial.diffuseTexture = dynamicTexture;
        debugMaterial.emissiveColor.copyFromFloats(1, 1, 1);
        debugMaterial.specularColor.copyFromFloats(0, 0, 0);
        debugMaterial.useAlphaFromDiffuseTexture = true;
        quad.material = debugMaterial;

        let update = () => {
            let context = dynamicTexture.getContext();
            context.clearRect(0, 0, 150, 225);
            context.fillStyle = "#00000080";
            context.fillRect(0, 0, 150, 225);
    
            context.fillStyle = "white";
            context.font = "35px monospace";
            let lineHeight = 40;
            context.fillText(this.average.toFixed(0) + " fa", 15, lineHeight);
            context.fillText(this.worst.toFixed(0) + " fm", 15, 2 * lineHeight);

            let meshesCount = this.game.scene.meshes.length;
            context.fillText(meshesCount.toFixed(0) + " me", 15, 3 * lineHeight);


            let materialsCount = this.game.scene.materials.length;
            context.fillText(materialsCount.toFixed(0) + " ma", 15, 4 * lineHeight);

            let trianglesCount = 0;
            this.game.scene.meshes.forEach(mesh => {
                let indices = mesh.getIndices();
                trianglesCount += indices.length / 3;
            })
            //context.fillText(Math.floor(trianglesCount / 1000).toFixed(0) + " kt", 15, 5 * lineHeight);
            context.fillText(this.devicePixelRatio.toFixed(4), 15, 5 * lineHeight);
    
            dynamicTexture.update();
        }

        setInterval(update, 100);
    }
}