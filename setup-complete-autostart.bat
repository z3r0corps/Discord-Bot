@echo off
title Discord Bot - Complete Auto Start Setup
echo ========================================
echo    Discord Bot Complete Auto Start Setup
echo ========================================
echo.
echo This script will set up your Discord bot to:
echo - Start automatically when Windows boots
echo - Restart when WiFi reconnects
echo - Monitor health and restart if needed
echo - Run as a Windows service (optional)
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: This script must be run as Administrator
    echo Right-click and select "Run as administrator"
    pause
    exit /b 1
)

echo Checking prerequisites...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
) else (
    echo ✅ Node.js is installed
)

REM Check if PM2 is installed
pm2 --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PM2 is not installed
    echo Installing PM2 globally...
    npm install -g pm2
    if %errorlevel% neq 0 (
        echo ❌ Failed to install PM2
        pause
        exit /b 1
    ) else (
        echo ✅ PM2 installed successfully
    )
) else (
    echo ✅ PM2 is installed
)

REM Check if .env file exists
if not exist "C:\Projects\discordbot\.env" (
    echo ❌ .env file not found
    echo Please create a .env file with your Discord bot token
    echo Example: DISCORD_BOT_TOKEN=your_token_here
    pause
    exit /b 1
) else (
    echo ✅ .env file found
)

echo.
echo ========================================
echo Setting up Windows Task Scheduler...
echo ========================================
echo.

REM Clean up existing tasks
echo Cleaning up existing tasks...
schtasks /delete /tn "Discord Bot Auto Start" /f >nul 2>&1
schtasks /delete /tn "Discord Bot WiFi Recovery" /f >nul 2>&1
schtasks /delete /tn "Discord Bot System Startup" /f >nul 2>&1
schtasks /delete /tn "Discord Bot User Login" /f >nul 2>&1
schtasks /delete /tn "Discord Bot Network Recovery" /f >nul 2>&1
schtasks /delete /tn "Discord Bot Health Check" /f >nul 2>&1

echo Creating new scheduled tasks...

REM Task 1: System Startup (primary)
echo Creating system startup task...
schtasks /create /tn "Discord Bot System Startup" /tr "C:\Projects\discordbot\enhanced-startup.bat" /sc onstart /ru "SYSTEM" /f /delay 0001:00
if %errorlevel% equ 0 (
    echo ✅ System startup task created
) else (
    echo ❌ Failed to create system startup task
)

REM Task 2: User Login (backup)
echo Creating user login task...
schtasks /create /tn "Discord Bot User Login" /tr "C:\Projects\discordbot\enhanced-startup.bat" /sc onlogon /ru "%USERNAME%" /f /delay 0000:30
if %errorlevel% equ 0 (
    echo ✅ User login task created
) else (
    echo ❌ Failed to create user login task
)

REM Task 3: Network connectivity event
echo Creating network recovery task...
schtasks /create /tn "Discord Bot Network Recovery" /tr "C:\Projects\discordbot\wifi-recovery.bat" /sc onstart /ru "SYSTEM" /f
if %errorlevel% equ 0 (
    echo ✅ Network recovery task created
) else (
    echo ❌ Failed to create network recovery task
)

REM Task 4: Health check (every 5 minutes)
echo Creating health check task...
schtasks /create /tn "Discord Bot Health Check" /tr "C:\Projects\discordbot\health-check.bat" /sc minute /mo 5 /ru "SYSTEM" /f
if %errorlevel% equ 0 (
    echo ✅ Health check task created
) else (
    echo ❌ Failed to create health check task
)

echo.
echo ========================================
echo Setting up Windows Service (Optional)...
echo ========================================
echo.

set /p install_service="Do you want to install as a Windows Service? (y/n): "
if /i "%install_service%"=="y" (
    echo Installing Windows Service...
    
    REM Check if node-windows is installed
    npm list node-windows >nul 2>&1
    if %errorlevel% neq 0 (
        echo Installing node-windows...
        npm install node-windows
    )
    
    REM Create service installer
    echo Creating service installer...
    echo const Service = require('node-windows').Service; > install-service.js
    echo const path = require('path'); >> install-service.js
    echo. >> install-service.js
    echo const svc = new Service({ >> install-service.js
    echo   name: 'Discord Bot Service', >> install-service.js
    echo   description: 'Discord Bot with WiFi monitoring and auto-restart', >> install-service.js
    echo   script: path.join(__dirname, 'discord-bot-service.js'), >> install-service.js
    echo   nodeOptions: ['--max_old_space_size=4096'] >> install-service.js
    echo }); >> install-service.js
    echo. >> install-service.js
    echo svc.on('install', function() { >> install-service.js
    echo   console.log('Service installed successfully'); >> install-service.js
    echo   svc.start(); >> install-service.js
    echo }); >> install-service.js
    echo. >> install-service.js
    echo svc.install(); >> install-service.js
    
    echo Running service installer...
    node install-service.js
    
    if %errorlevel% equ 0 (
        echo ✅ Windows Service installed successfully
        echo The service will start automatically on boot
    ) else (
        echo ❌ Failed to install Windows Service
    )
    
    del install-service.js
) else (
    echo Skipping Windows Service installation
)

echo.
echo ========================================
echo Testing the setup...
echo ========================================
echo.

echo Testing bot startup...
call "C:\Projects\discordbot\enhanced-startup.bat"

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Your Discord bot is now configured to:
echo ✅ Start automatically when Windows boots
echo ✅ Restart when WiFi reconnects
echo ✅ Monitor health and restart if needed
echo ✅ Run continuously in the background
echo.
echo Created Tasks:
echo - Discord Bot System Startup (triggers at system boot)
echo - Discord Bot User Login (triggers at user login)
echo - Discord Bot Network Recovery (triggers when network comes online)
echo - Discord Bot Health Check (runs every 5 minutes)
echo.
echo Log Files:
echo - Bot logs: logs\combined.log
echo - WiFi monitor logs: logs\wifi-monitor.log
echo - Health check logs: logs\health-check.log
echo - Service logs: logs\service.log
echo.
echo Management Commands:
echo - View bot status: pm2 status discord-bot
echo - View bot logs: pm2 logs discord-bot
echo - Restart bot: pm2 restart discord-bot
echo - Stop bot: pm2 stop discord-bot
echo.
echo To remove all auto-start features:
echo - Run: schtasks /delete /tn "Discord Bot System Startup" /f
echo - Run: schtasks /delete /tn "Discord Bot User Login" /f
echo - Run: schtasks /delete /tn "Discord Bot Network Recovery" /f
echo - Run: schtasks /delete /tn "Discord Bot Health Check" /f
echo - Run: sc delete "Discord Bot Service" (if service was installed)
echo.
echo ========================================
echo Setup and test complete!
echo ========================================
pause
