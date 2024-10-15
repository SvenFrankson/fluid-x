class LevelPage {

    public levelFileNames = [
        "test",
        "test_A",
        "test_B",
        "test_C",
        "test_D",
        "test_long-line",
        "test_one-way-the-other",
        "test_arena",
        "editor_1",
        "editor_2",
        "editor_3",
        "editor_4"
    ]
    public page: number = 0;
    public levelCount: number = this.levelFileNames.length;
    public nabuPage: Nabu.DefaultPage;

    constructor(queryString: string, public router: CarillonRouter) {
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

        let levelsPerPage = colCount * (rowCount - 1);
        let maxPage = Math.ceil(this.levelCount / levelsPerPage);

        let n = this.page * levelsPerPage;
        for (let i = 0; i < rowCount - 1; i++) {
            let line = document.createElement("div");
            line.classList.add("square-btn-container-line");
            container.appendChild(line);
            for (let j = 0; j < colCount; j++) {
                let squareButton = document.createElement("button");
                squareButton.classList.add("square-btn");
                if (n >= this.levelCount) {
                    squareButton.style.visibility = "hidden";
                }
                else {
                    squareButton.innerHTML = "<stroke-text>" + (n + 1).toFixed(0) + "</stroke-text>";
                    let hash = "#level-" + this.levelFileNames[n];
                    squareButton.onclick = () => {
                        location.hash = hash;
                    }
                }
                n++;
                line.appendChild(squareButton);
            }
        }

        let line = document.createElement("div");
        line.classList.add("square-btn-container-line");
        container.appendChild(line);

        let prevButton = document.createElement("button");
        prevButton.classList.add("square-btn");
        if (this.page === 0) {
            prevButton.innerHTML = "<stroke-text>BACK</stroke-text>";
            prevButton.onclick = () => {
                location.hash = "#home";
            }
        }
        else {
            prevButton.innerHTML = "<stroke-text>PREV</stroke-text>";
            prevButton.onclick = () => {
                this.page--;
                this.redraw();
            }
        }
        line.appendChild(prevButton);
        for (let j = 1; j < colCount - 1; j++) {
            let squareButton = document.createElement("button");
            squareButton.classList.add("square-btn");
            squareButton.style.visibility = "hidden";
            line.appendChild(squareButton);
        }
        let nextButton = document.createElement("button");
        nextButton.classList.add("square-btn");
        if (this.page < maxPage - 1) {
            nextButton.innerHTML = "<stroke-text>NEXT</stroke-text>";
            nextButton.onclick = () => {
                this.page++;
                this.redraw();
            }
        }
        else {
            nextButton.style.visibility = "hidden";
        }
        line.appendChild(nextButton);
    }
}