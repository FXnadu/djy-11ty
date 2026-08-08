// 标题矩阵解码入场动画：页面加载时播放一次「渐入乱码 → 全乱码 → 从左到右缓慢解码恢复」，结束后定格原文
(function () {
  'use strict';

  var heading = document.querySelector('.hero-heading');
  if (!heading) return;

  var ORIGINAL = heading.textContent;
  if (!ORIGINAL) return;

  // 复用已有的文本节点，避免每次更新都新建 DOM 文本节点
  var textNode = heading.firstChild;
  if (!textNode || textNode.nodeType !== 3) {
    textNode = document.createTextNode('');
    heading.appendChild(textNode);
  }

  var CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789<>/\\|()=+-*~^!?@';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 时间轴（秒），只播放一次
  var T_SCRAMBLE_END = 0.5;  // 0~0.5s：平滑渐入全乱码
  var T_FULL_END = 0.9;      // 0.5~0.9s：全乱码保持
  var T_DECODE_END = 6.0;    // 0.9~6.0s：从左到右解码恢复

  var len = ORIGINAL.length;
  var display = ORIGINAL.split('');
  var changeAt = new Array(len).fill(0);          // 该字符下次重掷的时间点（秒）
  var settleStart = new Array(len).fill(null);    // 解码区字符开始"稳定"的时间点

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  function randChar() {
    return CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }

  function easeInOut(v) {
    return v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2;
  }

  function easeOutCubic(v) { return 1 - Math.pow(1 - v, 3); }

  var lastText = null;

  function render(now) {
    var t = (now - t0) / 1000;
    var done = t >= T_DECODE_END;

    if (done) {
      // 动画结束，定格原文并停止渲染
      textNode.data = ORIGINAL;
      raf = 0;
      return;
    }

    if (!reduced) raf = requestAnimationFrame(render);

    var resolved = 0;  // 已解码的字符数（左侧恢复原文，右侧仍乱码）
    var intensity = 0; // 乱码强度 0~1

    if (t < T_SCRAMBLE_END) {
      intensity = easeInOut(clamp01(t / T_SCRAMBLE_END));
    } else if (t < T_FULL_END) {
      intensity = 1;
    } else {
      // 解码恢复：从左到右缓慢还原
      intensity = 1;
      var p = easeOutCubic(clamp01((t - T_FULL_END) / (T_DECODE_END - T_FULL_END)));
      resolved = Math.round(len * p);
    }

    for (var i = 0; i < len; i++) {
      if (ORIGINAL[i] === ' ') { display[i] = ' '; continue; }

      if (i < resolved) {
        // 解码区：短暂闪烁几次后锁定为原文
        if (settleStart[i] === null) settleStart[i] = t;
        if (t - settleStart[i] > 0.5) {
          display[i] = ORIGINAL[i];
        } else if (Math.random() < 0.25) {
          display[i] = randChar();
        }
        continue;
      }

      settleStart[i] = null;
      if (t >= changeAt[i]) {
        // 每个字符独立的重掷节奏：150~400ms 换一个新状态
        changeAt[i] = t + 0.15 + Math.random() * 0.25;
        if (Math.random() < intensity) display[i] = randChar();
        else display[i] = ORIGINAL[i];
      }
    }

    // 文本没有变化时跳过 DOM 写入，避免无谓的大字号重排/重绘
    var s = display.join('');
    if (s !== lastText) {
      lastText = s;
      textNode.data = s;
    }
  }

  var raf = 0;
  var t0 = 0;
  if (reduced) {
    textNode.data = ORIGINAL;
  } else {
    t0 = performance.now();
    raf = requestAnimationFrame(render);
  }
})();
