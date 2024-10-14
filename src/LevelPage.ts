class LevelPage {

    public nabuPage: Nabu.DefaultPage;

    constructor(queryString: string) {
        this.nabuPage = document.querySelector(queryString);
    }

    public get shown(): boolean {
        return this.nabuPage.shown;
    }

    public async show(duration?: number): Promise<void> {
        return this.nabuPage.show(duration);
    }

    public async hide(duration?: number): Promise<void> {
        return this.nabuPage.hide(duration);
    }

    public redraw(): void {
        let rect = this.nabuPage.getBoundingClientRect();
        let colCount = Math.floor(rect.width / 90);
        let rowCount = Math.floor(rect.height * 0.7 / 90);

        let container = this.nabuPage.querySelector(".square-btn-container");
        container.innerHTML = "";

        let n = 0;
        for (let i = 0; i < rowCount; i++) {
            let line = document.createElement("div");
            line.classList.add("square-btn-container-line");
            container.appendChild(line);
            for (let j = 0; j < colCount; j++) {
                let squareButton = document.createElement("button");
                squareButton.classList.add("square-btn");
                n++;
                squareButton.innerHTML = "<stroke-text>Level " + n.toFixed(0) + "</stroke-text>";
                line.appendChild(squareButton);
            }
        }
    }
}