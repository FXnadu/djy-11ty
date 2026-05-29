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

const FONTS = [
  { family: "inter", weights: [200, 300, 400, 600] },
  { family: "noto-sans-sc", weights: [200, 300, 400, 600] },
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

function run() {
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
    lines.push("  font-display: block;");
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
}

run();
