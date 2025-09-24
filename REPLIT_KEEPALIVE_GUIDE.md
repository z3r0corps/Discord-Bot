# 🔄 Replit 24/7 Keep-Alive System

## 🚨 **The Problem: Replit Sleeps Due to Inactivity**

Replit can put your bot to sleep if there's no activity for extended periods. Here's how to keep it active 24/7:

## 🛠️ **Solution 1: External Ping Service (Recommended)**

### **Step 1: Set Up UptimeRobot (Free)**
1. **Go to [uptimerobot.com](https://uptimerobot.com)**
2. **Sign up for free account**
3. **Add new monitor:**
   - **Monitor Type**: HTTP(s)
   - **URL**: `https://your-repl-name.repl.co/ping`
   - **Monitoring Interval**: Every 3 minutes
   - **Alert Contacts**: Add your email
4. **Save monitor**

### **Step 2: Set Up Cron-job.org (Backup)**
1. **Go to [cron-job.org](https://cron-job.org)**
2. **Sign up for free account**
3. **Create new cron job:**
   - **URL**: `https://your-repl-name.repl.co/ping`
   - **Schedule**: Every 3 minutes
   - **Method**: GET
4. **Save cron job**

### **Step 3: Set Up StatusCake (Additional Backup)**
1. **Go to [statuscake.com](https://statuscake.com)**
2. **Sign up for free account**
3. **Add new test:**
   - **Website URL**: `https://your-repl-name.repl.co/ping`
   - **Check Rate**: Every 1 minute
   - **Test Type**: HTTP
4. **Save test**

## 🔧 **Solution 2: Internal Keep-Alive (Built-in)**

Your bot already has keep-alive functionality built-in! The Express server runs on port 3000 and responds to pings.

### **Built-in Endpoints:**
- **`/ping`** - Simple ping/pong response
- **`/health`** - Detailed health information
- **`/`** - Bot status and available endpoints

## 📊 **Solution 3: Multiple Monitoring Services**

### **Primary Monitoring:**
- **UptimeRobot**: Every 3 minutes (free)
- **Cron-job.org**: Every 3 minutes (free)
- **StatusCake**: Every 1 minute (free)

### **Total Cost: $0/month** 🎉

## 🚀 **How to Update Replit with New Code**

### **Method 1: Git Pull in Replit (Easiest)**
1. **In Replit, open the terminal**
2. **Run these commands:**
   ```bash
   git pull origin main
   npm install
   node bot.js
   ```

### **Method 2: Re-import from GitHub**
1. **Delete your current Replit project**
2. **Go to [replit.com](https://replit.com)**
3. **Click "Create Repl"**
4. **Select "Import from GitHub"**
5. **Enter your GitHub repo URL**
6. **Click "Import"**
7. **Add your environment variables again**

### **Method 3: Manual File Update**
1. **Copy your updated files to Replit**
2. **Replace the old files**
3. **Restart the bot**

## 🔍 **Testing Your Keep-Alive System**

### **Test 1: Manual Ping**
Visit: `https://your-repl-name.repl.co/ping`
**Expected response**: `pong`

### **Test 2: Health Check**
Visit: `https://your-repl-name.repl.co/health`
**Expected response**: JSON with bot status

### **Test 3: Status Check**
Visit: `https://your-repl-name.repl.co/`
**Expected response**: JSON with bot information

## 📈 **Monitoring Your Bot**

### **Check Bot Status:**
- **Replit Console**: View real-time logs
- **UptimeRobot Dashboard**: See ping history
- **StatusCake Dashboard**: Monitor uptime

### **Bot Commands (in Discord):**
- **`!status`** - Show bot status and recent updates
- **`!volatility`** - Show NQ and ES volatility
- **`!market`** - Show market summary
- **`!news`** - Show forex news

## 🚨 **Troubleshooting**

### **Bot Not Responding:**
1. **Check Replit console** for errors
2. **Verify environment variables** are set
3. **Check if bot is running** in Replit
4. **Test ping endpoints** manually

### **Bot Going to Sleep:**
1. **Verify UptimeRobot** is pinging every 3 minutes
2. **Check Cron-job.org** is working
3. **Add StatusCake** as backup
4. **Monitor logs** for ping activity

### **Update Issues:**
1. **Use `git pull origin main`** in Replit terminal
2. **Restart bot** after updates
3. **Check for errors** in console
4. **Test functionality** after updates

## 💡 **Pro Tips for 24/7 Uptime**

### **Multiple Monitoring:**
- **Use 3+ monitoring services** for redundancy
- **Set up email alerts** for downtime
- **Monitor from different locations**

### **Regular Maintenance:**
- **Check logs weekly** for errors
- **Update dependencies monthly**
- **Test functionality** after changes

### **Backup Strategy:**
- **Keep GitHub updated** with latest code
- **Document all changes** you make
- **Test updates locally** before pushing

---

**🎉 Your bot will now stay online 24/7 with multiple monitoring services!**
