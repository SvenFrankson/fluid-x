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
            puzzle.haiku = testHaiku;
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
            puzzle.haiku = testHaiku;

            let testHaiku2 = new Haiku(
                puzzle.game,
                "",
                "- Objective -",
                "Hit all colored tiles.",
                ""
            );
            testHaiku2.position.copyFromFloats(1.1 * 7, 0.1, 1.1 * 1);
            testHaiku2.visibility = 0;
            puzzle.haiku = testHaiku2;
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
            puzzle.haiku = testHaiku;
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
            puzzle.haiku = testHaiku;
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
            puzzle.haiku = testHaiku;
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
            puzzle.haiku = testHaiku;
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
            puzzle.haiku = testHaiku;
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
            puzzle.haiku = testHaiku;
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
            puzzle.haiku = testHaiku;
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
            puzzle.haiku = testHaiku;
    
            let testHaiku2 = new Haiku(
                puzzle.game,
                "- Bounce -",
                "Up -north- and down -south-",
                "Some cycle one can't decide.",
                "A Vertical tide."
            );
            testHaiku2.position.copyFromFloats(1.1 * 8, 0.1, 1.1 * 2.5);
            testHaiku2.visibility = 0;
            puzzle.haiku = testHaiku2;
    
            let testHaiku3 = new Haiku(
                puzzle.game,
                "- Complete -",
                "Find all colored tile",
                "Scattered around the area.",
                "Time is no limit."
            );
            testHaiku3.position.copyFromFloats(1.1 * 14, 0.1, 1.1 * 2.5);
            testHaiku3.visibility = 0;
            puzzle.haiku = testHaiku3;
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
            puzzle.haiku = testHaiku;
        }
    }
}

class Haiku extends BABYLON.Mesh {

    public dynamicTexture: BABYLON.DynamicTexture;
    public animateVisibility = Mummu.AnimationFactory.EmptyNumberCallback;
    public inRange: boolean = false;
    public text: string;

    constructor(
        public game: Game,
        text: string,
        title?: string,
        text2?: string,
        text3?: string
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

        this.setText(text);

        this.animateVisibility = Mummu.AnimationFactory.CreateNumber(this, this, "visibility");
    }

    public setText(text: string): void {
        this.text = text;
        let lines = text.split("\n");
        let context = this.dynamicTexture.getContext();
        context.clearRect(0, 0, 1000, 1000);

        context.fillStyle = "#473a2fFF";
        context.fillStyle = "#e3cfb4ff";
        context.font = "130px Shalimar";
        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                for (let l = 0; l < lines.length; l++) {
                    context.fillText(lines[l], 30 + x, 150 * (l + 1) + y);
                }
            }
        }

        this.dynamicTexture.update();
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

class HaikuPlayerStart extends BABYLON.Mesh {

    public dynamicTexture: BABYLON.DynamicTexture;
    public animateVisibility = Mummu.AnimationFactory.EmptyNumberCallback;
    public inRange: boolean = false;

    constructor(
        public game: Game,
        public playerName: string,
        public ball: Ball
    ) {
        super("haiku");
        BABYLON.CreateGroundVertexData({ width: 5, height: 5 }).applyToMesh(this);

        this.position.copyFrom(this.ball.position);
        this.position.y += 0.01;

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

        context.strokeStyle = "#473a2fFF";
        context.fillStyle = "#e3cfb4ff";
        context.lineWidth = 6;
        for (let i = 0; i < 4; i++) {
            let a1 = i * Math.PI * 0.5 + Math.PI * 0.1;
            let a2 = (i + 1) * Math.PI * 0.5 - Math.PI * 0.1;
            context.beginPath();
            context.arc(500, 500, 80, a1, a2);
            context.stroke();
        }

        context.fillStyle = "#473a2fFF";
        context.fillStyle = "#231d17FF";
        context.font = "130px Shalimar";
        let l = context.measureText(this.playerName).width;
        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                context.fillText(this.playerName, Math.floor(500 - l * 0.5) + x, 700 + y);
            }
        }

        this.dynamicTexture.update();

        this.animateVisibility = Mummu.AnimationFactory.CreateNumber(this, this, "visibility");
    }

    public show(): void {
        this.animateVisibility(1, 1, Nabu.Easing.easeInOutSine);
    }

    public hide(): void {
        this.animateVisibility(0, 1, Nabu.Easing.easeInOutSine);
    }
}

class HaikuDebug extends BABYLON.Mesh {

    public dynamicTexture: BABYLON.DynamicTexture;

    constructor(
        public game: Game,
        public text: string
    ) {
        super("haiku");
        BABYLON.CreateGroundVertexData({ width: 1, height: 0.5 }).applyToMesh(this);

        let haikuMaterial = new BABYLON.StandardMaterial("test-haiku-material");
        this.dynamicTexture = new BABYLON.DynamicTexture("haiku-texture", { width: 200, height: 100 });
        this.dynamicTexture.hasAlpha = true;
        haikuMaterial.diffuseTexture = this.dynamicTexture;
        haikuMaterial.specularColor.copyFromFloats(0, 0, 0);
        haikuMaterial.useAlphaFromDiffuseTexture = true;
        this.material = haikuMaterial;

        let context = this.dynamicTexture.getContext();
        context.fillStyle = "#00000000";
        context.fillRect(0, 0, 200, 100);

        context.fillStyle = "#231d17FF";
        context.font = "100px Shalimar";
        let l = context.measureText(this.text).width;
        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                context.fillText(this.text, Math.floor(100 - l * 0.5) + x, 80 + y);
            }
        }

        this.dynamicTexture.update();
    }
}