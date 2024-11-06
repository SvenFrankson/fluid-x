class HaikuMaker {

    public static MakeHaiku(puzzle: Puzzle): void {
        if (puzzle.data.id === 74 && puzzle.data.state === 2) {
            let testHaiku = new Haiku(
                puzzle.game,
                "",
                "- Control -",
                IsTouchScreen ? "Hold ← or → to move" : "Hold A or D to move.",
                ""
            );
            testHaiku.position.copyFromFloats(1.1 * 3, 0.1, 1.1 * 1.5);
            testHaiku.visibility = 0;
            puzzle.haikus.push(testHaiku);
        }
        if (puzzle.data.id === 75 && puzzle.data.state === 2) {
            let testHaiku = new Haiku(
                puzzle.game,
                "",
                "- Control -",
                IsTouchScreen ? "Hold ← or → to move" : "Hold A or D to move.",
                ""
            );
            testHaiku.position.copyFromFloats(1.1 * 2, 0.1, 1.1 * 3);
            testHaiku.visibility = 0;
            puzzle.haikus.push(testHaiku);

            let testHaiku2 = new Haiku(
                puzzle.game,
                "",
                "- Objective -",
                "Hit all colored tiles.",
                ""
            );
            testHaiku2.position.copyFromFloats(1.1 * 7, 0.1, 1.1 * 1);
            testHaiku2.visibility = 0;
            puzzle.haikus.push(testHaiku2);
        }
        if (puzzle.data.id === 76 && puzzle.data.state === 2) {
            let testHaiku = new Haiku(
                puzzle.game,
                "",
                "- Color -",
                "Hit a drum to switch Color.",
                ""
            );
            testHaiku.position.copyFromFloats(1.1 * 3, 0.1, 1.1 * 3);
            testHaiku.visibility = 0;
            puzzle.haikus.push(testHaiku);
        }
        if (puzzle.data.id === 60 && puzzle.data.state === 2) {
            let testHaiku = new Haiku(
                puzzle.game,
                "",
                "- Caution -",
                "Holes are dangerous.",
                ""
            );
            testHaiku.position.copyFromFloats(1.1 * 3, 0.1, 1.1 * 2.5);
            testHaiku.visibility = 0;
            puzzle.haikus.push(testHaiku);
        }
        if (puzzle.data.id === 78 && puzzle.data.state === 2) {
            let testHaiku = new Haiku(
                puzzle.game,
                "",
                "                - Push -",
                "Wooden Tiles can be pushed.",
                ""
            );
            testHaiku.position.copyFromFloats(1.1 * 2.2, 0.1, 1.1 * 2.7);
            testHaiku.visibility = 0;
            puzzle.haikus.push(testHaiku);
        }
        if (puzzle.data.id === 62 && puzzle.data.state === 2) {
            let testHaiku = new Haiku(
                puzzle.game,
                "",
                "- Count -",
                "One Tile at a time.",
                ""
            );
            testHaiku.position.copyFromFloats(1.1 * 5, 0.1, 1.1 * 4.5);
            testHaiku.visibility = 0;
            puzzle.haikus.push(testHaiku);
        }
        if (puzzle.data.id === 68 && puzzle.data.state === 2) {
            let testHaiku = new Haiku(
                puzzle.game,
                "",
                "- Satisfaction -",
                "",
                ""
            );
            testHaiku.position.copyFromFloats(1.1 * 2.5, 0.1, 1.1 * 1.5);
            testHaiku.visibility = 0;
            puzzle.haikus.push(testHaiku);
        }
        if (puzzle.data.id === 80 && puzzle.data.state === 2) {
            let testHaiku = new Haiku(
                puzzle.game,
                "",
                "- Lives -",
                "Don't look down.",
                ""
            );
            testHaiku.position.copyFromFloats(1.1 * 4, 0.1, 1.1 * 3.5);
            testHaiku.visibility = 0;
            puzzle.haikus.push(testHaiku);
        }
        if (puzzle.data.id === 92 && puzzle.data.state === 2) {
            let testHaiku = new Haiku(
                puzzle.game,
                "",
                "- Water -",
                "Dip a toe !",
                ""
            );
            testHaiku.position.copyFromFloats(1.1 * 2, 0.1, 1.1 * 2.5);
            testHaiku.visibility = 0;
            puzzle.haikus.push(testHaiku);
        }

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
        context.font = "130px Shalimar";
        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                context.fillText(this.title, 100 + x, 150 + y);
                context.fillText(this.text1, 30 + x, 550 + y);
                context.fillText(this.text2, 30 + x, 700 + y);
                context.fillText(this.text3, 30 + x, 850 + y);
            }
        }

        this.dynamicTexture.update();

        this.animateVisibility = Mummu.AnimationFactory.CreateNumber(this, this, "visibility");
    }

    public update(dt: number): void {
        if (this.game.puzzle.balls[0].ballState === BallState.Move) {
            let dx = Math.abs(this.position.x - this.game.puzzle.balls[0].position.x);
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