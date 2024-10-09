interface BuildProps {
    i?: number;
    j?: number;
}

abstract class Build extends BABYLON.Mesh {

    public borders: Border[] = [];

    constructor(public game: Game, props: BuildProps) {
        super("tile");
        if (isFinite(props.i)) {
            this.position.x = props.i * 1.1;
        }
        if (isFinite(props.j)) {
            this.position.z = props.j * 1.1;
        }

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
    
    constructor(game: Game, props: BuildProps) {
        super(game, props);

        let border = new Border(this.game);
        border.position.copyFrom(this.position);
        border.position.x -= 0.5 * 1.1;
        this.borders.push(border);
        
        border = new Border(this.game);
        border.position.copyFrom(this.position);
        border.position.x += 1.5 * 1.1;
        this.borders.push(border);

        border = new Border(this.game);
        border.position.copyFrom(this.position);
        border.position.x -= 0.5 * 1.1;
        border.position.z += 1.1;
        this.borders.push(border);
        
        border = new Border(this.game);
        border.position.copyFrom(this.position);
        border.position.x += 1.5 * 1.1;
        border.position.z += 1.1;
        this.borders.push(border);

        border = new Border(this.game);
        border.position.copyFrom(this.position);
        border.position.x -= 0.5 * 1.1;
        border.position.z += 2 * 1.1;
        this.borders.push(border);
        
        border = new Border(this.game);
        border.position.copyFrom(this.position);
        border.position.x += 1.5 * 1.1;
        border.position.z += 2 * 1.1;
        this.borders.push(border);

        border = new Border(this.game);
        border.vertical = false;
        border.position.copyFrom(this.position);
        border.position.z += 2.5 * 1.1;
        this.borders.push(border);
        
        border = new Border(this.game);
        border.vertical = false;
        border.position.copyFrom(this.position);
        border.position.x += 1 * 1.1;
        border.position.z += 2.5 * 1.1;
        this.borders.push(border);
    }

    public async instantiate(): Promise<void> {
        for (let i = 0; i < this.borders.length; i++) {
            await this.borders[i].instantiate();
        }
    }
}