import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Smartphone, 
  FolderOpen, 
  Volume2, 
  Settings,
  Wifi,
  WifiOff,
  QrCode
} from 'lucide-react';
import { useDevices } from '../contexts/DeviceContext';

const Sidebar = () => {
  const { devices, isDiscovering } = useDevices();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/qr', icon: QrCode, label: 'QR Code' },
    { path: '/devices', icon: Smartphone, label: 'Devices' },
    { path: '/transfer', icon: FolderOpen, label: 'File Transfer' },
    { path: '/multimedia', icon: Volume2, label: 'Multimedia' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-64 lg:w-72 xl:w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Wifi className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Connect</h1>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${isDiscovering ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-xs text-gray-500">
                {isDiscovering ? 'Discovering' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Status */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Connected Devices</span>
            <span className="text-sm text-gray-500">{devices.length}</span>
          </div>
          {devices.length > 0 && (
            <div className="mt-2 space-y-1">
              {devices.slice(0, 3).map((device) => (
                <div key={device.id} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-xs text-gray-600 truncate">{device.name}</span>
                </div>
              ))}
              {devices.length > 3 && (
                <span className="text-xs text-gray-500">+{devices.length - 3} more</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;