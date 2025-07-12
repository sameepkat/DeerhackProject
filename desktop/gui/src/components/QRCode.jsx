import React, { useState, useEffect } from 'react';
import { QrCode, RefreshCw, Wifi, Play, Square } from 'lucide-react';

const QRCode = () => {
  const [localIP, setLocalIP] = useState('');
  const [port, setPort] = useState(9000);
  const [pairingToken, setPairingToken] = useState('');
  const [qrData, setQrData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverRunning, setServerRunning] = useState(false);

  useEffect(() => {
    const initializeServer = async () => {
      try {
        if (window.electronAPI) {
          // Start the Python server
          const started = await window.electronAPI.startPythonServer();
          if (started) {
            setServerRunning(true);
          }
          
          // Get initial pairing info
          const pairingInfo = await window.electronAPI.getPairingInfo();
          if (pairingInfo) {
            updatePairingInfo(pairingInfo);
          }
          
          // Listen for pairing info updates
          window.electronAPI.onPairingInfoUpdated((event, info) => {
            updatePairingInfo(info);
          });
        }
      } catch (error) {
        console.error('Failed to initialize server:', error);
      }
    };
    
    initializeServer();
    
    // Cleanup function
    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners('pairing-info-updated');
      }
    };
  }, []);
  
  const updatePairingInfo = (info) => {
    if (info.server_ip) setLocalIP(info.server_ip);
    if (info.port_no) setPort(info.port_no);
    if (info.pairing_token) setPairingToken(info.pairing_token);
    
    // Generate QR data with pairing info
    if (info.server_ip && info.port_no && info.pairing_token) {
      const qrDataString = JSON.stringify({
        ip: info.server_ip,
        port: info.port_no,
        token: info.pairing_token
      });
      setQrData(qrDataString);
    }
  };



  const refreshQR = async () => {
    setIsLoading(true);
    try {
      if (window.electronAPI) {
        // Restart the Python server to get fresh pairing info
        await window.electronAPI.stopPythonServer();
        const started = await window.electronAPI.startPythonServer();
        if (started) {
          setServerRunning(true);
        }
      }
    } catch (error) {
      console.error('Failed to refresh QR:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleServer = async () => {
    if (serverRunning) {
      await window.electronAPI.stopPythonServer();
      setServerRunning(false);
    } else {
      const started = await window.electronAPI.startPythonServer();
      setServerRunning(started);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">QR Code</h1>
          <p className="text-sm sm:text-base text-gray-600">Scan to connect your mobile device</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${serverRunning ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {serverRunning ? 'Server running' : 'Server stopped'}
          </span>
          <button
            onClick={toggleServer}
            className="ml-2 p-1 rounded hover:bg-gray-100 transition-colors"
            title={serverRunning ? 'Stop server' : 'Start server'}
          >
            {serverRunning ? (
              <Square className="w-4 h-4 text-red-600" />
            ) : (
              <Play className="w-4 h-4 text-green-600" />
            )}
          </button>
        </div>
      </div>

      {/* Main QR Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* QR Code Display */}
        <div className="card p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Connection QR</h2>
            <button
              onClick={refreshQR}
              disabled={isLoading}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          {/* QR Code Placeholder */}
          <div className="flex flex-col items-center space-y-4 sm:space-y-6">
            <div className="relative">
              {/* This div will be replaced with actual QR code from Python */}
              <div className="w-48 h-48 sm:w-64 sm:h-64 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div className="text-center">
                  {serverRunning && qrData ? (
                    <div>
                      <QrCode className="w-12 h-12 sm:w-16 sm:h-16 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-700 font-medium">QR Code Ready</p>
                      <p className="text-xs text-gray-500 mt-1">Scan to connect</p>
                    </div>
                  ) : (
                    <div>
                      <QrCode className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        {serverRunning ? 'Initializing...' : 'Start server to generate QR'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Waiting for pairing info</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Connection Status Overlay */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Scan with your mobile device</p>
              <p className="text-xs text-gray-500">Point your camera at the QR code</p>
            </div>
          </div>
        </div>

                  {/* Connection Info */}
          <div className="space-y-4 sm:space-y-6">
            {/* Connection Details */}
            <div className="card p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Connection Details</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Wifi className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Local IP Address</p>
                      <p className="text-xs text-gray-600">Your device's network address</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm text-gray-900">{localIP || 'Loading...'}</p>
                    <p className="text-xs text-gray-500">Port: {port}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <QrCode className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Pairing Token</p>
                      <p className="text-xs text-gray-600">Security token for device pairing</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm text-gray-900">{pairingToken || 'Loading...'}</p>
                    <p className="text-xs text-gray-500">Auto-generated</p>
                  </div>
                </div>
              </div>
            </div>

          {/* Instructions */}
          <div className="card p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">How to Connect</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-blue-600">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Open SyncBridge mobile app</p>
                  <p className="text-xs text-gray-600">Launch the SyncBridge app on your mobile device</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-blue-600">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Scan the QR code</p>
                  <p className="text-xs text-gray-600">Use the app's QR scanner to scan this code</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-blue-600">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Confirm connection</p>
                  <p className="text-xs text-gray-600">Accept the connection request in the app</p>
                </div>
              </div>
            </div>
          </div>

          {/* Troubleshooting */}
          <div className="card p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Troubleshooting</h3>
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-xs text-gray-600">Make sure both devices are on the same network</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-xs text-gray-600">Check that your firewall allows the connection</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-xs text-gray-600">Try refreshing the QR code if connection fails</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCode; 