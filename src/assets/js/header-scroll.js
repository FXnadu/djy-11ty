(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  if (!header) return;

  var lastScrollY = window.scrollY || window.pageYOffset;
  var ticking = false;
  var threshold = 80;
  var minScrollDistance = 10;

  function updateHeader() {
    var currentScrollY = window.scrollY || window.pageYOffset;
    var scrollDelta = currentScrollY - lastScrollY;

    if (Math.abs(scrollDelta) < minScrollDistance) {
      ticking = false;
      return;
    }

    if (currentScrollY < threshold) {
      header.classList.remove('is-hidden');
    } else if (scrollDelta > 0) {
      header.classList.add('is-hidden');
    } else {
      header.classList.remove('is-hidden');
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();
