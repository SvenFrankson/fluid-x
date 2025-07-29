function SaveAsText(puzzle: Puzzle, withHaiku?: boolean): string {
    let lines: string[][][] = [];
    for (let j = 0; j < puzzle.h; j++) {
        lines[j] = [];
        for (let i = 0; i < puzzle.w; i++) {
            lines[j][i] = ["o"];
        }
    }

    // Serialize non-decor Tiles.
    puzzle.tiles.forEach(tile => {
        if (!tile.isDecor) {
            let i = tile.i;
            let j = tile.j;
            if (j >= 0 && j < lines.length) {
                if (i >= 0 && i < lines[j].length) {
                    if (tile instanceof BlockTile) {
                        if (tile.color === TileColor.North) {
                            lines[j][i] = ["n"];
                        }
                        else if (tile.color === TileColor.East) {
                            lines[j][i] = ["e"];
                        }
                        else if (tile.color === TileColor.South) {
                            lines[j][i] = ["s"];
                        }
                        else if (tile.color === TileColor.West) {
                            lines[j][i] = ["w"];
                        }
                    }
                    else if (tile instanceof SwitchTile) {
                        if (tile.color === TileColor.North) {
                            lines[j][i] = ["N"];
                        }
                        else if (tile.color === TileColor.East) {
                            lines[j][i] = ["E"];
                        }
                        else if (tile.color === TileColor.South) {
                            lines[j][i] = ["S"];
                        }
                        else if (tile.color === TileColor.West) {
                            lines[j][i] = ["W"];
                        }
                    }
                    else if (tile instanceof ButtonTile) {
                        if (tile.props.value === 1) {
                            lines[j][i] = ["I"];
                        }
                        else if (tile.props.value === 2) {
                            lines[j][i] = ["D"];
                        }
                        else if (tile.props.value === 3) {
                            lines[j][i] = ["T"];
                        }
                    }
                    else if (tile instanceof DoorTile) {
                        if (tile.props.value === 1) {
                            lines[j][i] = tile.closed ? ["j"] : ["i"];
                        }
                        else if (tile.props.value === 2) {
                            lines[j][i] = tile.closed ? ["f"] : ["d"];
                        }
                        else if (tile.props.value === 3) {
                            lines[j][i] = tile.closed ? ["u"] : ["t"];
                        }
                    }
                    else if (tile instanceof PushTile) {
                        lines[j][i] = ["p"];
                    }
                    else if (tile instanceof HoleTile) {
                        if (tile.covered) {
                            lines[j][i] = ["Q"];
                        }
                        else {
                            lines[j][i] = ["O"];
                        }
                    }
                    else if (tile instanceof WallTile) {
                        lines[j][i] = ["a"];
                    }
                    else if (tile instanceof WaterTile) {
                        lines[j][i] = ["q"];
                    }        
                }
            }
        }
    });

    // Serialize decor Tiles.
    puzzle.tiles.forEach(tile => {
        if (tile.isDecor) {
            let i = tile.i;
            let j = tile.j;
            if (j >= 0 && j < lines.length) {
                if (i >= 0 && i < lines[j].length) {
                    if (tile instanceof Nobori) {
                        lines[j][i] = ["b", (tile.rightSide ? "r" : "l"), tile.color.toFixed(0), ...lines[j][i]];
                    }     
                }
            }
        }
    });

    puzzle.buildings.forEach(building => {
        let i = building.i;
        let j = building.j;
        if (building instanceof Ramp) {
            lines[j][i] = ["R", building.w.toFixed(0)];
        }
        if (building instanceof Bridge) {
            lines[j][i] = ["U"];
        }
    })

    puzzle.creeps.forEach(creep => {
        let i = creep.i;
        let j = creep.j;
        lines[j][i] = ["c"];
    })

    lines.reverse();

    let lines3 = lines.map((l1) => {
        return l1.map(l2 => {
            return l2.reduce((c1, c2) => { return c1 + c2; });
        })
    })
    let lines2 = lines3.map((l1) => { return l1.reduce((c1, c2) => { return c1 + c2; })});

    let ballLine = puzzle.w.toFixed(0) + "u" + puzzle.h.toFixed(0) + "u" + puzzle.floorMaterialIndex.toFixed(0) + "u";
    for (let i = 0; i < puzzle.ballsCount; i++) {
        ballLine += puzzle.balls[i].i.toFixed(0) + "u" + puzzle.balls[i].j.toFixed(0) + "u" + puzzle.balls[i].color.toFixed(0);
        if (i < puzzle.ballsCount - 1) {
            ballLine += "u";
        }
    }
    lines2.splice(0, 0, ballLine);

    let buildingBlocksLine = "BB";
    for (let j = 0; j < puzzle.h; j++) {
        for (let i = 0; i < puzzle.w; i++) {
            buildingBlocksLine = buildingBlocksLine + puzzle.buildingBlockGet(i, j).toFixed(0);
        }
    }

    lines2.push(buildingBlocksLine);

    let content = lines2.reduce((l1, l2) => { return l1 + "x" + l2; });

    if (withHaiku && puzzle.haiku) {
        let haikuLine = "[HAIKU]";
        haikuLine += (puzzle.haiku.position.x / 0.55).toFixed(0) + "x";
        haikuLine += (puzzle.haiku.position.z / 0.55).toFixed(0) + "x";
        haikuLine += (puzzle.haiku.text.replaceAll("\n", "\\n"));
        content += haikuLine;
    }

    return content;
}

function SerializeBuildingBlocks(buildingBlocks: number[][]): string {
    let buildingBlocksLine = "BB";
    let w = buildingBlocks.length;
    let h = buildingBlocks[0].length;
    for (let j = 0; j < h; j++) {
        for (let i = 0; i < w; i++) {
            buildingBlocksLine = buildingBlocksLine + buildingBlocks[i][j].toFixed(0);
        }
    }
    return buildingBlocksLine;
}