# from PySide6.QtWidgets import (
#     QWidget, QVBoxLayout, QLabel, QPushButton, QFileDialog, QHBoxLayout,
#     QTableWidget, QTableWidgetItem, QAbstractItemView, QFrame, QHeaderView
# )
# from PySide6.QtCore import Qt

# class FileTransferWidget(QWidget):
#     def __init__(self, parent=None):
#         super().__init__(parent)
#         self.setWindowTitle("File Transfer")
#         self.setStyleSheet("""
#             QWidget {
#                 background: #f5f5f5;
#             }
#             QLabel#title {
#                 font-size: 24px;
#                 font-weight: bold;
#                 color: #333;
#             }
#             QFrame#dropArea {
#                 border: 2px dashed #007acc;
#                 border-radius: 12px;
#                 background: #fff;
#                 min-height: 160px;
#             }
#             QPushButton {
#                 font-size: 16px;
#                 padding: 8px 24px;
#                 border-radius: 8px;
#                 background: #007acc;
#                 color: #fff;
#             }
#             QPushButton:disabled {
#                 background: #cccccc;
#                 color: #888;
#             }
#             QTableWidget {
#                 background: #fff;
#                 border-radius: 8px;
#             }
#         """)

#         layout = QVBoxLayout(self)
#         layout.setSpacing(24)
#         layout.setContentsMargins(32, 32, 32, 32)

#         # Title
#         title = QLabel("File Transfer")
#         title.setObjectName("title")
#         layout.addWidget(title)

#         # Drag-and-drop area
#         self.drop_area = QFrame()
#         self.drop_area.setObjectName("dropArea")
#         self.drop_area.setAcceptDrops(True)
#         drop_layout = QVBoxLayout(self.drop_area)
#         drop_layout.setAlignment(Qt.AlignCenter)
#         self.drop_label = QLabel("Drag & drop files here or click 'Select File'")
#         self.drop_label.setStyleSheet("font-size: 16px; color: #666;")
#         drop_layout.addWidget(self.drop_label)
#         layout.addWidget(self.drop_area)

#         # Select and Send buttons
#         btn_layout = QHBoxLayout()
#         self.select_button = QPushButton("Select File")
#         self.send_button = QPushButton("Send")
#         self.send_button.setEnabled(False)
#         btn_layout.addWidget(self.select_button)
#         btn_layout.addWidget(self.send_button)
#         layout.addLayout(btn_layout)

#         # File list table (hidden until files are added)
#         self.file_table = QTableWidget(0, 3)
#         self.file_table.setHorizontalHeaderLabels(["File Name", "Size", "Status"])
#         self.file_table.setEditTriggers(QAbstractItemView.NoEditTriggers)
#         self.file_table.setSelectionBehavior(QAbstractItemView.SelectRows)
#         self.file_table.setSelectionMode(QAbstractItemView.SingleSelection)
#         self.file_table.verticalHeader().setVisible(False)
#         self.file_table.horizontalHeader().setStyleSheet("""
#             QHeaderView::section {
#                 background-color: #007acc;
#                 color: white;
#                 font-size: 15px;
#                 font-weight: bold;
#                 border: none;
#                 border-top-left-radius: 8px;
#                 border-top-right-radius: 8px;
#                 padding: 8px;
#             }
#         """)
#         self.file_table.setStyleSheet("""
#             QTableWidget {
#                 border-radius: 8px;
#                 background: #fff;
#                 font-size: 14px;
#                 gridline-color: #e0e0e0;
#             }
#             QTableWidget::item {
#                 padding: 8px;
#             }
#         """)
#         self.file_table.setShowGrid(False)
#         self.file_table.setAlternatingRowColors(True)
#         self.file_table.setStyleSheet(self.file_table.styleSheet() + "QTableWidget { alternate-background-color: #f5faff; }")
#         self.file_table.setMinimumHeight(220)
#         self.file_table.horizontalHeader().setStretchLastSection(True)
#         self.file_table.horizontalHeader().setSectionResizeMode(0, QHeaderView.Stretch)
#         self.file_table.horizontalHeader().setSectionResizeMode(1, QHeaderView.Stretch)
#         self.file_table.horizontalHeader().setSectionResizeMode(2, QHeaderView.Stretch)
#         self.file_table.hide()
#         layout.addWidget(self.file_table)

#         # Connect signals
#         self.select_button.clicked.connect(self.select_file)
#         self.send_button.clicked.connect(self.send_file)

#     def dragEnterEvent(self, event):
#         if event.mimeData().hasUrls():
#             event.acceptProposedAction()
#             self.drop_area.setStyleSheet(self.drop_area.styleSheet() + "border-color: #34a853;")
#         else:
#             event.ignore()

#     def dragLeaveEvent(self, event):
#         self.drop_area.setStyleSheet(self.drop_area.styleSheet().replace("border-color: #34a853;", "border-color: #007acc;"))

#     def dropEvent(self, event):
#         self.drop_area.setStyleSheet(self.drop_area.styleSheet().replace("border-color: #34a853;", "border-color: #007acc;"))
#         files_added = False
#         for url in event.mimeData().urls():
#             file_path = url.toLocalFile()
#             self.add_file(file_path)
#             files_added = True
#         if files_added:
#             self.file_table.show()

#     def select_file(self):
#         file_path, _ = QFileDialog.getOpenFileName(self, "Select File to Send")
#         if file_path:
#             self.add_file(file_path)
#             self.file_table.show()

#     def add_file(self, file_path):
#         import os
#         file_name = os.path.basename(file_path)
#         file_size = self.human_readable_size(os.path.getsize(file_path))
#         row = self.file_table.rowCount()
#         self.file_table.insertRow(row)
#         self.file_table.setItem(row, 0, QTableWidgetItem(file_name))
#         self.file_table.setItem(row, 1, QTableWidgetItem(file_size))
#         self.file_table.setItem(row, 2, QTableWidgetItem("Ready"))
#         self.send_button.setEnabled(True)
#         self.selected_file = file_path
#         self.file_table.show()

#     def send_file(self):
#         # TODO: Implement actual file sending logic
#         row = self.file_table.rowCount() - 1
#         self.file_table.setItem(row, 2, QTableWidgetItem("Sent"))
#         self.send_button.setEnabled(False)

#     @staticmethod
#     def human_readable_size(size, decimal_places=2):
#         for unit in ['B','KB','MB','GB','TB']:
#             if size < 1024.0:
#                 return f"{size:.{decimal_places}f} {unit}"
#             size /= 1024.0
#         return f"{size:.{decimal_places}f} PB"

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
