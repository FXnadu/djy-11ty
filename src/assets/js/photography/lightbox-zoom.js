/* 灯箱缩放与平移：滚轮缩放、拖拽平移、双击复位
   isImageMode / isActive 由调用方注入，避免本模块反向依赖灯箱状态 */
export function createZoomController({ container, image, isImageMode, isActive }) {
  const MAX_SCALE = 4;

  let scale = 1;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let translateX = 0;
  let translateY = 0;

  function updateTransform() {
    if (!isImageMode()) return;

    image.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  }

  function syncCursor() {
    image.style.cursor = scale > 1 ? "grab" : "default";
  }

  function reset() {
    scale = 1;
    translateX = 0;
    translateY = 0;
    updateTransform();
  }

  container.addEventListener("wheel", (event) => {
    if (!isActive()) return;
    if (!isImageMode()) return;

    event.preventDefault();

    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(Math.max(scale * delta, 1), MAX_SCALE);

    if (newScale !== scale) {
      scale = newScale;
      if (scale === 1) {
        translateX = 0;
        translateY = 0;
      }
      updateTransform();
    }
  }, { passive: false });

  image.addEventListener("mousedown", (event) => {
    if (!isImageMode()) return;
    if (scale <= 1) return;
    isDragging = true;
    startX = event.clientX - translateX;
    startY = event.clientY - translateY;
    image.style.cursor = "grabbing";
    event.preventDefault();
  });

  document.addEventListener("mousemove", (event) => {
    if (!isDragging) return;
    translateX = event.clientX - startX;
    translateY = event.clientY - startY;
    updateTransform();
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    syncCursor();
  });

  image.addEventListener("dblclick", () => {
    if (!isImageMode()) return;

    if (scale > 1) {
      reset();
    } else {
      scale = 2;
      updateTransform();
    }
    syncCursor();
  });

  return { reset };
}
