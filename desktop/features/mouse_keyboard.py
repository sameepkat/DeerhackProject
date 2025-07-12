# Mouse/keyboard simulation
import pyautogui
import time


def track_cursor_pynput():
    """Original method using pynput event listeners"""
    from pynput.mouse import Button, Listener
    
    def on_cursor_move(x, y):
        print(f"Cursor position => x: {x}, y: {y}")

    def on_cursor_click(x, y, button, pressed):
        action = "pressed" if pressed else "released"
        print(f"Mouse {action} => x: {x}, y: {y}, button: {button}")

    def on_cursor_scroll(x, y, dx, dy):
        print(f"Scroll at => x: {x}, y: {y}, dx: {dx}, dy: {dy}")

    try:
        listener = Listener(
            on_move=on_cursor_move,
            on_click=on_cursor_click,
            on_scroll=on_cursor_scroll
        )
        
        listener.start()
        listener.join()
        
    except Exception as e:
        print(f"pynput failed: {e}")
        print("Trying fallback method...")
        track_cursor_polling()


# fallback incase permission not available
def track_cursor_polling():
    print("Using polling method (fallback for permission issues)")
    last_pos = None
    
    try:
        while True:
            x, y = pyautogui.position()
            if last_pos != (x, y):
                print(f"Cursor position => x: {x}, y: {y}")
                last_pos = (x, y)
            time.sleep(0.1)
    except KeyboardInterrupt:
        print("\nStopping cursor tracker...")

def press_key(key):
    pyautogui.PAUSE = 0.1
    try:
        if key == 'next':
            key = 'right'
        elif key == 'previous':
            key = 'left'
        else:
            key = key

        pyautogui.press(key)
        return True
    except Exception as e:
        print(f"Error pressing key: {e}")
        return False
