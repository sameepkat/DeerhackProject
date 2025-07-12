import { useState, useRef, useEffect } from 'react';

export default function ClipboardSync() {
  const [clipboard, setClipboard] = useState('');
  const [received, setReceived] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const ws = useRef<WebSocket | null>(null);

  // Local clipboard paste
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setClipboard(text);
    } catch (error) {
      console.error('Failed to read clipboard:', error);
      alert('Failed to read clipboard. Please ensure you have granted clipboard permissions.');
    }
  };

  // Local clipboard copy
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(received);
      // Show success feedback
      const button = document.getElementById('copy-btn');
      if (button) {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.className = 'px-3 py-1 text-xs bg-green-200 text-green-700 rounded hover:bg-green-300 transition-colors';
        setTimeout(() => {
          button.textContent = originalText;
          button.className = 'px-3 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 transition-colors';
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy to clipboard');
    }
  };

  // WebSocket connect
  const connectWebSocket = () => {
    if (ws.current) return;
    
    setConnectionStatus('Connecting...');
    ws.current = new WebSocket('ws://localhost:9000'); // Change to your backend URL
    
    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setConnectionStatus('Connected');
    };
    
    ws.current.onmessage = (event) => {
      // Assume message is clipboard text
      setReceived(event.data);
    };
    
    ws.current.onclose = () => {
      ws.current = null;
      setIsConnected(false);
      setConnectionStatus('Disconnected');
      console.log('WebSocket closed');
    };
    
    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('Connection Failed');
      setIsConnected(false);
    };
  };

  // Disconnect WebSocket
  const disconnectWebSocket = () => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
  };

  // Send clipboard to server
  const sendClipboard = () => {
    if (!clipboard.trim()) {
      alert('Please enter some text to send');
      return;
    }
    
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(clipboard);
      // Show success feedback
      const button = document.getElementById('send-btn');
      if (button) {
        const originalText = button.textContent;
        button.textContent = 'Sent!';
        button.className = 'px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors';
        setTimeout(() => {
          button.textContent = originalText;
          button.className = 'px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors';
        }, 2000);
      }
    } else {
      alert('WebSocket not connected. Please connect first.');
    }
  };

  // Auto-connect on component mount
  useEffect(() => {
    connectWebSocket();
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-blue-600">
          Clipboard Sync
        </h1>
        <p className="text-lg text-gray-600">
          Share clipboard content across your devices in real-time
        </p>
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Send Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Send Clipboard</h3>
            <button 
              onClick={handlePaste}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
            >
              Paste from System
            </button>
          </div>
          
          <textarea
            className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Type or paste clipboard content here..."
            value={clipboard}
            onChange={e => setClipboard(e.target.value)}
          />
          
          <button 
            id="send-btn"
            onClick={sendClipboard}
            disabled={!isConnected}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full"
          >
            Send to Connected Device
          </button>
        </div>

        {/* Receive Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Received Clipboard</h3>
            <button 
              id="copy-btn"
              onClick={handleCopy}
              disabled={!received}
              className="px-3 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Copy
            </button>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 min-h-[8rem] border border-gray-200">
            <div className="text-gray-700 whitespace-pre-wrap">
              {received || 'Nothing received yet. Connect to start receiving clipboard content.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 