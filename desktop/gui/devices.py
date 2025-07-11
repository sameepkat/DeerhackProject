from PySide6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton, QFrame, QScrollArea)
from PySide6.QtCore import Qt, QTimer

class DevicesPage(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.devices_layout = QVBoxLayout(self)
        self.devices_layout.setContentsMargins(24, 24, 24, 24)
        self.devices_layout.setSpacing(24)
        self.setup_ui()

    def setup_ui(self):
        # Header with actions
        header_layout = QHBoxLayout()
        header_info = QVBoxLayout()
        header_title = QLabel("Devices")
        header_title.setStyleSheet("""
            QLabel {
                font-size: 24px;
                font-weight: bold;
                color: #333333;
            }
        """)
        header_subtitle = QLabel("Manage your connected devices and discovery")
        header_subtitle.setStyleSheet("""
            QLabel {
                font-size: 14px;
                color: #666666;
            }
        """)
        header_info.addWidget(header_title)
        header_info.addWidget(header_subtitle)
        actions_layout = QHBoxLayout()
        self.start_discovery_btn = QPushButton("🔍 Start Discovery")
        self.start_discovery_btn.setStyleSheet("""
            QPushButton {
                background-color: #4CAF50;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #45a049;
            }
            QPushButton:pressed {
                background-color: #3d8b40;
            }
        """)
        self.show_qr_btn = QPushButton("📱 Show QR")
        self.show_qr_btn.setStyleSheet("""
            QPushButton {
                background-color: #2196F3;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #1976D2;
            }
            QPushButton:pressed {
                background-color: #1565C0;
            }
        """)
        actions_layout.addWidget(self.start_discovery_btn)
        actions_layout.addWidget(self.show_qr_btn)
        header_layout.addLayout(header_info)
        header_layout.addStretch()
        header_layout.addLayout(actions_layout)
        self.devices_layout.addLayout(header_layout)
        # Connection Information Card
        conn_info_card = QFrame()
        conn_info_card.setFrameStyle(QFrame.Box)
        conn_info_card.setStyleSheet("""
            QFrame {
                background-color: #ffffff;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                padding: 16px;
            }
        """)
        conn_info_layout = QVBoxLayout(conn_info_card)
        conn_title = QLabel("Connection Information")
        conn_title.setStyleSheet("""
            QLabel {
                font-size: 16px;
                font-weight: bold;
                color: #333333;
                margin-bottom: 12px;
            }
        """)
        conn_stats_layout = QHBoxLayout()
        status_layout = QVBoxLayout()
        status_label = QLabel("Status")
        status_label.setStyleSheet("font-size: 12px; color: #666666;")
        self.status_value = QLabel("Stopped")
        self.status_value.setStyleSheet("font-size: 14px; color: #333333; font-weight: bold;")
        status_layout.addWidget(status_label)
        status_layout.addWidget(self.status_value)
        found_layout = QVBoxLayout()
        found_label = QLabel("Devices Found")
        found_label.setStyleSheet("font-size: 12px; color: #666666;")
        self.found_value = QLabel("0")
        self.found_value.setStyleSheet("font-size: 14px; color: #333333; font-weight: bold;")
        found_layout.addWidget(found_label)
        found_layout.addWidget(self.found_value)
        connected_layout = QVBoxLayout()
        connected_label = QLabel("Connected")
        connected_label.setStyleSheet("font-size: 12px; color: #666666;")
        self.connected_value = QLabel("No")
        self.connected_value.setStyleSheet("font-size: 14px; color: #333333; font-weight: bold;")
        connected_layout.addWidget(connected_label)
        connected_layout.addWidget(self.connected_value)
        conn_stats_layout.addLayout(status_layout)
        conn_stats_layout.addLayout(found_layout)
        conn_stats_layout.addLayout(connected_layout)
        conn_stats_layout.addStretch()
        conn_info_layout.addWidget(conn_title)
        conn_info_layout.addLayout(conn_stats_layout)
        self.devices_layout.addWidget(conn_info_card)
        # Available Devices Section
        devices_section_layout = QHBoxLayout()
        devices_title = QLabel("Available Devices")
        devices_title.setStyleSheet("""
            QLabel {
                font-size: 18px;
                font-weight: bold;
                color: #333333;
            }
        """)
        self.refresh_btn = QPushButton("🔄 Refresh")
        self.refresh_btn.setStyleSheet("""
            QPushButton {
                background-color: #f0f0f0;
                color: #333333;
                border: 1px solid #e0e0e0;
                padding: 6px 12px;
                border-radius: 4px;
                font-size: 12px;
            }
            QPushButton:hover {
                background-color: #e0e0e0;
            }
        """)
        devices_section_layout.addWidget(devices_title)
        devices_section_layout.addStretch()
        devices_section_layout.addWidget(self.refresh_btn)
        self.devices_layout.addLayout(devices_section_layout)
        # Devices List Area
        self.devices_list_widget = QWidget()
        self.devices_list_layout = QVBoxLayout(self.devices_list_widget)
        self.devices_list_layout.setContentsMargins(0, 0, 0, 0)
        self.devices_list_layout.setSpacing(8)
        self.show_empty_devices_state()
        scroll_area = QScrollArea()
        scroll_area.setWidgetResizable(True)
        scroll_area.setWidget(self.devices_list_widget)
        scroll_area.setStyleSheet("""
            QScrollArea {
                border: none;
                background-color: transparent;
            }
            QScrollBar:vertical {
                background-color: #f0f0f0;
                width: 8px;
                border-radius: 4px;
            }
            QScrollBar::handle:vertical {
                background-color: #c0c0c0;
                border-radius: 4px;
            }
            QScrollBar::handle:vertical:hover {
                background-color: #a0a0a0;
            }
        """)
        self.devices_layout.addWidget(scroll_area)
        self.start_discovery_btn.clicked.connect(self.start_discovery)
        self.show_qr_btn.clicked.connect(self.show_qr_code)
        self.refresh_btn.clicked.connect(self.refresh_devices)

    def show_empty_devices_state(self):
        for i in reversed(range(self.devices_list_layout.count())):
            widget = self.devices_list_layout.itemAt(i).widget()
            if widget:
                widget.setParent(None)
        empty_state = QFrame()
        empty_state.setStyleSheet("""
            QFrame {
                background-color: #ffffff;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                padding: 48px;
            }
        """)
        empty_layout = QVBoxLayout(empty_state)
        empty_layout.setAlignment(Qt.AlignCenter)
        icon_label = QLabel("📱")
        icon_label.setStyleSheet("font-size: 48px;")
        icon_label.setAlignment(Qt.AlignCenter)
        title_label = QLabel("No devices found")
        title_label.setStyleSheet("""
            QLabel {
                font-size: 18px;
                font-weight: bold;
                color: #333333;
                margin-top: 16px;
            }
        """)
        title_label.setAlignment(Qt.AlignCenter)
        desc_label = QLabel("Start discovery to find devices")
        desc_label.setStyleSheet("""
            QLabel {
                font-size: 14px;
                color: #666666;
                margin-top: 8px;
            }
        """)
        desc_label.setAlignment(Qt.AlignCenter)
        start_btn = QPushButton("Start Discovery")
        start_btn.setStyleSheet("""
            QPushButton {
                background-color: #2196F3;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: bold;
                margin-top: 16px;
            }
            QPushButton:hover {
                background-color: #1976D2;
            }
        """)
        start_btn.clicked.connect(self.start_discovery)
        empty_layout.addWidget(icon_label)
        empty_layout.addWidget(title_label)
        empty_layout.addWidget(desc_label)
        empty_layout.addWidget(start_btn)
        self.devices_list_layout.addWidget(empty_state)

    def add_device_to_list(self, device_name, device_type, device_id, is_connected=False):
        device_card = QFrame()
        device_card.setFrameStyle(QFrame.Box)
        device_card.setStyleSheet("""
            QFrame {
                background-color: #ffffff;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                padding: 16px;
            }
            QFrame:hover {
                border: 2px solid #2196F3;
            }
        """)
        device_layout = QHBoxLayout(device_card)
        info_layout = QVBoxLayout()
        name_layout = QHBoxLayout()
        device_name_label = QLabel(device_name)
        device_name_label.setStyleSheet("""
            QLabel {
                font-size: 16px;
                font-weight: bold;
                color: #333333;
            }
        """)
        device_type_label = QLabel(device_type)
        device_type_label.setStyleSheet("""
            QLabel {
                font-size: 12px;
                color: #666666;
                background-color: #f0f0f0;
                padding: 2px 8px;
                border-radius: 4px;
            }
        """)
        name_layout.addWidget(device_name_label)
        name_layout.addWidget(device_type_label)
        name_layout.addStretch()
        id_label = QLabel(f"ID: {device_id}")
        id_label.setStyleSheet("""
            QLabel {
                font-size: 12px;
                color: #666666;
                margin-top: 4px;
            }
        """)
        info_layout.addLayout(name_layout)
        info_layout.addWidget(id_label)
        actions_layout = QVBoxLayout()
        status_label = QLabel("🟢 Connected" if is_connected else "🔴 Disconnected")
        status_label.setStyleSheet("""
            QLabel {
                font-size: 12px;
                color: #666666;
            }
        """)
        status_label.setAlignment(Qt.AlignRight)
        connect_btn = QPushButton("Disconnect" if is_connected else "Connect")
        connect_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {'#f44336' if is_connected else '#4CAF50'};
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
            }}
            QPushButton:hover {{
                background-color: {'#d32f2f' if is_connected else '#45a049'};
            }}
        """)
        actions_layout.addWidget(status_label)
        actions_layout.addWidget(connect_btn)
        device_layout.addLayout(info_layout)
        device_layout.addStretch()
        device_layout.addLayout(actions_layout)
        # Remove empty state if it exists
        if self.devices_list_layout.count() == 1:
            widget = self.devices_list_layout.itemAt(0).widget()
            if widget and not hasattr(widget, 'device_id'):
                widget.setParent(None)
        self.devices_list_layout.addWidget(device_card)

    def start_discovery(self):
        self.status_value.setText("Running")
        self.start_discovery_btn.setText("🔍 Stop Discovery")
        self.start_discovery_btn.setStyleSheet("""
            QPushButton {
                background-color: #f44336;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #d32f2f;
            }
        """)
        QTimer.singleShot(2000, self.simulate_device_found)

    def simulate_device_found(self):
        self.found_value.setText("1")
        self.add_device_to_list("Android Phone", "Phone", "android_001", False)

    def show_qr_code(self):
        pass

    def refresh_devices(self):
        self.found_value.setText("0")
        self.show_empty_devices_state()
