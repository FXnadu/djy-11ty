import { createVideoController } from "./lightbox-video.js";
import { createZoomController } from "./lightbox-zoom.js";

// 多列布局（column-count）下 DOM 顺序是列优先，与视觉的行优先不一致，
// 判定"同一行"的纵向容差
const ROW_TOLERANCE = 8;

const SWIPE_THRESHOLD = 50;

/* 灯箱：装配 DOM、维护条目顺序、点击/键盘/触摸导航，缩放与视频处理委托给子控制器 */
export function initLightbox(photoItems) {
  const lightbox = document.getElementById("photo-lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxVideo = document.getElementById("lightbox-video");
  const lightboxError = document.getElementById("lightbox-error");
  const closeButton = lightbox?.querySelector(".photo-lightbox-close");

  if (!lightbox || !lightboxImage || !lightboxVideo || !lightboxError || !closeButton) return;

  const imageWrapper = document.createElement("div");
  imageWrapper.className = "photo-lightbox-image-wrapper";
  lightboxImage.parentNode.insertBefore(imageWrapper, lightboxImage);
  imageWrapper.appendChild(lightboxImage);
  imageWrapper.appendChild(lightboxVideo);
  imageWrapper.appendChild(lightboxError);

  const prevButton = createNavButton("prev", "Previous photo", "15 18 9 12 15 6");
  const nextButton = createNavButton("next", "Next photo", "9 18 15 12 9 6");
  lightbox.append(prevButton, nextButton);

  const infoBar = document.createElement("div");
  infoBar.className = "photo-lightbox-info";
  infoBar.innerHTML =
    '<div class="photo-lightbox-caption"></div><div class="photo-lightbox-counter"></div>';
  lightbox.appendChild(infoBar);

  const captionElement = infoBar.querySelector(".photo-lightbox-caption");
  const counterElement = infoBar.querySelector(".photo-lightbox-counter");

  const entries = photoItems
    .map((item) => {
      const img = item.querySelector("img");
      const video = item.querySelector("video");
      const caption = item.querySelector(".photography-caption");
      const type = item.dataset.mediaType === "video" ? "video" : "image";
      const src = item.dataset.fullSrc || img?.currentSrc || img?.src || video?.currentSrc || "";

      if (!src) return null;

      return {
        element: item,
        type,
        src,
        poster: item.dataset.poster || video?.poster || "",
        alt: img?.alt || video?.getAttribute("aria-label") || "",
        caption: caption?.textContent?.trim() || img?.alt || video?.getAttribute("aria-label") || "",
      };
    })
    .filter(Boolean);

  if (entries.length === 0) return;

  let currentIndex = 0;
  let photos = [];
  let orderDirty = true;

  // 多列布局下 DOM 顺序是列优先，与视觉的行优先不一致；
  // 按元素实际坐标排序，保证灯箱计数与方向键导航跟视觉顺序一致。
  function ensurePhotos() {
    if (!orderDirty) return photos;

    photos = entries
      .map((entry) => ({ entry, rect: entry.element.getBoundingClientRect() }))
      .sort((a, b) => {
        const rowDelta = a.rect.top - b.rect.top;
        if (Math.abs(rowDelta) > ROW_TOLERANCE) return rowDelta;
        return a.rect.left - b.rect.left;
      })
      .map((wrapped) => wrapped.entry);

    orderDirty = false;

    return photos;
  }

  ensurePhotos();

  const videoController = createVideoController({
    video: lightboxVideo,
    errorBox: lightboxError,
  });

  const zoomController = createZoomController({
    container: lightbox,
    image: lightboxImage,
    isImageMode: () => photos[currentIndex]?.type === "image",
    isActive: () => lightbox.classList.contains("active"),
  });

  // 视口尺寸变化会改变分栏结果，使坐标缓存失效
  window.addEventListener(
    "resize",
    () => {
      orderDirty = true;
    },
    { passive: true }
  );

  function openEntry(entry) {
    ensurePhotos();
    const index = photos.indexOf(entry);
    open(index < 0 ? 0 : index);
  }

  entries.forEach((entry, index) => {
    const item = entry.element;

    item.style.cursor = "pointer";
    item.setAttribute("tabindex", "0");
    item.setAttribute("role", "button");
    item.setAttribute(
      "aria-label",
      entry.type === "video" ? `View video ${index + 1}` : `View photo ${index + 1}`
    );

    item.addEventListener("click", () => openEntry(entry));
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openEntry(entry);
      }
    });
  });

  closeButton.addEventListener("click", close);
  prevButton.addEventListener("click", (event) => {
    event.stopPropagation();
    move(-1);
  });
  nextButton.addEventListener("click", (event) => {
    event.stopPropagation();
    move(1);
  });

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      close();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("active")) return;

    if (event.key === "Escape") close();
    if (event.key === "ArrowLeft") move(-1);
    if (event.key === "ArrowRight") move(1);
  });

  let touchStartX = 0;
  lightbox.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.changedTouches[0]?.screenX || 0;
    },
    { passive: true }
  );

  lightbox.addEventListener(
    "touchend",
    (event) => {
      const touchEndX = event.changedTouches[0]?.screenX || 0;
      const delta = touchStartX - touchEndX;

      if (Math.abs(delta) < SWIPE_THRESHOLD) return;
      move(delta > 0 ? 1 : -1);
    },
    { passive: true }
  );

  /* ---- 核心流程 ---- */

  function open(index) {
    currentIndex = index;
    update();
    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function close() {
    lightbox.classList.remove("active");
    lightbox.classList.remove("is-video");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    videoController.stop();
    videoController.hideError();
    zoomController.reset();
  }

  function move(direction) {
    const nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= photos.length) return;

    currentIndex = nextIndex;
    update();
  }

  function update() {
    const photo = photos[currentIndex];
    if (!photo) return;

    videoController.stop();
    zoomController.reset();
    videoController.hideError();

    if (photo.type === "video") {
      lightbox.classList.add("is-video");
      lightboxImage.hidden = true;
      lightboxImage.removeAttribute("src");
      lightboxVideo.hidden = false;
      videoController.load({
        src: photo.src,
        poster: photo.poster,
        alt: photo.alt,
        caption: photo.caption,
      });
    } else {
      lightbox.classList.remove("is-video");
      lightboxVideo.hidden = true;
      lightboxImage.hidden = false;
      lightboxImage.style.opacity = "0.4";

      const preload = new window.Image();
      preload.addEventListener(
        "load",
        () => {
          // 竞态防护：预载期间用户可能已切到别的图片
          if (photos[currentIndex] !== photo) return;
          lightboxImage.src = photo.src;
          lightboxImage.alt = photo.alt;
          lightboxImage.style.opacity = "1";
        },
        { once: true }
      );
      preload.src = photo.src;
    }

    captionElement.textContent = photo.caption;
    counterElement.textContent = `${currentIndex + 1} / ${photos.length}`;
    prevButton.style.visibility = currentIndex === 0 ? "hidden" : "visible";
    nextButton.style.visibility = currentIndex === photos.length - 1 ? "hidden" : "visible";

    preloadAdjacent(currentIndex - 1);
    preloadAdjacent(currentIndex + 1);
  }

  function preloadAdjacent(index) {
    if (index < 0 || index >= photos.length) return;
    const adjacent = photos[index];

    // 视频的封面在网格里已加载压缩版，无需预取灯箱用的原图
    if (adjacent.type !== "image") return;

    const img = new window.Image();
    img.src = adjacent.src;
  }
}

function createNavButton(direction, label, points) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `photo-lightbox-nav ${direction}`;
  button.setAttribute("aria-label", label);
  button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="${points}"></polyline>
      </svg>
    `;
  return button;
}
