# 🚀 Hetzner VPS Deployment Guide (State-of-the-Art)

## Why Hetzner?
- **Best value**: €3.29/month for ARM or €4.15/month for x86
- **Excellent performance**: NVMe SSD, 4GB RAM, 40GB storage
- **99.9% uptime**: Enterprise-grade infrastructure
- **Global locations**: EU, US, Asia
- **No vendor lock-in**: Standard Linux VPS

## 🛠️ Step-by-Step Setup

### 1. Create Hetzner Account
1. Go to [hetzner.com](https://hetzner.com)
2. Sign up for account
3. Verify email and add payment method

### 2. Create VPS
1. Go to Cloud Console → Create Server
2. Choose:
   - **Image**: Ubuntu 22.04 LTS
   - **Type**: CX11 (€4.15/month) or CAX11 (€3.29/month ARM)
   - **Location**: Choose closest to your users
   - **SSH Key**: Add your public key
3. Click "Create & Buy Now"

### 3. Initial Server Setup
```bash
# Connect to your server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Install Git
apt install git -y

# Create bot user
adduser discordbot
usermod -aG sudo discordbot
su - discordbot
```

### 4. Deploy Your Bot
```bash
# Clone your repository
git clone https://github.com/yourusername/discordbot.git
cd discordbot

# Install dependencies
npm install

# Create .env file
nano .env
# Add your DISCORD_BOT_TOKEN and other variables

# Start with PM2
pm2 start bot.js --name "discord-bot"
pm2 save
pm2 startup
```

### 5. Set Up Monitoring
```bash
# Install Uptime Kuma (self-hosted monitoring)
docker run -d --restart=always -p 3001:3001 -v uptime-kuma:/app/data --name uptime-kuma louislam/uptime-kuma

# Or use external monitoring
# Set up UptimeRobot to ping: http://your-server-ip:3000/ping
```

## 🔧 Advanced Configuration

### Nginx Reverse Proxy (Optional)
```bash
# Install Nginx
apt install nginx -y

# Create config
nano /etc/nginx/sites-available/discordbot
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL Certificate (Optional)
```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d your-domain.com
```

## 📊 Monitoring & Maintenance

### PM2 Commands
```bash
pm2 status          # Check bot status
pm2 logs discord-bot # View logs
pm2 restart discord-bot # Restart bot
pm2 stop discord-bot    # Stop bot
pm2 delete discord-bot  # Remove from PM2
```

### Health Check
- Visit: `http://your-server-ip:3000/`
- Ping: `http://your-server-ip:3000/ping`

### Automatic Updates
```bash
# Create update script
nano update-bot.sh
```

```bash
#!/bin/bash
cd /home/discordbot/discordbot
git pull origin main
npm install
pm2 restart discord-bot
```

```bash
# Make executable
chmod +x update-bot.sh

# Add to crontab for daily updates
crontab -e
# Add: 0 2 * * * /home/discordbot/update-bot.sh
```

## 💰 Cost Breakdown
- **VPS**: €4.15/month (€3.29 ARM)
- **Domain**: €1-2/month (optional)
- **Total**: ~$5-6/month for enterprise-grade hosting

## 🚀 Performance Benefits
- **Dedicated resources**: No sharing with other users
- **Full control**: Install anything you need
- **Custom monitoring**: Set up exactly what you want
- **Backup options**: Full server snapshots
- **Scaling**: Easy to upgrade as bot grows

## 🔒 Security Features
- **Firewall**: UFW or iptables
- **SSH keys**: No password authentication
- **Regular updates**: Automated security patches
- **Backups**: Automated daily snapshots

---

**This is the current state-of-the-art for Discord bot hosting! 🎉**
