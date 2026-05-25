@echo off
echo ========================================
echo INSTALL BACKEND DEPENDENCIES
echo ========================================
echo.

echo Installing required packages...
npm install express cors dotenv pg bcrypt jsonwebtoken

echo.
echo ========================================
echo INSTALLATION COMPLETE
echo ========================================
echo.
echo Next steps:
echo 1. Make sure PostgreSQL is running
echo 2. Create database: projectcpl
echo 3. Run: node test-db-connection.js
echo 4. Run: node app.js
echo.
pause
