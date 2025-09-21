@echo off
title Discord Bot - Enhanced Auto Starter
echo ========================================
echo    Discord Bot Enhanced Auto Starter
echo ========================================
echo.

REM Change to the bot directory
cd /d "C:\Projects\discordbot"

REM Check if PM2 is installed
pm2 --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: PM2 is not installed or not in PATH
    echo Please install PM2: npm install -g pm2
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Checking internet connectivity...
ping -n 1 8.8.8.8 >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ No internet connection detected
    echo Bot will start but may not connect to Discord until internet is available
) else (
    echo ✅ Internet connection detected
)

echo.
echo Starting Discord Bot...
echo.

REM Start the bot with PM2
pm2 start ecosystem.config.js

REM Wait a moment for the bot to initialize
timeout /t 5 /nobreak >nul

REM Check if the bot started successfully
pm2 status discord-bot >nul 2>&1
if %errorlevel% equ 0 (
    echo.
    echo ✅ Discord Bot started successfully!
    echo.
    echo Bot Status:
    pm2 status discord-bot
    echo.
    echo Starting WiFi Monitor...
    
    REM Start the WiFi monitor
    start /min "WiFi Monitor" node wifi-monitor.js
    
    echo.
    echo ✅ WiFi Monitor started in background
    echo.
    echo To view bot logs: pm2 logs discord-bot
    echo To view WiFi monitor logs: type logs\wifi-monitor.log
    echo To stop bot: pm2 stop discord-bot
    echo To restart bot: pm2 restart discord-bot
) else (
    echo.
    echo ❌ Failed to start Discord Bot
    echo Check the logs for errors: pm2 logs discord-bot
    echo.
    echo Attempting to start WiFi monitor anyway...
    start /min "WiFi Monitor" node wifi-monitor.js
)

echo.
echo ========================================
echo Bot and WiFi Monitor are running.
echo This window can be closed.
echo ========================================
timeout /t 5 /nobreak >nul
