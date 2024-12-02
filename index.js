var USE_POKI_SDK = true;
var OFFLINE_MODE = true;
var ADVENT_CAL = false;

var THE_ORIGIN_OF_TIME_ms = 0;
var last_step_t = 0;
var displayed_progress = 0;
var real_progress = 0;
var next_progress = 0;
var observed_progress_speed = 0.2;

async function loadCSS(src) {
    let t0 = performance.now();
    return new Promise((resolve) => {
        let script = document.createElement('link');
        script.rel = "stylesheet";
        script.type = "text/css";
        script.href = src;
        document.body.append(script);
        script.onload = () => {
            let t = performance.now();
            let t_load_this_script = (t - t0);
            let t_since_start = (t - THE_ORIGIN_OF_TIME_ms);
            console.log(src + " loaded at " + t_since_start.toFixed(3) + " ms. (in " + t_load_this_script.toFixed(3) + " ms)");
            resolve();
        };
    });
}

async function loadScript(src) {
    let t0 = performance.now();
    return new Promise((resolve) => {
        let script = document.createElement('script');
        script.src = src;
        document.body.append(script);
        script.onload = () => {
            let t = performance.now();
            let t_load_this_script = (t - t0);
            let t_since_start = (t - THE_ORIGIN_OF_TIME_ms);
            console.log(src + " loaded at " + t_since_start.toFixed(3) + " ms. (in " + t_load_this_script.toFixed(3) + " ms)");
            resolve();
        };
    });
}

async function gameLoaded() {
    let t0 = performance.now();
    return new Promise((resolve) => {
        let wait = () => {
            if (Game) {
                if (Game.Instance) {
                    if (Game.Instance.gameLoaded) {
                        let t = performance.now();
                        let t_wait_this_step = (t - t0);
                        let t_since_start = (t - THE_ORIGIN_OF_TIME_ms);
                        console.log("game loaded at " + t_since_start.toFixed(3) + " ms. (in " + t_wait_this_step.toFixed(3) + " ms)");
                        resolve();
                        return;
                    }
                }
            }
            requestAnimationFrame(wait);
        }
        wait();
    });
}

async function mainMachineInstantiated() {
    let t0 = performance.now();
    return new Promise((resolve) => {
        let wait = () => {
            if (Game) {
                if (Game.Instance) {
                    if (Game.Instance.machine) {
                        if (Game.Instance.machine.ready && Game.Instance.machine.instantiated) {
                            let t = performance.now();
                            let t_wait_this_step = (t - t0);
                            let t_since_start = (t - THE_ORIGIN_OF_TIME_ms);
                            console.log("machine instantiated at " + t_since_start.toFixed(3) + " ms. (in " + t_wait_this_step.toFixed(3) + " ms)");
                            resolve();
                            return;
                        }
                    }
                }
            }
            requestAnimationFrame(wait);
        }
        wait();
    });
}

var steps = []

function setProgressIndex(i) {
    let t = performance.now();
    let t_since_start = (t - THE_ORIGIN_OF_TIME_ms);
    real_progress = steps[i];
    next_progress = steps[i + 1];
    observed_progress_speed_percent_second = real_progress / (t_since_start / 1000);
}

function loadStep() {
    if (real_progress < 1) {
        displayed_progress = real_progress;

        document.querySelector("#click-anywhere-screen .white-track").style.opacity = displayed_progress;
        document.querySelector("#click-anywhere-screen .message-bottom").innerHTML = "loading... " + (displayed_progress * 100).toFixed(0) + "%";
        requestAnimationFrame(loadStep);
    }
    else {
        document.querySelector("#click-anywhere-screen .white-track").style.opacity = "1";
        document.querySelector("#click-anywhere-screen .message-bottom").innerHTML = "Click or press anywhere to Enter";
    }
}

async function doLoad() {
    let pIndex = 0;
    let stepsCount = 9;
    steps = [];
    for (let i = 0; i <= stepsCount; i++) {
        steps[i] = i / stepsCount;
    }
    setProgressIndex(pIndex++);
    updateLoadingText();
    loadStep();
    
    await loadCSS("./styles/fonts.css");
    setProgressIndex(pIndex++);
    await loadCSS("./styles/app.css");
    setProgressIndex(pIndex++);
    if (USE_POKI_SDK) {
        await loadScript("https://game-cdn.poki.com/scripts/v2/poki-sdk.js");
    }
    setProgressIndex(pIndex++);
    await loadScript("./lib/babylon.js");
    setProgressIndex(pIndex++);
    await loadScript("./lib/babylonjs.loaders.js");
    setProgressIndex(pIndex++);
    await loadScript("./lib/nabu/nabu.js");
    setProgressIndex(pIndex++);
    await loadScript("./lib/mummu/mummu.js");
    setProgressIndex(pIndex++);
    await loadScript("./fluid-x.js");
    setProgressIndex(pIndex++);
    await gameLoaded();
    setProgressIndex(pIndex++);
}

function updateLoadingText() {
    let d = 250;
    let text = "> " + loadingTexts[Math.floor(Math.random() * loadingTexts.length)];
    let e = document.getElementById("loading-info");
    e.innerText = text;
    if (real_progress < 1) {
        setTimeout(() => {
            text += ".";
            e.innerText = text;
            setTimeout(() => {
                text += ".";
                e.innerText = text;
                setTimeout(() => {
                    text += ".";
                    e.innerText = text;
                    setTimeout(() => {
                        updateLoadingText();
                    }, d);
                }, d);
            }, d);
        }, d);
    }
    else {
        e.innerText = "";
    }
}

window.addEventListener("DOMContentLoaded", async () => {
    THE_ORIGIN_OF_TIME_ms = performance.now();
    last_step_t = THE_ORIGIN_OF_TIME_ms;
    doLoad();
});

const loadingTexts = [
    "computing g 7th digit",
    "waiting for wikipedia 'Isaac Newton' page to load",
    "implementing CNRS latest researches on point dynamic",
    "recalculating Pi 56th decimal",
    "calibrating pixels #3, #71, #99 and #204",
    "baking lightmaps temp 7",
    "indexing the vertices by size",
    "verticing the indexes by color",
    "checking procedural generation procedures",
    "running 1 (one) unitary unit test",
    "please do not touch screen while loading",
    "initializing the initializer",
    "managing master manager disposal",
    "thanking user for his patience",
    "waiting for loading screen to update",
    "updating loading screen offscreen features",
    "running last minute bug removal script",
    "cleaning up unused assets at runtime",
    "cleaning up unused assets at runtime",
    "pretending to do something useful",
    "allowing the loader to take a short break"
]