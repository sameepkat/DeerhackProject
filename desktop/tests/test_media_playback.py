from ..features import media_playback
import platform
import time
# Import win32api for Windows media control
try:
    import win32con
    import win32api
    WINDOWS_AVAILABLE = True
except ImportError:
    WINDOWS_AVAILABLE = False

# Convenience functions for easier usage
def play_pause():
    """Play or pause media playback."""
    return media_playback('playpause')

def next_track():
    """Skip to next track."""
    return media_playback('next')

def previous_track():
    """Skip to previous track."""
    return media_playback('previous')



def play_media():
    """Play media."""
    return media_playback('play')

def pause_media():
    """Pause media."""
    return media_playback('pause')

# Test function
def test_media_controls():
    """Test all media controls."""
    print("🎵 Testing Media Controls...")
    print(f"Platform: {platform.system()}")
    print(f"Windows API available: {WINDOWS_AVAILABLE}")

    # Test each control
    play_pause()
    time.sleep(1)
    next_track()
    time.sleep(1)
    previous_track()
    time.sleep(1)
    
    print("✅ Media control test completed!")

if __name__ == "__main__":
    test_media_controls()