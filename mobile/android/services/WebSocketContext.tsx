import React, { createContext, useContext, useRef, useState, useCallback } from 'react';

// Types for context
interface WebSocketContextType {
  ws: WebSocket | null;
  connected: boolean;
  lastMessage: string | null;
  connect: (ip: string, port: string, token: string) => void;
  disconnect: () => void;
  send: (data: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  const connect = useCallback((ip: string, port: string, token: string) => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    const ws = new WebSocket(`ws://${ip}:${port}`);
    wsRef.current = ws;
    setConnected(false);
    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ type: 'pair', token }));
    };
    ws.onmessage = (event) => {
      setLastMessage(event.data);
    };
    ws.onerror = () => {
      setConnected(false);
    };
    ws.onclose = () => {
      setConnected(false);
    };
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnected(false);
  }, []);

  const send = useCallback((data: string) => {
    if (wsRef.current && connected) {
      wsRef.current.send(data);
    }
  }, [connected]);

  return (
    <WebSocketContext.Provider value={{ ws: wsRef.current, connected, lastMessage, connect, disconnect, send }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export function useWebSocket() {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error('useWebSocket must be used within a WebSocketProvider');
  return ctx;
} 