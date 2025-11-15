const { REST, Routes } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const config = require('./config.js');

// Define slash commands
const commands = [
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check if the bot is responding'),
    
    new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show help information and available commands'),
    
    new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Get server information'),
    
    new SlashCommandBuilder()
        .setName('points')
        .setDescription('Check your current points and role status')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to check points for (optional)')
                .setRequired(false)),
    
    new SlashCommandBuilder()
        .setName('update')
        .setDescription('Update your role based on your current points'),
    
    new SlashCommandBuilder()
        .setName('addpoints')
        .setDescription('Add points to a user (Admin only)')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to add points to')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Amount of points to add')
                .setRequired(true)
                .setMinValue(1)),
    
    new SlashCommandBuilder()
        .setName('roles')
        .setDescription('Show available roles and their point requirements'),
    
    new SlashCommandBuilder()
        .setName('verify')
        .setDescription('Link your Discord account to your Roblox account')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('Your Roblox username')
                .setRequired(true)),
    
    new SlashCommandBuilder()
        .setName('unverify')
        .setDescription('Unlink your Discord account from Roblox'),
    
    new SlashCommandBuilder()
        .setName('profile')
        .setDescription('View your linked Roblox profile and stats'),
    
    new SlashCommandBuilder()
        .setName('challenge')
        .setDescription('Challenge another player to a fight')
        .addUserOption(option =>
            option.setName('player')
                .setDescription('The player you want to challenge')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('rounds')
                .setDescription('Number of rounds to fight (1-5)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(5)),
    
    new SlashCommandBuilder()
        .setName('accept')
        .setDescription('Accept a pending challenge'),
    
    new SlashCommandBuilder()
        .setName('decline')
        .setDescription('Decline a pending challenge'),
    
    new SlashCommandBuilder()
        .setName('deny')
        .setDescription('Deny a pending challenge'),
    
    new SlashCommandBuilder()
        .setName('challengestats')
        .setDescription('View your challenge statistics'),
    
    new SlashCommandBuilder()
        .setName('challengeleaderboard')
        .setDescription('View the challenge leaderboard'),
    
    // Bounty system commands
    new SlashCommandBuilder()
        .setName('bountyrequest')
        .setDescription('Request a bounty')
        .addStringOption(option =>
            option.setName('targetdisplayname')
                .setDescription('Target Display Name')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason')
                .setRequired(true)),
    
    // Poll system
    new SlashCommandBuilder()
        .setName('pollcreate')
        .setDescription('Create a poll (Executive & Grandmaster only)')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('Poll question')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('options')
                .setDescription('Poll options separated by semicolons (;)')
                .setRequired(true)),
    
    // VIP system
    new SlashCommandBuilder()
        .setName('viplist')
        .setDescription('Show a list of all current VIPs'),
    
    new SlashCommandBuilder()
        .setName('vipchallenge')
        .setDescription('Challenge a VIP (Expert+ only)')
        .addUserOption(option =>
            option.setName('vip')
                .setDescription('The VIP to challenge')
                .setRequired(true)),
    
    // Raid points
    new SlashCommandBuilder()
        .setName('raidpoints')
        .setDescription('Check your current raid points'),
    
    // Leaders
    // new SlashCommandBuilder()
    //     .setName('leaders')
    //     .setDescription('View current clan leaders'),
    
    // Apprentice system
    new SlashCommandBuilder()
        .setName('apprenticerequest')
        .setDescription('Request for an apprentice (Grandmaster/Executive/Elder/Master/Legendary Warrior only)')
        .addStringOption(option =>
            option.setName('display_name')
                .setDescription('Your display name')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('rank')
                .setDescription('Your current rank')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('request')
                .setDescription('Request details (up to 3 apprentices)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('requirements')
                .setDescription('Requirements for apprentices')
                .setRequired(true)),
    
    // Alliance system
    new SlashCommandBuilder()
        .setName('setalliance')
        .setDescription('Set alliance with another clan (Grandmaster only)')
        .addStringOption(option =>
            option.setName('clan_name')
                .setDescription('Name of the clan to ally with')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Alliance description')
                .setRequired(true)),
    
    new SlashCommandBuilder()
        .setName('alliances')
        .setDescription('Check all alliance clans'),
    
    new SlashCommandBuilder()
        .setName('deletealliance')
        .setDescription('Delete an alliance with a clan (Grandmaster only)')
        .addStringOption(option =>
            option.setName('clan_name')
                .setDescription('Name of the clan to delete alliance with')
                .setRequired(true)),
    
    new SlashCommandBuilder()
        .setName('promote')
        .setDescription('Promote a member to a set rank (Grandmaster only)')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to promote')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('rank')
                .setDescription('Rank to promote to')
                .setRequired(true)),
    
    new SlashCommandBuilder()
        .setName('sendmission')
        .setDescription('Send a mission to the mission board (Grandmaster & Executive only)')
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Mission description')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('difficulty')
                .setDescription('Mission difficulty')
                .setRequired(true)
                .addChoices(
                    { name: 'Easy', value: 'Easy' },
                    { name: 'Normal', value: 'Normal' },
                    { name: 'Hard', value: 'Hard' }
                )),
    
    new SlashCommandBuilder()
        .setName('cancelmission')
        .setDescription('Cancel a current mission (Shadow Ops only)')
        .addStringOption(option =>
            option.setName('mission_id')
                .setDescription('Mission ID to cancel')
                .setRequired(true)),
    
    // Links
    new SlashCommandBuilder()
        .setName('links')
        .setDescription('Send links with clan info'),
    
    // Promotions
    new SlashCommandBuilder()
        .setName('promotions')
        .setDescription('Show list of past 10 people who have been rank promoted'),
    
    // Giveaway
    new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Set up a giveaway')
        .addStringOption(option =>
            option.setName('prize')
                .setDescription('Prize description')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Duration in minutes')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(43200))
        .addIntegerOption(option =>
            option.setName('winners')
                .setDescription('Number of winners')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(10)),
    
    // Admin commands
    new SlashCommandBuilder()
        .setName('assigndivision')
        .setDescription('Assign a division to user (Grandmaster only)')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to assign division to')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('division')
                .setDescription('Division name')
                .setRequired(true)),
    
    new SlashCommandBuilder()
        .setName('divisionlist')
        .setDescription('Shows a list of divisions and its members'),
    
    new SlashCommandBuilder()
        .setName('addraidpoints')
        .setDescription('Add raid points to user (Grandmaster only)')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to add raid points to')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Amount of raid points to add')
                .setRequired(true)
                .setMinValue(1)),

    new SlashCommandBuilder()
        .setName('addcoins')
        .setDescription('Add coins to user (Grandmaster only)')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to add coins to')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Amount of coins to add')
                .setRequired(true)
                .setMinValue(1)),

    new SlashCommandBuilder()
        .setName('removecoins')
        .setDescription('Remove coins from user (Grandmaster only)')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to remove coins from')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Amount of coins to remove')
                .setRequired(true)
                .setMinValue(1)),
    
    new SlashCommandBuilder()
        .setName('clearpoints')
        .setDescription('Clear all rank and raid points from user (Grandmaster only)')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to clear points from')
                .setRequired(true)),
    
    new SlashCommandBuilder()
        .setName('assignrole')
        .setDescription('Assign a role to user (Executive+ only)')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to assign role to')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('role')
                .setDescription('Role name')
                .setRequired(true)),
    
    new SlashCommandBuilder()
        .setName('deleteall')
        .setDescription('Delete all messages in this channel (Executive+ only)'),
    
    new SlashCommandBuilder()
        .setName('deletelast10')
        .setDescription('Delete the last 10 messages in this channel (Executive+ only)'),
    
    // Moderation commands
    new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Permanently ban a user from the server (Grandmaster only)')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to ban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the ban')
                .setRequired(false)),
    
    new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a user from the server (Executive+ only)')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to kick')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the kick')
                .setRequired(false)),

    // Music commands
    new SlashCommandBuilder()
        .setName('musichelp')
        .setDescription('Shows a list of music commands'),
    
    new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song by URL')
        .addStringOption(option =>
            option.setName('link')
                .setDescription('YouTube or Spotify link')
                .setRequired(true)),
    
    new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause current song'),
    
    new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop current song'),
    
    new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip to next song'),
    
    new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Show current song queue'),
    
    new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clear current queue'),
    
    new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Stop playback and leave'),
    
    new SlashCommandBuilder()
        .setName('playing')
        .setDescription('Show current playing song'),
    
    new SlashCommandBuilder()
        .setName('restart')
        .setDescription('Restart current playing song'),

    // Coin economy commands
    new SlashCommandBuilder()
        .setName('flip')
        .setDescription('Place a bet and flip heads or tails')
        .addIntegerOption(option =>
            option.setName('bet')
                .setDescription('Amount of coins to bet')
                .setRequired(true)
                .setMinValue(1))
        .addStringOption(option =>
            option.setName('choice')
                .setDescription('Choose heads or tails')
                .setRequired(true)
                .addChoices(
                    { name: 'Heads', value: 'heads' },
                    { name: 'Tails', value: 'tails' }
                )),

    new SlashCommandBuilder()
        .setName('rob')
        .setDescription('Attempt to steal a random amount of coins from a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to rob')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('giftcoins')
        .setDescription('Send coins to a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to send coins to')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Amount of coins to send')
                .setRequired(true)
                .setMinValue(1)),

    new SlashCommandBuilder()
        .setName('grannybomb')
        .setDescription('Drops a bomb on the server (Granny only)'),

    new SlashCommandBuilder()
        .setName('cancelgrannybomb')
        .setDescription('Cancel an active granny bomb (Granny only)')
];

// Register slash commands
const rest = new REST({ version: '10' }).setToken(config.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(config.CLIENT_ID),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
