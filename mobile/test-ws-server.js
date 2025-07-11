const WebSocket = require('ws');
const os = require('os');
const QRCode = require('qrcode');

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

wss.on('connection', function connection(ws) {
  console.log('Client connected!');
  ws.on('message', function incoming(message) {
    console.log('Received:', message.toString());
    // Echo back
    ws.send('Echo: ' + message);
  });
  ws.send(JSON.stringify({ type: 'hello', token: TOKEN, msg: 'Welcome from server!' }));
}); 