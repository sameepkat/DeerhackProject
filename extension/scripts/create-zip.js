#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

/**
 * Create a ZIP file of the extension for distribution
 */

const DIST_DIR = path.join(__dirname, '..', 'dist');
const OUTPUT_DIR = path.join(__dirname, '..', 'build');

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function createExtensionZip() {
  console.log('📦 Creating extension ZIP file...');
  
  try {
    // Ensure output directory exists
    ensureDirectoryExists(OUTPUT_DIR);
    
    // Check if dist directory exists
    if (!fs.existsSync(DIST_DIR)) {
      console.error('❌ Dist directory not found. Run "npm run build" first.');
      process.exit(1);
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const zipPath = path.join(OUTPUT_DIR, `extension-${timestamp}.zip`);
    
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level
    });
    
    output.on('close', () => {
      const size = (archive.pointer() / 1024 / 1024).toFixed(2);
      console.log(`✅ Extension ZIP created: ${zipPath}`);
      console.log(`📊 Total size: ${size} MB`);
    });
    
    archive.on('error', (err) => {
      throw err;
    });
    
    archive.pipe(output);
    
    // Add all files from dist directory
    archive.directory(DIST_DIR, false);
    
    // Add README and other documentation
    const readmePath = path.join(__dirname, '..', 'README.md');
    if (fs.existsSync(readmePath)) {
      archive.file(readmePath, { name: 'README.md' });
    }
    
    archive.finalize();
    
  } catch (error) {
    console.error('❌ Failed to create ZIP:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  createExtensionZip();
}

module.exports = { createExtensionZip }; 