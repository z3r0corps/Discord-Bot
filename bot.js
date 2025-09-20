const { Client, GatewayIntentBits, Events, EmbedBuilder } = require('discord.js');
const config = require('./config.json');
const Database = require('./database');
const ForexScraper = require('./forex-scraper');
const cron = require('node-cron');
require('dotenv').config();

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
});

// Initialize database and forex scraper
const database = new Database();
const forexScraper = new ForexScraper();

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, async readyClient => {
    console.log(`✅ Bot is ready! Logged in as ${readyClient.user.tag}`);
    console.log(`📋 Bot ID: ${readyClient.user.id}`);
    console.log(`🏠 Connected to ${client.guilds.cache.size} server(s)`);
    
    // Set custom activity immediately
    client.user.setActivity('with Minors', { type: 'PLAYING' });
    console.log('🎮 Set bot activity to "Playing with Minors"');
    
    // Set up verification message
    await setupVerificationMessage();
    
    // Set up channel permissions
    await setupChannelPermissions();
    
    // Set up forex news scheduler
    setupForexNewsScheduler();
});

// Set up verification message
async function setupVerificationMessage() {
    try {
        const verificationChannel = client.channels.cache.get(config.verificationChannelId);
        
        if (!verificationChannel) {
            console.error(`❌ Verification channel with ID ${config.verificationChannelId} not found!`);
            return;
        }

        // Check if verification message already exists
        const messages = await verificationChannel.messages.fetch({ limit: 10 });
        const existingMessage = messages.find(msg => msg.author.id === client.user.id && msg.embeds.length > 0 && msg.embeds[0].title === '🔐 Server Verification');

        if (existingMessage) {
            console.log('✅ Verification message already exists');
            return;
        }

        // Create professional verification embed
        const verificationEmbed = new EmbedBuilder()
            .setTitle('🔐 Server Verification')
            .setDescription('Please verify to gain access to this server')
            .setColor(0xff0000)
            .setFooter({ text: 'Click the checkmark below to verify' })
            .setTimestamp();

        const message = await verificationChannel.send({ embeds: [verificationEmbed] });
        await message.react('✅');
        
        console.log('✅ Verification message created and reaction added');
        
    } catch (error) {
        console.error('❌ Error setting up verification message:', error);
    }
}

// Set up channel permissions
async function setupChannelPermissions() {
    try {
        const verificationChannel = client.channels.cache.get(config.verificationChannelId);
        const welcomeChannel = client.channels.cache.get(config.welcomeChannelId);
        const goodbyeChannel = client.channels.cache.get(config.goodbyeChannelId);
        
        if (!verificationChannel) {
            console.error(`❌ Verification channel with ID ${config.verificationChannelId} not found!`);
            return;
        }

        // Get the @everyone role
        const everyoneRole = verificationChannel.guild.roles.everyone;
        
        // Set verification channel permissions - everyone can see and send messages
        try {
            await verificationChannel.permissionOverwrites.edit(everyoneRole, {
                ViewChannel: true,
                SendMessages: false, // Users can't send messages, only react
                ReadMessageHistory: true
            });
            console.log('✅ Verification channel permissions set up');
        } catch (error) {
            console.error('❌ Error setting verification channel permissions:', error);
        }
        
        // Set other channels to be hidden from @everyone by default
        // Only verified users (with the Verified role) will see them
        if (welcomeChannel) {
            try {
                await welcomeChannel.permissionOverwrites.edit(everyoneRole, {
                    ViewChannel: false
                });
                console.log('✅ Welcome channel hidden from unverified users');
            } catch (error) {
                console.error('❌ Error setting welcome channel permissions:', error);
            }
        }
        
        if (goodbyeChannel) {
            try {
                await goodbyeChannel.permissionOverwrites.edit(everyoneRole, {
                    ViewChannel: false
                });
                console.log('✅ Goodbye channel hidden from unverified users');
            } catch (error) {
                console.error('❌ Error setting goodbye channel permissions:', error);
            }
        }
        
        // Set up Verified role permissions for all channels
        const verifiedRole = verificationChannel.guild.roles.cache.get(config.verifiedRoleId);
        if (verifiedRole) {
            try {
                // Verification channel - verified users can't see it
                await verificationChannel.permissionOverwrites.edit(verifiedRole, {
                    ViewChannel: false
                });
                
                // Welcome and goodbye channels - verified users can see them
                if (welcomeChannel) {
                    await welcomeChannel.permissionOverwrites.edit(verifiedRole, {
                        ViewChannel: true,
                        SendMessages: true,
                        ReadMessageHistory: true
                    });
                }
                
                if (goodbyeChannel) {
                    await goodbyeChannel.permissionOverwrites.edit(verifiedRole, {
                        ViewChannel: true,
                        SendMessages: true,
                        ReadMessageHistory: true
                    });
                }
                
                console.log('✅ Verified role permissions set up');
            } catch (error) {
                console.error('❌ Error setting verified role permissions:', error);
            }
        } else {
            console.log('⚠️ Verified role not found. Please create a "Verified" role.');
        }
        
    } catch (error) {
        console.error('❌ Error setting up channel permissions:', error);
    }
}

// Set up forex news scheduler
function setupForexNewsScheduler() {
    // Schedule forex news every day at 6:00 AM EST
    // Cron format: minute hour day month dayOfWeek
    // 0 6 * * * = Every day at 6:00 AM
    cron.schedule('0 6 * * *', async () => {
        console.log('📰 Scheduled forex news check starting...');
        await postForexNews();
    }, {
        timezone: "America/New_York" // EST timezone
    });
    
    console.log('⏰ Forex news scheduler set for 6:00 AM EST daily');
}

// Post forex news to the news channel
async function postForexNews() {
    try {
        const newsChannel = client.channels.cache.get(config.newsChannelId);
        
        if (!newsChannel) {
            console.error('❌ News channel not found!');
            return;
        }

        console.log('📊 Fetching forex news...');
        const newsData = await forexScraper.getTodaysNews();
        
        const embed = new EmbedBuilder()
            .setTitle(newsData.title)
            .setDescription(newsData.description)
            .setColor(newsData.color)
            .setTimestamp();

        if (newsData.fields && newsData.fields.length > 0) {
            embed.addFields(newsData.fields);
        }

        if (newsData.footer) {
            embed.setFooter({ text: newsData.footer.text });
        }

        await newsChannel.send({ embeds: [embed] });
        console.log('✅ Forex news posted successfully');
        
    } catch (error) {
        console.error('❌ Error posting forex news:', error);
    }
}

// Welcome new members (only after verification)
client.on(Events.GuildMemberAdd, async (member) => {
    try {
        // Don't send welcome message immediately - wait for verification
        console.log(`👤 New member joined: ${member.user.tag} (${member.user.id})`);
        
        // Update database if user was previously verified
        const isVerified = await database.isUserVerified(member.user.id);
        if (isVerified) {
            await database.updateLastSeen(member.user.id);
            console.log(`✅ Updated last seen for returning user: ${member.user.tag}`);
        }
        
    } catch (error) {
        console.error('❌ Error handling new member:', error);
    }
});

// Handle verification reactions
client.on(Events.MessageReactionAdd, async (reaction, user) => {
    try {
        // Ignore bot reactions
        if (user.bot) return;

        // Check if it's the verification message
        if (reaction.message.channel.id === config.verificationChannelId && reaction.emoji.name === '✅') {
            const member = reaction.message.guild.members.cache.get(user.id);
            
            if (!member) {
                console.error(`❌ Could not find member: ${user.tag}`);
                return;
            }

            // Check if user is already verified
            const isAlreadyVerified = await database.isUserVerified(user.id);
            if (isAlreadyVerified) {
                console.log(`ℹ️ User ${user.tag} is already verified`);
                return;
            }

            // Find the Verified role by ID
            const verifiedRole = reaction.message.guild.roles.cache.get(config.verifiedRoleId);
            
            if (!verifiedRole) {
                console.error(`❌ Verified role "${config.verifiedRoleName}" not found!`);
                return;
            }

            // Add user to database first
            await database.addUser(user.id, user.tag, null);
            console.log(`📊 Added ${user.tag} to database`);

            // Assign verified role
            try {
                await member.roles.add(verifiedRole);
                console.log(`🎭 Assigned ${config.verifiedRoleName} role to ${user.tag}`);
            } catch (error) {
                console.error('❌ Error assigning role:', error);
                // Send error message to user
                try {
                    await user.send('❌ Verification failed due to permission error. Please contact an administrator.');
                } catch (dmError) {
                    console.error('❌ Could not send DM to user:', dmError);
                }
                return;
            }
            
            // Hide the verification channel from the user
            try {
                await verificationChannel.permissionOverwrites.create(user.id, {
                    ViewChannel: false
                });
                console.log(`🔒 Hidden verification channel from ${user.tag}`);
            } catch (error) {
                console.error('❌ Error hiding verification channel:', error);
            }
            
            // Send welcome message
            const welcomeChannel = client.channels.cache.get(config.welcomeChannelId);
            if (welcomeChannel) {
                try {
                    const welcomeMessage = `🎉 **Welcome ${member.user}!** You've been verified and can now access the server!`;
                    await welcomeChannel.send(welcomeMessage);
                    console.log(`✅ Sent welcome message for ${member.user.tag}`);
                } catch (error) {
                    console.error('❌ Error sending welcome message:', error);
                }
            }

            // Send DM confirmation to user
            try {
                const dmEmbed = new EmbedBuilder()
                    .setTitle('✅ Verification Successful!')
                    .setDescription('You have been successfully verified and can now access all channels in the server!')
                    .setColor(0x00ff00)
                    .setTimestamp();
                
                await user.send({ embeds: [dmEmbed] });
                console.log(`📧 Sent verification confirmation DM to ${user.tag}`);
            } catch (dmError) {
                console.log(`⚠️ Could not send DM to ${user.tag} (DMs may be disabled)`);
            }

            console.log(`✅ User ${user.tag} has been verified and given the ${config.verifiedRoleName} role`);
            
            // Remove the reaction to keep the message clean
            await reaction.users.remove(user.id);
            
        }
    } catch (error) {
        console.error('❌ Error handling verification reaction:', error);
    }
});

// Say goodbye to leaving members (kicked, banned, or left)
client.on(Events.GuildMemberRemove, async (member) => {
    try {
        const goodbyeChannel = client.channels.cache.get(config.goodbyeChannelId);
        
        if (!goodbyeChannel) {
            console.error(`❌ Goodbye channel with ID ${config.goodbyeChannelId} not found!`);
            return;
        }

        const goodbyeMessage = `Seeya ${member.user}! 👋`;
        
        try {
            await goodbyeChannel.send(goodbyeMessage);
            console.log(`✅ Sent goodbye message for ${member.user.tag} in ${goodbyeChannel.name}`);
        } catch (error) {
            console.error('❌ Error sending goodbye message:', error);
        }
        
    } catch (error) {
        console.error('❌ Error handling member removal:', error);
    }
});

// Handle errors and reconnection
client.on('error', error => {
    console.error('❌ Discord client error:', error);
});

client.on('disconnect', () => {
    console.log('🔌 Bot disconnected from Discord. Attempting to reconnect...');
});

client.on('reconnecting', () => {
    console.log('🔄 Bot is reconnecting to Discord...');
});

client.on('resume', () => {
    console.log('✅ Bot reconnected to Discord successfully!');
});

// Handle process errors
process.on('unhandledRejection', error => {
    console.error('❌ Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
    console.error('❌ Uncaught exception:', error);
    // Restart the bot process
    console.log('🔄 Restarting bot due to uncaught exception...');
    process.exit(1);
});

// Handle SIGINT (Ctrl+C) gracefully
process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT. Shutting down gracefully...');
    client.destroy();
    process.exit(0);
});

// Handle SIGTERM gracefully
process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM. Shutting down gracefully...');
    client.destroy();
    process.exit(0);
});

// Add manual forex news command for testing
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    
    // Manual forex news command (admin only)
    if (message.content === '!news' && message.member.permissions.has('Administrator')) {
        try {
            await message.reply('📊 Fetching forex news...');
            await postForexNews();
        } catch (error) {
            console.error('❌ Error in manual forex news command:', error);
            await message.reply('❌ Error fetching forex news.');
        }
    }
    
    // Set email command for verified users
    if (message.content.startsWith('!setemail ') && message.member.roles.cache.has(config.verifiedRoleId)) {
        try {
            const email = message.content.split(' ').slice(1).join(' ').trim();
            
            if (!email || !email.includes('@')) {
                await message.reply('❌ Please provide a valid email address. Usage: `!setemail your@email.com`');
                return;
            }
            
            // Update user email in database
            await updateUserEmail(message.author.id, email);
            await message.reply(`✅ Email updated to: ${email}`);
            
        } catch (error) {
            console.error('❌ Error setting email:', error);
            await message.reply('❌ Error updating email. Please try again.');
        }
    }
});

// Update user email function
async function updateUserEmail(discordId, email) {
    try {
        await database.updateUserEmail(discordId, email);
    } catch (error) {
        console.error('❌ Error updating user email:', error);
        throw error;
    }
}

// Login to Discord with your client's token
client.login(process.env.DISCORD_BOT_TOKEN);

