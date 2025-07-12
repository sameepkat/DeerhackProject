#!/bin/bash

# Cross-Device Presentation Control Extension Installer
# This script helps set up the browser extension

echo "🚀 Cross-Device Presentation Control Extension Installer"
echo "=================================================="

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    echo "Please install Python 3 and try again."
    exit 1
fi

# Check if pip is available
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is required but not installed."
    echo "Please install pip3 and try again."
    exit 1
fi

echo "📦 Installing dependencies..."
pip3 install cairosvg

if [ $? -ne 0 ]; then
    echo "❌ Failed to install cairosvg. Trying alternative installation..."
    pip3 install cairosvg --user
fi

echo "🎨 Generating extension icons..."
python3 generate_icons.py

if [ $? -eq 0 ]; then
    echo "✅ Icons generated successfully!"
else
    echo "⚠️  Icon generation failed. Extension will use fallback icons."
fi

echo ""
echo "📋 Installation Summary:"
echo "========================"
echo "✅ Dependencies installed"
echo "✅ Icons generated"
echo ""
echo "📖 Next Steps:"
echo "1. Open Chrome/Edge and go to chrome://extensions/"
echo "2. Enable 'Developer mode'"
echo "3. Click 'Load unpacked' and select this folder"
echo "4. The extension should appear in your extensions list"
echo ""
echo "🔧 Configuration:"
echo "1. Start the desktop server (see main project README)"
echo "2. Click the extension icon in your browser"
echo "3. Enter server IP and port (default: localhost:9000)"
echo "4. Click 'Connect'"
echo ""
echo "🎉 Extension installation complete!"
echo ""
echo "For more information, see README.md" 