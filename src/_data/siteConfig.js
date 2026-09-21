module.exports = {
  title: "dengjunyu",
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
    siteSince: 2025,
    copyrightHolder: "dengjunyu",
    license: "CC BY-NC-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
    tagline: "— Everything. Nothing. Whatever.",
    icp: "粤ICP备2025426509号-4",
    icpUrl: "https://beian.miit.gov.cn/"
  },
  contacts: [
    { name: "GitHub", value: "FXnadu", url: "https://github.com/FXnadu" },
    { name: "Blog", value: "dengjunyu.com", url: "https://dengjunyu.com" },
    { name: "Email", value: "deepwhitex@outlook.com", url: "mailto:deepwhitex@outlook.com" },
    { name: "微信", value: "deepwhitex_" },
    { name: "QQ", value: "2035083310" },
  ]
};
