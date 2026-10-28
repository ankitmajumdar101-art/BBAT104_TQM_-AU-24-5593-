@echo off
title Restaurant Billing & POS Web App
color 0A

echo =======================================================
echo    ROYAL FEAST - RESTAURANT BILLING & POS WEB APP
echo    TQM Quality Goal: Q01 - Improve Reliability
echo =======================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking MySQL Database connection...
"C:\xampp\mysql\bin\mysql.exe" -u root -e "USE restaurant_billing_db; SELECT 1;" >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Starting XAMPP MySQL server...
    start "" /B "C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini" --standalone
    timeout /t 3 >nul
)

echo [2/3] Starting Express.js & React Web Application...
cd server
start "Restaurant Billing Server" cmd /k "npm start"

timeout /t 2 >nul
echo [3/3] Opening Web App in your browser...
start http://localhost:5000

echo.
echo =======================================================
echo   Web App is LIVE at: http://localhost:5000
echo.
echo   Default Login Accounts:
echo   - Owner:   owner   / owner123
echo   - Admin:   admin   / admin123
echo   - Cashier: cashier / cash123
echo =======================================================
echo.
pause
