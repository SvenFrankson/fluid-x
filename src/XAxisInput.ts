class XAxisInput extends HTMLElement {

    public value: number = 0;
    public background: HTMLImageElement;
    public cursor: HTMLImageElement;
    public pointerIsDown: boolean = false;

    public connectedCallback(): void {
        this.background = document.createElement("img");
        this.background.src = "./datas/textures/input-bar.svg";
        this.background.style.width = "100%";
        this.background.style.pointerEvents = "none";
        this.appendChild(this.background);

        this.cursor = document.createElement("img");
        this.cursor.src = "./datas/textures/input-cursor.svg";
        this.cursor.style.position = "absolute";
        this.cursor.style.height = "100%";
        this.cursor.style.left = "50%";
        this.cursor.style.transform = "translate(-50%, 0)";
        this.cursor.style.pointerEvents = "none";
        this.appendChild(this.cursor);

        this.addEventListener("pointerdown", this.pointerDown);
        document.addEventListener("pointermove", this.pointerMove);
        document.addEventListener("pointerup", this.pointerUp);
    }

    public setValue(v: number): void {
        this.value = Nabu.MinMax(v, - 1, 1);
        this.cursor.style.left = (10 + (this.value + 1) * 40).toFixed(1) + "%";
    }

    public pointerDown = (ev: PointerEvent) => {
        this.pointerIsDown = true;
        let rect = this.getBoundingClientRect();
        let dx = (ev.clientX - rect.left) / rect.width;
        let f = (dx - 0.1) / 0.8;
        let x = - 1 * (1 - f) + 1 * f;
        this.setValue(x);
    }

    public pointerMove = (ev: PointerEvent) => {
        if (this.pointerIsDown) {
            let rect = this.getBoundingClientRect();
            let dx = (ev.clientX - rect.left) / rect.width;
            let f = (dx - 0.1) / 0.8;
            let x = - 1 * (1 - f) + 1 * f;
            this.setValue(x);
        }
    }

    public pointerUp = (ev: PointerEvent) => {
        this.pointerIsDown = false;
        this.setValue(0);
    }
}

customElements.define("x-axis-input", XAxisInput);