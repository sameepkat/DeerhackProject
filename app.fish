#!/usr/bin/env fish

# Activate Python virtual environment
source /Users/manish-ach/code/deerHack/venv/bin/activate.fish

# Use Node.js version 24.0.1 with nvm
nvm use 24.0.1

# Start WebSocket handler in background
python3 -m desktop.server.ws_handler &

# Go to GUI directory and run dev server
cd desktop/gui
npm run dev

