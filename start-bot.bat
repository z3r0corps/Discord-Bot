@echo off
title Discord Bot - Auto Starter
echo ========================================
echo    Discord Bot Auto Starter
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

echo Starting Discord Bot...
echo.

REM Start the bot with PM2
pm2 start ecosystem.config.js

REM Check if the bot started successfully
timeout /t 3 /nobreak >nul
pm2 status discord-bot >nul 2>&1
if %errorlevel% equ 0 (
    echo.
    echo ✅ Discord Bot started successfully!
    echo.
    echo Bot Status:
    pm2 status discord-bot
    echo.
    echo To view logs: pm2 logs discord-bot
    echo To stop bot: pm2 stop discord-bot
    echo To restart bot: pm2 restart discord-bot
) else (
    echo.
    echo ❌ Failed to start Discord Bot
    echo Check the logs for errors: pm2 logs discord-bot
)

echo.
echo ========================================
echo Bot is running in the background.
echo This window can be closed.
echo ========================================
timeout /t 5 /nobreak >nul
