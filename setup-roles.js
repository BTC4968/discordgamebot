const { Client, GatewayIntentBits, Events } = require('discord.js');
const config = require('./config.js');

// Role configuration with point requirements
const roleConfig = {
    'Bronze': { points: 0, color: 0xCD7F32 },
    'Silver': { points: 100, color: 0xC0C0C0 },
    'Gold': { points: 250, color: 0xFFD700 },
    'Platinum': { points: 500, color: 0xE5E4E2 },
    'Diamond': { points: 1000, color: 0xB9F2FF },
    'Master': { points: 2000, color: 0x8A2BE2 },
    'Grandmaster': { points: 5000, color: 0xFF4500 }
};

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

client.once(Events.ClientReady, async (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    
    try {
        // Get the first guild (server) the bot is in
        const guild = readyClient.guilds.cache.first();
        if (!guild) {
            console.log('❌ Bot is not in any servers. Please invite the bot to a server first.');
            process.exit(1);
        }

        console.log(`Setting up roles in server: ${guild.name}`);

        // Create roles
        for (const [roleName, config] of Object.entries(roleConfig)) {
            try {
                // Check if role already exists
                let role = guild.roles.cache.find(r => r.name === roleName);
                
                if (!role) {
                    // Create the role
                    role = await guild.roles.create({
                        name: roleName,
                        color: config.color,
                        reason: `Auto-created role for ${roleName} rank (${config.points} points)`
                    });
                    console.log(`✅ Created role: ${roleName} (${config.points} points)`);
                } else {
                    console.log(`ℹ️  Role already exists: ${roleName}`);
                }
            } catch (error) {
                console.error(`❌ Error creating role ${roleName}:`, error.message);
            }
        }

        console.log('\n🎉 Role setup complete!');
        console.log('\nNext steps:');
        console.log('1. Make sure the bot has "Manage Roles" permission');
        console.log('2. Position the roles in the correct hierarchy (highest to lowest)');
        console.log('3. Make sure the bot\'s role is above all the ranking roles');
        console.log('4. Test the bot with !update command');

    } catch (error) {
        console.error('Error during setup:', error);
    } finally {
        process.exit(0);
    }
});

// Login to Discord
client.login(config.DISCORD_TOKEN);
