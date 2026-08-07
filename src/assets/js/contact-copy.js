(function () {
  var items = document.querySelectorAll('.contact-copy');
  if (!items.length) return;

  function flashCopied(el) {
    el.classList.add('copied');
    setTimeout(function () {
      el.classList.remove('copied');
    }, 1200);
  }

  // 降级方案：Clipboard API 要求 document 聚焦（iframe/失焦时会失败），改用 execCommand('copy')
  function copyFallback(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '0';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try {
      ok = document.execCommand('copy');
    } catch (e) {
      ok = false;
    }
    document.body.removeChild(ta);
    return ok;
  }

  items.forEach(function (el) {
    el.addEventListener('click', function () {
      // 点击时先让页面获得焦点，规避 "Document is not focused"
      if (typeof window.focus === 'function') window.focus();

      var text = el.dataset.copy;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          flashCopied(el);
        }).catch(function () {
          if (copyFallback(text)) flashCopied(el);
        });
      } else if (copyFallback(text)) {
        flashCopied(el);
      }
    });
  });
})();
