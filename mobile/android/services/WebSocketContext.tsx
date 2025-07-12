import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import { Device, DeviceStorage } from './DeviceStorage';
import { AppState, AppStateStatus } from 'react-native';

// Types for context
interface WebSocketContextType {
  ws: WebSocket | null;
  connected: boolean;
  lastMessage: string | null;
  connectedDevice: Device | null;
  connectingDevice: Device | null; // New: track which device we are trying to connect to
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
  
  // Debug connection state changes
  useEffect(() => {
    console.log('🔗 Connection state changed to:', connected);
  }, [connected]);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [connectingDevice, setConnectingDevice] = useState<Device | null>(null); // New state
  const [isAutoConnecting, setIsAutoConnecting] = useState(false);
  const autoConnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasInitialAutoConnectRef = useRef(false);

  const disconnect = useCallback(() => {
    console.log('🔗 Disconnecting WebSocket');
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnected(false);
    setConnectedDevice(null);
    setConnectingDevice(null); // Clear connecting device on disconnect
  }, []);

  const connect = useCallback((ip: string, port: string, token: string, isAutoConnect: boolean = false) => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    const ws = new WebSocket(`ws://${ip}:${port}`);
    wsRef.current = ws;
    setConnected(false);

    if (!isAutoConnect) {
      // For manual connections, clear previous device state to prepare for the new one
      setConnectedDevice(null);
      setConnectingDevice(null);
    }

    ws.onopen = () => {
      if (!isAutoConnect) {
        // Manual connection: user scanned a QR code, use that token immediately.
        ws.send(JSON.stringify({ type: 'pair', token }));
      }
      // For auto-connection, we wait for the 'hello' message from the server.
    };

    ws.onmessage = (event) => {
      setLastMessage(event.data);
      try {
        const message = JSON.parse(event.data);

        // Case 1: Auto-connect receives the server's fresh token
        if (isAutoConnect && message.type === 'hello' && message.token) {
          ws.send(JSON.stringify({ type: 'pair', token: message.token }));
        
        // Case 2: Pairing is successful (for both manual and auto-connect)
        } else if (message.type === 'pair_success' && message.server_info) {
          console.log('🔗 Setting connected to true - pairing successful');
          setConnected(true);
          const { server_ip, port_no, pairing_token } = message.server_info;
          const deviceId = DeviceStorage.generateDeviceId(server_ip, String(port_no));
          
          // Use the connecting device's info to preserve name and hostType
          const baseDevice = connectingDevice || { name: server_ip };

          const newDevice: Device = {
            id: deviceId,
            ip: server_ip,
            port: String(port_no),
            token: pairing_token,
            name: baseDevice.name || server_ip, // Keep existing name or use IP as default
            
            lastConnected: Date.now(),
          };

          setConnectedDevice(newDevice);
          DeviceStorage.saveDevice(newDevice);
          setConnectingDevice(null); // Clear connecting device on success

          // After pairing, ask the server for its hostname
          ws.send(JSON.stringify({ type: 'get_hostname' }));

        // Case 3: Pairing fails
        } else if (message.type === 'pair_failed') {
          console.error('Pairing failed:', message.message);
          disconnect(); // Disconnect and clear state on failure
        
        // Case 4: Server provides its hostname after pairing
        } else if (message.type === 'hostname' && message.hostname) {
          if (connectedDevice) {
            DeviceStorage.updateDeviceName(connectedDevice.id, message.hostname);
            setConnectedDevice(prev => prev ? { ...prev, name: message.hostname } : null);
          }
        }
      } catch (error) {
        // console.log('Could not parse server message:', error);
      }
    };

    ws.onerror = () => {
      setConnected(false);
      setConnectedDevice(null);
      setConnectingDevice(null); // Clear connecting device on error
    };

    ws.onclose = () => {
      setConnected(false);
      setConnectedDevice(null);
      setConnectingDevice(null); // Clear connecting device on close
    };
  }, [connectingDevice, connectedDevice, disconnect]);

  const connectToDevice = useCallback((device: Device) => {
    setConnectingDevice(device); // Set the device we are attempting to connect to
    connect(device.ip, device.port, device.token, true); // Pass true for auto-connect
  }, [connect]);

  const send = useCallback((data: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(data);
    }
  }, []);

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
  }, [connected, isAutoConnecting, connectToDevice]);

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
  }, [connected, isAutoConnecting, startAutoConnect, stopAutoConnect]); // Dependencies updated

  // Keep the connection alive with pings
  useEffect(() => {
    if (!connected) return;

    const pingInterval = setInterval(() => {
      send(JSON.stringify({ type: 'ping' }));
    }, 10000); // every 10 seconds

    return () => {
      clearInterval(pingInterval);
    };
  }, [connected, send]);

  return (
    <WebSocketContext.Provider value={{ 
      ws: wsRef.current, 
      connected, 
      lastMessage, 
      connectedDevice,
      connectingDevice, // Expose new state
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