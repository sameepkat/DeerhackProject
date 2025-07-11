/**
 * Popup Script for Cross-Device Presentation Control Extension
 */

class PopupController {
  constructor() {
    this.initializeElements();
    this.bindEvents();
    this.loadSettings();
    this.updateStatus();
  }

  initializeElements() {
    this.statusElement = document.getElementById("status");
    this.statusText = this.statusElement.querySelector(".status-text");
    this.statusDot = this.statusElement.querySelector(".status-dot");

    this.serverIPInput = document.getElementById("serverIP");
    this.serverPortInput = document.getElementById("serverPort");

    this.connectBtn = document.getElementById("connectBtn");
    this.disconnectBtn = document.getElementById("disconnectBtn");

    this.prevBtn = document.getElementById("prevBtn");
    this.nextBtn = document.getElementById("nextBtn");
    this.startBtn = document.getElementById("startBtn");
    this.exitBtn = document.getElementById("exitBtn");
  }

  bindEvents() {
    this.connectBtn.addEventListener("click", () => this.connect());
    this.disconnectBtn.addEventListener("click", () => this.disconnect());

    this.prevBtn.addEventListener("click", () =>
      this.sendCommand("previous_slide")
    );
    this.nextBtn.addEventListener("click", () =>
      this.sendCommand("next_slide")
    );
    this.startBtn.addEventListener("click", () =>
      this.sendCommand("start_presentation")
    );
    this.exitBtn.addEventListener("click", () =>
      this.sendCommand("exit_presentation")
    );

    // Save settings when inputs change
    this.serverIPInput.addEventListener("change", () => this.saveSettings());
    this.serverPortInput.addEventListener("change", () => this.saveSettings());
  }

  async loadSettings() {
    try {
      const response = await chrome.runtime.sendMessage({
        action: "getStatus",
      });
      if (response.settings) {
        this.serverIPInput.value = response.settings.ip || "localhost";
        this.serverPortInput.value = response.settings.port || "9000";
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }

  async saveSettings() {
    const settings = {
      serverIP: this.serverIPInput.value,
      serverPort: this.serverPortInput.value,
    };

    try {
      await chrome.runtime.sendMessage({
        action: "updateSettings",
        settings: settings,
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  }

  async updateStatus() {
    try {
      const response = await chrome.runtime.sendMessage({
        action: "getStatus",
      });
      this.setConnectionStatus(
        response.connected ? "connected" : "disconnected"
      );
    } catch (error) {
      console.error("Failed to get status:", error);
      this.setConnectionStatus("disconnected");
    }
  }

  setConnectionStatus(status) {
    this.statusElement.className = `status ${status}`;
    this.statusDot.className = `status-dot ${status}`;

    if (status === "connected") {
      this.statusText.textContent = "Connected";
      this.enableControls(true);
    } else {
      this.statusText.textContent = "Disconnected";
      this.enableControls(false);
    }
  }

  enableControls(enabled) {
    const controls = [this.prevBtn, this.nextBtn, this.startBtn, this.exitBtn];
    controls.forEach((control) => {
      control.disabled = !enabled;
    });

    this.connectBtn.disabled = enabled;
    this.disconnectBtn.disabled = !enabled;
  }

  async connect() {
    try {
      await chrome.runtime.sendMessage({ action: "connect" });
      this.updateStatus();
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  }

  async disconnect() {
    try {
      await chrome.runtime.sendMessage({ action: "disconnect" });
      this.updateStatus();
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  }

  async sendCommand(command) {
    try {
      await chrome.runtime.sendMessage({
        action: "presentationCommand",
        command: command,
      });
    } catch (error) {
      console.error("Failed to send command:", error);
    }
  }
}

// Initialize popup when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const popup = new PopupController();
});
