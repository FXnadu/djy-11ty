// 阿里云 OSS 图片处理：给 OSS 外链追加缩放/压缩参数，非 OSS 地址原样返回
const OSS_IMAGE_RE = /^https?:\/\/[^/?#]+\.aliyuncs\.com\//;

function buildOssImageUrl(url, width) {
  const value = String(url || "");
  if (!value || !OSS_IMAGE_RE.test(value)) return value;

  const resizeWidth = Number(width);
  const operations = [];
  if (resizeWidth > 0) operations.push(`resize,w_${resizeWidth}`);
  operations.push("quality,q_80", "format,webp");

  const separator = value.includes("?") ? "&" : "?";
  return `${value}${separator}x-oss-process=image/${operations.join("/")}`;
}

module.exports = {
  ossImage(url, width) {
    return buildOssImageUrl(url, width);
  },

  // 生成 srcset 字符串；非 OSS 外链返回空串，模板据此跳过 srcset
  ossSrcset(url, widths) {
    const list = (Array.isArray(widths) ? widths : []).filter((width) => Number(width) > 0);
    if (list.length === 0) return "";
    if (buildOssImageUrl(url, list[0]) === String(url || "")) return "";

    return list
      .map((width) => `${buildOssImageUrl(url, width)} ${Number(width)}w`)
      .join(", ");
  },
};
