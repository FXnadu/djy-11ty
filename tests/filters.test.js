import { describe, expect, it } from "vitest";
import filters from "../eleventy/config/filters.js";

function createEleventyConfig() {
  const registeredFilters = {};

  return {
    registeredFilters,
    addFilter(name, fn) {
      registeredFilters[name] = fn;
    },
  };
}

describe("filters", () => {
  it("formats dates for templates", () => {
    const eleventyConfig = createEleventyConfig();
    filters.registerFilters(eleventyConfig);

    const date = new Date(2025, 4, 28);

    expect(eleventyConfig.registeredFilters.dateFormat(date)).toBe("2025-05-28");
    expect(eleventyConfig.registeredFilters.dateFormat(date, "yyyy/MM/dd")).toBe("2025/05/28");
    expect(eleventyConfig.registeredFilters.dateISO(date)).toBe("2025-05-28");
    expect(eleventyConfig.registeredFilters.dateFormat(null)).toBe("");
    expect(eleventyConfig.registeredFilters.dateISO(null)).toBe("");
  });

  it("creates ASCII slugs for tags", () => {
    const eleventyConfig = createEleventyConfig();
    filters.registerFilters(eleventyConfig);
    const { tagSlug } = eleventyConfig.registeredFilters;

    expect(tagSlug("React Hooks")).toBe("react-hooks");
    expect(tagSlug("  DevOps + Docker  ")).toBe("devops-docker");
    expect(tagSlug("健康")).toBe("health");
    expect(tagSlug(null)).toBe("");
    expect(() => tagSlug("未登记的标签")).toThrow(/缺少 ASCII 映射/);
  });

  it("normalizes single values into arrays for layout injection", () => {
    const eleventyConfig = createEleventyConfig();
    filters.registerFilters(eleventyConfig);

    expect(eleventyConfig.registeredFilters.toArray("/assets/css/a.css")).toEqual(["/assets/css/a.css"]);
    expect(eleventyConfig.registeredFilters.toArray(["a", "b"])).toEqual(["a", "b"]);
    expect(eleventyConfig.registeredFilters.toArray(null)).toEqual([]);
    expect(eleventyConfig.registeredFilters.toArray("")).toEqual([]);
  });

  it("only declares a search action when the site configures one", () => {
    const eleventyConfig = createEleventyConfig();
    filters.registerFilters(eleventyConfig);
    const { jsonLd } = eleventyConfig.registeredFilters;

    const siteConfig = {
      url: "https://example.com",
      title: "Example",
      description: "站点描述",
      language: "zh-CN",
      about: "关于",
      author: { name: "作者" },
    };

    const withoutSearch = JSON.parse(jsonLd({ url: "/", title: "首页" }, siteConfig));
    const website = withoutSearch.find((schema) => schema["@type"] === "WebSite");
    expect(website.potentialAction).toBeUndefined();

    const withSearch = JSON.parse(
      jsonLd(
        { url: "/", title: "首页" },
        { ...siteConfig, searchUrlTemplate: "/search/?q={search_term_string}" }
      )
    );
    const websiteWithSearch = withSearch.find((schema) => schema["@type"] === "WebSite");
    expect(websiteWithSearch.potentialAction.target.urlTemplate).toBe(
      "https://example.com/search/?q={search_term_string}"
    );
  });

  it("builds a BlogPosting only when the caller marks the page as a post", () => {
    const eleventyConfig = createEleventyConfig();
    filters.registerFilters(eleventyConfig);
    const { jsonLd } = eleventyConfig.registeredFilters;

    const siteConfig = {
      url: "https://example.com",
      title: "Example",
      description: "站点描述",
      language: "zh-CN",
      about: "关于",
      author: { name: "作者" },
    };
    const page = { url: "/writing/demo/", title: "示例", tags: ["post", "技术"] };

    const asArticle = JSON.parse(jsonLd(page, siteConfig, true));
    const article = asArticle.find((schema) => schema["@type"] === "BlogPosting");
    expect(article.headline).toBe("示例");
    expect(article.keywords).toEqual(["技术"]);

    const asRegularPage = JSON.parse(jsonLd(page, siteConfig, false));
    expect(asRegularPage["@type"]).toBe("WebSite");
  });
});
