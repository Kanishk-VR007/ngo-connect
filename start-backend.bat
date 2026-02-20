@echo off
echo === Starting Backend Server ===
echo.
cd /d "d:\NGO CONNECT APP\ngo-connect"
echo Current directory: %CD%
echo.
echo Loading environment variables...
type .env
echo.
echo Starting Node.js server...
node backend/server.js
pause
