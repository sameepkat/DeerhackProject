import React, { createContext, useContext, useState, useEffect } from 'react';

const TransferContext = createContext();

export const useTransfer = () => {
  const context = useContext(TransferContext);
  if (!context) {
    throw new Error('useTransfer must be used within a TransferProvider');
  }
  return context;
};

export const TransferProvider = ({ children }) => {
  const [transfers, setTransfers] = useState([]);
  const [activeTransfers, setActiveTransfers] = useState([]);

  useEffect(() => {
    // Listen for transfer events
    const handleTransferProgress = (event, { transferId, progress, status }) => {
      setActiveTransfers(prev => {
        const existing = prev.find(t => t.id === transferId);
        if (existing) {
          return prev.map(t => 
            t.id === transferId 
              ? { ...t, progress, status } 
              : t
          );
        }
        return [...prev, { id: transferId, progress, status }];
      });
    };

    const handleFileReceived = (event, file) => {
      setTransfers(prev => [...prev, {
        id: Date.now(),
        type: 'received',
        file,
        timestamp: new Date(),
        status: 'completed'
      }]);
    };

    if (window.electronAPI) {
      window.electronAPI.onTransferProgress(handleTransferProgress);
      window.electronAPI.onFileReceived(handleFileReceived);

      return () => {
        window.electronAPI.removeAllListeners('transfer-progress');
        window.electronAPI.removeAllListeners('file-received');
      };
    }
  }, []);

  const sendFiles = async (deviceId, files) => {
    try {
      const transferId = Date.now();
      
      // Add to active transfers
      setActiveTransfers(prev => [...prev, {
        id: transferId,
        deviceId,
        files,
        progress: 0,
        status: 'pending'
      }]);

      // Send files
      await window.electronAPI.sendFiles(deviceId, files);

      // Add to completed transfers
      setTransfers(prev => [...prev, {
        id: transferId,
        type: 'sent',
        deviceId,
        files,
        timestamp: new Date(),
        status: 'completed'
      }]);

      // Remove from active transfers
      setActiveTransfers(prev => prev.filter(t => t.id !== transferId));

    } catch (error) {
      console.error('Failed to send files:', error);
      
      // Update transfer status to failed
      setActiveTransfers(prev => 
        prev.map(t => 
          t.deviceId === deviceId 
            ? { ...t, status: 'failed', error: error.message }
            : t
        )
      );
    }
  };

  const receiveFiles = async (deviceId) => {
    try {
      await window.electronAPI.receiveFiles(deviceId);
    } catch (error) {
      console.error('Failed to receive files:', error);
    }
  };

  const cancelTransfer = (transferId) => {
    setActiveTransfers(prev => prev.filter(t => t.id !== transferId));
  };

  const clearCompletedTransfers = () => {
    setTransfers([]);
  };

  const value = {
    transfers,
    activeTransfers,
    sendFiles,
    receiveFiles,
    cancelTransfer,
    clearCompletedTransfers
  };

  return (
    <TransferContext.Provider value={value}>
      {children}
    </TransferContext.Provider>
  );
}; 