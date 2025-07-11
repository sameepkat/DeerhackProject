# 🧩 Project: Cross-Device LAN Control & Sync System

## 🎯 Goal
Build a **fully local, cross-platform system** to enable seamless **communication between mobile, laptop, and browser** over the **same LAN**, **without any internet connection** or third-party servers.

---

## 📱 Mobile App (React Native)
- Acts as a **remote controller** and data sender
- Communicates with desktop/browser over **WebSocket**
- Built with **React Native** (Android first)

### 🔧 Mobile App Features
- Clipboard sync (send clipboard to laptop)
- File transfer to/from laptop
- Remote input:
  - Touchpad-style mouse
  - Virtual keyboard (key press simulation)
- Presentation control (next/prev slide)
- Media control (play, pause, volume)
- Battery level sharing
- Notification mirroring (Android)
- Background support for continuous connection
- Secure device pairing via **QR code**

---

## 💻 Desktop App (Python)
- Background service that listens over LAN
- WebSocket server (built with `asyncio` and `websockets`)
- Receives commands/data from mobile and browser extensions
- Platform-independent (Linux, Windows, macOS)

### 🔧 Desktop App Features
- Clipboard receive & update (`pyperclip`)
- Mouse & keyboard simulation (`pyautogui`, `pynput`)
- File receiver/sender (chunked WebSocket transfer)
- Command execution (with strict whitelisting)
- QR code generator for pairing (`qrcode`, `Pillow`)
- Battery status/notification display
- Optional system tray integration (`pystray`)
- Autostarts with OS

---

## 🌐 Web Controller (Browser-based UI)
- Allows trying features without installing mobile app
- Hosted on local network (can be served from Python backend)
- Connects to the same WebSocket server on the laptop

### 🔧 Web Controller Features
- Clipboard sync (manual input)
- Slide control (next/prev)
- Touchpad-style pointer simulation (visual only)
- File upload to desktop
- QR code pairing UI
- Button-based interface for testing commands
- LAN-only: works without internet

---

## 🧩 Browser Extension (Google Slides, Canva, etc.)
- Listens for commands from desktop server or mobile app
- Injects scripts into Google Slides, Canva, Prezi, etc.
- Simulates keypresses and button clicks to change slides

### 🔧 Extension Features
- Site-specific content scripts (Google Slides, Canva)
- WebSocket client that connects to LAN server
- Slide navigation via simulated key events (ArrowRight, ArrowLeft)
- Scoped permissions via `manifest.json`
- Future: small in-browser overlay UI

---

## 🔐 Security Model

### ✅ Device Pairing
- Desktop generates QR code with IP, port, and one-time token:
  ```json
  { "ip": "192.168.1.5", "port": 9000, "token": "abc123" }

