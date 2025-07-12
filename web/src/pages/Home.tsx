import QRCode from 'react-qr-code';
import { useState } from 'react';

export default function Home() {
  // Connection info for QR code
  const qrData = JSON.stringify({ ws: 'ws://192.168.1.5:9000', token: 'abc123' });

  // Placeholder: replace with real connection state
  const [connected] = useState(false);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          LAN Controller
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Control your computer remotely with your mobile device. 
          Perfect for presentations, file sharing, and device management.
        </p>
      </div>

      {/* Connection Status */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Connection Status</h2>
          <div className={`px-4 py-2 rounded-full text-sm font-medium ${
            connected 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {connected ? '🟢 Connected' : '🔴 Disconnected'}
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* QR Code Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Pair Your Device</h3>
            <div className="bg-gray-50 rounded-xl p-6 flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                <QRCode value={qrData} size={180} />
              </div>
              <p className="text-sm text-gray-600 text-center">
                Scan this QR code with your mobile app to establish a connection
              </p>
            </div>
          </div>
          
          {/* Connection Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Connection Details</h3>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">WebSocket URL</div>
                <div className="font-mono text-sm bg-white px-3 py-2 rounded border">
                  ws://192.168.1.5:9000
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Connection Token</div>
                <div className="font-mono text-sm bg-white px-3 py-2 rounded border">
                  abc123
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Local IP</div>
                <div className="font-mono text-sm bg-white px-3 py-2 rounded border">
                  192.168.1.5
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 