import React, { useState } from 'react';
import { 
  Smartphone, 
  Laptop, 
  Tablet, 
  Wifi, 
  WifiOff,
  RefreshCw,
  Settings,
  Trash2,
  Copy,
  QrCode
} from 'lucide-react';
import { useDevices } from '../contexts/DeviceContext';

const Devices = () => {
  const { 
    devices, 
    selectedDevice, 
    isDiscovering, 
    startDiscovery, 
    stopDiscovery,
    connectToDevice,
    disconnectFromDevice 
  } = useDevices();

  const [showQR, setShowQR] = useState(false);
  const [localIP, setLocalIP] = useState('');

  const getDeviceIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'laptop':
        return Laptop;
      case 'tablet':
        return Tablet;
      default:
        return Smartphone;
    }
  };

  const handleDiscoveryToggle = async () => {
    if (isDiscovering) {
      await stopDiscovery();
    } else {
      await startDiscovery();
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // Show success notification
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const DeviceCard = ({ device }) => {
    const DeviceIcon = getDeviceIcon(device.type);
    const isConnected = selectedDevice?.id === device.id;

    return (
      <div className="card hover:shadow-md transition-shadow duration-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <DeviceIcon className="w-4 h-4 sm:w-6 sm:h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{device.name}</h3>
              <p className="text-xs sm:text-sm text-gray-600">{device.type || 'Unknown'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-xs text-gray-500">
              {isConnected ? 'Connected' : 'Available'}
            </span>
          </div>
        </div>

        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-gray-600">IP Address:</span>
            <span className="font-mono text-gray-900 text-xs sm:text-sm">{device.ip}</span>
          </div>
          
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-gray-600">Last Seen:</span>
            <span className="text-gray-900 text-xs sm:text-sm">
              {device.lastSeen ? new Date(device.lastSeen).toLocaleTimeString() : 'Unknown'}
            </span>
          </div>

          <div className="flex items-center space-x-2 pt-2 sm:pt-3 border-t border-gray-200">
            {isConnected ? (
              <button
                onClick={() => disconnectFromDevice()}
                className="btn-secondary text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={() => connectToDevice(device.id)}
                className="btn-primary text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
              >
                Connect
              </button>
            )}
            
            <button
              onClick={() => copyToClipboard(device.ip)}
              className="p-1 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Copy IP"
            >
              <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Devices</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage your connected devices and discovery</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={handleDiscoveryToggle}
            className={`flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm ${
              isDiscovering 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {isDiscovering ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
            <span className="font-medium">
              {isDiscovering ? 'Stop Discovery' : 'Start Discovery'}
            </span>
          </button>
          
          <button
            onClick={() => setShowQR(!showQR)}
            className="btn-secondary text-sm"
          >
            <QrCode className="w-4 h-4 mr-2" />
            Show QR
          </button>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-sm w-full">
            <div className="text-center">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Connect to this device</h3>
              <div className="bg-gray-100 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white mx-auto rounded-lg flex items-center justify-center">
                  <QrCode className="w-16 h-16 sm:w-24 sm:h-24 text-gray-400" />
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                Scan this QR code with your mobile device to connect
              </p>
              <button
                onClick={() => setShowQR(false)}
                className="btn-secondary w-full text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connection Info */}
      <div className="card p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Connection Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
            <span className="text-xs sm:text-sm font-medium text-gray-600">Status</span>
            <span className={`text-xs sm:text-sm font-medium ${isDiscovering ? 'text-green-600' : 'text-gray-600'}`}>
              {isDiscovering ? 'Discovering' : 'Stopped'}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
            <span className="text-xs sm:text-sm font-medium text-gray-600">Devices Found</span>
            <span className="text-xs sm:text-sm font-medium text-gray-900">{devices.length}</span>
          </div>
          
          <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
            <span className="text-xs sm:text-sm font-medium text-gray-600">Connected</span>
            <span className="text-xs sm:text-sm font-medium text-gray-900">
              {selectedDevice ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>

      {/* Devices Grid */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Available Devices</h2>
          <button
            onClick={handleDiscoveryToggle}
            className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900"
          >
            <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${isDiscovering ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {devices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {devices.map((device) => (
              <DeviceCard key={device.id} device={device} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <Smartphone className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No devices found</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
              {isDiscovering 
                ? 'Searching for devices on your network...' 
                : 'Start discovery to find devices'
              }
            </p>
            {!isDiscovering && (
              <button
                onClick={startDiscovery}
                className="btn-primary text-sm"
              >
                Start Discovery
              </button>
            )}
          </div>
        )}
      </div>

      {/* Connected Device Details */}
      {selectedDevice && (
        <div className="card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Connected Device</h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <h4 className="font-medium text-gray-900 text-sm sm:text-base">{selectedDevice.name}</h4>
                <p className="text-xs sm:text-sm text-gray-600">{selectedDevice.type}</p>
              </div>
              <button
                onClick={disconnectFromDevice}
                className="btn-secondary text-sm"
              >
                Disconnect
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div>
                <span className="text-gray-600">IP Address:</span>
                <p className="font-mono text-gray-900">{selectedDevice.ip}</p>
              </div>
              <div>
                <span className="text-gray-600">Connection Time:</span>
                <p className="text-gray-900">
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Devices; 