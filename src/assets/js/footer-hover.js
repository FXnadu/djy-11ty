(function () {
  'use strict';

  // 目标：让页脚域名翻牌只在"真实的鼠标悬停"下发生。
  // 浏览器对触屏 tap 会产生粘滞 hover，纯 CSS 的 @media (hover:hover) and (pointer:fine)
  // 无法区分"手点屏幕"与"鼠标悬停"，这里用 JS 在检测到触摸后给根元素加类，
  // 配合 CSS 的 html:not(.no-footer-hover) 关闭翻牌手势。

  var root = document.documentElement;

  function disableHover() {
    root.classList.add('no-footer-hover');
  }

  // 设备带触屏能力（含主指针为鼠标的混合触控笔电）
  var hasTouch = window.matchMedia('(any-pointer: coarse)').matches;
  if (!hasTouch) return;

  var primaryIsFine = window.matchMedia('(pointer: fine)').matches;
  var hoverOn = window.matchMedia('(hover: hover)').matches;

  if (!hoverOn || !primaryIsFine) {
    // 触屏主导设备（纯键盘/触屏）：翻牌媒体本就不命中，仍统一禁用，杜绝首个 tap 粘滞
    disableHover();
  } else {
    // 混合设备（主指针是鼠标）：等首次真实触摸后再禁用，此后手点不再误翻牌，
    // 而鼠标悬停仍正常触发。
    document.addEventListener('touchstart', disableHover, { once: true, passive: true });
  }
})();