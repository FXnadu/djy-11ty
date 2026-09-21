import { describe, expect, it } from "vitest";
import collections from "../eleventy/config/collections.js";

function createEleventyConfig() {
  const registeredCollections = {};

  return {
    registeredCollections,
    addCollection(name, fn) {
      registeredCollections[name] = fn;
    },
  };
}

function createCollectionApi(posts) {
  return {
    getFilteredByGlob(glob) {
      if (glob.includes("content/posts")) return [...posts];
      return [];
    },
    getFilteredByTag(tag) {
      throw new Error(`Unexpected global tag lookup for ${tag}`);
    },
  };
}

describe("collections", () => {
  it("sorts posts by newest first", () => {
    const eleventyConfig = createEleventyConfig();
    collections.registerCollections(eleventyConfig);

    const oldPost = { date: new Date(2024, 0, 1), data: { tags: ["post"] } };
    const newPost = { date: new Date(2025, 0, 1), data: { tags: ["post"] } };
    const collectionApi = createCollectionApi([oldPost, newPost]);

    expect(eleventyConfig.registeredCollections.posts(collectionApi)).toEqual([newPost, oldPost]);
  });

  it("builds tag lists without the base post tag", () => {
    const eleventyConfig = createEleventyConfig();
    collections.registerCollections(eleventyConfig);

    const posts = [
      { date: new Date(2025, 0, 1), data: { tags: ["post", "前端", "2025"] } },
      { date: new Date(2024, 0, 1), data: { tags: ["post", "前端", "2024"] } },
      { date: new Date(2023, 0, 1), data: { tags: ["post", "生活", "2025"] } },
    ];
    const tagList = eleventyConfig.registeredCollections.tagList(createCollectionApi(posts));
    const tagCounts = eleventyConfig.registeredCollections.tagCounts(createCollectionApi(posts));

    expect(tagList).toEqual(["前端", "生活"]);
    expect(tagCounts).toEqual({ "2024": 1, "2025": 2, "前端": 2, "生活": 1 });
  });

  it("paginates non-year tag pages from posts only", () => {
    const eleventyConfig = createEleventyConfig();
    collections.registerCollections(eleventyConfig);

    const frontendPosts = Array.from({ length: 20 }, (_, index) => ({
      date: new Date(2025, 0, index + 1),
      data: { tags: ["post", "前端", "2025"] },
    }));
    const tagPages = eleventyConfig.registeredCollections.tagPages(createCollectionApi(frontendPosts));

    expect(tagPages).toHaveLength(2);
    expect(tagPages[0]).toMatchObject({ tag: "前端", page: 0, totalPages: 2, total: 20 });
    expect(tagPages[0].posts).toHaveLength(16);
    expect(tagPages[1]).toMatchObject({ tag: "前端", page: 1, totalPages: 2, total: 20 });
    expect(tagPages[1].posts).toHaveLength(4);
  });

  it("builds year collections from post dates", () => {
    const eleventyConfig = createEleventyConfig();
    collections.registerCollections(eleventyConfig);

    const posts = [
      { date: new Date(2024, 0, 1), data: { tags: ["post"] } },
      { date: new Date(2025, 0, 1), data: { tags: ["post"] } },
      { date: new Date(2025, 5, 1), data: { tags: ["post"] } },
    ];
    const collectionApi = createCollectionApi(posts);
    const yearList = eleventyConfig.registeredCollections.yearList(collectionApi);
    const yearCollections = eleventyConfig.registeredCollections.yearCollections(collectionApi);

    expect(yearList).toEqual([2025, 2024]);
    expect(yearCollections.get(2025)).toHaveLength(2);
    expect(yearCollections.get(2024)).toHaveLength(1);
  });
});
