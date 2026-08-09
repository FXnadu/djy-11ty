// 标题入场动画：页面加载时先播放一次「thinking...」思考渐隐，再进入「渐入乱码 → 全乱码 → 从左到右缓慢解码恢复」，结束后定格原文
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

  // 每次会话首次完整播放；同一会话内刷新/返回直接显示原文
  var PLAYED_KEY = 'hero-anim-played';
  var playedOnce = false;
  try { playedOnce = sessionStorage.getItem(PLAYED_KEY) === '1'; } catch (e) {}

  // 时间轴（秒），只播放一次
  var T_FADE_IN_END = 0.5;     // 0~0.5s：thinking 淡入
  var T_FADE_OUT_START = 5.3;  // 0.5~5.3s：省略号持续循环思考（约 3 轮）；5.3s 起淡出
  var T_SCRAMBLE_END = 5.9;    // 5.3~5.9s：thinking 淡出 → 乱码淡入 交叉过渡
  var T_FULL_END = 6.3;        // 5.9~6.3s：全乱码保持
  var T_DECODE_END = 11.3;     // 6.3~11.3s：从左到右解码恢复

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

  // thinking 阶段：省略号 0→3 持续循环，模拟「AI 思考中」（类似 ChatGPT/DeepSeek 的加载动画）
  function thinkingState(t) {
    // 每 0.3s 增加一个点，到 3 个点后清空重来，周而复始
    var dots = Math.floor(t * (10 / 3)) % 4;
    return {
      text: 'thinking' + new Array(dots + 1).join('.'),
      dots: dots
    };
  }

  var lastText = null;
  var SHINE_CLASS = 'hero-heading--shine';
  var shineOn = false;

  // 背景 ASCII 画布：thinking 阶段隐藏，结束后淡入出现（营造「思考完才开始生成画面」的感觉）
  var heroCanvas = document.querySelector('.home-hero-split canvas.ascii-bg');
  var HIDE_CANVAS = 'is-hidden';
  var canvasHidden = false;

  function hideCanvas() {
    if (heroCanvas && !canvasHidden) {
      canvasHidden = true;
      heroCanvas.classList.add(HIDE_CANVAS);
      heroCanvas.style.opacity = '0';  // 内联覆盖 .js 默认隐藏，确保隐藏态稳定
    }
  }

  function showCanvas() {
    if (heroCanvas && canvasHidden) {
      canvasHidden = false;
      heroCanvas.classList.remove(HIDE_CANVAS);
      // 内联覆盖 .js 默认隐藏（opacity: 0），触发 CSS transition 淡入
      heroCanvas.style.opacity = '0.4';
    }
  }

  // 光带从左到右扫过，每 2 个省略号周期（约 2.4s）扫一遍。
  // position 限制在 100%→0% 之间：保证渐变始终覆盖文字，
  // 否则 background-clip:text 下文字会在扫描后半段变透明消失
  function sheenPosition(t) {
    var p = (t / 2.4) % 1;
    var pos = 100 - 100 * p;
    return pos.toFixed(1) + '% 0';
  }

  function render(now) {
    var t = (now - t0) / 1000;
    var done = t >= T_DECODE_END;

    if (done) {
      // 动画结束，定格原文并停止渲染
      if (shineOn) { shineOn = false; heading.classList.remove(SHINE_CLASS); }
      heading.style.backgroundPosition = '';
      heading.style.opacity = '1';
      textNode.data = ORIGINAL;
      if (!playedOnce) {
        playedOnce = true;
        try { sessionStorage.setItem(PLAYED_KEY, '1'); } catch (e) {}
      }
      raf = 0;
      return;
    }

    if (!reduced) raf = requestAnimationFrame(render);

    var i, s;

    if (t < T_FADE_OUT_START) {
      // —— thinking 阶段：整体淡入，省略号循环 + 光带匀速扫过 + 亮度随点数呼吸 ——
      if (!shineOn) { shineOn = true; heading.classList.add(SHINE_CLASS); }
      var state = thinkingState(t);
      var fade = clamp01(t / T_FADE_IN_END);
      heading.style.opacity = String(fade.toFixed(3)); // 恒定亮度，保证省略号节奏均匀
      heading.style.backgroundPosition = sheenPosition(t);
      s = state.text;
      if (s !== lastText) {
        lastText = s;
        textNode.data = s;
      }
      return;
    }

    if (t < T_SCRAMBLE_END) {
      // —— 交叉过渡：thinking 淡出 → 乱码淡入，避免硬切 ——
      var cross = (t - T_FADE_OUT_START) / (T_SCRAMBLE_END - T_FADE_OUT_START);
      if (cross < 0.6) {
        heading.style.opacity = String((1 - easeInOut(cross / 0.6)).toFixed(3));
        heading.style.backgroundPosition = sheenPosition(t);
        s = thinkingState(t).text;  // 文本保持连贯，仅做透明度变化
      } else {
        heading.style.opacity = String(easeInOut((cross - 0.6) / 0.4).toFixed(3));
        var arr = new Array(len);
        for (i = 0; i < len; i++) {
          arr[i] = ORIGINAL[i] === ' ' ? ' ' : randChar();
        }
        s = arr.join('');
      }
      if (s !== lastText) {
        lastText = s;
        textNode.data = s;
      }
      return;
    }

    // —— 解码恢复阶段：全乱码保持 → 从左到右缓慢还原 ——
    if (shineOn) { shineOn = false; heading.classList.remove(SHINE_CLASS); }
    showCanvas();  // thinking 已结束，背景画布淡入
    heading.style.opacity = '1';
    var resolved = 0;  // 已解码的字符数（左侧恢复原文，右侧仍乱码）
    var intensity = 0; // 乱码强度 0~1

    if (t < T_FULL_END) {
      intensity = 1;
    } else {
      var p = easeOutCubic(clamp01((t - T_FULL_END) / (T_DECODE_END - T_FULL_END)));
      resolved = Math.round(len * p);
    }

    for (i = 0; i < len; i++) {
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
    s = display.join('');
    if (s !== lastText) {
      lastText = s;
      textNode.data = s;
    }
  }

  var raf = 0;
  var t0 = 0;
  if (reduced || playedOnce) {
    // 系统减少动效或本会话已播放过：直接显示原文，画布保持可见
    heading.style.opacity = '1';
    textNode.data = ORIGINAL;
    if (heroCanvas) {
      heroCanvas.classList.remove(HIDE_CANVAS);
      heroCanvas.style.opacity = '0.4';  // 覆盖 .js 默认隐藏，直接显示画布
    }
  } else {
    // 初始隐藏：thinking 阶段背景画布不显示，结束后再淡入
    hideCanvas();
    // 初始隐藏，等待第一帧 thinking 淡入，避免闪现原文
    heading.style.opacity = '0';
    t0 = performance.now();
    raf = requestAnimationFrame(render);
  }
})();
