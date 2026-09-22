#!/usr/bin/env node
// 为缺少 slug 的文章生成 URL 段并写回 front matter。
//
// slug 形如 20260327；同一天多篇时取最小可用序号：20260327、202603271、202603272……
// 已存在的 slug（包括手写的）永不改写，所以文章的 URL 一旦生成就固定，
// 不受文件名、也不受同日期文章增删的影响。
//
// 幂等：重复执行不会有任何改动。由 npm start / npm run build 自动调用。

const fs = require("node:fs");
const path = require("node:path");
const matter = require("gray-matter");
const { DateTime } = require("luxon");

const POSTS_DIR = path.join(__dirname, "..", "src", "content", "writing", "posts");

const formatDay = (value) => {
  if (!value) return "";
  const dt = value instanceof Date ? DateTime.fromJSDate(value) : DateTime.fromISO(String(value));
  return dt.isValid ? dt.toFormat("yyyyMMdd") : "";
};

// 只在 front matter 结尾插入一行，避免 gray-matter 重新序列化时改动其他字段的格式
function insertSlug(source, slug) {
  const lines = source.split("\n");
  if (lines[0]?.trim() !== "---") return null;

  const end = lines.findIndex((line, index) => index > 0 && line.trim() === "---");
  if (end === -1) return null;

  lines.splice(end, 0, `slug: ${slug}`);
  return lines.join("\n");
}

function readPosts() {
  return fs
    .readdirSync(POSTS_DIR)
    .filter((name) => name.endsWith(".md"))
    .sort()
    .map((name) => {
      const filePath = path.join(POSTS_DIR, name);
      const source = fs.readFileSync(filePath, "utf8");
      return { name, filePath, source, data: matter(source).data };
    });
}

function main() {
  const posts = readPosts();

  // gray-matter 会把 yaml 里形如 20260327 的值解析成 number，
  // 必须统一成字符串，否则 used.has("20260327") 对已存在的 20260327(number) 恒为 false，
  // 导致同日新增文章拿到与旧文章相同的 slug。
  const used = new Set(
    posts
      .map((post) => post.data.slug)
      .filter((slug) => slug !== undefined && slug !== null)
      .map(String)
      .filter(Boolean)
  );
  let created = 0;

  for (const post of posts) {
    if (post.data.slug) continue;

    const day = formatDay(post.data.date);
    if (!day) {
      console.warn(`[slugs] 跳过 ${post.name}：front matter 缺少可解析的 date`);
      continue;
    }

    let slug = day;
    for (let i = 1; used.has(slug); i++) slug = `${day}${i}`;

    const next = insertSlug(post.source, slug);
    if (!next) {
      console.warn(`[slugs] 跳过 ${post.name}：未找到 front matter 区块`);
      continue;
    }

    fs.writeFileSync(post.filePath, next);
    used.add(slug);
    created += 1;
    console.log(`[slugs] ${post.name} -> ${slug}`);
  }

  console.log(
    created > 0 ? `[slugs] 已生成 ${created} 个 slug` : "[slugs] 所有文章都已有 slug"
  );
}

main();
