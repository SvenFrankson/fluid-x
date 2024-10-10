interface BuildProps {
    i?: number;
    j?: number;
}

interface BoxProps extends BuildProps {
    borderTop?: boolean;
    borderRight?: boolean;
    borderBottom?: boolean;
    borderLeft?: boolean;
}

abstract class Build extends BABYLON.Mesh {

    public floor: BABYLON.Mesh;
    public shadow: BABYLON.Mesh;
    public borders: Border[] = [];

    constructor(public game: Game, protected boxProps: BuildProps) {
        super("tile");
        if (isFinite(boxProps.i)) {
            this.position.x = boxProps.i * 1.1;
        }
        if (isFinite(boxProps.j)) {
            this.position.z = boxProps.j * 1.1;
        }

        this.floor = new BABYLON.Mesh("building-floor");
        this.floor.parent = this;

        this.floor.material = this.game.darkFloorMaterial;

        this.shadow = new BABYLON.Mesh("shadow");
        this.shadow.position.y = 0.01;
        this.shadow.parent = this;

        this.shadow.material = this.game.shadowMaterial;
    }

    public async instantiate(): Promise<void> { }

    public async bump(): Promise<void> {
        
    }

    public dispose(): void {
        let index = this.game.terrain.build.indexOf(this);
        if (index != -1) {
            this.game.terrain.build.splice(index, 1);
        }
        super.dispose();
    }
}

class Ramp extends Build {

    public builtInBorder: BABYLON.Mesh;
    
    constructor(game: Game, props: BuildProps) {
        super(game, props);

        let border = new Border(this.game, true);
        border.position.copyFrom(this.position);
        border.position.x -= 0.5 * 1.1;
        border.position.y += 0.5;
        this.borders.push(border);
        
        border = new Border(this.game, true);
        border.position.copyFrom(this.position);
        border.position.x += 1.5 * 1.1;
        border.position.y += 0.5;
        this.borders.push(border);

        border = new Border(this.game, true);
        border.position.copyFrom(this.position);
        border.position.x -= 0.5 * 1.1;
        border.position.y += 0.5;
        border.position.z += 1.1;
        this.borders.push(border);
        
        border = new Border(this.game, true);
        border.position.copyFrom(this.position);
        border.position.x += 1.5 * 1.1;
        border.position.y += 0.5;
        border.position.z += 1.1;
        this.borders.push(border);

        border = new Border(this.game, true);
        border.position.copyFrom(this.position);
        border.position.x -= 0.5 * 1.1;
        border.position.y += 0.5;
        border.position.z += 2 * 1.1;
        this.borders.push(border);
        
        border = new Border(this.game, true);
        border.position.copyFrom(this.position);
        border.position.x += 1.5 * 1.1;
        border.position.y += 0.5;
        border.position.z += 2 * 1.1;
        this.borders.push(border);

        border = new Border(this.game, true);
        border.vertical = false;
        border.position.copyFrom(this.position);
        border.position.z += 2.5 * 1.1;
        this.borders.push(border);
        
        border = new Border(this.game, true);
        border.vertical = false;
        border.position.copyFrom(this.position);
        border.position.x += 1 * 1.1;
        border.position.z += 2.5 * 1.1;
        this.borders.push(border);

        this.scaling.copyFromFloats(1.1, 1, 1.1);
        this.material = this.game.salmonMaterial;

        this.builtInBorder = new BABYLON.Mesh("ramp-border");
        this.builtInBorder.parent = this;

        this.builtInBorder.material = this.game.blackMaterial;
    }

    public async instantiate(): Promise<void> {
        for (let i = 0; i < this.borders.length; i++) {
            await this.borders[i].instantiate();
        }
        let data = await this.game.vertexDataLoader.get("./datas/meshes/building.babylon");
        data[0].applyToMesh(this);
        data[1].applyToMesh(this.floor);
        data[2].applyToMesh(this.builtInBorder);

        let m = 0.2;
        let shadowData = Mummu.Create9SliceVertexData({
            width: 2 + 2 * m,
            height: 3 + m,
            margin: m,
            cutTop: true
        });
        Mummu.RotateVertexDataInPlace(shadowData, BABYLON.Quaternion.FromEulerAngles(Math.PI * 0.5, 0, 0));
        Mummu.TranslateVertexDataInPlace(shadowData, new BABYLON.Vector3(0.5, 0, 1 + 0.5 * m));
        shadowData.applyToMesh(this.shadow);
    }
}

class Box extends Build {
    
    constructor(game: Game, protected boxProps: BoxProps) {
        super(game, boxProps);

        let border = new Border(this.game, true);
        border.position.copyFrom(this.position);
        border.position.x -= 0.5 * 1.1;
        this.borders.push(border);

        border = new Border(this.game, true);
        border.position.copyFrom(this.position);
        border.position.x -= 0.5 * 1.1;
        border.position.z += 1.1;
        this.borders.push(border);

        if (boxProps.borderLeft) {
            border = new Border(this.game, false);
            border.position.copyFrom(this.position);
            border.position.x -= 0.5 * 1.1;
            border.position.y += 1;
            this.borders.push(border);
    
            border = new Border(this.game, false);
            border.position.copyFrom(this.position);
            border.position.x -= 0.5 * 1.1;
            border.position.y += 1;
            border.position.z += 1.1;
            this.borders.push(border);
        }
        
        border = new Border(this.game, true);
        border.position.copyFrom(this.position);
        border.position.x += 1.5 * 1.1;
        this.borders.push(border);
        
        border = new Border(this.game, true);
        border.position.copyFrom(this.position);
        border.position.x += 1.5 * 1.1;
        border.position.z += 1.1;
        this.borders.push(border);

        if (boxProps.borderRight) {
            border = new Border(this.game, false);
            border.position.copyFrom(this.position);
            border.position.x += 1.5 * 1.1;
            border.position.y += 1;
            this.borders.push(border);
            
            border = new Border(this.game, false);
            border.position.copyFrom(this.position);
            border.position.x += 1.5 * 1.1;
            border.position.y += 1;
            border.position.z += 1.1;
            this.borders.push(border);
        }

        border = new Border(this.game, true);
        border.vertical = false;
        border.position.copyFrom(this.position);
        border.position.z -= 0.5 * 1.1;
        this.borders.push(border);
        
        border = new Border(this.game, true);
        border.vertical = false;
        border.position.copyFrom(this.position);
        border.position.x += 1 * 1.1;
        border.position.z -= 0.5 * 1.1;
        this.borders.push(border);

        if (boxProps.borderBottom) {
            border = new Border(this.game, false);
            border.vertical = false;
            border.position.copyFrom(this.position);
            border.position.y += 1;
            border.position.z -= 0.5 * 1.1;
            this.borders.push(border);
            
            border = new Border(this.game, false);
            border.vertical = false;
            border.position.copyFrom(this.position);
            border.position.x += 1 * 1.1;
            border.position.y += 1;
            border.position.z -= 0.5 * 1.1;
            this.borders.push(border);
        }

        border = new Border(this.game, true);
        border.vertical = false;
        border.position.copyFrom(this.position);
        border.position.z += 1.5 * 1.1;
        this.borders.push(border);
        
        border = new Border(this.game, true);
        border.vertical = false;
        border.position.copyFrom(this.position);
        border.position.x += 1 * 1.1;
        border.position.z += 1.5 * 1.1;
        this.borders.push(border);

        if (boxProps.borderTop) {
            border = new Border(this.game, false);
            border.vertical = false;
            border.position.copyFrom(this.position);
            border.position.z += 1.5 * 1.1;
            border.position.y += 1;
            this.borders.push(border);
            
            border = new Border(this.game, false);
            border.vertical = false;
            border.position.copyFrom(this.position);
            border.position.x += 1 * 1.1;
            border.position.y += 1;
            border.position.z += 1.5 * 1.1;
            this.borders.push(border);
        }

        this.scaling.copyFromFloats(1.1, 1, 1.1);
        this.material = this.game.salmonMaterial;
    }

    public async instantiate(): Promise<void> {
        for (let i = 0; i < this.borders.length; i++) {
            await this.borders[i].instantiate();
        }
        
        let data = await this.game.vertexDataLoader.get("./datas/meshes/building.babylon");
        data[5].applyToMesh(this);
        data[6].applyToMesh(this.floor);

        let m = 0.2;
        let shadowData = Mummu.Create9SliceVertexData({
            width: 2 + 2 * m,
            height: 2 + 2 * m,
            margin: m,
            cutTop: this.boxProps.borderTop ? false : true,
            cutRight: this.boxProps.borderRight ? false : true,
            cutBottom: this.boxProps.borderBottom ? false : true,
            cutLeft: this.boxProps.borderLeft ? false : true,
        });
        Mummu.RotateVertexDataInPlace(shadowData, BABYLON.Quaternion.FromEulerAngles(Math.PI * 0.5, 0, 0));
        Mummu.TranslateVertexDataInPlace(shadowData, new BABYLON.Vector3(0.5, 0, 0.5));
        shadowData.applyToMesh(this.shadow);
    }
}

class Bridge extends Build {
    
    constructor(game: Game, props: BoxProps) {
        super(game, props);
        
        let border = new Border(this.game, true);
        border.position.copyFrom(this.position);
        border.position.x += 0.5 * 1.1;
        this.borders.push(border);
        
        border = new Border(this.game, true);
        border.position.copyFrom(this.position);
        border.position.x += 0.5 * 1.1;
        border.position.z += 1.1;
        this.borders.push(border);

        border = new Border(this.game, true);
        border.position.copyFrom(this.position);
        border.position.x += 2.5 * 1.1;
        this.borders.push(border);
        
        border = new Border(this.game, true);
        border.position.copyFrom(this.position);
        border.position.x += 2.5 * 1.1;
        border.position.z += 1.1;
        this.borders.push(border);
        
        border = new Border(this.game, true);
        border.vertical = false;
        border.position.copyFrom(this.position);
        border.position.z -= 0.5 * 1.1;
        this.borders.push(border);
        
        border = new Border(this.game, true);
        border.vertical = false;
        border.position.copyFrom(this.position);
        border.position.z += 1.5 * 1.1;
        this.borders.push(border);
        
        border = new Border(this.game, true);
        border.vertical = false;
        border.position.copyFrom(this.position);
        border.position.x += 3 * 1.1;
        border.position.z -= 0.5 * 1.1;
        this.borders.push(border);
        
        border = new Border(this.game, true);
        border.vertical = false;
        border.position.copyFrom(this.position);
        border.position.x += 3 * 1.1;
        border.position.z += 1.5 * 1.1;
        this.borders.push(border);

        if (props.borderTop) {
            border = new Border(this.game, false);
            border.vertical = false;
            border.position.copyFrom(this.position);
            border.position.y += 1;
            border.position.z += 1.5 * 1.1;
            this.borders.push(border);
            
            border = new Border(this.game, false);
            border.vertical = false;
            border.position.copyFrom(this.position);
            border.position.x += 1 * 1.1;
            border.position.y += 1;
            border.position.z += 1.5 * 1.1;
            this.borders.push(border);
            
            border = new Border(this.game, false);
            border.vertical = false;
            border.position.copyFrom(this.position);
            border.position.x += 2 * 1.1;
            border.position.y += 1;
            border.position.z += 1.5 * 1.1;
            this.borders.push(border);
            
            border = new Border(this.game, false);
            border.vertical = false;
            border.position.copyFrom(this.position);
            border.position.x += 3 * 1.1;
            border.position.y += 1;
            border.position.z += 1.5 * 1.1;
            this.borders.push(border);
        }

        if (props.borderBottom) {
            border = new Border(this.game, false);
            border.vertical = false;
            border.position.copyFrom(this.position);
            border.position.y += 1;
            border.position.z -= 0.5 * 1.1;
            this.borders.push(border);
            
            border = new Border(this.game, false);
            border.vertical = false;
            border.position.copyFrom(this.position);
            border.position.x += 1 * 1.1;
            border.position.y += 1;
            border.position.z -= 0.5 * 1.1;
            this.borders.push(border);
            
            border = new Border(this.game, false);
            border.vertical = false;
            border.position.copyFrom(this.position);
            border.position.x += 2 * 1.1;
            border.position.y += 1;
            border.position.z -= 0.5 * 1.1;
            this.borders.push(border);
            
            border = new Border(this.game, false);
            border.vertical = false;
            border.position.copyFrom(this.position);
            border.position.x += 3 * 1.1;
            border.position.y += 1;
            border.position.z -= 0.5 * 1.1;
            this.borders.push(border);
        }
        
        this.scaling.copyFromFloats(1.1, 1, 1.1);
        this.material = this.game.salmonMaterial;
    }

    public async instantiate(): Promise<void> {
        for (let i = 0; i < this.borders.length; i++) {
            await this.borders[i].instantiate();
        }
        
        let data = await this.game.vertexDataLoader.get("./datas/meshes/building.babylon");
        data[3].applyToMesh(this);
        data[4].applyToMesh(this.floor);

        let m = 0.2;
        let shadowData = Mummu.Create9SliceVertexData({
            width: 4 + 2 * m,
            height: 2 + 2 * m,
            margin: m,
            cutRight: true,
            cutLeft: true,
        });
        Mummu.RotateVertexDataInPlace(shadowData, BABYLON.Quaternion.FromEulerAngles(Math.PI * 0.5, 0, 0));
        Mummu.TranslateVertexDataInPlace(shadowData, new BABYLON.Vector3(1.5, 0, 0.5));
        shadowData.applyToMesh(this.shadow);
    }
}