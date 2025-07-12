# Whitelisted command execution
import subprocess
import shlex
from typing import List, Union

class SudoCommandError(Exception):
    """Raised when attempting to run a command that requires sudo privileges. something soemtihng siht"""
    pass

def run_command(cmd: Union[str, List[str]], **kwargs) -> subprocess.CompletedProcess:
    """
    Run a command while rejecting explicit sudo commands.
    
    Args:
        cmd: Command to run as string or list of arguments
        **kwargs: Additional arguments to pass to subprocess.run()
    
    Returns:
        subprocess.CompletedProcess: Result of the command execution
        
    Raises:
        SudoCommandError: If the command starts with sudo
        subprocess.CalledProcessError: If the command fails (with sudo note if permission denied)
    """
    
    # Convert string command to list if needed
    if isinstance(cmd, str):
        cmd_list = shlex.split(cmd)
    else:
        cmd_list = cmd.copy()
    
    if not cmd_list:
        raise ValueError("Command cannot be empty")
    
    # Get the base command (first element)
    base_cmd = cmd_list[0].lower()
    
    # Check if command starts with sudo
    if base_cmd == 'sudo':
        raise SudoCommandError("Sudo commands are not supported")
    
    # Set default subprocess arguments
    default_kwargs = {
        'capture_output': True,
        'text': True,
        'check': True,
        'timeout': 30  # 30 second timeout by default
    }
    
    # Merge with user-provided kwargs
    run_kwargs = {**default_kwargs, **kwargs}
    
    try:
        # Run the command
        result = subprocess.run(cmd_list, **run_kwargs)
        return result
    except subprocess.TimeoutExpired:
        raise subprocess.TimeoutExpired(cmd_list, run_kwargs.get('timeout', 30))
    except subprocess.CalledProcessError as e:
        # Check if it's a permission error and add sudo note
        if e.returncode == 1 and ("permission denied" in e.stderr.lower() or 
                                 "not permitted" in e.stderr.lower() or
                                 "operation not permitted" in e.stderr.lower()):
            raise subprocess.CalledProcessError(
                e.returncode, e.cmd, 
                output=e.stdout,
                stderr=e.stderr + "\nNote: Sudo commands are not supported"
            )
        # Re-raise with original error info
        raise e