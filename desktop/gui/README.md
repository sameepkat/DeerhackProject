# Connect Desktop

A cross-platform desktop application similar to KDE Connect, built with Electron and React. This application allows you to connect devices on your local network for file transfer, messaging, and device management.

## Features

- **Device Discovery**: Automatically discover devices on your local network
- **File Transfer**: Send and receive files between devices with drag-and-drop support
- **Messaging**: Send text messages between connected devices
- **Device Management**: View and manage connected devices
- **System Tray**: Minimize to system tray for background operation
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS

## Screenshots

The application features a modern, clean interface with:
- Dashboard with overview and quick actions
- Device discovery and management
- File transfer with progress tracking
- Real-time messaging
- Comprehensive settings panel

## Prerequisites

Before running this application, make sure you have:

- **Node.js** (version 16 or higher)
- **npm** or **yarn** package manager
- **Git** (for cloning the repository)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd connect-desktop
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

This will start both the React development server and the Electron application.

## Building for Production

### Development Build
```bash
npm run build
```

### Production Builds

**For Windows:**
```bash
npm run dist:win
```

**For macOS:**
```bash
npm run dist:mac
```

**For Linux:**
```bash
npm run dist:linux
```

**For all platforms:**
```bash
npm run dist
```

## Project Structure

```
connect-desktop/
├── src/
│   ├── components/          # Reusable UI components
│   ├── contexts/           # React context providers
│   ├── pages/             # Application pages
│   ├── App.jsx            # Main application component
│   ├── main.jsx           # React entry point
│   └── index.css          # Global styles
├── main.js                # Electron main process
├── preload.js             # Electron preload script
├── package.json           # Project configuration
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── README.md             # This file
```

## Key Technologies

- **Electron**: Cross-platform desktop application framework
- **React**: User interface library
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icons
- **Socket.io**: Real-time communication
- **Express**: Backend server for file transfers

## Features in Detail

### Device Discovery
- Automatic discovery of devices on the local network
- Manual refresh capability
- Device status indicators
- Connection management

### File Transfer
- Drag-and-drop file selection
- Progress tracking for transfers
- Support for multiple file types
- Transfer history and management

### Messaging
- Real-time text messaging
- Message history
- Device-specific conversations
- Message management (copy, delete)

### Settings
- Application preferences
- Network configuration
- File transfer settings
- System information display

## Development

### Available Scripts

- `npm start`: Start the Electron application
- `npm run dev`: Start development server with hot reload
- `npm run build`: Build the React application
- `npm run build:electron`: Build the Electron application
- `npm run dist`: Build for all platforms
- `npm run pack`: Create a packaged application

### Adding New Features

1. **New Pages**: Add components to `src/pages/`
2. **New Components**: Add reusable components to `src/components/`
3. **State Management**: Use React contexts in `src/contexts/`
4. **Electron APIs**: Add new IPC handlers in `main.js` and expose them in `preload.js`

### Code Style

- Use functional components with hooks
- Follow React best practices
- Use Tailwind CSS for styling
- Maintain consistent file structure

## Troubleshooting

### Common Issues

1. **Port conflicts**: If port 3000 is in use, the development server will automatically find an available port.

2. **Network discovery issues**: Make sure your firewall allows the application to communicate on the local network.

3. **File transfer failures**: Check that both devices are on the same network and have proper permissions.

4. **Build errors**: Ensure all dependencies are installed and Node.js version is compatible.

### Debug Mode

To run the application in debug mode:
```bash
npm run dev
```

This will open the developer tools automatically.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by KDE Connect
- Built with Electron and React
- Icons from Lucide React
- Styling with Tailwind CSS

## Support

For support, please open an issue on the GitHub repository or contact the development team.

---

**Note**: This is a development version. Some features may be experimental and subject to change. 