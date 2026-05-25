@echo off
REM =============================================
REM Setup Database Sistem CPL - Windows
REM =============================================

echo.
echo ========================================
echo   Setup Database Sistem CPL
echo ========================================
echo.

REM Cek apakah psql tersedia
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] psql tidak ditemukan!
    echo Pastikan PostgreSQL sudah terinstall dan psql ada di PATH
    echo.
    pause
    exit /b 1
)

echo [INFO] PostgreSQL ditemukan
echo.

REM Set database name
set DB_NAME=sistem_cpl
set DB_USER=postgres

echo Database: %DB_NAME%
echo User: %DB_USER%
echo.

REM Konfirmasi
set /p CONFIRM="Lanjutkan setup database? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo Setup dibatalkan
    pause
    exit /b 0
)

echo.
echo ========================================
echo   Step 1: Membuat Database
echo ========================================
echo.

REM Drop database jika sudah ada (optional)
set /p DROP="Drop database jika sudah ada? (Y/N): "
if /i "%DROP%"=="Y" (
    echo [INFO] Dropping database %DB_NAME%...
    psql -U %DB_USER% -c "DROP DATABASE IF EXISTS %DB_NAME%;"
)

echo [INFO] Membuat database %DB_NAME%...
psql -U %DB_USER% -c "CREATE DATABASE %DB_NAME%;"

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Gagal membuat database!
    pause
    exit /b 1
)

echo [OK] Database berhasil dibuat
echo.

echo ========================================
echo   Step 2: Menjalankan DDL Scripts
echo ========================================
echo.

echo [INFO] Menjalankan 01_modul1_ddl.sql...
psql -U %DB_USER% -d %DB_NAME% -f 01_modul1_ddl.sql
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Gagal menjalankan modul 1!
    pause
    exit /b 1
)
echo [OK] Modul 1 selesai
echo.

echo [INFO] Menjalankan 02_modul2_ddl.sql...
psql -U %DB_USER% -d %DB_NAME% -f 02_modul2_ddl.sql
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Gagal menjalankan modul 2!
    pause
    exit /b 1
)
echo [OK] Modul 2 selesai
echo.

echo [INFO] Menjalankan 03_auth_system.sql...
psql -U %DB_USER% -d %DB_NAME% -f 03_auth_system.sql
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Gagal menjalankan auth system!
    pause
    exit /b 1
)
echo [OK] Auth system selesai
echo.

echo ========================================
echo   Step 3: Insert Test Data
echo ========================================
echo.

set /p INSERT_TEST="Insert test users? (Y/N): "
if /i "%INSERT_TEST%"=="Y" (
    echo [INFO] Menjalankan 05_insert_test_users.sql...
    psql -U %DB_USER% -d %DB_NAME% -f 05_insert_test_users.sql
    if %ERRORLEVEL% NEQ 0 (
        echo [WARNING] Gagal insert test users (mungkin sudah ada)
    ) else (
        echo [OK] Test users berhasil dibuat
    )
)
echo.

echo ========================================
echo   Setup Selesai!
echo ========================================
echo.
echo Database: %DB_NAME%
echo Status: Ready
echo.
echo Test Users (Password: admin123):
echo   - Superadmin:  admin@cpl.ac.id
echo   - Admin Prodi: admin.ti@cpl.ac.id
echo   - Dosen:       budi.santoso@cpl.ac.id
echo   - Mahasiswa:   ahmad.fauzi@student.cpl.ac.id
echo.
echo Selanjutnya:
echo   1. Update .env di backend dengan DB_NAME=%DB_NAME%
echo   2. Jalankan backend: cd ..\apps\backend\module2 ^&^& npm start
echo   3. Jalankan frontend: cd ..\apps\web\module2 ^&^& npm run dev
echo.

pause
