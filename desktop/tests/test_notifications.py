import platform
from desktop import features
import os
from desktop.features.notifications import LinuxDBusNotifier

def test():
    notifier = features.PCNotificationManager()
    
    print("Testing basic notification...")
    success = notifier.send_notification(
        "KDE Connect Clone",
        "Phone connected successfully!",
        duration=30
    )
    print(f"Notification sent: {success}")
    
    print("\nTesting notification with icon...")
    # Use a relative path for the icon
    icon_path = os.path.join(os.path.dirname(__file__), '../../assests/test.jpg')
    icon_path = os.path.abspath(icon_path)
    success = notifier.send_notification(
        "New Message",
        "You have received a new message from your phone",
        duration=50,
        icon_path=icon_path  # not supported in mac, on other please adjust it
    )
    print(f"Notification with icon sent: {success}")
    
    # (if on Linux)
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


test()
