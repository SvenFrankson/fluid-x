function CenterPanel(panel: HTMLDivElement, dx: number = 0, dy: number = 0) {
    let bodyRect = document.body.getBoundingClientRect();
    let panelRect = panel.getBoundingClientRect();

    let left = Math.floor((bodyRect.width - panelRect.width) * 0.5 + dx);
    let top = Math.floor((bodyRect.height - panelRect.height) * 0.5 + dy);

    panel.style.left = left.toFixed(0) + "px";
    panel.style.right = "auto";
    panel.style.top = top.toFixed(0) + "px";
    panel.style.bottom = "auto";
}