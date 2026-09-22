// 标签 → URL 段 /writing/gene/<slug>/。
//
// 纯 ASCII 标签就地归一化（React Hooks → react-hooks）；
// 含非 ASCII 字符的标签必须在 ../tag-slugs.js 中显式登记，
// 保证 URL 全 ASCII、且同一标签永远得到同一个地址。
const tagSlugs = require("../tag-slugs");

const toAsciiSlug = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

module.exports = {
  tagSlug(str) {
    if (!str) return "";

    const raw = String(str).trim();
    if (!raw) return "";
    if (/^[\x20-\x7e]+$/.test(raw)) return toAsciiSlug(raw);

    const mapped = tagSlugs[raw];
    if (!mapped) {
      throw new Error(
        `[tagSlug] 标签「${raw}」缺少 ASCII 映射，请在 eleventy/config/tag-slugs.js 中登记`
      );
    }
    return mapped;
  },
};
