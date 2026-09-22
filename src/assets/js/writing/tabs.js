// Tab switching
(function () {
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".tab-btn");
    if (!btn) return;

    var group = btn.closest(".tab-group");
    var idx = btn.getAttribute("data-tab");

    // Update buttons
    group.querySelectorAll(".tab-btn").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-tab") === idx);
    });

    // Update panels
    group.querySelectorAll(".tab-panel").forEach(function (p) {
      p.classList.toggle("active", p.getAttribute("data-tab") === idx);
    });
  });
})();
