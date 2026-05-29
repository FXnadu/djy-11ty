(function () {
  var sel = document.querySelector('.pagination .pagination-selector');
  if (!sel) return;
  var btn = sel.querySelector('.pagination-selector-btn');
  var popup = sel.querySelector('.pagination-popup');
  var backdrop = null;
  function close() {
    popup.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    if (backdrop) { backdrop.remove(); backdrop = null; }
  }
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (!popup.hidden) { close(); return; }
    popup.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    backdrop = document.createElement('div');
    backdrop.className = 'pagination-backdrop';
    document.body.appendChild(backdrop);
    backdrop.addEventListener('click', close);
  });
  popup.addEventListener('click', function (e) {
    if (e.target.closest('a')) close();
  });
})();
