@echo off
title Discord Bot - Advanced Auto Start Setup
echo ========================================
echo    Discord Bot Advanced Auto Start Setup
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

echo Setting up advanced Windows Task Scheduler for Discord Bot...
echo This will create multiple triggers for different scenarios.
echo.

REM Delete existing tasks if they exist
echo Cleaning up existing tasks...
schtasks /delete /tn "Discord Bot Auto Start" /f >nul 2>&1
schtasks /delete /tn "Discord Bot WiFi Recovery" /f >nul 2>&1
schtasks /delete /tn "Discord Bot System Startup" /f >nul 2>&1

echo.
echo Creating new scheduled tasks...
echo.

REM Task 1: System Startup
echo Creating system startup task...
schtasks /create /tn "Discord Bot System Startup" /tr "C:\Projects\discordbot\enhanced-startup.bat" /sc onstart /ru "SYSTEM" /f /delay 0001:00

if %errorlevel% equ 0 (
    echo ✅ System startup task created successfully!
) else (
    echo ❌ Failed to create system startup task
)

REM Task 2: User Login (in case system startup doesn't work)
echo Creating user login task...
schtasks /create /tn "Discord Bot User Login" /tr "C:\Projects\discordbot\enhanced-startup.bat" /sc onlogon /ru "%USERNAME%" /f /delay 0000:30

if %errorlevel% equ 0 (
    echo ✅ User login task created successfully!
) else (
    echo ❌ Failed to create user login task
)

REM Task 3: Network connectivity event (when network comes online)
echo Creating network connectivity task...
schtasks /create /tn "Discord Bot Network Recovery" /tr "C:\Projects\discordbot\wifi-recovery.bat" /sc onstart /ru "SYSTEM" /f

if %errorlevel% equ 0 (
    echo ✅ Network recovery task created successfully!
) else (
    echo ❌ Failed to create network recovery task
)

REM Task 4: Periodic health check (every 5 minutes)
echo Creating periodic health check task...
schtasks /create /tn "Discord Bot Health Check" /tr "C:\Projects\discordbot\health-check.bat" /sc minute /mo 5 /ru "SYSTEM" /f

if %errorlevel% equ 0 (
    echo ✅ Health check task created successfully!
) else (
    echo ❌ Failed to create health check task
)

echo.
echo ========================================
echo Advanced Auto Start Setup Complete!
echo ========================================
echo.
echo Created Tasks:
echo - Discord Bot System Startup (triggers at system boot)
echo - Discord Bot User Login (triggers at user login)
echo - Discord Bot Network Recovery (triggers when network comes online)
echo - Discord Bot Health Check (runs every 5 minutes)
echo.
echo Task Details:
echo - All tasks run the enhanced startup script
echo - WiFi Monitor will automatically start with the bot
echo - Bot will automatically restart if WiFi reconnects
echo.
echo To manage these tasks:
echo - Open Task Scheduler
echo - Look for "Discord Bot" tasks in the task list
echo.
echo To remove all tasks later:
echo - Run: schtasks /delete /tn "Discord Bot System Startup" /f
echo - Run: schtasks /delete /tn "Discord Bot User Login" /f
echo - Run: schtasks /delete /tn "Discord Bot Network Recovery" /f
echo - Run: schtasks /delete /tn "Discord Bot Health Check" /f
echo.
echo Testing the setup...
echo Starting bot now to verify everything works...
echo.

REM Test the setup by running the enhanced startup
call "C:\Projects\discordbot\enhanced-startup.bat"

echo.
echo ========================================
echo Setup and test complete!
echo ========================================
pause
