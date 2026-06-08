@echo off
REM Quick Test Script for Mobile Module 2
REM Usage: quick-test.bat [command]

echo.
echo ╔════════════════════════════════════════════╗
echo ║   MOBILE MODULE 2 - QUICK TEST HELPER     ║
echo ╚════════════════════════════════════════════╝
echo.

if "%1"=="" goto menu
if /i "%1"=="verify" goto verify
if /i "%1"=="start" goto start
if /i "%1"=="clear" goto clear
if /i "%1"=="reset" goto reset
if /i "%1"=="backend" goto backend
goto menu

:menu
echo Available commands:
echo.
echo   1. verify  - Run import verification
echo   2. start   - Start Metro bundler
echo   3. clear   - Start with cleared cache
echo   4. reset   - Reinstall dependencies
echo   5. backend - Check backend status
echo.
set /p choice="Enter command (1-5): "

if "%choice%"=="1" goto verify
if "%choice%"=="2" goto start
if "%choice%"=="3" goto clear
if "%choice%"=="4" goto reset
if "%choice%"=="5" goto backend
echo Invalid choice!
goto end

:verify
echo.
echo [VERIFY] Running import verification...
echo.
node verify-imports.js
goto end

:start
echo.
echo [START] Starting Metro bundler...
echo.
npm start
goto end

:clear
echo.
echo [CLEAR] Starting with cleared cache...
echo.
npm start -- --clear
goto end

:reset
echo.
echo [RESET] Reinstalling dependencies...
echo.
echo This will remove node_modules and reinstall.
set /p confirm="Continue? (y/n): "
if /i not "%confirm%"=="y" goto end
echo.
echo Removing node_modules...
rd /s /q node_modules
echo.
echo Installing dependencies...
npm install
echo.
echo Done! Run 'npm start' to start the app.
goto end

:backend
echo.
echo [BACKEND] Checking backend status...
echo.
curl -s http://localhost:3000/health > nul 2>&1
if %errorlevel%==0 (
    echo ✅ Backend is running on http://localhost:3000
) else (
    echo ❌ Backend is not running!
    echo.
    echo To start backend:
    echo   cd apps\backend
    echo   node app.js
)
goto end

:end
echo.
pause
