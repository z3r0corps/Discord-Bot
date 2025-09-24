// Keep-alive server for Replit - prevents sleep due to inactivity
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Keep-alive ping endpoint
app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'online',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        platform: process.platform,
        nodeVersion: process.version
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Discord Bot Keep-Alive Server',
        status: 'online',
        endpoints: {
            ping: '/ping',
            health: '/health',
            status: '/status'
        },
        timestamp: new Date().toISOString()
    });
});

// Status endpoint
app.get('/status', (req, res) => {
    res.status(200).json({
        bot: 'online',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Start the keep-alive server
app.listen(PORT, () => {
    console.log(`🔄 Keep-alive server running on port ${PORT}`);
    console.log(`📡 Ping endpoint: http://localhost:${PORT}/ping`);
    console.log(`💚 Health endpoint: http://localhost:${PORT}/health`);
});

// Keep the process alive with internal pings
setInterval(() => {
    console.log(`💓 Keep-alive ping at ${new Date().toISOString()}`);
}, 30000); // Ping every 30 seconds internally

module.exports = app;
