(function () {
  'use strict';

  var button = document.querySelector('.back-to-top');
  if (!button) return;

  var isVisible = false;
  var ticking = false;

  function updateButton() {
    var scrollY = window.scrollY || window.pageYOffset;
    var shouldShow = scrollY > window.innerHeight;

    if (shouldShow !== isVisible) {
      isVisible = shouldShow;
      button.classList.toggle('is-visible', shouldShow);
    }

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateButton);
      ticking = true;
    }
  }

  button.addEventListener('click', function () {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  updateButton();
})();
