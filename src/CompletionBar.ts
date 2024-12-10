class CompletionBar extends HTMLElement {

    public value: number = 0;
    public valueText: HTMLSpanElement
    public completedBar: HTMLDivElement;
    public showText: boolean = true;

    public static get observedAttributes() {
        return ["value", "show-text"];
    }

    public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (name === "value") {
            this.setValue(parseFloat(newValue));
        }
        if (name === "show-text") {
            this.showText = newValue === "true" ? true : false;
            this.setValue(this.value);
        }
    }

    public connectedCallback(): void {
        this.completedBar = document.createElement("div");
        this.completedBar.classList.add("completed");
        this.completedBar.style.position = "absolute";
        this.completedBar.style.top = "-1px";
        this.completedBar.style.left = "-1px";
        this.completedBar.style.height = "inherit";
        this.completedBar.style.border = "inherit";
        this.completedBar.style.borderRadius = "inherit";
        this.appendChild(this.completedBar);

        this.valueText = document.createElement("span");
        this.valueText.classList.add("completed-text");
        this.valueText.style.position = "relative";
        this.valueText.style.display = "none";
        this.valueText.style.marginRight = "5px";
        this.valueText.style.marginLeft = "5px";
        this.valueText.style.display = "inline-block";
        this.valueText.style.color = "white";
        this.valueText.style.fontWeight = "500";

        this.appendChild(this.valueText);

        if (this.hasAttribute("value")) {
            this.setValue(parseFloat(this.getAttribute("value")));
        }
    }

    public animateValueTo(v: number, duration: number = 1): void {
        let t0 = performance.now();
        let vOrigin = this.value;
        let vDestination = v;
        let step = () => {
            let t = (performance.now() - t0) / 1000;
            let f = t / duration;
            if (f < 1) {
                let val = vOrigin * (1 - f) + vDestination * f;
                let currPercent = Math.floor(this.value * 100);
                let valPercent = Math.floor(val * 100);
                if (currPercent != valPercent) {
                    this.setValue(val);
                }
                requestAnimationFrame(step);
            }
            else {
                this.classList.remove("animating");
                this.setValue(vDestination);
            }
        }
        this.classList.add("animating");
        step();
    }

    public setValue(v: number): void {
        if (this.completedBar && this.valueText) {
            this.value = v;
            let percent = Math.floor(v * 100);
            let percentString = percent.toFixed(0) + "%";
            if (percent === 0) {
                this.completedBar.style.display = "none";
            }
            else {
                let invPercentString = (100 - percent).toFixed(0) + "%";
                this.completedBar.style.display = "block";
                this.completedBar.style.width = percentString;
                this.completedBar.style.backgroundColor = "color-mix(in srgb, #e0c872 " + percentString + ", #624c3c " + invPercentString + ")";
            }
    
            this.valueText.innerHTML = percentString + " completed";
            if (percent > 50) {
                this.completedBar.appendChild(this.valueText);
                this.style.textAlign = "left";
                this.valueText.style.display = this.showText ? "block" : "none";
                this.valueText.style.color = "black";
                this.valueText.style.fontWeight = "900";
            }
            else {
                this.appendChild(this.valueText);
                this.style.textAlign = "right";
                this.valueText.style.display = this.showText ? "block" : "none";
                this.valueText.style.color = "white";
                this.valueText.style.fontWeight = "500";
            }

            if (percent > 70) {
                this.valueText.style.color = "black";
                this.valueText.style.fontWeight = "900";
            }
            else {
                this.valueText.style.color = "white";
                this.valueText.style.fontWeight = "500";
            }
        }
    }
}

customElements.define("completion-bar", CompletionBar);