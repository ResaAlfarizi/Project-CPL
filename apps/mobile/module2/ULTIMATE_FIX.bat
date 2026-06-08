@echo off
SETLOCAL EnableDelayedExpansion

echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║         ULTIMATE FIX - CLEAR ALL CACHES              ║
echo ║                                                        ║
echo ║  This will clear EVERYTHING and start fresh          ║
echo ╚═══════════════════════════════════════════════════════╝
echo.

echo WARNING: This will take 2-5 minutes depending on internet speed
echo.
set /p continue="Continue? (Y/N): "
if /i not "%continue%"=="Y" goto :end

echo.
echo ════════════════════════════════════════════════════════
echo   STEP 1/9: Stopping all processes...
echo ════════════════════════════════════════════════════════
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM expo.exe >nul 2>&1
timeout /t 3 /nobreak >nul
echo ✅ Done

echo.
echo ════════════════════════════════════════════════════════
echo   STEP 2/9: Removing .expo folder...
echo ════════════════════════════════════════════════════════
if exist ".expo" (
    rmdir /s /q ".expo"
    echo ✅ Removed .expo
) else (
    echo ⚠️  No .expo folder found
)

echo.
echo ════════════════════════════════════════════════════════
echo   STEP 3/9: Removing .expo-shared folder...
echo ════════════════════════════════════════════════════════
if exist ".expo-shared" (
    rmdir /s /q ".expo-shared"
    echo ✅ Removed .expo-shared
) else (
    echo ⚠️  No .expo-shared folder found
)

echo.
echo ════════════════════════════════════════════════════════
echo   STEP 4/9: Clearing Metro bundler cache...
echo ════════════════════════════════════════════════════════
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo ✅ Cleared Metro cache
) else (
    echo ⚠️  No Metro cache found
)

echo.
echo ════════════════════════════════════════════════════════
echo   STEP 5/9: Clearing temp files...
echo ════════════════════════════════════════════════════════
del /q "%LOCALAPPDATA%\Temp\metro-*" >nul 2>&1
del /q "%LOCALAPPDATA%\Temp\haste-map-*" >nul 2>&1
if exist "%LOCALAPPDATA%\Temp\metro-cache" rmdir /s /q "%LOCALAPPDATA%\Temp\metro-cache" >nul 2>&1
echo ✅ Cleared temp files

echo.
echo ════════════════════════════════════════════════════════
echo   STEP 6/9: Clearing Watchman (if exists)...
echo ════════════════════════════════════════════════════════
where watchman >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    watchman watch-del-all >nul 2>&1
    echo ✅ Cleared Watchman cache
) else (
    echo ⚠️  Watchman not installed - skipping
)

echo.
echo ════════════════════════════════════════════════════════
echo   STEP 7/9: Removing node_modules (this may take time)...
echo ════════════════════════════════════════════════════════
if exist "node_modules" (
    rmdir /s /q "node_modules"
    echo ✅ Removed node_modules
) else (
    echo ⚠️  No node_modules found
)

echo.
echo ════════════════════════════════════════════════════════
echo   STEP 8/9: Reinstalling dependencies...
echo ════════════════════════════════════════════════════════
call npm install
if !ERRORLEVEL! NEQ 0 (
    echo ❌ npm install failed!
    echo Please check your internet connection and try again
    pause
    exit /b 1
)
echo ✅ Dependencies installed

echo.
echo ════════════════════════════════════════════════════════
echo   STEP 9/9: Starting Metro bundler with clear cache...
echo ════════════════════════════════════════════════════════
echo.
echo ✨ ALL CACHES CLEARED! Starting fresh...
echo.
echo You should now be able to login without THEME_COLOR error
echo.
echo Press Ctrl+C to stop, or close this window when testing is done
echo.

call npx expo start --clear

:end
pause
