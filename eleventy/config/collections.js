module.exports = {
  registerCollections(eleventyConfig) {
    eleventyConfig.addCollection("posts", (collectionApi) => {
      return collectionApi.getFilteredByGlob("src/content/posts/**/*.md")
        .sort((a, b) => b.date - a.date);
    });

    eleventyConfig.addCollection("dynamics", (collectionApi) => {
      return collectionApi.getFilteredByGlob("src/content/dynamics/**/*.md")
        .sort((a, b) => b.date - a.date);
    });

    // All unique topic tags (excluding "post"), split by type
    eleventyConfig.addCollection("tagList", (collectionApi) => {
      const tagCount = new Map();
      const posts = collectionApi.getFilteredByGlob("src/content/posts/**/*.md");
      posts.forEach((item) => {
        (item.data.tags || []).forEach((tag) => {
          if (tag !== "post") tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
        });
      });

      const numericTags = [];
      const textTags = [];
      for (const [tag, count] of tagCount) {
        if (/^\d+$/.test(tag)) {
          numericTags.push({ tag, count });
        } else {
          textTags.push({ tag, count });
        }
      }

      numericTags.sort((a, b) => Number(b.tag) - Number(a.tag));
      textTags.sort((a, b) => b.count - a.count);

      return {
        text: textTags.map((item) => item.tag),
        year: numericTags.map((item) => item.tag),
        all: [...numericTags, ...textTags].map((item) => item.tag),
      };
    });

    // Year list derived from post dates, plus dynamic year collections
    eleventyConfig.addCollection("yearList", (collectionApi) => {
      const posts = collectionApi.getFilteredByGlob("src/content/posts/**/*.md");
      const yearSet = new Set();
      posts.forEach((item) => {
        const year = new Date(item.date).getFullYear();
        if (year) yearSet.add(year);
      });
      return [...yearSet].sort((a, b) => b - a);
    });

    // Dynamic year collections: collections["2026"] returns posts from 2026
    eleventyConfig.addCollection("yearCollections", (collectionApi) => {
      const posts = collectionApi.getFilteredByGlob("src/content/posts/**/*.md");
      const map = new Map();
      posts.forEach((item) => {
        const year = new Date(item.date).getFullYear();
        if (!map.has(year)) map.set(year, []);
        map.get(year).push(item);
      });
      for (const [, list] of map) list.sort((a, b) => b.date - a.date);
      return map;
    });
  }
};
