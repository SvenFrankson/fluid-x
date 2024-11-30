class HaikuMaker {

    public static MakeHaiku(puzzle: Puzzle): void {
        if (puzzle.data.id === 74 && puzzle.data.state === 2) {
            let tile = puzzle.tiles.filter((tile) => {
                return tile instanceof BlockTile;
            })
            tile = tile.sort((t1, t2) => {
                return (t1.i + t1.j) - (t2.i + t2.j);
            })
            if (tile[0]) {
                let tileHaiku = new HaikuTile(
                    puzzle.game,
                    "Collect all Tiles",
                    tile[0]
                );
                puzzle.tileHaikus.push(tileHaiku);
            }
        }
        if (puzzle.data.id === 75 && puzzle.data.state === 2) {
            let buttonTile = puzzle.tiles.filter((tile) => {
                return tile instanceof ButtonTile;
            })
            if (buttonTile[0]) {
                let tileHaiku = new HaikuTile(
                    puzzle.game,
                    "Open / Close Doors",
                    buttonTile[0]
                );
                puzzle.tileHaikus.push(tileHaiku);
            }

            let doorTiles = puzzle.tiles.filter((tile) => {
                return tile instanceof DoorTile;
            })
            doorTiles = doorTiles.sort((t1, t2) => {
                return (t1.i + t1.j) - (t2.i + t2.j);
            })
            if (doorTiles[0]) {
                let tileHaiku = new HaikuTile(
                    puzzle.game,
                    "Door",
                    doorTiles[0],
                    -1
                );
                puzzle.tileHaikus.push(tileHaiku);
            }
        }
        if (puzzle.data.id === 76 && puzzle.data.state === 2) {
            let switchTiles = puzzle.tiles.filter((tile) => {
                return tile instanceof SwitchTile;
            })
            if (switchTiles[0]) {
                let tileHaiku = new HaikuTile(
                    puzzle.game,
                    "",
                    switchTiles[0]
                );
                puzzle.tileHaikus.push(tileHaiku);
            }
            if (switchTiles[1]) {
                let tileHaiku = new HaikuTile(
                    puzzle.game,
                    "",
                    switchTiles[1]
                );
                puzzle.tileHaikus.push(tileHaiku);
            }
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

    public dispose(): void {
        this.material.dispose(true, true);
        super.dispose(false, true);
    }

    public setText(text: string): void {
        if (IsTouchScreen) {
            text = text.replaceAll("[A]", " <- ");
            text = text.replaceAll("[D]", " -> ");
        }
        this.text = text;
        let lines = text.split("\n");
        let context = this.dynamicTexture.getContext();
        context.clearRect(0, 0, 1000, 1000);

        context.fillStyle = "#473a2fFF";
        context.fillStyle = "#e3cfb4ff";
        context.font = "90px Julee";
        for (let l = 0; l < lines.length; l++) {
            context.fillText(lines[l], 30, 120 * (l + 1));
        }

        this.dynamicTexture.update();
    }

    public update(dt: number): void {
        if (this.game.puzzle.balls[0].ballState === BallState.Move) {
            let dx = Math.abs(this.position.x - this.game.puzzle.balls[0].position.x);
            if (!this.inRange) {
                if (dx < 10) {
                    this.inRange = true;
                    this.animateVisibility(1, 2, Nabu.Easing.easeInOutSine);
                }
                return;
            }
            else if (this.inRange) {
                if (dx > 10.5) {
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

class HaikuTile extends BABYLON.Mesh {

    public dynamicTexture: BABYLON.DynamicTexture;
    public animateVisibility = Mummu.AnimationFactory.EmptyNumberCallback;
    public shown: boolean = false;

    constructor(
        public game: Game,
        public text: string,
        public tile: Tile,
        public align: number = 0
    ) {
        super("haiku");
        BABYLON.CreateGroundVertexData({ width: 5, height: 5 }).applyToMesh(this);

        this.position.copyFrom(this.tile.position);
        this.position.y += 0.01;

        let haikuMaterial = new BABYLON.StandardMaterial("test-haiku-material");
        this.dynamicTexture = new BABYLON.DynamicTexture("haiku-texture", { width: 1000, height: 1000 });
        this.dynamicTexture.hasAlpha = true;
        haikuMaterial.diffuseTexture = this.dynamicTexture;
        haikuMaterial.specularColor.copyFromFloats(0, 0, 0);
        haikuMaterial.useAlphaFromDiffuseTexture = true;
        this.material = haikuMaterial;

        let context = this.dynamicTexture.getContext();
        context.clearRect(0, 0, 1000, 1000);

        context.strokeStyle = "#e3cfb4ff";
        context.lineWidth = 8;
        for (let i = 0; i < 4; i++) {
            let a1 = i * Math.PI * 0.5 + Math.PI * 0.1 - Math.PI * 0.25;
            let a2 = (i + 1) * Math.PI * 0.5 - Math.PI * 0.1 - Math.PI * 0.25;
            context.beginPath();
            context.arc(500, 500, 140, a1, a2);
            context.stroke();
        }

        context.fillStyle = "#e3cfb4ff";
        context.font = "90px Julee";
        if (align === - 1) {
            let l = context.measureText(this.text).width;
            context.fillText(this.text, 500 - 180 - l, 530);
        }
        else {
            let l = context.measureText(this.text).width;
            context.fillText(this.text, Math.floor(500 - l * 0.5), 740);
        }

        this.dynamicTexture.update();

        this.visibility = 0;
        this.animateVisibility = Mummu.AnimationFactory.CreateNumber(this, this, "visibility");
    }

    public show(): void {
        this.shown = true;
        this.animateVisibility(1, 2, Nabu.Easing.easeInOutSine);
    }

    public hide(): void {
        this.shown = false;
        this.animateVisibility(0, 2, Nabu.Easing.easeInOutSine);
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