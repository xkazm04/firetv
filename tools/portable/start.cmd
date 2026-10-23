@echo off
rem Study Desk, portable: starts the desk from this folder. Needs Node.js 24 on PATH.
rem Settings you set yourself (DESK_DATA_DIR, DESK_VISION_ENGINE, PORT, any from .env.example) are kept.
setlocal
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js is not on PATH. Install Node.js 24 from https://nodejs.org and run start.cmd again. & pause & exit /b 1)
node -e "process.exit(Number(process.versions.node.split('.')[0]) >= 20 ? 0 : 1)" || (echo This Node.js is too old. Install Node.js 24 from https://nodejs.org. & pause & exit /b 1)
if not defined DESK_DATA_DIR set "DESK_DATA_DIR=%~dp0demo-data"
if not defined DESK_VISION_ENGINE set "DESK_VISION_ENGINE=claude-cli"
if not defined PORT set "PORT=3000"
set "HOSTNAME=0.0.0.0"
set "NODE_ENV=production"
echo.
echo   Study Desk on port %PORT%, data in %DESK_DATA_DIR%
echo   Open the TV: link below in a desktop browser, full screen (F11).
echo   On this computer, http://localhost:%PORT%/tv?key=... with the same key works too.
echo   The TV ignores the mouse: use the arrow keys, Enter, and Backspace for Back.
echo   Stop the desk with Ctrl+C.
node app\server.js
