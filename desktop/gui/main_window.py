# Main GUI window (PySide6)
import sys
from PySide6.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                               QHBoxLayout, QLabel, QPushButton, QFrame, QGridLayout,
                               QScrollArea, QSplitter, QListWidget, QListWidgetItem,
                               QStackedWidget, QSizePolicy)
from PySide6.QtCore import Qt, QSize, QTimer
from PySide6.QtGui import QFont, QPixmap, QIcon, QPainter, QColor, QPen
from devices import DevicesPage

class StatsCard(QFrame):
    def __init__(self, title, value, icon_color="#007acc"):
        super().__init__()
        self.setFrameStyle(QFrame.Box)
        self.setStyleSheet("""
            QFrame {
                background-color: #ffffff;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                padding: 16px;
            }
        """)
        
        layout = QVBoxLayout()
        
        # Icon (simulated with colored square)
        icon_label = QLabel()
        icon_label.setFixedSize(24, 24)
        icon_label.setStyleSheet(f"""
            QLabel {{
                background-color: {icon_color};
                border-radius: 4px;
            }}
        """)
        
        # Title
        title_label = QLabel(title)
        title_label.setStyleSheet("""
            QLabel {
                font-size: 12px;
                color: #666666;
                font-weight: normal;
            }
        """)
        
        # Value
        value_label = QLabel(str(value))
        value_label.setStyleSheet("""
            QLabel {
                font-size: 32px;
                font-weight: bold;
                color: #333333;
            }
        """)
        
        layout.addWidget(icon_label)
        layout.addWidget(title_label)
        layout.addWidget(value_label)
        layout.addStretch()
        
        self.setLayout(layout)

class QuickActionCard(QFrame):
    def __init__(self, title, description, icon_color="#007acc"):
        super().__init__()
        self.setFrameStyle(QFrame.Box)
        self.setStyleSheet("""
            QFrame {
                background-color: #ffffff;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                padding: 16px;
            }
            QFrame:hover {
                border: 2px solid #007acc;
                cursor: pointer;
            }
        """)
        
        layout = QVBoxLayout()
        
        # Icon
        icon_label = QLabel()
        icon_label.setFixedSize(48, 48)
        icon_label.setStyleSheet(f"""
            QLabel {{
                background-color: {icon_color};
                border-radius: 8px;
            }}
        """)
        
        # Title
        title_label = QLabel(title)
        title_label.setStyleSheet("""
            QLabel {
                font-size: 16px;
                font-weight: bold;
                color: #333333;
                margin-top: 12px;
            }
        """)
        
        # Description
        desc_label = QLabel(description)
        desc_label.setStyleSheet("""
            QLabel {
                font-size: 12px;
                color: #666666;
                margin-top: 4px;
            }
        """)
        desc_label.setWordWrap(True)
        
        layout.addWidget(icon_label)
        layout.addWidget(title_label)
        layout.addWidget(desc_label)
        layout.addStretch()
        
        self.setLayout(layout)

class EmptyStateWidget(QFrame):
    def __init__(self, title, description):
        super().__init__()
        self.setStyleSheet("""
            QFrame {
                background-color: #ffffff;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                padding: 32px;
            }
        """)
        
        layout = QVBoxLayout()
        layout.setAlignment(Qt.AlignCenter)
        
        # Icon placeholder
        icon_label = QLabel()
        icon_label.setFixedSize(64, 64)
        icon_label.setStyleSheet("""
            QLabel {
                background-color: #f0f0f0;
                border-radius: 8px;
            }
        """)
        icon_label.setAlignment(Qt.AlignCenter)
        
        # Title
        title_label = QLabel(title)
        title_label.setStyleSheet("""
            QLabel {
                font-size: 16px;
                font-weight: bold;
                color: #333333;
                margin-top: 16px;
            }
        """)
        title_label.setAlignment(Qt.AlignCenter)
        
        # Description
        desc_label = QLabel(description)
        desc_label.setStyleSheet("""
            QLabel {
                font-size: 12px;
                color: #666666;
                margin-top: 8px;
            }
        """)
        desc_label.setAlignment(Qt.AlignCenter)
        desc_label.setWordWrap(True)
        
        layout.addWidget(icon_label)
        layout.addWidget(title_label)
        layout.addWidget(desc_label)
        
        self.setLayout(layout)

class SidebarButton(QPushButton):
    def __init__(self, text, icon_color="#007acc"):
        super().__init__(text)
        self.setFixedHeight(48)
        self.setStyleSheet(f"""
            QPushButton {{
                text-align: left;
                padding: 12px 16px;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                background-color: transparent;
                color: #333333;
            }}
            QPushButton:hover {{
                background-color: #f0f0f0;
            }}
            QPushButton:checked {{
                background-color: #007acc;
                color: white;
            }}
        """)
        self.setCheckable(True)

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Connect - Device Connection Manager")
        self.setGeometry(100, 100, 1200, 800)
        self.setStyleSheet("""
            QMainWindow {
                background-color: #f5f5f5;
            }
        """)
        
        # Create central widget and main layout
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        main_layout = QHBoxLayout(central_widget)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)
        
        # Create sidebar
        self.create_sidebar()
        
        # Create main content area
        self.create_main_content()
        
        # Create splitter to divide sidebar and content
        splitter = QSplitter(Qt.Horizontal)
        splitter.addWidget(self.sidebar)
        splitter.addWidget(self.main_content)
        splitter.setSizes([250, 950])
        splitter.setChildrenCollapsible(False)
        
        main_layout.addWidget(splitter)
        
        # Set default selected page
        self.dashboard_btn.setChecked(True)
        
    def create_sidebar(self):
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
        
        # App title and status
        title_layout = QHBoxLayout()
        
        # App icon
        app_icon = QLabel()
        app_icon.setFixedSize(32, 32)
        app_icon.setStyleSheet("""
            QLabel {
                background-color: #007acc;
                border-radius: 16px;
            }
        """)
        
        # Title and status
        title_info = QVBoxLayout()
        title_label = QLabel("Connect")
        title_label.setStyleSheet("""
            QLabel {
                font-size: 16px;
                font-weight: bold;
                color: #333333;
            }
        """)
        
        status_label = QLabel("● Offline")
        status_label.setStyleSheet("""
            QLabel {
                font-size: 12px;
                color: #666666;
            }
        """)
        
        title_info.addWidget(title_label)
        title_info.addWidget(status_label)
        title_info.setContentsMargins(0, 0, 0, 0)
        title_info.setSpacing(2)
        
        title_layout.addWidget(app_icon)
        title_layout.addLayout(title_info)
        title_layout.addStretch()
        
        sidebar_layout.addLayout(title_layout)
        sidebar_layout.addSpacing(24)
        
        # Navigation buttons
        self.dashboard_btn = SidebarButton("🏠 Dashboard")
        self.devices_btn = SidebarButton("📱 Devices")
        self.file_transfer_btn = SidebarButton("📁 File Transfer")
        self.messages_btn = SidebarButton("💬 Messages")
        self.settings_btn = SidebarButton("⚙️ Settings")
        
        sidebar_layout.addWidget(self.dashboard_btn)
        sidebar_layout.addWidget(self.devices_btn)
        sidebar_layout.addWidget(self.file_transfer_btn)
        sidebar_layout.addWidget(self.messages_btn)
        sidebar_layout.addWidget(self.settings_btn)
        
        sidebar_layout.addStretch()
        
        # Connected devices section
        devices_section = QLabel("Connected Devices")
        devices_section.setStyleSheet("""
            QLabel {
                font-size: 12px;
                color: #666666;
                font-weight: bold;
                margin-bottom: 8px;
            }
        """)

        
        
        device_count = QLabel("0")
        device_count.setStyleSheet("""
            QLabel {
                font-size: 14px;
                color: #333333;
                background-color: #f0f0f0;
                padding: 4px 8px;
                border-radius: 4px;
            }
        """)
        
        sidebar_layout.addWidget(devices_section)
        sidebar_layout.addWidget(device_count)
        
        # Connect button events
        self.dashboard_btn.clicked.connect(lambda: self.show_dashboard())
        self.devices_btn.clicked.connect(lambda: self.show_devices())
        self.file_transfer_btn.clicked.connect(lambda: self.show_file_transfer())
        self.messages_btn.clicked.connect(lambda: self.show_messages())
        self.settings_btn.clicked.connect(lambda: self.show_settings())
        
    def create_main_content(self):
        self.main_content = QStackedWidget()
        self.main_content.setStyleSheet("""
            QStackedWidget {
                background-color: #f5f5f5;
            }
        """)
        # Create dashboard page
        self.create_dashboard_page()
        # Use DevicesPage for the devices section
        self.devices_page = DevicesPage()
        self.main_content.addWidget(self.devices_page)
        # Create other pages (placeholders)
        self.create_file_transfer_page()
        self.create_messages_page()
        self.create_settings_page()
        
    def create_dashboard_page(self):
        dashboard_page = QWidget()
        dashboard_layout = QVBoxLayout(dashboard_page)
        dashboard_layout.setContentsMargins(24, 24, 24, 24)
        dashboard_layout.setSpacing(24)
        
        # Header
        header_layout = QHBoxLayout()
        
        header_info = QVBoxLayout()
        header_title = QLabel("Dashboard")
        header_title.setStyleSheet("""
            QLabel {
                font-size: 24px;
                font-weight: bold;
                color: #333333;
            }
        """)
        
        header_subtitle = QLabel("Overview of your connected devices and transfers")
        header_subtitle.setStyleSheet("""
            QLabel {
                font-size: 14px;
                color: #666666;
            }
        """)
        
        header_info.addWidget(header_title)
        header_info.addWidget(header_subtitle)
        
        # Status indicator
        status_indicator = QLabel("🔴 Offline")
        status_indicator.setStyleSheet("""
            QLabel {
                font-size: 14px;
                color: #666666;
                background-color: #ffffff;
                padding: 8px 16px;
                border-radius: 16px;
                border: 1px solid #e0e0e0;
            }
        """)
        
        header_layout.addLayout(header_info)
        header_layout.addStretch()
        header_layout.addWidget(status_indicator)
        
        dashboard_layout.addLayout(header_layout)
        
        # Stats cards
        stats_layout = QGridLayout()
        stats_layout.setSpacing(16)
        
        # Create stats cards
        connected_devices_card = StatsCard("Connected Devices", "0", "#4285f4")
        active_transfers_card = StatsCard("Active Transfers", "0", "#34a853")
        total_transfers_card = StatsCard("Total Transfers", "0", "#9c27b0")
        
        # Local IP card
        local_ip_card = QFrame()
        local_ip_card.setFrameStyle(QFrame.Box)
        local_ip_card.setStyleSheet("""
            QFrame {
                background-color: #ffffff;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                padding: 16px;
            }
        """)
        
        ip_layout = QVBoxLayout(local_ip_card)
        
        wifi_icon = QLabel("📶")
        wifi_icon.setStyleSheet("font-size: 24px;")
        
        ip_title = QLabel("Local IP")
        ip_title.setStyleSheet("""
            QLabel {
                font-size: 12px;
                color: #666666;
                font-weight: normal;
            }
        """)
        
        ip_value = QLabel("127.0.0.1")
        ip_value.setStyleSheet("""
            QLabel {
                font-size: 32px;
                font-weight: bold;
                color: #333333;
            }
        """)
        
        ip_layout.addWidget(wifi_icon)
        ip_layout.addWidget(ip_title)
        ip_layout.addWidget(ip_value)
        ip_layout.addStretch()
        
        stats_layout.addWidget(connected_devices_card, 0, 0)
        stats_layout.addWidget(active_transfers_card, 0, 1)
        stats_layout.addWidget(total_transfers_card, 0, 2)
        stats_layout.addWidget(local_ip_card, 0, 3)
        
        dashboard_layout.addLayout(stats_layout)
        
        # Quick Actions
        quick_actions_label = QLabel("Quick Actions")
        quick_actions_label.setStyleSheet("""
            QLabel {
                font-size: 18px;
                font-weight: bold;
                color: #333333;
                margin-bottom: 16px;
            }
        """)
        
        dashboard_layout.addWidget(quick_actions_label)
        
        actions_layout = QGridLayout()
        actions_layout.setSpacing(16)
        
        send_files_card = QuickActionCard("Send Files", "Transfer files to connected devices", "#4285f4")
        receive_files_card = QuickActionCard("Receive Files", "Accept incoming file transfers", "#34a853")
        send_message_card = QuickActionCard("Send Message", "Send messages to devices", "#9c27b0")
        manage_devices_card = QuickActionCard("Manage Devices", "View and manage connected devices", "#ff9800")
        
        actions_layout.addWidget(send_files_card, 0, 0)
        actions_layout.addWidget(receive_files_card, 0, 1)
        actions_layout.addWidget(send_message_card, 0, 2)
        actions_layout.addWidget(manage_devices_card, 0, 3)
        
        dashboard_layout.addLayout(actions_layout)
        
        # Bottom section with two columns
        bottom_layout = QHBoxLayout()
        bottom_layout.setSpacing(24)
        
        # Connected Devices
        devices_section = QVBoxLayout()
        devices_title = QLabel("Connected Devices")
        devices_title.setStyleSheet("""
            QLabel {
                font-size: 18px;
                font-weight: bold;
                color: #333333;
                margin-bottom: 16px;
            }
        """)
        
        devices_empty = EmptyStateWidget("No devices connected", "Devices will appear here when discovered")
        
        devices_section.addWidget(devices_title)
        devices_section.addWidget(devices_empty)
        
        # Recent Transfers
        transfers_section = QVBoxLayout()
        transfers_title = QLabel("Recent Transfers")
        transfers_title.setStyleSheet("""
            QLabel {
                font-size: 18px;
                font-weight: bold;
                color: #333333;
                margin-bottom: 16px;
            }
        """)
        
        transfers_empty = EmptyStateWidget("No transfers yet", "File transfers will appear here")
        
        transfers_section.addWidget(transfers_title)
        transfers_section.addWidget(transfers_empty)
        
        bottom_layout.addLayout(devices_section)
        bottom_layout.addLayout(transfers_section)
        
        dashboard_layout.addLayout(bottom_layout)
        dashboard_layout.addStretch()
        
        self.main_content.addWidget(dashboard_page)
        
    def create_devices_page(self):
        devices_page = QWidget()
        layout = QVBoxLayout(devices_page)
        layout.setContentsMargins(24, 24, 24, 24)
        
        title = QLabel("Devices")
        title.setStyleSheet("""
            QLabel {
                font-size: 24px;
                font-weight: bold;
                color: #333333;
            }
        """)
        
        content = QLabel("Device management interface will be here")
        content.setStyleSheet("font-size: 14px; color: #666666;")
        
        layout.addWidget(title)
        layout.addWidget(content)
        layout.addStretch()
        
        self.main_content.addWidget(devices_page)
        
    def create_file_transfer_page(self):
        file_transfer_page = QWidget()
        layout = QVBoxLayout(file_transfer_page)
        layout.setContentsMargins(24, 24, 24, 24)
        
        title = QLabel("File Transfer")
        title.setStyleSheet("""
            QLabel {
                font-size: 24px;
                font-weight: bold;
                color: #333333;
            }
        """)
        
        content = QLabel("File transfer interface will be here")
        content.setStyleSheet("font-size: 14px; color: #666666;")
        
        layout.addWidget(title)
        layout.addWidget(content)
        layout.addStretch()
        
        self.main_content.addWidget(file_transfer_page)
        
    def create_messages_page(self):
        messages_page = QWidget()
        layout = QVBoxLayout(messages_page)
        layout.setContentsMargins(24, 24, 24, 24)
        
        title = QLabel("Messages")
        title.setStyleSheet("""
            QLabel {
                font-size: 24px;
                font-weight: bold;
                color: #333333;
            }
        """)
        
        content = QLabel("Messaging interface will be here")
        content.setStyleSheet("font-size: 14px; color: #666666;")
        
        layout.addWidget(title)
        layout.addWidget(content)
        layout.addStretch()
        
        self.main_content.addWidget(messages_page)
        
    def create_settings_page(self):
        settings_page = QWidget()
        layout = QVBoxLayout(settings_page)
        layout.setContentsMargins(24, 24, 24, 24)
        
        title = QLabel("Settings")
        title.setStyleSheet("""
            QLabel {
                font-size: 24px;
                font-weight: bold;
                color: #333333;
            }
        """)
        
        content = QLabel("Settings interface will be here")
        content.setStyleSheet("font-size: 14px; color: #666666;")
        
        layout.addWidget(title)
        layout.addWidget(content)
        layout.addStretch()
        
        self.main_content.addWidget(settings_page)
        
    def show_dashboard(self):
        self.main_content.setCurrentIndex(0)
        self.update_button_states(self.dashboard_btn)
        
    def show_devices(self):
        self.main_content.setCurrentIndex(1)
        self.update_button_states(self.devices_btn)
        
    def show_file_transfer(self):
        self.main_content.setCurrentIndex(2)
        self.update_button_states(self.file_transfer_btn)
        
    def show_messages(self):
        self.main_content.setCurrentIndex(3)
        self.update_button_states(self.messages_btn)
        
    def show_settings(self):
        self.main_content.setCurrentIndex(4)
        self.update_button_states(self.settings_btn)
        
    def update_button_states(self, selected_button):
        # Uncheck all buttons
        buttons = [self.dashboard_btn, self.devices_btn, self.file_transfer_btn, 
                  self.messages_btn, self.settings_btn]
        for btn in buttons:
            btn.setChecked(False)
        
        # Check selected button
        selected_button.setChecked(True)

def main():
    app = QApplication(sys.argv)
    
    # Set application style
    app.setStyle('Fusion')
    
    window = MainWindow()
    window.show()
    
    sys.exit(app.exec())

if __name__ == "__main__":
    main()