from enum import Enum
import platform
import subprocess
import os
import time

# Import win32api for Windows media control
try:
    import win32con
    import win32api
    WINDOWS_AVAILABLE = True
except ImportError:
    WINDOWS_AVAILABLE = False

class Brightness(Enum):
    BUP = "+10"
    BDOWN = "-10"

class Volume(Enum):
    VUP = "+10"
    VDOWN = "-10"

class Media(Enum):
    PLAYPAUSE = "playpause"
    NEXT = "next"
    PREVIOUS = "previous"

def set_brightness(bright_val: Brightness):
    if platform.system() == 'Windows':
        try:
            import screen_brightness_control as sbc
            current = sbc.get_brightness(display=0)
            print(f"🔆 Current Brightness: {current[0]}%")
            if bright_val == Brightness.BUP:
                sbc.set_brightness(min(current[0] + 10, 100), display=0)
            elif bright_val == Brightness.BDOWN:
                sbc.set_brightness(max(current[0] - 10, 0), display=0)
            print(f"✅ New Brightness: {sbc.get_brightness(display=0)[0]}%")
        except Exception as e:
            print("❌ Error controlling brightness on Windows:", e)

    elif platform.system() == 'Darwin':  # macOS
        try:
            # Resolve absolute path to the 'scripts' folder relative to multimedia.py
            script_dir = os.path.join(os.path.dirname(__file__), "scripts")
            script_filename = "brighten.applescript" if bright_val == Brightness.BUP else "dim.applescript"
            script_path = os.path.join(script_dir, script_filename)

            # Read and run AppleScript
            with open(script_path) as f:
                script = f.read()

            subprocess.run(['osascript', '-e', script], check=True)
            print(f"✅ Ran macOS AppleScript: {bright_val.name}")

        except Exception as e:
            print("❌ Error running AppleScript on macOS:", e)
    
    elif platform.system() == 'Linux':
        try:
            # Convert enum value to percentage format for brightnessctl
            if bright_val == Brightness.BUP:
                val = "10%+"
            elif bright_val == Brightness.BDOWN:
                val = "10%-"
            
            result = subprocess.run(["brightnessctl", "set", val], check=True, capture_output=True, text=True)
            print(f"✅ Brightness adjusted: {bright_val.name}")
            print(result.stdout.strip())
        except subprocess.CalledProcessError as e:
            print("❌ Failed to set brightness on Linux:")
            print(e.stderr)
        except Exception as e:
            print("❌ Other error:", e)

def set_volume(vol_val: Volume):
    if platform.system() == 'Windows':
        try:
            if vol_val == Volume.VUP:
                win32api.keybd_event(win32con.VK_VOLUME_UP, 0)
                win32api.keybd_event(win32con.VK_VOLUME_UP, 0, win32con.KEYEVENTF_KEYUP)
            elif vol_val == Volume.VDOWN:
                win32api.keybd_event(win32con.VK_VOLUME_DOWN, 0)
                win32api.keybd_event(win32con.VK_VOLUME_DOWN, 0, win32con.KEYEVENTF_KEYUP)
            print(f"✅ Windows volume adjusted: {vol_val.name}")
        except Exception as e:
            print("❌ Error controlling volume on Windows:", e)
            
    elif platform.system() == 'Darwin':  # macOS
        try:
            # Get current volume first
            current_vol_result = subprocess.run(
                ['osascript', '-e', 'output volume of (get volume settings)'],
                capture_output=True, text=True, check=True
            )
            current_volume = int(current_vol_result.stdout.strip())
            print(f"🔊 Current Volume: {current_volume}%")
            
            # Calculate new volume
            if vol_val == Volume.VUP:
                new_volume = min(current_volume + 10, 100)
            elif vol_val == Volume.VDOWN:
                new_volume = max(current_volume - 10, 0)
            
            # Set new volume (this shows the HUD)
            subprocess.run(
                ['osascript', '-e', f'set volume output volume {new_volume}'],
                check=True
            )
            print(f"✅ macOS volume set to: {new_volume}% ({vol_val.name})")
            
        except subprocess.CalledProcessError as e:
            print("❌ Error controlling volume on macOS:", e)
        except Exception as e:
            print("❌ Other error on macOS:", e)
            
    elif platform.system() == 'Linux':
        try:
            # Using amixer for volume control on Linux
            if vol_val == Volume.VUP:
                subprocess.run(['amixer', 'set', 'Master', '10%+'], check=True)
                print("✅ Linux volume increased by 10%")
            elif vol_val == Volume.VDOWN:
                subprocess.run(['amixer', 'set', 'Master', '10%-'], check=True)
                print("✅ Linux volume decreased by 10%")
        except subprocess.CalledProcessError as e:
            print("❌ Failed to set volume on Linux (amixer):", e)
            # Fallback to pactl (PulseAudio)
            try:
                if vol_val == Volume.VUP:
                    subprocess.run(['pactl', 'set-sink-volume', '@DEFAULT_SINK@', '+10%'], check=True)
                    print("✅ Linux volume increased by 10% (pactl)")
                elif vol_val == Volume.VDOWN:
                    subprocess.run(['pactl', 'set-sink-volume', '@DEFAULT_SINK@', '-10%'], check=True)
                    print("✅ Linux volume decreased by 10% (pactl)")
            except subprocess.CalledProcessError as e2:
                print("❌ Failed to set volume on Linux (pactl):", e2)
        except Exception as e:
            print("❌ Other error on Linux:", e)

def _send_media_key_windows(vk_code):
    """Send media key using win32api on Windows."""
    try:
        if WINDOWS_AVAILABLE:
            win32api.keybd_event(vk_code, 0, 0, 0)
            time.sleep(0.05)  # Small delay
            win32api.keybd_event(vk_code, 0, win32con.KEYEVENTF_KEYUP, 0)
            return True
        else:
            return _send_media_key_windows_powershell(vk_code)
    except Exception as e:
        print(f"win32api error: {e}")
        return _send_media_key_windows_powershell(vk_code)

def _send_media_key_windows_powershell(vk_code):
    """Send media key using PowerShell (fallback for Windows)."""
    try:
        script = f"""
        Add-Type -TypeDefinition '
        using System;
        using System.Runtime.InteropServices;
        
        public class MediaKeys {{
            [DllImport("user32.dll")]
            public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);
            
            public const byte VK_MEDIA_PLAY_PAUSE = 0xB3;
            public const byte VK_MEDIA_NEXT_TRACK = 0xB0;
            public const byte VK_MEDIA_PREV_TRACK = 0xB1;
            public const byte VK_MEDIA_STOP = 0xB2;
            public const uint KEYEVENTF_KEYUP = 0x0002;
        }}'
        
        [MediaKeys]::keybd_event([MediaKeys]::{vk_code}, 0, 0, [UIntPtr]::Zero)
        [MediaKeys]::keybd_event([MediaKeys]::{vk_code}, 0, [MediaKeys]::KEYEVENTF_KEYUP, [UIntPtr]::Zero)
        """
        subprocess.run(['powershell', '-Command', script], check=True, capture_output=True)
        return True
    except Exception as e:
        print(f"PowerShell media key error: {e}")
        return False

def media_playback(action):
    """
    Control media playback: next, previous, play, pause.
    action: str, one of 'next', 'previous', 'play', 'pause'
    """
    system = platform.system()
    try:
        if system == 'Darwin':  # macOS
            # Use AppleScript to send media key events
            script_map = {
                'play': 'tell application "System Events" to key code 16',
                'pause': 'tell application "System Events" to key code 16',
                'next': 'tell application "System Events" to key code 17',
                'previous': 'tell application "System Events" to key code 18'
            }
            script = script_map.get(action)
            if script:
                subprocess.run(['osascript', '-e', script], check=True)
                print(f"✅ macOS media action '{action}' executed")
            else:
                print(f"❌ Unknown media action: {action}")
        elif system == 'Linux':
            # Try playerctl first (works with most modern Linux DEs)
            playerctl_map = {
                'play': 'play',
                'pause': 'pause',
                'next': 'next',
                'previous': 'previous'
            }
            playerctl_action = playerctl_map.get(action)
            if playerctl_action:
                try:
                    subprocess.run(['playerctl', playerctl_action], check=True)
                    print(f"✅ Linux media action '{action}' executed (playerctl)")
                except Exception as e:
                    # Fallback to xdotool for media keys
                    key_map = {
                        'play': 'XF86AudioPlay',
                        'pause': 'XF86AudioPause',
                        'next': 'XF86AudioNext',
                        'previous': 'XF86AudioPrev'
                    }
                    key = key_map.get(action)
                    if key:
                        subprocess.run(['xdotool', 'key', key], check=True)
                        print(f"✅ Linux media action '{action}' executed (xdotool)")
                    else:
                        print(f"❌ Unknown media action: {action}")
            else:
                print(f"❌ Unknown media action: {action}")
        elif system == 'Windows':
             # Windows media control using win32api or PowerShell
            media_key_map = {
                'play': 'VK_MEDIA_PLAY_PAUSE',
                'pause': 'VK_MEDIA_PLAY_PAUSE',
                'playpause': 'VK_MEDIA_PLAY_PAUSE',
                'next': 'VK_MEDIA_NEXT_TRACK',
                'previous': 'VK_MEDIA_PREV_TRACK',
                'stop': 'VK_MEDIA_STOP'
            }
            
            vk_code = media_key_map.get(action)
            if vk_code:
                success = _send_media_key_windows(vk_code)
                if success:
                    print(f"✅ Windows media action '{action}' executed")
                else:
                    print(f"❌ Failed to execute Windows media action '{action}'")
            else:
                print(f"❌ Unknown media action: {action}")
           
        else:
            print(f"❌ Unsupported platform: {system}")
    except Exception as e:
        print(f"❌ Error executing media action '{action}': {e}")


