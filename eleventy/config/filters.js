const { DateTime } = require("luxon");

module.exports = {
  registerFilters(eleventyConfig) {
    eleventyConfig.addFilter("dateFormat", (date, format = "yyyy-MM-dd") => {
      if (date === "now") return DateTime.now().toFormat(format);
      if (!date) return "";
      return DateTime.fromJSDate(date).toFormat(format);
    });

    eleventyConfig.addFilter("dateISO", (date) => {
      if (date === "now") return DateTime.now().toISODate();
      if (!date) return "";
      return DateTime.fromJSDate(date).toISODate();
    });

    eleventyConfig.addFilter("titleCase", (str) => {
      if (!str) return "";
      return str.replace(/\b\w/g, (c) => c.toUpperCase());
    });

    eleventyConfig.addFilter("limit", (array, limit) => {
      if (!Array.isArray(array)) return [];
      return array.slice(0, limit);
    });

    eleventyConfig.addFilter("paginateSlice", (array, pageNumber, pageSize) => {
      if (!Array.isArray(array)) return [];
      const start = pageNumber * pageSize;
      return array.slice(start, start + pageSize);
    });

    // Generate URL-safe slug for tags (supports Chinese characters)
    eleventyConfig.addFilter("tagSlug", (str) => {
      if (!str) return "";
      return str
        .toLowerCase()
        .replace(/[^\w一-鿿]+/g, "-")
        .replace(/^-+|-+$/g, "");
    });

    // Generate JSON-LD structured data for GEO (Generative Engine Optimization)
    // data: { url, title, description, date, image, tags[] } — page-level SEO fields
    // siteConfig: global site configuration
    // Returns a JSON string safe for embedding in <script type="application/ld+json">
    //
    // Schema design:
    //   - @id anchors enable cross-referencing between schemas (AI builds entity graph)
    //   - WebSite.potentialAction: SearchAction triggers Google Sitelinks search box
    //   - BlogPosting references Person via @id to avoid data duplication
    //   - dateModified: set to same as datePublished if not explicitly provided
    eleventyConfig.addFilter("jsonLd", (data, siteConfig) => {
      const schemas = [];
      const baseUrl = siteConfig.url;

      // WebSite schema — present on every page
      schemas.push({
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
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: baseUrl + "/gene/?q={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      });

      // Person schema — on homepage, full definition; elsewhere referenced by @id
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

      // BlogPosting schema — detected by "post" tag (set in posts.11tydata.js)
      const isPost = Array.isArray(data.tags) && data.tags.includes("post");
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

        if (data.description) {
          postSchema.description = data.description;
        }

        if (data.image) {
          postSchema.image = data.image;
        }

        const keywords = (data.tags || []).filter((t) => t !== "post");
        if (keywords.length > 0) {
          postSchema.keywords = keywords;
        }

        // Remove undefined fields
        Object.keys(postSchema).forEach(
          (key) => postSchema[key] === undefined && delete postSchema[key]
        );

        schemas.push(postSchema);
      }

      return JSON.stringify(schemas.length === 1 ? schemas[0] : schemas);
    });
  }
};
