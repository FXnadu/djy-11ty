module.exports = {
  title: "DJY",
  description: "DJY 的个人中心 - 基于 Eleventy 构建",
  url: process.env.SITE_URL || "https://dengjunyu.com",
  language: "zh-CN",
  about: "一个热爱电影、音乐和生活的人。",

  // 作者信息（用于 JSON-LD 结构化数据）
  author: {
    name: "DJY",
    url: "https://dengjunyu.com",
  },

  // SEO 默认图片（无文章封面时的 OG 图片，留空则不输出 og:image）
  defaultImage: "",

  footer: {
    copyright: "DJY",
    poweredBy: "基于 Eleventy 构建"
  },
  contacts: [
    { name: "GitHub", value: "FXnadu", url: "https://github.com/FXnadu" },
    { name: "Blog", value: "deepwhitex.com", url: "https://deepwhitex.com" },
    { name: "Email", value: "deepwhitex@outlook.com", url: "mailto:deepwhitex@outlook.com" },
    { name: "微信", value: "deepwhitex_" },
    { name: "QQ", value: "2035083310" },
  ]
};
