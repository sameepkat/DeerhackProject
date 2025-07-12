const { app, BrowserWindow, ipcMain, dialog, shell, Menu, Tray, nativeImage } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow;
let tray;

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
    ? 'http://localhost:3003' 
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
}

function createTray() {
  const iconPath = path.join(__dirname, 'assets/icon.png');
  tray = new Tray(nativeImage.createFromPath(iconPath));
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
      }
    },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);
  
  tray.setToolTip('Connect Desktop');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    mainWindow.show();
    mainWindow.focus();
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers
ipcMain.handle('select-files', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections']
  });
  return result.filePaths;
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

ipcMain.handle('start-discovery', () => {
  // Mock implementation
  console.log('Starting device discovery...');
  return true;
});

ipcMain.handle('stop-discovery', () => {
  // Mock implementation
  console.log('Stopping device discovery...');
  return true;
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
  // Mock implementation
  console.log('Showing notification:', title, body);
  return true;
});

ipcMain.handle('minimize-to-tray', () => {
  mainWindow.hide();
});

ipcMain.handle('show-window', () => {
  mainWindow.show();
  mainWindow.focus();
}); 