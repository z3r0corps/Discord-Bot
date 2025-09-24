# 🔄 24/7 Auto-Update System for Discord Bot

## 🎯 **Complete Update Strategy**

### **Option 1: Replit Auto-Update (Recommended)**

#### **Setup GitHub Webhook:**
1. **Go to your GitHub repo → Settings → Webhooks**
2. **Add webhook:**
   - **Payload URL**: `https://your-repl-name.repl.co/webhook`
   - **Content type**: `application/json`
   - **Events**: Push events only
   - **Active**: ✅

#### **Add Webhook Handler to Bot:**
```javascript
// Add this to your bot.js
app.post('/webhook', (req, res) => {
    console.log('🔄 GitHub webhook received - updating bot...');
    
    // Pull latest changes
    const { exec } = require('child_process');
    exec('git pull origin main', (error, stdout, stderr) => {
        if (error) {
            console.error('❌ Git pull failed:', error);
            return res.status(500).send('Update failed');
        }
        
        console.log('✅ Code updated successfully');
        console.log('🔄 Restarting bot...');
        
        // Restart the bot process
        process.exit(0); // PM2 or Replit will restart it
    });
    
    res.status(200).send('Update initiated');
});
```

### **Option 2: Scheduled Updates (Every 6 Hours)**

#### **Add to bot.js:**
```javascript
// Add this to your bot.js
const cron = require('node-cron');

// Auto-update every 6 hours
cron.schedule('0 */6 * * *', async () => {
    console.log('🔄 Scheduled update check...');
    
    const { exec } = require('child_process');
    exec('git pull origin main', (error, stdout, stderr) => {
        if (error) {
            console.error('❌ Scheduled update failed:', error);
            return;
        }
        
        if (stdout.includes('Already up to date')) {
            console.log('✅ Bot is already up to date');
            return;
        }
        
        console.log('✅ Bot updated successfully - restarting...');
        process.exit(0);
    });
}, {
    timezone: "America/New_York"
});
```

### **Option 3: Manual Update Commands**

#### **Add Discord Commands:**
```javascript
// Add this to your bot.js message handler
if (message.content === '!update') {
    // Check if user is admin
    if (!message.member.permissions.has('ADMINISTRATOR')) {
        return message.reply('❌ Only administrators can update the bot.');
    }
    
    message.reply('🔄 Updating bot...');
    
    const { exec } = require('child_process');
    exec('git pull origin main', (error, stdout, stderr) => {
        if (error) {
            return message.reply('❌ Update failed: ' + error.message);
        }
        
        if (stdout.includes('Already up to date')) {
            return message.reply('✅ Bot is already up to date');
        }
        
        message.reply('✅ Bot updated successfully - restarting...');
        process.exit(0);
    });
}

if (message.content === '!status') {
    const { exec } = require('child_process');
    exec('git log --oneline -5', (error, stdout, stderr) => {
        if (error) {
            return message.reply('❌ Unable to get status');
        }
        
        const commits = stdout.split('\n').filter(line => line.trim());
        const status = `📊 **Bot Status**\n\n**Recent Updates:**\n${commits.map(commit => `• ${commit}`).join('\n')}`;
        
        message.reply(status);
    });
}
```

## 🔧 **Implementation Steps**

### **Step 1: Add Dependencies**
```bash
npm install child_process
```

### **Step 2: Add Update Code to bot.js**
Add the webhook handler and/or scheduled updates to your bot.js

### **Step 3: Test the System**
1. **Make a small change** to your bot
2. **Push to GitHub**
3. **Check if bot updates automatically**

### **Step 4: Monitor Updates**
- **Check logs** for update messages
- **Test functionality** after updates
- **Set up alerts** for failed updates

## 📊 **Volatility Tracker Integration**

### **Add Volatility Commands to Bot:**
```javascript
// Add to your message handler
if (message.content === '!volatility') {
    const VolatilityTracker = require('./volatility-tracker');
    const tracker = new VolatilityTracker();
    
    try {
        const marketData = await tracker.getBothVolatilities();
        const summary = await tracker.getMarketSummary();
        
        const embed = new EmbedBuilder()
            .setTitle('📊 Market Volatility')
            .setDescription(summary.status)
            .addFields(
                { name: 'NQ (Nasdaq 100)', value: `${marketData.NQ.toFixed(2)}%`, inline: true },
                { name: 'ES (S&P 500)', value: `${marketData.ES.toFixed(2)}%`, inline: true },
                { name: 'Market Status', value: summary.marketStatus, inline: true }
            )
            .setColor(0x00ff00)
            .setTimestamp();
        
        message.reply({ embeds: [embed] });
    } catch (error) {
        message.reply('❌ Error fetching volatility data');
    }
}

if (message.content === '!market') {
    const VolatilityTracker = require('./volatility-tracker');
    const tracker = new VolatilityTracker();
    
    try {
        const summary = await tracker.getMarketSummary();
        
        const embed = new EmbedBuilder()
            .setTitle('📈 Market Summary')
            .setDescription(summary.status)
            .addFields(
                { name: 'Status', value: summary.marketStatus, inline: true },
                { name: 'Real Data', value: summary.hasRealData ? '✅ Yes' : '❌ No', inline: true }
            )
            .setColor(summary.hasRealData ? 0x00ff00 : 0xff0000)
            .setTimestamp();
        
        message.reply({ embeds: [embed] });
    } catch (error) {
        message.reply('❌ Error fetching market data');
    }
}
```

## 🚨 **Backup Strategy**

### **Multiple Deployment:**
1. **Primary**: Replit (auto-updates)
2. **Backup**: Railway (manual updates)
3. **Monitoring**: UptimeRobot on both

### **Update Verification:**
1. **Test updates** on backup first
2. **Monitor logs** after updates
3. **Rollback plan** if issues occur

## 💡 **Pro Tips**

### **Safe Updates:**
- **Test locally** before pushing
- **Small changes** are safer than big rewrites
- **Keep backups** of working versions

### **Monitoring:**
- **Set up alerts** for failed updates
- **Check bot status** after updates
- **Monitor API usage** (Alpha Vantage limits)

---

**🎉 Your bot will now stay updated 24/7 automatically!**
