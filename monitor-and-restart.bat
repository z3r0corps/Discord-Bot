@echo off
title Discord Bot - Monitor and Restart
echo ========================================
echo    Discord Bot Monitor and Restart
echo ========================================
echo.

:monitor_loop
echo [%date% %time%] Checking bot status...

REM Check if PM2 is running
pm2 status >nul 2>&1
if %errorlevel% neq 0 (
    echo PM2 is not running. Starting PM2...
    pm2 resurrect
    timeout /t 5 /nobreak >nul
)

REM Check bot status
pm2 status discord-bot | findstr "online" >nul
if %errorlevel% equ 0 (
    echo ✅ Bot is online and healthy
) else (
    echo ⚠️ Bot is offline. Attempting restart...
    pm2 restart discord-bot
    timeout /t 10 /nobreak >nul
    
    REM Check again after restart
    pm2 status discord-bot | findstr "online" >nul
    if %errorlevel% equ 0 (
        echo ✅ Bot restarted successfully
    ) else (
        echo ❌ Bot restart failed. Trying full restart...
        pm2 stop discord-bot
        timeout /t 3 /nobreak >nul
        pm2 start ecosystem.config.js
        timeout /t 10 /nobreak >nul
    )
)

REM Check internet connectivity
ping -n 1 8.8.8.8 >nul 2>&1
if %errorlevel% equ 0 (
    echo 🌐 Internet connection is working
) else (
    echo ⚠️ Internet connection issue detected
)

echo.
echo Waiting 60 seconds before next check...
timeout /t 60 /nobreak >nul
echo.

goto monitor_loop
