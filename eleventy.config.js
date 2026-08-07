const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const markdownItFootnote = require("markdown-it-footnote");
const markdownItGitHubAlerts = require("markdown-it-github-alerts");
const markdownItMark = require("markdown-it-mark");
const markdownItTaskLists = require("markdown-it-task-lists");
const markdownItKbd = require("markdown-it-kbd");
const markdownItDeflist = require("markdown-it-deflist");
const markdownItAbbr = require("markdown-it-abbr");
const markdownItContainer = require("markdown-it-container");
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

  // Filters
  registerFilters(eleventyConfig);

  // Markdown
  const mdLib = markdownIt({ html: true, breaks: true, linkify: true })
    .use(markdownItAnchor, {
      level: [2, 3],
      slugify: (s) => String(s).trim()
        .toLowerCase()
        .replace(/[^\w一-鿿]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    })
    .use(markdownItFootnote)
    .use(markdownItGitHubAlerts.default)
    .use(markdownItMark)
    .use(markdownItTaskLists, { enabled: true, label: true })
    .use(markdownItKbd)
    .use(markdownItDeflist)
    .use(markdownItAbbr)
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

  eleventyConfig.setLibrary("md", mdLib);

  // Watch configuration for hot reload
  eleventyConfig.setWatchThrottleWaitTime(100);
  eleventyConfig.addWatchTarget("src/**/*.{md,njk,css,js}");

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    }
  };
};
