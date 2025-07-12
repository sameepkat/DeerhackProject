# Clipboard sync (receive/update)
import pyperclip

def send_clipboard():
    try:
        clipboard_content = pyperclip.paste()
        return clipboard_content
    except pyperclip.PyperclipException as e:
        print(f"Error accessing clipboard: {e}")
        print("Ensure xclip or xsel is installed on Linux, or other necessary backend tools are available.")

def recieve_clipboard(data):
    try:
        pyperclip.copy(data)
        print("Clipboard updated")
    except pyperclip.PyperclipException as e:
        print(f"Error accessing clipboard: {e}")
        print("Ensure xclip or xsel is installed on Linux, or other necessary backend tools are available.")
