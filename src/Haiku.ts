class HaikuMaker {

    public static MakeHaiku(puzzle: Puzzle): void {
        if (puzzle.data.id === 58 && puzzle.data.state === 2) {
            // First Level Haikus

            let testHaiku = new Haiku(
                puzzle.game,
                "- Control -",
                "Left -west- to right -east-",
                "One may decide where he goes.",
                "Unless walls oppose."
            );
            testHaiku.position.copyFromFloats(1.1 * 2, 0.1, 1.1 * 2.5);
            testHaiku.visibility = 0;
            puzzle.haikus.push(testHaiku);
    
            let testHaiku2 = new Haiku(
                puzzle.game,
                "- Bounce -",
                "Up -north- and down -south-",
                "Some cycle one can't decide.",
                "A Vertical tide."
            );
            testHaiku2.position.copyFromFloats(1.1 * 8, 0.1, 1.1 * 2.5);
            testHaiku2.visibility = 0;
            puzzle.haikus.push(testHaiku2);
    
            let testHaiku3 = new Haiku(
                puzzle.game,
                "- Complete -",
                "Find all colored tile",
                "Scattered around the area.",
                "Time is no limit."
            );
            testHaiku3.position.copyFromFloats(1.1 * 14, 0.1, 1.1 * 2.5);
            testHaiku3.visibility = 0;
            puzzle.haikus.push(testHaiku3);
        }
        if (puzzle.data.id === 59 && puzzle.data.state === 2) {
            // First Level Haikus

            let testHaiku = new Haiku(
                puzzle.game,
                "- Color -",
                "Four colors for tiles",
                "Use the right one to collide.",
                "Or else be bounced back."
            );
            testHaiku.position.copyFromFloats(1.1 * 2, 0.1, 1.1 * 2.5);
            testHaiku.visibility = 0;
            puzzle.haikus.push(testHaiku);
        }
    }
}

class Haiku extends BABYLON.Mesh {

    public dynamicTexture: BABYLON.DynamicTexture;
    public animateVisibility = Mummu.AnimationFactory.EmptyNumberCallback;
    public inRange: boolean = false;

    constructor(
        public game: Game,
        public title: string,
        public text1: string,
        public text2: string,
        public text3: string
    ) {
        super("haiku");
        BABYLON.CreateGroundVertexData({ width: 5, height: 5 }).applyToMesh(this);

        let haikuMaterial = new BABYLON.StandardMaterial("test-haiku-material");
        this.dynamicTexture = new BABYLON.DynamicTexture("haiku-texture", { width: 1000, height: 1000 });
        this.dynamicTexture.hasAlpha = true;
        haikuMaterial.diffuseTexture = this.dynamicTexture;
        haikuMaterial.specularColor.copyFromFloats(0, 0, 0);
        haikuMaterial.useAlphaFromDiffuseTexture = true;
        this.material = haikuMaterial;

        let context = this.dynamicTexture.getContext();
        context.fillStyle = "#00000000";
        context.fillRect(0, 0, 1000, 1000);

        context.fillStyle = "#473a2fFF";
        context.font = "900 130px Shalimar";
        context.fillText(this.title, 100, 150);
        context.fillText(this.text1, 30, 550);
        context.fillText(this.text2, 30, 700);
        context.fillText(this.text3, 30, 850);

        this.dynamicTexture.update();

        this.animateVisibility = Mummu.AnimationFactory.CreateNumber(this, this, "visibility");
    }

    public update(dt: number): void {
        if (this.game.ball.ballState === BallState.Move) {
            let dx = Math.abs(this.position.x - this.game.ball.position.x);
            if (!this.inRange) {
                if (dx < 3) {
                    this.inRange = true;
                    this.animateVisibility(1, 2, Nabu.Easing.easeInOutSine);
                }
                return;
            }
            else if (this.inRange) {
                if (dx > 3.5) {
                    this.inRange = false;
                    this.animateVisibility(0, 2, Nabu.Easing.easeInOutSine);
                }
                return;
            }
        }

        if (this.inRange) {
            this.inRange = false;
            this.animateVisibility(0, 2, Nabu.Easing.easeInOutSine);
        }
    }
}