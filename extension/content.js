/**
 * Content Script for Cross-Device Presentation Control
 * Injects into presentation sites and handles remote commands
 */

class PresentationController {
  constructor() {
    this.websocket = null;
    this.isConnected = false;
    this.currentSite = this.detectSite();
    this.initialize();
  }

  detectSite() {
    const url = window.location.href;
    if (url.includes("docs.google.com/presentation")) return "google_slides";
    if (url.includes("canva.com")) return "canva";
    if (url.includes("prezi.com")) return "prezi";
    if (url.includes("slides.com")) return "slides";
    if (url.includes("beautiful.ai")) return "beautiful_ai";
    return "unknown";
  }

  async initialize() {
    console.log(`Presentation Controller initialized for: ${this.currentSite}`);

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sendResponse);
    });

    // Inject site-specific controls
    this.injectSiteControls();

    // Try to connect to desktop server
    this.connectToServer();
  }

  async connectToServer() {
    try {
      // Get server settings from storage
      const settings = await chrome.storage.local.get([
        "serverIP",
        "serverPort",
      ]);
      const ip = settings.serverIP || "localhost";
      const port = settings.serverPort || "9000";

      const wsUrl = `ws://${ip}:${port}`;
      this.websocket = new WebSocket(wsUrl);

      this.websocket.onopen = () => {
        this.isConnected = true;
        console.log("Connected to desktop server");
        this.sendStatus("connected");
      };

      this.websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleServerMessage(data);
      };

      this.websocket.onclose = () => {
        this.isConnected = false;
        console.log("Disconnected from desktop server");
        this.sendStatus("disconnected");
      };

      this.websocket.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.sendStatus("error");
      };
    } catch (error) {
      console.error("Failed to connect to server:", error);
      this.sendStatus("error");
    }
  }

  sendMessage(message) {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
    }
  }

  handleServerMessage(data) {
    switch (data.type) {
      case "presentation_control":
        this.handlePresentationCommand(data.command);
        break;
      case "keyboard_control":
        this.handleKeyboardCommand(data);
        break;
      default:
        console.log("Received message:", data);
    }
  }

  handlePresentationCommand(command) {
    console.log(`Executing presentation command: ${command}`);

    switch (command) {
      case "next_slide":
        this.nextSlide();
        break;
      case "previous_slide":
        this.previousSlide();
        break;
      case "start_presentation":
        this.startPresentation();
        break;
      case "exit_presentation":
        this.exitPresentation();
        break;
    }
  }

  handleKeyboardCommand(data) {
    const key = data.key;
    const action = data.action || "press";

    // Create and dispatch keyboard event
    const event = new KeyboardEvent(action === "press" ? "keydown" : "keyup", {
      key: key,
      code: `Key${key.toUpperCase()}`,
      keyCode: this.getKeyCode(key),
      which: this.getKeyCode(key),
      bubbles: true,
      cancelable: true,
    });

    document.dispatchEvent(event);
  }

  getKeyCode(key) {
    const keyMap = {
      ArrowRight: 39,
      ArrowLeft: 37,
      ArrowUp: 38,
      ArrowDown: 40,
      Enter: 13,
      Escape: 27,
      F5: 116,
      " ": 32, // Space
    };
    return keyMap[key] || key.charCodeAt(0);
  }

  nextSlide() {
    switch (this.currentSite) {
      case "google_slides":
        this.simulateGoogleSlidesNext();
        break;
      case "canva":
        this.simulateCanvaNext();
        break;
      case "prezi":
        this.simulatePreziNext();
        break;
      default:
        // Fallback to keyboard simulation
        this.simulateKeyPress("ArrowRight");
    }
  }

  previousSlide() {
    switch (this.currentSite) {
      case "google_slides":
        this.simulateGoogleSlidesPrevious();
        break;
      case "canva":
        this.simulateCanvaPrevious();
        break;
      case "prezi":
        this.simulatePreziPrevious();
        break;
      default:
        // Fallback to keyboard simulation
        this.simulateKeyPress("ArrowLeft");
    }
  }

  startPresentation() {
    switch (this.currentSite) {
      case "google_slides":
        this.simulateGoogleSlidesStart();
        break;
      case "canva":
        this.simulateCanvaStart();
        break;
      default:
        this.simulateKeyPress("F5");
    }
  }

  exitPresentation() {
    this.simulateKeyPress("Escape");
  }

  simulateKeyPress(key) {
    // Simulate key press using keyboard events
    const keyDown = new KeyboardEvent("keydown", {
      key: key,
      code: `Key${key.toUpperCase()}`,
      keyCode: this.getKeyCode(key),
      which: this.getKeyCode(key),
      bubbles: true,
      cancelable: true,
    });

    const keyUp = new KeyboardEvent("keyup", {
      key: key,
      code: `Key${key.toUpperCase()}`,
      keyCode: this.getKeyCode(key),
      which: this.getKeyCode(key),
      bubbles: true,
      cancelable: true,
    });

    document.dispatchEvent(keyDown);
    setTimeout(() => document.dispatchEvent(keyUp), 50);
  }

  // Google Slides specific controls
  simulateGoogleSlidesNext() {
    // Try multiple selectors for next button
    const selectors = [
      '[data-tooltip="Next slide"]',
      '[aria-label="Next slide"]',
      ".goog-inline-block.goog-flat-menu-button-caption",
      '[data-mdc-dialog-action="next"]',
    ];

    for (const selector of selectors) {
      const button = document.querySelector(selector);
      if (button) {
        button.click();
        return;
      }
    }

    // Fallback to keyboard
    this.simulateKeyPress("ArrowRight");
  }

  simulateGoogleSlidesPrevious() {
    const selectors = [
      '[data-tooltip="Previous slide"]',
      '[aria-label="Previous slide"]',
      '[data-mdc-dialog-action="previous"]',
    ];

    for (const selector of selectors) {
      const button = document.querySelector(selector);
      if (button) {
        button.click();
        return;
      }
    }

    this.simulateKeyPress("ArrowLeft");
  }

  simulateGoogleSlidesStart() {
    const selectors = [
      '[data-tooltip="Present"]',
      '[aria-label="Present"]',
      '.goog-inline-block[aria-label*="Present"]',
    ];

    for (const selector of selectors) {
      const button = document.querySelector(selector);
      if (button) {
        button.click();
        return;
      }
    }

    this.simulateKeyPress("F5");
  }

  // Canva specific controls
  simulateCanvaNext() {
    const selectors = [
      '[data-testid="presentation-next-slide"]',
      '[aria-label="Next slide"]',
      ".presentation-controls button:last-child",
    ];

    for (const selector of selectors) {
      const button = document.querySelector(selector);
      if (button) {
        button.click();
        return;
      }
    }

    this.simulateKeyPress("ArrowRight");
  }

  simulateCanvaPrevious() {
    const selectors = [
      '[data-testid="presentation-previous-slide"]',
      '[aria-label="Previous slide"]',
      ".presentation-controls button:first-child",
    ];

    for (const selector of selectors) {
      const button = document.querySelector(selector);
      if (button) {
        button.click();
        return;
      }
    }

    this.simulateKeyPress("ArrowLeft");
  }

  simulateCanvaStart() {
    const selectors = [
      '[data-testid="presentation-play"]',
      '[aria-label="Start presentation"]',
      ".presentation-play-button",
    ];

    for (const selector of selectors) {
      const button = document.querySelector(selector);
      if (button) {
        button.click();
        return;
      }
    }

    this.simulateKeyPress("F5");
  }

  // Prezi specific controls
  simulatePreziNext() {
    const selectors = [
      ".prezi-player-next",
      '[data-action="next"]',
      ".navigation-next",
    ];

    for (const selector of selectors) {
      const button = document.querySelector(selector);
      if (button) {
        button.click();
        return;
      }
    }

    this.simulateKeyPress("ArrowRight");
  }

  simulatePreziPrevious() {
    const selectors = [
      ".prezi-player-prev",
      '[data-action="previous"]',
      ".navigation-prev",
    ];

    for (const selector of selectors) {
      const button = document.querySelector(selector);
      if (button) {
        button.click();
        return;
      }
    }

    this.simulateKeyPress("ArrowLeft");
  }

  injectSiteControls() {
    // Create a floating control panel
    const controlPanel = document.createElement("div");
    controlPanel.id = "cross-device-control-panel";
    controlPanel.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 8px;
            font-family: Arial, sans-serif;
            font-size: 12px;
            z-index: 10000;
            display: none;
        `;

    controlPanel.innerHTML = `
            <div style="margin-bottom: 5px;">
                <strong>Remote Control</strong>
                <span id="connection-status" style="margin-left: 10px; color: #ff6b6b;">Disconnected</span>
            </div>
            <div style="display: flex; gap: 5px;">
                <button id="prev-btn" style="padding: 5px 10px; background: #4a90e2; border: none; color: white; border-radius: 4px; cursor: pointer;">←</button>
                <button id="next-btn" style="padding: 5px 10px; background: #4a90e2; border: none; color: white; border-radius: 4px; cursor: pointer;">→</button>
            </div>
        `;

    document.body.appendChild(controlPanel);

    // Add event listeners
    document
      .getElementById("prev-btn")
      .addEventListener("click", () => this.previousSlide());
    document
      .getElementById("next-btn")
      .addEventListener("click", () => this.nextSlide());

    // Show panel when connected
    this.updateControlPanel();
  }

  updateControlPanel() {
    const panel = document.getElementById("cross-device-control-panel");
    const status = document.getElementById("connection-status");

    if (this.isConnected) {
      panel.style.display = "block";
      status.textContent = "Connected";
      status.style.color = "#4caf50";
    } else {
      panel.style.display = "none";
      status.textContent = "Disconnected";
      status.style.color = "#ff6b6b";
    }
  }

  handleMessage(message, sendResponse) {
    switch (message.action) {
      case "getStatus":
        sendResponse({
          site: this.currentSite,
          connected: this.isConnected,
        });
        break;
      case "nextSlide":
        this.nextSlide();
        sendResponse({ success: true });
        break;
      case "previousSlide":
        this.previousSlide();
        sendResponse({ success: true });
        break;
      case "startPresentation":
        this.startPresentation();
        sendResponse({ success: true });
        break;
      case "exitPresentation":
        this.exitPresentation();
        sendResponse({ success: true });
        break;
    }
  }

  sendStatus(status) {
    chrome.runtime.sendMessage({
      action: "statusUpdate",
      status: status,
      site: this.currentSite,
    });

    this.updateControlPanel();
  }
}

// Initialize the controller
const controller = new PresentationController();
