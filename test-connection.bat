@echo off
echo ========================================
echo TEST KONEKSI BACKEND DAN DATABASE
echo ========================================
echo.

echo [1/5] Testing Backend Health Check...
curl -s http://localhost:3000
echo.
echo.

echo [2/5] Testing Module 1 Endpoint (Dosen)...
curl -s http://localhost:3000/api/v1/m1/dosen
echo.
echo.

echo [3/5] Testing Module 2 Endpoint (Prodi)...
curl -s http://localhost:3000/api/v1/m2/prodi
echo.
echo.

echo [4/5] Testing Login Endpoint...
curl -s -X POST http://localhost:3000/api/v1/m2/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"superadmin@if.ac.id\",\"password\":\"superadmin123\"}"
echo.
echo.

echo [5/5] Testing Frontend...
curl -s http://localhost:3001
echo.
echo.

echo ========================================
echo TEST SELESAI
echo ========================================
echo.
echo Jika semua test berhasil, koneksi sudah OK!
echo Buka browser: http://localhost:3001
echo Login dengan: superadmin@if.ac.id / superadmin123
echo.
pause
