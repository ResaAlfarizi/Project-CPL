@echo off
echo ========================================
echo QUICK FIX - Admin Prodi Dashboard
echo ========================================
echo.

echo [1/3] Stopping any running servers...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo [2/3] Clearing Next.js cache...
cd apps\web\module2
if exist .next (
    rmdir /s /q .next
    echo Cache cleared!
) else (
    echo No cache found.
)

echo [3/3] Starting development server...
echo.
echo ========================================
echo Server akan berjalan di:
echo http://localhost:3000
echo ========================================
echo.
echo Login dengan:
echo Email: adminprodi@example.com
echo Password: admin123
echo.
echo Akses dashboard di:
echo http://localhost:3000/admin-prodi
echo ========================================
echo.

npm run dev
