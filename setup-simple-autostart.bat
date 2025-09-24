@echo off
title Discord Bot - Simple Auto Start Setup
echo ========================================
echo    Discord Bot Simple Auto Start Setup
echo ========================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: This script must be run as Administrator
    echo Right-click and select "Run as administrator"
    pause
    exit /b 1
)

echo This will set up your Discord bot to start automatically when Windows boots.
echo.

REM Clean up existing tasks
echo Cleaning up existing tasks...
schtasks /delete /tn "Discord Bot Auto Start" /f >nul 2>&1
schtasks /delete /tn "Discord Bot Simple Startup" /f >nul 2>&1

echo Creating startup task...
schtasks /create /tn "Discord Bot Simple Startup" /tr "C:\Projects\discordbot\simple-startup.bat" /sc onstart /ru "SYSTEM" /f /delay 0001:00

if %errorlevel% equ 0 (
    echo ✅ Startup task created successfully!
    echo.
    echo Your Discord bot will now start automatically when Windows boots.
    echo.
    echo To test: Restart your computer and check if the bot is running
    echo To stop: Use Task Manager to end node.exe processes
    echo To remove: Run: schtasks /delete /tn "Discord Bot Simple Startup" /f
) else (
    echo ❌ Failed to create startup task
    echo Please try running this script as Administrator
)

echo.
pause
