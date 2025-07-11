// Extension message types
export interface ExtensionMessage {
  action: string;
  [key: string]: any;
}

export interface ServerMessage {
  type: string;
  [key: string]: any;
}

// Connection types
export interface ConnectionSettings {
  serverIP: string;
  serverPort: string;
}

export interface ConnectionStatus {
  connected: boolean;
  settings: ConnectionSettings;
}

// Presentation control types
export interface PresentationCommand {
  command: 'next_slide' | 'previous_slide' | 'start_presentation' | 'exit_presentation';
}

export interface KeyboardCommand {
  key: string;
  action: 'press' | 'hold' | 'release';
}

export interface MouseCommand {
  command: 'move' | 'click' | 'scroll';
  x?: number;
  y?: number;
  button?: 'left' | 'right';
  dx?: number;
  dy?: number;
}

// Site detection types
export type SupportedSite = 
  | 'google_slides'
  | 'canva'
  | 'prezi'
  | 'slides'
  | 'beautiful_ai'
  | 'powerpoint_online'
  | 'slideshare'
  | 'unknown';

export interface SiteControls {
  nextSelectors: string[];
  prevSelectors: string[];
  startSelectors: string[];
  exitSelectors: string[];
}

export interface SiteInfo {
  site: SupportedSite;
  url: string;
  title: string;
  controls: string[];
}

// WebSocket types
export interface WebSocketMessage {
  type: string;
  data?: any;
  error?: string;
}

// Storage types
export interface StorageData {
  serverIP?: string;
  serverPort?: string;
  lastConnected?: number;
  settings?: any;
}

// UI types
export interface ControlPanelState {
  isConnected: boolean;
  currentSite: SupportedSite;
  inPresentationMode: boolean;
  showPanel: boolean;
}

// Error types
export interface ExtensionError {
  code: string;
  message: string;
  details?: any;
} 