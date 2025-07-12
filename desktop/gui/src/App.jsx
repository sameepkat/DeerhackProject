import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import Dashboard from './pages/Dashboard';
import QRCode from './components/QRCode';
import Devices from './pages/Devices';
import FileTransfer from './pages/FileTransfer';
import MultimediaControl from './pages/MultimediaControl';
import Settings from './pages/Settings';
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
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

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
            {/* Desktop Sidebar */}
            <div className="hidden lg:flex lg:flex-shrink-0">
              <Sidebar />
            </div>
            
            {/* Mobile Navigation */}
            <div className="lg:hidden">
              <MobileNav 
                isOpen={isMobileNavOpen} 
                onClose={() => setIsMobileNavOpen(false)}
              />
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-auto relative min-w-0">
              {/* Mobile Header */}
              <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setIsMobileNavOpen(true)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <h1 className="text-lg font-semibold text-gray-900">Connect</h1>
                  <div className="w-6"></div> {/* Spacer for centering */}
                </div>
              </div>

              {/* Content Area */}
              <div className="p-4 lg:p-6">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/qr" element={<QRCode />} />
                  <Route path="/devices" element={<Devices />} />
                  <Route path="/transfer" element={<FileTransfer />} />
                  <Route path="/multimedia" element={<MultimediaControl />} />
                  <Route path="/settings" element={<Settings />} />
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