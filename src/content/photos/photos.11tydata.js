const fs = require("node:fs");
const matter = require("gray-matter");

// 摄影年份数据：本目录下每个 md 代表一个年份分组。
// 媒体项优先取 front matter 的 media 数组，否则从正文 ![alt](src) 中提取。
// 页面由 src/content/pages/shutter.njk 通过 collections.photoYears 汇总渲染，
// 因此这里不产出独立页面（permalink: false），也不注册模板标签。

const MARKDOWN_IMAGE_RE = /!\[([^\]]*)\]\(([^\s)]+)(?:\s+["'][^"']*["'])?\)/g;
const VIDEO_EXTENSIONS = new Set(["mp4", "webm", "ogg", "ogv", "mov", "m4v"]);
const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp", "avif", "svg"]);

function getUrlExtension(src) {
  if (!src) return "";

  const cleanSrc = String(src).split(/[?#]/)[0];
  const extension = cleanSrc.split(".").pop();

  return extension ? extension.toLowerCase() : "";
}

function inferMediaType(item) {
  if (item?.type) return String(item.type).trim().toLowerCase();

  const extension = getUrlExtension(item?.src);
  if (VIDEO_EXTENSIONS.has(extension)) return "video";
  if (IMAGE_EXTENSIONS.has(extension)) return "image";

  return "image";
}

function normalizeMediaItem(item, index) {
  if (!item || typeof item !== "object") return null;

  const src = String(item.src || "").trim();
  if (!src) return null;

  const type = inferMediaType(item);
  if (type !== "image" && type !== "video") return null;

  return {
    type,
    src,
    alt: String(item.alt || item.caption || "").trim(),
    caption: String(item.caption || item.alt || "").trim(),
    poster: String(item.poster || "").trim(),
    index,
  };
}

function normalizeMediaItems(media) {
  if (!Array.isArray(media)) return [];

  return media.map((item, index) => normalizeMediaItem(item, index)).filter(Boolean);
}

function extractMarkdownImages(inputPath) {
  if (!inputPath) return [];

  try {
    const source = fs.readFileSync(inputPath, "utf8");
    const { content } = matter(source);

    return Array.from(content.matchAll(MARKDOWN_IMAGE_RE))
      .map((match, index) => ({
        type: "image",
        alt: (match[1] || "").trim(),
        caption: (match[1] || "").trim(),
        src: (match[2] || "").trim(),
        index,
      }))
      .filter((item) => item.src);
  } catch (error) {
    console.warn(`[photography] failed to parse media from ${inputPath}:`, error);
    return [];
  }
}

function getMediaItems(data) {
  const explicitMedia = normalizeMediaItems(data.media);
  if (explicitMedia.length > 0) return explicitMedia;

  return extractMarkdownImages(data.page?.inputPath);
}

function getPhotoYearLabel(data) {
  if (data.title) return String(data.title).trim();
  if (data.year) return String(data.year).trim();

  return String(data.page?.fileSlug || "摄影").trim();
}

module.exports = {
  permalink: false,
  eleventyComputed: {
    mediaItems: (data) => getMediaItems(data),
    photoYearLabel: (data) => getPhotoYearLabel(data),
  },
};
