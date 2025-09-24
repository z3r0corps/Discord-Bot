@echo off
title Discord Bot - Simple Auto Starter
echo Starting Discord Bot...

REM Change to the bot directory
cd /d "C:\Projects\discordbot"

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if bot is already running
tasklist | findstr "node.exe" >nul 2>&1
if %errorlevel% equ 0 (
    echo Bot is already running
    exit /b 0
)

REM Start the bot
echo Starting Discord Bot...
start /min "Discord Bot" node bot.js

REM Wait a moment
timeout /t 3 /nobreak >nul

REM Check if it started successfully
tasklist | findstr "node.exe" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Discord Bot started successfully!
) else (
    echo ❌ Failed to start Discord Bot
)

echo Bot is running in the background
echo This window will close in 5 seconds...
timeout /t 5 /nobreak >nul
