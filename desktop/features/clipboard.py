# Clipboard sync (receive/update)
import pyperclip

def clipboard():
    try:
        clipboard_content = pyperclip.paste()
        print(f"Clipboard content: {clipboard_content}")
    except pyperclip.PyperclipException as e:
        print(f"Error accessing clipboard: {e}")
        print("Ensure xclip or xsel is installed on Linux, or other necessary backend tools are available.")
