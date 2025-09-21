# Discord Bot Auto-Start Setup

This guide will help you set up your Discord bot to automatically start when your PC restarts and when WiFi reconnects.

## Features

- ✅ **System Startup**: Bot starts automatically when Windows boots
- ✅ **WiFi Recovery**: Bot restarts when WiFi reconnects after being offline
- ✅ **Health Monitoring**: Continuous health checks and automatic restarts
- ✅ **Multiple Triggers**: System startup, user login, and network events
- ✅ **Windows Service**: Optional Windows service installation
- ✅ **Comprehensive Logging**: Detailed logs for troubleshooting

## Quick Setup

### Option 1: Complete Setup (Recommended)
Run the complete setup script as Administrator:
```batch
setup-complete-autostart.bat
```

### Option 2: Advanced Setup
For more control over individual components:
```batch
setup-advanced-autostart.bat
```

## Prerequisites

1. **Node.js** installed and in PATH
2. **PM2** installed globally (`npm install -g pm2`)
3. **Discord Bot Token** in `.env` file
4. **Administrator privileges** to create scheduled tasks

## Files Created

### Core Scripts
- `wifi-monitor.js` - Monitors WiFi connectivity and restarts bot when needed
- `enhanced-startup.bat` - Enhanced startup script with WiFi monitoring
- `wifi-recovery.bat` - Handles WiFi reconnection scenarios
- `health-check.bat` - Periodic health monitoring
- `discord-bot-service.js` - Windows service wrapper

### Setup Scripts
- `setup-complete-autostart.bat` - Complete setup with all features
- `setup-advanced-autostart.bat` - Advanced setup with individual control
- `setup-windows-startup.bat` - Basic Windows startup setup (original)

## Windows Tasks Created

The setup creates several Windows scheduled tasks:

1. **Discord Bot System Startup** - Triggers at system boot
2. **Discord Bot User Login** - Triggers at user login (backup)
3. **Discord Bot Network Recovery** - Triggers when network comes online
4. **Discord Bot Health Check** - Runs every 5 minutes

## Log Files

All activities are logged to the `logs/` directory:

- `combined.log` - Main bot logs (PM2)
- `wifi-monitor.log` - WiFi monitoring logs
- `health-check.log` - Health check logs
- `service.log` - Windows service logs (if installed)

## Management Commands

### PM2 Commands
```batch
pm2 status discord-bot          # Check bot status
pm2 logs discord-bot           # View bot logs
pm2 restart discord-bot        # Restart bot
pm2 stop discord-bot           # Stop bot
pm2 start ecosystem.config.js  # Start bot
```

### Manual Scripts
```batch
node wifi-monitor.js           # Start WiFi monitor manually
node discord-bot-service.js    # Start as Windows service
enhanced-startup.bat           # Manual startup
wifi-recovery.bat              # Manual WiFi recovery
health-check.bat               # Manual health check
```

## Troubleshooting

### Bot Not Starting
1. Check if Node.js and PM2 are installed
2. Verify `.env` file exists with valid token
3. Check logs in `logs/` directory
4. Run `pm2 logs discord-bot` for detailed error messages

### WiFi Issues
1. Check `logs/wifi-monitor.log` for connectivity issues
2. Verify internet connection manually
3. Run `wifi-recovery.bat` manually to test

### Task Scheduler Issues
1. Open Task Scheduler and check task status
2. Verify tasks are enabled and running
3. Check task history for error messages

### Service Issues (if installed)
1. Check Windows Services for "Discord Bot Service"
2. View service logs in `logs/service.log`
3. Restart service manually if needed

## Removing Auto-Start

To remove all auto-start features:

```batch
# Remove scheduled tasks
schtasks /delete /tn "Discord Bot System Startup" /f
schtasks /delete /tn "Discord Bot User Login" /f
schtasks /delete /tn "Discord Bot Network Recovery" /f
schtasks /delete /tn "Discord Bot Health Check" /f

# Remove Windows service (if installed)
sc delete "Discord Bot Service"
```

## Manual Testing

Test the setup by:

1. **Restart Test**: Restart your PC and check if bot starts automatically
2. **WiFi Test**: Disconnect WiFi, wait, then reconnect and check bot status
3. **Health Test**: Stop the bot manually and see if it restarts automatically

## Configuration

### WiFi Monitor Settings
Edit `wifi-monitor.js` to adjust:
- Check interval (default: 10 seconds)
- Max retry attempts (default: 5)
- Ping target (default: 8.8.8.8)

### Health Check Settings
Edit `health-check.bat` to adjust:
- Check frequency (default: every 5 minutes)
- Log retention settings

### PM2 Settings
Edit `ecosystem.config.js` to adjust:
- Memory limits
- Restart policies
- Log settings

## Support

If you encounter issues:

1. Check the log files in `logs/` directory
2. Verify all prerequisites are met
3. Test individual components manually
4. Check Windows Event Viewer for system errors

## Notes

- The bot will continue running even if WiFi is temporarily disconnected
- WiFi monitor will automatically restart the bot when connectivity is restored
- Health checks run every 5 minutes to ensure bot is running
- All scripts include error handling and logging
- The setup is designed to be robust and self-healing
