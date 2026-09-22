// 中文标签 → ASCII URL 段的显式映射表。
//
// 标签页 URL 形如 /writing/gene/<slug>/，上线后不宜再改，所以这里手写登记而非自动转拼音。
// 新增中文标签时如果忘了登记，构建会直接报错（见 filters/slug.js），
// 不会静默退化成「健康」这种百分号编码的路径。
module.exports = {
  健康: "health",
  饮食: "diet",
};
