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
    echo [!] MySQL is not running. Starting XAMPP MySQL server...
    start "" /B "C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini" --standalone
    timeout /t 3 >nul
)

:: Verify connection was established
"C:\xampp\mysql\bin\mysql.exe" -u root -e "USE restaurant_billing_db; SELECT 1;" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] MySQL Database connected successfully!
) else (
    echo [WARNING] Please ensure XAMPP MySQL is started in XAMPP Control Panel.
)

echo [2/3] Checking Backend API Server...
netstat -ano | findstr ":5000 " >nul 2>&1
if %errorlevel% neq 0 (
    echo Starting Express.js Backend API & Serving React Web App on Port 5000...
    cd api
    start "Restaurant Billing API & Web App" cmd /k "npm start"
    cd ..
    timeout /t 3 >nul
) else (
    echo [OK] Server is already running on Port 5000!
)

echo [3/3] Opening Web App in your browser...
start http://localhost:5000

echo.
echo =======================================================
echo   Web App is LIVE at: http://localhost:5000
echo.
echo   Role-Based Login Accounts:
echo   - 👔 Owner:         owner        / owner123
echo   - ⚙️ Admin:         admin        / admin123
echo   - 💳 Cashier:       cashier      / cashier123
echo   - 🍳 Kitchen Staff: kitchen_chef / kitchen123
echo =======================================================
echo.
pause
