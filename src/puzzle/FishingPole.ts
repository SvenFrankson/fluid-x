class FishingPole {

    public origin: BABYLON.Vector3 = new BABYLON.Vector3(0, 20, 5);
    public lineMesh: BABYLON.Mesh;

    public animateTip = Mummu.AnimationFactory.EmptyVector3Callback;
    public stop: boolean = false;

    constructor(public puzzle: Puzzle) {
        this.lineMesh = new BABYLON.Mesh("tentacle");
        this.lineMesh.material = this.puzzle.game.materials.trueWhiteMaterial;

        let magnet = CreateBoxFrameVertexData({
            w: 0.2,
            wBase: 0.25,
            d: 0.2,
            dBase: 0.25,
            h: 0.3,
            thickness: 0.03,
            innerHeight: 0.1,
            topCap: true,
            flatShading: true
        });
        Mummu.ColorizeVertexDataInPlace(magnet, this.puzzle.game.materials.blackMaterial.diffuseColor);
        
        let line = BABYLON.CreateCylinderVertexData({ diameter: 0.05, height: 100, tessellation: 12, cap: BABYLON.Mesh.NO_CAP });
        Mummu.ColorizeVertexDataInPlace(line, this.puzzle.game.materials.brownMaterial.diffuseColor.scale(1.5));
        Mummu.TranslateVertexDataInPlace(line, new BABYLON.Vector3(0, 50.2, 0));
        
        let data = Mummu.MergeVertexDatas(magnet, line);
        Mummu.TranslateVertexDataInPlace(data, new BABYLON.Vector3(0, 0.3, 0));
        data.applyToMesh(this.lineMesh);
        this.lineMesh.isVisible = false;

        this.animateTip = Mummu.AnimationFactory.CreateVector3(this.lineMesh, this.lineMesh, "position");
    }

    public async fish(from: BABYLON.Vector3, to: BABYLON.Vector3, onLowestPointCallback?: () => void, onJustBeforeFlybackCallback?: () => void): Promise<void> {
        this.origin.copyFrom(from).addInPlace(to).scaleInPlace(0.5);
        this.origin.y = 20;

        let tipZero = BABYLON.Vector3.Lerp(this.origin, from, 0.1);
        this.lineMesh.position.copyFrom(tipZero);
        this.lineMesh.isVisible = true;

        let fromTop = from.clone();
        fromTop.y = 0;

        let tipPath = [
            tipZero.clone(),
            fromTop.clone(),
            from.clone(),
            BABYLON.Vector3.Lerp(fromTop, to, 0.1).add(new BABYLON.Vector3(0, 3, 0)),
            to.clone()
        ];
        Mummu.CatmullRomPathInPlace(tipPath);
        Mummu.CatmullRomPathInPlace(tipPath);
        Mummu.CatmullRomPathInPlace(tipPath);
        Mummu.CatmullRomPathInPlace(tipPath);
        Mummu.CatmullRomPathInPlace(tipPath);

        this.stop = false;
        return new Promise<void>(resolve => {
            let duration = 4;
            let t0 = performance.now();
            let step = async () => {
                if (this.stop) {
                    this.lineMesh.isVisible = false;
                    return;
                }
                let f = (performance.now() - t0) / 1000 / duration;
                if (f < 1) {
                    if (f > 0.5 && onLowestPointCallback) {
                        onLowestPointCallback();
                        onLowestPointCallback = undefined;
                    }
                    f = Nabu.Easing.easeInOutSine(f);
                    Mummu.EvaluatePathToRef(f, tipPath, this.lineMesh.position);
                    requestAnimationFrame(step);
                }
                else {
                    if (onLowestPointCallback) {
                        onLowestPointCallback();
                        onLowestPointCallback = undefined;
                    }
                    if (onJustBeforeFlybackCallback) {
                        onJustBeforeFlybackCallback();
                        onJustBeforeFlybackCallback = undefined;
                    }
                    await this.animateTip(this.origin, 1, Nabu.Easing.easeInSine);
                    this.lineMesh.isVisible = false;
                    resolve();
                }
            }
            step();
        });
    }
}