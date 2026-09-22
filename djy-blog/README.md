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

- `eleventy.config.js`: Eleventy entry point. It wires plugins, Markdown settings, passthrough copy, collections, and filters.
- `eleventy/config/`: small configuration modules for collections, filters, and passthrough paths.
- `eleventy/plugins/`: local Markdown plugins.
- `src/_data/`: global site data used by templates.
- `src/_includes/layouts/`: page and post layouts.
- `src/_includes/partials/`: reusable template fragments such as the document head, header, and footer.
- `src/content/pages/`: standalone pages and generated listing pages.
- `src/content/posts/`: long-form posts.
- `src/content/dynamics/`: short updates for the dynamics feed. Items are collected but do not generate standalone pages.
- `src/assets/`: copied CSS, JavaScript, and self-hosted font assets.
- `src/static/`: static files copied to the site root.
- `tests/`: unit tests for reusable Eleventy config and local Markdown plugins.

## Content Notes

- Posts inherit defaults from `src/content/posts/posts.11tydata.js`.
- Dynamics inherit `permalink: false` from `src/content/dynamics/dynamics.11tydata.js`.
- Use `tags: [post, ...]` for posts. The base `post` tag is excluded from public tag lists.
- Numeric tags are treated as year-like tags in the gene views.
- Dates should use `YYYY-MM-DD` in front matter.
- Mermaid is loaded from the local `mermaid` npm package output, not a runtime CDN.
- Fonts are generated from `@fontsource/inter` and `@fontsource/noto-sans-sc` into `src/assets/fonts/`.

## Deployment Notes

- Set `SITE_URL` in the deployment environment so `src/_data/siteConfig.js` can expose the canonical site URL.
- Only expose environment variables through the explicit whitelist in `eleventy.config.js`.
- `_site/` is generated output, is cleaned before each build, and should not be edited directly.
