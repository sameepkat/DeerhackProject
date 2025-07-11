# System tray integration

from PySide6.QtWidgets import QApplication, QSystemTrayIcon, QMenu
from PySide6.QtGui import QIcon, QAction
import sys
import os

def run_tray():
    app = QApplication.instance() or QApplication(sys.argv)
    # Use a default icon if available, else fallback to a generic icon
    icon_path = os.path.join(os.path.dirname(__file__), '../../assests/test.jpg')
    if not os.path.exists(icon_path):
        icon = QIcon.fromTheme('application-exit')
    else:
        icon = QIcon(icon_path)
    tray = QSystemTrayIcon(icon)
    tray.setToolTip('Connect - Device Connection Manager')
    menu = QMenu()
    quit_action = QAction('Quit')
    quit_action.triggered.connect(app.quit)
    menu.addAction(quit_action)
    tray.setContextMenu(menu)
    tray.show()
    app.exec()

if __name__ == "__main__":
    run_tray()
