class PuzzleMiniatureMaker {

    public static Generate(content: string): HTMLCanvasElement {
        content = content.replaceAll("\r\n", "");
        content = content.replaceAll("\n", "");
        let lines = content.split("x");
        
        let h = 4;
        let w = 4;
        if (lines.length > 3) {
            let ballLine = lines.splice(0, 1)[0].split("u");
            let ballX = parseInt(ballLine[0]);
            let ballZ = parseInt(ballLine[1]);
            let ballColor = TileColor.North;
            if (ballLine.length > 2) {
                ballColor = parseInt(ballLine[2]);
            }
            h = lines.length;
            w = lines[0].length;
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

        context.fillStyle = "#d9ac8b80";
        context.fillRect(0, 0, canvas.width, canvas.height);

        let buildColor = "#f9cc9b80";

        if (lines.length > 3) {
            for (let j = 0; j < lines.length; j++) {
                let line = lines[lines.length - 1 - j];
                for (let i = 0; i < line.length; i++) {
                    let c = line[i];
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
                        let x = (i) * b;
                        let y = (h - 1 - j - 2) * b;
                        let s = b;
                        context.fillStyle = buildColor;
                        context.fillRect(x, y, 2 * s, 3 * s);
                    }
                }
            }
        }
        if (lines.length > 3) {
            for (let j = 0; j < lines.length; j++) {
                let line = lines[lines.length - 1 - j];
                for (let i = 0; i < line.length; i++) {
                    let c = line[i];
                    let x = i * b + m;
                    let y = (h - 1 - j) * b + m;
                    let s = b - 2 * m;
                    if (c === "O") {
                        let x = i * b;
                        let y = (h - 1 - j) * b;
                        let s = b;
                        context.fillStyle = "#00000080";
                        context.fillRect(x, y, s, s);
                    }
                    if (c === "p") {
                        context.fillStyle = "#624c3c80";
                        context.fillRect(x, y, s, s);
                    }
                    if (c === "r") {
                        context.fillStyle = "#5d727580";
                        context.fillRect(x, y, s, s);
                    }
                    if (c === "N") {
                        context.fillStyle = "#624c3c80";
                        context.fillRect(x, y, s, s);
                        context.fillStyle = "#b03a4880";
                        context.fillRect(x + m, y + m, s - 2 * m, s - 2 * m);
                    }
                    if (c === "n") {
                        context.fillStyle = "#b03a4880";
                        context.fillRect(x, y, s, s);
                    }
                    if (c === "E") {
                        context.fillStyle = "#624c3c80";
                        context.fillRect(x, y, s, s);
                        context.fillStyle = "#e0c87280";
                        context.fillRect(x + m, y + m, s - 2 * m, s - 2 * m);
                    }
                    if (c === "e") {
                        context.fillStyle = "#e0c87280";
                        context.fillRect(x, y, s, s);
                    }
                    if (c === "S") {
                        context.fillStyle = "#624c3c80";
                        context.fillRect(x, y, s, s);
                        context.fillStyle = "#243d5c80";
                        context.fillRect(x + m, y + m, s - 2 * m, s - 2 * m);
                    }
                    if (c === "s") {
                        context.fillStyle = "#243d5c80";
                        context.fillRect(x, y, s, s);
                    }
                    if (c === "W") {
                        context.fillStyle = "#624c3c80";
                        context.fillRect(x, y, s, s);
                        context.fillStyle = "#3e695880";
                        context.fillRect(x + m, y + m, s - 2 * m, s - 2 * m);
                    }
                    if (c === "w") {
                        context.fillStyle = "#3e695880";
                        context.fillRect(x, y, s, s);
                    }
                }
            }
        }
        return canvas;
    }
}