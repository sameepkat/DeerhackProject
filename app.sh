source /Users/manish-ach/code/deerHack/venv/bin/activate
nvm use 24.0.1
python3 -m desktop.server.ws_handler &
cd desktop/gui && npm run dev