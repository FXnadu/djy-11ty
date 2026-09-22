import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";
import markdownItTabs from "../eleventy/plugins/markdown-it-tabs.js";

describe("markdown-it-tabs", () => {
  it("renders consecutive tab blocks as one tab group", () => {
    const md = new MarkdownIt().use(markdownItTabs);
    const html = md.render(`::: tab JavaScript
console.log("hello");
:::

::: tab CSS
body { color: black; }
:::
`);

    expect(html).toContain('class="tab-group"');
    expect(html).toContain('class="tab-btn active"');
    expect(html).toContain('class="tab-panel active"');
    expect(html).toContain("JavaScript");
    expect(html).toContain("CSS");
  });

  it("falls back to normal markdown for incomplete tab blocks", () => {
    const md = new MarkdownIt().use(markdownItTabs);
    const html = md.render(`::: tab Broken
missing close marker
`);

    expect(html).not.toContain('class="tab-group"');
    expect(html).toContain("missing close marker");
  });
});
