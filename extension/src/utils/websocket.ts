import { ServerMessage, WebSocketMessage } from '../types';

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private url: string = '';
  private onMessageCallback: ((data: ServerMessage) => void) | null = null;
  private onStatusChangeCallback: ((connected: boolean) => void) | null = null;

  constructor() {
    this.handleMessage = this.handleMessage.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleError = this.handleError.bind(this);
  }

  connect(ip: string, port: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        this.url = `ws://${ip}:${port}`;
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('WebSocket connected to:', this.url);
          this.reconnectAttempts = 0;
          this.onStatusChangeCallback?.(true);
          resolve(true);
        };

        this.ws.onmessage = this.handleMessage;
        this.ws.onclose = this.handleClose;
        this.ws.onerror = this.handleError;

        // Timeout after 10 seconds
        setTimeout(() => {
          if (this.ws?.readyState === WebSocket.CONNECTING) {
            this.ws.close();
            reject(new Error('Connection timeout'));
          }
        }, 10000);

      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.onStatusChangeCallback?.(false);
    }
  }

  send(message: WebSocketMessage): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('Failed to send message:', error);
        return false;
      }
    }
    return false;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  onMessage(callback: (data: ServerMessage) => void): void {
    this.onMessageCallback = callback;
  }

  onStatusChange(callback: (connected: boolean) => void): void {
    this.onStatusChangeCallback = callback;
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data: ServerMessage = JSON.parse(event.data);
      this.onMessageCallback?.(data);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log('WebSocket disconnected:', event.code, event.reason);
    this.onStatusChangeCallback?.(false);

    // Attempt to reconnect if not manually closed
    if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnect();
    }
  }

  private handleError(error: Event): void {
    console.error('WebSocket error:', error);
    this.onStatusChangeCallback?.(false);
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (this.url) {
        this.connect(this.url.split('://')[1].split(':')[0], this.url.split(':')[2])
          .catch(error => {
            console.error('Reconnect failed:', error);
          });
      }
    }, delay);
  }

  getConnectionInfo(): { url: string; readyState: number } {
    return {
      url: this.url,
      readyState: this.ws?.readyState ?? WebSocket.CLOSED
    };
  }
} 