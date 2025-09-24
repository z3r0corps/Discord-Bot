# 🚀 Discord Bot 24/7 Hosting Guide

This guide will help you deploy your Discord bot to run 24/7 with health check monitoring.

## 📋 Prerequisites

1. **GitHub Account** - For code hosting
2. **Discord Bot Token** - Already configured
3. **Hosting Platform Account** - Choose from options below

## 🌐 Hosting Platform Options

### 1. **Railway** (Recommended)
- **Free Tier**: $5 credit monthly (usually enough for small bots)
- **Pros**: Reliable, easy deployment, good performance
- **Setup**:
  1. Go to [railway.app](https://railway.app)
  2. Sign up with GitHub
  3. Create new project → Deploy from GitHub repo
  4. Add environment variables (DISCORD_BOT_TOKEN, etc.)
  5. Deploy!

### 2. **Render**
- **Free Tier**: 750 hours/month (enough for 24/7)
- **Pros**: Great for Node.js, automatic deployments
- **Setup**:
  1. Go to [render.com](https://render.com)
  2. Sign up with GitHub
  3. Create new Web Service → Connect GitHub repo
  4. Set build command: `npm install`
  5. Set start command: `npm start`
  6. Add environment variables
  7. Deploy!

### 3. **Replit**
- **Free Tier**: Always-on option available
- **Pros**: Built-in IDE, easy setup
- **Setup**:
  1. Go to [replit.com](https://replit.com)
  2. Create new Repl → Import from GitHub
  3. Install dependencies: `npm install`
  4. Add environment variables in Secrets tab
  5. Run the bot

## 🔧 Health Check System

Your bot now includes a built-in health check system:

### Endpoints Available:
- **`/`** - Full status information (JSON)
- **`/ping`** - Simple ping/pong response

### Example Health Check Response:
```json
{
  "status": "online",
  "bot": "YourBot#1234",
  "uptime": 3600,
  "timestamp": "2024-01-01T12:00:00.000Z",
  "guilds": 5
}
```

## 📊 Uptime Monitoring Setup

### Option 1: UptimeRobot (Free)
1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Sign up for free account
3. Add new monitor:
   - **Monitor Type**: HTTP(s)
   - **URL**: `https://your-bot-url.com/ping`
   - **Monitoring Interval**: Every 5 minutes
   - **Alert Contacts**: Add your email

### Option 2: Uptime Kuma (Self-hosted)
1. Deploy Uptime Kuma on a VPS
2. Add your bot's health check URL
3. Set up notifications (Discord, email, etc.)

### Option 3: Pingdom (Paid)
1. Go to [pingdom.com](https://pingdom.com)
2. Create account and add monitor
3. Set up advanced alerting

## 🚀 Deployment Steps

### For Railway:
1. Push your code to GitHub
2. Connect Railway to your GitHub repo
3. Add environment variables:
   ```
   DISCORD_BOT_TOKEN=your_token_here
   ALPHA_VANTAGE_API_KEY=your_key_here
   PORT=3000
   ```
4. Deploy and get your bot URL
5. Set up UptimeRobot to ping `https://your-bot-url.railway.app/ping`

### For Render:
1. Push your code to GitHub
2. Create new Web Service on Render
3. Connect your GitHub repo
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Add environment variables
6. Deploy and get your bot URL
7. Set up UptimeRobot to ping `https://your-bot-url.onrender.com/ping`

## 🔍 Monitoring Your Bot

### Check Bot Status:
- Visit `https://your-bot-url.com/` to see full status
- Visit `https://your-bot-url.com/ping` for simple ping test

### Logs:
- **Railway**: View logs in dashboard
- **Render**: View logs in service dashboard
- **Replit**: View logs in console

## 🛠️ Troubleshooting

### Bot Not Starting:
1. Check environment variables are set correctly
2. Verify Discord bot token is valid
3. Check logs for error messages

### Health Check Failing:
1. Ensure PORT environment variable is set
2. Check if hosting platform allows web servers
3. Verify bot is actually running

### Bot Going Offline:
1. Check uptime monitoring service
2. Verify hosting platform isn't sleeping
3. Check for memory/CPU limits

## 💡 Tips for 24/7 Uptime

1. **Use multiple monitoring services** for redundancy
2. **Set up alerts** for immediate notification
3. **Monitor resource usage** to avoid limits
4. **Keep logs** for debugging issues
5. **Test deployments** before going live

## 📞 Support

If you need help with deployment:
1. Check the hosting platform's documentation
2. Review bot logs for errors
3. Test health check endpoints manually
4. Verify all environment variables are set

---

**Your bot is now ready for 24/7 hosting! 🎉**
