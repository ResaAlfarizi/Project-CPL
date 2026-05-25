@echo off
echo ============================================
echo INSERT DUMMY DATA LENGKAP - SISTEM CPL
echo ============================================
echo.

REM Konfigurasi database
set PGHOST=localhost
set PGPORT=5432
set PGDATABASE=cpl_db
set PGUSER=postgres

echo Memasukkan dummy data ke database...
echo.

psql -U %PGUSER% -d %PGDATABASE% -f "06_dummy_data_lengkap.sql"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo BERHASIL! Dummy data telah dimasukkan
    echo ============================================
    echo.
    echo Data yang dimasukkan:
    echo - 4 Program Studi
    echo - 15 CPL
    echo - 10 Dosen
    echo - 10 Mahasiswa
    echo - 5 Users Mahasiswa
    echo - 15 Mata Kuliah
    echo - 15 Kelas
    echo - 10 Enrollment
    echo - 10 Pemetaan MK-CPL
    echo - 16 Sub-CPMK
    echo - 33 Nilai
    echo.
    echo Login credentials:
    echo Email: mhs1@if.ac.id
    echo Password: admin123
    echo.
) else (
    echo.
    echo ============================================
    echo GAGAL! Terjadi error saat insert data
    echo ============================================
    echo.
)

pause
