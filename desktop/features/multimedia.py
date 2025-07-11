from enum import Enum
import platform
import subprocess

class Brightness(Enum):
    BUP = "+10"
    BDOWN = "-10"

class Volume(Enum):
    VUP = "+10"
    VDOWN = "-10"

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
            script_path = "scripts/brighten.applescript" if bright_val == Brightness.BUP else "scripts/dim.applescript"
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
            import win32con
            import win32api
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

def test_bright():
    val = input("enter 1 for up and 0 for down: ")
    if val == "1":
        set_brightness(Brightness.BUP)
    elif val == "0":
        set_brightness(Brightness.BDOWN)

def test_vol():
    val = input("enter 1 for volup and 0 for voldown: ")
    if val == "1":
        set_volume(Volume.VUP)
    elif val == "0":
        set_volume(Volume.VDOWN)

if __name__ == "__main__":
    while True:
        test_vol()
        # test_bright()