// Hover preview for footnotes
(function () {
  var refs = document.querySelectorAll('.footnote-ref a');
  if (!refs.length) return;

  var tooltip = document.createElement('div');
  tooltip.className = 'footnote-tooltip';
  tooltip.style.display = 'none';
  document.body.appendChild(tooltip);

  refs.forEach(function (ref) {
    var id = ref.getAttribute('href').replace('#', '');
    var item = document.getElementById(id);
    if (!item) return;

    ref.addEventListener('mouseenter', function () {
      // 先读取位置信息（读操作）
      var rect = ref.getBoundingClientRect();
      var scrollTop = window.scrollY;
      var scrollLeft = window.scrollX;

      // 准备 tooltip 内容
      var clone = item.cloneNode(true);
      var backref = clone.querySelector('.footnote-backref');
      if (backref) backref.remove();

      // 批量写入样式（写操作）
      tooltip.innerHTML = clone.innerHTML;
      tooltip.style.cssText = 
        'display: block; ' +
        'top: ' + (rect.top + scrollTop - 8) + 'px; ' +
        'left: ' + Math.max(8, rect.left + scrollLeft - 16) + 'px; ' +
        'transform: translateY(-100%);';
    });

    ref.addEventListener('mouseleave', function () {
      tooltip.style.display = 'none';
      tooltip.style.transform = '';
    });
  });
})();
