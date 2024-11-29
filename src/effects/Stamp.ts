class StampEffect {

    public sound: MySound;
    
    public getScene(): BABYLON.Scene {
        return this.game.scene;
    }

    constructor(public game: Game) {
        this.sound = game.soundManager.createSound("stamp-sound", "./datas/sounds/stamp.mp3");
    } 

    public async play(div: HTMLDivElement): Promise<void> {
        //await RandomWait();
        div.style.visibility = "hidden";
        await Mummu.AnimationFactory.CreateWait(this)(0.2);
        this.sound.play();
        div.style.transform = "scale(0.1)"
        div.style.transition = "all 0.2s";
        div.style.visibility = "";
        div.style.transform = "scale(1.3)"
        await Mummu.AnimationFactory.CreateWait(this)(0.2);
        div.style.transform = "scale(1)"
        await Mummu.AnimationFactory.CreateWait(this)(0.2);
        div.style.transition = "";
    }
}