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

  // Scroll spy: highlight active section (disabled — sidebar is not sticky)
  // var observer = new IntersectionObserver(function (entries) {
  //   entries.forEach(function (entry) {
  //     if (entry.isIntersecting) {
  //       links.forEach(function (l) { l.classList.remove('active'); });
  //       var active = sidebar.querySelector('a[href="#' + entry.target.id + '"]');
  //       if (active) active.classList.add('active');
  //     }
  //   });
  // }, { rootMargin: '-20% 0px -70% 0px' });
  //
  // headings.forEach(function (h) { observer.observe(h); });
})();
