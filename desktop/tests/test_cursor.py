from desktop import features

print("Starting cursor tracker...")
print("Press Ctrl+C to stop")
try:
    features.track_cursor_pynput()
except KeyboardInterrupt:
    print("\nStopping cursor tracker...")
except Exception as e:
    print(f"Error: {e}")
    print("Trying polling method...")
    features.track_cursor_polling()