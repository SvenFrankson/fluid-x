class StrokeText extends HTMLElement {

    public fill: HTMLSpanElement;
    public stroke: HTMLSpanElement;
    
    public connectedCallback(): void {
        this.style.position = "relative";

        let text = this.innerText;

        this.fill = document.createElement("span");
        this.fill.innerText = text;
        this.fill.style.position = "absolute";
        this.fill.style.top = "0";
        this.fill.style.left = "0";
        this.fill.style.color = "black";
        this.fill.style.zIndex = "1";
        this.appendChild(this.fill);

        this.stroke = document.createElement("span");
        this.stroke.innerText = text;
        this.stroke.style.position = "absolute";
        this.stroke.style.top = "0";
        this.stroke.style.left = "0";
        this.stroke.style.color = "#e3cfb4ff";
        this.stroke.style.webkitTextStroke = "4px #e3cfb4ff";
        this.stroke.style.zIndex = "0";
        this.appendChild(this.stroke);

    }
}

customElements.define("stroke-text", StrokeText);