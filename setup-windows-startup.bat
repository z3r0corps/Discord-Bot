@echo off
title Discord Bot - Windows Startup Setup
echo ========================================
echo    Discord Bot Windows Startup Setup
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

echo Setting up Windows Task Scheduler for Discord Bot...
echo.

REM Create the task
schtasks /create /tn "Discord Bot Auto Start" /tr "C:\Projects\discordbot\start-bot.bat" /sc onstart /ru "SYSTEM" /f

if %errorlevel% equ 0 (
    echo ✅ Windows startup task created successfully!
    echo.
    echo The Discord Bot will now start automatically when Windows boots.
    echo.
    echo Task Details:
    echo - Name: Discord Bot Auto Start
    echo - Trigger: At system startup
    echo - Action: Run start-bot.bat
    echo.
    echo To manage this task:
    echo - Open Task Scheduler
    echo - Look for "Discord Bot Auto Start" in the task list
    echo.
    echo To remove this task later:
    echo - Run: schtasks /delete /tn "Discord Bot Auto Start" /f
) else (
    echo ❌ Failed to create Windows startup task
    echo Please check the error message above
)

echo.
echo ========================================
echo Setup complete!
echo ========================================
pause
