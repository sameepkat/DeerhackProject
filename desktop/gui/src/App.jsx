import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

import QRCode from './components/QRCode';
import { DeviceProvider } from './contexts/DeviceContext';
import { TransferProvider } from './contexts/TransferContext';

// Component to handle tray actions
function TrayActionHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    if (window.electronAPI) {
      const handleTrayAction = (event, action) => {
        console.log('Tray action received:', action);
        
        switch (action) {
          case 'send-files':
            navigate('/transfer');
            break;
          case 'receive-files':
            navigate('/transfer');
            break;
          case 'clipboard-sync':
            // You could navigate to a clipboard sync page or trigger clipboard sync
            console.log('Clipboard sync requested');
            break;
          case 'settings':
            navigate('/settings');
            break;
          default:
            console.log('Unknown tray action:', action);
        }
      };

      window.electronAPI.onTrayAction(handleTrayAction);

      return () => {
        window.electronAPI.removeAllListeners('tray-action');
      };
    }
  }, [navigate]);

  return null;
}

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [localIP, setLocalIP] = useState('');

  useEffect(() => {
    // Initialize app
    const initApp = async () => {
      try {
        if (window.electronAPI) {
          const version = await window.electronAPI.getAppVersion();
          console.log('App version:', version);
          
          // Get local IP address
          const ip = await window.electronAPI.getLocalIP();
          setLocalIP(ip);
          
          // Start device discovery
          await window.electronAPI.startDiscovery();
          setIsConnected(true);
        } else {
          console.warn('Electron API not available - running in browser mode');
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initApp();

    // Cleanup
    return () => {
      if (window.electronAPI) {
        window.electronAPI.stopDiscovery();
      }
    };
  }, []);

  return (
    <DeviceProvider>
      <TransferProvider>
        <Router>
          <TrayActionHandler />
          <div className="flex h-screen bg-gray-50">
            {/* Main Content */}
            <main className="flex-1 overflow-auto relative min-w-0">
              {/* Content Area */}
              <div className="p-4 lg:p-6">
                <Routes>
                  <Route path="/" element={<QRCode />} />
                </Routes>
              </div>
            </main>
          </div>
        </Router>
      </TransferProvider>
    </DeviceProvider>
  );
}

export default App;
