
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QLabel, QPushButton, QFileDialog, QHBoxLayout,
    QTableWidget, QTableWidgetItem, QAbstractItemView, QFrame, QHeaderView,
    QComboBox, QSplitter, QSizePolicy, QScrollArea
)
from PySide6.QtCore import Qt


class FileTransferWidget(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)

        self.setStyleSheet("""
            QLabel#header {
                font-size: 20px;
                font-weight: bold;
                color: #333;
            }
            QLabel {
                font-size: 14px;
                color: #666;
            }
            QPushButton {
                background-color: #007acc;
                color: white;
                border-radius: 6px;
                padding: 8px 16px;
                font-size: 14px;
            }
            QPushButton:disabled {
                background-color: #ccc;
            }
            QComboBox {
                padding: 6px;
                font-size: 14px;
            }
            QFrame#dropArea {
                border: 2px dashed #007acc;
                background: white;
                min-height: 140px;
                border-radius: 10px;
            }
        """)

        layout = QHBoxLayout(self)
        layout.setContentsMargins(24, 24, 24, 24)
        layout.setSpacing(24)

        # Left Panel (Send Panel)
        left_panel = QVBoxLayout()
        left_panel.setSpacing(16)

        header = QLabel("File Transfer")
        header.setObjectName("header")
        left_panel.addWidget(header)

        # Device Selector
        self.device_selector = QComboBox()
        self.device_selector.addItem("Select a device")
        # Dummy devices for now
        self.device_selector.addItems(["Device 1", "Device 2"])
        left_panel.addWidget(self.device_selector)

        # Drag-and-drop area
        self.drop_area = QFrame()
        self.drop_area.setObjectName("dropArea")
        self.drop_area.setAcceptDrops(True)
        drop_layout = QVBoxLayout(self.drop_area)
        drop_layout.setAlignment(Qt.AlignCenter)
        self.drop_label = QLabel("Drag and drop files here, or")
        self.select_btn = QPushButton("Select Files")
        self.folder_btn = QPushButton("Select Folder")
        file_btns = QHBoxLayout()
        file_btns.addWidget(self.select_btn)
        file_btns.addWidget(self.folder_btn)

        drop_layout.addWidget(self.drop_label)
        drop_layout.addLayout(file_btns)

        left_panel.addWidget(self.drop_area)

        # Send button
        self.send_button = QPushButton("Send Files")
        self.send_button.setEnabled(False)
        left_panel.addWidget(self.send_button)

        # Right Panel (Transfers)
        right_panel = QVBoxLayout()
        right_panel.setSpacing(24)

        # Active Transfers
        active_frame = QFrame()
        active_layout = QVBoxLayout(active_frame)
        active_title = QLabel("Active Transfers")
        active_title.setObjectName("header")
        self.active_status = QLabel("No active transfers\nFile transfers will appear here")
        self.active_status.setAlignment(Qt.AlignCenter)
        active_layout.addWidget(active_title)
        active_layout.addWidget(self.active_status)
        right_panel.addWidget(active_frame)

        # Transfer History
        history_frame = QFrame()
        history_layout = QVBoxLayout(history_frame)
        history_title_layout = QHBoxLayout()
        history_title = QLabel("Transfer History")
        history_title.setObjectName("header")
        self.clear_btn = QPushButton("Clear History")
        self.clear_btn.setFixedWidth(120)
        history_title_layout.addWidget(history_title)
        history_title_layout.addStretch()
        history_title_layout.addWidget(self.clear_btn)
        self.history_status = QLabel("No transfer history\nCompleted transfers will appear here")
        self.history_status.setAlignment(Qt.AlignCenter)
        history_layout.addLayout(history_title_layout)
        history_layout.addWidget(self.history_status)
        right_panel.addWidget(history_frame)

        layout.addLayout(left_panel, 2)
        layout.addLayout(right_panel, 2)

        # Connections
        self.select_btn.clicked.connect(self.select_files)
        self.folder_btn.clicked.connect(self.select_folder)
        self.send_button.clicked.connect(self.send_files)
        self.clear_btn.clicked.connect(self.clear_history)

        self.selected_files = []

    def dragEnterEvent(self, event):
        if event.mimeData().hasUrls():
            event.acceptProposedAction()
            self.drop_area.setStyleSheet(self.drop_area.styleSheet() + "border-color: #34a853;")
        else:
            event.ignore()

    def dragLeaveEvent(self, event):
        self.drop_area.setStyleSheet(self.drop_area.styleSheet().replace("border-color: #34a853;", "border-color: #007acc;"))

    def dropEvent(self, event):
        self.drop_area.setStyleSheet(self.drop_area.styleSheet().replace("border-color: #34a853;", "border-color: #007acc;"))
        for url in event.mimeData().urls():
            path = url.toLocalFile()
            self.selected_files.append(path)
        if self.selected_files:
            self.send_button.setEnabled(True)
            self.active_status.setText("\n".join([f"Queued: {f}" for f in self.selected_files]))

    def select_files(self):
        files, _ = QFileDialog.getOpenFileNames(self, "Select Files")
        if files:
            self.selected_files.extend(files)
            self.send_button.setEnabled(True)
            self.active_status.setText("\n".join([f"Queued: {f}" for f in self.selected_files]))

    def select_folder(self):
        folder = QFileDialog.getExistingDirectory(self, "Select Folder")
        if folder:
            import os
            for f in os.listdir(folder):
                self.selected_files.append(os.path.join(folder, f))
            self.send_button.setEnabled(True)
            self.active_status.setText("\n".join([f"Queued: {f}" for f in self.selected_files]))

    def send_files(self):
        self.history_status.setText("\n".join([f"Sent: {f}" for f in self.selected_files]))
        self.active_status.setText("No active transfers\nFile transfers will appear here")
        self.selected_files.clear()
        self.send_button.setEnabled(False)

    def clear_history(self):
        self.history_status.setText("No transfer history\nCompleted transfers will appear here")
