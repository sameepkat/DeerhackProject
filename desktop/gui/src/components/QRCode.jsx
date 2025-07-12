import React, { useState, useEffect } from 'react';
import { QrCode, RefreshCw, Wifi } from 'lucide-react';
// Removed: import pairingQR from "../../../assests/pairing_qr.png";

const QRCode = () => {
  const [localIP, setLocalIP] = useState('');
  const [qrData, setQrData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Directly use the static path to the QR code image in the assets folder
  const qrPath = 'assets/pairing_qr.png';

  useEffect(() => {
    const getIP = async () => {
      try {
        if (window.electronAPI) {
          const ip = await window.electronAPI.getLocalIP();
          setLocalIP(ip);
          setQrData(`http://${ip}:3000`);
          // Use Electron's IPC to get the QR code path
          // window.electronAPI.getQrPath().then((path) => {
          //   setQrPath(`file://${path}?t=${Date.now()}`); // cache-busting
          // });
        } else {
          setLocalIP('127.0.0.1');
          setQrData('http://127.0.0.1:3000');
        }
      } catch (error) {
        console.error('Failed to get local IP:', error);
        setLocalIP('127.0.0.1');
        setQrData('http://127.0.0.1:3000');
      }
    };
    getIP();
  }, []);

  const refreshQR = async () => {
    setIsLoading(true);
    try {
      if (window.electronAPI) {
        const ip = await window.electronAPI.getLocalIP();
        setLocalIP(ip);
        setQrData(`http://${ip}:3000`);
        // Force reload the QR image by updating the timestamp
        // window.electronAPI.getQrPath().then((path) => {
        //   setQrPath(`file://${path}?t=${Date.now()}`);
        // });
      }
    } catch (error) {
      console.error('Failed to refresh QR:', error);
    } finally {
      setIsLoading(false);
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
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm text-gray-600">Ready to connect</span>
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
          {/* QR Code Display */}
          <div className="flex flex-col items-center space-y-4 sm:space-y-6">
            <div className="relative">
              <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-xl border-2 border-gray-200 overflow-hidden">
                <img
                  src={qrPath}
                  alt="Pairing QR"
                  style={{ width: 256, height: 256 }}
                />
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
                    <p className="font-mono text-sm text-gray-900">{localIP}</p>
                    <p className="text-xs text-gray-500">Port: 3000</p>
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