class MySound {

    private _loaded: boolean = false;
    public sound: BABYLON.Sound;

    constructor(
        private _name: string,
        private _urlOrArrayBuffer: any,
        private _scene?: BABYLON.Scene,
        private _readyToPlayCallback?: () => void,
        private _options?: BABYLON.ISoundOptions
    ) {

    }

    public load(): void {
        if (this._loaded) {
            return;
        }
        this.sound = new BABYLON.Sound(
            this._name,
            this._urlOrArrayBuffer,
            this._scene,
            this._readyToPlayCallback,
            this._options
        );
        this._loaded = true;
    }

    public play(time?: number, offset?: number, length?: number): void {
        if (this._loaded) {
            this.sound.play(time, offset, length);
        }
    }

    public setVolume(newVolume: number, time?: number): void {
        if (this._loaded) {
            this.sound.setVolume(newVolume, time);
        }
    }
}

class SoundManager {

    
    public managedSounds: MySound[] = [];

    public createSound(        
        name: string,
        urlOrArrayBuffer: any,
        scene?: BABYLON.Scene,
        readyToPlayCallback?: () => void,
        options?: BABYLON.ISoundOptions
    ): MySound {
        let mySound = new MySound(name, urlOrArrayBuffer, scene, readyToPlayCallback, options);
        if (BABYLON.Engine.audioEngine.unlocked) {
            mySound.load();
        }
        return mySound;
    }

    public unlockEngine(): void {
        if (BABYLON.Engine.audioEngine.unlocked) {
            console.log("unlock audioEngine");
            BABYLON.Engine.audioEngine.unlock();
        }
        for (let i = 0; i < this.managedSounds.length; i++) {
            this.managedSounds[i].load();
        }
    }
}