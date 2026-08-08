(function () {
  const widgetRoot = document.getElementById('dwx-comment');
  if (!widgetRoot) return;

  // 把排序控件从头部移到评论表单下方、评论列表上方
  function relocateSort() {
    const sortEl = widgetRoot.querySelector('.lc-sort');
    const formEl = widgetRoot.querySelector('.lc-form');
    const listEl = widgetRoot.querySelector('.lc-list');
    if (!sortEl || !formEl || !listEl) return false;
    if (sortEl.parentNode === formEl.parentNode && sortEl.compareDocumentPosition(listEl) & Node.DOCUMENT_POSITION_PRECEDING) {
      // 已在表单与列表之间（列表位于排序之后）
    } else {
      formEl.parentNode.insertBefore(sortEl, listEl);
    }
    return true;
  }

  if (relocateSort()) return;

  const observer = new MutationObserver(() => {
    if (relocateSort()) {
      observer.disconnect();
    }
  });

  observer.observe(widgetRoot, { childList: true, subtree: true });
})();
