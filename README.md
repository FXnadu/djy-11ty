# DJY 11ty

DJY is an Eleventy static site. The project keeps Eleventy setup, content, templates, and static assets separated so the site can grow without turning the root config into a catch-all file.

## Commands

- `npm install`: install dependencies.
- `npm start`: run the Eleventy dev server.
- `npm run clean`: remove generated output.
- `SITE_URL=https://example.com npm run build`: build with a production site URL.
- `npm run build`: build the site into `_site`.
- `npm test`: run Vitest coverage for shared config and plugins.

## Structure

One Eleventy build produces two sites: the main personal site and the writing sub-site, which is built under `writing/` and keeps its own layouts, partials, stylesheets, and scripts.

- `eleventy.config.js`: Eleventy entry point. It wires plugins, Markdown settings, passthrough copy, collections, and filters.
- `eleventy/config/`: small configuration modules for collections, filters, passthrough paths, and site identity. `eleventy/config/filters/` holds the individual filter modules.
- `eleventy/plugins/`: local Markdown plugins.
- `scripts/`: build-time helpers that generate self-hosted fonts and pre-render Mermaid diagrams.
- `src/_data/`: global site data used by templates. `siteConfig.js` covers the main site, `writingConfig.js` the writing sub-site.
- `src/_includes/layouts/` and `src/_includes/partials/`: layouts and reusable fragments for the main site, such as the document head, header, footer, and SEO tags.
- `src/_includes/components/`: template macros shared by pages, such as photo media items and the lightbox.
- `src/_includes/writing/`: layouts and partials for the writing sub-site.
- `src/content/pages/`: standalone pages for the main site.
- `src/content/photos/`: one Markdown file per photography year, feeding the `photoYears` collection.
- `src/content/writing/`: the writing sub-site's home, tag, year, and gene pages, plus `src/content/writing/posts/` for long-form posts.
- `src/assets/css/`: stylesheets. `base.css` and `shared.css` are loaded by both sites, `components.css` and `pages.css` carry main-site rules, `writing/` holds the sub-site stylesheets, and `photography*.css` styles the photo pages.
- `src/assets/js/`: browser scripts, with `photography/` and `writing/` scoped to their sections.
- `src/assets/fonts/` and `src/assets/vendor/`: self-hosted font files and vendored third-party libraries.
- `src/static/`: static files copied to the site root.
- `tests/`: unit tests for reusable Eleventy config and local Markdown plugins.

## Content Notes

- Posts inherit their writing layout and the `post` tag from `src/content/writing/posts/posts.11tydata.js`, which also derives a date-based permalink such as `/writing/posts/20260327/`; posts sharing a day get an incrementing suffix.
- Photography year files set `permalink: false` in `src/content/photos/photos.11tydata.js`, so they produce no standalone pages and render through the `photoYears` collection on the shutter page.
- Use `tags: [post, ...]` for posts. The base `post` tag is excluded from public tag lists.
- Tag URLs use ASCII slugs: plain ASCII tags normalize on the fly, while tags with non-ASCII characters must be registered in `eleventy/config/tag-slugs.js`. An unregistered tag fails the build.
- Numeric tags are treated as year-like tags in the gene views.
- Dates should use `YYYY-MM-DD` in front matter.
- Mermaid is loaded from the local `mermaid` npm package output, not a runtime CDN.
- Fonts are generated from `@fontsource/inter` into `src/assets/fonts/`, with the matching `@font-face` declarations written to `src/assets/css/fonts.css`. Chinese text falls back to the system font stack.

## Deployment Notes

- Set `SITE_URL` in the deployment environment so `src/_data/siteConfig.js` can expose the canonical site URL.
- Only expose environment variables through the explicit whitelist in `eleventy.config.js`.
- `_site/` is generated output, is cleaned before each build, and should not be edited directly.
