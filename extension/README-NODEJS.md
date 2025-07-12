# Cross-Device Presentation Control Extension (Node.js)

A modern browser extension built with Node.js, TypeScript, and Webpack for cross-device presentation control over LAN.

## 🚀 Features

- **Modern Development Stack**: TypeScript, Webpack, ESLint, Prettier
- **Multi-Platform Support**: Google Slides, Canva, Prezi, PowerPoint Online, and more
- **LAN Communication**: WebSocket-based real-time control
- **Type Safety**: Full TypeScript support with strict typing
- **Testing**: Jest with browser environment mocks
- **Build System**: Webpack with hot reloading for development

## 📋 Prerequisites

- **Node.js** 16.0.0 or higher
- **npm** 8.0.0 or higher
- Modern browser (Chrome, Edge, Firefox)

## 🛠️ Installation

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd extension

# Run the automated installer
node install.js
```

### Manual Installation

```bash
# Install dependencies
npm install

# Build the extension
npm run build

# Generate icons
npm run generate-icons
```

## 📁 Project Structure

```
extension/
├── src/                    # Source code
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility classes
│   ├── __tests__/         # Test files
│   ├── background.ts      # Service worker
│   ├── content.ts         # Content script
│   ├── popup.ts           # Popup script
│   ├── site-detector.ts   # Site detection logic
│   ├── manifest.json      # Extension manifest
│   ├── popup.html         # Popup interface
│   └── icons/             # Extension icons
├── dist/                  # Built extension (generated)
├── build/                 # Distribution files (generated)
├── scripts/               # Build and utility scripts
├── package.json           # Node.js dependencies
├── webpack.config.js      # Webpack configuration
├── tsconfig.json          # TypeScript configuration
├── jest.config.js         # Jest testing configuration
├── .eslintrc.js           # ESLint configuration
├── .prettierrc            # Prettier configuration
└── install.js             # Automated installer
```

## 🎯 Development

### Available Scripts

```bash
# Development
npm run dev              # Build in development mode with watch
npm run build            # Build for production
npm run clean            # Clean build directory

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues automatically

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage

# Utilities
npm run generate-icons   # Generate extension icons
npm run zip              # Create distribution ZIP
npm run install-extension # Full build and setup
```

### Development Workflow

1. **Start Development Mode**:
   ```bash
   npm run dev
   ```
   This will watch for file changes and rebuild automatically.

2. **Load Extension in Browser**:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder
   - The extension will reload automatically when you make changes

3. **Testing**:
   ```bash
   npm run test
   ```
   Run tests to ensure your changes work correctly.

### Code Style

The project uses ESLint and Prettier for consistent code style:

```bash
# Check code style
npm run lint

# Fix code style issues
npm run lint:fix
```

## 🧪 Testing

### Writing Tests

Tests are written using Jest and located in `src/__tests__/`:

```typescript
// src/__tests__/site-detector.test.ts
import { SiteDetector } from '../site-detector';

describe('SiteDetector', () => {
  let siteDetector: SiteDetector;

  beforeEach(() => {
    siteDetector = new SiteDetector();
  });

  test('should detect Google Slides', () => {
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        href: 'https://docs.google.com/presentation/d/123/edit',
        hostname: 'docs.google.com'
      },
      writable: true
    });

    expect(siteDetector.currentSite).toBe('google_slides');
  });
});
```

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🔧 Configuration

### TypeScript Configuration

The `tsconfig.json` is configured for:
- ES2020 target
- Strict type checking
- Module resolution
- Path aliases (`@/` for `src/`)

### Webpack Configuration

The `webpack.config.js` handles:
- TypeScript compilation
- CSS processing
- File copying
- Development and production builds
- Source maps

### ESLint Configuration

The `.eslintrc.js` includes:
- TypeScript support
- Browser extension rules
- Prettier integration
- Chrome API types

## 📦 Building for Production

### Production Build

```bash
npm run build
```

This creates optimized files in the `dist/` directory.

### Creating Distribution Package

```bash
npm run zip
```

This creates a timestamped ZIP file in the `build/` directory.

## 🚀 Deployment

### Loading in Browser

1. **Chrome/Edge**:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

2. **Firefox**:
   - Go to `about:addons`
   - Click the gear icon
   - Select "Install Add-on From File"
   - Choose the `dist` folder

### Publishing to Web Store

1. Build for production: `npm run build`
2. Create ZIP package: `npm run zip`
3. Upload the ZIP file to the Chrome Web Store or Firefox Add-ons

## 🔍 Debugging

### Chrome DevTools

1. Open the extension popup
2. Right-click and select "Inspect"
3. Use the DevTools to debug the popup

### Content Script Debugging

1. Open a supported presentation site
2. Open DevTools (F12)
3. Check the Console tab for extension logs
4. Use the Sources tab to debug content scripts

### Background Script Debugging

1. Go to `chrome://extensions/`
2. Find your extension
3. Click "service worker" link
4. Use the DevTools that open

## 🐛 Troubleshooting

### Common Issues

**Build fails with TypeScript errors**:
```bash
npm run lint:fix
```

**Extension doesn't load**:
- Check that all files are in the `dist/` directory
- Verify the manifest.json is valid
- Check browser console for errors

**WebSocket connection fails**:
- Ensure the desktop server is running
- Check firewall settings
- Verify IP address and port

**Tests fail**:
```bash
npm run test -- --verbose
```

### Getting Help

1. Check the browser console for error messages
2. Review the test output for failing tests
3. Check the main project README for system requirements
4. Open an issue with detailed error information

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm run test`
5. Check code style: `npm run lint`
6. Commit your changes: `git commit -m 'Add feature'`
7. Push to the branch: `git push origin feature-name`
8. Submit a pull request

## 📄 License

This extension is part of the Cross-Device LAN Control project and follows the same license terms.

## 🆘 Support

For issues and questions:
1. Check this README and the main project documentation
2. Review the troubleshooting section
3. Open an issue on the project repository
4. Check the test files for usage examples 