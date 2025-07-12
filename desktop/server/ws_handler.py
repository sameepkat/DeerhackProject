import asyncio
import json
import os
import random
import string
import socket
import websockets
import base64
import time
import tempfile
from pathlib import Path
import qrcode
import threading

from ..utils import QRUtils
from ..features import send_clipboard, recieve_clipboard, press_key, run_command, set_volume, set_brightness, media_playback, Brightness, Volume, Media
from ..features.mouse_keyboard import move_cursor

# Add file transfer tracking
file_transfers = {}  # Track active file transfers
downloads_dir = Path.home() / "Downloads"
downloads_dir.mkdir(exist_ok=True)

# Save QR code to Electron GUI's assets directory
assets_dir = Path(__file__).parent.parent / "gui" / "assets"
assets_dir.mkdir(exist_ok=True)


def save_qr_code(pairing_info):
    """Save QR code image to assets folder."""
    try:
        # Generate QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=8,
            border=2,
        )
        qr.add_data(json.dumps(pairing_info))
        qr.make(fit=True)
        
        # Create QR code image
        qr_image = qr.make_image(fill_color="black", back_color="white")
        
        # Save to assets directory using a binary file handle to avoid linter errors
        qr_file_path = assets_dir / "pairing_qr.png"
        with open(qr_file_path, "wb") as f:
            qr_image.save(f)
        
        print(f"✅ QR code saved to: {qr_file_path}")
        print(f"📱 Scan this QR code with your mobile device to pair")
        print(f"🔗 Or manually enter:")
        print(f"   IP: {pairing_info['server_ip']}")
        print(f"   Port: {pairing_info['port_no']}")
        print(f"   Token: {pairing_info['pairing_token']}")
        
        return str(qr_file_path)
        
    except Exception as e:
        print(f"❌ Failed to generate QR code: {e}")
        return None

def update_status(message):
    """Update the status message in console."""
    print(f"📱 Status: {message}")

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
            # Parse JSON message first to check if it's a file chunk
            try:
                data = json.loads(message)
                msg_type = data.get('type', 'unknown')
                
                # Don't print file chunk messages (they contain long base64 data)
                if msg_type != 'file_chunk':
                    print(f'Received from {client_ip}: {message}')
                
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
            update_status(f"Device {client_ip} paired successfully! ✅")
        else:
            response = {
                'type': 'pair_failed',
                'message': 'Invalid pairing token'
            }
            print(f'Failed pairing attempt from {client_ip}')
            update_status(f"Failed pairing attempt from {client_ip} ❌")
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

    elif msg_type == 'get_hostname':
        # Respond with the server's hostname
        try:
            hostname = socket.gethostname()
            response = {'type': 'hostname', 'hostname': hostname}
        except Exception as e:
            print(f"Error getting hostname: {e}")
            response = {'type': 'hostname', 'hostname': 'Unknown'}
        await websocket.send(json.dumps(response))

    elif msg_type == "presentation":
        print("Presentation message received")
        # Handle key press operations
        key = data.get('action', '')
        response = await handle_key_press(key, client_ip)
        await websocket.send(json.dumps(response))
        
    elif msg_type == "media":
        print("Media message received")
        action = data.get('action', '')
        response = await handle_media(action,data, client_ip)
        await websocket.send(json.dumps(response))
        
    elif msg_type == "remote_input":
        print("🖱️ Remote input message received from", client_ip)
        print("📦 Data received:", data)
        response = await handle_remote_input(data, client_ip)
        await websocket.send(json.dumps(response))

    # File transfer messages
    elif msg_type == "file_start":
        print("File start message received")
        response = await handle_file_start(data, client_ip)
        await websocket.send(json.dumps(response))
        
    elif msg_type == "file_chunk":
        # Remove the print statement - don't print file chunk messages
        response = await handle_file_chunk(data, client_ip)
        await websocket.send(json.dumps(response))
        
    elif msg_type == "file_end":
        print("File end message received")
        response = await handle_file_end(data, client_ip)
        await websocket.send(json.dumps(response))
        
    elif msg_type == "file_list_request":
        print("File list request received")
        response = await handle_file_list_request(data, client_ip)
        await websocket.send(json.dumps(response))
        
    elif msg_type == "file_download_request":
        print("File download request received")
        response = await handle_file_download_request(data, client_ip)
        await websocket.send(json.dumps(response))

    else:
        # Unknown message type
        response = {
            'type': 'error',
            'message': f'Unknown message type: {msg_type}'
        }
        await websocket.send(json.dumps(response))

async def handle_file_start(data, client_ip):
    """Handle file transfer start."""
    file_id = data.get('fileId')
    # Handle both 'fileName' and 'name' field names
    file_name = data.get('fileName') or data.get('name', 'unknown')
    file_size = data.get('fileSize') or data.get('size', 0)
    mime_type = data.get('mime', 'application/octet-stream')
    
    print("File Start Info: ")
    print("-" * 50)
    print(f"File ID: {file_id}")
    print(f"File Name: {file_name}")
    print(f"File Size: {file_size:,} bytes")
    print(f"Mime Type: {mime_type}")
    print(f"From: {client_ip}")
    print("-" * 50)
    
    # Automatically accept file transfer
    print(f"✅ Starting file transfer: {file_name}")
    
    # Initialize file transfer with proper filename
    file_transfers[file_id] = {
        'name': str(file_name),  # Ensure it's a string and preserve original name
        'size': int(file_size),  # Ensure it's an integer
        'mime': mime_type,
        'chunks': [],
        'received': 0,
        'last_percent': -1,  # Start at -1 to ensure first progress update
        'status': 'receiving'
    }
    
    return {
        "type": "file_start_response",
        "fileId": file_id,
        "receive": True,
        "status": "ready"
    }

async def handle_file_chunk(data, client_ip):
    """Handle file chunk upload."""
    file_id = data.get('fileId')
    chunk_index = data.get('index', 0)
    chunk_data = data.get('data', '')
    
    transfer = file_transfers.get(file_id)
    if not transfer:
        return {
            "type": "file_chunk_error",
            "fileId": file_id,
            "message": "Transfer not found"
        }
    
    try:
        # Decode chunk data
        chunk_bytes = base64.b64decode(chunk_data)
        transfer['received'] += len(chunk_bytes)
        
        # Calculate progress - handle division by zero
        if transfer['size'] > 0:
            percent = int((transfer['received'] / transfer['size']) * 100)
        else:
            percent = 0
        
        # Print progress every 5% or when it changes significantly
        if percent != transfer['last_percent'] and (percent % 5 == 0 or percent == 100):
            transfer['last_percent'] = percent
            print(f"\r📁 Receiving {transfer['name']}: {percent}%", end='', flush=True)
        
        # Store chunk for later assembly
        transfer['chunks'].append(chunk_data)
        
        return {
            "type": "file_chunk_response",
            "fileId": file_id,
            "index": chunk_index,
            "status": "received",
            "progress": percent
        }
        
    except Exception as e:
        print(f"\n❌ Error processing chunk: {e}")
        return {
            "type": "file_chunk_error",
            "fileId": file_id,
            "message": str(e)
        }

async def handle_file_end(data, client_ip):
    """Handle file transfer end."""
    file_id = data.get('fileId')
    transfer = file_transfers.get(file_id)
    
    if not transfer:
        return {
            "type": "file_end_error",
            "fileId": file_id,
            "message": "Transfer not found"
        }
    
    try:
        print(f"\n Assembling file: {transfer['name']}")
        
        # Combine all chunks
        all_data = ''.join(transfer['chunks'])
        file_buffer = base64.b64decode(all_data)
        
        # Save file to Downloads directory with original filename
        file_path = downloads_dir / transfer['name']
        
        # Handle duplicate filenames by adding number suffix
        counter = 1
        original_path = file_path
        while file_path.exists():
            # Split filename and extension
            stem = original_path.stem
            suffix = original_path.suffix
            file_path = downloads_dir / f"{stem}_{counter}{suffix}"
            counter += 1
        
        with open(file_path, 'wb') as f:
            f.write(file_buffer)
        
        print(f"✅ File saved: {file_path}")
        print(f"📊 Total received: {transfer['received']:,} bytes")
        
        # Clean up transfer
        del file_transfers[file_id]
        
        return {
            "type": "file_end_response",
            "fileId": file_id,
            "status": "success",
            "filePath": str(file_path),
            "fileSize": transfer['received']
        }
        
    except Exception as e:
        print(f"\n❌ Error saving file: {e}")
        return {
            "type": "file_end_error",
            "fileId": file_id,
            "message": str(e)
        }

async def handle_file_list_request(data, client_ip):
    """Handle request for list of available files."""
    directory = data.get('directory', os.getcwd())
    
    try:
        files = []
        for item in os.listdir(directory):
            item_path = os.path.join(directory, item)
            if os.path.isfile(item_path):
                file_info = {
                    'name': item,
                    'size': os.path.getsize(item_path),
                    'path': item_path,
                    'modified': os.path.getmtime(item_path)
                }
                files.append(file_info)
        
        print(f"📂 File list request from {client_ip}: {len(files)} files")
        
        return {
            "type": "file_list_response",
            "files": files,
            "count": len(files),
            "directory": directory
        }
        
    except Exception as e:
        print(f"❌ Error listing files: {e}")
        return {
            "type": "file_list_error",
            "message": str(e)
        }

async def handle_file_download_request(data, client_ip):
    """Handle request to download a file."""
    file_path = data.get('filePath')
    
    if not file_path or not os.path.exists(file_path):
        return {
            "type": "file_download_error",
            "message": "File not found"
        }
    
    try:
        file_size = os.path.getsize(file_path)
        file_name = os.path.basename(file_path)
        
        print(f"📤 File download request from {client_ip}: {file_name} ({file_size} bytes)")
        
        return {
            "type": "file_download_response",
            "fileId": f"download_{int(time.time())}",
            "fileName": file_name,
            "fileSize": file_size,
            "filePath": file_path,
            "status": "ready"
        }
        
    except Exception as e:
        print(f"❌ Error preparing download: {e}")
        return {
            "type": "file_download_error",
            "message": str(e)
        }

# ... rest of your existing functions remain the same ...

async def handle_media(command,data, client_ip):
    """Handle media operations."""
    print(f'Media {command} from {client_ip}')
    if command == "volume":
        if data.get("value","") == "+":
            set_volume(Volume.VUP)
            return {
                "type": "volume_response",
                "action": "volume",
                "message": "Volume increased"
            }
        elif data.get("value","") == "-":
            set_volume(Volume.VDOWN)
            return {
                "type": "volume_response",
                "action": "volume",
                "message": "Volume decreased"
            }
    elif command == "brightness":
        if data.get("value","") == "+":
            set_brightness(Brightness.BUP)
            return {
                "type": "brightness_response",
                "action": "brightness",
                "message": "Brightness increased"
            }
        elif data.get("value","") == "-":
            set_brightness(Brightness.BDOWN)
            return {
                "type": "brightness_response",
                "action": "brightness",
                "message": "Brightness decreased"
            }
    elif command == "playpause":
        media_playback("playpause")
        return {
            "type": "media_response",
            "action": "playpause",
            "message": "Play/Pause"
        }
    elif command == "next":
        media_playback("next")
        return {
            "type": "media_response",
            "action": "next",
            "message": "Next"
        }
    elif command == "previous":
        media_playback("previous")
        return {
            "type": "media_response",
            "action": "previous",
            "message": "Previous"
        }

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

async def handle_remote_input(data, client_ip):
    """Handle remote input (touchpad) operations."""
    fingerX = data.get('fingerX', 0)
    fingerY = data.get('fingerY', 0)
    normalizedX = data.get('normalizedX', 0)
    normalizedY = data.get('normalizedY', 0)
    touchpadWidth = data.get('touchpadWidth', 280)
    touchpadHeight = data.get('touchpadHeight', 220)
    
    print(f'Remote input from {client_ip}: fingerX={fingerX}, fingerY={fingerY}, normalized=({normalizedX}, {normalizedY})')
    
    # Get current screen dimensions
    import pyautogui
    screen_width, screen_height = pyautogui.size()
    
    # Calculate target cursor position on screen based on finger position
    targetX = int(normalizedX * screen_width)
    targetY = int(normalizedY * screen_height)
    
    # Get current cursor position
    currentX, currentY = pyautogui.position()
    
    # Calculate the delta movement needed
    deltaX = targetX - currentX
    deltaY = targetY - currentY
    
    # Use the existing move_cursor function from mouse_keyboard.py
    success = move_cursor(deltaX, deltaY)
    
    if success:
        print(f'✅ Cursor moved to: ({targetX}, {targetY}) based on finger position ({fingerX}, {fingerY})')
        return {
            'type': 'remote_input_response',
            'status': 'success',
            'message': f'Cursor moved to ({targetX}, {targetY})'
        }
    else:
        print(f'❌ Error moving cursor')
        return {
            'type': 'remote_input_response',
            'status': 'error',
            'message': 'Failed to move cursor'
        }

async def handle_connection(websocket):  # Fixed: removed 'path' parameter
    """Handle WebSocket connection."""
    client_ip = websocket.remote_address[0]
    print(f'Client connected from {client_ip}!')
    
    # Update GUI status
    update_status(f"Device connected from {client_ip}")
    
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

def show_qr_window(pairing_info):
    """This function is kept for compatibility but now just saves QR code to file."""
    print("QR code window functionality has been replaced with file-based QR code generation.")
    print("QR code is automatically saved to the temp directory.")
    return save_qr_code(pairing_info)

async def main(stop_event=None):
    """Main server function."""
    print('--- WebSocket Pairing Server ---')
    print(f'LAN IP: {pairing_info["server_ip"]}')
    print(f'Port: {PORT}')
    print(f'Pairing token: {TOKEN}')
    
    # Save QR code to temp folder instead of creating GUI window
    qr_file_path = save_qr_code(pairing_info)
    if qr_file_path:
        print(f'--- QR code saved to: {qr_file_path} ---')
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
