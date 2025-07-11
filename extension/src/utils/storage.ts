import { StorageData, ConnectionSettings } from '../types';

export class StorageManager {
  private static instance: StorageManager;
  private defaultSettings: StorageData = {
    serverIP: 'localhost',
    serverPort: '9000',
    lastConnected: 0,
    settings: {}
  };

  private constructor() {}

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  async getSettings(): Promise<StorageData> {
    try {
      const result = await chrome.storage.local.get();
      return { ...this.defaultSettings, ...result };
    } catch (error) {
      console.error('Failed to get settings:', error);
      return this.defaultSettings;
    }
  }

  async saveSettings(settings: Partial<StorageData>): Promise<void> {
    try {
      await chrome.storage.local.set(settings);
      console.log('Settings saved:', settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  }

  async getConnectionSettings(): Promise<ConnectionSettings> {
    const settings = await this.getSettings();
    return {
      serverIP: settings.serverIP || 'localhost',
      serverPort: settings.serverPort || '9000'
    };
  }

  async saveConnectionSettings(connectionSettings: ConnectionSettings): Promise<void> {
    await this.saveSettings({
      serverIP: connectionSettings.serverIP,
      serverPort: connectionSettings.serverPort,
      lastConnected: Date.now()
    });
  }

  async getLastConnected(): Promise<number> {
    const settings = await this.getSettings();
    return settings.lastConnected || 0;
  }

  async updateLastConnected(): Promise<void> {
    await this.saveSettings({ lastConnected: Date.now() });
  }

  async clearSettings(): Promise<void> {
    try {
      await chrome.storage.local.clear();
      console.log('Settings cleared');
    } catch (error) {
      console.error('Failed to clear settings:', error);
      throw error;
    }
  }

  async getSetting<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const result = await chrome.storage.local.get(key);
      return result[key] !== undefined ? result[key] : defaultValue;
    } catch (error) {
      console.error(`Failed to get setting ${key}:`, error);
      return defaultValue;
    }
  }

  async setSetting<T>(key: string, value: T): Promise<void> {
    try {
      await chrome.storage.local.set({ [key]: value });
    } catch (error) {
      console.error(`Failed to set setting ${key}:`, error);
      throw error;
    }
  }

  onSettingsChanged(callback: (changes: { [key: string]: chrome.storage.StorageChange }) => void): void {
    chrome.storage.onChanged.addListener(callback);
  }

  removeSettingsChangedListener(callback: (changes: { [key: string]: chrome.storage.StorageChange }) => void): void {
    chrome.storage.onChanged.removeListener(callback);
  }
} 