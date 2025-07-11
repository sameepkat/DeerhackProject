#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/**
 * Generate PNG icons from SVG using Canvas API
 * This is a simplified version that creates basic colored squares
 * In a real implementation, you'd use a library like sharp or canvas
 */

const ICON_SIZES = [16, 48, 128];
const ICONS_DIR = path.join(__dirname, '..', 'src', 'icons');
const SVG_PATH = path.join(ICONS_DIR, 'icon.svg');

async function generateIcons() {
  if (!fs.existsSync(SVG_PATH)) {
    console.error('SVG icon not found:', SVG_PATH);
    process.exit(1);
  }
  for (const size of ICON_SIZES) {
    const pngPath = path.join(ICONS_DIR, `icon${size}.png`);
    try {
      await sharp(SVG_PATH)
        .resize(size, size)
        .png()
        .toFile(pngPath);
      console.log(`Generated ${pngPath}`);
    } catch (e) {
      console.error(`Failed to generate ${pngPath}:`, e);
    }
  }
}

// Run if called directly
if (require.main === module) {
  generateIcons();
}

module.exports = { generateIcons }; 