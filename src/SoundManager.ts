class MySound {

    private _loaded: boolean = false;
    private _sounds: BABYLON.Sound[] = [];

    constructor(
        public soundManager: SoundManager,
        private _name: string,
        private _urlOrArrayBuffer: any,
        private _scene?: BABYLON.Scene,
        private _readyToPlayCallback?: () => void,
        private _options?: BABYLON.ISoundOptions,
        public instancesCount: number = 1
    ) {
        this.instancesCount = 1;
    }

    public load(): void {
        if (this._loaded) {
            return;
        }
        this._sounds[0] = new BABYLON.Sound(
            this._name,
            this._urlOrArrayBuffer,
            this._scene,
            this._readyToPlayCallback,
            this._options
        );
        for (let i = 1; i < this.instancesCount; i++) {
            this._sounds[i] = this._sounds[0].clone();
        }
        this._loaded = true;
    }

    public play(time?: number, offset?: number, length?: number): void {
        if (this._loaded) {
            for (let i = 0; i < this.instancesCount; i++) {
                if (!this._sounds[i].isPlaying) {
                    this._sounds[i].play(time, offset, length);
                    return;
                }
            }
        }
    }

    public setVolume(newVolume: number, time?: number): void {
        if (this._loaded) {
            for (let i = 0; i < this.instancesCount; i++) {
                this._sounds[i].setVolume(newVolume, time);
            }
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
        options?: BABYLON.ISoundOptions,
        instancesCount: number = 1
    ): MySound {
        let mySound = new MySound(this, name, urlOrArrayBuffer, scene, readyToPlayCallback, options, instancesCount);
        if (BABYLON.Engine.audioEngine.unlocked) {
            mySound.load();
        }
        this.managedSounds.push(mySound);
        return mySound;
    }

    public unlockEngine(): void {
        BABYLON.Engine.audioEngine.unlock();
        for (let i = 0; i < this.managedSounds.length; i++) {
            this.managedSounds[i].load();
        }
    }
}