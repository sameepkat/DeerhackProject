import React, { createContext, useContext, useState, useEffect } from 'react';

const DeviceContext = createContext();

export const useDevices = () => {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDevices must be used within a DeviceProvider');
  }
  return context;
};

export const DeviceProvider = ({ children }) => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isDiscovering, setIsDiscovering] = useState(false);

  useEffect(() => {
    // Listen for device discovery events
    const handleDeviceFound = (event, device) => {
      setDevices(prev => {
        const existing = prev.find(d => d.id === device.id);
        if (existing) {
          return prev.map(d => d.id === device.id ? { ...d, ...device } : d);
        }
        return [...prev, device];
      });
    };

    const handleDeviceLost = (event, deviceId) => {
      setDevices(prev => prev.filter(d => d.id !== deviceId));
      if (selectedDevice?.id === deviceId) {
        setSelectedDevice(null);
      }
    };

    if (window.electronAPI) {
      window.electronAPI.onDeviceFound(handleDeviceFound);
      window.electronAPI.onDeviceLost(handleDeviceLost);

      return () => {
        window.electronAPI.removeAllListeners('device-found');
        window.electronAPI.removeAllListeners('device-lost');
      };
    }
  }, [selectedDevice]);

  const startDiscovery = async () => {
    try {
      setIsDiscovering(true);
      await window.electronAPI.startDiscovery();
    } catch (error) {
      console.error('Failed to start discovery:', error);
    }
  };

  const stopDiscovery = async () => {
    try {
      setIsDiscovering(false);
      await window.electronAPI.stopDiscovery();
    } catch (error) {
      console.error('Failed to stop discovery:', error);
    }
  };

  const connectToDevice = async (deviceId) => {
    const device = devices.find(d => d.id === deviceId);
    if (device) {
      setSelectedDevice(device);
      return true;
    }
    return false;
  };

  const disconnectFromDevice = () => {
    setSelectedDevice(null);
  };

  const value = {
    devices,
    selectedDevice,
    isDiscovering,
    startDiscovery,
    stopDiscovery,
    connectToDevice,
    disconnectFromDevice,
    setSelectedDevice
  };

  return (
    <DeviceContext.Provider value={value}>
      {children}
    </DeviceContext.Provider>
  );
}; 