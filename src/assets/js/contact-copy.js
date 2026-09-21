(function () {
  var items = document.querySelectorAll('.contact-copy');
  if (!items.length || !navigator.clipboard) return;

  items.forEach(function (el) {
    el.addEventListener('click', function () {
      navigator.clipboard.writeText(el.dataset.copy).then(function () {
        el.classList.add('copied');
        setTimeout(function () {
          el.classList.remove('copied');
        }, 1200);
      });
    });
  });
})();
