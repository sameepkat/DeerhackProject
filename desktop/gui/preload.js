const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  selectFiles: () => ipcRenderer.invoke('select-files'),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  
  // System operations
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  quitApp: () => ipcRenderer.invoke('quit-app'),
  
  // Window operations
  minimizeToTray: () => ipcRenderer.invoke('minimize-to-tray'),
  showWindow: () => ipcRenderer.invoke('show-window'),
  
  // Network operations
  getLocalIP: () => ipcRenderer.invoke('get-local-ip'),
  
  // Device discovery
  startDiscovery: () => ipcRenderer.invoke('start-discovery'),
  stopDiscovery: () => ipcRenderer.invoke('stop-discovery'),
  updateConnectedDevices: (devices) => ipcRenderer.invoke('update-connected-devices', devices),
  
  // File transfer
  sendFiles: (deviceId, files) => ipcRenderer.invoke('send-files', deviceId, files),
  receiveFiles: (deviceId) => ipcRenderer.invoke('receive-files', deviceId),
  
  // Messaging
  sendMessage: (deviceId, message) => ipcRenderer.invoke('send-message', deviceId, message),
  
  // Clipboard
  getClipboard: () => ipcRenderer.invoke('get-clipboard'),
  setClipboard: (text) => ipcRenderer.invoke('set-clipboard', text),
  
  // Notifications
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', title, body),
  
  // Listeners
  onDeviceFound: (callback) => ipcRenderer.on('device-found', callback),
  onDeviceLost: (callback) => ipcRenderer.on('device-lost', callback),
  onFileReceived: (callback) => ipcRenderer.on('file-received', callback),
  onMessageReceived: (callback) => ipcRenderer.on('message-received', callback),
  onTransferProgress: (callback) => ipcRenderer.on('transfer-progress', callback),
  onTrayAction: (callback) => ipcRenderer.on('tray-action', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
}); 