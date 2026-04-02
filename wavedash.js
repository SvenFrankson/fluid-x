(async function () {
  // Create your game canvas

  document.getElementById('wavedash-target').innerHTML = `
    <canvas id="render-canvas"></canvas>
    <a href="#dev"><button id="dev-back-btn" class="medium-btn bluegrey" style="display: none;"><stroke-text>DEV</stroke-text></button></a>
    <default-page id="home-menu" file="home-menu.xhtml" style="display: none; opacity: 0;"></default-page>
    <default-page id="base-puzzles-page" class="page levels" file="level-page.xhtml" style="display: none; opacity: 0;"></default-page>
    <default-page id="expert-puzzles-page" class="page levels" file="level-page.xhtml" style="display: none; opacity: 0;"></default-page>
    <default-page id="xmas-puzzles-page" class="page levels" file="level-page.xhtml" style="display: none; opacity: 0;"></default-page>
    <default-page id="community-puzzles-page" class="page levels" file="level-page.xhtml" style="display: none; opacity: 0;"></default-page>
    <default-page id="dev-puzzles-page" class="page levels" file="level-page.xhtml" style="display: none; opacity: 0;"></default-page>
    <default-page id="multiplayer-puzzles-page" class="page levels" file="level-page.xhtml" style="display: none; opacity: 0;"></default-page>
    <default-page id="multiplayer-page" class="panel" file="multiplayer-page.xhtml" style="display: none; opacity: 0;"></default-page>
    <default-page id="play-ui" file="play-ui.xhtml" style="display: none; opacity: 0;"></default-page>
    <default-page id="editor-ui" file="editor-ui.xhtml" style="display: none; opacity: 0;"></default-page>
    <default-page id="credits-page" class="panel" file="credits-page.xhtml" style="display: none; opacity: 0;"></default-page>
    <default-page id="dev-page" class="panel" file="dev-page.xhtml" style="display: none; opacity: 0;"></default-page>
    <default-page id="tuto-page" class="panel" file="tuto-page.xhtml" style="display: none; opacity: 0;"></default-page>
    <default-page id="eula-page" class="panel" file="eula-page.xhtml" style="display: none; opacity: 0;"></default-page>
    <div id="click-anywhere-screen" style="touch-action: none;">
        <div id="click-anywhere-screen-container">
            <div id="click-anywhere-screen-top">
                <h1>CARILLION</h1>
            </div>
            <div id="click-anywhere-screen-mid">
                <img src="./datas/textures/splash-2.jpeg" style="opacity: 0;">
                <div id="cas-message-1" class="cas-message" style="opacity: 0;">3D Puzzle !</div>
                <div id="cas-message-2" class="cas-message" style="opacity: 0;">+40 Levels !</div>
                <div id="cas-message-3" class="cas-message" style="opacity: 0;">Level Editor !</div>
            </div>
            <div id="click-anywhere-screen-bottom">
                <div id="loading-bar-base"></div>
                <div id="loading-bar-progress"></div>
                <div id="loading-bar-text">Loading...</div>
                <div id="loading-text">Press to Start</div>
            </div>
        </div>
    </div>
    <div id="thumbnail" style="display: none;">
        <div id="thumbnail-red" class="thumbnail-rect red"></div>
        <div id="thumbnail-yellow" class="thumbnail-rect yellow"></div>
        <div id="thumbnail-blue" class="thumbnail-rect blue"></div>
        <div id="thumbnail-green" class="thumbnail-rect green"></div>
        <div id="thumbnail-title" class="lightblue"><stroke-text>CARILLION</stroke-text></div>
    </div>
  `

  await window.WavedashJS.loadScript("./index.js");
  await doLoad((step) => {
    WavedashJS.updateLoadProgressZeroToOne(step);
  });

  // Report loading progress (0 to 1)

  // Notify that loading is complete
  WavedashJS.loadComplete();
})();