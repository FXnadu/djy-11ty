// 文章列表分页尺寸：标签页（tagPages）与年份页（yearPages）共用
const PAGE_SIZE = 16;

const getPosts = (collectionApi) => {
  return collectionApi.getFilteredByGlob("src/content/writing/posts/**/*.md");
};

// 摄影年份分组：每个 md 代表一年，按 front matter 的 year 降序排列
const getPhotoYears = (collectionApi) => {
  return collectionApi.getFilteredByGlob("src/content/photos/*.md");
};

const sortByNewest = (items) => {
  return [...items].sort((a, b) => b.date - a.date);
};

// 纯数字标签即年份标签（写作模板借此把年份从普通标签中剥离）
const isYearTag = (tag) => /^\d+$/.test(tag);

const countPostTags = (posts) => {
  const tagCount = new Map();
  posts.forEach((item) => {
    (item.data.tags || []).forEach((tag) => {
      if (tag !== "post") tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
    });
  });
  return tagCount;
};

// 按文章日期的年份分组，返回 Map<year, posts[]>，保持首次出现顺序
const groupPostsByYear = (posts) => {
  const map = new Map();
  posts.forEach((item) => {
    const year = new Date(item.date).getFullYear();
    if (!map.has(year)) map.set(year, []);
    map.get(year).push(item);
  });
  return map;
};

// 把已排序的文章列表按 PAGE_SIZE 切片，生成带分页元数据的分页项
const buildPages = (posts, key, value) => {
  const total = posts.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const pages = [];
  for (let page = 0; page < totalPages; page++) {
    pages.push({
      [key]: value,
      total,
      totalPages,
      page,
      posts: posts.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    });
  }
  return pages;
};

module.exports = {
  registerCollections(eleventyConfig) {
    eleventyConfig.addCollection("posts", (collectionApi) => {
      return sortByNewest(getPosts(collectionApi));
    });

    eleventyConfig.addCollection("tagList", (collectionApi) => {
      const tagCount = countPostTags(getPosts(collectionApi));
      return [...tagCount.entries()]
        .filter(([tag]) => !isYearTag(tag))
        .sort((a, b) => b[1] - a[1])
        .map(([tag]) => tag);
    });

    eleventyConfig.addCollection("tagCounts", (collectionApi) => {
      return Object.fromEntries(countPostTags(getPosts(collectionApi)));
    });

    eleventyConfig.addCollection("tagPages", (collectionApi) => {
      const allPosts = getPosts(collectionApi);
      const items = [];

      for (const [tag] of countPostTags(allPosts)) {
        if (isYearTag(tag)) continue;
        const posts = sortByNewest(
          allPosts.filter((post) => (post.data.tags || []).includes(tag))
        );
        items.push(...buildPages(posts, "tag", tag));
      }
      return items;
    });

    eleventyConfig.addCollection("yearList", (collectionApi) => {
      return [...groupPostsByYear(getPosts(collectionApi)).keys()]
        .filter((year) => year)
        .sort((a, b) => b - a);
    });

    eleventyConfig.addCollection("yearPages", (collectionApi) => {
      const items = [];
      for (const [year, list] of groupPostsByYear(getPosts(collectionApi))) {
        items.push(...buildPages(sortByNewest(list), "year", year));
      }
      return items.sort((a, b) => b.year - a.year || b.page - a.page);
    });

    eleventyConfig.addCollection("photoYears", (collectionApi) => {
      return [...getPhotoYears(collectionApi)].sort((a, b) => {
        const yearA = Number(a.data.year) || 0;
        const yearB = Number(b.data.year) || 0;
        return yearB - yearA;
      });
    });

    eleventyConfig.addCollection("yearCollections", (collectionApi) => {
      const map = groupPostsByYear(getPosts(collectionApi));
      for (const [year, list] of map) map.set(year, sortByNewest(list));
      return map;
    });
  }
};
