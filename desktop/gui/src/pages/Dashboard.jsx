import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Upload, 
  Download, 
  MessageSquare, 
  Wifi,
  Activity,
  Clock,
  FileText
} from 'lucide-react';
import { useDevices } from '../contexts/DeviceContext';
import { useTransfer } from '../contexts/TransferContext';

const Dashboard = () => {
  const { devices, selectedDevice, connectToDevice } = useDevices();
  const { transfers, activeTransfers } = useTransfer();
  const [localIP, setLocalIP] = useState('');

  useEffect(() => {
    const getIP = async () => {
      try {
        if (window.electronAPI) {
          const ip = await window.electronAPI.getLocalIP();
          setLocalIP(ip);
        } else {
          setLocalIP('127.0.0.1'); // Fallback for browser mode
        }
      } catch (error) {
        console.error('Failed to get local IP:', error);
        setLocalIP('127.0.0.1'); // Fallback
      }
    };
    getIP();
  }, []);

  const quickActions = [
    {
      icon: Upload,
      title: 'Send Files',
      description: 'Transfer files to connected devices',
      action: () => window.location.href = '/transfer',
      color: 'bg-blue-500'
    },
    {
      icon: Download,
      title: 'Receive Files',
      description: 'Accept incoming file transfers',
      action: () => window.location.href = '/transfer',
      color: 'bg-green-500'
    },
    {
      icon: MessageSquare,
      title: 'Send Message',
      description: 'Send messages to devices',
      action: () => window.location.href = '/messages',
      color: 'bg-purple-500'
    },
    {
      icon: Smartphone,
      title: 'Manage Devices',
      description: 'View and manage connected devices',
      action: () => window.location.href = '/devices',
      color: 'bg-orange-500'
    }
  ];

  const stats = [
    {
      label: 'Connected Devices',
      value: devices.length,
      icon: Smartphone,
      color: 'text-blue-600'
    },
    {
      label: 'Active Transfers',
      value: activeTransfers.length,
      icon: Activity,
      color: 'text-green-600'
    },
    {
      label: 'Total Transfers',
      value: transfers.length,
      icon: FileText,
      color: 'text-purple-600'
    },
    {
      label: 'Local IP',
      value: localIP || 'Unknown',
      icon: Wifi,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Overview of your connected devices and transfers</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${devices.length > 0 ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="text-sm text-gray-600">
            {devices.length > 0 ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-2 sm:p-3 rounded-lg bg-gray-100`}>
                <stat.icon className={`w-4 h-4 sm:w-6 sm:h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="card hover:shadow-md transition-shadow duration-200 text-left p-4 sm:p-6"
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 ${action.color} rounded-lg flex items-center justify-center mb-3 sm:mb-4`}>
                <action.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">{action.title}</h3>
              <p className="text-xs sm:text-sm text-gray-600">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Connected Devices */}
        <div className="card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Connected Devices</h3>
          {devices.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {devices.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full" />
                    <div>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">{device.name}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{device.type}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => connectToDevice(device.id)}
                    className="text-xs sm:text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Connect
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <Smartphone className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <p className="text-gray-600 text-sm sm:text-base">No devices connected</p>
              <p className="text-xs sm:text-sm text-gray-500">Devices will appear here when discovered</p>
            </div>
          )}
        </div>

        {/* Recent Transfers */}
        <div className="card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Recent Transfers</h3>
          {transfers.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {transfers.slice(0, 5).map((transfer) => (
                <div key={transfer.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${transfer.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <div>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">
                        {transfer.type === 'sent' ? 'Sent' : 'Received'} files
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {transfer.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500">
                    {transfer.files?.length || 1} file(s)
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <FileText className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <p className="text-gray-600 text-sm sm:text-base">No transfers yet</p>
              <p className="text-xs sm:text-sm text-gray-500">File transfers will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 