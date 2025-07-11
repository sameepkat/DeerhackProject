import QRCode from 'react-qr-code';
import { useState } from 'react';

export default function Home() {
  // Connection info for QR code
  const qrData = JSON.stringify({ ws: 'ws://192.168.1.5:9000', token: 'abc123' });

  // Placeholder: replace with real connection state
  const [connected, setConnected] = useState(false);

  return (
    <div className="max-w-xl mx-auto p-8 flex flex-col items-center">
      {/* Status Bar */}
      <div className={`w-full mb-6 h-8 flex items-center justify-center rounded ${connected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
        style={{ transition: 'background 0.3s' }}
      >
        {connected ? 'Device Connected' : 'No Device Connected'}
      </div>
      <h1 className="text-3xl font-bold mb-6 text-center">Welcome to LAN Controller</h1>
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <h2 className="text-lg font-semibold mb-2">Pair Your Device</h2>
        <div className="w-40 h-40 bg-gray-50 flex items-center justify-center rounded mb-2">
          <QRCode value={qrData} size={150} />
        </div>
        <div className="text-xs text-gray-500 text-center">Scan this QR with your mobile app to pair and control your laptop over LAN.</div>
      </div>
    </div>
  );
} 