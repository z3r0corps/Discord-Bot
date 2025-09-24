# 🤖 Replit AI Instructions - Discord Bot Setup

## 📋 **Instructions for Replit AI**

### **Bot Description:**
This is a Discord trading bot that tracks NQ (Nasdaq 100) and ES (S&P 500) volatility in real-time. The bot shows live market data in its activity status and includes self-contained keep-alive functionality.

### **Key Features:**
- **Live Market Activity**: Shows "NQ:X.X% ES:X.X%" when market is open, "Market Closed" when closed
- **Self-Keep-Alive**: Bot pings itself every 2 minutes to prevent Replit sleep
- **Volatility Tracking**: Real-time NQ and ES volatility calculations
- **Forex News**: Scrapes high-impact USD news from Forex Factory
- **Auto-Updates**: Built-in update system with Discord commands

### **Required Environment Variables:**
```
DISCORD_BOT_TOKEN=your_discord_bot_token_here
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here
PORT=3000
```

### **Dependencies:**
- discord.js
- express
- axios
- puppeteer
- node-cron
- sqlite3
- dotenv

### **Startup Commands:**
```bash
# Install dependencies
npm install

# Start the bot
node bot.js
```

### **Expected Console Output:**
```
🌐 Health check server running on port 3000
🚀 Starting self-keepalive for http://localhost:3000
✅ Ping #1 successful at 12:00:00 PM
✅ Bot is ready! Logged in as YourBot#1234
📋 Bot ID: 123456789
🏠 Connected to 1 server(s)
📊 Live market activity status enabled - updates every 2 minutes
⏰ Forex news scheduler set for 6:00 AM EST daily
```

### **Health Check Endpoints:**
- **Ping**: `https://your-repl-name.repl.co/ping`
- **Health**: `https://your-repl-name.repl.co/health`
- **Status**: `https://your-repl-name.repl.co/`

### **Discord Commands:**
- `!volatility` - Show NQ and ES volatility percentages
- `!market` - Show market status and summary
- `!news` - Show forex news
- `!status` - Show bot status with keep-alive info
- `!keepalive` - Show detailed keep-alive status
- `!update` - Update bot (admin only)

### **Keep-Alive System:**
- **Self-contained**: No external dependencies
- **Pings itself**: Every 2 minutes internally
- **Prevents sleep**: Keeps Replit active 24/7
- **Works independently**: Continues running even if your PC/wifi is off

### **Market Activity Status:**
- **Market Open**: Shows "NQ:15.2% ES:12.8%" (live data)
- **Market Closed**: Shows "Market Closed"
- **Updates**: Every 2 minutes automatically
- **No generic activity**: Only shows market-specific status

### **Troubleshooting:**
- **Bot not starting**: Check environment variables
- **Activity not updating**: Check Alpha Vantage API key
- **Keep-alive failing**: Check console for ping errors
- **Commands not working**: Verify user is verified

### **Important Notes:**
- **Runs 24/7**: Bot stays active on Replit regardless of your PC status
- **Self-sufficient**: No external monitoring services needed
- **Real-time data**: Shows live NQ/ES volatility during market hours
- **Market-aware**: Automatically switches between live data and "Market Closed"

---

**The bot will automatically start and begin showing live market data in its activity status!**
