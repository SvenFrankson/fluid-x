class ScreenLoger {

    private static _container: HTMLDivElement;
    private static get container(): HTMLDivElement {
        if (!ScreenLoger._container) {
            ScreenLoger._container = document.createElement("div");
            ScreenLoger._container.id = "screen-loger-container";
            if (USE_WAVEDASH_SDK) {
                Game.Instance.canvas.parentElement.appendChild(ScreenLoger._container);
            }
            else {
                document.body.appendChild(ScreenLoger._container);
            }
        }
        return ScreenLoger._container;
    }

    public static Log(s: string): void {
        let line = document.createElement("div");
        line.classList.add("screen-loger-line");
        line.innerText = s;
        ScreenLoger.container.appendChild(line);
        if (ScreenLoger.container.childElementCount > 15) {
            ScreenLoger.container.removeChild(ScreenLoger.container.firstChild);
        }
    }
}