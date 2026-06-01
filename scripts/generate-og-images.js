#!/usr/bin/env node

/**
 * Generate OG preview images for all lists in data.js
 * This runs automatically during Vercel build process
 * Uses Borda scoring to compute actual Consensus for preview
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Parse data.js
const dataPath = path.join(__dirname, '../lib/data.js');
let lists = [];

try {
  const dataContent = fs.readFileSync(dataPath, 'utf8');
  const listBlocks = dataContent.split(/(?=\n\s{2}\{)/);
  
  for (const block of listBlocks) {
    if (!block.includes("id:")) continue;
    
    const idMatch = block.match(/id:\s*['"]([^'"]+)['"]/);
    const titleMatch = block.match(/title:\s*['"]([^'"]+)['"]/);
    
    if (idMatch && titleMatch) {
      const sources = {};
      const sourcePattern = /(\w+):\s*\{\s*label:\s*['"]([^'"]+)['"][^}]*items:\s*\[([\s\S]*?)\]/g;
      let sourceMatch;
      
      while ((sourceMatch = sourcePattern.exec(block)) !== null) {
        const sourceId = sourceMatch[1];
        const label = sourceMatch[2];
        const itemsText = sourceMatch[3];
        
        const items = [];
        const itemMatches = itemsText.match(/['"]([^'"]+)['"]/g);
        if (itemMatches) {
          items.push(...itemMatches.map(item => item.replace(/['"]/g, '')));
        }
        
        sources[sourceId] = { label, items };
      }
      
      lists.push({
        id: idMatch[1],
        title: titleMatch[1],
        sources: sources
      });
    }
  }
  
  console.log(`Found ${lists.length} lists in data.js`);
} catch (error) {
  console.error('Error parsing data.js:', error);
  process.exit(1);
}

/**
 * Compute Consensus ranking using Borda scoring
 */
function computeConsensus(list) {
  const sources = list.sources || {};
  
  // Facts/composite lists rank by the 'ai' composite seed, not Borda.
  if (list.mode === 'facts' || list.mode === 'scores' || list.mode === 'unranked') {
    return (sources.ai?.items || []).slice(0, 10);
  }

  // Get all publications (exclude 'ai' source)
  const publications = Object.entries(sources)
    .filter(([id]) => id !== 'ai')
    .map(([id, src]) => ({
      id,
      label: src.label,
      items: src.items || [],
      unordered: src.unordered,
      trueExpert: src.trueExpert,
      weight: src.weight
    }));
  
  if (publications.length === 0) {
    return sources.ai?.items || [];
  }
  
  // Gather universe of all items
  const universeMap = {};
  publications.forEach((src) => {
    src.items.forEach((item) => {
      const key = item.toLowerCase().trim();
      if (!universeMap[key]) universeMap[key] = item;
    });
  });
  
  const universe = Object.values(universeMap);
  if (universe.length === 0) return [];
  
  // Borda scoring
  const scores = {};
  universe.forEach((item) => {
    scores[item.toLowerCase().trim()] = 0;
  });
  
  const bordaFromRank = (rank) => {
    if (rank < 1 || rank > 10) return 0;
    return 11 - rank;
  };
  
  // Unordered roundups contribute equal flat points to each listed item.
  const FLAT_UNORDERED = 5.5;

  // Source weighting (kept in sync with lib/helpers.js getSources).
  // A "true expert" source (`trueExpert: true`) counts for HALF the combined
  // weight of the other experts, with a floor of 2x one normal expert:
  // max(2, N_other / 2).
  const normalWeightTotal = publications
    .filter((s) => !s.trueExpert)
    .reduce((sum, s) => sum + (s.weight || 1), 0);
  const sourceWeight = (src) => {
    if (src.trueExpert) return Math.max(2, normalWeightTotal / 2);
    return src.weight || 1;
  };

  // Score each publication, scaled by its weight.
  publications.forEach((src) => {
    const w = sourceWeight(src);
    if (src.unordered) {
      const listed = new Set(src.items.map((i) => i.toLowerCase().trim()));
      universe.forEach((item) => {
        const key = item.toLowerCase().trim();
        if (listed.has(key)) scores[key] += FLAT_UNORDERED * w;
      });
      return;
    }
    const pubRanks = {};
    src.items.forEach((item, idx) => {
      pubRanks[item.toLowerCase().trim()] = idx + 1;
    });
    
    const rankedKeys = Object.keys(pubRanks);
    let avgScore = 0;
    if (rankedKeys.length > 0) {
      const total = rankedKeys.reduce(
        (sum, k) => sum + bordaFromRank(pubRanks[k]),
        0
      );
      avgScore = total / rankedKeys.length;
    }
    
    universe.forEach((item) => {
      const key = item.toLowerCase().trim();
      if (pubRanks[key] !== undefined) {
        scores[key] += bordaFromRank(pubRanks[key]) * w;
      } else {
        scores[key] += avgScore * w;
      }
    });
  });
  
  // Tie-breaker: appearance count
  const appearanceCount = {};
  universe.forEach((item) => {
    const key = item.toLowerCase().trim();
    appearanceCount[key] = publications.reduce((n, src) => {
      return (
        n +
        (src.items.some((i) => i.toLowerCase().trim() === key) ? 1 : 0)
      );
    }, 0);
  });
  
  // Sort by score, then appearance count, then alphabetically
  const consensusItems = [...universe]
    .sort((a, b) => {
      const ka = a.toLowerCase().trim();
      const kb = b.toLowerCase().trim();
      if (scores[kb] !== scores[ka]) return scores[kb] - scores[ka];
      if (appearanceCount[kb] !== appearanceCount[ka]) {
        return appearanceCount[kb] - appearanceCount[ka];
      }
      return a.localeCompare(b);
    });
  
  return consensusItems;
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
 * Create list OG image SVG showing items 6-10 from Consensus
 */
function createListImageSVG(list) {
  const consensusItems = computeConsensus(list);
  const displayItems = consensusItems.slice(5, 10);
  
  // Word wrap title
  let titleLines = [];
  if (list.title.length > 45) {
    const words = list.title.split(' ');
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
    titleLines = [list.title];
  }
  
  let yOffset = 60;
  let titleSvg = '';
  for (let i = 0; i < titleLines.length; i++) {
    titleSvg += `  <text x="600" y="${yOffset + i * 65}" font-family="Georgia, serif" font-size="56" font-weight="bold" fill="#282828" text-anchor="middle">${escapeXml(titleLines[i])}</text>\n`;
  }
  
  const labelY = 120 + titleLines.length * 65;
  let itemsSvg = `  <text x="50" y="${labelY}" font-family="Arial, sans-serif" font-size="22" fill="#c0392b">6-10 of Consensus:</text>\n`;
  
  for (let i = 0; i < displayItems.length; i++) {
    const item = displayItems[i];
    const text = item.length > 65 ? item.substring(0, 65) + '...' : item;
    const itemY = labelY + 45 + i * 35;
    itemsSvg += `  <text x="70" y="${itemY}" font-family="Arial, sans-serif" font-size="22" fill="#282828">${i + 6}. ${escapeXml(text)}</text>\n`;
  }
  
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="1200" height="630" fill="#f4ede0"/>
  
  <!-- Top line -->
  <line x1="30" y1="40" x2="1170" y2="40" stroke="#282828" stroke-width="2"/>
  
  <!-- Title -->
${titleSvg}
  
  <!-- Label and items -->
${itemsSvg}
  
  <!-- Bottom line -->
  <line x1="30" y1="590" x2="1170" y2="590" stroke="#282828" stroke-width="2"/>
  
  <!-- Footer -->
  <text x="600" y="615" font-family="monospace" font-size="14" fill="#646464" text-anchor="middle">Ranked by Expert Consensus | Consensus Gurus</text>
</svg>`;
  
  return svg;
}

/**
 * Create homepage OG image SVG
 */
function createHomepageImageSVG() {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="1200" height="630" fill="#f4ede0"/>
  
  <!-- Top left: VOL. 1 NO. 1 -->
  <text x="50" y="50" font-family="Arial, sans-serif" font-size="12" fill="#999999" text-anchor="start" letter-spacing="2">VOL. 1 NO. 1</text>
  
  <!-- Top right: EST. 2026 -->
  <text x="1150" y="50" font-family="Arial, sans-serif" font-size="12" fill="#999999" text-anchor="end" letter-spacing="2">EST. 2026</text>
  
  <!-- Top decorative line -->
  <line x1="50" y1="70" x2="1150" y2="70" stroke="#282828" stroke-width="1"/>
  
  <!-- CONSENSUS text -->
  <text x="600" y="200" font-family="Georgia, serif" font-size="110" font-weight="bold" fill="#282828" text-anchor="middle" letter-spacing="3">CONSENSUS</text>
  
  <!-- gurus text in red italic -->
  <text x="600" y="290" font-family="Georgia, serif" font-size="85" font-style="italic" fill="#c0392b" text-anchor="middle" letter-spacing="2">gurus</text>
  
  <!-- Tagline - "Where We All Agree" -->
  <text x="600" y="350" font-family="Arial, sans-serif" font-size="18" fill="#282828" text-anchor="middle">Where We All Agree</text>
  
  <!-- Bottom decorative line -->
  <line x1="50" y1="520" x2="1150" y2="520" stroke="#282828" stroke-width="1"/>
  
  <!-- Bottom left: Black label -->
  <rect x="50" y="530" width="160" height="25" fill="#282828" rx="3"/>
  <text x="130" y="550" font-family="Arial, sans-serif" font-size="13" fill="white" text-anchor="middle" font-weight="bold">Consensus Gurus</text>
  
  <!-- Bottom right: VOTE | SHARE | DEBATE -->
  <text x="1150" y="550" font-family="Arial, sans-serif" font-size="11" fill="#999999" text-anchor="end" letter-spacing="3">VOTE | SHARE | DEBATE</text>
  
  <!-- Footer: From consensusgurus.com -->
  <text x="50" y="615" font-family="Arial, sans-serif" font-size="13" fill="#666666" text-anchor="start">From consensusgurus.com</text>
</svg>`;
  
  return svg;
}

/**
 * Main execution
 */
async function generateImages() {
  console.log('\nGenerating OG preview images...\n');
  
  const publicDir = path.join(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
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
      const listSvg = createListImageSVG(list);
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
