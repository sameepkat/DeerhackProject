import subprocess
from desktop import features

def test(cmd):
    try:
        result = features.run_command(cmd)
        print(f"✓ '{cmd}' -> {result.stdout.strip()}")
    except features.SudoCommandError as e:
        print(f"✗ '{cmd}' -> BLOCKED: {e}")
    except subprocess.CalledProcessError as e:
        print(f"✗ '{cmd}' -> FAILED: {e}")
    except Exception as e:
        print(f"✗ '{cmd}' -> ERROR: {e}")

test_commands = [
        "ls -la",           # Should work
        "echo 'Hello'",     # Should work
        "sudo ls",          # Should fail - blocked
        "apt update",       # Should fail with permission error + note
        "python --version", # Should work
    ]
    
for cmd in test_commands:
    test(cmd) 

choice = input("Want to test a function yourself? (Y): ")
if choice == 'Y' or choice == 'y':
    cmd = input("enter a command => ")
    test(cmd)
