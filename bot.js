const { Client, GatewayIntentBits, Events, EmbedBuilder } = require('discord.js');
const config = require('./config.json');
const Database = require('./database');
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

// Initialize database
const database = new Database();

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, async readyClient => {
    console.log(`✅ Bot is ready! Logged in as ${readyClient.user.tag}`);
    console.log(`📋 Bot ID: ${readyClient.user.id}`);
    console.log(`🏠 Connected to ${client.guilds.cache.size} server(s)`);
    
    // Set up verification message
    await setupVerificationMessage();
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
        const existingMessage = messages.find(msg => msg.author.id === client.user.id && msg.embeds.length > 0);

        if (existingMessage) {
            console.log('✅ Verification message already exists');
            return;
        }

        // Create verification embed
        const verificationEmbed = new EmbedBuilder()
            .setTitle('🔐 Server Verification')
            .setDescription('Welcome to our server! To access all channels, please verify yourself by reacting with ✅ below.')
            .setColor(0x00ff00)
            .setFooter({ text: 'Click the checkmark to verify and get access to the server!' })
            .setTimestamp();

        const message = await verificationChannel.send({ embeds: [verificationEmbed] });
        await message.react('✅');
        
        console.log('✅ Verification message created and reaction added');
        
    } catch (error) {
        console.error('❌ Error setting up verification message:', error);
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

            // Find the Verified role
            const verifiedRole = reaction.message.guild.roles.cache.find(role => role.name === config.verifiedRoleName);
            
            if (!verifiedRole) {
                console.error(`❌ Verified role "${config.verifiedRoleName}" not found!`);
                return;
            }

            // Add user to database
            await database.addUser(user.id, user.tag);

            // Assign verified role
            await member.roles.add(verifiedRole);
            
            // Send welcome message
            const welcomeChannel = client.channels.cache.get(config.welcomeChannelId);
            if (welcomeChannel) {
                const welcomeMessage = `Welcome ${member.user}! 🎉 You've been verified and can now access the server!`;
                await welcomeChannel.send(welcomeMessage);
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
        
        await goodbyeChannel.send(goodbyeMessage);
        console.log(`✅ Sent goodbye message for ${member.user.tag} in ${goodbyeChannel.name}`);
        
    } catch (error) {
        console.error('❌ Error sending goodbye message:', error);
    }
});

// Handle errors
client.on('error', error => {
    console.error('❌ Discord client error:', error);
});

process.on('unhandledRejection', error => {
    console.error('❌ Unhandled promise rejection:', error);
});

// Add a simple command to view database stats
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    
    if (message.content === '!stats' && message.member.permissions.has('Administrator')) {
        try {
            const users = await database.getAllUsers();
            const embed = new EmbedBuilder()
                .setTitle('📊 Server Statistics')
                .setDescription(`Total verified users: **${users.length}**`)
                .setColor(0x0099ff)
                .setTimestamp();
            
            if (users.length > 0) {
                const recentUsers = users.slice(0, 5).map(user => 
                    `• ${user.username} - <t:${Math.floor(new Date(user.verified_at).getTime() / 1000)}:R>`
                ).join('\n');
                
                embed.addFields({
                    name: 'Recent Verifications',
                    value: recentUsers,
                    inline: false
                });
            }
            
            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('❌ Error getting stats:', error);
            await message.reply('❌ Error retrieving statistics.');
        }
    }
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_BOT_TOKEN);

