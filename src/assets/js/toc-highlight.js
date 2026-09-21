(function () {
  var sidebar = document.querySelector(".post-sidebar");
  if (!sidebar) return;
  var tocList = sidebar.querySelector(".toc-list");
  if (!tocList) return;

  var links = tocList.querySelectorAll("a");
  if (links.length < 2) return;

  var content = document.querySelector(".post-content");
  var header = document.querySelector(".site-header");
  var footer = document.querySelector(".site-footer");
  var postMeta = document.querySelector(".post-meta");
  var headerHeight, initialTop;

  function checkOverlap() {
    if (!content || window.innerWidth <= 1200) {
      sidebar.style.display = "none";
      return true;
    }
    sidebar.style.display = "";
    var contentRect = content.getBoundingClientRect();
    var sidebarRect = sidebar.getBoundingClientRect();
    if (contentRect.right > sidebarRect.left) {
      sidebar.style.display = "none";
      return true;
    }
    return false;
  }

  function updatePositions() {
    if (checkOverlap()) return;
    headerHeight = header ? header.offsetHeight + 12 : 82;
    initialTop = postMeta ? postMeta.getBoundingClientRect().top : 200;
  }

  function setActive(id) {
    for (var i = 0; i < links.length; i++) {
      links[i].classList.remove("active");
    }
    for (var i = 0; i < links.length; i++) {
      if (links[i].getAttribute("href") === "#" + id) {
        links[i].classList.add("active");
        var rect = links[i].getBoundingClientRect();
        var sidebarRect = sidebar.getBoundingClientRect();
        if (rect.top < sidebarRect.top || rect.bottom > sidebarRect.bottom) {
          sidebar.scrollTop += rect.top - sidebarRect.top - sidebarRect.height / 2;
        }
        break;
      }
    }
  }

  var currentActive = null;
  var observer = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting) {
        currentActive = entries[i].target.id;
      }
    }
    if (currentActive) {
      setActive(currentActive);
    }
  }, {
    rootMargin: "-100px 0px -70% 0px",
    threshold: 0,
  });

  var headings = [];
  for (var i = 0; i < links.length; i++) {
    var id = links[i].getAttribute("href").slice(1);
    var el = document.getElementById(id);
    if (el) {
      headings.push(el);
      observer.observe(el);
    }
  }

  function syncSidebarPosition(scrollY) {
    if (initialTop == null) return;
    var top = initialTop - scrollY;
    if (top < headerHeight) top = headerHeight;
    if (footer) {
      var footerTop = footer.getBoundingClientRect().top;
      var sidebarBottom = top + sidebar.offsetHeight;
      if (sidebarBottom > footerTop) {
        top = footerTop - sidebar.offsetHeight - 12;
      }
    }
    sidebar.style.top = top + "px";
  }

  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var scrollY = window.scrollY;
      syncSidebarPosition(scrollY);
      if (scrollY < 150 && headings.length) {
        setActive(headings[0].id);
      } else if (window.innerHeight + scrollY >= document.body.offsetHeight - 100) {
        setActive(headings[headings.length - 1].id);
      }
      ticking = false;
    });
  }

  updatePositions();
  syncSidebarPosition(window.scrollY);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () {
    updatePositions();
    syncSidebarPosition(window.scrollY);
  }, { passive: true });
})();
