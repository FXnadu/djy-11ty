const { DateTime } = require("luxon");

module.exports = {
  registerFilters(eleventyConfig) {
    eleventyConfig.addFilter("dateFormat", (date, format = "yyyy-MM-dd") => {
      if (date === "now") return DateTime.now().toFormat(format);
      if (!date) return "";
      return DateTime.fromJSDate(date).toFormat(format);
    });

    eleventyConfig.addFilter("dateISO", (date) => {
      if (!date) return "";
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

    // Generate URL-safe slug for tags (supports Chinese characters)
    eleventyConfig.addFilter("tagSlug", (str) => {
      if (!str) return "";
      return str
        .toLowerCase()
        .replace(/[^\w一-鿿]+/g, "-")
        .replace(/^-+|-+$/g, "");
    });
  }
};
