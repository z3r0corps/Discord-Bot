const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class DiscordBotService {
    constructor() {
        this.botProcess = null;
        this.wifiMonitorProcess = null;
        this.isRunning = false;
        this.restartCount = 0;
        this.maxRestarts = 10;
        this.restartDelay = 5000; // 5 seconds
        this.logPath = path.join(__dirname, 'logs', 'service.log');
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
        this.log('🚀 Discord Bot Service starting...');
        this.isRunning = true;
        this.startBot();
        this.startWiFiMonitor();
    }

    stop() {
        this.log('🛑 Discord Bot Service stopping...');
        this.isRunning = false;
        
        if (this.botProcess) {
            this.botProcess.kill();
            this.botProcess = null;
        }
        
        if (this.wifiMonitorProcess) {
            this.wifiMonitorProcess.kill();
            this.wifiMonitorProcess = null;
        }
        
        this.log('✅ Discord Bot Service stopped');
    }

    startBot() {
        if (!this.isRunning) return;

        this.log('🤖 Starting Discord bot...');
        
        // Use PM2 to start the bot
        const pm2Process = spawn('pm2', ['start', 'ecosystem.config.js'], {
            cwd: __dirname,
            stdio: ['pipe', 'pipe', 'pipe']
        });

        pm2Process.on('close', (code) => {
            if (code === 0) {
                this.log('✅ Bot started successfully with PM2');
                this.restartCount = 0; // Reset restart count on success
            } else {
                this.log(`❌ Bot failed to start with PM2 (exit code: ${code})`);
                this.handleBotFailure();
            }
        });

        pm2Process.on('error', (error) => {
            this.log(`❌ Error starting bot: ${error.message}`);
            this.handleBotFailure();
        });
    }

    startWiFiMonitor() {
        if (!this.isRunning) return;

        this.log('🌐 Starting WiFi monitor...');
        
        this.wifiMonitorProcess = spawn('node', ['wifi-monitor.js'], {
            cwd: __dirname,
            stdio: ['pipe', 'pipe', 'pipe']
        });

        this.wifiMonitorProcess.on('close', (code) => {
            this.log(`WiFi Monitor exited with code ${code}`);
            if (this.isRunning) {
                this.log('🔄 Restarting WiFi monitor...');
                setTimeout(() => this.startWiFiMonitor(), 5000);
            }
        });

        this.wifiMonitorProcess.on('error', (error) => {
            this.log(`❌ Error starting WiFi monitor: ${error.message}`);
            if (this.isRunning) {
                setTimeout(() => this.startWiFiMonitor(), 5000);
            }
        });

        this.log('✅ WiFi monitor started');
    }

    handleBotFailure() {
        this.restartCount++;
        this.log(`🔄 Bot failure handling (attempt ${this.restartCount}/${this.maxRestarts})`);

        if (this.restartCount <= this.maxRestarts) {
            this.log(`⏳ Waiting ${this.restartDelay}ms before restart...`);
            setTimeout(() => {
                if (this.isRunning) {
                    this.startBot();
                }
            }, this.restartDelay);
        } else {
            this.log('❌ Max restart attempts reached. Bot may need manual intervention.');
            this.restartCount = 0; // Reset for next cycle
        }
    }

    // Health check method
    async checkHealth() {
        return new Promise((resolve) => {
            const { exec } = require('child_process');
            exec('pm2 status discord-bot', (error, stdout, stderr) => {
                if (error) {
                    resolve(false);
                } else {
                    resolve(stdout.includes('online'));
                }
            });
        });
    }

    // Periodic health check
    async performHealthCheck() {
        if (!this.isRunning) return;

        const isHealthy = await this.checkHealth();
        if (!isHealthy) {
            this.log('⚠️ Bot health check failed - restarting...');
            this.handleBotFailure();
        } else {
            this.log('✅ Bot health check passed');
        }

        // Schedule next health check in 5 minutes
        setTimeout(() => this.performHealthCheck(), 300000);
    }
}

// Start service if this file is run directly
if (require.main === module) {
    const service = new DiscordBotService();
    
    // Start the service
    service.start();
    
    // Start periodic health checks
    setTimeout(() => service.performHealthCheck(), 60000); // First check after 1 minute
    
    // Graceful shutdown handlers
    process.on('SIGINT', () => {
        console.log('🛑 Received SIGINT. Shutting down service...');
        service.stop();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('🛑 Received SIGTERM. Shutting down service...');
        service.stop();
        process.exit(0);
    });

    process.on('uncaughtException', (error) => {
        console.error('❌ Uncaught exception:', error);
        service.stop();
        process.exit(1);
    });

    process.on('unhandledRejection', (error) => {
        console.error('❌ Unhandled promise rejection:', error);
    });
}

module.exports = DiscordBotService;
