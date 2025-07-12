import asyncio
import json
import os
import random
import string
import socket
import websockets
from ..utils.qr import QRUtils

def get_local_ip():
    """Get the local IP address of the machine."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception:
        return "127.0.0.1"

def generate_token(length=8):
    """Generate a random token for device pairing."""
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

async def handle_connection(websocket):  # Fixed: removed 'path' parameter
    """Handle WebSocket connection."""
    client_ip = websocket.remote_address[0]
    print(f'Client connected from {client_ip}!')
    
    # Send welcome message
    welcome_msg = {
        'type': 'hello',
        'token': TOKEN,
        'msg': 'Welcome from server!'
    }
    await websocket.send(json.dumps(welcome_msg))
    
    try:
        async for message in websocket:
            print(f'Received: {message}')
            # Echo back
            echo_msg = f'Echo: {message}'
            await websocket.send(echo_msg)
    except websockets.exceptions.ConnectionClosed:
        print(f'Client {client_ip} disconnected')

async def main(stop_event=None):
    """Main server function."""
    print('--- WebSocket Pairing Server ---')
    print(f'LAN IP: {pairing_info["server_ip"]}')
    print(f'Port: {PORT}')
    print(f'Pairing token: {TOKEN}')
    print('--- QR code for pairing ---')
    
    # Generate and display QR code
    qr_code = QRUtils.generate_qr_code(pairing_info)
    if qr_code:
        print(qr_code)
    else:
        print('Failed to generate QR code')
    
    print('--- Waiting for mobile device to connect... ---')
    # Start WebSocket server
    server = await websockets.serve(handle_connection, "0.0.0.0", PORT)
    try:
        while True:
            # Check the stop_event every 0.5 seconds
            if stop_event and stop_event.is_set():
                print("Shutting down websocket server...")
                break
            await asyncio.sleep(0.5)
    finally:
        server.close()
        await server.wait_closed()

def run_server(stop_event=None):
    asyncio.run(main(stop_event))

# Server configuration
PORT = 9000
TOKEN = generate_token()
pairing_info = {
    'server_ip': get_local_ip(),
    'port_no': PORT,
    'pairing_token': TOKEN,
}

if __name__ == "__main__":
    asyncio.run(main())
