class HaikuMaker {
    
    public static GetTranslatedHaikuText(puzzle: Puzzle, locale?: string): string {
        if (!locale) {
            locale = LOCALE;
        }
        if (puzzle.data.id === 74) {
            return GetTranslatedTitle(puzzle.data) + "\n\n" + I18Nizer.GetText("lesson-1-haiku", locale);
        }
        if (puzzle.data.id === 197) {
            return I18Nizer.GetText("lesson-2-haiku", locale).replaceAll("\n", " ");
        }
        if (puzzle.data.id === 158) {
            return GetTranslatedTitle(puzzle.data) + "\n\n" + I18Nizer.GetText("lesson-3-haiku", locale);
        }
        if (puzzle.data.id === 159) {
            return GetTranslatedTitle(puzzle.data) + "\n\n" + I18Nizer.GetText("lesson-4-haiku", locale);
        }
        if (puzzle.data.id === 161) {
            return GetTranslatedTitle(puzzle.data) + "\n\n" + I18Nizer.GetText("lesson-5-haiku", locale);
        }
        if (puzzle.data.id === 164) {
            return GetTranslatedTitle(puzzle.data) + "\n\n" + I18Nizer.GetText("lesson-6-haiku", locale);
        }
        if (puzzle.data.id === 162) {
            return GetTranslatedTitle(puzzle.data) + "\n\n" + I18Nizer.GetText("lesson-7-haiku", locale);
        }
        if (puzzle.data.id === 165) {
            return GetTranslatedTitle(puzzle.data) + "\n\n" + I18Nizer.GetText("lesson-8-haiku", locale);
        }
        if (puzzle.data.id === 166) {
            return GetTranslatedTitle(puzzle.data) + "\n\n" + I18Nizer.GetText("lesson-9-haiku", locale);
        }
        if (puzzle.data.id === 174) {
            return I18Nizer.GetText("challenge-bridge-haiku", locale);
        }
        if (puzzle.data.id === 175) {
            return I18Nizer.GetText("challenge-gates-haiku", locale);
        }
        return undefined;
    }

    public static MakeHaiku(puzzle: Puzzle): void {
        return;
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
                    "",
                    tile[0]
                );
                puzzle.tileHaikus.push(tileHaiku);
            }
            for (let i = 1; i < tile.length; i++) {
                if (tile[i]) {
                    let tileHaiku = new HaikuTile(
                        puzzle.game,
                        "",
                        tile[i]
                    );
                    puzzle.tileHaikus.push(tileHaiku);
                }
            }
        }
        if (puzzle.data.id === 161 && puzzle.data.state === 2) {
            let buttonTile = puzzle.tiles.filter((tile) => {
                return tile instanceof ButtonTile;
            })
            if (buttonTile[0]) {
                let tileHaiku = new HaikuTile(
                    puzzle.game,
                    "",
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
                    "",
                    doorTiles[0],
                    1
                );
                puzzle.tileHaikus.push(tileHaiku);
            }
        }
        if (puzzle.data.id === 197 && puzzle.data.state === 2) {
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
        if (puzzle.data.id === 151 && puzzle.data.state === 8) {
            let switchTile = puzzle.tiles.filter((tile) => {
                return tile instanceof SwitchTile && tile.color === 3;
            })
            if (switchTile[0]) {
                let tileHaiku = new HaikuTile(
                    puzzle.game,
                    "",
                    switchTile[0]
                );
                puzzle.tileHaikus.push(tileHaiku);
            }
        }
    }

    public static HaikuTileUpdateStep(puzzle: Puzzle): void {
        let targetTile: Tile;
        if (puzzle.puzzleState === PuzzleState.Playing) {
            let ball = puzzle.balls[0];
            let currentColor = puzzle.balls[0].color;

            let blockTilesByColor: BlockTile[][] = [];
            for (let c = 0; c < 4; c++) {
                let matchingTiles = puzzle.tiles.filter(t => {
                    return (t instanceof BlockTile) && t.color === c;
                }) as BlockTile[];
                matchingTiles.sort((t1, t2) => {
                    let d1 = BABYLON.Vector3.DistanceSquared(t1.position, ball.position);
                    let d2 = BABYLON.Vector3.DistanceSquared(t2.position, ball.position);
                    return d1 - d2;
                });

                blockTilesByColor[c] = matchingTiles;
            }

            // Case "Need to open a door"
            if (!targetTile) {
                let buttonValue = -1;
                for (let v = 0; v < 3 && buttonValue === -1; v++) {
                    let doors = puzzle.tiles.filter(t => {
                        return (t instanceof DoorTile) && t.value === v;
                    }) as DoorTile[];
                    if (doors.length > 0) {
                        if (doors.map(d => { return d.closed }).reduce((d1, d2) => { return d1 && d2 })) {
                            buttonValue = v;
                        }
                    }
                }

                if (buttonValue >= 0) {
                    let buttonTiles = puzzle.tiles.filter(t => {
                        return (t instanceof ButtonTile) && t.value === buttonValue;
                    }) as ButtonTile[];
                    buttonTiles.sort((t1, t2) => {
                        let d1 = BABYLON.Vector3.DistanceSquared(t1.position, ball.position);
                        let d2 = BABYLON.Vector3.DistanceSquared(t2.position, ball.position);
                        return d1 - d2;
                    });
                    if (buttonTiles[0]) {
                        targetTile = buttonTiles[0];
                    }
                }
            }
            
            // Case "Highlight Tile of current Color"
            if (!targetTile) {
                if (blockTilesByColor[currentColor][0]) {
                    targetTile = blockTilesByColor[currentColor][0];
                }
            }
            
            // Case "Need to switch"
            if (!targetTile) {
                for (let c = 0; c < 4; c++) {
                    if (c != currentColor) {
                        if (blockTilesByColor[c].length > 0) {
                            let switchTiles = puzzle.tiles.filter(t => {
                                return (t instanceof SwitchTile) && t.color === c;
                            });
                            switchTiles.sort((t1, t2) => {
                                let d1 = BABYLON.Vector3.DistanceSquared(t1.position, ball.position);
                                let d2 = BABYLON.Vector3.DistanceSquared(t2.position, ball.position);
                                return d1 - d2;
                            });
                            if (switchTiles[0]) {
                                targetTile = switchTiles[0];
                            }
                        }
                    }
                }
            }
        }

        if (targetTile) {
            if (!puzzle.tileHaikus[0] || puzzle.tileHaikus[0].tile != targetTile) {
                if (puzzle.tileHaikus[0]) {
                    let existingTile = puzzle.tileHaikus[0];
                    setTimeout(() => {
                        existingTile.hide(0.5).then(() => { existingTile.dispose(); });
                    }, 500);
                }
                let haikuTile = new HaikuTile(puzzle.game, "", targetTile);
                haikuTile.show(0.5);
                puzzle.tileHaikus[0] = haikuTile;
            }
        }
        else {
            if (puzzle.tileHaikus[0]) {
                let existingTile = puzzle.tileHaikus[0];
                setTimeout(() => {
                    existingTile.hide(0.5).then(() => { existingTile.dispose(); });
                }, 500);
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
        public w: number = 1000,
        public h: number = 1000,
    ) {
        super("haiku");
        BABYLON.CreateGroundVertexData({ width: 5 * this.w / 1000, height: 5 * this.h / 1000 }).applyToMesh(this);

        let haikuMaterial = new BABYLON.StandardMaterial("test-haiku-material");
        this.dynamicTexture = new BABYLON.DynamicTexture("haiku-texture", { width: this.w, height: this.h });
        this.dynamicTexture.hasAlpha = true;
        haikuMaterial.diffuseTexture = this.dynamicTexture;
        haikuMaterial.specularColor.copyFromFloats(0, 0, 0);
        haikuMaterial.useAlphaFromDiffuseTexture = true;
        this.material = haikuMaterial;

        this.setText(text);

        this.animateVisibility = Mummu.AnimationFactory.CreateNumber(this, this, "visibility");
        this.visibility = 0;
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
        context.clearRect(0, 0, this.w, this.h);
        //context.fillStyle = "#00000020";
        //context.fillRect(0, 0, this.w, this.h);

        context.fillStyle = "#473a2fFF";
        context.fillStyle = this.game.puzzle.haikuColor;
        context.font = "90px Julee";
        let lineHeight = 120;
        if (LOCALE === "de") {
            context.font = "70px Julee";
            lineHeight = 90;
        }
        for (let l = 0; l < lines.length; l++) {
            let textLength = context.measureText(lines[l]).width;
            context.fillText(lines[l], this.w * 0.5 - textLength * 0.5, 120 + lineHeight * l);
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
        context.clearRect(0, 0, 1000, 1000);

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
        context.font = "130px Julee";
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
        context.lineWidth = 12;
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
        else if (align === 1) {
            let l = context.measureText(this.text).width;
            context.fillText(this.text, 500 + 180, 530);
        }
        else {
            let l = context.measureText(this.text).width;
            context.fillText(this.text, Math.floor(500 - l * 0.5), 740);
        }

        this.dynamicTexture.update();

        this.visibility = 0;
        this.animateVisibility = Mummu.AnimationFactory.CreateNumber(this, this, "visibility");
    }

    public async show(duration: number = 2): Promise<void> {
        this.shown = true;
        return this.animateVisibility(1, duration, Nabu.Easing.easeInOutSine);
    }

    public async hide(duration: number = 1): Promise<void> {
        this.shown = false;
        return this.animateVisibility(0, duration, Nabu.Easing.easeInOutSine);
    }

    private _timer: number = 0;
    public update(dt: number): void {
        this._timer += dt;
        let s = 1 + Math.sin(2 * this._timer) * 0.1;
        this.scaling.copyFromFloats(s, s, s);
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
        context.font = "100px Julee";
        let l = context.measureText(this.text).width;
        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                context.fillText(this.text, Math.floor(100 - l * 0.5) + x, 80 + y);
            }
        }

        this.dynamicTexture.update();
    }
}