class NumValueInput extends HTMLElement {

    public value: number = 0;
    public min: number;
    public max: number;
    public wrap: boolean;

    public buttonMinus: HTMLButtonElement;
    public buttonPlus: HTMLButtonElement;
    public valueDisplay: HTMLSpanElement;
    public valueDisplayText: StrokeText;

    public static get observedAttributes() {
        return ["value-width", "min", "max", "wrap"];
    }

    public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (name === "value-width") {
            if (this.valueDisplay) {
                this.valueDisplay.style.width = newValue;
            }
        }
        if (name === "wrap") {
            if (newValue === "true") {
                this.wrap = true;
            }
            else {
                this.wrap = false;
            }
        }
        if (name === "min") {
            this.min = parseInt(newValue);
        }
        if (name === "max") {
            this.max = parseInt(newValue);
        }
    }
    
    public connectedCallback(): void {        
        this.buttonMinus = document.createElement("button");
        this.buttonMinus.classList.add("xsmall-btn", "green");
        this.buttonMinus.innerHTML = "<stroke-text>-</stroke-text>";
        this.appendChild(this.buttonMinus);
        this.buttonMinus.onpointerup = () => {
            this.setValue(this.value - 1);
            if (this.onValueChange) {
                this.onValueChange(this.value);
            }
        }
        
        this.valueDisplay = document.createElement("span");
        this.valueDisplay.style.display = "inline-block";
        if (this.hasAttribute("value-width")) {
            this.valueDisplay.style.width = this.getAttribute("value-width");
        }
        else {
            this.valueDisplay.style.width = "50px";
        }
        this.valueDisplay.style.fontSize = "20px";
        this.valueDisplay.style.fontWeight = "900";
        this.valueDisplay.style.textAlign = "center";

        this.valueDisplayText = document.createElement("stroke-text") as StrokeText;
        this.valueDisplay.appendChild(this.valueDisplayText)

        this.appendChild(this.valueDisplay);
        
        this.buttonPlus = document.createElement("button");
        this.buttonPlus.classList.add("xsmall-btn", "green");
        this.buttonPlus.innerHTML = "<stroke-text>+</stroke-text>";
        this.appendChild(this.buttonPlus);
        this.buttonPlus.onpointerup = () => {
            this.setValue(this.value + 1);
            if (this.onValueChange) {
                this.onValueChange(this.value);
            }
        }
    }

    private _updateValueDisplay(): void {
        this.valueDisplayText.setContent(this.valueToString(this.value));
    }

    public setValue(v: number): void {
        this.value = v;
        if (this.wrap && isFinite(this.min) && isFinite(this.max)) {
            if (this.value < this.min) {
                this.value = this.max;
            }
            if (this.value > this.max) {
                this.value = this.min;
            }
        }
        else if (isFinite(this.min)) {
            this.value = Math.max(this.value, this.min);
        }
        else if (isFinite(this.max)) {
            this.value = Math.min(this.value, this.max);
        }
        this._updateValueDisplay();
    }

    public onValueChange: (v: number) => void;

    public valueToString: (v: number) => string = (v: number) => {
        return v.toFixed(0);
    }
}

customElements.define("num-value-input", NumValueInput);