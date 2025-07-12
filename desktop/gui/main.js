const { app, BrowserWindow, ipcMain, dialog, shell, Menu, Tray, nativeImage, Notification } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow;
let tray;
let isDiscovering = false;
let connectedDevices = [];
let isQuitting = false; // Flag to track if we're actually quitting
let pythonProcess = null;
let pairingInfo = null;

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

  // Optionally open DevTools in development mode
  // Set OPEN_DEVTOOLS=true to enable automatic opening
  // if (isDev && process.env.OPEN_DEVTOOLS === 'true') {
  //   mainWindow.webContents.openDevTools();
  // }

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

  // Handle window close based on settings
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      
      // Check if minimize to tray is enabled
      if (global.minimizeToTray !== false) { // Default to true if not set
        mainWindow.hide();
      } else {
        // If minimize to tray is disabled, actually quit the app
        quitApp();
      }
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
  
  // Stop Python server before quitting
  stopPythonServer();
  
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

app.whenReady().then(async () => {
  // Initialize settings
  try {
    const settingsPath = path.join(app.getPath('userData'), 'settings.json');
    if (fs.existsSync(settingsPath)) {
      const settingsData = fs.readFileSync(settingsPath, 'utf8');
      const settings = JSON.parse(settingsData);
      
      // Set global minimize to tray setting
      global.minimizeToTray = settings.minimizeToTray !== false; // Default to true
      
      // Apply auto-start setting
      if (settings.autoStart) {
        app.setLoginItemSettings({
          openAtLogin: true,
          openAsHidden: true
        });
      }
    } else {
      // Default settings
      global.minimizeToTray = true;
    }
  } catch (error) {
    console.error('Error loading settings:', error);
    global.minimizeToTray = true; // Default to true
  }
  
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
  } else {
    stopPythonServer();
  }
});

process.on('SIGTERM', (signal) => {
  if (!isQuitting) {
    if (mainWindow) {
      mainWindow.hide();
    }
  } else {
    stopPythonServer();
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

// Python WebSocket server integration
async function startPythonServer() {
  try {
    if (pythonProcess) {
      console.log('Python server already running');
      return true;
    }

    const pythonScriptPath = path.join(__dirname, '..', 'server', 'ws_handler.py');
    console.log('Starting Python server from:', pythonScriptPath);

    // First, get pairing info immediately
    try {
      const pairingInfoProcess = spawn('python3', ['-c', `
import sys
sys.path.append('${path.dirname(pythonScriptPath)}')
from ws_handler import get_pairing_info_only
import json
print(json.dumps(get_pairing_info_only()))
      `], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: path.dirname(pythonScriptPath)
      });

      let pairingData = '';
      pairingInfoProcess.stdout.on('data', (data) => {
        pairingData += data.toString();
      });

      await new Promise((resolve, reject) => {
        pairingInfoProcess.on('close', (code) => {
          if (code === 0) {
            try {
              pairingInfo = JSON.parse(pairingData.trim());
              if (mainWindow) {
                mainWindow.webContents.send('pairing-info-updated', pairingInfo);
              }
              resolve();
            } catch (error) {
              console.error('Error parsing pairing info:', error);
              reject(error);
            }
          } else {
            reject(new Error('Failed to get pairing info'));
          }
        });
      });
    } catch (error) {
      console.error('Error getting pairing info:', error);
    }

    // Then start the actual server
    pythonProcess = spawn('python3', [pythonScriptPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: path.dirname(pythonScriptPath)
    });

    pythonProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('Python server output:', output);
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error('Python server error:', data.toString());
    });

    pythonProcess.on('close', (code) => {
      console.log('Python server closed with code:', code);
      pythonProcess = null;
      pairingInfo = null;
    });

    pythonProcess.on('error', (error) => {
      console.error('Failed to start Python server:', error);
      pythonProcess = null;
      pairingInfo = null;
    });

    return true;
  } catch (error) {
    console.error('Error starting Python server:', error);
    return false;
  }
}

function stopPythonServer() {
  if (pythonProcess) {
    pythonProcess.kill();
    pythonProcess = null;
    pairingInfo = null;
  }
}

// Pairing info handlers
ipcMain.handle('get-pairing-info', () => {
  return pairingInfo;
});

ipcMain.handle('start-python-server', async () => {
  return await startPythonServer();
});

ipcMain.handle('stop-python-server', () => {
  stopPythonServer();
  return true;
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

// Settings handlers
ipcMain.handle('get-settings', () => {
  try {
    const settingsPath = path.join(app.getPath('userData'), 'settings.json');
    if (fs.existsSync(settingsPath)) {
      const settingsData = fs.readFileSync(settingsPath, 'utf8');
      const parsedSettings = JSON.parse(settingsData);
      
      // Ensure all required settings exist with defaults
      const defaultSettings = {
        autoStart: false,
        minimizeToTray: true,
        notifications: true,
        autoAcceptFiles: false,
        downloadPath: '',
        maxFileSize: 100,
        discoveryTimeout: 30
      };
      
      // Merge with defaults to ensure all settings exist
      return { ...defaultSettings, ...parsedSettings };
    }
    return null;
  } catch (error) {
    console.error('Error reading settings:', error);
    return null;
  }
});

ipcMain.handle('save-settings', async (event, settings) => {
  try {
    const userDataPath = app.getPath('userData');
    const settingsPath = path.join(userDataPath, 'settings.json');
    console.log('[Settings] Attempting to save:', settings);
    console.log('[Settings] Path:', settingsPath);

    // Validate settings
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
      throw new Error('Settings must be a plain object');
    }

    // Ensure directory exists
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
      console.log('[Settings] Created userData directory:', userDataPath);
    }

    // Try writing a test file
    try {
      fs.writeFileSync(path.join(userDataPath, 'test_write.txt'), 'test');
      fs.unlinkSync(path.join(userDataPath, 'test_write.txt'));
    } catch (testErr) {
      throw new Error('Cannot write to userData directory: ' + testErr.message);
    }

    // Save settings
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    console.log('[Settings] Saved successfully');
    return { success: true };
  } catch (error) {
    console.error('[Settings] Save failed:', error);
    return { success: false, message: error.message, stack: error.stack };
  }
});

// Test settings handler for debugging
ipcMain.handle('test-settings', () => {
  try {
    const userDataPath = app.getPath('userData');
    const settingsPath = path.join(userDataPath, 'settings.json');
    
    console.log('Test settings - User data path:', userDataPath);
    console.log('Test settings - Settings path:', settingsPath);
    console.log('Test settings - User data exists:', fs.existsSync(userDataPath));
    console.log('Test settings - Settings file exists:', fs.existsSync(settingsPath));
    
    if (fs.existsSync(settingsPath)) {
      const settingsData = fs.readFileSync(settingsPath, 'utf8');
      console.log('Test settings - File content:', settingsData);
    }
    
    return {
      userDataPath,
      settingsPath,
      userDataExists: fs.existsSync(userDataPath),
      settingsFileExists: fs.existsSync(settingsPath)
    };
  } catch (error) {
    console.error('Test settings error:', error);
    throw error;
  }
}); 