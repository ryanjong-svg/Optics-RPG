@echo off
title Prism and Photon - Optics RPG
cd /d "%~dp0"

echo Starting local server on http://localhost:5090 ...
start "Optics RPG Server (keep this open)" /min cmd /c "python -m http.server 5090"

timeout /t 2 /nobreak >nul
start "" "http://localhost:5090/index.html"

echo.
echo The game should now be open in your browser.
echo A second minimized window called "Optics RPG Server" is running the game server.
echo To stop the game, close that window (or just close it when you're done playing).
echo.
echo Press any key to close this window (the server will keep running until you close its window too)...
pause >nul
