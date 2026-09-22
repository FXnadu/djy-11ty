(function () {
  var header = document.querySelector('.gene-header');
  var countEl = document.getElementById('gene-count');
  var buttons = document.querySelectorAll('.gene-title-btn');
  var views = document.querySelectorAll('.gene-view');

  if (!header || !countEl || !buttons.length || !views.length) return;

  var labels = {
    tags: header.dataset.tagsLabel || '',
    years: header.dataset.yearsLabel || '',
  };

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      var viewName = button.dataset.view;
      var activeView = document.querySelector('.gene-view[data-view="' + viewName + '"]');
      if (!activeView) return;

      buttons.forEach(function (item) {
        item.classList.remove('active');
      });
      views.forEach(function (view) {
        view.classList.remove('active');
      });

      button.classList.add('active');
      activeView.classList.add('active');
      countEl.textContent = labels[viewName] || '';
    });
  });
})();
