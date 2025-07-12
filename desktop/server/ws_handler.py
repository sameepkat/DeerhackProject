import asyncio
import json
import os
import random
import string
import socket
import websockets


from ..utils import QRUtils
from ..features import send_clipboard, recieve_clipboard, press_key, run_command

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

async def receive_data(websocket, client_ip):
    """Receive and process data from WebSocket connection."""
    try:
        async for message in websocket:
            print(f'Received from {client_ip}: {message}')
            
            # Parse JSON message
            try:
                data = json.loads(message)
                await process_message(websocket, data, client_ip)
            except json.JSONDecodeError:
                print(f'Invalid JSON from {client_ip}: {message}')
                # Send error response
                error_response = {
                    'type': 'error',
                    'message': 'Invalid JSON format'
                }
                await websocket.send(json.dumps(error_response))
                
    except websockets.exceptions.ConnectionClosed:
        print(f'Client {client_ip} disconnected')
    except Exception as e:
        print(f'Error handling data from {client_ip}: {e}')

async def process_message(websocket, data, client_ip):
    """Process different types of messages from clients."""
    msg_type = data.get('type', 'unknown')
    
    if msg_type == 'hello':
        # Client greeting
        response = {
            'type': 'hello_ack',
            'message': f'Hello acknowledged from server',
            'server_time': asyncio.get_event_loop().time()
        }
        await websocket.send(json.dumps(response))
        
    elif msg_type == 'pair':
        # Device pairing request
        client_token = data.get('token', '')
        if client_token == TOKEN:
            response = {
                'type': 'pair_success',
                'message': 'Device paired successfully',
                'server_info': pairing_info
            }
            print(f'Device {client_ip} paired successfully')
        else:
            response = {
                'type': 'pair_failed',
                'message': 'Invalid pairing token'
            }
            print(f'Failed pairing attempt from {client_ip}')
        await websocket.send(json.dumps(response))
        
    elif msg_type == 'command':
        # Handle device commands
        command = data.get('command','')
        
        response = await handle_command(command, client_ip)
        await websocket.send(json.dumps(response))
        
    elif msg_type == 'file_transfer':
        # Handle file transfer requests
        file_info = data.get('file_info', {})
        response = await handle_file_transfer(file_info, client_ip)
        await websocket.send(json.dumps(response))
        
    elif msg_type == 'clipboard':
        # Handle clipboard operations
        clipboard_data = data.get('data', '')
        action = data.get('action', 'get')  # 'get' or 'set'
        response = await handle_clipboard(action, clipboard_data, client_ip)
        print("Response: ", response)
        await websocket.send(json.dumps(response))
        
    elif msg_type == 'ping':
        # Simple ping/pong for connection health
        response = {
            'type': 'pong',
            'timestamp': asyncio.get_event_loop().time()
        }
        await websocket.send(json.dumps(response))

    elif msg_type == "presentation":
        print("Presentation message received")
        # Handle key press operations
        key = data.get('action', '')
        response = await handle_key_press(key, client_ip)
        await websocket.send(json.dumps(response))
        
    else:
        # Unknown message type
        response = {
            'type': 'error',
            'message': f'Unknown message type: {msg_type}'
        }
        await websocket.send(json.dumps(response))

async def handle_command(command, client_ip):
    """Handle different device commands."""
    print(f'Executing command "{command}" from {client_ip}')
    try:
        response = run_command(command)
    except Exception as e:
        print(f'Error executing command "{command}" from {client_ip}: {e}')
        response = {
            'type': 'error',
            'message': f'Error executing command "{command}": {e}'
        }
    print("Response: ", response)
    return {
        'type': 'command_response',
        'command': command,
        'message': f'Command {command} executed successfully'
    }

async def handle_file_transfer(file_info, client_ip):
    """Handle file transfer operations."""
    print(f'File transfer request from {client_ip}: {file_info}')
    
    # Add your file transfer logic here
    
    return {
        'type': 'file_transfer_response',
        'status': 'ready',
        'message': 'File transfer ready'
    }

async def handle_clipboard(action, data, client_ip):
    """Handle clipboard operations."""
    print(f'Clipboard {action} from {client_ip}')
    
    if action == 'get':  
        data = send_clipboard()
        print("Clipboard data: ", data)
        return {
            'type': 'clipboard_response',
            'action': 'get',
            'data': data
        }
    elif action == 'set':
        # Set clipboard content
        recieve_clipboard(data)
        return {
            'type': 'clipboard_response',
            'action': 'set',
            'message': 'Clipboard updated'
        }
    else:
        return {
            'type': 'error',
            'message': f'Unknown clipboard action: {action}'
        }

async def handle_key_press(key, client_ip):
    """Handle key press operations."""
    print(f'Key press {key} from {client_ip}')
    press_key(key)
    return {
        'type': 'key_press_response',
        'key': key,
        'message': 'Key pressed'
    }

async def handle_connection(websocket):  # Fixed: removed 'path' parameter
    """Handle WebSocket connection."""
    client_ip = websocket.remote_address[0]
    print(f'Client connected from {client_ip}!')
    
    # Send welcome message
    welcome_msg = {
        'type': 'hello',
        'token': TOKEN,
        'message': 'Welcome from server!'
    }
    await websocket.send(json.dumps(welcome_msg))
    
    # Start receiving data
    await receive_data(websocket, client_ip)

def get_pairing_info():
    return pairing_info

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
