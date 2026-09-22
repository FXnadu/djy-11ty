const siteIdentity = require("../../eleventy/config/siteIdentity");

module.exports = {
  ...siteIdentity,

  description: "我的互联网名片 —— 关于我、联系方式与更多",
  about: "一名地球Online玩家在月球散步",

  footer: {
    ...siteIdentity.footer,

    // 备用域名（页脚域名悬停翻牌展示）
    alternateUrl: "https://dengjunyu.cn",
    designBy: "me",
    tagline: "— Always chasing Better.",
    icp: "粤ICP备2025426509号-4",
    icpUrl: "https://beian.miit.gov.cn/"
  },
  contacts: [
    { name: "If I'm Dancing", value: "writing", url: "/writing/" },
    { name: "摄影", value: "shutter", url: "/shutter/" },
    { name: "邮箱", value: "hello@dengjunyu.com" },
    { name: "微信", value: "deepwhitex_" },
  ]
};
