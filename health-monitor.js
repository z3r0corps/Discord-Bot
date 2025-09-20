const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class HealthMonitor {
    constructor() {
        this.checkInterval = 30000; // Check every 30 seconds
        this.maxRetries = 3;
        this.retryCount = 0;
        this.isRunning = false;
    }

    start() {
        console.log('🏥 Health Monitor started');
        this.isRunning = true;
        this.checkBotHealth();
    }

    stop() {
        console.log('🛑 Health Monitor stopped');
        this.isRunning = false;
    }

    checkBotHealth() {
        if (!this.isRunning) return;

        exec('pm2 status discord-bot', (error, stdout, stderr) => {
            if (error) {
                console.error('❌ Error checking bot status:', error);
                this.handleBotFailure();
                return;
            }

            // Check if bot is online
            if (stdout.includes('online')) {
                console.log('✅ Bot is healthy');
                this.retryCount = 0; // Reset retry count on success
            } else {
                console.log('⚠️ Bot appears to be offline');
                this.handleBotFailure();
            }
        });

        // Schedule next check
        setTimeout(() => this.checkBotHealth(), this.checkInterval);
    }

    handleBotFailure() {
        this.retryCount++;
        console.log(`🔄 Attempting to restart bot (attempt ${this.retryCount}/${this.maxRetries})`);

        if (this.retryCount <= this.maxRetries) {
            exec('pm2 restart discord-bot', (error, stdout, stderr) => {
                if (error) {
                    console.error('❌ Failed to restart bot:', error);
                } else {
                    console.log('✅ Bot restart command sent');
                }
            });
        } else {
            console.error('❌ Max retry attempts reached. Bot may need manual intervention.');
            this.retryCount = 0; // Reset for next cycle
        }
    }

    // Check internet connectivity
    checkInternetConnection() {
        return new Promise((resolve) => {
            exec('ping -n 1 8.8.8.8', (error, stdout, stderr) => {
                if (error) {
                    console.log('🌐 Internet connection check failed');
                    resolve(false);
                } else {
                    console.log('🌐 Internet connection is working');
                    resolve(true);
                }
            });
        });
    }

    // Log system status
    logSystemStatus() {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            botStatus: 'checking',
            internetStatus: 'checking',
            uptime: process.uptime()
        };

        // Write to health log
        const logPath = path.join(__dirname, 'logs', 'health.log');
        const logDir = path.dirname(logPath);
        
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }

        fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');
    }
}

// Start health monitor if this file is run directly
if (require.main === module) {
    const monitor = new HealthMonitor();
    monitor.start();

    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('🛑 Shutting down health monitor...');
        monitor.stop();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('🛑 Shutting down health monitor...');
        monitor.stop();
        process.exit(0);
    });
}

module.exports = HealthMonitor;
