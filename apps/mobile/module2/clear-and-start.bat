@echo off
echo.
echo ════════════════════════════════════════════
echo   CLEARING CACHE AND RESTARTING APP
echo ════════════════════════════════════════════
echo.

echo [1/3] Stopping any running Metro bundler...
taskkill /F /IM node.exe 2>nul

echo.
echo [2/3] Clearing Metro cache...
rmdir /s /q node_modules\.cache 2>nul
del /q .expo\* 2>nul

echo.
echo [3/3] Starting with cleared cache...
echo.
npm start -- --clear

pause
