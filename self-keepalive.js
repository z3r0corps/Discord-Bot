// Self-contained keep-alive system - no third-party dependencies
const axios = require('axios');

class SelfKeepAlive {
    constructor(botUrl) {
        this.botUrl = botUrl;
        this.pingInterval = 2 * 60 * 1000; // Ping every 2 minutes
        this.isRunning = false;
        this.pingCount = 0;
        this.lastPingTime = null;
        this.consecutiveFailures = 0;
        this.maxFailures = 3;
    }

    // Start the self-keepalive system
    start() {
        if (this.isRunning) {
            console.log('🔄 Self-keepalive already running');
            return;
        }

        console.log(`🚀 Starting self-keepalive for ${this.botUrl}`);
        this.isRunning = true;
        this.pingBot();
    }

    // Stop the self-keepalive system
    stop() {
        console.log('🛑 Stopping self-keepalive');
        this.isRunning = false;
    }

    // Ping the bot to keep it alive
    async pingBot() {
        if (!this.isRunning) return;

        try {
            const response = await axios.get(`${this.botUrl}/ping`, {
                timeout: 10000 // 10 second timeout
            });

            if (response.status === 200 && response.data === 'pong') {
                this.pingCount++;
                this.consecutiveFailures = 0;
                this.lastPingTime = new Date();
                
                console.log(`✅ Ping #${this.pingCount} successful at ${this.lastPingTime.toLocaleTimeString()}`);
            } else {
                throw new Error(`Unexpected response: ${response.status}`);
            }

        } catch (error) {
            this.consecutiveFailures++;
            console.error(`❌ Ping #${this.pingCount + 1} failed: ${error.message}`);
            
            if (this.consecutiveFailures >= this.maxFailures) {
                console.error(`🚨 ${this.consecutiveFailures} consecutive failures - bot may be down!`);
                // You could add notification logic here (email, Discord webhook, etc.)
            }
        }

        // Schedule next ping
        if (this.isRunning) {
            setTimeout(() => this.pingBot(), this.pingInterval);
        }
    }

    // Get status information
    getStatus() {
        return {
            isRunning: this.isRunning,
            pingCount: this.pingCount,
            lastPingTime: this.lastPingTime,
            consecutiveFailures: this.consecutiveFailures,
            botUrl: this.botUrl
        };
    }
}

module.exports = SelfKeepAlive;
