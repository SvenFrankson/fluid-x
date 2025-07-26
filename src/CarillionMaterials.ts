class CarillionMaterials {

    public tileColorMaterials: BABYLON.StandardMaterial[];
    public collectedTileMaterial: BABYLON.StandardMaterial;
    public tileColorShinyMaterials: BABYLON.StandardMaterial[];
    public tileNumberMaterials: BABYLON.StandardMaterial[];
    public colorMaterials: BABYLON.StandardMaterial[];
    public trueWhiteMaterial: BABYLON.StandardMaterial;
    public fullAutolitWhiteMaterial: BABYLON.StandardMaterial;
    public whiteMaterial: BABYLON.StandardMaterial;
    public grayMaterial: BABYLON.StandardMaterial;
    public blackMaterial: BABYLON.StandardMaterial;
    public brownMaterial: BABYLON.StandardMaterial;
    public salmonMaterial: BABYLON.StandardMaterial;
    public blueMaterial: BABYLON.StandardMaterial;
    public redMaterial: BABYLON.StandardMaterial;
    public yellowMaterial: BABYLON.StandardMaterial;
    public greenMaterial: BABYLON.StandardMaterial;

    public waterMaterial: BABYLON.StandardMaterial;
    public boostMaterial: BABYLON.StandardMaterial;
    public floorMaterials: BABYLON.StandardMaterial[];
    public floorMaterial: BABYLON.StandardMaterial;
    public floorMaterial2: BABYLON.StandardMaterial;
    public floorGrass: BABYLON.StandardMaterial;
    public floorStoneRect: BABYLON.StandardMaterial;
    public floorLogs: BABYLON.StandardMaterial;
    public floorMossLogs: BABYLON.StandardMaterial;
    public woodFloorMaterial: BABYLON.StandardMaterial;
    public roofMaterial: BABYLON.StandardMaterial;
    public woodMaterial: BABYLON.StandardMaterial;
    public wallMaterial: BABYLON.StandardMaterial;
    public brickWallMaterial: BABYLON.StandardMaterial;
    public holeMaterial: BABYLON.StandardMaterial;
    public shadow9Material: BABYLON.StandardMaterial;
    public whiteShadow9Material: BABYLON.StandardMaterial;
    public shadowDiscMaterial: BABYLON.StandardMaterial;
    public lightDiscMaterial: BABYLON.StandardMaterial;
    public puckSideMaterial: BABYLON.StandardMaterial;
    public creepSlashMaterial: BABYLON.StandardMaterial;
    public tileStarTailMaterial: BABYLON.StandardMaterial;
    public pushTileTopMaterial: BABYLON.StandardMaterial;
    public get borderMaterial() {
        return this.brownMaterial;
    }

    constructor(public game: Game) {
        let northMaterial = new BABYLON.StandardMaterial("north-material");
        northMaterial.specularColor.copyFromFloats(0, 0, 0);
        northMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/red-north-wind.png");
        northMaterial.freeze();
            
        let eastMaterial = new BABYLON.StandardMaterial("east-material");
        eastMaterial.specularColor.copyFromFloats(0, 0, 0);
        eastMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/yellow-east-wind.png");
        eastMaterial.freeze();

        let southMaterial = new BABYLON.StandardMaterial("south-material");
        southMaterial.specularColor.copyFromFloats(0, 0, 0);
        southMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/blue-south-wind.png");
        southMaterial.freeze();
            
        let westMaterial = new BABYLON.StandardMaterial("west-material");
        westMaterial.specularColor.copyFromFloats(0, 0, 0);
        westMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/green-west-wind.png");
        westMaterial.freeze();
            
        this.waterMaterial = new BABYLON.StandardMaterial("floor-material");
        this.waterMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.waterMaterial.diffuseColor.copyFromFloats(1, 1, 1);
        this.waterMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/water.png");
        
        this.boostMaterial = new BABYLON.StandardMaterial("boost-material");
        this.boostMaterial.diffuseColor = BABYLON.Color3.FromHexString("#624c3c");
        this.boostMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.boostMaterial.freeze();
            
        this.floorMaterial = new BABYLON.StandardMaterial("floor-material");
        this.floorMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.floorMaterial.diffuseColor.copyFromFloats(1, 1, 1);
        this.floorMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/floor_2.png");
        this.floorMaterial.freeze();
            
        this.floorMaterial2 = new BABYLON.StandardMaterial("floor-material");
        this.floorMaterial2.specularColor.copyFromFloats(0, 0, 0);
        this.floorMaterial2.diffuseColor.copyFromFloats(1, 1, 1);
        this.floorMaterial2.diffuseTexture = new BABYLON.Texture("./datas/textures/floor_3.png");
        this.floorMaterial2.freeze();
            
        this.floorGrass = new BABYLON.StandardMaterial("floor-material");
        this.floorGrass.specularColor.copyFromFloats(0, 0, 0);
        this.floorGrass.diffuseColor.copyFromFloats(1, 1, 1);
        this.floorGrass.diffuseTexture = new BABYLON.Texture("./datas/textures/ground_008.png");
        this.floorGrass.freeze();
            
        this.floorStoneRect = new BABYLON.StandardMaterial("floor-material");
        this.floorStoneRect.specularColor.copyFromFloats(0, 0, 0);
        this.floorStoneRect.diffuseColor.copyFromFloats(1, 1, 1);
        this.floorStoneRect.diffuseTexture = new BABYLON.Texture("./datas/textures/Stone_02.png");
        this.floorStoneRect.freeze();
            
        this.floorLogs = new BABYLON.StandardMaterial("floor-material");
        this.floorLogs.specularColor.copyFromFloats(0, 0, 0);
        this.floorLogs.diffuseColor.copyFromFloats(1, 1, 1);
        this.floorLogs.diffuseTexture = new BABYLON.Texture("./datas/textures/logs.png");
        this.floorLogs.freeze();
            
        this.floorMossLogs = new BABYLON.StandardMaterial("floor-material");
        this.floorMossLogs.specularColor.copyFromFloats(0, 0, 0);
        this.floorMossLogs.diffuseColor.copyFromFloats(1, 1, 1);
        this.floorMossLogs.diffuseTexture = new BABYLON.Texture("./datas/textures/logs_mossy.png");
        this.floorMossLogs.freeze();
            
        this.woodFloorMaterial = new BABYLON.StandardMaterial("dark-floor-material");
        this.woodFloorMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.woodFloorMaterial.diffuseColor.copyFromFloats(1, 1, 1);
        this.woodFloorMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/wood-plank.png");
        this.woodFloorMaterial.freeze();
            
        this.roofMaterial = new BABYLON.StandardMaterial("roof-material");
        this.roofMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.roofMaterial.diffuseColor = BABYLON.Color3.FromHexString("#243d5c");
        this.roofMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/wall.png");
        (this.roofMaterial.diffuseTexture as BABYLON.Texture).uScale = 5;
        (this.roofMaterial.diffuseTexture as BABYLON.Texture).vScale = 5;
        this.roofMaterial.freeze();
            
        this.woodMaterial = new BABYLON.StandardMaterial("wood-material");
        this.woodMaterial.diffuseColor = BABYLON.Color3.FromHexString("#624c3c");
        this.woodMaterial.specularColor.copyFromFloats(0, 0, 0);
        //this.woodMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/roof.png");
        //(this.woodMaterial.diffuseTexture as BABYLON.Texture).uScale = 10;
        //(this.woodMaterial.diffuseTexture as BABYLON.Texture).vScale = 10;
        this.roofMaterial.freeze();
            
        this.wallMaterial = new BABYLON.StandardMaterial("wall-material");
        this.wallMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.wallMaterial.diffuseColor = BABYLON.Color3.FromHexString("#e3cfb4");
        this.wallMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/wall.png");
        this.wallMaterial.freeze();
            
        this.brickWallMaterial = new BABYLON.StandardMaterial("wall-material");
        this.brickWallMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.brickWallMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/Stone_05.png");
        this.brickWallMaterial.freeze();
            
        this.holeMaterial = new BABYLON.StandardMaterial("roof-material");
        this.holeMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.holeMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/Stone_01.png");
        this.holeMaterial.freeze();
            
        this.shadow9Material = new BABYLON.StandardMaterial("shadow-material");
        this.shadow9Material.diffuseColor.copyFromFloats(0.1, 0.1, 0.1);
        this.shadow9Material.diffuseTexture = new BABYLON.Texture("./datas/textures/shadow-9.png");
        this.shadow9Material.diffuseTexture.hasAlpha = true;
        this.shadow9Material.useAlphaFromDiffuseTexture = true;
        this.shadow9Material.alpha = 0.4;
        this.shadow9Material.specularColor.copyFromFloats(0, 0, 0);
        this.shadow9Material.freeze();
            
        this.whiteShadow9Material = new BABYLON.StandardMaterial("white-shadow9-material");
        this.whiteShadow9Material.diffuseColor.copyFromFloats(1, 1, 1);
        this.whiteShadow9Material.diffuseTexture = new BABYLON.Texture("./datas/textures/shadow-9.png");
        this.whiteShadow9Material.diffuseTexture.hasAlpha = true;
        this.whiteShadow9Material.useAlphaFromDiffuseTexture = true;
        this.whiteShadow9Material.alpha = 1;
        this.whiteShadow9Material.specularColor.copyFromFloats(0, 0, 0);
        this.whiteShadow9Material.freeze();
            
        this.shadowDiscMaterial = new BABYLON.StandardMaterial("shadow-material");
        this.shadowDiscMaterial.diffuseColor.copyFromFloats(0.1, 0.1, 0.1);
        this.shadowDiscMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/shadow-disc.png");
        this.shadowDiscMaterial.diffuseTexture.hasAlpha = true;
        this.shadowDiscMaterial.useAlphaFromDiffuseTexture = true;
        this.shadowDiscMaterial.alpha = 0.4;
        this.shadowDiscMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.shadowDiscMaterial.freeze();
            
        this.lightDiscMaterial = new BABYLON.StandardMaterial("light-disc-material");
        this.lightDiscMaterial.diffuseColor.copyFromFloats(1, 1, 1);
        this.lightDiscMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/shadow-disc.png");
        this.lightDiscMaterial.diffuseTexture.hasAlpha = true;
        this.lightDiscMaterial.useAlphaFromDiffuseTexture = true;
        this.lightDiscMaterial.alpha = 0.4;
        this.lightDiscMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.lightDiscMaterial.freeze();
            
        this.puckSideMaterial = new BABYLON.StandardMaterial("shadow-material");
        this.puckSideMaterial.diffuseColor.copyFromFloats(1, 1, 1);
        this.puckSideMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/puck-side-arrow.png");
        this.puckSideMaterial.diffuseTexture.hasAlpha = true;
        this.puckSideMaterial.emissiveColor.copyFromFloats(1, 1, 1);
        this.puckSideMaterial.useAlphaFromDiffuseTexture = true;
        this.puckSideMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.puckSideMaterial.freeze();
            
        this.creepSlashMaterial = new BABYLON.StandardMaterial("creep-slash-material");
        this.creepSlashMaterial.diffuseColor.copyFromFloats(1, 1, 1);
        this.creepSlashMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/creep-slash.png");
        this.creepSlashMaterial.diffuseTexture.hasAlpha = true;
        this.creepSlashMaterial.emissiveColor.copyFromFloats(1, 1, 1);
        this.creepSlashMaterial.useAlphaFromDiffuseTexture = true;
        this.creepSlashMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.creepSlashMaterial.freeze();
        
        this.tileStarTailMaterial = new BABYLON.StandardMaterial("tail-material");
        this.tileStarTailMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.tileStarTailMaterial.emissiveColor.copyFromFloats(0.5, 0.5, 0.5);
        this.tileStarTailMaterial.freeze();

        this.pushTileTopMaterial = new BABYLON.StandardMaterial("push-tile-material");
        this.pushTileTopMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.pushTileTopMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/push-tile-top.png");
        this.pushTileTopMaterial.freeze();

        this.tileColorMaterials = [];
        this.tileColorMaterials[TileColor.North] = northMaterial;
        this.tileColorMaterials[TileColor.South] = southMaterial;
        this.tileColorMaterials[TileColor.East] = eastMaterial;
        this.tileColorMaterials[TileColor.West] = westMaterial;

        /*
        let collectedTileTexture = new BABYLON.DynamicTexture("collected-tile-texture", { width: 512, height: 512 });
        let northTexture = new Image(256, 256);
        northTexture.src = "./datas/textures/red-north-wind.png";
        northTexture.onload = () => {
            let eastTexture = new Image(256, 256);
            eastTexture.src = "./datas/textures/yellow-east-wind.png";
            eastTexture.onload = () => {
                let southTexture = new Image(256, 256);
                southTexture.src = "./datas/textures/blue-south-wind.png";
                southTexture.onload = () => {
                    let greenTexture = new Image(256, 256);
                    greenTexture.src = "./datas/textures/green-west-wind.png";
                    greenTexture.onload = () => {
                        let context = collectedTileTexture.getContext();
                        context.drawImage(northTexture, 0, 0, 256, 256, 0, 0, 256, 256);
                        context.drawImage(eastTexture, 0, 0, 256, 256, 256, 0, 256, 256);
                        context.drawImage(southTexture, 0, 0, 256, 256, 0, 256, 256, 256);
                        context.drawImage(greenTexture, 0, 0, 256, 256, 256, 256, 256, 256);
                        collectedTileTexture.update();
                    }
                }
            }
        }
        this.collectedTileMaterial = new BABYLON.StandardMaterial("collected-tile-material");
        this.collectedTileMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.collectedTileMaterial.diffuseTexture = collectedTileTexture;
        */

        let oneMaterial = new BABYLON.StandardMaterial("one-material");
        //oneMaterial.diffuseColor.copyFromFloats(0.7, 0.7, 0.7);
        //oneMaterial.diffuseColor = BABYLON.Color3.FromHexString("#272838");
        //oneMaterial.diffuseColor = BABYLON.Color3.FromHexString("#272932").scale(0.8);
        oneMaterial.specularColor.copyFromFloats(0, 0, 0);
        oneMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/door-one.png");
        oneMaterial.freeze();
            
        let twoMaterial = new BABYLON.StandardMaterial("two-material");
        //twoMaterial.diffuseColor.copyFromFloats(0.7, 0.7, 0.7);
        //twoMaterial.diffuseColor = BABYLON.Color3.FromHexString("#5D536B");
        //twoMaterial.diffuseColor = BABYLON.Color3.FromHexString("#828489").scale(1.2);
        twoMaterial.specularColor.copyFromFloats(0, 0, 0);
        twoMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/door-two.png");
        twoMaterial.freeze();

        let threeMaterial = new BABYLON.StandardMaterial("three-material");
        //threeMaterial.diffuseColor.copyFromFloats(0.7, 0.7, 0.7);
        //threeMaterial.diffuseColor = BABYLON.Color3.FromHexString("#7D6B91");
        //threeMaterial.diffuseColor = BABYLON.Color3.Lerp(oneMaterial.diffuseColor, twoMaterial.diffuseColor, 0.3);
        threeMaterial.specularColor.copyFromFloats(0, 0, 0);
        threeMaterial.diffuseTexture = new BABYLON.Texture("./datas/textures/door-three.png");
        threeMaterial.freeze();

        this.tileNumberMaterials = [];
        this.tileNumberMaterials[0] = oneMaterial;
        this.tileNumberMaterials[1] = twoMaterial;
        this.tileNumberMaterials[2] = threeMaterial;
        
        this.tileColorShinyMaterials = [];
        this.tileColorShinyMaterials[TileColor.North] = northMaterial.clone(northMaterial.name + "-shiny");
        this.tileColorShinyMaterials[TileColor.East] = eastMaterial.clone(eastMaterial.name + "-shiny");
        this.tileColorShinyMaterials[TileColor.South] = southMaterial.clone(southMaterial.name + "-shiny");
        this.tileColorShinyMaterials[TileColor.West] = westMaterial.clone(westMaterial.name + "-shiny");

        this.tileColorShinyMaterials.forEach(shinyMat => {
            shinyMat.freeze();
        })

        this.trueWhiteMaterial = new BABYLON.StandardMaterial("true-white-material");
        this.trueWhiteMaterial.diffuseColor = BABYLON.Color3.FromHexString("#ffffff");
        this.trueWhiteMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.trueWhiteMaterial.freeze();

        this.fullAutolitWhiteMaterial = new BABYLON.StandardMaterial("full-autolit-white-material");
        this.fullAutolitWhiteMaterial.diffuseColor = BABYLON.Color3.FromHexString("#ffffff");
        this.fullAutolitWhiteMaterial.emissiveColor = BABYLON.Color3.FromHexString("#ffffff");
        this.fullAutolitWhiteMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.fullAutolitWhiteMaterial.freeze();

        this.whiteMaterial = new BABYLON.StandardMaterial("white-material");
        this.whiteMaterial.diffuseColor = BABYLON.Color3.FromHexString("#e3cfb4");
        this.whiteMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.whiteMaterial.freeze();

        this.grayMaterial = new BABYLON.StandardMaterial("gray-material");
        this.grayMaterial.diffuseColor = BABYLON.Color3.FromHexString("#5d6265");
        this.grayMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.grayMaterial.freeze();

        this.blackMaterial = new BABYLON.StandardMaterial("black-material");
        this.blackMaterial.diffuseColor = BABYLON.Color3.FromHexString("#2b2821");
        this.blackMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.blackMaterial.freeze();

        this.brownMaterial = new BABYLON.StandardMaterial("brown-material");
        this.brownMaterial.diffuseColor = BABYLON.Color3.FromHexString("#624c3c");
        this.brownMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.brownMaterial.freeze();

        this.salmonMaterial = new BABYLON.StandardMaterial("salmon-material");
        this.salmonMaterial.diffuseColor = BABYLON.Color3.FromHexString("#d9ac8b");
        this.salmonMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.salmonMaterial.freeze();

        this.blueMaterial = new BABYLON.StandardMaterial("blue-material");
        this.blueMaterial.diffuseColor = BABYLON.Color3.FromHexString("#243d5c");
        this.blueMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.blueMaterial.freeze();

        this.redMaterial = new BABYLON.StandardMaterial("red-material");
        this.redMaterial.diffuseColor = BABYLON.Color3.FromHexString("#b03a48");
        this.redMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.redMaterial.freeze();

        this.yellowMaterial = new BABYLON.StandardMaterial("yellow-material");
        this.yellowMaterial.diffuseColor = BABYLON.Color3.FromHexString("#e0c872");
        this.yellowMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.yellowMaterial.freeze();

        this.greenMaterial = new BABYLON.StandardMaterial("green-material");
        this.greenMaterial.diffuseColor = BABYLON.Color3.FromHexString("#3e6958");
        this.greenMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.greenMaterial.freeze();

        this.colorMaterials = [
            this.redMaterial,
            this.yellowMaterial,
            this.blueMaterial,
            this.greenMaterial
        ];

        this.floorMaterials = [
            this.floorMaterial,
            this.floorMaterial2,
            this.floorGrass,
            this.floorStoneRect,
            this.floorLogs,
            this.floorMossLogs,
            this.woodFloorMaterial,
            this.brickWallMaterial,
            this.holeMaterial
        ];
    }
}