const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class WiFiMonitor {
    constructor() {
        this.checkInterval = 10000; // Check every 10 seconds
        this.isOnline = false;
        this.isRunning = false;
        this.botProcess = null;
        this.lastKnownState = null;
        this.retryCount = 0;
        this.maxRetries = 5;
        this.logPath = path.join(__dirname, 'logs', 'wifi-monitor.log');
        this.ensureLogDirectory();
    }

    ensureLogDirectory() {
        const logDir = path.dirname(this.logPath);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }

    log(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}`;
        console.log(logMessage);
        fs.appendFileSync(this.logPath, logMessage + '\n');
    }

    start() {
        this.log('🌐 WiFi Monitor started');
        this.isRunning = true;
        this.checkWiFiStatus();
    }

    stop() {
        this.log('🛑 WiFi Monitor stopped');
        this.isRunning = false;
    }

    async checkWiFiStatus() {
        if (!this.isRunning) return;

        try {
            const isOnline = await this.pingGoogle();
            const stateChanged = this.lastKnownState !== isOnline;
            
            if (stateChanged) {
                this.lastKnownState = isOnline;
                
                if (isOnline) {
                    this.log('✅ WiFi connection restored');
                    await this.handleWiFiRestored();
                } else {
                    this.log('❌ WiFi connection lost');
                    await this.handleWiFiLost();
                }
            }

            this.isOnline = isOnline;
            
        } catch (error) {
            this.log(`❌ Error checking WiFi status: ${error.message}`);
        }

        // Schedule next check
        setTimeout(() => this.checkWiFiStatus(), this.checkInterval);
    }

    async pingGoogle() {
        return new Promise((resolve) => {
            exec('ping -n 1 8.8.8.8', (error, stdout, stderr) => {
                if (error) {
                    resolve(false);
                } else {
                    resolve(stdout.includes('Reply from'));
                }
            });
        });
    }

    async handleWiFiLost() {
        this.log('📡 WiFi lost - Bot will continue running but may experience connection issues');
        // Don't stop the bot immediately, let it try to reconnect
    }

    async handleWiFiRestored() {
        this.log('🔄 WiFi restored - Checking bot status and restarting if needed');
        
        try {
            // Check if bot is running
            const isBotRunning = await this.checkBotStatus();
            
            if (!isBotRunning) {
                this.log('🤖 Bot not running - Starting bot...');
                await this.startBot();
            } else {
                this.log('✅ Bot is already running - Checking health...');
                await this.restartBotIfNeeded();
            }
            
            this.retryCount = 0; // Reset retry count on success
            
        } catch (error) {
            this.log(`❌ Error handling WiFi restoration: ${error.message}`);
            await this.handleBotFailure();
        }
    }

    async checkBotStatus() {
        return new Promise((resolve) => {
            exec('pm2 status discord-bot', (error, stdout, stderr) => {
                if (error) {
                    resolve(false);
                } else {
                    resolve(stdout.includes('online'));
                }
            });
        });
    }

    async startBot() {
        return new Promise((resolve, reject) => {
            this.log('🚀 Starting Discord bot...');
            exec('pm2 start ecosystem.config.js', (error, stdout, stderr) => {
                if (error) {
                    this.log(`❌ Failed to start bot: ${error.message}`);
                    reject(error);
                } else {
                    this.log('✅ Bot start command executed');
                    // Wait a moment and check if it's actually running
                    setTimeout(async () => {
                        const isRunning = await this.checkBotStatus();
                        if (isRunning) {
                            this.log('✅ Bot started successfully');
                        } else {
                            this.log('⚠️ Bot start command sent but bot may not be running');
                        }
                        resolve();
                    }, 5000);
                }
            });
        });
    }

    async restartBotIfNeeded() {
        return new Promise((resolve) => {
            exec('pm2 restart discord-bot', (error, stdout, stderr) => {
                if (error) {
                    this.log(`❌ Failed to restart bot: ${error.message}`);
                } else {
                    this.log('🔄 Bot restart command sent');
                }
                resolve();
            });
        });
    }

    async handleBotFailure() {
        this.retryCount++;
        this.log(`🔄 Bot failure handling (attempt ${this.retryCount}/${this.maxRetries})`);

        if (this.retryCount <= this.maxRetries) {
            try {
                await this.startBot();
            } catch (error) {
                this.log(`❌ Failed to restart bot on attempt ${this.retryCount}: ${error.message}`);
            }
        } else {
            this.log('❌ Max retry attempts reached. Bot may need manual intervention.');
            this.retryCount = 0; // Reset for next cycle
        }
    }

    // Get network adapter status
    async getNetworkAdapterStatus() {
        return new Promise((resolve) => {
            exec('netsh interface show interface', (error, stdout, stderr) => {
                if (error) {
                    resolve('unknown');
                } else {
                    // Look for WiFi adapter status
                    const lines = stdout.split('\n');
                    for (const line of lines) {
                        if (line.toLowerCase().includes('wi-fi') || line.toLowerCase().includes('wireless')) {
                            if (line.includes('Enabled')) {
                                resolve('enabled');
                            } else if (line.includes('Disabled')) {
                                resolve('disabled');
                            }
                        }
                    }
                    resolve('unknown');
                }
            });
        });
    }

    // Monitor network adapter changes
    async monitorNetworkAdapter() {
        const status = await this.getNetworkAdapterStatus();
        this.log(`📡 Network adapter status: ${status}`);
        
        if (status === 'disabled' && this.isOnline) {
            this.log('⚠️ Network adapter disabled but connection still active');
        } else if (status === 'enabled' && !this.isOnline) {
            this.log('⚠️ Network adapter enabled but no internet connection');
        }
    }
}

// Start WiFi monitor if this file is run directly
if (require.main === module) {
    const monitor = new WiFiMonitor();
    monitor.start();

    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('🛑 Shutting down WiFi monitor...');
        monitor.stop();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('🛑 Shutting down WiFi monitor...');
        monitor.stop();
        process.exit(0);
    });

    // Monitor network adapter status every 30 seconds
    setInterval(() => {
        monitor.monitorNetworkAdapter();
    }, 30000);
}

module.exports = WiFiMonitor;
