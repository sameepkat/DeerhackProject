# Notification display
import platform
import subprocess
import sys
from typing import Optional

class PCNotificationManager:
    
    def __init__(self):
        self.os_type = platform.system().lower()
        self._setup_platform_specific()
    

    def _setup_platform_specific(self):
        if self.os_type == "windows":
            try:
                import win10toast
                self.toast = win10toast.ToastNotifier()
                self.windows_available = True
            except ImportError:
                print("win10toast not installed. Install with: pip install win10toast")
                self.windows_available = False
        
        elif self.os_type == "linux":
            # Check if notify-send is available
            try:
                subprocess.run(["notify-send", "--version"], 
                             capture_output=True, check=True)
                self.linux_available = True
            except (subprocess.CalledProcessError, FileNotFoundError):
                print("notify-send not found. Install libnotify-bin")
                self.linux_available = False
        
        elif self.os_type == "darwin":  # macOS
            self.macos_available = True

    
    def send_notification(self, title: str, message: str, 
                         duration: int = 5, icon_path: Optional[str] = None):
        try:
            if self.os_type == "windows":
                return self._send_windows_notification(title, message, duration, icon_path)
            elif self.os_type == "linux":
                return self._send_linux_notification(title, message, duration, icon_path)
            elif self.os_type == "darwin":
                return self._send_macos_notification(title, message, icon_path)
            else:
                print(f"Unsupported OS: {self.os_type}")
                return False
        except Exception as e:
            print(f"Error sending notification: {e}")
            return False
    

    def _send_windows_notification(self, title: str, message: str, 
                                  duration: int, icon_path: Optional[str]):
        if not self.windows_available:
            return False
        
        try:
            self.toast.show_toast(
                title,
                message,
                duration=duration,
                icon_path=icon_path,
                threaded=True
            )
            return True
        except Exception as e:
            print(f"Windows notification error: {e}")
            return False
    

    def _send_linux_notification(self, title: str, message: str, 
                                duration: int, icon_path: Optional[str]):
        if not self.linux_available:
            return False
        
        # D-bus using notify-send
        try:
            cmd = ["notify-send", title, message, "-t", str(duration * 1000)]
            if icon_path:
                cmd.extend(["-i", icon_path])
            
            subprocess.run(cmd, check=True)
            return True
        except subprocess.CalledProcessError as e:
            print(f"Linux notification error: {e}")
            return False
    

    def _send_macos_notification(self, title: str, message: str, 
                               icon_path: Optional[str]):
        # through osascript
        try:
            script = f'''
            display notification "{message}" with title "{title}"
            '''
            subprocess.run(["osascript", "-e", script], check=True)
            return True
        except subprocess.CalledProcessError as e:
            print(f"macOS notification error: {e}")
            return False


# Advanced Linux D-Bus implementation (alternative to notify-send)
class LinuxDBusNotifier:
    """
    Direct D-Bus implementation for Linux notifications
    Requires: pip install dbus-python
    """
    
    def __init__(self):
        try:
            import dbus
            self.dbus = dbus
            self.bus = dbus.SessionBus()
            self.notify_service = self.bus.get_object(
                'org.freedesktop.Notifications',
                '/org/freedesktop/Notifications'
            )
            self.notify_interface = dbus.Interface(
                self.notify_service,
                'org.freedesktop.Notifications'
            )
            self.available = True
        except ImportError:
            print("dbus-python not installed. Install with: pip install dbus-python")
            self.available = False
        except Exception as e:
            print(f"D-Bus connection error: {e}")
            self.available = False
    
    def send_notification(self, title: str, message: str, 
                         app_name: str = "KDE Connect Clone",
                         icon: str = "", timeout: int = 5000,
                         urgency: int = 1):
        if not self.available:
            return False
        
        try:
            hints = {
                'urgency': self.dbus.Byte(urgency)
            }
            
            notification_id = self.notify_interface.Notify(
                app_name,      # app_name
                0,            # replaces_id
                icon,         # app_icon
                title,        # summary
                message,      # body
                [],           # actions
                hints,        # hints
                timeout       # expire_timeout
            )
            return notification_id
        except Exception as e:
            print(f"D-Bus notification error: {e}")
            return False


# Usage example and testing
def main():
    # Initialize notification manager
    notifier = PCNotificationManager()
    
    # Test basic notification
    print("Testing basic notification...")
    success = notifier.send_notification(
        "KDE Connect Clone",
        "Phone connected successfully!",
        duration=3
    )
    print(f"Notification sent: {success}")
    
    # Test with icon (provide your own icon path)
    print("\nTesting notification with icon...")
    success = notifier.send_notification(
        "New Message",
        "You have received a new message from your phone",
        duration=5,
        icon_path=None  # Replace with actual icon path
    )
    print(f"Notification with icon sent: {success}")
    
    # Linux D-Bus example (if on Linux)
    if platform.system().lower() == "linux":
        print("\nTesting Linux D-Bus notification...")
        dbus_notifier = LinuxDBusNotifier()
        if dbus_notifier.available:
            notification_id = dbus_notifier.send_notification(
                "D-Bus Test",
                "This is a direct D-Bus notification",
                urgency=2  # Critical
            )
            print(f"D-Bus notification ID: {notification_id}")


# Notification server for receiving notifications from phone
class NotificationServer:
    """
    Simple notification server to receive notifications from phone
    This would be part of your KDE Connect-like app
    """
    
    def __init__(self):
        self.notifier = PCNotificationManager()
        self.received_notifications = []
    
    def handle_phone_notification(self, notification_data: dict):
        """
        Handle incoming notification from phone
        
        Args:
            notification_data: Dict with 'title', 'message', 'app', etc.
        """
        title = notification_data.get('title', 'Phone Notification')
        message = notification_data.get('message', '')
        app_name = notification_data.get('app', 'Unknown App')
        
        # Format the notification
        formatted_title = f"{app_name}: {title}"
        
        # Send to PC
        success = self.notifier.send_notification(
            formatted_title,
            message,
            duration=5
        )
        
        # Store for history
        if success:
            self.received_notifications.append({
                'timestamp': __import__('datetime').datetime.now(),
                'title': formatted_title,
                'message': message,
                'app': app_name
            })
        
        return success
    
    def get_notification_history(self):
        """Get history of received notifications"""
        return self.received_notifications


if __name__ == "__main__":
    main()