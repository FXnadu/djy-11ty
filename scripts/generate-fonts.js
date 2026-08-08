/**
 * Generate self-hosted fonts from @fontsource packages.
 *
 * Reads per-weight CSS from node_modules/@fontsource/{family}/{weight}.css,
 * copies woff2 files to src/assets/fonts/, and writes src/assets/css/fonts.css.
 *
 * Usage: node scripts/generate-fonts.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const FONTS_DIR = path.join(ROOT, "src", "assets", "fonts");
const CSS_OUT = path.join(ROOT, "src", "assets", "css", "fonts.css");

// 说明：中文字体（Noto Sans SC）分片过多（119 片 × 4 字重 ≈ 9.5MB），
// 且 @font-face 声明会优先于系统字体触发下载，严重影响首屏速度。
// 因此不再自托管中文字体，中文回落到系统字体栈（PingFang SC / 微软雅黑）。
const FONTS = [
  { family: "inter", weights: [200, 300, 400, 600] },
];

function parseFontFaces(cssContent) {
  const faces = [];
  const regex =
    /\/\*\s*(.+?)\s*\*\/\s*\n@font-face\s*\{([^}]+)\}/g;
  let match;
  while ((match = regex.exec(cssContent)) !== null) {
    const comment = match[1].trim();
    const block = match[2];
    const family = block.match(/font-family:\s*'([^']+)'/)?.[1];
    const style = block.match(/font-style:\s*(\w+)/)?.[1];
    const weight = block.match(/font-weight:\s*(\w+)/)?.[1];
    const woff2Match = block.match(/url\(\.\/files\/([^)]+\.woff2)\)/);
    const unicodeRange = block.match(/unicode-range:\s*(.+);/)?.[1]?.trim();

    if (family && style && weight && woff2Match && unicodeRange) {
      faces.push({
        comment,
        family,
        style,
        weight,
        woff2File: woff2Match[1],
        unicodeRange,
      });
    }
  }
  return faces;
}

/** 统计目录下字体文件的个数与总字节数 */
function getDirStats(dir) {
  if (!fs.existsSync(dir)) return { count: 0, bytes: 0 };
  const files = [];
  for (const name of fs.readdirSync(dir, { recursive: true })) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isFile()) files.push(full);
  }
  const bytes = files.reduce((sum, f) => sum + fs.statSync(f).size, 0);
  return { count: files.length, bytes };
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function run() {
  const startedAt = Date.now();
  const beforeStats = getDirStats(FONTS_DIR);
  const allFaces = [];

  for (const { family, weights } of FONTS) {
    const pkgDir = path.join(ROOT, "node_modules", "@fontsource", family);
    const outFontDir = path.join(FONTS_DIR, family);

    if (!fs.existsSync(pkgDir)) {
      console.error(`Package not found: @fontsource/${family}`);
      process.exit(1);
    }

    fs.mkdirSync(outFontDir, { recursive: true });

    for (const weight of weights) {
      const cssFile = path.join(pkgDir, `${weight}.css`);
      if (!fs.existsSync(cssFile)) {
        console.warn(`  Skip: ${family} weight ${weight} (no CSS file)`);
        continue;
      }

      const cssContent = fs.readFileSync(cssFile, "utf8");
      const faces = parseFontFaces(cssContent);

      for (const face of faces) {
        const srcPath = path.join(pkgDir, "files", face.woff2File);
        const destPath = path.join(outFontDir, face.woff2File);

        if (!fs.existsSync(srcPath)) {
          console.warn(`  Skip: missing ${face.woff2File}`);
          continue;
        }

        fs.copyFileSync(srcPath, destPath);
        allFaces.push({ ...face, dir: family, group: `${family}-${weight}` });
      }

      console.log(`  ${family}/${weight}.css → ${faces.length} faces`);
    }
  }

  // Generate CSS
  const lines = [
    "/* Self-hosted fonts generated from @fontsource packages. */",
    "",
  ];

  for (let i = 0; i < allFaces.length; i++) {
    const face = allFaces[i];
    const next = allFaces[i + 1];
    lines.push(`/* ${face.comment} */`);
    lines.push("@font-face {");
    lines.push(`  font-family: '${face.family}';`);
    lines.push(`  font-style: ${face.style};`);
    // swap：字体加载完成前先用回退字体显示，避免 FOIT（文字不可见）拖慢感知速度
    lines.push("  font-display: swap;");
    lines.push(`  font-weight: ${face.weight};`);
    lines.push(
      `  src: url('/assets/fonts/${face.dir}/${face.woff2File}') format('woff2');`
    );
    lines.push(`  unicode-range: ${face.unicodeRange};`);
    lines.push("}");
    // Blank line between blocks within the same group
    if (next && next.group === face.group) {
      lines.push("");
    }
  }

  fs.writeFileSync(CSS_OUT, lines.join("\n") + "\n", "utf8");

  const fileCount = allFaces.length;
  const fontDirCount = new Set(allFaces.map((f) => f.dir)).size;
  console.log(
    `\nDone: ${fileCount} @font-face declarations, ${fontDirCount} font families → ${path.relative(ROOT, CSS_OUT)}`
  );

  const afterStats = getDirStats(FONTS_DIR);
  const elapsed = Date.now() - startedAt;
  console.log(`耗时: ${elapsed} ms`);
  console.log(
    `字体文件（压缩前 → 压缩后）: ${beforeStats.count} 个 / ${formatBytes(
      beforeStats.bytes
    )} → ${afterStats.count} 个 / ${formatBytes(afterStats.bytes)}`
  );
}

run();
