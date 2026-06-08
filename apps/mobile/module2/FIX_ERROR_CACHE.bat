@echo off
echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║     FIX ERROR: THEME_COLOR DOESN'T EXIST             ║
echo ║     Clearing ALL caches and restarting               ║
echo ╚═══════════════════════════════════════════════════════╝
echo.

echo [Step 1/6] Stopping all Node processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [Step 2/6] Clearing Expo cache...
if exist ".expo" rmdir /s /q ".expo" 2>nul
if exist ".expo-shared" rmdir /s /q ".expo-shared" 2>nul

echo [Step 3/6] Clearing Metro bundler cache...
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache" 2>nul

echo [Step 4/6] Clearing Watchman cache...
if exist "%LOCALAPPDATA%\Temp\metro-*" del /q "%LOCALAPPDATA%\Temp\metro-*" 2>nul
if exist "%LOCALAPPDATA%\Temp\haste-map-*" del /q "%LOCALAPPDATA%\Temp\haste-map-*" 2>nul

echo [Step 5/6] Clearing global cache...
if exist "%LOCALAPPDATA%\Temp\metro-cache" rmdir /s /q "%LOCALAPPDATA%\Temp\metro-cache" 2>nul

echo [Step 6/6] Starting Metro with --reset-cache...
echo.
echo ════════════════════════════════════════════════════════
echo   All caches cleared! Starting fresh...
echo ════════════════════════════════════════════════════════
echo.
echo Press Ctrl+C to stop, or close this window when done.
echo.

npx expo start --clear

pause
