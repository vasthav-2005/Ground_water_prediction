@echo off
title Groundwater Flask App Launcher
echo ===================================================
echo   Starting Flask Groundwater Prediction Application
echo ===================================================
echo.

echo [1/2] Launching Flask Server on port 5000...
start "GW Flask Server" cmd /k "cd /d "%~dp0groundwater_prediction" && "%~dp0myvenv\Scripts\python.exe" api/index.py"

echo [2/2] Waiting 3 seconds for server to start...
timeout /t 3 >nul

echo [INFO] Opening Web Browser at http://127.0.0.1:5000...
start http://127.0.0.1:5000

echo.
echo ===================================================
echo   Flask server is running!
echo ===================================================
pause
