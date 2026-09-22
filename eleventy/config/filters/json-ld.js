// JSON-LD 结构化数据（GEO：Generative Engine Optimization）
//
// Schema 设计：
//   - @id 锚点让各 schema 可互相引用，帮助 AI 构建实体关系图
//   - WebSite 出现在每个页面；BlogPosting 通过 @id 引用 Person，避免数据重复
//   - potentialAction(SearchAction) 仅在站点配置了 searchUrlTemplate 时输出，
//     否则会向搜索引擎声明一个不存在的站内搜索入口
//
// 入参：
//   data       — 页面级字段 { url, title, description, date, image, tags[] }
//   siteConfig — 站点配置（siteConfig.js / writingConfig.js）
//   isPost     — 是否文章页，由调用方判定，避免过滤器内重复推导标签语义
// 返回：可直接嵌入 <script type="application/ld+json"> 的 JSON 字符串
const POST_TAG = "post";

module.exports = {
  jsonLd(data, siteConfig, isPost = false) {
    const schemas = [];
    const baseUrl = siteConfig.url;

    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": baseUrl + "#website",
      name: siteConfig.title,
      url: baseUrl,
      description: siteConfig.description,
      inLanguage: siteConfig.language,
      author: {
        "@id": baseUrl + "#person",
      },
    };

    // 站内搜索入口：只有站点真的提供了搜索页才声明
    if (siteConfig.searchUrlTemplate) {
      websiteSchema.potentialAction = {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: baseUrl + siteConfig.searchUrlTemplate,
        },
        "query-input": "required name=search_term_string",
      };
    }

    schemas.push(websiteSchema);

    // Person schema — 首页给完整定义，其他页面通过 @id 引用
    if (data.url === "/") {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Person",
        "@id": baseUrl + "#person",
        name: siteConfig.author.name,
        url: baseUrl,
        description: siteConfig.about,
      });
    }

    if (isPost) {
      const isoDate = data.date ? new Date(data.date).toISOString() : undefined;
      const postSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "@id": baseUrl + data.url + "#article",
        headline: data.title,
        datePublished: isoDate,
        dateModified: isoDate, // 前端可加 lastModified 字段覆盖
        url: baseUrl + data.url,
        author: {
          "@id": baseUrl + "#person",
        },
        publisher: {
          "@id": baseUrl + "#person",
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": baseUrl + data.url,
        },
      };

      if (data.description) postSchema.description = data.description;
      if (data.image) postSchema.image = data.image;

      const keywords = (data.tags || []).filter((tag) => tag !== POST_TAG);
      if (keywords.length > 0) postSchema.keywords = keywords;

      // 移除值为 undefined 的字段，避免 JSON 里出现 null 噪声
      Object.keys(postSchema).forEach(
        (key) => postSchema[key] === undefined && delete postSchema[key]
      );

      schemas.push(postSchema);
    }

    return JSON.stringify(schemas.length === 1 ? schemas[0] : schemas);
  },
};
