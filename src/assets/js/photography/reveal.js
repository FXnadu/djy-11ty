/* 入场动画：元素进入视口时才播放 */
export function initReveal(photoItems) {
  if (!("IntersectionObserver" in window)) {
    photoItems.forEach((item) => item.classList.add("is-revealed"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries
        .filter((entry) => entry.isIntersecting)
        .forEach((entry, index) => {
          entry.target.style.animationDelay = `${Math.min(index * 0.06, 0.36)}s`;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
    },
    { rootMargin: "0px 0px -5% 0px", threshold: 0.01 }
  );

  photoItems.forEach((item) => observer.observe(item));
}
