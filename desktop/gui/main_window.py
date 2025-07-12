# desktop/gui/main_window.py
import sys
from PySide6.QtWidgets import QApplication, QMainWindow, QWidget, QHBoxLayout, QFrame, QVBoxLayout, QStackedWidget, QLabel, QPushButton, QScrollArea
from PySide6.QtCore import Qt

from multiprocessing import Process, Event
from ..server.ws_handler import run_server 
import asyncio

from .dashboard import DashboardPage
from .devices import DevicesPage  # Assuming you have a DevicesPage class
from .file_transfer_widget import FileTransferWidget

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.stop_event = Event()
        # starting a true separate process for websocket
        self.ws_process = Process(target=run_server, args=(self.stop_event,))
        self.ws_process.start()



        self.setWindowTitle("Connect - Device Connection Manager")
        self.setGeometry(100, 100, 1200, 800)
        self.setStyleSheet("""
            QMainWindow {
                background-color: #f5f5f5;
            }
        """)
        self.init_ui()

    def init_ui(self):
        # Main layout
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QHBoxLayout(central_widget)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)

        # Sidebar
        self.sidebar = self.create_sidebar()
        main_layout.addWidget(self.sidebar)

        # Main content area (stacked widget)
        self.main_content = QStackedWidget()
        self.dashboard_page = DashboardPage()
        self.devices_page = DevicesPage()
        self.file_transfer_page = FileTransferWidget()
        self.main_content.addWidget(self.dashboard_page)
        self.main_content.addWidget(self.devices_page)
        self.main_content.addWidget(self.file_transfer_page)
        main_layout.addWidget(self.main_content)

        # Wrap the stacked widget in a scroll area
        scroll_area = QScrollArea()
        scroll_area.setWidget(self.main_content)
        scroll_area.setWidgetResizable(True)
        main_layout.addWidget(scroll_area)

        scroll_area.setStyleSheet("""
            QScrollArea, QScrollArea QWidget {
                background: #f5f5f5;
            }
        """)

        # Set default page
        self.show_dashboard()

    def create_sidebar(self):
        # sidebar = QFrame()
        # sidebar.setFixedWidth(220)
        # sidebar.setStyleSheet("background-color: #ffe; border-right: 1px solid #e0e0e0;")
        # layout = QVBoxLayout(sidebar)
        # layout.setContentsMargins(16, 16, 16, 16)
        # layout.setSpacing(8)
        self.sidebar = QFrame()
        self.sidebar.setFixedWidth(250)
        self.sidebar.setStyleSheet("""
            QFrame {
                background-color: #ffffff;
                border-right: 1px solid #e0e0e0;
            }
        """)
        
        sidebar_layout = QVBoxLayout(self.sidebar)
        sidebar_layout.setContentsMargins(16, 16, 16, 16)
        sidebar_layout.setSpacing(8)


        # Navigation buttons
        self.dashboard_btn = QPushButton("🏠 Dashboard")
        self.devices_btn = QPushButton("📱 Devices")
        self.file_transfer_btn = QPushButton("📄 File Transfer")
        for btn in [self.dashboard_btn, self.devices_btn, self.file_transfer_btn]:
            btn.setFixedHeight(40)
            btn.setStyleSheet("text-align: left; font-size: 15px; color: #333333; background-color: transparent;")
            sidebar_layout.addWidget(btn)

        sidebar_layout.addStretch()
        self.dashboard_btn.clicked.connect(self.show_dashboard)
        self.devices_btn.clicked.connect(self.show_devices)
        self.file_transfer_btn.clicked.connect(self.show_file_transfer)
        return self.sidebar

    def show_dashboard(self):
        self.main_content.setCurrentIndex(0)

    def show_devices(self):
        self.main_content.setCurrentIndex(1)

    def show_file_transfer(self):
        self.main_content.setCurrentIndex(2)

    def closeEvent(self, event):
        # Signal the websocket process to close
        self.stop_event.set()
        self.ws_process.join(timeout=5)
        super().closeEvent(event)

def main():
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec())

if __name__ == "__main__":
    main()