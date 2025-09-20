const { Client, GatewayIntentBits, Events } = require('discord.js');
const config = require('./config.json');
require('dotenv').config();

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, readyClient => {
    console.log(`✅ Bot is ready! Logged in as ${readyClient.user.tag}`);
    console.log(`📋 Bot ID: ${readyClient.user.id}`);
    console.log(`🏠 Connected to ${client.guilds.cache.size} server(s)`);
});

// Welcome new members
client.on(Events.GuildMemberAdd, async (member) => {
    try {
        const welcomeChannel = client.channels.cache.get(config.welcomeChannelId);
        
        if (!welcomeChannel) {
            console.error(`❌ Welcome channel with ID ${config.welcomeChannelId} not found!`);
            return;
        }

        const welcomeMessage = `Welcome ${member.user}! 🎉`;
        
        await welcomeChannel.send(welcomeMessage);
        console.log(`✅ Sent welcome message for ${member.user.tag} in ${welcomeChannel.name}`);
        
    } catch (error) {
        console.error('❌ Error sending welcome message:', error);
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

// Login to Discord with your client's token
client.login(process.env.DISCORD_BOT_TOKEN);

