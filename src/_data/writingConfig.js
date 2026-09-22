const siteIdentity = require("../../eleventy/config/siteIdentity");

module.exports = {
  ...siteIdentity,

  description: "DJY 的个人中心 - 基于 Eleventy 构建",
  about: "一个热爱电影、音乐和生活的人。",

  footer: {
    ...siteIdentity.footer,

    license: "CC BY-NC-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
    tagline: "— Everything. Nothing. Whatever.",
  },
  contacts: [
    { name: "GitHub", value: "FXnadu", url: "https://github.com/FXnadu" },
    { name: "Blog", value: "dengjunyu.com", url: "https://dengjunyu.com" },
    { name: "Email", value: "deepwhitex@outlook.com", url: "mailto:deepwhitex@outlook.com" },
    { name: "微信", value: "deepwhitex_" },
    { name: "QQ", value: "2035083310" },
  ]
};
