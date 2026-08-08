// ASCII canvas background animation
(function () {
  var canvases = document.querySelectorAll('canvas.ascii-bg');
  if (!canvases.length) return;

  var PALETTE = '   ...:::---+++***◦◦••▢▣';
  var CELL = 16;
  var FONT_SIZE = 13;
  // 字符图元槽位：比字形略大，预留溢出空间，绘制时多出的透明部分不影响结果
  var SLOT = FONT_SIZE + 8;

  // 缓存 CSS 变量，只读取一次
  var monoFont = null;
  function getMonoFont() {
    if (!monoFont) {
      monoFont = getComputedStyle(document.documentElement).getPropertyValue('--mono') || 'Consolas, monospace';
    }
    return monoFont;
  }

  // 按 dpr 缓存预渲染字符图元：与主画布同分辨率光栅化，每帧用 drawImage 替代 fillText
  var atlasCache = {};
  function getAtlas(dpr) {
    var atlas = atlasCache[dpr];
    if (atlas) return atlas;
    // 槽位按设备像素取整，绘制时目标尺寸用 slot/dpr，保证源/目标 1:1 无损
    // （dpr 为 1.25/1.5 等分数值时也不会被重采样或错位）
    var slotDev = Math.ceil(SLOT * dpr);
    var cv = document.createElement('canvas');
    cv.width = PALETTE.length * slotDev;
    cv.height = slotDev;
    var ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = '500 ' + FONT_SIZE + 'px ' + getMonoFont();
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgb(10,10,10)';
    for (var i = 0; i < PALETTE.length; i++) {
      ctx.fillText(PALETTE.charAt(i), i * slotDev / dpr, 0);
    }
    atlas = { canvas: cv, slot: slotDev };
    atlasCache[dpr] = atlas;
    return atlas;
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
    c.__ctx = ctx;
    c.__atlas = getAtlas(dpr);
    // 预计算与时间无关的 hypot 距离网格，避免每帧重复 sqrt
    var cols = Math.ceil(rect.width / CELL), rows = Math.ceil(rect.height / CELL);
    c.__cols = cols;
    c.__rows = rows;
    var dist = new Array(cols * rows);
    for (var r = 0; r < rows; r++) {
      for (var cc = 0; cc < cols; cc++) {
        dist[cc + r * cols] = Math.hypot(cc - cols * 0.5, r - rows * 0.5) * 0.16;
      }
    }
    c.__dist = dist;
    return true;
  }

  function draw(c, t) {
    if (!c.__ctx) return;
    var ctx = c.__ctx, w = c.__w, h = c.__h;
    var cols = c.__cols, rows = c.__rows, dist = c.__dist;
    var atlas = c.__atlas, slot = atlas.slot;
    ctx.clearRect(0, 0, w, h);
    for (var r = 0; r < rows; r++) {
      for (var cc = 0; cc < cols; cc++) {
        var n = (Math.sin(cc * 0.18 + t) + Math.sin(r * 0.24 - t * 0.7) + Math.sin((cc + r) * 0.12 + t * 0.45) + Math.sin(dist[cc + r * cols] - t * 0.55)) / 4;
        var v = (n + 1) / 2;
        if (v < 0.22) continue;
        var idx = Math.min(PALETTE.length - 1, Math.floor(v * PALETTE.length));
        if (PALETTE.charAt(idx) === ' ') continue;
        // 与原版 rgba(10,10,10, alpha.toFixed(3)) 等价的 alpha（精确到 3 位小数）
        var alpha = Math.round((0.08 + (v - 0.22) * 0.55) * 1000) / 1000;
        ctx.globalAlpha = alpha;
        ctx.drawImage(atlas.canvas, idx * slot, 0, slot, slot, cc * CELL, r * CELL, slot / c.__dpr, slot / c.__dpr);
      }
    }
    ctx.globalAlpha = 1;
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
