// ASCII canvas background animation
(function () {
  var canvases = document.querySelectorAll('canvas.ascii-bg');
  if (!canvases.length) return;

  var PALETTE = '   ...:::---+++***◦◦••▢▣';
  var CELL = 16;
  var FONT_SIZE = 13;

  // 缓存 CSS 变量，只读取一次
  var monoFont = null;
  function getMonoFont() {
    if (!monoFont) {
      monoFont = getComputedStyle(document.documentElement).getPropertyValue('--mono') || 'Consolas, monospace';
    }
    return monoFont;
  }

  function setup(c) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var rect = c.getBoundingClientRect();
    if (rect.width < 4 || rect.height < 4) return false;
    c.width = Math.round(rect.width * dpr);
    c.height = Math.round(rect.height * dpr);
    c.__dpr = dpr;
    c.__w = rect.width;
    c.__h = rect.height;
    var ctx = c.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = '500 ' + FONT_SIZE + 'px ' + getMonoFont();
    ctx.textBaseline = 'top';
    c.__ctx = ctx;
    return true;
  }

  function draw(c, t) {
    if (!c.__ctx) return;
    var ctx = c.__ctx, w = c.__w, h = c.__h;
    ctx.clearRect(0, 0, w, h);
    var cols = Math.ceil(w / CELL), rows = Math.ceil(h / CELL);
    for (var r = 0; r < rows; r++) {
      for (var cc = 0; cc < cols; cc++) {
        var n = (Math.sin(cc * 0.18 + t) + Math.sin(r * 0.24 - t * 0.7) + Math.sin((cc + r) * 0.12 + t * 0.45) + Math.sin(Math.hypot(cc - cols * 0.5, r - rows * 0.5) * 0.16 - t * 0.55)) / 4;
        var v = (n + 1) / 2;
        if (v < 0.22) continue;
        var idx = Math.min(PALETTE.length - 1, Math.floor(v * PALETTE.length));
        var ch = PALETTE[idx];
        if (ch === ' ') continue;
        var alpha = 0.08 + (v - 0.22) * 0.55;
        ctx.fillStyle = 'rgba(10,10,10,' + alpha.toFixed(3) + ')';
        ctx.fillText(ch, cc * CELL, r * CELL);
      }
    }
  }

  function resizeAll() {
    canvases.forEach(setup);
  }

  var t0 = performance.now(), frame = 0, asciiRAF = 0, running = false;

  function tick(now) {
    if (!running) { asciiRAF = 0; return; }
    var t = (now - t0) / 1000 * 0.55;
    frame++;
    // 批量读取所有 canvas 的位置信息（读操作）
    var rects = [];
    canvases.forEach(function (c) {
      var parent = c.parentElement;
      rects.push(parent ? parent.getBoundingClientRect() : null);
    });
    // 然后再处理绘制（写操作）
    canvases.forEach(function (c, i) {
      var rect = rects[i];
      var onscreen = rect && rect.bottom > 0 && rect.top < window.innerHeight;
      if (!onscreen && (frame & 3) !== 0) return;
      draw(c, t);
    });
    asciiRAF = requestAnimationFrame(tick);
  }

  function start() {
    if (running) return;
    resizeAll();
    t0 = performance.now();
    frame = 0;
    running = true;
    asciiRAF = requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function () {
    if (pending) cancelAnimationFrame(pending);
    pending = requestAnimationFrame(resizeAll);
  }, { passive: true });
  var pending = null;

  start();
})();
