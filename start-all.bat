@echo off
echo === Starting NGO Connect App ===
cd /d "d:\NGO CONNECT APP\ngo-connect"

echo Starting Backend (nodemon)...
start "NGO Backend" cmd /k "cd /d "d:\NGO CONNECT APP\ngo-connect" && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend (React)...
start "NGO Frontend" cmd /k "cd /d "d:\NGO CONNECT APP\ngo-connect\client" && npm start"

echo Both servers are starting. Check the opened windows.
