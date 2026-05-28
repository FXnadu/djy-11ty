const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const markdownIt = require("markdown-it");
const markdownItFootnote = require("markdown-it-footnote");
const markdownItGitHubAlerts = require("markdown-it-github-alerts");
const markdownItMark = require("markdown-it-mark");
const markdownItTaskLists = require("markdown-it-task-lists");
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
    .use(markdownItTaskLists, { enabled: true, label: true });

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
