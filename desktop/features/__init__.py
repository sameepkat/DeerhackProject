# Features module init

# note: import from here like
"""
from desktop import features
"""
# and Use
"""
features.clipboard()
"""

from .clipboard import paper_clipboard
from .notifications import PCNotificationManager
from .command import run_command, SudoCommandError
from .mouse_keyboard import track_cursor_polling, track_cursor_pynput
from .multimedia import Brightness, Volume, set_brightness, set_volume
