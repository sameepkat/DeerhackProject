import { useState, useRef } from 'react';

export default function ClipboardSync() {
  const [clipboard, setClipboard] = useState('');
  const [received, setReceived] = useState('');
  const ws = useRef<WebSocket | null>(null);

  // Local clipboard paste
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setClipboard(text);
    } catch {
      alert('Failed to read clipboard');
    }
  };

  // Local clipboard copy
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(received);
      alert('Copied to clipboard!');
    } catch {
      alert('Failed to copy');
    }
  };

  // WebSocket connect (scaffold)
  const connectWebSocket = () => {
    if (ws.current) return;
    ws.current = new WebSocket('ws://localhost:9000'); // Change to your backend URL
    ws.current.onopen = () => console.log('WebSocket connected');
    ws.current.onmessage = (event) => {
      // Assume message is clipboard text
      setReceived(event.data);
    };
    ws.current.onclose = () => {
      ws.current = null;
      console.log('WebSocket closed');
    };
  };

  // Send clipboard to server (scaffold)
  const sendClipboard = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(clipboard);
    } else {
      alert('WebSocket not connected');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8">
      <h2 className="text-2xl font-semibold mb-4">Clipboard Sync</h2>
      <div className="flex gap-2 mb-2">
        <button onClick={handlePaste} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Paste from System</button>
        <button onClick={connectWebSocket} className="px-3 py-1 bg-green-200 rounded hover:bg-green-300">Connect WebSocket</button>
      </div>
      <textarea
        className="w-full h-32 p-2 border rounded mb-4"
        placeholder="Type or paste clipboard content here..."
        value={clipboard}
        onChange={e => setClipboard(e.target.value)}
      />
      <button onClick={sendClipboard} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-6">Send to Desktop</button>
      <div className="bg-gray-100 p-4 rounded mt-4">
        <div className="font-medium mb-2 flex items-center gap-2">
          Received Clipboard:
          <button onClick={handleCopy} className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300">Copy</button>
        </div>
        <div className="text-gray-700 min-h-[2rem]">{received || 'Nothing received yet.'}</div>
      </div>
    </div>
  );
} 