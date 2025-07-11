/**
 * Background Service Worker for Cross-Device Presentation Control Extension
 */

class ExtensionBackground {
  constructor() {
    this.websocket = null;
    this.isConnected = false;
    this.serverSettings = {
      ip: "localhost",
      port: "9000",
    };

    this.initialize();
  }

  async initialize() {
    // Load saved settings
    await this.loadSettings();

    // Listen for messages from popup and content scripts
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
    });

    // Handle extension installation
    chrome.runtime.onInstalled.addListener(() => {
      this.onInstalled();
    });

    // Handle tab updates
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === "complete") {
        this.onTabUpdated(tabId, tab);
      }
    });
  }

  async loadSettings() {
    try {
      const settings = await chrome.storage.local.get([
        "serverIP",
        "serverPort",
      ]);
      this.serverSettings.ip = settings.serverIP || "localhost";
      this.serverSettings.port = settings.serverPort || "9000";
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }

  async saveSettings(settings) {
    try {
      await chrome.storage.local.set(settings);
      this.serverSettings = { ...this.serverSettings, ...settings };
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  }

  async connectToServer() {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    try {
      const wsUrl = `ws://${this.serverSettings.ip}:${this.serverSettings.port}`;
      this.websocket = new WebSocket(wsUrl);

      this.websocket.onopen = () => {
        this.isConnected = true;
        console.log("Extension connected to desktop server");
        this.broadcastStatus("connected");
      };

      this.websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleServerMessage(data);
      };

      this.websocket.onclose = () => {
        this.isConnected = false;
        console.log("Extension disconnected from desktop server");
        this.broadcastStatus("disconnected");
      };

      this.websocket.onerror = (error) => {
        console.error("Extension WebSocket error:", error);
        this.broadcastStatus("error");
      };
    } catch (error) {
      console.error("Failed to connect to server:", error);
      this.broadcastStatus("error");
    }
  }

  disconnectFromServer() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    this.isConnected = false;
    this.broadcastStatus("disconnected");
  }

  sendMessage(message) {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
    }
  }

  handleServerMessage(data) {
    // Forward presentation control commands to active tab
    if (data.type === "presentation_control") {
      this.forwardToActiveTab(data);
    }
  }

  async forwardToActiveTab(data) {
    try {
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tabs.length > 0) {
        const tab = tabs[0];
        // Check if the tab is a presentation site
        if (this.isPresentationSite(tab.url)) {
          chrome.tabs.sendMessage(tab.id, data);
        }
      }
    } catch (error) {
      console.error("Failed to forward message to active tab:", error);
    }
  }

  isPresentationSite(url) {
    const presentationSites = [
      "docs.google.com/presentation",
      "canva.com",
      "prezi.com",
      "slides.com",
      "beautiful.ai",
    ];

    return presentationSites.some((site) => url.includes(site));
  }

  async broadcastStatus(status) {
    try {
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        if (this.isPresentationSite(tab.url)) {
          try {
            chrome.tabs.sendMessage(tab.id, {
              action: "statusUpdate",
              status: status,
            });
          } catch (error) {
            // Tab might not have content script loaded
          }
        }
      }
    } catch (error) {
      console.error("Failed to broadcast status:", error);
    }
  }

  handleMessage(message, sender, sendResponse) {
    switch (message.action) {
      case "connect":
        this.connectToServer();
        sendResponse({ success: true });
        break;

      case "disconnect":
        this.disconnectFromServer();
        sendResponse({ success: true });
        break;

      case "getStatus":
        sendResponse({
          connected: this.isConnected,
          settings: this.serverSettings,
        });
        break;

      case "updateSettings":
        this.saveSettings(message.settings);
        sendResponse({ success: true });
        break;

      case "statusUpdate":
        // Forward status updates from content scripts
        this.broadcastStatus(message.status);
        break;

      case "presentationCommand":
        this.sendMessage({
          type: "presentation_control",
          command: message.command,
        });
        sendResponse({ success: true });
        break;

      default:
        sendResponse({ error: "Unknown action" });
    }
  }

  onInstalled() {
    console.log("Cross-Device Presentation Control extension installed");
    // Set default settings
    this.saveSettings({
      serverIP: "localhost",
      serverPort: "9000",
    });
  }

  async onTabUpdated(tabId, tab) {
    // Check if the updated tab is a presentation site
    if (tab.url && this.isPresentationSite(tab.url)) {
      // Inject content script if needed
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ["content.js"],
        });
      } catch (error) {
        // Content script might already be injected
      }
    }
  }
}

// Initialize the background service worker
const background = new ExtensionBackground();
