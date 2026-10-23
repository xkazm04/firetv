#!/bin/sh
# Study Desk, portable: starts the desk from this folder. Needs Node.js 24 on PATH.
# Settings you set yourself (DESK_DATA_DIR, DESK_VISION_ENGINE, PORT, any from .env.example) are kept.
cd "$(dirname "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then echo "Node.js is not on PATH. Install Node.js 24 from https://nodejs.org and run ./start.sh again."; exit 1; fi
node -e "process.exit(Number(process.versions.node.split('.')[0]) >= 20 ? 0 : 1)" || { echo "This Node.js is too old. Install Node.js 24 from https://nodejs.org."; exit 1; }
: "${DESK_DATA_DIR:=$(pwd)/demo-data}"
: "${DESK_VISION_ENGINE:=claude-cli}"
: "${PORT:=3000}"
export DESK_DATA_DIR DESK_VISION_ENGINE PORT
export HOSTNAME=0.0.0.0 NODE_ENV=production
echo
echo "  Study Desk on port $PORT, data in $DESK_DATA_DIR"
echo "  Open the TV: link below in a desktop browser, full screen (F11)."
echo "  On this computer, http://localhost:$PORT/tv?key=... with the same key works too."
echo "  Stop the desk with Ctrl+C."
exec node app/server.js
