# QR code generation utilities
import json
import qrcode

class QRUtils:
    @staticmethod
    def generate_qr_code(data):
        """Generate QR code for terminal display."""
        try:
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=1,
                border=1,
            )
            qr.add_data(json.dumps(data))
            qr.make(fit=True)
            terminal_qr = qr.get_matrix()
            qr_string = ""
            for row in terminal_qr:
                for cell in row:
                    qr_string += "██" if cell else "  "
                qr_string += "\n"
            return qr_string
        except Exception as e:
            print(f"Failed to generate QR code: {e}")
            return ""