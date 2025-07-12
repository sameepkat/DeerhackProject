import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Device {
  id: string;
  ip: string;
  port: string;
  token: string;
  hostType?: string;
  name: string;
  lastConnected?: number;
}

const DEVICES_STORAGE_KEY = 'paired_devices';

export class DeviceStorage {
  static async getAllDevices(): Promise<Device[]> {
    try {
      const devicesJson = await AsyncStorage.getItem(DEVICES_STORAGE_KEY);
      return devicesJson ? JSON.parse(devicesJson) : [];
    } catch (error) {
      console.error('Error loading devices:', error);
      return [];
    }
  }

  static async saveDevice(device: Device): Promise<void> {
    try {
      const devices = await this.getAllDevices();
      const existingIndex = devices.findIndex(d => d.id === device.id);
      
      if (existingIndex >= 0) {
        // Update existing device
        devices[existingIndex] = { ...devices[existingIndex], ...device };
      } else {
        // Add new device
        devices.push(device);
      }
      
      await AsyncStorage.setItem(DEVICES_STORAGE_KEY, JSON.stringify(devices));
    } catch (error) {
      console.error('Error saving device:', error);
    }
  }

  static async updateDeviceName(deviceId: string, name: string): Promise<void> {
    try {
      const devices = await this.getAllDevices();
      const deviceIndex = devices.findIndex(d => d.id === deviceId);
      
      if (deviceIndex >= 0) {
        devices[deviceIndex].name = name;
        await AsyncStorage.setItem(DEVICES_STORAGE_KEY, JSON.stringify(devices));
      }
    } catch (error) {
      console.error('Error updating device name:', error);
    }
  }

  

  static async updateLastConnected(deviceId: string): Promise<void> {
    try {
      const devices = await this.getAllDevices();
      const deviceIndex = devices.findIndex(d => d.id === deviceId);
      
      if (deviceIndex >= 0) {
        devices[deviceIndex].lastConnected = Date.now();
        await AsyncStorage.setItem(DEVICES_STORAGE_KEY, JSON.stringify(devices));
      }
    } catch (error) {
      console.error('Error updating last connected time:', error);
    }
  }

  static async removeDevice(deviceId: string): Promise<void> {
    try {
      const devices = await this.getAllDevices();
      const filteredDevices = devices.filter(d => d.id !== deviceId);
      await AsyncStorage.setItem(DEVICES_STORAGE_KEY, JSON.stringify(filteredDevices));
    } catch (error) {
      console.error('Error removing device:', error);
    }
  }

  static generateDeviceId(ip: string, port: string): string {
    return `${ip}:${port}`;
  }
} 