@echo off
title Discord Bot - WiFi Recovery
echo ========================================
echo    Discord Bot WiFi Recovery
echo ========================================
echo.

REM Change to the bot directory
cd /d "C:\Projects\discordbot"

REM Wait a moment for network to stabilize
timeout /t 10 /nobreak >nul

REM Check internet connectivity
echo Checking internet connectivity...
ping -n 3 8.8.8.8 >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ No internet connection - skipping bot restart
    exit /b 1
)

echo ✅ Internet connection detected

REM Check if PM2 is running
pm2 status >nul 2>&1
if %errorlevel% neq 0 (
    echo PM2 not running - starting PM2...
    pm2 resurrect
    timeout /t 5 /nobreak >nul
)

REM Check if bot is running
pm2 status discord-bot | findstr "online" >nul
if %errorlevel% equ 0 (
    echo ✅ Bot is already online
) else (
    echo ⚠️ Bot is offline - restarting...
    pm2 restart discord-bot
    timeout /t 10 /nobreak >nul
    
    REM Check if restart was successful
    pm2 status discord-bot | findstr "online" >nul
    if %errorlevel% equ 0 (
        echo ✅ Bot restarted successfully
    ) else (
        echo ❌ Bot restart failed - trying full restart...
        pm2 stop discord-bot
        timeout /t 3 /nobreak >nul
        pm2 start ecosystem.config.js
        timeout /t 10 /nobreak >nul
    )
)

REM Start WiFi monitor if not already running
tasklist /fi "imagename eq node.exe" /fi "windowtitle eq WiFi Monitor*" >nul 2>&1
if %errorlevel% neq 0 (
    echo Starting WiFi Monitor...
    start /min "WiFi Monitor" node wifi-monitor.js
    echo ✅ WiFi Monitor started
) else (
    echo ✅ WiFi Monitor already running
)

echo.
echo ========================================
echo WiFi recovery complete!
echo ========================================
