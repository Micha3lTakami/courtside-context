@echo off
echo Setting up Courtside Context...
echo.

cd /d "%~dp0"

echo Cleaning old files...
if exist node_modules rmdir /s /q node_modules
if exist .next rmdir /s /q .next
if exist package-lock.json del package-lock.json

echo.
echo Installing packages (this takes ~1 minute)...
call npm install

echo.
echo Starting dev server...
echo.
echo ==========================================
echo  Open Chrome and go to: http://localhost:3000
echo ==========================================
echo.
call npm run dev

pause
