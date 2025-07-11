import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import { Device, DeviceStorage } from './DeviceStorage';
import { AppState, AppStateStatus } from 'react-native';

// Types for context
interface WebSocketContextType {
  ws: WebSocket | null;
  connected: boolean;
  lastMessage: string | null;
  connectedDevice: Device | null;
  isAutoConnecting: boolean;
  connect: (ip: string, port: string, token: string) => void;
  connectToDevice: (device: Device) => void;
  disconnect: () => void;
  send: (data: string) => void;
  startAutoConnect: () => void;
  stopAutoConnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [isAutoConnecting, setIsAutoConnecting] = useState(false);
  const autoConnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasInitialAutoConnectRef = useRef(false);

  const connect = useCallback((ip: string, port: string, token: string) => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    const ws = new WebSocket(`ws://${ip}:${port}`);
    wsRef.current = ws;
    setConnected(false);
    setConnectedDevice(null);
    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ type: 'pair', token }));
      // Update lastConnected timestamp for the connected device
      if (connectedDevice) {
        DeviceStorage.updateLastConnected(connectedDevice.id);
      }
    };
    ws.onmessage = (event) => {
      setLastMessage(event.data);
    };
    ws.onerror = () => {
      setConnected(false);
      setConnectedDevice(null);
    };
    ws.onclose = () => {
      setConnected(false);
      setConnectedDevice(null);
    };
  }, []);

  const connectToDevice = useCallback((device: Device) => {
    connect(device.ip, device.port, device.token);
    setConnectedDevice(device);
  }, [connect]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnected(false);
    setConnectedDevice(null);
  }, []);

  const send = useCallback((data: string) => {
    if (wsRef.current && connected) {
      wsRef.current.send(data);
    }
  }, [connected]);

  const startAutoConnect = useCallback(async () => {
    if (connected || isAutoConnecting) {
      console.log('Auto-connect skipped: already connected or connecting');
      return;
    }
    
    setIsAutoConnecting(true);
    const devices = await DeviceStorage.getAllDevices();
    
    if (devices.length === 0) {
      setIsAutoConnecting(false);
      return;
    }
    
    // Sort by lastConnected (most recent first)
    const sortedDevices = devices.sort((a, b) => {
      const aTime = a.lastConnected || 0;
      const bTime = b.lastConnected || 0;
      return bTime - aTime;
    });

    let currentIndex = 0;
    
    const tryNextDevice = () => {
      if (connected || currentIndex >= sortedDevices.length) {
        console.log('Auto-connect finished: connected or no more devices');
        setIsAutoConnecting(false);
        return;
      }

      const device = sortedDevices[currentIndex];
      console.log(`Auto-connecting to device: ${device.name} (${device.ip}:${device.port})`);
      
      connectToDevice(device);
      
      // Wait 3 seconds before trying next device
      autoConnectTimeoutRef.current = setTimeout(() => {
        if (!connected && !isAutoConnecting) {
          currentIndex++;
          tryNextDevice();
        } else {
          console.log('Auto-connect timeout: connected or stopped');
          setIsAutoConnecting(false);
        }
      }, 3000);
    };

    tryNextDevice();
  }, [connected, isAutoConnecting]);

  const stopAutoConnect = useCallback(() => {
    if (autoConnectTimeoutRef.current) {
      clearTimeout(autoConnectTimeoutRef.current);
      autoConnectTimeoutRef.current = null;
    }
    setIsAutoConnecting(false);
  }, []);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && !connected && !isAutoConnecting) {
        // App came to foreground, try to auto-connect
        startAutoConnect();
      } else if (nextAppState === 'background') {
        // App went to background, stop auto-connecting
        stopAutoConnect();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    // Try to auto-connect when the provider mounts (only once)
    if (!connected && !isAutoConnecting && !hasInitialAutoConnectRef.current) {
      hasInitialAutoConnectRef.current = true;
      const initialAutoConnect = async () => {
        await startAutoConnect();
      };
      initialAutoConnect();
    }

    return () => {
      subscription?.remove();
      stopAutoConnect();
    };
  }, []); // Empty dependency array - only run once on mount

  return (
    <WebSocketContext.Provider value={{ 
      ws: wsRef.current, 
      connected, 
      lastMessage, 
      connectedDevice,
      isAutoConnecting,
      connect, 
      connectToDevice,
      disconnect, 
      send,
      startAutoConnect,
      stopAutoConnect
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export function useWebSocket() {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error('useWebSocket must be used within a WebSocketProvider');
  return ctx;
} 