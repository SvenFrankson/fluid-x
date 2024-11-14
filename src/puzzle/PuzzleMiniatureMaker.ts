class PuzzleMiniatureMaker {

    public static Generate(content: string): HTMLCanvasElement {
        content = content.replaceAll("\r\n", "");
        content = content.replaceAll("\n", "");
        let lines = content.split("x");
        let buildingBlocksLine = "";
        if (lines[lines.length - 1].startsWith("BB")) {
            buildingBlocksLine = lines.pop();
        }
        
        let h = 4;
        let w = 4;
        if (lines.length > 3) {
            let ballLine = lines.splice(0, 1)[0].split("u");
            if (ballLine.length === 5 || ballLine.length === 8) {
                w = parseInt(ballLine[0]);
                h = parseInt(ballLine[1]);
            }
            else {
                h = lines.length;
                w = lines[0].length;
            }
        }
        
        let canvas = document.createElement("canvas");
        let max = Math.max(w, h);
        let f = 1;
        if (max < 7) {
            f = 2;
        }
        f = 6;
        let b = 6 * f;
        let m = 1 * f;

        canvas.width = b * w;
        canvas.height = b * h;

        let context = canvas.getContext("2d");
        //context.fillStyle = "#2b2821";
        //context.fillRect(2 * m, 2 * m, canvas.width - 4 * m, canvas.height - 4 * m);

        context.fillStyle = "#d9ac8b";
        context.fillRect(0, 0, canvas.width, canvas.height);

        let buildColor = "#f9dcAb";

        if (buildingBlocksLine != "") {
            buildingBlocksLine = buildingBlocksLine.replace("BB", "");
            for (let j = 0; j < h; j++) {
                for (let i = 0; i < w; i++) {
                    let n = i + j * w;
                    if (n < buildingBlocksLine.length) {
                        let blockHeight = parseInt(buildingBlocksLine[n]);
                        if (blockHeight === 1) {
                            let x = (i) * b;
                            let y = (h - j - 1) * b;
                            let s = b;
                            context.fillStyle = buildColor;
                            context.fillRect(x, y, s, s);
                        }
                    }
                }
            }
        }

        if (lines.length > 3) {
            for (let j = 0; j < lines.length; j++) {
                let line = lines[lines.length - 1 - j];
                let i = 0;
                for (let ii = 0; ii < line.length; ii++) {
                    let c = line[ii];
                    let x = i * b;
                    let y = (h - 1 - j) * b;
                    let s = b;
                    if (c === "B") {
                        let x = (i) * b;
                        let y = (h - 1 - j - 1) * b;
                        let s = b;
                        context.fillStyle = buildColor;
                        context.fillRect(x, y, 2 * s, 2 * s);
                    }
                    if (c === "U") {
                        let x = (i) * b;
                        let y = (h - 1 - j - 1) * b;
                        let s = b;
                        context.fillStyle = buildColor;
                        context.fillRect(x, y, 4 * s, 2 * s);
                    }
                    if (c === "R") {
                        let rampW = parseInt(line[ii + 1]);
                        if (isNaN(rampW)) {
                            rampW = 2;
                        }
                        else {
                            ii++;
                        }
                        let x = (i) * b;
                        let y = (h - 1 - j - 2) * b;
                        let s = b;
                        context.fillStyle = buildColor;
                        context.fillRect(x, y, rampW * s, 3 * s);
                    }
                    i++;
                }
            }
        }
        if (lines.length > 3) {
            for (let j = 0; j < lines.length; j++) {
                let line = lines[lines.length - 1 - j];
                let i = 0;
                for (let ii = 0; ii < line.length; ii++) {
                    let c = line[ii];
                    let x = i * b + m;
                    let y = (h - 1 - j) * b + m;
                    let s = b - 2 * m;
                    if (c === "O") {
                        let x = i * b;
                        let y = (h - 1 - j) * b;
                        let s = b;
                        context.fillStyle = "#2d4245";
                        context.fillRect(x, y, s, s);
                    }
                    if (c === "p") {
                        context.fillStyle = "#624c3c";
                        context.fillRect(x, y, s, s);
                    }
                    if (c === "q") {
                        let x = i * b;
                        let y = (h - 1 - j) * b;
                        let s = b;
                        context.fillStyle = "#647d9c";
                        context.fillRect(x, y, s, s);
                    }
                    if (c === "r") {
                        context.fillStyle = "#5d7275";
                        context.fillRect(x, y, s, s);
                    }
                    if (c === "a") {
                        let x = i * b;
                        let y = (h - 1 - j) * b;
                        let s = b;
                        context.fillStyle = "#1b1811";
                        context.fillRect(x, y, s, s);
                    }
                    if (c === "N") {
                        context.fillStyle = "#624c3c";
                        context.fillRect(x, y, s, s);
                        context.fillStyle = "#b03a48";
                        context.fillRect(x + m, y + m, s - 2 * m, s - 2 * m);
                    }
                    if (c === "n") {
                        context.fillStyle = "#b03a48";
                        context.fillRect(x, y, s, s);
                    }
                    if (c === "E") {
                        context.fillStyle = "#624c3c";
                        context.fillRect(x, y, s, s);
                        context.fillStyle = "#e0c872";
                        context.fillRect(x + m, y + m, s - 2 * m, s - 2 * m);
                    }
                    if (c === "e") {
                        context.fillStyle = "#e0c872";
                        context.fillRect(x, y, s, s);
                    }
                    if (c === "S") {
                        context.fillStyle = "#624c3c";
                        context.fillRect(x, y, s, s);
                        context.fillStyle = "#243d5c";
                        context.fillRect(x + m, y + m, s - 2 * m, s - 2 * m);
                    }
                    if (c === "s") {
                        context.fillStyle = "#243d5c";
                        context.fillRect(x, y, s, s);
                    }
                    if (c === "W") {
                        context.fillStyle = "#624c3c";
                        context.fillRect(x, y, s, s);
                        context.fillStyle = "#3e6958";
                        context.fillRect(x + m, y + m, s - 2 * m, s - 2 * m);
                    }
                    if (c === "w") {
                        context.fillStyle = "#3e6958";
                        context.fillRect(x, y, s, s);
                    }
                    if (c === "R") {
                        let rampW = parseInt(line[ii + 1]);
                        if (isNaN(rampW)) {
                            rampW = 2;
                        }
                        else {
                            ii++;
                        }
                    }
                    i++;
                }
            }
        }
        return canvas;
    }
}