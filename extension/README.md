# Cross-Device Presentation Control Extension

A browser extension that enables remote control of presentations across different platforms using LAN communication.

## Features

- **Multi-Platform Support**: Works with Google Slides, Canva, Prezi, PowerPoint Online, and more
- **LAN Communication**: Connects to your desktop server over local network
- **Real-time Control**: Remote slide navigation and presentation control
- **Visual Feedback**: Floating control panel with connection status
- **Keyboard Simulation**: Fallback to keyboard events for universal compatibility

## Supported Platforms

- **Google Slides** (`docs.google.com/presentation/*`)
- **Canva** (`canva.com/*`)
- **Prezi** (`prezi.com/*`)
- **Slides.com** (`slides.com/*`)
- **Beautiful.ai** (`beautiful.ai/*`)
- **PowerPoint Online** (`powerpoint.office.com/*`)
- **SlideShare** (`slideshare.net/*`)

## Installation

### Method 1: Load Unpacked Extension (Development)

1. Clone or download this repository
2. Open Chrome/Edge and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `extension` folder
5. The extension should now appear in your extensions list

### Method 2: Build and Install

1. Install dependencies:

   ```bash
   cd extension
   pip install cairosvg
   ```

2. Generate icons:

   ```bash
   python generate_icons.py
   ```

3. Follow Method 1 to load the extension

## Configuration

### Desktop Server Setup

1. Start the desktop server (see main project README)
2. Note the server IP and port (default: `localhost:9000`)

### Extension Configuration

1. Click the extension icon in your browser toolbar
2. Enter the desktop server IP and port
3. Click "Connect" to establish connection
4. The extension will show connection status

## Usage

### Basic Controls

Once connected to a presentation site:

- **Next Slide**: Click "Next →" or use remote command
- **Previous Slide**: Click "← Prev" or use remote command
- **Start Presentation**: Click "Start" to begin presentation mode
- **Exit Presentation**: Click "Exit" to exit presentation mode

### Remote Control

The extension can be controlled remotely via:

1. **Mobile App**: Use the React Native mobile app
2. **Web Controller**: Use the web-based controller interface
3. **Desktop Commands**: Send commands from the desktop server

### Floating Control Panel

When connected, a floating control panel appears on supported sites:

- Shows connection status and platform information
- Provides quick access to presentation controls
- Draggable interface for positioning
- Visual feedback for actions

## Technical Details

### Architecture

```
Extension Components:
├── manifest.json          # Extension configuration
├── background.js          # Service worker for WebSocket management
├── content.js            # Content script for site interaction
├── content-enhanced.js   # Enhanced version with better UI
├── popup.html/js         # Extension popup interface
├── site-detector.js      # Platform detection and controls
└── icons/                # Extension icons
```

### Communication Flow

1. **Extension ↔ Desktop Server**: WebSocket connection for real-time commands
2. **Content Script ↔ Web Page**: DOM manipulation and event simulation
3. **Background ↔ Content**: Chrome extension messaging for coordination

### Site Detection

The extension automatically detects presentation platforms and applies appropriate controls:

- **Element Selection**: Uses CSS selectors to find control buttons
- **Keyboard Fallback**: Simulates keyboard events when buttons aren't found
- **Platform-Specific**: Custom logic for each supported platform

## Development

### Adding New Platforms

1. Update `site-detector.js` with new platform selectors
2. Add platform to `manifest.json` content script matches
3. Test with the platform's presentation interface

### Debugging

1. Open browser developer tools
2. Check console for extension logs
3. Use Chrome extension debugging tools
4. Monitor WebSocket connections

### Building

```bash
# Generate icons
python generate_icons.py

# Package extension (optional)
# Use Chrome's "Pack extension" feature or third-party tools
```

## Troubleshooting

### Connection Issues

- **Check Server**: Ensure desktop server is running
- **Network**: Verify devices are on same LAN
- **Firewall**: Check if port 9000 is blocked
- **IP Address**: Use correct server IP address

### Control Issues

- **Site Support**: Verify the site is supported
- **Presentation Mode**: Some controls only work in presentation mode
- **Permissions**: Check if extension has necessary permissions
- **Page Refresh**: Try refreshing the page after connecting

### Performance

- **Memory Usage**: Extension uses minimal resources
- **Network**: WebSocket connection is lightweight
- **Battery**: Minimal impact on device battery

## Security

- **LAN Only**: All communication is local network only
- **No Internet**: No data sent to external servers
- **Permissions**: Minimal required permissions
- **Open Source**: Code is transparent and auditable

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This extension is part of the Cross-Device LAN Control project and follows the same license terms.

## Support

For issues and questions:

1. Check the troubleshooting section
2. Review the main project documentation
3. Open an issue on the project repository
