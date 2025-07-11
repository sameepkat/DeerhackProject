// Test setup file for Jest
import '@testing-library/jest-dom';

// Mock WebSocket
global.WebSocket = class MockWebSocket {
  public readyState: number;
  public url: string;
  public onopen: ((event: Event) => void) | null = null;
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public onclose: ((event: CloseEvent) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;

  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  constructor(url: string) {
    this.url = url;
    this.readyState = MockWebSocket.CONNECTING;
    
    // Simulate connection after a short delay
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      this.onopen?.(new Event('open'));
    }, 100);
  }

  send(data: string): void {
    // Mock send functionality
    console.log('Mock WebSocket send:', data);
  }

  close(code?: number, reason?: string): void {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.(new CloseEvent('close', { code, reason }));
  }
} as any;

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn().mockResolvedValue(undefined),
    readText: jest.fn().mockResolvedValue('')
  },
  writable: true
});

// Mock document.querySelector
const originalQuerySelector = document.querySelector;
document.querySelector = jest.fn((selector: string) => {
  // Mock common selectors used in tests
  if (selector.includes('button') || selector.includes('control')) {
    return {
      click: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    } as any;
  }
  return originalQuerySelector.call(document, selector);
});

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };
beforeAll(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
});

declare global {
  // eslint-disable-next-line no-var
  var testUtils: {
    createMockElement: (tagName?: string) => HTMLElement;
    createMockEvent: (type: string, options?: any) => Event;
    waitFor: (ms: number) => Promise<void>;
  };
}

// Global test utilities
global.testUtils = {
  createMockElement: (tagName: string = 'div') => {
    const element = document.createElement(tagName);
    element.click = jest.fn();
    element.addEventListener = jest.fn();
    element.removeEventListener = jest.fn();
    return element;
  },
  
  createMockEvent: (type: string, options: any = {}) => {
    return new Event(type, options);
  },
  
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
}; 