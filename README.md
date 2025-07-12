# SYNCBRIDGE

<img width="1440" height="846" alt="image" src="https://github.com/user-attachments/assets/b9e3a51c-d4c8-4f5d-b2f7-e3f8d0d015fd" />

<img width="1440" height="846" alt="image" src="https://github.com/user-attachments/assets/9443593b-73bf-4fb8-9a13-cb8b71a3524c" />

<img width="1440" height="844" alt="image" src="https://github.com/user-attachments/assets/9d03f37d-a004-40f6-a4f8-5e2aee3f3356" />


# Tags

- feat: for new features (e.g., feat: add cursor polling fallback)
- fix: for bug fixes (e.g., fix: correct cursor position print logic)
- refactor: for code refactoring (e.g., refactor: clean up listener logic)
- docs: for documentation changes (e.g., docs: update README for usage)
- chore: for maintenance tasks (e.g., chore: update dependencies)
- test: for adding or updating tests (e.g., test: add polling test)
- perf: for performance improvements (e.g., perf: optimize polling interval)



# SyncConnect - Cross-Device LAN Control System

A comprehensive cross-platform solution for seamless device connectivity and control over local networks. SyncConnect enables file transfer, presentation control, clipboard synchronization, and multimedia control between desktop, mobile, and web platforms.

## 🌟 Features

### Core Functionality

- **Cross-Platform Device Control**: Control desktop from mobile/web devices
- **File Transfer**: Seamless file sharing between devices
- **Presentation Control**: Remote control of presentations across platforms
- **Clipboard Sync**: Synchronize clipboard content across devices
- **Multimedia Control**: Control volume, brightness, and media playback
- **Real-time Communication**: WebSocket-based real-time messaging
- **QR Code Pairing**: Easy device pairing with QR codes

### Supported Platforms

- **Desktop**: Windows, macOS, Linux (Python + Electron)
- **Mobile**: Android, iOS (React Native/Expo)
- **Web**: Modern browsers (React + TypeScript)
- **Browser Extension**: Chrome/Edge extension for presentation control

## 🏗️ Architecture

```
SyncConnect/
├── desktop/          # Desktop application (Python + Electron)
├── mobile/           # Mobile app (React Native/Expo)
├── web/              # Web interface (React + TypeScript)
├── extension/        # Browser extension (JavaScript)
└── docs/             # Documentation
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **Python** (3.8 or higher)
- **Git**

### 1. Desktop Application

The desktop app serves as the central hub for device connectivity.

```bash
cd desktop
pip install -r requirements.txt

# Start the desktop server
python -m desktop.server.ws_handler

# Or run the GUI application
python -m desktop.gui.main_window2
```

**Features:**

- WebSocket server for device communication
- GUI interface with device management
- File transfer capabilities
- System tray integration
- Clipboard and multimedia control

### 2. Mobile Application

```bash
cd mobile/android
npm install
npx expo start
```

**Features:**

- Device discovery and pairing
- File transfer interface
- Presentation control
- Multimedia controls
- Real-time messaging

### 3. Web Interface

```bash
cd web
npm install
npm run dev
```

**Features:**

- Browser-based device control
- File transfer interface
- Presentation control
- Responsive design

### 4. Browser Extension

```bash
cd extension
npm install
npm run build
```

**Installation:**

1. Open Chrome/Edge and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `extension` folder

**Supported Platforms:**

- Google Slides
- Canva
- Prezi
- PowerPoint Online
- Slides.com
- Beautiful.ai

## 📱 Device Pairing

### Method 1: QR Code Pairing

1. Start the desktop server
2. Scan the displayed QR code with your mobile device
3. Enter the pairing token when prompted
4. Devices are now connected

### Method 2: Manual Pairing

1. Note the server IP and port from desktop
2. Enter connection details in mobile/web app
3. Use the pairing token for authentication

## 🔧 Configuration

### Desktop Server Settings

- **Port**: Default 9000 (configurable)
- **Network**: LAN communication only
- **Security**: Token-based authentication
- **Auto-start**: System tray integration

### Mobile App Settings

- **Discovery**: Automatic device discovery
- **Connection**: Manual or QR code pairing
- **File Transfer**: Configurable download paths
- **Notifications**: Real-time status updates

## 🛠️ Development

### Desktop Development

```bash
cd desktop
pip install -r requirements.txt
python -m pytest tests/  # Run tests
```

### Mobile Development

```bash
cd mobile/android
npm install
npm run reset-project  # Fresh start
npx expo start --dev-client
```

### Web Development

```bash
cd web
npm install
npm run dev
npm run build
```

### Extension Development

```bash
cd extension
npm install
npm run build
# Load unpacked extension in browser
```

## 📋 API Reference

### WebSocket Messages

**Device Pairing:**

```json
{
  "type": "pair",
  "token": "pairing_token"
}
```

**File Transfer:**

```json
{
  "type": "file_transfer",
  "file_info": {
    "name": "file.txt",
    "size": 1024,
    "data": "base64_encoded_data"
  }
}
```

**Presentation Control:**

```json
{
  "type": "presentation",
  "action": "next" // "next", "prev", "start", "exit"
}
```

**Clipboard Sync:**

```json
{
  "type": "clipboard",
  "action": "get", // "get" or "set"
  "data": "clipboard_content"
}
```

## 🔒 Security

- **LAN Only**: All communication restricted to local network
- **Token Authentication**: Secure device pairing
- **No Internet**: No data sent to external servers
- **Minimal Permissions**: Only necessary system access

## 🐛 Troubleshooting

### Connection Issues

1. **Check Network**: Ensure devices are on same LAN
2. **Firewall**: Verify port 9000 is not blocked
3. **Server Status**: Confirm desktop server is running
4. **IP Address**: Use correct server IP address

### File Transfer Issues

1. **Permissions**: Check file/folder permissions
2. **Storage**: Verify sufficient storage space
3. **Network**: Ensure stable network connection
4. **File Size**: Check file size limits

### Extension Issues

1. **Site Support**: Verify platform is supported
2. **Permissions**: Check extension permissions
3. **Page Refresh**: Try refreshing after connection
4. **Browser**: Ensure compatible browser version

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and patterns
- Add tests for new features
- Update documentation as needed
- Test across all platforms

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by KDE Connect
- Built with modern web technologies
- Cross-platform compatibility focus
- Open source community driven

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Documentation**: Check the `docs/` folder
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)

## 🔄 Version History

- **v1.0.0**: Initial release with core functionality
- **v1.1.0**: Added presentation control features
- **v1.2.0**: Enhanced mobile app and web interface
- **v1.3.0**: Browser extension and improved security

---

**Note**: This is an active development project. Some features may be experimental and subject to change.
