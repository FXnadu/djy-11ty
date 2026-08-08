module.exports = {
  title: "dengjunyu",
  description: "我的互联网名片 —— 关于我、联系方式与更多",
  url: process.env.SITE_URL || "https://dengjunyu.com",
  language: "zh-CN",
  about: "一名地球Online玩家",

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

    designBy: "deepwhitex",
    tagline: "通过此域名获取我最新联系方式",
    icp: "粤ICP备2025426509号-4",
    icpUrl: "https://beian.miit.gov.cn/"
  },
  contacts: [
    { name: "GitHub", value: "FXnadu", url: "https://github.com/FXnadu" },
    { name: "Blog", value: "build...", url: "https://me.dengjunyu.com" },
    { name: "Email", value: "hello@dengjunyu.com" },
    { name: "微信", value: "deepwhitex_" },
    { name: "QQ", value: "1703452231" },
  ]
};
