#!/usr/bin/env node

/**
 * Generate OG preview images for all lists in data.js
 * This runs automatically during Vercel build process
 * Usage: node scripts/generate-og-images.js
 */

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

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
 * Create OG image for a list
 */
function createListImage(listId, title, items) {
  const width = 1200;
  const height = 630;
  
  // Create canvas
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#f4ede0';
  ctx.fillRect(0, 0, width, height);
  
  // Draw decorative top line
  ctx.strokeStyle = '#282828';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(30, 40);
  ctx.lineTo(1170, 40);
  ctx.stroke();
  
  // Title
  ctx.fillStyle = '#282828';
  ctx.font = 'bold 56px "Liberation Serif", serif';
  ctx.textAlign = 'center';
  
  // Word wrap title if needed
  let titleLines = [];
  if (title.length > 45) {
    const words = title.split(' ');
    let line = '';
    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 1100) {
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
  
  // Draw title (max 2 lines)
  let titleY = 60;
  for (let i = 0; i < Math.min(titleLines.length, 2); i++) {
    ctx.fillText(titleLines[i], width / 2, titleY + (i * 65));
  }
  
  let itemsY = titleY + (Math.min(titleLines.length, 2) * 65) + 30;
  
  // "Top picks:" label
  ctx.fillStyle = '#c0392b';
  ctx.font = '22px "Liberation Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Top picks:', 50, itemsY);
  
  itemsY += 45;
  
  // Items
  ctx.fillStyle = '#282828';
  for (let i = 0; i < Math.min(items.length, 3); i++) {
    let item = items[i];
    if (item.length > 65) {
      item = item.substring(0, 65) + '...';
    }
    ctx.fillText(`${i + 1}. ${item}`, 70, itemsY);
    itemsY += 35;
  }
  
  // Bottom decorative line
  ctx.strokeStyle = '#282828';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(30, 590);
  ctx.lineTo(1170, 590);
  ctx.stroke();
  
  // Footer
  ctx.fillStyle = '#646464';
  ctx.font = '14px "Liberation Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Ranked by Expert Consensus | Consensus Gurus', width / 2, 603);
  
  return canvas.toBuffer('image/jpeg', { quality: 0.95 });
}

/**
 * Create homepage OG image
 */
function createHomepageImage() {
  const width = 1200;
  const height = 630;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#f4ede0';
  ctx.fillRect(0, 0, width, height);
  
  // Top line
  ctx.strokeStyle = '#282828';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(50, 80);
  ctx.lineTo(1150, 80);
  ctx.stroke();
  
  // "CONSENSUS" text
  ctx.fillStyle = '#282828';
  ctx.font = 'bold 140px "Liberation Serif", serif';
  ctx.textAlign = 'center';
  ctx.fillText('CONSENSUS', width / 2, 230);
  
  // "gurus" text in red
  ctx.fillStyle = '#c0392b';
  ctx.font = 'italic 100px "Liberation Serif", serif';
  ctx.fillText('gurus', width / 2, 340);
  
  // Tagline
  ctx.fillStyle = '#282828';
  ctx.font = '32px "Liberation Sans", sans-serif';
  ctx.fillText('Top Ten Lists from Every Angle', width / 2, 410);
  
  // Descriptor
  ctx.fillStyle = '#646464';
  ctx.font = '18px "Liberation Mono", monospace';
  ctx.fillText('Curated top-ten lists ranked by expert consensus', width / 2, 470);
  
  // Bottom line
  ctx.strokeStyle = '#282828';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(50, 550);
  ctx.lineTo(1150, 550);
  ctx.stroke();
  
  return canvas.toBuffer('image/jpeg', { quality: 0.95 });
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
    const homepageBuffer = createHomepageImage();
    fs.writeFileSync(path.join(publicDir, 'og-homepage.jpg'), homepageBuffer);
    console.log('✓ og-homepage.jpg');
    successCount++;
  } catch (error) {
    console.error('✗ og-homepage.jpg -', error.message);
    errorCount++;
  }
  
  // Generate list images
  for (const list of lists) {
    try {
      const imageBuffer = createListImage(list.id, list.title, list.items);
      const filename = `og-list-${list.id}.jpg`;
      fs.writeFileSync(path.join(publicDir, filename), imageBuffer);
      console.log(`✓ ${filename}`);
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
