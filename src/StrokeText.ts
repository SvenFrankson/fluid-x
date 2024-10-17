class StrokeText extends HTMLElement {

    public base: HTMLSpanElement
    public fill: HTMLSpanElement;
    public stroke: HTMLSpanElement;
    public content: string;
    
    public connectedCallback(): void {
        this.style.position = "relative";

        if (!this.content) {
            this.content = this.innerText;
        }

        this.innerText = "";
        
        this.base = document.createElement("span");
        this.base.innerText = this.content;
        this.appendChild(this.base);

        this.fill = document.createElement("span");
        this.fill.innerText = this.content;
        this.fill.style.position = "absolute";
        this.fill.style.top = "0";
        this.fill.style.left = "0";
        this.fill.style.zIndex = "1";
        this.appendChild(this.fill);

        this.stroke = document.createElement("span");
        this.stroke.innerText = this.content;
        this.stroke.style.position = "absolute";
        this.stroke.style.top = "0";
        this.stroke.style.left = "0";
        this.stroke.style.color = "#e3cfb4ff";
        this.stroke.style.webkitTextStroke = "2px #e3cfb4ff";
        this.stroke.style.zIndex = "0";
        this.appendChild(this.stroke);
    }

    public setContent(text: string): void {
        if (this.base && this.fill && this.stroke) {
            this.base.innerText = text;
            this.fill.innerText = text;
            this.stroke.innerText = text;
        }
        else {
            this.content = text;
        }
    }
}

customElements.define("stroke-text", StrokeText);