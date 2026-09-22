// 主站（siteConfig）与写作子站（writingConfig）共享的身份信息骨架。
// 注意：本文件位于 eleventy/config 下，不会被 11ty 当作 src/_data 的全局数据加载。
module.exports = {
  title: "dengjunyu",
  url: process.env.SITE_URL || "https://dengjunyu.com",
  language: "zh-CN",

  // 作者信息（用于 JSON-LD 结构化数据）
  author: {
    name: "DJY",
    // 固定指向规范域名，不随 SITE_URL 变化
    url: "https://dengjunyu.com",
  },

  // SEO 默认图片（无文章封面时的 OG 图片，留空则不输出 og:image）
  defaultImage: "",

  footer: {
    siteSince: 2025,
    copyrightHolder: "dengjunyu",
  },
};
