module.exports = {
  registerCollections(eleventyConfig) {
    const getPosts = (collectionApi) => {
      return collectionApi.getFilteredByGlob("src/content/posts/**/*.md");
    };

    const sortByNewest = (items) => {
      return [...items].sort((a, b) => b.date - a.date);
    };

    const countPostTags = (posts) => {
      const tagCount = new Map();
      posts.forEach((item) => {
        (item.data.tags || []).forEach((tag) => {
          if (tag !== "post") tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
        });
      });
      return tagCount;
    };

    eleventyConfig.addCollection("posts", (collectionApi) => {
      return sortByNewest(getPosts(collectionApi));
    });

    eleventyConfig.addCollection("dynamics", (collectionApi) => {
      return sortByNewest(collectionApi.getFilteredByGlob("src/content/dynamics/**/*.md"));
    });

    eleventyConfig.addCollection("tagList", (collectionApi) => {
      const tagCount = countPostTags(getPosts(collectionApi));
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

    eleventyConfig.addCollection("tagCounts", (collectionApi) => {
      return Object.fromEntries(countPostTags(getPosts(collectionApi)));
    });

    eleventyConfig.addCollection("tagPages", (collectionApi) => {
      const pageSize = 16;
      const allPosts = getPosts(collectionApi);
      const tagCount = countPostTags(allPosts);
      const items = [];

      for (const [tag] of tagCount) {
        if (/^\d+$/.test(tag)) continue;
        const posts = sortByNewest(
          allPosts.filter((post) => (post.data.tags || []).includes(tag))
        );
        const totalPages = Math.ceil(posts.length / pageSize);
        for (let page = 0; page < totalPages; page++) {
          items.push({
            tag,
            total: posts.length,
            totalPages,
            page,
            posts: posts.slice(page * pageSize, (page + 1) * pageSize),
          });
        }
      }
      return items;
    });

    eleventyConfig.addCollection("yearList", (collectionApi) => {
      const yearSet = new Set();
      getPosts(collectionApi).forEach((item) => {
        const year = new Date(item.date).getFullYear();
        if (year) yearSet.add(year);
      });
      return [...yearSet].sort((a, b) => b - a);
    });

    eleventyConfig.addCollection("yearPages", (collectionApi) => {
      const pageSize = 16;
      const map = new Map();
      getPosts(collectionApi).forEach((item) => {
        const year = new Date(item.date).getFullYear();
        if (!map.has(year)) map.set(year, []);
        map.get(year).push(item);
      });
      const items = [];
      for (const [year, list] of map) {
        const sorted = sortByNewest(list);
        const totalPages = Math.ceil(sorted.length / pageSize);
        for (let page = 0; page < totalPages; page++) {
          items.push({
            year,
            total: sorted.length,
            totalPages,
            page,
            posts: sorted.slice(page * pageSize, (page + 1) * pageSize),
          });
        }
      }
      return items.sort((a, b) => b.year - a.year || b.page - a.page);
    });

    eleventyConfig.addCollection("yearCollections", (collectionApi) => {
      const map = new Map();
      getPosts(collectionApi).forEach((item) => {
        const year = new Date(item.date).getFullYear();
        if (!map.has(year)) map.set(year, []);
        map.get(year).push(item);
      });
      for (const [year, list] of map) map.set(year, sortByNewest(list));
      return map;
    });
  }
};
