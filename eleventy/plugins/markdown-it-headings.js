// markdown-it plugin: 收集 h2/h3 标题写入 env.tocHeadings，供模板直接渲染目录
// 必须在 markdown-it-anchor 之后 use，否则读不到 anchor 生成的 id
function stripTags(html) {
  return html.replace(/<[^>]*>/g, "");
}

module.exports = function markdownItHeadings(md) {
  md.core.ruler.push("collect_headings", (state) => {
    const headings = [];
    const tokens = state.tokens;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.type !== "heading_open") continue;
      if (token.tag !== "h2" && token.tag !== "h3") continue;

      const id = token.attrGet("id");
      if (!id) continue;

      const inline = tokens[i + 1];
      const html =
        inline && inline.type === "inline"
          ? state.md.renderer.renderInline(inline.children, state.md.options, state.env)
          : "";

      headings.push({
        level: token.tag === "h3" ? 3 : 2,
        id,
        text: stripTags(html),
      });
    }

    state.env.tocHeadings = headings;
  });
};
