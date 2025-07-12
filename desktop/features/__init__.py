# Features module init

# note: import from here like
"""
from desktop import features
"""
# and Use
"""
features.clipboard()
"""

from .clipboard import recieve_clipboard, send_clipboard
from .notifications import PCNotificationManager
from .command import run_command, SudoCommandError
from .mouse_keyboard import track_cursor_polling, track_cursor_pynput, press_key
from .multimedia import Brightness, Volume,Media, set_brightness, set_volume, media_playback
