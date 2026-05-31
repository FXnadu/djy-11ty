function stripTags(html) {
  return html.replace(/<[^>]*>/g, "");
}

function buildTOC(headings) {
  let html = '<nav class="toc" aria-label="目录">';
  html += '<p class="toc-title t-cat">目录</p>';
  html += '<ol class="toc-list">';
  for (const h of headings) {
    const cls = h.level === 3 ? "toc-item toc-sub" : "toc-item";
    html += `<li class="${cls}"><a href="#${h.id}">${stripTags(h.text)}</a></li>`;
  }
  html += "</ol></nav>";
  return html;
}

function extractHeadings(html) {
  const headings = [];
  const regex = /<h([23])(?:\s[^>]*)?id="([^"]*)"[^>]*>([\s\S]*?)<\/h[23]>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    headings.push({
      level: parseInt(match[1]),
      id: match[2],
      text: match[3],
    });
  }
  return headings;
}

function injectTOC(html, tocHtml) {
  return html.replace(
    /(<aside class="post-sidebar"[^>]*>)\s*<\/aside>/,
    "$1" + tocHtml + "</aside>"
  );
}

module.exports = {
  registerTOCTransform(eleventyConfig) {
    eleventyConfig.addTransform("toc", (content, outputPath) => {
      if (!outputPath || !outputPath.endsWith(".html")) return content;

      const postContent = content.match(/<div class="post-content">([\s\S]*?)<\/div>\s*<\/article>/);
      if (!postContent) return content;

      const headings = extractHeadings(postContent[1]);
      if (headings.length < 2) return content;

      const tocHtml = buildTOC(headings);
      return injectTOC(content, tocHtml);
    });
  },
};
