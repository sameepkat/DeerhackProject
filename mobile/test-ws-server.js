const WebSocket = require('ws');
const os = require('os');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

// Utility to get local IP address
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

const PORT = 9000;
const TOKEN = Math.random().toString(36).substr(2, 8);
const wss = new WebSocket.Server({ port: PORT });

const pairingInfo = {
  server_ip: getLocalIp(),
  port_no: PORT,
  pairing_token: TOKEN,
  host: "process",
};

console.log('--- WebSocket Pairing Server ---');
console.log('LAN IP:', pairingInfo.server_ip);
console.log('Port:', PORT);
console.log('Pairing token:', TOKEN);
console.log('--- QR code for pairing ---');
QRCode.toString(JSON.stringify(pairingInfo), { type: 'terminal' }, (err, url) => {
  if (err) return console.error('Failed to generate QR code:', err);
  console.log(url);
  console.log('--- Waiting for mobile device to connect... ---');
});

let fileTransfers = {};

wss.on('connection', function connection(ws) {
  console.log('Client connected!');
  ws.on('message', function incoming(message) {
    let msg;
    try {
      msg = JSON.parse(message);
    } catch (e) {
      console.log('Received:', message.toString());
      ws.send('Echo: ' + message);
      return;
    }
    if (msg.type === 'file_start') {
      fileTransfers[msg.fileId] = {
        name: msg.name,
        size: msg.size,
        mime: msg.mime,
        chunks: [],
        received: 0,
        lastPercent: 0,
      };
      console.log(`[File] Start: ${msg.name} (${msg.size} bytes, ${msg.mime})`);
    } else if (msg.type === 'file_chunk') {
      const transfer = fileTransfers[msg.fileId];
      if (transfer) {
        transfer.chunks[msg.index] = msg.data;
        transfer.received += Buffer.from(msg.data, 'base64').length;
        const percent = Math.floor((transfer.received / transfer.size) * 100);
        if (percent !== transfer.lastPercent) {
          transfer.lastPercent = percent;
          process.stdout.write(`\r[File] Receiving: ${percent}% (${transfer.received}/${transfer.size})`);
        }
      }
    } else if (msg.type === 'file_end') {
      const transfer = fileTransfers[msg.fileId];
      if (transfer) {
        const allData = transfer.chunks.join('');
        const buffer = Buffer.from(allData, 'base64');
        const downloadsDir = path.join(require('os').homedir(), 'Downloads');
        const filePath = path.join(downloadsDir, transfer.name);
        fs.writeFile(filePath, buffer, (err) => {
          if (err) {
            console.error(`\n[File] Error saving file: ${err}`);
          } else {
            console.log(`\n[File] Saved to: ${filePath}`);
          }
        });
        console.log(`\n[File] End: ${transfer.name}. Total received: ${transfer.received} bytes.`);
        ws.send(JSON.stringify({ type: 'file_ack', fileId: msg.fileId, status: 'success' }));
        delete fileTransfers[msg.fileId];
      }
    } else {
      console.log('Received:', message.toString());
      ws.send('Echo: ' + message);
    }
  });
  ws.send(JSON.stringify({ type: 'hello', token: TOKEN, msg: 'Welcome from server!' }));
}); 