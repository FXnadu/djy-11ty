(function () {
  // 地址带 #comment-N（邮件回复通知链接）时，等目标评论出现在 DOM 就
  // 提前打上 lc-reply-target 标记，博客侧 CSS 据此显示 "reply" 标识。
  // 为什么不用 CSS :target：fragment 目标只在页面导航那一刻解析，评论是
  // 异步渲染的，浏览器不会为后插入的元素补设 :target，所以只能等 DOM 出现。
  // 时机保证：评论渲染（含折叠展开 / 翻页）完成后、组件发起平滑滚动前
  // 或滚动途中即完成标记，滚动到位时标识已经在 —— 无需改动评论服务端。
  const m = /^#comment-(\d+)$/.exec(location.hash);
  if (!m) return;
  const id = m[1];

  let marked = false;

  function tryMark() {
    if (marked) return;
    const el = document.getElementById('comment-' + id);
    if (el && el.classList.contains('lc-comment')) {
      el.classList.add('lc-reply-target');
      marked = true;
    }
  }

  tryMark();

  // 目标评论可能尚未渲染（异步加载 / 被折叠 / 在后续页），持续观察直到出现
  if (!marked) {
    const observer = new MutationObserver(() => {
      tryMark();
      if (marked) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    // 兜底：一直没等到就不再监听
    setTimeout(() => observer.disconnect(), 20000);
  }
})();
