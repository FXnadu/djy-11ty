(function () {
  const countTarget = document.getElementById('comment-count');
  const widgetRoot = document.getElementById('dwx-comment');
  if (!countTarget || !widgetRoot) return;

  const source = widgetRoot.querySelector('.lc-count');
  if (!source) return;

  // 隐藏组件自带的计数，统一由页面标题处显示
  source.style.display = 'none';

  function sync() {
    const t = source.textContent.trim();
    // 元素可能已渲染但内容尚未通过异步请求填充，此时不同步
    if (t) countTarget.textContent = t;
  }

  sync();

  // 持续同步：提交评论后组件会本地 +1（假性计数，待审核），
  // 若只在初始化时同步一次，页头数量不变会被用户察觉
  const observer = new MutationObserver(sync);
  observer.observe(source, { childList: true, characterData: true, subtree: true });
})();
