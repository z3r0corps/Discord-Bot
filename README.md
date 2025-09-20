# Discord Welcome & Goodbye Bot

A simple Discord bot that automatically welcomes new members and says goodbye when members leave your server.

## Features

- 🎉 **Welcome Messages**: Automatically sends "Welcome @user!" when someone joins
- 👋 **Goodbye Messages**: Automatically sends "Seeya @user!" when someone leaves, gets kicked, or banned
- 🔐 **Verification System**: Red verification message with reaction-based verification to prevent bot spam
- 📊 **User Database**: Local SQLite database to track verified users
- 🎭 **Role Assignment**: Automatically assigns "Verified" role after verification
- ⚙️ **Easy Configuration**: Simple config file for channel IDs
- 🛡️ **Error Handling**: Robust error handling and logging

## Setup Instructions

### 1. Create a Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Give your bot a name (e.g., "Welcome Bot")
4. Go to the "Bot" section in the left sidebar
5. Click "Add Bot"
6. Copy the bot token (you'll need this later)

### 2. Set Bot Permissions

1. In the Discord Developer Portal, go to "OAuth2" > "URL Generator"
2. Select these scopes:
   - `bot`
   - `applications.commands`
3. Select these bot permissions:
   - `Send Messages`
   - `View Channels`
   - `Read Message History`
4. Copy the generated URL and open it in your browser
5. Select your server and authorize the bot

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure the Bot

1. Copy `env.example` to `.env`:
   ```bash
   copy env.example .env
   ```

2. Edit `.env` and add your bot token:
   ```
   DISCORD_BOT_TOKEN=your_actual_bot_token_here
   ```

   **⚠️ IMPORTANT**: Never commit your `.env` file to GitHub! It contains your bot token.

3. The channel IDs are already configured in `config.json`:
   - Welcome Channel: `1418953168016113725`
   - Goodbye Channel: `1418953196340252786`
   - Verification Channel: `1418984559474901013`

### 5. Set Up Verification System

1. **Create a "Verified" role** in your Discord server
2. **The bot will automatically**:
   - Set up channel permissions (only verification channel visible to new users)
   - Post a red verification message: "Please verify to gain access to this server"
   - Add a ✅ reaction to the message
   - Assign the "Verified" role when users react
   - Hide the verification channel from verified users
   - Show all other channels to verified users
   - Track verified users in a local database

### 6. Run the Bot

```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

For 24/7 operation with PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
```

## 🚀 Maximum Uptime Setup

### Automatic Startup on Windows Boot

1. **Run the setup script as Administrator**:
   ```bash
   # Right-click and "Run as administrator"
   setup-windows-startup.bat
   ```

2. **Manual startup script**:
   ```bash
   # Double-click to start the bot
   start-bot.bat
   ```

### Health Monitoring

1. **Start health monitor**:
   ```bash
   npm run monitor
   ```

2. **Manual monitoring script**:
   ```bash
   # Continuous monitoring with auto-restart
   monitor-and-restart.bat
   ```

### PM2 Commands

```bash
# Start bot
npm run pm2:start

# Stop bot
npm run pm2:stop

# Restart bot
npm run pm2:restart

# Check status
npm run pm2:status

# View logs
npm run pm2:logs
```

### Auto-Recovery Features

- ✅ **Internet outage recovery**: Bot automatically reconnects when internet returns
- ✅ **Process crash recovery**: PM2 automatically restarts crashed processes
- ✅ **Memory leak protection**: Auto-restart if memory usage exceeds 1GB
- ✅ **Graceful shutdown**: Proper cleanup on system shutdown
- ✅ **Health monitoring**: Continuous status checking and auto-restart
- ✅ **Windows startup**: Automatic bot start when Windows boots

## Configuration

### Channel IDs

Edit `config.json` to change the welcome and goodbye channels:

```json
{
  "welcomeChannelId": "your_welcome_channel_id",
  "goodbyeChannelId": "your_goodbye_channel_id"
}
```

### Getting Channel IDs

1. Enable Developer Mode in Discord (User Settings > Advanced > Developer Mode)
2. Right-click on the channel you want
3. Click "Copy ID"

## Commands

- `!stats` - View server statistics (Admin only)
  - Shows total verified users
  - Displays recent verifications

- `!profile <user_id>` - View specific user profile (Admin only)
  - Shows detailed information about a verified user
  - Example: `!profile 123456789012345678`

- `!profiles` - List all user profile files (Admin only)
  - Shows all user profile files in the users folder

- `!check-permissions` - Check bot permissions (Admin only)
  - Verifies bot has correct permissions and role hierarchy
  - Helps troubleshoot verification issues

## Database & User Profiles

The bot uses a local SQLite database (`users.db`) to track:
- User Discord IDs
- Usernames
- Verification timestamps
- Last seen timestamps

### User Profile Files

Each verified user gets a text file in the `users/` folder containing:
- Discord ID and username
- Verification timestamp
- Last seen timestamp
- Profile creation date
- Status information

**File naming format**: `{discord_id}_{username}.txt`

**Example file content**:
```
DISCORD USER PROFILE
========================
Discord ID: 123456789012345678
Username: ExampleUser
Verified At: 2024-01-01T12:00:00.000Z
Last Seen: 2024-01-01T12:00:00.000Z
Status: Verified ✅

Profile Created: 1/1/2024, 12:00:00 PM
========================
This file was automatically generated by the Discord Bot.
User verified through reaction-based verification system.
```

The database and user profiles are automatically created when the bot starts.

## Bot Permissions Required

Make sure your bot has these permissions in the channels:
- **Send Messages**: To post welcome/goodbye messages
- **View Channels**: To see the channels
- **Read Message History**: To access channel information

## Troubleshooting

### Bot doesn't respond
- Check that the bot token is correct in `.env`
- Verify the bot is online in your server
- Check console for error messages

### "Used disallowed intents" error
- Go to Discord Developer Portal → Your app → Bot section
- Enable "Server Members Intent" under "Privileged Gateway Intents"
- Enable "Message Content Intent" if available
- Click "Save Changes"

### Messages not appearing
- Verify channel IDs in `config.json` are correct
- Check bot permissions in those channels
- Make sure the channels exist and are accessible

### Bot can't see members
- The bot needs the "Server Members Intent" enabled:
  1. Go to Discord Developer Portal
  2. Select your application
  3. Go to "Bot" section
  4. Enable "Server Members Intent"

## File Structure

```
discordbot/
├── bot.js              # Main bot file
├── config.json         # Channel configuration
├── package.json        # Dependencies
├── env.example         # Environment variables template
├── .env               # Your bot token (create this)
└── README.md          # This file
```

## GitHub Deployment

### For GitHub Repository

1. **Initialize Git repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Discord welcome bot"
   ```

2. **Create GitHub repository** and push:
   ```bash
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git branch -M main
   git push -u origin main
   ```

3. **Important Security Notes**:
   - ✅ `.env` file is already in `.gitignore` (your token is safe)
   - ✅ Never commit your bot token to GitHub
   - ✅ Share `env.example` with others who want to use your bot

### For Others Using Your Bot

1. Clone your repository
2. Copy `env.example` to `.env`
3. Add their own bot token to `.env`
4. Run `npm install` and `npm start`

## Support

If you encounter any issues:
1. Check the console output for error messages
2. Verify all setup steps were completed correctly
3. Make sure your bot has the required permissions

Happy botting! 🤖

