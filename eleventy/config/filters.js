const { DateTime } = require("luxon");

module.exports = {
  registerFilters(eleventyConfig) {
    eleventyConfig.addFilter("dateFormat", (date, format = "yyyy-MM-dd") => {
      return DateTime.fromJSDate(date).toFormat(format);
    });

    eleventyConfig.addFilter("dateISO", (date) => {
      return DateTime.fromJSDate(date).toISODate();
    });

    eleventyConfig.addFilter("titleCase", (str) => {
      if (!str) return "";
      return str.replace(/\b\w/g, (c) => c.toUpperCase());
    });

    eleventyConfig.addFilter("limit", (array, limit) => {
      if (!Array.isArray(array)) return [];
      return array.slice(0, limit);
    });
  }
};
