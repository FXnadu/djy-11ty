const { DateTime } = require("luxon");

// 日期类过滤器：统一处理 "now" 关键字与空值，避免模板里出现 null 渲染
module.exports = {
  dateFormat(date, format = "yyyy-MM-dd") {
    if (date === "now") return DateTime.now().toFormat(format);
    if (!date) return "";
    return DateTime.fromJSDate(date).toFormat(format);
  },

  dateISO(date) {
    if (date === "now") return DateTime.now().toISODate();
    if (!date) return "";
    return DateTime.fromJSDate(date).toISODate();
  },
};
