class StrokeText extends HTMLElement {

    public base: HTMLSpanElement
    public fill: HTMLSpanElement;
    public stroke: HTMLSpanElement;
    public content: string;
    
    public connectedCallback(): void {
        this.style.position = "relative";
        let o = (1 / window.devicePixelRatio).toFixed(1) + "px";
        o = "1px";
        this.style.textShadow = "1px 1px 0px #e3cfb4ff, -1px 1px 0px #e3cfb4ff, -1px -1px 0px #e3cfb4ff, 1px -1px 0px #e3cfb4ff";
    }

    public setContent(text: string): void {
        this.innerText = text;
    }
}

customElements.define("stroke-text", StrokeText);