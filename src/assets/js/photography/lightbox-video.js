/* 灯箱视频：加载超时兜底、播放失败降级、错误提示 */
const VIDEO_LOAD_TIMEOUT = 8000;
const DEFAULT_ERROR_TEXT = "无法加载此视频";

export function createVideoController({ video, errorBox }) {
  const errorTextEl = errorBox.querySelector(".photo-lightbox-error-text");
  const errorText = errorTextEl?.textContent || DEFAULT_ERROR_TEXT;

  let loadTimeout = null;

  function clearLoadTimeout() {
    if (loadTimeout) {
      clearTimeout(loadTimeout);
      loadTimeout = null;
    }
  }

  function showError() {
    clearLoadTimeout();
    if (errorTextEl && !errorTextEl.textContent) {
      errorTextEl.textContent = errorText;
    }
    errorBox.hidden = false;
    video.style.opacity = "0.15";
  }

  function hideError() {
    clearLoadTimeout();
    errorBox.hidden = true;
    video.style.opacity = "";
  }

  function stop() {
    clearLoadTimeout();
    video.pause();
    video.currentTime = 0;
    video.muted = false;
    video.removeAttribute("src");
    video.removeAttribute("poster");
    video.load();
  }

  function play() {
    const startPlayback = () => {
      // 竞态防护：验证视频仍处于可播放状态
      if (!video.src) return;

      const playPromise = video.play();

      if (!playPromise || typeof playPromise.catch !== "function") return;

      playPromise.catch(() => {
        video.muted = true;
        const mutedPromise = video.play();
        if (mutedPromise && typeof mutedPromise.catch === "function") {
          mutedPromise.catch(() => {});
        }
      });
    };

    if (video.readyState >= 3) {
      startPlayback();
      return;
    }

    video.addEventListener("canplay", () => {
      hideError();
      startPlayback();
    }, { once: true });
  }

  // 载入视频并启动超时检测
  function load({ src, poster, alt, caption }) {
    video.muted = false;
    video.poster = poster || "";
    video.src = src;
    video.setAttribute("aria-label", alt || caption || "Video");
    video.load();

    clearLoadTimeout();
    loadTimeout = setTimeout(() => {
      if (video.readyState < 3) {
        showError();
      }
    }, VIDEO_LOAD_TIMEOUT);

    play();
  }

  video.addEventListener("error", () => {
    showError();
  });

  return { load, stop, hideError };
}
