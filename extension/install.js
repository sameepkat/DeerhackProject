#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Modern Node.js installation script for the extension
 */

const EXTENSION_DIR = __dirname;

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    warning: '\x1b[33m', // Yellow
    error: '\x1b[31m',   // Red
    reset: '\x1b[0m'     // Reset
  };
  
  console.log(`${colors[type]}${message}${colors.reset}`);
}

function checkNodeVersion() {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0]);
  
  if (major < 16) {
    log('❌ Node.js version 16 or higher is required', 'error');
    log(`Current version: ${version}`, 'error');
    process.exit(1);
  }
  
  log(`✅ Node.js version: ${version}`, 'success');
}

function checkNpm() {
  try {
    const version = execSync('npm --version', { encoding: 'utf8' }).trim();
    log(`✅ npm version: ${version}`, 'success');
    return true;
  } catch (error) {
    log('❌ npm is not installed or not accessible', 'error');
    return false;
  }
}

function installDependencies() {
  log('📦 Installing dependencies...', 'info');
  
  try {
    execSync('npm install', { 
      stdio: 'inherit',
      cwd: EXTENSION_DIR 
    });
    log('✅ Dependencies installed successfully', 'success');
  } catch (error) {
    log('❌ Failed to install dependencies', 'error');
    process.exit(1);
  }
}

function buildExtension() {
  log('🔨 Building extension...', 'info');
  
  try {
    execSync('npm run build', { 
      stdio: 'inherit',
      cwd: EXTENSION_DIR 
    });
    log('✅ Extension built successfully', 'success');
  } catch (error) {
    log('❌ Failed to build extension', 'error');
    process.exit(1);
  }
}

function generateIcons() {
  log('🎨 Generating icons...', 'info');
  
  try {
    execSync('npm run generate-icons', { 
      stdio: 'inherit',
      cwd: EXTENSION_DIR 
    });
    log('✅ Icons generated successfully', 'success');
  } catch (error) {
    log('⚠️  Icon generation failed, using fallbacks', 'warning');
  }
}

function showInstallationInstructions() {
  log('\n📋 Installation Complete!', 'success');
  log('================================', 'info');
  log('', 'info');
  log('🚀 Next Steps:', 'info');
  log('', 'info');
  log('1. Open your browser and go to:', 'info');
  log('   Chrome: chrome://extensions/', 'info');
  log('   Edge: edge://extensions/', 'info');
  log('   Firefox: about:addons', 'info');
  log('', 'info');
  log('2. Enable "Developer mode"', 'info');
  log('', 'info');
  log('3. Click "Load unpacked" and select:', 'info');
  log(`   ${path.join(EXTENSION_DIR, 'dist')}`, 'info');
  log('', 'info');
  log('4. The extension should appear in your extensions list', 'info');
  log('', 'info');
  log('🔧 Configuration:', 'info');
  log('', 'info');
  log('1. Start the desktop server (see main project README)', 'info');
  log('2. Click the extension icon in your browser', 'info');
  log('3. Enter server IP and port (default: localhost:9000)', 'info');
  log('4. Click "Connect"', 'info');
  log('', 'info');
  log('🧪 Testing:', 'info');
  log('', 'info');
  log('1. Open the test page: file://' + path.join(EXTENSION_DIR, 'dist', 'test.html'), 'info');
  log('2. Navigate to a supported presentation site', 'info');
  log('3. Test the remote controls', 'info');
  log('', 'info');
  log('📚 For more information, see README.md', 'info');
  log('', 'info');
  log('🎉 Happy presenting!', 'success');
}

function showDevelopmentCommands() {
  log('\n🛠️  Development Commands:', 'info');
  log('========================', 'info');
  log('', 'info');
  log('npm run dev          - Build in development mode with watch', 'info');
  log('npm run build        - Build for production', 'info');
  log('npm run lint         - Run ESLint', 'info');
  log('npm run lint:fix     - Fix ESLint issues', 'info');
  log('npm run test         - Run tests', 'info');
  log('npm run zip          - Create distribution ZIP', 'info');
  log('', 'info');
}

function main() {
  log('🚀 Cross-Device Presentation Control Extension Installer', 'info');
  log('========================================================', 'info');
  log('', 'info');
  
  // Check prerequisites
  checkNodeVersion();
  if (!checkNpm()) {
    process.exit(1);
  }
  
  // Install and build
  installDependencies();
  buildExtension();
  generateIcons();
  
  // Show instructions
  showInstallationInstructions();
  showDevelopmentCommands();
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main }; 