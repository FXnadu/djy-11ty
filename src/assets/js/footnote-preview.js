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
      var clone = item.cloneNode(true);
      var backref = clone.querySelector('.footnote-backref');
      if (backref) backref.remove();
      tooltip.innerHTML = clone.innerHTML;
      tooltip.style.display = 'block';

      var rect = ref.getBoundingClientRect();
      tooltip.style.top = (rect.top + window.scrollY - 8) + 'px';
      tooltip.style.left = Math.max(8, rect.left + window.scrollX - 16) + 'px';
      tooltip.style.transform = 'translateY(-100%)';
    });

    ref.addEventListener('mouseleave', function () {
      tooltip.style.display = 'none';
      tooltip.style.transform = '';
    });
  });
})();
