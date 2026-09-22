// 生成 URL 安全的 slug，保留中日韩字符
// 正则须与 eleventy.config.js 中 markdown-it-slugify 保持一致，
// 否则标签页 URL 与正文标题锚点会分叉
module.exports = {
  tagSlug(str) {
    if (!str) return "";
    return str
      .toLowerCase()
      .replace(/[^\w一-鿿]+/g, "-")
      .replace(/^-+|-+$/g, "");
  },
};
