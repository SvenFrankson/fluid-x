function SineFlashVisibility(target: BABYLON.Mesh, duration: number, min: number = 0, max: number = 1): Promise<void> {
    return new Promise<void>(resolve => {
        let t0 = performance.now();
        let step = () => {
            let f = (performance.now() - t0) / 1000 / duration;
            if (f < 1) {
                target.visibility = min + Math.sin(f * Math.PI) * max;
                requestAnimationFrame(step);
            }
            else {
                target.visibility = min;
                resolve();
            }
        }
        step();
    });
}