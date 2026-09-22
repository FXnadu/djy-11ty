// 数组类过滤器
module.exports = {
  // 把单值归一化为数组，供布局按页面注入 extraCss / extraScripts / bodyClass 使用
  toArray(value) {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  },
};
