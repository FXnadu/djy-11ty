// 文章 URL：/writing/posts/{{ slug }}/，例如 /writing/posts/20260327/
//
// slug 由 scripts/generate-slugs.js 生成后写回 front matter（npm start / npm run build 自动执行）。
// 之所以落在文件里而不是构建时推导，是为了让 URL 固定：
// 不随中文文件名产生百分号编码，也不因同日期文章的增删而改变。
module.exports = {
  layout: "writing/layouts/post.njk",
  tags: ["post"],
  permalink: (data) => {
    if (!data.slug) {
      throw new Error(
        `[posts] ${data.page.inputPath} 缺少 front matter: slug，请运行 npm run slugs 生成`
      );
    }
    return `/writing/posts/${data.slug}/`;
  },
};
