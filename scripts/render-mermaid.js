/**
 * Build-time Mermaid renderer
 * 
 * Finds all .mermaid divs in HTML files and renders them to SVG
 * using @mermaid-js/mermaid-cli.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SITE_DIR = path.resolve(__dirname, '..', '_site');
const TEMP_DIR = path.resolve(__dirname, '..', '.mermaid-temp');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Find all HTML files in directory recursively
 */
function findHtmlFiles(dir) {
  const results = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory() && item.name !== 'node_modules') {
      results.push(...findHtmlFiles(fullPath));
    } else if (item.isFile() && item.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  
  return results;
}

/**
 * Extract mermaid blocks from HTML content
 * Returns array of { fullMatch, code, index }
 */
function extractMermaidBlocks(html) {
  const blocks = [];
  const regex = /<div class="mermaid">([\s\S]*?)<\/div>/g;
  let match;
  
  while ((match = regex.exec(html)) !== null) {
    blocks.push({
      fullMatch: match[0],
      code: match[1].trim(),
      index: match.index
    });
  }
  
  return blocks;
}

/**
 * Render mermaid code to SVG using mmdc CLI
 */
function renderMermaid(code, index) {
  const inputFile = path.join(TEMP_DIR, `input-${index}.mmd`);
  const outputFile = path.join(TEMP_DIR, `output-${index}.svg`);
  
  // Write mermaid code to temp file
  fs.writeFileSync(inputFile, code, 'utf8');
  
  try {
    // Run mermaid-cli
    execSync(
      `npx mmdc -i "${inputFile}" -o "${outputFile}" -b transparent --quiet`,
      { 
        stdio: 'pipe',
        timeout: 30000 // 30 second timeout per diagram
      }
    );
    
    // Read generated SVG
    if (fs.existsSync(outputFile)) {
      const svg = fs.readFileSync(outputFile, 'utf8');
      return svg;
    }
  } catch (error) {
    console.warn(`Failed to render mermaid block ${index}:`, error.message);
  }
  
  return null;
}

/**
 * Process a single HTML file
 */
function processHtmlFile(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  const blocks = extractMermaidBlocks(html);
  
  if (blocks.length === 0) {
    return 0;
  }
  
  console.log(`  ${path.relative(SITE_DIR, filePath)}: ${blocks.length} mermaid block(s)`);
  
  let replaced = 0;
  
  // Process blocks in reverse order to maintain indices
  for (let i = blocks.length - 1; i >= 0; i--) {
    const block = blocks[i];
    const svg = renderMermaid(block.code, i);
    
    if (svg) {
      // Wrap SVG in a div for styling consistency
      const wrappedSvg = `<div class="mermaid-rendered">${svg}</div>`;
      html = html.slice(0, block.index) + wrappedSvg + html.slice(block.index + block.fullMatch.length);
      replaced++;
    }
  }
  
  if (replaced > 0) {
    fs.writeFileSync(filePath, html, 'utf8');
  }
  
  return replaced;
}

/**
 * Main function
 */
function main() {
  console.log('🎨 Rendering Mermaid diagrams...\n');
  
  const htmlFiles = findHtmlFiles(SITE_DIR);
  console.log(`Found ${htmlFiles.length} HTML file(s)\n`);
  
  let totalBlocks = 0;
  let totalRendered = 0;
  let filesWithMermaid = 0;
  
  for (const file of htmlFiles) {
    const rendered = processHtmlFile(file);
    if (rendered > 0) {
      filesWithMermaid++;
      totalRendered += rendered;
    }
  }
  
  // Clean up temp directory
  try {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  } catch (e) {
    // Ignore cleanup errors
  }
  
  console.log(`\n✅ Done! Rendered ${totalRendered} diagram(s) in ${filesWithMermaid} file(s)`);
}

main();
