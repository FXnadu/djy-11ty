// 过滤器聚合入口：具体实现按职责拆到 ./filters/ 下的模块，这里只负责统一注册
const dates = require("./filters/dates");
const slug = require("./filters/slug");
const arrays = require("./filters/arrays");
const ossImage = require("./filters/oss-image");
const jsonLd = require("./filters/json-ld");

const filterModules = [dates, slug, arrays, ossImage, jsonLd];

module.exports = {
  registerFilters(eleventyConfig) {
    filterModules.forEach((filters) => {
      Object.entries(filters).forEach(([name, fn]) => eleventyConfig.addFilter(name, fn));
    });
  },
};
