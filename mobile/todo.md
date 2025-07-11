# 📝 TODO List for Cross-Device LAN Control & Sync System

## 📱 Mobile App (React Native)
- [ ] Set up React Native project (Android first)
- [ ] Implement WebSocket client for LAN communication
- [ ] Clipboard sync (send clipboard to laptop)
- [ ] File transfer to/from laptop
- [ ] Remote input:
  - [ ] Touchpad-style mouse
  - [ ] Virtual keyboard (key press simulation)
- [ ] Presentation control (next/prev slide)
- [ ] Media control (play, pause, volume)
- [ ] Battery level sharing
- [ ] Notification mirroring (Android)
- [ ] Background support for continuous connection
- [ ] Secure device pairing via QR code

## 💻 Desktop App (Python)
- [ ] Set up Python WebSocket server (asyncio, websockets)
- [ ] Clipboard receive & update (pyperclip)
- [ ] Mouse & keyboard simulation (pyautogui, pynput)
- [ ] File receiver/sender (chunked WebSocket transfer)
- [ ] Command execution (strict whitelisting)
- [ ] QR code generator for pairing (qrcode, Pillow)
- [ ] Battery status/notification display
- [ ] System tray integration (pystray)
- [ ] Autostart with OS

## 🌐 Web Controller (Browser-based UI)
- [ ] Build browser-based UI for LAN control
- [ ] Connect to desktop WebSocket server
- [ ] Clipboard sync (manual input)
- [ ] Slide control (next/prev)
- [ ] Touchpad-style pointer simulation (visual only)
- [ ] File upload to desktop
- [ ] QR code pairing UI
- [ ] Button-based interface for testing commands
- [ ] Ensure LAN-only operation (no internet required)

## 🧩 Browser Extension
- [ ] Set up extension manifest and permissions
- [ ] Inject content scripts for Google Slides, Canva, Prezi
- [ ] WebSocket client for LAN server
- [ ] Slide navigation via simulated key events (ArrowRight, ArrowLeft)
- [ ] Site-specific content scripts
- [ ] In-browser overlay UI (future)

## 🔐 Security & Pairing
- [ ] Implement device pairing via QR code (IP, port, one-time token)
- [ ] Ensure secure communication (token validation, no open relays)
- [ ] Document pairing and security model 