@echo off
title Groundwater Level Predictor Launcher
echo ===================================================
echo   Starting Groundwater Level Prediction System
echo ===================================================
echo.

echo [1/3] Launching Spring Boot Backend API on port 8088...
start "GW Prediction Backend" cmd /k "cd /d "%~dp0backend" && .\mvnw.cmd spring-boot:run"

echo [2/3] Launching React Frontend Dev Server on port 5173...
start "GW Prediction Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo [3/3] Waiting 5 seconds for servers to start...
timeout /t 5 >nul

echo [INFO] Opening Web Browser at http://localhost:5173...
start http://localhost:5173

echo.
echo ===================================================
echo   Both backend & frontend are running!
echo   Do not close the command prompt windows.
echo ===================================================
pause
