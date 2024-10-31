function SaveAsText(puzzle: Puzzle): string {
    let lines: string[][] = [];
    for (let j = 0; j < puzzle.h; j++) {
        lines[j] = [];
        for (let i = 0; i < puzzle.w; i++) {
            lines[j][i] = "o";
        }
    }

    puzzle.tiles.forEach(tile => {
        let i = tile.i;
        let j = tile.j;
        if (tile instanceof BlockTile) {
            if (tile.color === TileColor.North) {
                lines[j][i] = "n";
            }
            else if (tile.color === TileColor.East) {
                lines[j][i] = "e";
            }
            else if (tile.color === TileColor.South) {
                lines[j][i] = "s";
            }
            else if (tile.color === TileColor.West) {
                lines[j][i] = "w";
            }
        }
        else if (tile instanceof SwitchTile) {
            if (tile.color === TileColor.North) {
                lines[j][i] = "N";
            }
            else if (tile.color === TileColor.East) {
                lines[j][i] = "E";
            }
            else if (tile.color === TileColor.South) {
                lines[j][i] = "S";
            }
            else if (tile.color === TileColor.West) {
                lines[j][i] = "W";
            }
        }
        else if (tile instanceof PushTile) {
            lines[j][i] = "p";
        }
        else if (tile instanceof HoleTile) {
            lines[j][i] = "O";
        }
        else if (tile instanceof WallTile) {
            lines[j][i] = "a";
        }
        else if (tile instanceof WaterTile) {
            lines[j][i] = "q";
        }
    });

    puzzle.buildings.forEach(building => {
        let i = building.i;
        let j = building.j;
        if (building instanceof Box) {
            lines[j][i] = "B";
        }
        if (building instanceof Ramp) {
            lines[j][i] = "R";
        }
        if (building instanceof Bridge) {
            lines[j][i] = "U";
        }
    })

    lines.reverse();

    let lines2 = lines.map((l1) => { return l1.reduce((c1, c2) => { return c1 + c2; })});

    lines2.splice(0, 0, puzzle.ball.i.toFixed(0) + "u" + puzzle.ball.j.toFixed(0) + "u" + puzzle.ball.color.toFixed(0));

    return lines2.reduce((l1, l2) => { return l1 + "x" + l2; });
}