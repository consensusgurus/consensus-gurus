#!/usr/bin/env node

/**
 * Generate OG preview images for all lists in data.js
 * This runs automatically during Vercel build process
 * Usage: node scripts/generate-og-images.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Import lists from data.js
const dataPath = path.join(__dirname, '../lib/data.js');
let lists = [];

try {
  // Read data.js file
  const dataContent = fs.readFileSync(dataPath, 'utf8');
  
  // Extract lists using regex
  const listPattern = /\{\s*id:\s*['"]([^'"]+)['"]/g;
  const titlePattern = /title:\s*['"]([^'"]+)['"]/;
  const aiSourcePattern = /ai:\s*\{[^}]*items:\s*\[([\s\S]*?)\]/;
  
  // Simple parser for data.js
  const listBlocks = dataContent.split(/(?=\n\s{2}\{)/);
  
  for (const block of listBlocks) {
    if (!block.includes("id:")) continue;
    
    const idMatch = block.match(/id:\s*['"]([^'"]+)['"]/);
    const titleMatch = block.match(/title:\s*['"]([^'"]+)['"]/);
    const aiMatch = block.match(/ai:\s*\{[^}]*items:\s*\[([\s\S]*?)\]/);
    
    if (idMatch && titleMatch) {
      let items = [];
      if (aiMatch) {
        const itemsText = aiMatch[1];
        const itemMatches = itemsText.match(/['"]([^'"]+)['"]/g);
        if (itemMatches) {
          items = itemMatches.map(item => item.replace(/['"]/g, '')).slice(0, 5);
        }
      }
      
      lists.push({
        id: idMatch[1],
        title: titleMatch[1],
        items: items
      });
    }
  }
  
  console.log(`Found ${lists.length} lists in data.js`);
} catch (error) {
  console.error('Error parsing data.js:', error);
  process.exit(1);
}

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

/**
 * Create OG image for a list using SVG
 */
function createListImageSVG(listId, title, items) {
  // Word wrap title
  let titleLines = [];
  if (title.length > 45) {
    const words = title.split(' ');
    let line = '';
    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      if (testLine.length > 40) {
        if (line) titleLines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line) titleLines.push(line);
  } else {
    titleLines = [title];
  }
  
  // Truncate items
  const displayItems = items.slice(0, 3).map((item, i) => ({
    num: i + 1,
    text: item.length > 65 ? item.substring(0, 65) + '...' : item
  }));
  
  // Build SVG
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .bg { fill: #f4ede0; }
      .line { stroke: #282828; stroke-width: 2; }
      .title { font-family: Georgia, serif; font-size: 56px; font-weight: bold; fill: #282828; text-anchor: middle; }
      .label { font-family: Arial, sans-serif; font-size: 22px; fill: #c0392b; }
      .item { font-family: Arial, sans-serif; font-size: 22px; fill: #282828; }
      .footer { font-family: monospace; font-size: 14px; fill: #646464; text-anchor: middle; }
    </style>
  </defs>
  
  <!-- Background -->
  <rect class="bg" width="1200" height="630"/>
  
  <!-- Top line -->
  <line class="line" x1="30" y1="40" x2="1170" y2="40"/>
  
  <!-- Title -->
  ${titleLines.map((line, i) => `<text class="title" x="600" y="${60 + i * 65}">${escapeXml(line)}</text>`).join('\n  ')}
  
  <!-- Top picks label -->
  <text class="label" x="50" y="${120 + titleLines.length * 65}">Top picks:</text>
  
  <!-- Items -->
  ${displayItems.map((item, i) => `<text class="item" x="70" y="${165 + titleLines.length * 65 + i * 35}">${item.num}. ${escapeXml(item.text)}</text>`).join('\n  ')}
  
  <!-- Bottom line -->
  <line class="line" x1="30" y1="590" x2="1170" y2="590"/>
  
  <!-- Footer -->
  <text class="footer" x="600" y="615">Ranked by Expert Consensus | Consensus Gurus</text>
</svg>`;
  
  return svg;
}

/**
 * Escape XML special characters
 */
function escapeXml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;'
  }[c]));
}

/**
 * Create homepage OG image using SVG
 */
function createHomepageImageSVG() {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .bg { fill: #f4ede0; }
      .line { stroke: #282828; stroke-width: 2; }
      .consensus { font-family: Georgia, serif; font-size: 140px; font-weight: bold; fill: #282828; text-anchor: middle; }
      .gurus { font-family: Georgia, serif; font-size: 100px; font-style: italic; fill: #c0392b; text-anchor: middle; }
      .tagline { font-family: Arial, sans-serif; font-size: 32px; fill: #282828; text-anchor: middle; }
      .descriptor { font-family: monospace; font-size: 18px; fill: #646464; text-anchor: middle; }
    </style>
  </defs>
  
  <!-- Background -->
  <rect class="bg" width="1200" height="630"/>
  
  <!-- Top line -->
  <line class="line" x1="50" y1="80" x2="1150" y2="80"/>
  
  <!-- CONSENSUS text -->
  <text class="consensus" x="600" y="230">CONSENSUS</text>
  
  <!-- gurus text (italic red) -->
  <text class="gurus" x="600" y="340">gurus</text>
  
  <!-- Tagline -->
  <text class="tagline" x="600" y="410">Top Ten Lists from Every Angle</text>
  
  <!-- Descriptor -->
  <text class="descriptor" x="600" y="470">Curated top-ten lists ranked by expert consensus</text>
  
  <!-- Bottom line -->
  <line class="line" x1="50" y1="550" x2="1150" y2="550"/>
</svg>`;
  
  return svg;
}

/**
 * Main execution
 */
async function generateImages() {
  console.log('\nGenerating OG preview images...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  // Generate homepage image
  try {
    const homepageSvg = createHomepageImageSVG();
    await sharp(Buffer.from(homepageSvg))
      .resize(1200, 630, { fit: 'contain', background: { r: 244, g: 237, b: 224 } })
      .jpeg({ quality: 95 })
      .toFile(path.join(publicDir, 'og-homepage.jpg'));
    console.log('✓ og-homepage.jpg');
    successCount++;
  } catch (error) {
    console.error('✗ og-homepage.jpg -', error.message);
    errorCount++;
  }
  
  // Generate list images
  for (const list of lists) {
    try {
      const listSvg = createListImageSVG(list.id, list.title, list.items);
      await sharp(Buffer.from(listSvg))
        .resize(1200, 630, { fit: 'contain', background: { r: 244, g: 237, b: 224 } })
        .jpeg({ quality: 95 })
        .toFile(path.join(publicDir, `og-list-${list.id}.jpg`));
      console.log(`✓ og-list-${list.id}.jpg`);
      successCount++;
    } catch (error) {
      console.error(`✗ og-list-${list.id}.jpg -`, error.message);
      errorCount++;
    }
  }
  
  console.log(`\n✓ Generated ${successCount} images`);
  if (errorCount > 0) {
    console.error(`✗ Failed to generate ${errorCount} images`);
    process.exit(1);
  }
  
  console.log(`✓ All images saved to public/\n`);
}

generateImages().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
