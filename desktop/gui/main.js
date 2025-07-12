const { app, BrowserWindow, ipcMain, dialog, shell, Menu, Tray, nativeImage, Notification } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow;
let tray;
let isDiscovering = false;
let connectedDevices = [];
let isQuitting = false; // Flag to track if we're actually quitting

function createMenu() {
  // Create a minimal menu that doesn't include default quit behavior
  const template = [
    {
      label: 'Connect Desktop',
      submenu: [
        {
          label: 'About Connect Desktop',
          role: 'about'
        },
        { type: 'separator' },
        {
          label: 'Hide Connect Desktop',
          accelerator: 'CmdOrCtrl+H',
          role: 'hide'
        },
        {
          label: 'Hide Others',
          accelerator: 'CmdOrCtrl+Alt+H',
          role: 'hideOthers'
        },
        {
          label: 'Show All',
          role: 'unhide'
        },
        { type: 'separator' },
        {
          label: 'Quit Connect Desktop',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            quitApp();
          }
        }
      ]
    },
    {
      label: 'File',
      submenu: [
        {
          label: 'Send Files...',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            if (mainWindow) {
              mainWindow.show();
              mainWindow.focus();
              mainWindow.webContents.send('tray-action', 'send-files');
            }
          }
        },
        {
          label: 'Receive Files',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: async () => {
            if (mainWindow) {
              mainWindow.show();
              mainWindow.focus();
              mainWindow.webContents.send('tray-action', 'receive-files');
            }
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: (item, focusedWindow) => {
            if (focusedWindow) focusedWindow.reload();
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
          click: (item, focusedWindow) => {
            if (focusedWindow) focusedWindow.webContents.toggleDevTools();
          }
        },
        { type: 'separator' },
        {
          label: 'Actual Size',
          accelerator: 'CmdOrCtrl+0',
          click: (item, focusedWindow) => {
            if (focusedWindow) focusedWindow.webContents.setZoomLevel(0);
          }
        },
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+Plus',
          click: (item, focusedWindow) => {
            if (focusedWindow) focusedWindow.webContents.setZoomLevel(focusedWindow.webContents.getZoomLevel() + 1);
          }
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          click: (item, focusedWindow) => {
            if (focusedWindow) focusedWindow.webContents.setZoomLevel(focusedWindow.webContents.getZoomLevel() - 1);
          }
        },
        { type: 'separator' },
        {
          label: 'Toggle Full Screen',
          accelerator: process.platform === 'darwin' ? 'Ctrl+Cmd+F' : 'F11',
          click: (item, focusedWindow) => {
            if (focusedWindow) focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
          }
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize'
        },
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          click: () => {
            if (mainWindow) {
              mainWindow.hide();
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Bring All to Front',
          role: 'front'
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            await shell.openExternal('https://github.com/your-repo/connect-desktop');
          }
        },
        {
          label: 'Documentation',
          click: async () => {
            await shell.openExternal('https://github.com/your-repo/connect-desktop#readme');
          }
        },
        { type: 'separator' },
        {
          label: 'About Connect Desktop',
          role: 'about'
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    titleBarStyle: 'default',
    show: false
  });

  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, 'dist/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('minimize', (event) => {
    event.preventDefault();
    mainWindow.hide();
  });

  // Prevent closing with Cmd+Q or Alt+F4
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

function createTray() {
  // Try to load the icon, fallback to a default if not available
  let iconPath = path.join(__dirname, 'assets/icon.png');
  let trayIcon;
  
  try {
    trayIcon = nativeImage.createFromPath(iconPath);
    // Check if the image is valid
    if (trayIcon.isEmpty()) {
      throw new Error('Icon is empty');
    }
  } catch (error) {
    console.log('Using default icon for tray');
    // Create a simple default icon (16x16 white square with border)
    const canvas = require('canvas');
    const img = canvas.createCanvas(16, 16);
    const ctx = img.getContext('2d');
    
    // Draw a simple icon
    ctx.fillStyle = '#4F46E5';
    ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(2, 2, 12, 12);
    
    trayIcon = nativeImage.createFromDataURL(img.toDataURL());
  }
  
  tray = new Tray(trayIcon);
  
  updateTrayMenu();
  
  tray.setToolTip('Connect Desktop - Device Manager');
  
  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function updateTrayMenu() {
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Connect Desktop',
      enabled: false,
      type: 'normal'
    },
    { type: 'separator' },
    {
      label: 'Show App',
      accelerator: 'CmdOrCtrl+Shift+C',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Device Discovery',
      submenu: [
        {
          label: isDiscovering ? 'Stop Discovery' : 'Start Discovery',
          click: async () => {
            if (isDiscovering) {
              await stopDiscovery();
            } else {
              await startDiscovery();
            }
          }
        },
        {
          label: 'Discovery Status',
          enabled: false,
          sublabel: isDiscovering ? 'Active' : 'Inactive'
        }
      ]
    },
    {
      label: 'Connected Devices',
      submenu: connectedDevices.length > 0 ? 
        connectedDevices.map(device => ({
          label: device.name || device.id,
          sublabel: device.status || 'Connected',
          click: () => {
            if (mainWindow) {
              mainWindow.show();
              mainWindow.focus();
              // You could add IPC to navigate to device details
            }
          }
        })) : 
        [{
          label: 'No devices connected',
          enabled: false
        }]
    },
    { type: 'separator' },
    {
      label: 'Quick Actions',
      submenu: [
        {
          label: 'Send Files...',
          click: async () => {
            if (mainWindow) {
              mainWindow.show();
              mainWindow.focus();
              // Trigger file selection
              mainWindow.webContents.send('tray-action', 'send-files');
            }
          }
        },
        {
          label: 'Receive Files',
          click: async () => {
            if (mainWindow) {
              mainWindow.show();
              mainWindow.focus();
              mainWindow.webContents.send('tray-action', 'receive-files');
            }
          }
        },
        {
          label: 'Clipboard Sync',
          click: async () => {
            if (mainWindow) {
              mainWindow.show();
              mainWindow.focus();
              mainWindow.webContents.send('tray-action', 'clipboard-sync');
            }
          }
        }
      ]
    },
    { type: 'separator' },
    {
      label: 'Settings',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
          mainWindow.webContents.send('tray-action', 'settings');
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      accelerator: 'CmdOrCtrl+Q',
      click: () => {
        quitApp();
      }
    }
  ]);
  
  tray.setContextMenu(contextMenu);
}

function quitApp() {
  isQuitting = true;
  
  // Show a brief notification before quitting
  if (Notification.isSupported()) {
    new Notification({
      title: 'Connect Desktop',
      body: 'Closing app...',
      icon: path.join(__dirname, 'assets/icon.png')
    }).show();
  }
  
  // Small delay to show the notification
  setTimeout(() => {
    app.quit();
  }, 500);
}

async function startDiscovery() {
  isDiscovering = true;
  updateTrayMenu();
  
  // Show notification
  if (Notification.isSupported()) {
    new Notification({
      title: 'Connect Desktop',
      body: 'Device discovery started',
      icon: path.join(__dirname, 'assets/icon.png')
    }).show();
  }
  
  console.log('Starting device discovery...');
  return true;
}

async function stopDiscovery() {
  isDiscovering = false;
  updateTrayMenu();
  
  console.log('Stopping device discovery...');
  return true;
}

function updateConnectedDevices(devices) {
  connectedDevices = devices || [];
  updateTrayMenu();
}

app.whenReady().then(() => {
  createMenu();
  createWindow();
  createTray();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
  
  // Override the default quit behavior on macOS
  if (process.platform === 'darwin') {
    // Override the default quit behavior
    const originalQuit = app.quit;
    app.quit = function() {
      if (!isQuitting) {
        if (mainWindow) {
          mainWindow.hide();
        }
        return;
      }
      return originalQuit.call(this);
    };
  }
});

// Prevent app from quitting when all windows are closed
app.on('window-all-closed', (event) => {
  // Don't quit the app, just keep it running in the tray
  event.preventDefault();
});

// Handle before-quit event to prevent accidental quits
app.on('before-quit', (event) => {
  if (!isQuitting) {
    event.preventDefault();
    if (mainWindow) {
      mainWindow.hide();
    }
  }
});

// Handle macOS specific quit behavior
app.on('will-quit', (event) => {
  if (!isQuitting) {
    event.preventDefault();
    if (mainWindow) {
      mainWindow.hide();
    }
  }
});

// Handle macOS dock quit
app.on('quit', (event) => {
  if (!isQuitting) {
    event.preventDefault();
    if (mainWindow) {
      mainWindow.hide();
    }
  }
});

// Prevent force quit on macOS
if (process.platform === 'darwin') {
  app.on('before-quit', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      if (mainWindow) {
        mainWindow.hide();
      }
    }
  });
  
  // Handle the specific macOS quit event
  app.on('quit', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      if (mainWindow) {
        mainWindow.hide();
      }
    }
  });
}

// Handle process signals
process.on('SIGINT', (signal) => {
  if (!isQuitting) {
    if (mainWindow) {
      mainWindow.hide();
    }
  }
});

process.on('SIGTERM', (signal) => {
  if (!isQuitting) {
    if (mainWindow) {
      mainWindow.hide();
    }
  }
});

// IPC handlers
ipcMain.handle('select-files', async () => {
  try {
    console.log('Opening file selection dialog...');
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile', 'multiSelections'],
      title: 'Select Files to Transfer',
      buttonLabel: 'Select Files',
      filters: [
        { name: 'All Files', extensions: ['*'] },
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'] },
        { name: 'Documents', extensions: ['pdf', 'doc', 'docx', 'txt', 'rtf'] },
        { name: 'Videos', extensions: ['mp4', 'avi', 'mov', 'wmv', 'flv'] },
        { name: 'Audio', extensions: ['mp3', 'wav', 'flac', 'aac', 'ogg'] }
      ]
    });
    
    console.log('File selection result:', result);
    
    if (result.canceled) {
      console.log('File selection was cancelled');
      return [];
    }
    
    console.log('Selected files:', result.filePaths);
    return result.filePaths;
  } catch (error) {
    console.error('Error in select-files handler:', error);
    throw error;
  }
});

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return result.filePaths[0];
});

ipcMain.handle('open-external', async (event, url) => {
  await shell.openExternal(url);
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-local-ip', () => {
  // Simple implementation - in a real app you'd get the actual IP
  return '192.168.1.100';
});

ipcMain.handle('start-discovery', async () => {
  return await startDiscovery();
});

ipcMain.handle('stop-discovery', async () => {
  return await stopDiscovery();
});

ipcMain.handle('update-connected-devices', (event, devices) => {
  updateConnectedDevices(devices);
});

ipcMain.handle('send-files', async (event, deviceId, files) => {
  // Mock implementation
  console.log('Sending files to device:', deviceId, files);
  return true;
});

ipcMain.handle('receive-files', async (event, deviceId) => {
  // Mock implementation
  console.log('Receiving files from device:', deviceId);
  return true;
});

ipcMain.handle('send-message', async (event, deviceId, message) => {
  // Mock implementation
  console.log('Sending message to device:', deviceId, message);
  return true;
});

ipcMain.handle('get-clipboard', () => {
  // Mock implementation
  return '';
});

ipcMain.handle('set-clipboard', async (event, text) => {
  // Mock implementation
  console.log('Setting clipboard:', text);
  return true;
});

ipcMain.handle('show-notification', async (event, title, body) => {
  if (Notification.isSupported()) {
    new Notification({
      title: title || 'Connect Desktop',
      body: body,
      icon: path.join(__dirname, 'assets/icon.png')
    }).show();
  }
  return true;
});

ipcMain.handle('minimize-to-tray', () => {
  mainWindow.hide();
});

ipcMain.handle('show-window', () => {
  mainWindow.show();
  mainWindow.focus();
});

ipcMain.handle('quit-app', () => {
  quitApp();
}); 