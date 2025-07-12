from PySide6.QtWidgets import QWidget, QVBoxLayout, QHBoxLayout, QLabel, QGridLayout, QFrame, QPushButton
from PySide6.QtCore import Qt

class StatCard(QFrame):
    def __init__(self, title, value, icon=""):
        super().__init__()
        self.setStyleSheet("""
            QFrame {
                background: #fff;
                border: 1.5px solid #f0f0f0;
                border-radius: 12px;
                padding: 18px;
            }
        """)
        layout = QVBoxLayout(self)
        top = QHBoxLayout()
        top.addWidget(QLabel(icon), alignment=Qt.AlignRight)
        layout.addLayout(top)
        title_lbl = QLabel(title)
        title_lbl.setStyleSheet("font-size: 13px; color: #888;")
        value_lbl = QLabel(str(value))
        value_lbl.setStyleSheet("font-size: 22px; font-weight: bold; color: #222;")
        layout.addWidget(title_lbl)
        layout.addWidget(value_lbl)

class QuickActionCard(QFrame):
    def __init__(self, title, desc, color, icon):
        super().__init__()
        self.setStyleSheet(f"""
            QFrame {{
                background: #fff;
                border: 1.5px solid #f0f0f0;
                border-radius: 12px;
                padding: 18px;
            }}
        """)
        layout = QVBoxLayout(self)
        icon_lbl = QLabel(icon)
        icon_lbl.setStyleSheet(f"font-size: 22px; color: {color};")
        title_lbl = QLabel(f"<b>{title}</b>")
        desc_lbl = QLabel(desc)
        desc_lbl.setStyleSheet("font-size: 12px; color: #888;")
        layout.addWidget(icon_lbl, alignment=Qt.AlignLeft)
        layout.addWidget(title_lbl)
        layout.addWidget(desc_lbl)

class EmptyCard(QFrame):
    def __init__(self, title, desc, icon):
        super().__init__()
        self.setStyleSheet("""
            QFrame {
                background: #fff;
                border: 1.5px solid #f0f0f0;
                border-radius: 12px;
                padding: 32px;
            }
        """)
        layout = QVBoxLayout(self)
        icon_lbl = QLabel(icon)
        icon_lbl.setStyleSheet("font-size: 32px; color: #bbb;")
        icon_lbl.setAlignment(Qt.AlignCenter)
        title_lbl = QLabel(f"<b>{title}</b>")
        title_lbl.setAlignment(Qt.AlignCenter)
        desc_lbl = QLabel(desc)
        desc_lbl.setStyleSheet("font-size: 12px; color: #888;")
        desc_lbl.setAlignment(Qt.AlignCenter)
        layout.addWidget(icon_lbl)
        layout.addWidget(title_lbl)
        layout.addWidget(desc_lbl)

class DashboardPage(QWidget):
    def __init__(self):
        super().__init__()
        self.setStyleSheet("background: #f8f9fb;")
        main = QVBoxLayout(self)
        main.setContentsMargins(32, 24, 32, 24)
        main.setSpacing(24)

        # Header
        header = QHBoxLayout()
        title = QLabel("Dashboard")
        title.setStyleSheet("font-size: 28px; font-weight: bold; color: #222;")
        subtitle = QLabel("Overview of your connected devices and transfers")
        subtitle.setStyleSheet("font-size: 14px; color: #888;")
        header.addWidget(title)
        header.addSpacing(16)
        header.addWidget(subtitle)
        header.addStretch()
        status = QLabel("● Offline")
        status.setStyleSheet("color: #888; font-size: 14px;")
        header.addWidget(status)
        main.addLayout(header)

        # Stat cards
        stat_grid = QGridLayout()
        stat_grid.setSpacing(18)
        stat_grid.addWidget(StatCard("Connected Devices", "0", "📱"), 0, 0)
        stat_grid.addWidget(StatCard("Active Transfers", "0", "📈"), 0, 1)
        stat_grid.addWidget(StatCard("Total Transfers", "0", "📄"), 0, 2)
        stat_grid.addWidget(StatCard("Local IP", "<b>127.0.0.1</b>", "📶"), 0, 3)
        main.addLayout(stat_grid)

        # Quick Actions
        quick_lbl = QLabel("Quick Actions")
        quick_lbl.setStyleSheet("font-size: 16px; font-weight: bold; color: #222; margin-top: 12px;")
        main.addWidget(quick_lbl)
        quick_grid = QGridLayout()
        quick_grid.setSpacing(18)
        quick_grid.addWidget(QuickActionCard("Send Files", "Transfer files to connected devices", "#2563eb", "⬆️"), 0, 0)
        quick_grid.addWidget(QuickActionCard("Receive Files", "Accept incoming file transfers", "#22c55e", "⬇️"), 0, 1)
        quick_grid.addWidget(QuickActionCard("Send Message", "Send messages to devices", "#a21caf", "💬"), 0, 2)
        quick_grid.addWidget(QuickActionCard("Manage Devices", "View and manage connected devices", "#ea580c", "📱"), 0, 3)
        main.addLayout(quick_grid)

        # Connected Devices & Recent Transfers
        cards = QHBoxLayout()
        cards.addWidget(EmptyCard("Connected Devices", "No devices connected\nDevices will appear here when discovered", "📱"))
        cards.addWidget(EmptyCard("Recent Transfers", "No transfers yet\nFile transfers will appear here", "📄"))
        main.addLayout(cards)
        main.addStretch()