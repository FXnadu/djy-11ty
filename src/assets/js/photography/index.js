import { initLightbox } from "./lightbox.js";
import { initMediaPlaceholder } from "./media-placeholder.js";
import { initReveal } from "./reveal.js";

function init() {
  const photoItems = Array.from(document.querySelectorAll(".photography-item"));
  if (photoItems.length === 0) return;

  initReveal(photoItems);
  initMediaPlaceholder(photoItems);
  initLightbox(photoItems);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
