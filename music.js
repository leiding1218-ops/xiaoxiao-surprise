/* Shared music for the collection and every independent work. No external services. */
(function () {
  'use strict';
  if (window.XiaoxiaoMusic) return;
  var base = new URL('.', document.currentScript.src);
  var audio = new Audio(new URL('assets/soft-evening.mp3', base).href);
  audio.loop = true;
  audio.preload = 'none';
  audio.volume = 0.45;
  audio.setAttribute('playsinline', '');
  var manuallyPaused = false, pending = false;
  var panel = document.createElement('aside');
  panel.id = 'xx-music-panel';
  panel.setAttribute('aria-label', '背景音乐');
  panel.innerHTML = '<button type="button" id="xx-music-toggle" aria-pressed="false">♫ 点我听音乐</button><p id="xx-music-note" role="status" aria-live="polite">轻柔纯音乐 · 点一下，陪你慢慢看</p>';
  var style = document.createElement('style');
  style.textContent = '#xx-music-panel{position:relative;z-index:15;display:block;width:min(100%,360px);margin:18px auto 26px;padding:14px 16px;border:1px solid #ddc7bf;border-radius:20px;background:#fffaf5;color:#6b4d54;text-align:center;box-sizing:border-box;font-family:-apple-system,"PingFang SC",sans-serif}#xx-music-panel #xx-music-toggle{display:block;width:100%;min-height:46px;margin:0;padding:12px 16px;border:0;border-radius:24px;background:#875c70;color:#fff;font:500 15px/1.4 -apple-system,"PingFang SC",sans-serif;cursor:pointer;box-shadow:none;touch-action:manipulation}#xx-music-panel #xx-music-toggle:focus-visible{outline:3px solid #bd8c9b;outline-offset:4px}#xx-music-panel #xx-music-note{margin:8px 0 0;font-size:12px;line-height:1.7;color:#80656c}';
  document.head.appendChild(style);
  var main = document.querySelector('main') || document.body;
  var first = main.firstElementChild;
  if (first && first.tagName === 'A') first.insertAdjacentElement('afterend', panel);
  else main.insertBefore(panel, main.firstChild);
  var button = document.getElementById('xx-music-toggle');
  var note = document.getElementById('xx-music-note');
  function render() {
    var playing = !audio.paused;
    button.textContent = playing ? 'Ⅱ 暂停音乐' : '♫ 点我听音乐';
    button.setAttribute('aria-pressed', String(playing));
    window.dispatchEvent(new CustomEvent('xiaoxiao:music', {detail: {playing: playing}}));
  }
  function start() {
    if (pending || !audio.paused) return;
    pending = true;
    note.textContent = '音乐准备中…';
    var result;
    try { result = audio.play(); } catch (error) { failed(error); return; }
    if (result && result.then) result.then(function () {pending = false; render();}, failed);
    else {pending = false; render();}
  }
  function failed(error) {
    pending = false;
    render();
    note.textContent = error && error.name === 'NotAllowedError' ? '请再点一次播放，开启今天的温柔旋律' : '音乐暂时没加载好，点按钮再试一次';
  }
  button.addEventListener('click', function (event) {
    event.stopPropagation();
    if (pending) return;
    if (audio.paused) {manuallyPaused = false; start();}
    else {manuallyPaused = true; audio.pause();}
  });
  // A real tap on a work's interaction is also a deliberate way to begin music.
  document.addEventListener('click', function (event) {
    var target = event.target.closest && event.target.closest('button');
    if (target && target !== button && !manuallyPaused) start();
  });
  audio.addEventListener('playing', function () {pending = false; note.textContent = '正在播放 · 晚风轻轻，想念慢慢'; render();});
  audio.addEventListener('pause', function () {pending = false; note.textContent = '音乐已暂停 · 点一下继续听'; render();});
  audio.addEventListener('error', function () {failed();});
  // Do not play unexpectedly when the user returns from another app.
  document.addEventListener('visibilitychange', function () {if (document.hidden) audio.pause();});
  window.addEventListener('pagehide', function () {audio.pause();});
  window.XiaoxiaoMusic = {play: start, pause: function () {manuallyPaused = true; audio.pause();}};
})();
