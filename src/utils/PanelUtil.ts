function CenterPanel(panel: HTMLElement, dx: number = 0, dy: number = 0) {
    let bodyRect = document.body.getBoundingClientRect();
    let panelRect = panel.getBoundingClientRect();

    if (bodyRect.width * 0.95 < panelRect.width) {
        let f = bodyRect.width / panelRect.width * 0.95;
        panel.style.transformOrigin = "top left";
        panel.style.transform = "scale(" + f.toFixed(3) + ", " + f.toFixed(3) + ")";
        panel.style.left = "2.5%";
        panel.style.right = "auto";
    }
    else {
        let left = Math.floor((bodyRect.width - panelRect.width) * 0.5 + dx / window.devicePixelRatio);
        panel.style.left = left.toFixed(0) + "px";
        panel.style.right = "auto";
    }

    if (bodyRect.height * 0.95 < panelRect.height) {
        let f = bodyRect.height / panelRect.height * 0.95;
        panel.style.transformOrigin = "top left";
        panel.style.transform = "scale(" + f.toFixed(3) + ", " + f.toFixed(3) + ")";
        panel.style.top = "2.5%";
        panel.style.bottom = "auto";
    }
    else {
        let top = Math.floor((bodyRect.height - panelRect.height) * 0.5 + dy / window.devicePixelRatio);
        panel.style.top = top.toFixed(0) + "px";
        panel.style.bottom = "auto";
    }
}