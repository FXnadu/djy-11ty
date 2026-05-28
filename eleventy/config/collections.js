module.exports = {
  registerCollections(eleventyConfig) {
    eleventyConfig.addCollection("posts", (collectionApi) => {
      return collectionApi.getFilteredByGlob("src/content/posts/**/*.md")
        .sort((a, b) => b.date - a.date);
    });
  }
};
