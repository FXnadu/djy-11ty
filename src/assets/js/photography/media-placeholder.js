/* 骨架屏：图片加载完成后关闭 shimmer */
export function initMediaPlaceholder(photoItems) {
  photoItems.forEach((item) => {
    const img = item.querySelector("img.photography-media");
    if (!img) return;

    if (img.complete) {
      img.classList.add("is-loaded");
      return;
    }

    const markLoaded = () => img.classList.add("is-loaded");
    img.addEventListener("load", markLoaded, { once: true });
    img.addEventListener("error", markLoaded, { once: true });
  });
}
