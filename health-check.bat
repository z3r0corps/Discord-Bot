@echo off
title Discord Bot - Health Check
echo ========================================
echo    Discord Bot Health Check
echo ========================================
echo.

REM Change to the bot directory
cd /d "C:\Projects\discordbot"

REM Log the health check
echo [%date% %time%] Running health check... >> logs\health-check.log

REM Check if PM2 is running
pm2 status >nul 2>&1
if %errorlevel% neq 0 (
    echo PM2 not running - attempting to start...
    pm2 resurrect
    timeout /t 5 /nobreak >nul
    echo [%date% %time%] PM2 resurrected >> logs\health-check.log
)

REM Check bot status
pm2 status discord-bot | findstr "online" >nul
if %errorlevel% equ 0 (
    echo ✅ Bot is healthy
    echo [%date% %time%] Bot status: HEALTHY >> logs\health-check.log
) else (
    echo ⚠️ Bot is unhealthy - attempting restart...
    echo [%date% %time%] Bot status: UNHEALTHY - restarting >> logs\health-check.log
    
    pm2 restart discord-bot
    timeout /t 10 /nobreak >nul
    
    REM Check again after restart
    pm2 status discord-bot | findstr "online" >nul
    if %errorlevel% equ 0 (
        echo ✅ Bot restarted successfully
        echo [%date% %time%] Bot restart: SUCCESS >> logs\health-check.log
    ) else (
        echo ❌ Bot restart failed - trying full restart...
        echo [%date% %time%] Bot restart: FAILED - trying full restart >> logs\health-check.log
        
        pm2 stop discord-bot
        timeout /t 3 /nobreak >nul
        pm2 start ecosystem.config.js
        timeout /t 10 /nobreak >nul
        
        pm2 status discord-bot | findstr "online" >nul
        if %errorlevel% equ 0 (
            echo ✅ Bot full restart successful
            echo [%date% %time%] Bot full restart: SUCCESS >> logs\health-check.log
        ) else (
            echo ❌ Bot full restart failed
            echo [%date% %time%] Bot full restart: FAILED >> logs\health-check.log
        )
    )
)

REM Check internet connectivity
ping -n 1 8.8.8.8 >nul 2>&1
if %errorlevel% equ 0 (
    echo 🌐 Internet connection is working
    echo [%date% %time%] Internet: WORKING >> logs\health-check.log
) else (
    echo ⚠️ Internet connection issue detected
    echo [%date% %time%] Internet: ISSUE DETECTED >> logs\health-check.log
)

REM Check if WiFi monitor is running
tasklist /fi "imagename eq node.exe" /fi "windowtitle eq WiFi Monitor*" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ WiFi Monitor is running
    echo [%date% %time%] WiFi Monitor: RUNNING >> logs\health-check.log
) else (
    echo ⚠️ WiFi Monitor not running - starting...
    echo [%date% %time%] WiFi Monitor: NOT RUNNING - starting >> logs\health-check.log
    start /min "WiFi Monitor" node wifi-monitor.js
    timeout /t 3 /nobreak >nul
    echo ✅ WiFi Monitor started
    echo [%date% %time%] WiFi Monitor: STARTED >> logs\health-check.log
)

echo.
echo ========================================
echo Health check complete!
echo ========================================
