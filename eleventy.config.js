const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const markdownIt = require("markdown-it");
const markdownItFootnote = require("markdown-it-footnote");
const markdownItGitHubAlerts = require("markdown-it-github-alerts");
const markdownItMark = require("markdown-it-mark");
const markdownItTaskLists = require("markdown-it-task-lists");
const markdownItKbd = require("markdown-it-kbd");
const markdownItDeflist = require("markdown-it-deflist");
const markdownItAbbr = require("markdown-it-abbr");
const markdownItContainer = require("markdown-it-container");
const markdownItTabs = require("./eleventy/plugins/markdown-it-tabs");
const { registerCollections } = require("./eleventy/config/collections");
const { registerFilters } = require("./eleventy/config/filters");
const { passthroughPaths } = require("./eleventy/config/passthrough");

module.exports = async function(eleventyConfig) {
  // Plugins
  eleventyConfig.addPlugin(syntaxHighlight);

  // Global data (only expose safe, non-sensitive variables)
  eleventyConfig.addGlobalData("env", {
    NODE_ENV: process.env.NODE_ENV,
  });

  // Passthrough copy
  passthroughPaths.forEach((path) => eleventyConfig.addPassthroughCopy(path));

  // Collections & Filters
  registerCollections(eleventyConfig);
  registerFilters(eleventyConfig);

  // Markdown
  const mdLib = markdownIt({ html: true, breaks: true, linkify: true })
    .use(markdownItFootnote)
    .use(markdownItGitHubAlerts.default)
    .use(markdownItMark)
    .use(markdownItTaskLists, { enabled: true, label: true })
    .use(markdownItKbd)
    .use(markdownItDeflist)
    .use(markdownItAbbr)
    .use(markdownItTabs)
    // Details/Summary blocks
    .use(markdownItContainer, "details", {
      validate: function (params) {
        return params.trim().startsWith("details");
      },
      render: function (tokens, idx) {
        var m = tokens[idx].info.trim().match(/^details\s+(.*)$/);
        if (tokens[idx].nesting === 1) {
          var title = m ? m[1] : "展开";
          return "<details><summary>" + title + "</summary>\n";
        } else {
          return "</details>\n";
        }
      }
    });

  // Custom rule: render ```mermaid code blocks as <div class="mermaid">
  // Must override AFTER syntaxhighlight plugin modifies the fence rule
  const origFence = mdLib.renderer.rules.fence;
  mdLib.renderer.rules.fence = function (tokens, idx, options, env, self) {
    if (tokens[idx].info.trim() === "mermaid") {
      return '<div class="mermaid">' + tokens[idx].content + '</div>\n';
    }
    return origFence(tokens, idx, options, env, self);
  };

  eleventyConfig.setLibrary("md", mdLib);

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    }
  };
};
