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

  it("handles list and title helpers defensively", () => {
    const eleventyConfig = createEleventyConfig();
    filters.registerFilters(eleventyConfig);

    expect(eleventyConfig.registeredFilters.limit([1, 2, 3], 2)).toEqual([1, 2]);
    expect(eleventyConfig.registeredFilters.limit(null, 2)).toEqual([]);
    expect(eleventyConfig.registeredFilters.titleCase("hello world")).toBe("Hello World");
    expect(eleventyConfig.registeredFilters.titleCase("")).toBe("");
  });

  it("creates URL-safe slugs for mixed-language tags", () => {
    const eleventyConfig = createEleventyConfig();
    filters.registerFilters(eleventyConfig);

    expect(eleventyConfig.registeredFilters.tagSlug("React Hooks")).toBe("react-hooks");
    expect(eleventyConfig.registeredFilters.tagSlug("技术/随笔")).toBe("技术-随笔");
    expect(eleventyConfig.registeredFilters.tagSlug("  DevOps + Docker  ")).toBe("devops-docker");
    expect(eleventyConfig.registeredFilters.tagSlug(null)).toBe("");
  });
});
