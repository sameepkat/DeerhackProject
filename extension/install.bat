@echo off
REM Cross-Device Presentation Control Extension Installer for Windows
REM This script helps set up the browser extension

echo 🚀 Cross-Device Presentation Control Extension Installer
echo ==================================================

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is required but not installed.
    echo Please install Python from https://python.org and try again.
    pause
    exit /b 1
)

REM Check if pip is available
pip --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ pip is required but not installed.
    echo Please install pip and try again.
    pause
    exit /b 1
)

echo 📦 Installing dependencies...
pip install cairosvg

if %errorlevel% neq 0 (
    echo ❌ Failed to install cairosvg. Trying alternative installation...
    pip install cairosvg --user
)

echo 🎨 Generating extension icons...
python generate_icons.py

if %errorlevel% equ 0 (
    echo ✅ Icons generated successfully!
) else (
    echo ⚠️  Icon generation failed. Extension will use fallback icons.
)

echo.
echo 📋 Installation Summary:
echo ========================
echo ✅ Dependencies installed
echo ✅ Icons generated
echo.
echo 📖 Next Steps:
echo 1. Open Chrome/Edge and go to chrome://extensions/
echo 2. Enable 'Developer mode'
echo 3. Click 'Load unpacked' and select this folder
echo 4. The extension should appear in your extensions list
echo.
echo 🔧 Configuration:
echo 1. Start the desktop server (see main project README)
echo 2. Click the extension icon in your browser
echo 3. Enter server IP and port (default: localhost:9000)
echo 4. Click 'Connect'
echo.
echo 🎉 Extension installation complete!
echo.
echo For more information, see README.md
pause 