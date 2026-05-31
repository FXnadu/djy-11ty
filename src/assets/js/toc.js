// Auto-generate Table of Contents in sidebar from h2/h3 headings
(function () {
  const content = document.querySelector('.post-content');
  const sidebar = document.querySelector('.post-sidebar');
  if (!content || !sidebar) return;

  const headings = content.querySelectorAll('h2, h3');
  if (headings.length < 2) return;

  // Build TOC
  const toc = document.createElement('nav');
  toc.className = 'toc';
  toc.setAttribute('aria-label', '目录');

  const title = document.createElement('p');
  title.className = 'toc-title t-cat';
  title.textContent = '目录';
  toc.appendChild(title);

  const list = document.createElement('ol');
  list.className = 'toc-list';

  const links = [];

  headings.forEach(function (heading, i) {
    if (!heading.id) {
      heading.id = 'section-' + (i + 1);
    }

    const item = document.createElement('li');
    item.className = heading.tagName === 'H3' ? 'toc-item toc-sub' : 'toc-item';

    const link = document.createElement('a');
    link.href = '#' + heading.id;
    link.textContent = heading.textContent;
    links.push(link);

    item.appendChild(link);
    list.appendChild(item);
  });

  toc.appendChild(list);
  sidebar.appendChild(toc);

  // Scroll spy: highlight active section
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        setActive(entry.target.id, true);
      }
    });
  }, { rootMargin: '-80px 0px -60% 0px' });

  headings.forEach(function (h) { observer.observe(h); });

  function setActive(id, scroll) {
    links.forEach(function (l) { l.classList.remove('active'); });
    var active = sidebar.querySelector('a[href="#' + id + '"]');
    if (active) {
      active.classList.add('active');
      if (scroll) active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  // Dynamic sidebar position + edge heading detection
  var header = document.querySelector('.site-header');
  var footer = document.querySelector('.site-footer');
  var postMeta = document.querySelector('.post-meta');
  var headerHeight, initialTop;
  var ticking = false;

  function updatePositions() {
    if (window.innerWidth <= 768 || getComputedStyle(sidebar).display === 'none') return;
    headerHeight = header ? header.offsetHeight + 12 : 82;
    initialTop = postMeta ? postMeta.getBoundingClientRect().top : 200;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      if (initialTop == null) { ticking = false; return; }
      var scrollY = window.scrollY;
      var top = initialTop - scrollY;

      // Sidebar: clamp position
      if (top < headerHeight) top = headerHeight;
      if (footer) {
        var footerTop = footer.getBoundingClientRect().top;
        var sidebarBottom = top + sidebar.offsetHeight;
        if (sidebarBottom > footerTop) {
          top = footerTop - sidebar.offsetHeight - 12;
        }
      }
      sidebar.style.top = top + 'px';

      // TOC: activate first/last heading at page edges
      if (scrollY < 150 && headings.length) {
        setActive(headings[0].id, false);
      } else if ((window.innerHeight + scrollY) >= document.body.offsetHeight - 100) {
        setActive(headings[headings.length - 1].id, false);
      }

      ticking = false;
    });
  }

  updatePositions();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () {
    updatePositions();
    onScroll();
  }, { passive: true });
})();
