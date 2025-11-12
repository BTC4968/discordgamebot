const { Client, GatewayIntentBits, Events, Collection, EmbedBuilder, SlashCommandBuilder, REST, Routes, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const play = require('play-dl');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('./config.js');

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// Create a collection to store commands
client.commands = new Collection();

// Store voice connections and audio players per guild
const voiceConnections = new Map();
const audioPlayers = new Map();

// Express server for Roblox webhooks
const app = express();
const PORT = config.PORT || 3000; // Default port 3000

// Middleware
app.use(cors());
app.use(express.json());

// Roblox user verification data
const robloxUsers = {};
const robloxUsersFile = path.join(__dirname, 'data', 'robloxUsers.json');

// Challenge system data
const challenges = {};
const challengeStats = {};
const challengeDataFile = path.join(__dirname, 'data', 'challengeData.json');

// Bounty system data
const bounties = {};
const bountyDataFile = path.join(__dirname, 'data', 'bountyData.json');

// Raid points data
const raidPoints = {};
const raidPointsFile = path.join(__dirname, 'data', 'raidPoints.json');

// Coin data (for bounties)
const coins = {};
const coinsFile = path.join(__dirname, 'data', 'coins.json');

// Alliance data
const alliances = {};
const allianceDataFile = path.join(__dirname, 'data', 'allianceData.json');

// Promotion history
const promotions = [];
const promotionDataFile = path.join(__dirname, 'data', 'promotionData.json');

// VIP data
const vipMembers = {};
const vipDataFile = path.join(__dirname, 'data', 'vipData.json');

// Apprentice requests
const apprenticeRequests = {};
const apprenticeDataFile = path.join(__dirname, 'data', 'apprenticeData.json');

// Giveaway data
const giveaways = {};
const giveawayDataFile = path.join(__dirname, 'data', 'giveawayData.json');

// Division data (userId -> division)
const divisions = {};
const divisionDataFile = path.join(__dirname, 'data', 'divisionData.json');

// Mission system data
const missions = {};
const missionDataFile = path.join(__dirname, 'data', 'missionData.json');

// Load all data files
function loadAllData() {
    // Load challenge data
    if (fs.existsSync(challengeDataFile)) {
        try {
            const data = JSON.parse(fs.readFileSync(challengeDataFile, 'utf8'));
            Object.assign(challenges, data.challenges || {});
            Object.assign(challengeStats, data.stats || {});
        } catch (error) {
            console.error('Error loading challenge data:', error);
        }
    }

    // Load bounty data
    if (fs.existsSync(bountyDataFile)) {
        try {
            const data = JSON.parse(fs.readFileSync(bountyDataFile, 'utf8'));
            Object.assign(bounties, data);
        } catch (error) {
            console.error('Error loading bounty data:', error);
        }
    }

    // Load raid points data
    if (fs.existsSync(raidPointsFile)) {
        try {
            const data = JSON.parse(fs.readFileSync(raidPointsFile, 'utf8'));
            Object.assign(raidPoints, data);
        } catch (error) {
            console.error('Error loading raid points data:', error);
        }
    }

    // Load coin data
    if (fs.existsSync(coinsFile)) {
        try {
            const data = JSON.parse(fs.readFileSync(coinsFile, 'utf8'));
            Object.assign(coins, data);
        } catch (error) {
            console.error('Error loading coin data:', error);
        }
    }


    // Load alliance data
    if (fs.existsSync(allianceDataFile)) {
        try {
            const data = JSON.parse(fs.readFileSync(allianceDataFile, 'utf8'));
            Object.assign(alliances, data);
        } catch (error) {
            console.error('Error loading alliance data:', error);
        }
    }

    // Load promotion data
    if (fs.existsSync(promotionDataFile)) {
        try {
            const data = JSON.parse(fs.readFileSync(promotionDataFile, 'utf8'));
            promotions.push(...(data || []));
        } catch (error) {
            console.error('Error loading promotion data:', error);
        }
    }

    // Load VIP data
    if (fs.existsSync(vipDataFile)) {
        try {
            const data = JSON.parse(fs.readFileSync(vipDataFile, 'utf8'));
            Object.assign(vipMembers, data);
        } catch (error) {
            console.error('Error loading VIP data:', error);
        }
    }

    // Load apprentice data
    if (fs.existsSync(apprenticeDataFile)) {
        try {
            const data = JSON.parse(fs.readFileSync(apprenticeDataFile, 'utf8'));
            Object.assign(apprenticeRequests, data);
        } catch (error) {
            console.error('Error loading apprentice data:', error);
        }
    }

    // Load giveaway data
    if (fs.existsSync(giveawayDataFile)) {
        try {
            const data = JSON.parse(fs.readFileSync(giveawayDataFile, 'utf8'));
            Object.assign(giveaways, data);
        } catch (error) {
            console.error('Error loading giveaway data:', error);
        }
    }

    // Load division data
    if (fs.existsSync(divisionDataFile)) {
        try {
            const data = JSON.parse(fs.readFileSync(divisionDataFile, 'utf8'));
            Object.assign(divisions, data);
        } catch (error) {
            console.error('Error loading division data:', error);
        }
    }

    // Load mission data
    if (fs.existsSync(missionDataFile)) {
        try {
            const data = JSON.parse(fs.readFileSync(missionDataFile, 'utf8'));
            Object.assign(missions, data);
        } catch (error) {
            console.error('Error loading mission data:', error);
        }
    }
}

// Load all data on startup
loadAllData();

// Save functions for all data
function saveChallengeData() {
    try {
        const data = {
            challenges: challenges,
            stats: challengeStats
        };
        fs.writeFileSync(challengeDataFile, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving challenge data:', error);
    }
}

function saveBountyData() {
    try {
        fs.writeFileSync(bountyDataFile, JSON.stringify(bounties, null, 2));
    } catch (error) {
        console.error('Error saving bounty data:', error);
    }
}

function saveRaidPointsData() {
    try {
        fs.writeFileSync(raidPointsFile, JSON.stringify(raidPoints, null, 2));
    } catch (error) {
        console.error('Error saving raid points data:', error);
    }
}

function saveCoinsData() {
    try {
        fs.writeFileSync(coinsFile, JSON.stringify(coins, null, 2));
    } catch (error) {
        console.error('Error saving coin data:', error);
    }
}

function saveAllianceData() {
    try {
        fs.writeFileSync(allianceDataFile, JSON.stringify(alliances, null, 2));
    } catch (error) {
        console.error('Error saving alliance data:', error);
    }
}

function savePromotionData() {
    try {
        fs.writeFileSync(promotionDataFile, JSON.stringify(promotions, null, 2));
    } catch (error) {
        console.error('Error saving promotion data:', error);
    }
}

function saveVipData() {
    try {
        fs.writeFileSync(vipDataFile, JSON.stringify(vipMembers, null, 2));
    } catch (error) {
        console.error('Error saving VIP data:', error);
    }
}

function saveApprenticeData() {
    try {
        fs.writeFileSync(apprenticeDataFile, JSON.stringify(apprenticeRequests, null, 2));
    } catch (error) {
        console.error('Error saving apprentice data:', error);
    }
}

function saveGiveawayData() {
    try {
        fs.writeFileSync(giveawayDataFile, JSON.stringify(giveaways, null, 2));
    } catch (error) {
        console.error('Error saving giveaway data:', error);
    }
}

function saveDivisionData() {
    try {
        fs.writeFileSync(divisionDataFile, JSON.stringify(divisions, null, 2));
    } catch (error) {
        console.error('Error saving division data:', error);
    }
}

function saveMissionData() {
    try {
        fs.writeFileSync(missionDataFile, JSON.stringify(missions, null, 2));
    } catch (error) {
        console.error('Error saving mission data:', error);
    }
}

// Challenge cooldowns (5 minutes between challenges)
const challengeCooldowns = new Map();

// Load Roblox users data
if (fs.existsSync(robloxUsersFile)) {
    try {
        Object.assign(robloxUsers, JSON.parse(fs.readFileSync(robloxUsersFile, 'utf8')));
    } catch (error) {
        console.error('Error loading Roblox users data:', error);
    }
}

// Save Roblox users data
function saveRobloxUsers() {
    try {
        fs.writeFileSync(robloxUsersFile, JSON.stringify(robloxUsers, null, 2));
    } catch (error) {
        console.error('Error saving Roblox users data:', error);
    }
}

// Roblox API functions
async function getRobloxUserInfo(username) {
    try {
        const response = await axios.get(`https://users.roblox.com/v1/usernames/users`, {
            params: { usernames: [username] }
        });
        
        if (response.data.data && response.data.data.length > 0) {
            const user = response.data.data[0];
            return {
                id: user.id,
                name: user.name,
                displayName: user.displayName
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching Roblox user info:', error);
        return null;
    }
}

async function getRobloxUserById(userId) {
    try {
        const response = await axios.get(`https://users.roblox.com/v1/users/${userId}`);
        return {
            id: response.data.id,
            name: response.data.name,
            displayName: response.data.displayName
        };
    } catch (error) {
        console.error('Error fetching Roblox user by ID:', error);
        return null;
    }
}

// Challenge system functions
function generateChallengeId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function isOnCooldown(userId) {
    const cooldown = challengeCooldowns.get(userId);
    if (!cooldown) return false;
    
    const now = Date.now();
    const cooldownTime = 5 * 60 * 1000; // 5 minutes
    
    if (now - cooldown < cooldownTime) {
        return true;
    }
    
    challengeCooldowns.delete(userId);
    return false;
}

function setCooldown(userId) {
    challengeCooldowns.set(userId, Date.now());
}

function initializeUserStats(userId) {
    if (!challengeStats[userId]) {
        challengeStats[userId] = {
            wins: 0,
            losses: 0,
            draws: 0,
            totalChallenges: 0,
            winStreak: 0,
            bestWinStreak: 0
        };
    }
}

function updateChallengeStats(winnerId, loserId) {
    initializeUserStats(winnerId);
    initializeUserStats(loserId);
    
    // Update winner stats
    challengeStats[winnerId].wins++;
    challengeStats[winnerId].totalChallenges++;
    challengeStats[winnerId].winStreak++;
    if (challengeStats[winnerId].winStreak > challengeStats[winnerId].bestWinStreak) {
        challengeStats[winnerId].bestWinStreak = challengeStats[winnerId].winStreak;
    }
    
    // Update loser stats
    challengeStats[loserId].losses++;
    challengeStats[loserId].totalChallenges++;
    challengeStats[loserId].winStreak = 0;
    
    saveChallengeData();
}

function updateDrawStats(player1Id, player2Id) {
    initializeUserStats(player1Id);
    initializeUserStats(player2Id);
    
    challengeStats[player1Id].draws++;
    challengeStats[player1Id].totalChallenges++;
    challengeStats[player1Id].winStreak = 0;
    
    challengeStats[player2Id].draws++;
    challengeStats[player2Id].totalChallenges++;
    challengeStats[player2Id].winStreak = 0;
    
    saveChallengeData();
}

function simulateFight(rounds) {
    const results = [];
    let player1Wins = 0;
    let player2Wins = 0;
    
    for (let i = 0; i < rounds; i++) {
        const roundResult = Math.random();
        if (roundResult < 0.45) {
            results.push({ round: i + 1, winner: 'player1' });
            player1Wins++;
        } else if (roundResult < 0.9) {
            results.push({ round: i + 1, winner: 'player2' });
            player2Wins++;
        } else {
            results.push({ round: i + 1, winner: 'draw' });
        }
    }
    
    let winner = 'draw';
    if (player1Wins > player2Wins) {
        winner = 'player1';
    } else if (player2Wins > player1Wins) {
        winner = 'player2';
    }
    
    return {
        results,
        player1Wins,
        player2Wins,
        winner
    };
}

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
        .setDescription('Create a poll (Executive+ only)')
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
    new SlashCommandBuilder()
        .setName('leaders')
        .setDescription('View current clan leaders'),
    
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
                .setMaxValue(1440))
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
        .setDescription('Delete all messages in this channel (Grandmaster only)'),
    
    new SlashCommandBuilder()
        .setName('deletelast10')
        .setDescription('Delete the last 10 messages in this channel (Grandmaster only)')
        ,
    
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
        .setName('play')
        .setDescription('Play music from a YouTube or Spotify link')
        .addStringOption(option =>
            option.setName('link')
                .setDescription('YouTube or Spotify link')
                .setRequired(true)),

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
                .setMinValue(1))
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

// Data storage for user points
const dataFile = path.join(__dirname, 'data', 'userPoints.json');
const dataDir = path.dirname(dataFile);

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Load user points data
let userPoints = {};
if (fs.existsSync(dataFile)) {
    try {
        userPoints = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    } catch (error) {
        console.error('Error loading user points data:', error);
        userPoints = {};
    }
}

// Save user points data
function saveUserPoints() {
    try {
        fs.writeFileSync(dataFile, JSON.stringify(userPoints, null, 2));
    } catch (error) {
        console.error('Error saving user points data:', error);
    }
}

// Role configuration with point requirements
const roleConfig = {
    // Format: roleName: { points: requiredPoints, maxPoints: maxPoints, roleId: 'role_id' }
    'Disciple': { points: 0, maxPoints: 9, roleId: null },
    'Trainee': { points: 10, maxPoints: 19, roleId: null },
    'Pupil': { points: 20, roleId: null },
    'Skilled': { points: 200, roleId: null },
    'Apprentice': { points: 400, roleId: null },
    'Expert': { points: 750, roleId: null },
    'Warrior': { points: 1250, roleId: null },
    'Legendary Warrior': { points: 2000, roleId: null },
    'Master': { points: 3000, roleId: null },
    'Elder': { points: 5000, roleId: null }
};

// Other roles (not based on points)
const otherRoles = {
    'Grandmaster': { roleId: null },
    'Executive': { roleId: null },
    'Chosen Disciple': { roleId: null },
    'VIP': { roleId: null },
    'Shadow Ops': { roleId: null },
    'Hero': { roleId: null },
    'Granny': { roleId: null },
    'Tryouts': { roleId: null },
    'Unranked': { roleId: null }
};

// Function to get user's current role based on points
function getUserCurrentRole(points) {
    const roles = Object.entries(roleConfig).sort((a, b) => b[1].points - a[1].points);
    for (const [roleName, config] of roles) {
        if (points >= config.points) {
            return roleName;
        }
    }
    return 'Disciple'; // Default role
}

// Function to get next role and required points
function getNextRole(currentPoints) {
    const roles = Object.entries(roleConfig).sort((a, b) => a[1].points - b[1].points);
    for (const [roleName, config] of roles) {
        if (config.points > currentPoints) {
            return { roleName, points: config.points, remaining: config.points - currentPoints };
        }
    }
    return null; // Already at highest role
}

// Helper functions for permissions and role checking
function hasRole(member, roleName) {
    return member.roles.cache.some(role => role.name === roleName);
}

function hasMinimumRank(member, minRank) {
    const userPointsAmount = userPoints[member.id] || 0;
    const currentRole = getUserCurrentRole(userPointsAmount);
    
    const rankOrder = ['Disciple', 'Trainee', 'Pupil', 'Skilled', 'Apprentice', 'Expert', 'Warrior', 'Legendary Warrior', 'Master', 'Elder'];
    const currentIndex = rankOrder.indexOf(currentRole);
    const minIndex = rankOrder.indexOf(minRank);
    
    return currentIndex >= minIndex;
}

function isGrandmaster(member) {
    return hasRole(member, 'Elder') || member.permissions.has('Administrator');
}

function isMasterOrHigher(member) {
    return hasMinimumRank(member, 'Master') || isGrandmaster(member);
}

function isExpertOrHigher(member) {
    return hasMinimumRank(member, 'Expert') || isMasterOrHigher(member);
}

function isExecutiveOrHigher(member) {
    return hasRole(member, 'Executive') || hasRole(member, 'Grandmaster') || isGrandmaster(member);
}

function isExecutivePlus(member) {
    // Check if member has Executive role or Elder role (Executive+)
    return hasRole(member, 'Executive') || hasRole(member, 'Elder') || member.permissions.has('Administrator');
}

function canRequestApprentice(member) {
    // Grandmaster, Executive, Elder, Master, Legendary Warrior can request apprentices
    return hasRole(member, 'Elder') || 
           hasRole(member, 'Executive') || 
           hasRole(member, 'Master') || 
           hasRole(member, 'Legendary Warrior') ||
           member.permissions.has('Administrator');
}

function isShadowOps(member) {
    return hasRole(member, 'Shadow Ops') || member.permissions.has('Administrator');
}

// Function to generate unique IDs
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Function to record promotions
function recordPromotion(userId, fromRank, toRank) {
    promotions.push({
        userId,
        fromRank,
        toRank,
        promotedAt: new Date().toISOString()
    });
    
    // Keep only last 50 promotions
    if (promotions.length > 50) {
        promotions.splice(0, promotions.length - 50);
    }
    
    savePromotionData();
}

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Handle slash command interactions
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    try {
        if (commandName === 'ping') {
            await interaction.reply('Pong!');
        }

        else if (commandName === 'help') {
            const helpEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('ShadowBot Help')
                .setDescription('Available slash commands:')
                .addFields(
                    { name: '🔧 Basic Commands', value: '/ping\n/help\n/serverinfo\n/links', inline: true },
                    { name: '📊 Points & Roles', value: '/points\n/update\n/roles\n/raidpoints\n/promotions', inline: true },
                    { name: '⚔️ Combat System', value: '/challenge\n/accept\n/decline\n/deny\n/challengestats\n/challengeleaderboard', inline: true },
                    { name: '🎯 Bounty System', value: '/bountyrequest', inline: true },
                    { name: '👑 VIP System', value: '/viplist\n/vipchallenge', inline: true },
                    { name: '📝 Apprentice System', value: '/apprenticerequest', inline: true },
                    { name: '🤝 Alliance System', value: '/setalliance\n/alliances\n/deletealliance', inline: true },
                    { name: '📊 Polls & Giveaways', value: '/pollcreate\n/giveaway', inline: true },
                    { name: '👑 Leadership', value: '/leaders', inline: true },
                    { name: '🎵 Music', value: '/play', inline: true },
                    { name: '💰 Coin Economy', value: '/flip\n/rob\n/giftcoins', inline: true },
                    { name: '🛠️ Admin Commands', value: '/assigndivision\n/assignrole\n/promote\n/deleteall\n/deletelast10\n/ban\n/kick', inline: true },
                    { name: '📋 Mission System', value: '/sendmission\n/cancelmission', inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'ShadowBot' });

            await interaction.reply({ embeds: [helpEmbed] });
        }

        else if (commandName === 'serverinfo') {
            const serverEmbed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('Server Information')
                .addFields(
                    { name: 'Server Name', value: interaction.guild.name, inline: true },
                    { name: 'Member Count', value: interaction.guild.memberCount.toString(), inline: true },
                    { name: 'Server ID', value: interaction.guild.id, inline: true },
                    { name: 'Created At', value: interaction.guild.createdAt.toDateString(), inline: true },
                    { name: 'Owner', value: `<@${interaction.guild.ownerId}>`, inline: true }
                )
                .setThumbnail(interaction.guild.iconURL())
                .setTimestamp()
                .setFooter({ text: 'ShadowBot' });

            await interaction.reply({ embeds: [serverEmbed] });
        }

        else if (commandName === 'points') {
            // Get target user (optional parameter or command user)
            const targetUser = interaction.options.getUser('user') || interaction.user;
            const userId = targetUser.id;
            const userPointsAmount = userPoints[userId] || 0;
            const userRaidPoints = raidPoints[userId] || 0;
            const userCoins = coins[userId] || 0;
            const currentRole = getUserCurrentRole(userPointsAmount);
            const nextRole = getNextRole(userPointsAmount);

            const pointsEmbed = new EmbedBuilder()
                .setColor(0xFFD700)
                .setTitle(`${targetUser.username}'s Points`)
                .setThumbnail(targetUser.displayAvatarURL())
                .addFields(
                    { name: 'Rank Points', value: userPointsAmount.toString(), inline: true },
                    { name: 'Raid Points', value: userRaidPoints.toString(), inline: true },
                    { name: '💰 Coins', value: userCoins.toString(), inline: true },
                    { name: 'Current Role', value: currentRole, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'ShadowBot' });

            if (nextRole) {
                // Ranks that should show "Check Notion Page" instead of points
                const notionPageRanks = ['Skilled', 'Apprentice', 'Expert', 'Warrior', 'Legendary Warrior', 'Master', 'Elder'];
                const nextRoleText = notionPageRanks.includes(nextRole.roleName)
                    ? `${nextRole.roleName}\nCheck Notion Page`
                    : `${nextRole.roleName} (${nextRole.remaining} points needed)`;
                
                pointsEmbed.addFields({ 
                    name: 'Next Role', 
                    value: nextRoleText, 
                    inline: true 
                });
            } else {
                pointsEmbed.addFields({ 
                    name: 'Status', 
                    value: '🏆 Maximum rank achieved!', 
                    inline: true 
                });
            }

            await interaction.reply({ embeds: [pointsEmbed] });
        }

        else if (commandName === 'update') {
            const userId = interaction.user.id;
            let userPointsAmount = userPoints[userId] || 0;
            let currentRole = getUserCurrentRole(userPointsAmount);
            
            try {
                const member = interaction.member;
                if (!member) {
                    await interaction.reply('❌ Could not find your member information.');
                    return;
                }

                // Check if user is at max points and can be promoted
                const roleConfigEntry = roleConfig[currentRole];
                if (roleConfigEntry && roleConfigEntry.maxPoints && userPointsAmount >= roleConfigEntry.maxPoints) {
                    const nextRoleInfo = getNextRole(userPointsAmount);
                    if (nextRoleInfo) {
                        // Promote to next role and set points to minimum for that role
                        currentRole = nextRoleInfo.roleName;
                        userPointsAmount = nextRoleInfo.points;
                        userPoints[userId] = userPointsAmount;
                        saveUserPoints();
                    }
                }

                // Find the role by name
                const targetRole = interaction.guild.roles.cache.find(role => 
                    role.name === currentRole
                );

                if (!targetRole) {
                    await interaction.reply(`❌ Role "${currentRole}" not found. Please contact an administrator to set up roles.`);
                    return;
                }

                // Remove all ranking roles first
                const rankingRoles = Object.keys(roleConfig);
                for (const roleName of rankingRoles) {
                    const roleToRemove = interaction.guild.roles.cache.find(role => role.name === roleName);
                    if (roleToRemove && member.roles.cache.has(roleToRemove.id)) {
                        await member.roles.remove(roleToRemove);
                    }
                }

                // Check if this is a promotion
                const oldRole = member.roles.cache.find(role => Object.keys(roleConfig).includes(role.name));
                const oldRoleName = oldRole ? oldRole.name : 'None';
                
                // Add the new role
                await member.roles.add(targetRole);

                // Record promotion if it's a new role
                if (oldRoleName !== currentRole) {
                    recordPromotion(userId, oldRoleName, currentRole);
                }

                const updateEmbed = new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setTitle('✅ Role Updated!')
                    .setDescription(`Your role has been updated to **${currentRole}**`)
                    .addFields(
                        { name: 'Current Points', value: userPointsAmount.toString(), inline: true },
                        { name: 'New Role', value: currentRole, inline: true }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'ShadowBot' });

                await interaction.reply({ embeds: [updateEmbed] });

            } catch (error) {
                console.error('Error updating role:', error);
                await interaction.reply('❌ An error occurred while updating your role. Please try again later.');
            }
        }

        else if (commandName === 'addpoints') {
            // Check if user has admin permissions
            if (!interaction.member.permissions.has('Administrator')) {
                await interaction.reply('❌ You need administrator permissions to use this command.');
                return;
            }

            const targetUser = interaction.options.getUser('user');
            const pointsToAdd = interaction.options.getInteger('amount');

            const userId = targetUser.id;
            const currentPoints = userPoints[userId] || 0;
            const currentRole = getUserCurrentRole(currentPoints);
            
            // Check if current role has a max points limit
            const roleConfigEntry = roleConfig[currentRole];
            if (roleConfigEntry && roleConfigEntry.maxPoints) {
                const maxPoints = roleConfigEntry.maxPoints;
                let newPoints = currentPoints + pointsToAdd;
                
                // Cap at max points
                if (newPoints > maxPoints) {
                    newPoints = maxPoints;
                }
                
                userPoints[userId] = newPoints;
                
                // Check if at max and can auto-update
                if (newPoints >= maxPoints) {
                    const nextRoleInfo = getNextRole(newPoints);
                    if (nextRoleInfo) {
                        // Auto-update to next role and set points to minimum for that role
                        const member = interaction.guild.members.cache.get(userId);
                        if (member) {
                            const oldRole = interaction.guild.roles.cache.find(r => r.name === currentRole);
                            const newRole = interaction.guild.roles.cache.find(r => r.name === nextRoleInfo.roleName);
                            
                            if (oldRole && member.roles.cache.has(oldRole.id)) {
                                await member.roles.remove(oldRole);
                            }
                            
                            if (newRole) {
                                await member.roles.add(newRole);
                                // Set points to minimum for next role
                                userPoints[userId] = nextRoleInfo.points;
                                recordPromotion(userId, currentRole, nextRoleInfo.roleName);
                            }
                        }
                        
                        const addPointsEmbed = new EmbedBuilder()
                            .setColor(0x00FF00)
                            .setTitle('✅ Points Added & Role Auto-Updated!')
                            .addFields(
                                { name: 'User', value: targetUser.username, inline: true },
                                { name: 'Points Added', value: pointsToAdd.toString(), inline: true },
                                { name: 'New Points', value: nextRoleInfo.points.toString(), inline: true },
                                { name: 'Previous Role', value: currentRole, inline: true },
                                { name: 'New Role', value: nextRoleInfo.roleName, inline: true },
                                { name: 'Status', value: 'Auto-promoted at max points!', inline: false }
                            )
                            .setTimestamp()
                            .setFooter({ text: 'ShadowBot' });

                        await interaction.reply({ embeds: [addPointsEmbed] });
                        saveUserPoints();
                        return;
                    }
                }
                
                // At max but not enough for next rank
                if (newPoints >= maxPoints) {
                    const addPointsEmbed = new EmbedBuilder()
                        .setColor(0xFFA500)
                        .setTitle('⚠️ Points Capped!')
                        .addFields(
                            { name: 'User', value: targetUser.username, inline: true },
                            { name: 'Points Added', value: pointsToAdd.toString(), inline: true },
                            { name: 'Capped At', value: `${maxPoints} (Max for ${currentRole})`, inline: true },
                            { name: 'Action Required', value: `Use /update to promote to next rank`, inline: false }
                        )
                        .setTimestamp()
                        .setFooter({ text: 'ShadowBot' });

                    await interaction.reply({ embeds: [addPointsEmbed] });
                    saveUserPoints();
                    return;
                }
            }
            
            userPoints[userId] = (userPoints[userId] || 0) + pointsToAdd;
            saveUserPoints();

            const addPointsEmbed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('✅ Points Added!')
                .addFields(
                    { name: 'User', value: targetUser.username, inline: true },
                    { name: 'Points Added', value: pointsToAdd.toString(), inline: true },
                    { name: 'Total Points', value: userPoints[userId].toString(), inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'ShadowBot' });

            await interaction.reply({ embeds: [addPointsEmbed] });
        }

        else if (commandName === 'roles') {
            const rolesEmbed = new EmbedBuilder()
                .setColor(0x9932CC)
                .setTitle('🏆 Clan Ranks & Requirements')
                .setDescription('Here are all the available clan ranks and their requirements:')
                .setTimestamp()
                .setFooter({ text: 'ShadowBot' });

            const sortedRoles = Object.entries(roleConfig).sort((a, b) => a[1].points - b[1].points);
            
            // Ranks that should show "Check Notion Page" instead of points
            const notionPageRanks = ['Skilled', 'Apprentice', 'Expert', 'Warrior', 'Legendary Warrior', 'Master', 'Elder'];
            
            for (const [roleName, config] of sortedRoles) {
                const emoji = roleName === 'Elder' ? '👑' : 
                             roleName === 'Master' ? '⭐' : 
                             roleName === 'Legendary Warrior' ? '⚔️' : 
                             roleName === 'Warrior' ? '🛡️' : 
                             roleName === 'Expert' ? '🎯' : 
                             roleName === 'Apprentice' ? '📚' : 
                             roleName === 'Skilled' ? '💪' : 
                             roleName === 'Pupil' ? '🌱' : 
                             roleName === 'Trainee' ? '🔰' : '👤';
                
                // Show "Check Notion Page" for Skilled through Elder, points for others
                const requirementText = notionPageRanks.includes(roleName) 
                    ? 'Check Notion Page' 
                    : `${config.points} points`;
                
                rolesEmbed.addFields({ 
                    name: `${emoji} ${roleName}`, 
                    value: requirementText, 
                    inline: true 
                });
            }

            // Add other roles section
            rolesEmbed.addFields({ name: 'Other Roles', value: 'These roles are assigned by leadership:', inline: false });
            
            const otherRolesList = Object.keys(otherRoles).join('\n');
            rolesEmbed.addFields({ name: 'Special Roles', value: otherRolesList, inline: true });

            await interaction.reply({ embeds: [rolesEmbed] });
        }

        else if (commandName === 'verify') {
            const username = interaction.options.getString('username');
            const userId = interaction.user.id;

            await interaction.deferReply({ ephemeral: true });

            try {
                const robloxUser = await getRobloxUserInfo(username);
                
                if (!robloxUser) {
                    await interaction.editReply('❌ Could not find a Roblox user with that username.');
                    return;
                }

                // Check if this Roblox account is already linked to someone else
                for (const [discordId, data] of Object.entries(robloxUsers)) {
                    if (data.robloxId === robloxUser.id && discordId !== userId) {
                        await interaction.editReply('❌ This Roblox account is already linked to another Discord user.');
                        return;
                    }
                }

                // Link the accounts
                robloxUsers[userId] = {
                    robloxId: robloxUser.id,
                    robloxUsername: robloxUser.name,
                    robloxDisplayName: robloxUser.displayName,
                    verifiedAt: new Date().toISOString()
                };
                saveRobloxUsers();

                const verifyEmbed = new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setTitle('✅ Account Linked Successfully!')
                    .setDescription(`Your Discord account has been linked to **${robloxUser.displayName}** (@${robloxUser.name})`)
                    .addFields(
                        { name: 'Roblox ID', value: robloxUser.id.toString(), inline: true },
                        { name: 'Username', value: robloxUser.name, inline: true },
                        { name: 'Display Name', value: robloxUser.displayName, inline: true }
                    )
                    .setThumbnail(`https://www.roblox.com/headshot-thumbnail/image?userId=${robloxUser.id}&width=150&height=150&format=png`)
                    .setTimestamp()
                    .setFooter({ text: 'ShadowBot' });

                await interaction.editReply({ embeds: [verifyEmbed] });

            } catch (error) {
                console.error('Error verifying Roblox account:', error);
                await interaction.editReply('❌ An error occurred while verifying your Roblox account. Please try again later.');
            }
        }

        else if (commandName === 'unverify') {
            const userId = interaction.user.id;

            if (!robloxUsers[userId]) {
                await interaction.reply({ content: '❌ You don\'t have a linked Roblox account.', ephemeral: true });
                return;
            }

            const robloxData = robloxUsers[userId];
            delete robloxUsers[userId];
            saveRobloxUsers();

            const unverifyEmbed = new EmbedBuilder()
                .setColor(0xFF6B6B)
                .setTitle('🔓 Account Unlinked')
                .setDescription(`Your Discord account has been unlinked from **${robloxData.robloxDisplayName}** (@${robloxData.robloxUsername})`)
                .setTimestamp()
                .setFooter({ text: 'ShadowBot' });

            await interaction.reply({ embeds: [unverifyEmbed], ephemeral: true });
        }

        else if (commandName === 'profile') {
            const userId = interaction.user.id;
            const userPointsAmount = userPoints[userId] || 0;
            const currentRole = getUserCurrentRole(userPointsAmount);

            if (!robloxUsers[userId]) {
                await interaction.reply({ content: '❌ You don\'t have a linked Roblox account. Use `/verify` to link your account.', ephemeral: true });
                return;
            }

            const robloxData = robloxUsers[userId];
            const nextRole = getNextRole(userPointsAmount);

            const profileEmbed = new EmbedBuilder()
                .setColor(0x00A2FF)
                .setTitle(`${interaction.user.username}'s Profile`)
                .setDescription(`Linked to **${robloxData.robloxDisplayName}** (@${robloxData.robloxUsername})`)
                .addFields(
                    { name: 'Current Points', value: userPointsAmount.toString(), inline: true },
                    { name: 'Current Role', value: currentRole, inline: true },
                    { name: 'Roblox ID', value: robloxData.robloxId.toString(), inline: true }
                )
                .setThumbnail(`https://www.roblox.com/headshot-thumbnail/image?userId=${robloxData.robloxId}&width=150&height=150&format=png`)
                .setTimestamp()
                .setFooter({ text: 'ShadowBot' });

            if (nextRole) {
                // Ranks that should show "Check Notion Page" instead of points
                const notionPageRanks = ['Skilled', 'Apprentice', 'Expert', 'Warrior', 'Legendary Warrior', 'Master', 'Elder'];
                const nextRoleText = notionPageRanks.includes(nextRole.roleName)
                    ? `${nextRole.roleName}\nCheck Notion Page`
                    : `${nextRole.roleName} (${nextRole.remaining} points needed)`;
                
                profileEmbed.addFields({ 
                    name: 'Next Role', 
                    value: nextRoleText, 
                    inline: true 
                });
            } else {
                profileEmbed.addFields({ 
                    name: 'Status', 
                    value: '🏆 Maximum rank achieved!', 
                    inline: true 
                });
            }

            await interaction.reply({ embeds: [profileEmbed] });
        }

        else if (commandName === 'challenge') {
            const targetUser = interaction.options.getUser('player');
            const rounds = interaction.options.getInteger('rounds') || 3;
            const challengerId = interaction.user.id;
            const targetId = targetUser.id;

            // Check if challenging self
            if (challengerId === targetId) {
                await interaction.reply({ content: '❌ You cannot challenge yourself!', ephemeral: true });
                return;
            }

            // Check cooldown
            if (isOnCooldown(challengerId)) {
                await interaction.reply({ content: '❌ You are on cooldown! Please wait before challenging again.', ephemeral: true });
                return;
            }

            // Check if target user already has a pending challenge
            for (const [challengeId, challenge] of Object.entries(challenges)) {
                if (challenge.status === 'pending' && (challenge.challengerId === targetId || challenge.targetId === targetId)) {
                    await interaction.reply({ content: '❌ This player already has a pending challenge!', ephemeral: true });
                    return;
                }
            }

            // Create challenge
            const challengeId = generateChallengeId();
            challenges[challengeId] = {
                challengerId,
                targetId,
                challengerName: interaction.user.username,
                targetName: targetUser.username,
                rounds,
                status: 'pending',
                createdAt: new Date().toISOString()
            };
            saveChallengeData();

            const challengeEmbed = new EmbedBuilder()
                .setColor(0xFF6B35)
                .setTitle('⚔️ Challenge Issued!')
                .setDescription(`${interaction.user.username} has challenged ${targetUser.username} to a fight!`)
                .addFields(
                    { name: 'Rounds', value: rounds.toString(), inline: true },
                    { name: 'Status', value: 'Pending', inline: true },
                    { name: 'Challenge ID', value: challengeId, inline: true }
                )
                .setFooter({ text: `${targetUser.username} can use /accept or /decline to respond` })
                .setTimestamp();

            await interaction.reply({ embeds: [challengeEmbed] });
        }

        else if (commandName === 'accept') {
            const userId = interaction.user.id;
            let challengeToAccept = null;
            let challengeId = null;

            // Find pending challenge for this user
            for (const [id, challenge] of Object.entries(challenges)) {
                if (challenge.status === 'pending' && challenge.targetId === userId) {
                    challengeToAccept = challenge;
                    challengeId = id;
                    break;
                }
            }

            if (!challengeToAccept) {
                await interaction.reply({ content: '❌ You don\'t have any pending challenges!', ephemeral: true });
                return;
            }

            // Update challenge status
            challenges[challengeId].status = 'accepted';
            challenges[challengeId].acceptedAt = new Date().toISOString();
            saveChallengeData();

            // Simulate the fight
            const fightResult = simulateFight(challengeToAccept.rounds);
            
            // Award points based on result
            let winnerId, loserId, winnerName, loserName;
            let pointsAwarded = 0;

            if (fightResult.winner === 'player1') {
                winnerId = challengeToAccept.challengerId;
                loserId = challengeToAccept.targetId;
                winnerName = challengeToAccept.challengerName;
                loserName = challengeToAccept.targetName;
                pointsAwarded = 25; // Winner gets 25 points
            } else if (fightResult.winner === 'player2') {
                winnerId = challengeToAccept.targetId;
                loserId = challengeToAccept.challengerId;
                winnerName = challengeToAccept.targetName;
                loserName = challengeToAccept.challengerName;
                pointsAwarded = 25; // Winner gets 25 points
            }

            // Update stats and points
            if (fightResult.winner !== 'draw') {
                updateChallengeStats(winnerId, loserId);
                userPoints[winnerId] = (userPoints[winnerId] || 0) + pointsAwarded;
                userPoints[loserId] = (userPoints[loserId] || 0) + 5; // Loser gets 5 points
                saveUserPoints();
            } else {
                updateDrawStats(challengeToAccept.challengerId, challengeToAccept.targetId);
                userPoints[challengeToAccept.challengerId] = (userPoints[challengeToAccept.challengerId] || 0) + 10;
                userPoints[challengeToAccept.targetId] = (userPoints[challengeToAccept.targetId] || 0) + 10;
                saveUserPoints();
            }

            // Set cooldown for challenger
            setCooldown(challengeToAccept.challengerId);

            // Create fight result embed
            const resultEmbed = new EmbedBuilder()
                .setColor(fightResult.winner === 'draw' ? 0xFFD700 : 0x00FF00)
                .setTitle('⚔️ Fight Results!')
                .setDescription(fightResult.winner === 'draw' ? 
                    `**It's a draw!** Both fighters put up an amazing fight!` :
                    `**${winnerName}** wins the fight!`)
                .addFields(
                    { name: 'Rounds', value: challengeToAccept.rounds.toString(), inline: true },
                    { name: 'Winner Rounds', value: fightResult.winner === 'draw' ? 'Tie' : 
                        (fightResult.winner === 'player1' ? fightResult.player1Wins : fightResult.player2Wins).toString(), inline: true },
                    { name: 'Loser Rounds', value: fightResult.winner === 'draw' ? 'Tie' : 
                        (fightResult.winner === 'player1' ? fightResult.player2Wins : fightResult.player1Wins).toString(), inline: true }
                )
                .setTimestamp();

            if (fightResult.winner !== 'draw') {
                resultEmbed.addFields(
                    { name: 'Winner Points', value: `+${pointsAwarded}`, inline: true },
                    { name: 'Loser Points', value: '+5', inline: true },
                    { name: 'Winner Total', value: userPoints[winnerId].toString(), inline: true }
                );
            } else {
                resultEmbed.addFields(
                    { name: 'Both Players Points', value: '+10 each', inline: true }
                );
            }

            // Add round-by-round results
            let roundResults = '';
            fightResult.results.forEach(round => {
                const emoji = round.winner === 'player1' ? '🥊' : round.winner === 'player2' ? '👊' : '🤝';
                roundResults += `${emoji} Round ${round.round}: ${round.winner === 'player1' ? challengeToAccept.challengerName : 
                    round.winner === 'player2' ? challengeToAccept.targetName : 'Draw'}\n`;
            });
            
            resultEmbed.addFields({ name: 'Round Results', value: roundResults, inline: false });

            await interaction.reply({ embeds: [resultEmbed] });

            // Clean up challenge
            delete challenges[challengeId];
            saveChallengeData();
        }

        else if (commandName === 'decline') {
            const userId = interaction.user.id;
            let challengeToDecline = null;
            let challengeId = null;

            // Find pending challenge for this user
            for (const [id, challenge] of Object.entries(challenges)) {
                if (challenge.status === 'pending' && challenge.targetId === userId) {
                    challengeToDecline = challenge;
                    challengeId = id;
                    break;
                }
            }

            if (!challengeToDecline) {
                await interaction.reply({ content: '❌ You don\'t have any pending challenges!', ephemeral: true });
                return;
            }

            // Update challenge status
            challenges[challengeId].status = 'declined';
            challenges[challengeId].declinedAt = new Date().toISOString();
            saveChallengeData();

            const declineEmbed = new EmbedBuilder()
                .setColor(0xFF6B6B)
                .setTitle('❌ Challenge Declined')
                .setDescription(`${interaction.user.username} has declined the challenge from ${challengeToDecline.challengerName}`)
                .setTimestamp();

            await interaction.reply({ embeds: [declineEmbed] });

            // Clean up challenge
            delete challenges[challengeId];
            saveChallengeData();
        }

        else if (commandName === 'deny') {
            const userId = interaction.user.id;
            let challengeToDeny = null;
            let challengeId = null;

            // Find pending challenge for this user
            for (const [id, challenge] of Object.entries(challenges)) {
                if (challenge.status === 'pending' && challenge.targetId === userId) {
                    challengeToDeny = challenge;
                    challengeId = id;
                    break;
                }
            }

            if (!challengeToDeny) {
                await interaction.reply({ content: '❌ You don\'t have any pending challenges!', ephemeral: true });
                return;
            }

            // Update challenge status
            challenges[challengeId].status = 'declined';
            challenges[challengeId].declinedAt = new Date().toISOString();
            saveChallengeData();

            const denyEmbed = new EmbedBuilder()
                .setColor(0xFF6B6B)
                .setTitle('❌ Challenge Denied')
                .setDescription(`${interaction.user.username} has denied the challenge from ${challengeToDeny.challengerName}`)
                .setTimestamp();

            await interaction.reply({ embeds: [denyEmbed] });

            // Clean up challenge
            delete challenges[challengeId];
            saveChallengeData();
        }

        else if (commandName === 'challengestats') {
            const userId = interaction.user.id;
            initializeUserStats(userId);
            const stats = challengeStats[userId];

            const winRate = stats.totalChallenges > 0 ? ((stats.wins / stats.totalChallenges) * 100).toFixed(1) : 0;

            const statsEmbed = new EmbedBuilder()
                .setColor(0x4B0082)
                .setTitle(`${interaction.user.username}'s Challenge Statistics`)
                .addFields(
                    { name: 'Wins', value: stats.wins.toString(), inline: true },
                    { name: 'Losses', value: stats.losses.toString(), inline: true },
                    { name: 'Draws', value: stats.draws.toString(), inline: true },
                    { name: 'Total Challenges', value: stats.totalChallenges.toString(), inline: true },
                    { name: 'Win Rate', value: `${winRate}%`, inline: true },
                    { name: 'Current Streak', value: stats.winStreak.toString(), inline: true },
                    { name: 'Best Streak', value: stats.bestWinStreak.toString(), inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'ShadowBot' });

            await interaction.reply({ embeds: [statsEmbed] });
        }

        else if (commandName === 'challengeleaderboard') {
            const sortedStats = Object.entries(challengeStats)
                .sort((a, b) => b[1].wins - a[1].wins)
                .slice(0, 10);

            if (sortedStats.length === 0) {
                await interaction.reply({ content: '❌ No challenge statistics available yet!', ephemeral: true });
                return;
            }

            const leaderboardEmbed = new EmbedBuilder()
                .setColor(0xFFD700)
                .setTitle('🏆 Challenge Leaderboard')
                .setDescription('Top 10 fighters by wins')
                .setTimestamp()
                .setFooter({ text: 'ShadowBot' });

            let leaderboardText = '';
            for (let i = 0; i < sortedStats.length; i++) {
                const [userId, stats] = sortedStats[i];
                const user = await client.users.fetch(userId).catch(() => ({ username: 'Unknown User' }));
                const position = i + 1;
                const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : '🔸';
                
                leaderboardText += `${medal} **${position}.** ${user.username} - ${stats.wins} wins (${stats.totalChallenges} total)\n`;
            }

            leaderboardEmbed.addFields({ name: 'Rankings', value: leaderboardText, inline: false });

            await interaction.reply({ embeds: [leaderboardEmbed] });
        }

        // Bounty system commands
        else if (commandName === 'bountyrequest') {
            const title = interaction.options.getString('targetdisplayname');
            const description = interaction.options.getString('reason');
            const userId = interaction.user.id;

            const bountyId = generateId();
            bounties[bountyId] = {
                id: bountyId,
                title,
                description,
                requester: userId,
                requesterName: interaction.user.username,
                status: 'pending',
                createdAt: new Date().toISOString(),
                acceptedBy: null,
                acceptedAt: null,
                messageId: null
            };
            
            // Send confirmation to user
            const confirmEmbed = new EmbedBuilder()
                .setColor(0xFF6B35)
                .setTitle('🎯 Bounty Request Submitted')
                .setDescription('Your bounty request has been sent for approval.')
                .setTimestamp();

            await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });

            // Send to bounty-board channel with buttons (for approval)
            const bountyBoardChannelId = config.BOUNTY_BOARD_CHANNEL_ID || config.NOTIFICATION_CHANNEL_ID;
            if (bountyBoardChannelId && bountyBoardChannelId !== 'your_channel_id_here') {
                const bountyBoardChannel = client.channels.cache.get(bountyBoardChannelId);
                if (bountyBoardChannel) {
                    const approvalEmbed = new EmbedBuilder()
                        .setColor(0xFF6B35)
                        .setTitle('🎯 Bounty Request - Pending Approval')
                        .setDescription(`**Target:** ${title}`)
                        .addFields(
                            { name: 'Reason', value: description, inline: false },
                            { name: 'Requester', value: `<@${userId}> (${interaction.user.username})`, inline: true },
                            { name: 'Bounty ID', value: bountyId, inline: false }
                        )
                        .setFooter({ text: 'Approve or reject this bounty request' })
                        .setTimestamp();

                    const approveButton = new ButtonBuilder()
                        .setCustomId(`bounty_approve_${bountyId}`)
                        .setLabel('✅ Approve')
                        .setStyle(ButtonStyle.Success);

                    const rejectButton = new ButtonBuilder()
                        .setCustomId(`bounty_reject_${bountyId}`)
                        .setLabel('❌ Reject')
                        .setStyle(ButtonStyle.Danger);

                    const row = new ActionRowBuilder()
                        .addComponents(approveButton, rejectButton);

                    const approvalMessage = await bountyBoardChannel.send({ 
                        embeds: [approvalEmbed], 
                        components: [row] 
                    });

                    // Save message ID to bounty data
                    bounties[bountyId].messageId = approvalMessage.id;
                    saveBountyData();
                } else {
                    console.error('Bounty board channel not found');
                }
            } else {
                console.error('BOUNTY_BOARD_CHANNEL_ID not configured');
            }
        }

        // Poll system
        else if (commandName === 'pollcreate') {
            if (!isExecutiveOrHigher(interaction.member)) {
                await interaction.reply({ content: '❌ Only Executives and Grandmasters can create polls!', ephemeral: true });
                return;
            }

            const question = interaction.options.getString('question');
            const optionsString = interaction.options.getString('options');
            const options = optionsString.split(';').map(opt => opt.trim()).filter(opt => opt.length > 0);

            if (options.length < 2) {
                await interaction.reply({ content: '❌ You need at least 2 options for a poll!', ephemeral: true });
                return;
            }

            if (options.length > 10) {
                await interaction.reply({ content: '❌ Maximum 10 options allowed for a poll!', ephemeral: true });
                return;
            }

            // Defer reply to prevent timeout
            await interaction.deferReply();

            try {
                const pollEmbed = new EmbedBuilder()
                    .setColor(0x9C27B0)
                    .setTitle('📊 Poll')
                    .setDescription(`**${question}**`)
                    .setTimestamp()
                    .setFooter({ text: `Poll created by ${interaction.user.username}` });

                let optionsText = '';
                const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
                
                for (let i = 0; i < options.length; i++) {
                    optionsText += `${emojis[i]} ${options[i]}\n`;
                }

                pollEmbed.addFields({ name: 'Options', value: optionsText, inline: false });

                const pollMessage = await interaction.editReply({ embeds: [pollEmbed] });
                
                // Add reactions (this can take time but won't timeout since we already responded)
                for (let i = 0; i < options.length; i++) {
                    try {
                        await pollMessage.react(emojis[i]);
                    } catch (reactError) {
                        console.error(`Error adding reaction ${emojis[i]}:`, reactError);
                        // Continue with other reactions even if one fails
                    }
                }
            } catch (error) {
                console.error('Error creating poll:', error);
                try {
                    await interaction.editReply({ 
                        content: `❌ An error occurred while creating the poll!\n\nError: ${error.message}`
                    });
                } catch (editError) {
                    await interaction.followUp({ 
                        content: `❌ An error occurred while creating the poll!\n\nError: ${error.message}`,
                        ephemeral: true
                    });
                }
            }
        }

        // VIP system
        else if (commandName === 'viplist') {
            // Find VIP role in the guild
            const vipRole = interaction.guild.roles.cache.find(role => role.name === 'VIP');
            
            let vipText = '';
            let vipCount = 0;
            
            // Get VIPs from stored data
            const storedVips = Object.entries(vipMembers).filter(([userId, data]) => data.isActive);
            
            // If VIP role exists, get all members with that role
            if (vipRole) {
                const vipRoleMembers = interaction.guild.members.cache.filter(member => 
                    member.roles.cache.has(vipRole.id)
                );
                
                for (const member of vipRoleMembers.values()) {
                    // Check if already in stored VIPs
                    const storedData = vipMembers[member.id];
                    const reason = storedData?.reason || 'VIP Member';
                    
                    vipText += `👑 **${member.user.username}** - ${reason}\n`;
                    vipCount++;
                    
                    // Auto-add to VIP data if not already stored
                    if (!storedData) {
                        vipMembers[member.id] = {
                            userId: member.id,
                            username: member.user.username,
                            isActive: true,
                            reason: 'VIP Member',
                            addedAt: new Date().toISOString()
                        };
                    }
                }
                
                // Add stored VIPs that might not have the role anymore but are still in database
                for (const [userId, data] of storedVips) {
                    if (!vipRoleMembers.has(userId)) {
                        const user = await client.users.fetch(userId).catch(() => null);
                        if (user) {
                            vipText += `👑 **${user.username}** - ${data.reason || 'VIP Member'} (Inactive)\n`;
                            vipCount++;
                        }
                    }
                }
                
                // Save VIP data if we added any
                if (vipCount > 0) {
                    saveVipData();
                }
            } else {
                // Fallback to stored VIPs if role doesn't exist
                if (storedVips.length === 0) {
                    await interaction.reply({ content: '❌ No VIPs found! (VIP role may not exist on this server)', ephemeral: true });
                    return;
                }
                
                for (const [userId, data] of storedVips) {
                    const user = await client.users.fetch(userId).catch(() => ({ username: 'Unknown User' }));
                    vipText += `👑 **${user.username}** - ${data.reason || 'VIP Member'}\n`;
                    vipCount++;
                }
            }
            
            if (vipCount === 0) {
                await interaction.reply({ content: '❌ No VIPs currently active!', ephemeral: true });
                return;
            }

            const vipEmbed = new EmbedBuilder()
                .setColor(0xFFD700)
                .setTitle('👑 Current VIPs')
                .setDescription(`List of all active VIP members (${vipCount} total)`)
                .setTimestamp()
                .setFooter({ text: 'ShadowBot' });

            vipEmbed.addFields({ name: 'VIP Members', value: vipText, inline: false });
            await interaction.reply({ embeds: [vipEmbed] });
        }

        else if (commandName === 'vipchallenge') {
            if (!isExpertOrHigher(interaction.member)) {
                await interaction.reply({ content: '❌ You need to be Expert rank or higher to challenge VIPs!', ephemeral: true });
                return;
            }

            const vipUser = interaction.options.getUser('vip');
            const vipData = vipMembers[vipUser.id];

            if (!vipData || !vipData.isActive) {
                await interaction.reply({ content: '❌ This user is not a VIP!', ephemeral: true });
                return;
            }

            // Check if VIP is already in a challenge
            for (const [challengeId, challenge] of Object.entries(challenges)) {
                if (challenge.status === 'pending' && (challenge.challengerId === vipUser.id || challenge.targetId === vipUser.id)) {
                    await interaction.reply({ content: '❌ This VIP already has a pending challenge!', ephemeral: true });
                    return;
                }
            }

            // Create VIP challenge
            const challengeId = generateChallengeId();
            challenges[challengeId] = {
                challengerId: interaction.user.id,
                targetId: vipUser.id,
                challengerName: interaction.user.username,
                targetName: vipUser.username,
                rounds: 3,
                status: 'pending',
                createdAt: new Date().toISOString(),
                isVipChallenge: true
            };
            saveChallengeData();

            const vipChallengeEmbed = new EmbedBuilder()
                .setColor(0xFFD700)
                .setTitle('👑 VIP Challenge Issued!')
                .setDescription(`${interaction.user.username} has challenged VIP **${vipUser.username}** to a fight!`)
                .addFields(
                    { name: 'Rounds', value: '3', inline: true },
                    { name: 'Status', value: 'Pending', inline: true },
                    { name: 'Challenge ID', value: challengeId, inline: true }
                )
                .setFooter({ text: `${vipUser.username} can use /accept or /decline to respond` })
                .setTimestamp();

            await interaction.reply({ embeds: [vipChallengeEmbed] });
        }

        // Raid points
        else if (commandName === 'raidpoints') {
            const userId = interaction.user.id;
            const userRaidPoints = raidPoints[userId] || 0;

            const raidPointsEmbed = new EmbedBuilder()
                .setColor(0x8B4513)
                .setTitle('⚔️ Raid Points')
                .setDescription(`${interaction.user.username}'s raid statistics`)
                .addFields(
                    { name: 'Current Raid Points', value: userRaidPoints.toString(), inline: true },
                    { name: 'Total Raids', value: '0', inline: true }, // This would be tracked separately
                    { name: 'Raid Level', value: 'Novice', inline: true } // This would be calculated based on points
                )
                .setTimestamp()
                .setFooter({ text: 'ShadowBot' });

            await interaction.reply({ embeds: [raidPointsEmbed] });
        }

        // Leaders
        else if (commandName === 'leaders') {
            const leadersEmbed = new EmbedBuilder()
                .setColor(0x9932CC)
                .setTitle('👑 Clan Leaders')
                .setDescription('Current leadership structure')
                .setTimestamp()
                .setFooter({ text: 'ShadowBot' });

            // This would be populated with actual leader data
            leadersEmbed.addFields(
                { name: 'Grandmaster', value: 'To be assigned', inline: true },
                // { name: 'Elders', value: 'To be assigned', inline: true },
                // { name: 'Masters', value: 'To be assigned', inline: true }
            );

            await interaction.reply({ embeds: [leadersEmbed] });
        }

        // Apprentice system
        else if (commandName === 'apprenticerequest') {
            if (!canRequestApprentice(interaction.member)) {
                await interaction.reply({ content: '❌ Only Grandmaster, Executive, Elder, Master, or Legendary Warrior can request apprentices!', ephemeral: true });
                return;
            }

            const displayName = interaction.options.getString('display_name');
            const rank = interaction.options.getString('rank');
            const request = interaction.options.getString('request');
            const requirements = interaction.options.getString('requirements');
            const userId = interaction.user.id;

            const requestId = generateId();
            apprenticeRequests[requestId] = {
                id: requestId,
                displayName,
                rank,
                request,
                requirements,
                requester: userId,
                requesterName: interaction.user.username,
                status: 'pending',
                createdAt: new Date().toISOString()
            };
            saveApprenticeData();

            const apprenticeEmbed = new EmbedBuilder()
                .setColor(0x4CAF50)
                .setTitle('📝 Apprentice Request Submitted')
                .setDescription(`**${displayName}** (${rank})`)
                .addFields(
                    { name: 'Request', value: request, inline: false },
                    { name: 'Requirements', value: requirements, inline: false },
                    { name: 'Requester', value: interaction.user.username, inline: true },
                    { name: 'Status', value: 'Pending Review', inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'This request will be reviewed by leadership' });

            await interaction.reply({ embeds: [apprenticeEmbed] });
        }

        // Alliance system
        else if (commandName === 'setalliance') {
            if (!isGrandmaster(interaction.member)) {
                await interaction.reply({ content: '❌ Only Grandmasters can set alliances!', ephemeral: true });
                return;
            }

            const clanName = interaction.options.getString('clan_name');
            const description = interaction.options.getString('description');
            const allianceId = generateId();

            alliances[allianceId] = {
                id: allianceId,
                clanName,
                description,
                createdBy: interaction.user.id,
                createdByName: interaction.user.username,
                createdAt: new Date().toISOString(),
                status: 'active'
            };
            saveAllianceData();

            const allianceEmbed = new EmbedBuilder()
                .setColor(0x2196F3)
                .setTitle('🤝 Alliance Established')
                // .setDescription(`Alliance with **${clanName}** has been created`)
                .addFields(
                    { name: 'Description', value: description, inline: false },
                    { name: 'Created By', value: interaction.user.username, inline: true },
                    { name: 'Status', value: 'Active', inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [allianceEmbed] });
        }

        else if (commandName === 'alliances') {
            const activeAlliances = Object.values(alliances).filter(alliance => alliance.status === 'active');
            
            if (activeAlliances.length === 0) {
                await interaction.reply({ content: '❌ No active alliances found!', ephemeral: true });
                return;
            }

            const alliancesEmbed = new EmbedBuilder()
                .setColor(0x2196F3)
                .setTitle('🤝 Alliance Clans')
                .setDescription('List of all allied clans')
                .setTimestamp()
                .setFooter({ text: 'ShadowBot' });

            let allianceText = '';
            for (const alliance of activeAlliances) {
                allianceText += `🤝 **${alliance.clanName}**\n${alliance.description}\n\n`;
            }

            alliancesEmbed.addFields({ name: 'Allied Clans', value: allianceText, inline: false });
            await interaction.reply({ embeds: [alliancesEmbed] });
        }

        else if (commandName === 'deletealliance') {
            if (!isGrandmaster(interaction.member)) {
                await interaction.reply({ content: '❌ Only Grandmasters can delete alliances!', ephemeral: true });
                return;
            }

            const clanName = interaction.options.getString('clan_name');
            
            // Find alliance by clan name
            let allianceToDelete = null;
            let allianceId = null;
            for (const [id, alliance] of Object.entries(alliances)) {
                if (alliance.clanName.toLowerCase() === clanName.toLowerCase() && alliance.status === 'active') {
                    allianceToDelete = alliance;
                    allianceId = id;
                    break;
                }
            }

            if (!allianceToDelete) {
                await interaction.reply({ content: `❌ No active alliance found with clan name "${clanName}"!`, ephemeral: true });
                return;
            }

            // Mark as deleted
            alliances[allianceId].status = 'deleted';
            alliances[allianceId].deletedAt = new Date().toISOString();
            alliances[allianceId].deletedBy = interaction.user.id;
            alliances[allianceId].deletedByName = interaction.user.username;
            saveAllianceData();

            const deleteEmbed = new EmbedBuilder()
                .setColor(0xFF6B6B)
                .setTitle('❌ Alliance Deleted')
                .setDescription(`Alliance with **${allianceToDelete.clanName}** has been deleted`)
                .addFields(
                    { name: 'Clan Name', value: allianceToDelete.clanName, inline: true },
                    { name: 'Deleted By', value: interaction.user.username, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [deleteEmbed] });
        }

        else if (commandName === 'promote') {
            if (!isGrandmaster(interaction.member)) {
                await interaction.reply({ content: '❌ Only Grandmasters can promote members!', ephemeral: true });
                return;
            }

            const targetUser = interaction.options.getUser('user');
            const rankName = interaction.options.getString('rank');

            await interaction.deferReply();

            try {
                const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
                if (!member) {
                    await interaction.editReply({ content: '❌ User not found in this server!' });
                    return;
                }

                // Check if rank exists in roleConfig or otherRoles
                const isRankRole = roleConfig.hasOwnProperty(rankName) || otherRoles.hasOwnProperty(rankName);
                if (!isRankRole) {
                    await interaction.editReply({ content: `❌ Rank "${rankName}" not found! Please use a valid rank name.` });
                    return;
                }

                // Find the role
                let role = interaction.guild.roles.cache.find(r => r.name === rankName);
                if (!role) {
                    await interaction.editReply({ content: `❌ Role "${rankName}" not found! Please create this role first.` });
                    return;
                }

                // Get current role based on points
                const currentPoints = userPoints[targetUser.id] || 0;
                const currentRole = getUserCurrentRole(currentPoints);
                const oldRole = interaction.guild.roles.cache.find(r => r.name === currentRole);

                // Remove old role if it exists and is different
                if (oldRole && oldRole.id !== role.id && member.roles.cache.has(oldRole.id)) {
                    await member.roles.remove(oldRole);
                }

                // Add new role
                await member.roles.add(role);

                // Record promotion
                recordPromotion(targetUser.id, currentRole, rankName);

                const promoteEmbed = new EmbedBuilder()
                    .setColor(0x4CAF50)
                    .setTitle('✅ Member Promoted')
                    .setDescription(`**${targetUser.username}** has been promoted to **${rankName}**`)
                    .addFields(
                        { name: 'User', value: targetUser.username, inline: true },
                        { name: 'New Rank', value: rankName, inline: true },
                        { name: 'Promoted By', value: interaction.user.username, inline: true }
                    )
                    .setTimestamp();

                await interaction.editReply({ embeds: [promoteEmbed] });

            } catch (error) {
                console.error('Error promoting user:', error);
                try {
                    await interaction.editReply({ 
                        content: `❌ An error occurred while promoting the user!\n\nError: ${error.message}`
                    });
                } catch (editError) {
                    await interaction.followUp({ 
                        content: `❌ An error occurred while promoting the user!\n\nError: ${error.message}`,
                        ephemeral: true
                    });
                }
            }
        }

        else if (commandName === 'sendmission') {
            if (!isExecutiveOrHigher(interaction.member)) {
                await interaction.reply({ content: '❌ Only Grandmasters and Executives can send missions!', ephemeral: true });
                return;
            }

            const description = interaction.options.getString('description');
            const difficulty = interaction.options.getString('difficulty');

            // Calculate coin reward based on difficulty
            const coinRewards = {
                'Easy': 300,
                'Normal': 750,
                'Hard': 1500
            };
            const coinReward = coinRewards[difficulty] || 0;

            const missionId = generateId();
            missions[missionId] = {
                id: missionId,
                description,
                difficulty,
                coinReward,
                createdBy: interaction.user.id,
                createdByName: interaction.user.username,
                createdAt: new Date().toISOString(),
                status: 'active',
                acceptedBy: null,
                acceptedByName: null,
                acceptedAt: null,
                rewardClaimed: false
            };
            saveMissionData();

            await interaction.deferReply();

            try {
                // Get mission board channel from config (will be set later)
                const missionBoardChannelId = config.MISSION_BOARD_CHANNEL_ID;
                if (!missionBoardChannelId) {
                    await interaction.editReply({ 
                        content: '❌ Mission board channel not configured! Please set MISSION_BOARD_CHANNEL_ID in config.'
                    });
                    return;
                }

                const missionChannel = client.channels.cache.get(missionBoardChannelId);
                if (!missionChannel) {
                    await interaction.editReply({ 
                        content: '❌ Mission board channel not found! Please check the channel ID.'
                    });
                    return;
                }

                // Create mission embed with Accept/Decline buttons
                const missionEmbed = new EmbedBuilder()
                    .setColor(difficulty === 'Easy' ? 0x4CAF50 : difficulty === 'Normal' ? 0xFF9800 : 0xF44336)
                    .setTitle(`📋 Mission: ${difficulty}`)
                    .setDescription(description)
                    .addFields(
                        { name: 'Difficulty', value: difficulty, inline: true },
                        { name: 'Coin Reward', value: `${coinReward} coins`, inline: true },
                        { name: 'Mission ID', value: missionId, inline: false },
                        { name: 'Status', value: 'Available', inline: true }
                    )
                    .setFooter({ text: 'Click Accept or Decline to respond' })
                    .setTimestamp();

                const acceptButton = new ButtonBuilder()
                    .setCustomId(`mission_accept_${missionId}`)
                    .setLabel('✅ Accept')
                    .setStyle(ButtonStyle.Success);

                const declineButton = new ButtonBuilder()
                    .setCustomId(`mission_decline_${missionId}`)
                    .setLabel('❌ Decline')
                    .setStyle(ButtonStyle.Danger);

                const row = new ActionRowBuilder()
                    .addComponents(acceptButton, declineButton);

                const missionMessage = await missionChannel.send({ 
                    embeds: [missionEmbed],
                    components: [row]
                });

                // Store message ID for later reference
                missions[missionId].messageId = missionMessage.id;
                missions[missionId].channelId = missionChannel.id;
                saveMissionData();

                await interaction.editReply({ 
                    content: `✅ Mission sent to mission board!\n\nMission ID: ${missionId}`
                });

            } catch (error) {
                console.error('Error sending mission:', error);
                await interaction.editReply({ 
                    content: `❌ An error occurred while sending the mission!\n\nError: ${error.message}`
                });
            }
        }

        else if (commandName === 'cancelmission') {
            if (!isShadowOps(interaction.member)) {
                await interaction.reply({ content: '❌ Only Shadow Ops can cancel missions!', ephemeral: true });
                return;
            }

            const missionId = interaction.options.getString('mission_id');

            if (!missions[missionId]) {
                await interaction.reply({ content: '❌ Mission not found!', ephemeral: true });
                return;
            }

            const mission = missions[missionId];
            if (mission.status !== 'active') {
                await interaction.reply({ content: '❌ This mission is not active!', ephemeral: true });
                return;
            }

            // Update mission status
            missions[missionId].status = 'cancelled';
            missions[missionId].cancelledAt = new Date().toISOString();
            missions[missionId].cancelledBy = interaction.user.id;
            missions[missionId].cancelledByName = interaction.user.username;
            saveMissionData();

            // Update mission message if it exists
            if (mission.messageId && mission.channelId) {
                try {
                    const missionChannel = client.channels.cache.get(mission.channelId);
                    if (missionChannel) {
                        const missionMessage = await missionChannel.messages.fetch(mission.messageId).catch(() => null);
                        if (missionMessage) {
                            const cancelledEmbed = new EmbedBuilder()
                                .setColor(0x9E9E9E)
                                .setTitle(`📋 Mission: ${mission.difficulty} [CANCELLED]`)
                                .setDescription(mission.description)
                                .addFields(
                                    { name: 'Difficulty', value: mission.difficulty, inline: true },
                                    { name: 'Coin Reward', value: `${mission.coinReward} coins`, inline: true },
                                    { name: 'Status', value: 'Cancelled', inline: true },
                                    { name: 'Cancelled By', value: interaction.user.username, inline: true }
                                )
                                .setTimestamp();
                            
                            await missionMessage.edit({ embeds: [cancelledEmbed], components: [] });
                        }
                    }
                } catch (error) {
                    console.error('Error updating mission message:', error);
                }
            }

            const cancelEmbed = new EmbedBuilder()
                .setColor(0xFF6B6B)
                .setTitle('❌ Mission Cancelled')
                .setDescription(`Mission **${missionId}** has been cancelled`)
                .addFields(
                    { name: 'Mission ID', value: missionId, inline: true },
                    { name: 'Cancelled By', value: interaction.user.username, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [cancelEmbed] });
        }

        // Links
        else if (commandName === 'links') {
            const links = config.LINKS || {};
            const linksEmbed = new EmbedBuilder()
                .setColor(0x00BCD4)
                .setTitle('🔗 Clan Information & Links')
                .setDescription('Important links and information about our clan')
                .addFields(
                    { name: '🌐 Website', value: links.website || 'Not configured', inline: true },
                    { name: '📱 Documentation', value: links.guide || 'Not configured', inline: true },
                    // { name: '🎮 Game Server', value: links.gameServer || 'Not configured', inline: true },
                    // { name: '📋 Rules', value: links.rules || 'Check #rules channel', inline: true },
                    // { name: '📊 Leaderboard', value: links.leaderboard || 'Use /challengeleaderboard', inline: true },
                    // { name: '🎯 Bounties', value: links.bounties || 'Use /bountyrequest', inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'ShadowBot' });

            await interaction.reply({ embeds: [linksEmbed] });
        }

        // Promotions
        else if (commandName === 'promotions') {
            const recentPromotions = promotions.slice(-10).reverse();
            
            if (recentPromotions.length === 0) {
                await interaction.reply({ content: '❌ No promotions recorded yet!', ephemeral: true });
                return;
            }

            const promotionsEmbed = new EmbedBuilder()
                .setColor(0x4CAF50)
                .setTitle('📈 Recent Promotions')
                .setDescription('Last 10 rank promotions')
                .setTimestamp()
                .setFooter({ text: 'ShadowBot' });

            let promotionText = '';
            for (const promotion of recentPromotions) {
                const user = await client.users.fetch(promotion.userId).catch(() => ({ username: 'Unknown User' }));
                promotionText += `🎉 **${user.username}** - ${promotion.fromRank} → ${promotion.toRank}\n`;
            }

            promotionsEmbed.addFields({ name: 'Promotions', value: promotionText, inline: false });
            await interaction.reply({ embeds: [promotionsEmbed] });
        }

        // Giveaway
        else if (commandName === 'giveaway') {
            const prize = interaction.options.getString('prize');
            const duration = interaction.options.getInteger('duration');
            const winners = interaction.options.getInteger('winners');
            const userId = interaction.user.id;

            const giveawayId = generateId();
            const endTime = new Date(Date.now() + duration * 60000);

            const giveawayEmbed = new EmbedBuilder()
                .setColor(0xFF9800)
                .setTitle('🎉 Giveaway Started!')
                .setDescription(`**${prize}**`)
                .addFields(
                    { name: 'Winners', value: winners.toString(), inline: true },
                    { name: 'Duration', value: `${duration} minutes`, inline: true },
                    { name: 'Ends At', value: `<t:${Math.floor(endTime.getTime() / 1000)}:R>`, inline: true }
                )
                .setFooter({ text: 'React with 🎉 to enter!' })
                .setTimestamp();

            const giveawayMessage = await interaction.reply({ embeds: [giveawayEmbed], fetchReply: true });
            await giveawayMessage.react('🎉');

            giveaways[giveawayId] = {
                id: giveawayId,
                prize,
                duration,
                winners,
                creator: userId,
                creatorName: interaction.user.username,
                createdAt: new Date().toISOString(),
                endTime: endTime.toISOString(),
                status: 'active',
                participants: [],
                messageId: giveawayMessage.id,
                channelId: giveawayMessage.channel.id
            };
            saveGiveawayData();

            // Set timeout to end giveaway
            setTimeout(async () => {
                const giveaway = giveaways[giveawayId];
                if (giveaway && giveaway.status === 'active') {
                    try {
                        // Fetch the message to get all reactions
                        const channel = await client.channels.fetch(giveaway.channelId);
                        const message = await channel.messages.fetch(giveaway.messageId);
                        
                        // Get all users who reacted with 🎉
                        const reaction = message.reactions.cache.get('🎉');
                        let participantIds = [];
                        
                        if (reaction) {
                            const users = await reaction.users.fetch();
                            participantIds = Array.from(users.keys()).filter(id => !users.get(id).bot);
                        }
                        
                        // Select winners
                        let selectedWinners = [];
                        const numWinners = Math.min(giveaway.winners, participantIds.length);
                        
                        if (numWinners > 0) {
                            // Shuffle and select winners
                            const shuffled = [...participantIds].sort(() => Math.random() - 0.5);
                            selectedWinners = shuffled.slice(0, numWinners);
                        }
                        
                        giveaway.status = 'ended';
                        giveaway.participants = participantIds;
                        giveaway.winnerIds = selectedWinners;
                        saveGiveawayData();

                        const endEmbed = new EmbedBuilder()
                            .setColor(0x4CAF50)
                            .setTitle('🎉 Giveaway Ended!')
                            .setDescription(`**${prize}**`)
                            .addFields(
                                { name: 'Participants', value: participantIds.length.toString(), inline: true },
                                { name: 'Winners', value: numWinners.toString(), inline: true }
                            )
                            .setTimestamp();

                        // Add winners to embed
                        if (selectedWinners.length > 0) {
                            const winnerMentions = selectedWinners.map(id => `<@${id}>`).join(', ');
                            endEmbed.addFields({ name: '🎊 Winners:', value: winnerMentions, inline: false });
                        } else {
                            endEmbed.addFields({ name: '🎊 Winners:', value: 'No participants entered!', inline: false });
                        }

                        await message.edit({ embeds: [endEmbed] });
                    } catch (error) {
                        console.error('Error ending giveaway:', error);
                        giveaway.status = 'ended';
                        saveGiveawayData();
                    }
                }
            }, duration * 60000);
        }

        // Admin commands
        else if (commandName === 'assigndivision') {
            if (!isGrandmaster(interaction.member)) {
                await interaction.reply({ content: '❌ Only Grandmasters can assign divisions!', ephemeral: true });
                return;
            }

            const targetUser = interaction.options.getUser('user');
            const division = interaction.options.getString('division');

            // Save division assignment
            divisions[targetUser.id] = {
                userId: targetUser.id,
                username: targetUser.username,
                division: division,
                assignedBy: interaction.user.id,
                assignedByName: interaction.user.username,
                assignedAt: new Date().toISOString()
            };
            saveDivisionData();

            const divisionEmbed = new EmbedBuilder()
                .setColor(0x9C27B0)
                .setTitle('✅ Division Assigned')
                .setDescription(`**${targetUser.username}** has been assigned to **${division}**`)
                .addFields(
                    { name: 'User', value: targetUser.username, inline: true },
                    { name: 'Division', value: division, inline: true },
                    { name: 'Assigned By', value: interaction.user.username, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [divisionEmbed] });
        }

        else if (commandName === 'divisionlist') {
            // Group users by division
            const divisionGroups = {};
            for (const [userId, data] of Object.entries(divisions)) {
                const divisionName = data.division || 'Unassigned';
                if (!divisionGroups[divisionName]) {
                    divisionGroups[divisionName] = [];
                }
                divisionGroups[divisionName].push(data);
            }

            if (Object.keys(divisionGroups).length === 0) {
                const emptyEmbed = new EmbedBuilder()
                    .setColor(0x9C27B0)
                    .setTitle('📋 Division List')
                    .setDescription('No divisions have been assigned yet.')
                    .setTimestamp();

                await interaction.reply({ embeds: [emptyEmbed] });
                return;
            }

            const divisionListEmbed = new EmbedBuilder()
                .setColor(0x9C27B0)
                .setTitle('📋 Division List')
                .setDescription('List of all divisions and their members')
                .setTimestamp();

            // Sort divisions alphabetically
            const sortedDivisions = Object.keys(divisionGroups).sort();
            
            for (const divisionName of sortedDivisions) {
                const members = divisionGroups[divisionName];
                let membersList = '';
                
                if (members.length === 0) {
                    membersList = 'No members';
                } else {
                    membersList = members.map(m => m.username || `<@${m.userId}>`).join(', ');
                    // Discord embed field values have a limit of 1024 characters
                    if (membersList.length > 1024) {
                        membersList = membersList.substring(0, 1021) + '...';
                    }
                }

                divisionListEmbed.addFields({
                    name: `${divisionName} (${members.length})`,
                    value: membersList || 'No members',
                    inline: false
                });
            }

            await interaction.reply({ embeds: [divisionListEmbed] });
        }

        else if (commandName === 'assignrole') {
            if (!isExecutiveOrHigher(interaction.member)) {
                await interaction.reply({ content: '❌ Only Executive+ can assign roles!', ephemeral: true });
                return;
            }

            const targetUser = interaction.options.getUser('user');
            const roleName = interaction.options.getString('role');

            // Defer reply immediately to prevent timeout
            await interaction.deferReply();

            try {
                const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
                if (!member) {
                    await interaction.editReply({ content: '❌ User not found in this server!' });
                    return;
                }

                let role = interaction.guild.roles.cache.find(r => r.name === roleName);
                
                // If role doesn't exist, try to create it (only for known roles)
                if (!role) {
                    // Check if it's a known role (from roleConfig or otherRoles)
                    const isKnownRole = roleConfig.hasOwnProperty(roleName) || otherRoles.hasOwnProperty(roleName);
                    
                    if (isKnownRole) {
                        try {
                            // Create the role with a default color
                            const defaultColors = {
                                'VIP': 0xFFD700,      // Gold
                                'Hero': 0xFF6B6B,     // Red
                                'Executive': 0x9B59B6, // Purple
                                'Shadow Ops': 0xE67E22, // Orange
                                'Chosen Disciple': 0x3498DB // Blue
                            };
                            
                            role = await interaction.guild.roles.create({
                                name: roleName,
                                color: defaultColors[roleName] || 0x95A5A6, // Default gray if not specified
                                reason: `Auto-created by ${interaction.user.username} via /assignrole`
                            });
                            
                            // Update the roleId in the config if it's in otherRoles
                            if (otherRoles[roleName]) {
                                otherRoles[roleName].roleId = role.id;
                            }
                            
                        } catch (createError) {
                            console.error('Error creating role:', createError);
                            await interaction.editReply({ 
                                content: `❌ Role "${roleName}" not found and could not be created! Make sure the bot has "Manage Roles" permission and its role is positioned above the role you're trying to create.\n\nError: ${createError.message}`
                            });
                            return;
                        }
                    } else {
                        await interaction.editReply({ 
                            content: `❌ Role "${roleName}" not found! Please create this role in Discord server settings first, or use a role from the available roles list.`
                        });
                        return;
                    }
                }

                // Check if user already has the role
                if (member.roles.cache.has(role.id)) {
                    await interaction.editReply({ 
                        content: `ℹ️ **${targetUser.username}** already has the **${roleName}** role!`
                    });
                    return;
                }

                await member.roles.add(role);

                const roleEmbed = new EmbedBuilder()
                    .setColor(0x4CAF50)
                    .setTitle('✅ Role Assigned')
                    .setDescription(`**${targetUser.username}** has been assigned the **${roleName}** role`)
                    .addFields(
                        { name: 'User', value: targetUser.username, inline: true },
                        { name: 'Role', value: roleName, inline: true },
                        { name: 'Assigned By', value: interaction.user.username, inline: true }
                    )
                    .setTimestamp();

                await interaction.editReply({ embeds: [roleEmbed] });

            } catch (error) {
                console.error('Error assigning role:', error);
                try {
                    await interaction.editReply({ 
                        content: `❌ An error occurred while assigning the role!\n\nError: ${error.message}`
                    });
                } catch (editError) {
                    // If we can't edit, try to reply (though this might fail if already deferred)
                    try {
                        await interaction.followUp({ 
                            content: `❌ An error occurred while assigning the role!\n\nError: ${error.message}`,
                            ephemeral: true
                        });
                    } catch (followUpError) {
                        console.error('Failed to send error message:', followUpError);
                    }
                }
            }
        }

        else if (commandName === 'addraidpoints') {
            if (!isGrandmaster(interaction.member)) {
                await interaction.reply({ content: '❌ Only Grandmasters can add raid points!', ephemeral: true });
                return;
            }

            const targetUser = interaction.options.getUser('user');
            const amount = interaction.options.getInteger('amount');

            // Initialize if doesn't exist
            if (!raidPoints[targetUser.id]) {
                raidPoints[targetUser.id] = 0;
            }

            raidPoints[targetUser.id] += amount;
            saveRaidPointsData();

            const raidPointsEmbed = new EmbedBuilder()
                .setColor(0x8B4513)
                .setTitle('⚔️ Raid Points Added')
                .setDescription(`**${targetUser.username}** has received **${amount}** raid points`)
                .addFields(
                    { name: 'User', value: targetUser.username, inline: true },
                    { name: 'Points Added', value: amount.toString(), inline: true },
                    { name: 'Total Raid Points', value: raidPoints[targetUser.id].toString(), inline: true },
                    { name: 'Added By', value: interaction.user.username, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [raidPointsEmbed] });
        }

        else if (commandName === 'addcoins') {
            if (!isGrandmaster(interaction.member)) {
                await interaction.reply({ content: '❌ Only Grandmasters can add coins!', ephemeral: true });
                return;
            }

            const targetUser = interaction.options.getUser('user');
            const amount = interaction.options.getInteger('amount');

            // Initialize if doesn't exist
            if (!coins[targetUser.id]) {
                coins[targetUser.id] = 0;
            }

            coins[targetUser.id] += amount;
            saveCoinsData();

            const coinsEmbed = new EmbedBuilder()
                .setColor(0xFFD700)
                .setTitle('💰 Coins Added')
                .setDescription(`**${targetUser.username}** has received **${amount}** coins`)
                .addFields(
                    { name: 'User', value: targetUser.username, inline: true },
                    { name: 'Coins Added', value: amount.toString(), inline: true },
                    { name: 'Total Coins', value: coins[targetUser.id].toString(), inline: true },
                    { name: 'Added By', value: interaction.user.username, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [coinsEmbed] });
        }

        else if (commandName === 'removecoins') {
            if (!isGrandmaster(interaction.member)) {
                await interaction.reply({ content: '❌ Only Grandmasters can remove coins!', ephemeral: true });
                return;
            }

            const targetUser = interaction.options.getUser('user');
            const amount = interaction.options.getInteger('amount');

            // Initialize if doesn't exist
            if (!coins[targetUser.id]) {
                coins[targetUser.id] = 0;
            }

            // Ensure coins don't go below 0
            const currentCoins = coins[targetUser.id];
            const newCoins = Math.max(0, currentCoins - amount);
            coins[targetUser.id] = newCoins;
            saveCoinsData();

            const coinsEmbed = new EmbedBuilder()
                .setColor(0xFF6B35)
                .setTitle('💰 Coins Removed')
                .setDescription(`**${amount}** coins have been removed from **${targetUser.username}**`)
                .addFields(
                    { name: 'User', value: targetUser.username, inline: true },
                    { name: 'Coins Removed', value: amount.toString(), inline: true },
                    { name: 'Total Coins', value: newCoins.toString(), inline: true },
                    { name: 'Removed By', value: interaction.user.username, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [coinsEmbed] });
        }

        else if (commandName === 'flip') {
            const betAmount = interaction.options.getInteger('bet');
            const choice = interaction.options.getString('choice');
            const userId = interaction.user.id;

            // Initialize if doesn't exist
            if (!coins[userId]) {
                coins[userId] = 0;
            }

            // Check if user has enough coins
            if (coins[userId] < betAmount) {
                await interaction.reply({ 
                    content: `❌ You don't have enough coins! You need ${betAmount} coins but only have ${coins[userId]}.`, 
                    ephemeral: true 
                });
                return;
            }

            // Deduct bet amount
            coins[userId] -= betAmount;

            // Flip coin (50/50 chance)
            const result = Math.random() < 0.5 ? 'heads' : 'tails';
            const won = choice === result;

            // Calculate winnings (2x bet if won, 0 if lost)
            if (won) {
                coins[userId] += betAmount * 2;
            }

            saveCoinsData();

            const flipEmbed = new EmbedBuilder()
                .setColor(won ? 0x00FF00 : 0xFF0000)
                .setTitle(won ? '🎉 You Won!' : '😢 You Lost!')
                .setDescription(`**Result:** ${result.charAt(0).toUpperCase() + result.slice(1)}\n**Your Choice:** ${choice.charAt(0).toUpperCase() + choice.slice(1)}`)
                .addFields(
                    { name: 'Bet Amount', value: betAmount.toString(), inline: true },
                    { name: 'Winnings', value: won ? `+${betAmount * 2}` : '0', inline: true },
                    { name: 'Total Coins', value: coins[userId].toString(), inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [flipEmbed] });
        }

        else if (commandName === 'rob') {
            const targetUser = interaction.options.getUser('user');
            const userId = interaction.user.id;

            // Can't rob yourself
            if (targetUser.id === userId) {
                await interaction.reply({ 
                    content: '❌ You cannot rob yourself!', 
                    ephemeral: true 
                });
                return;
            }

            // Can't rob bots
            if (targetUser.bot) {
                await interaction.reply({ 
                    content: '❌ You cannot rob bots!', 
                    ephemeral: true 
                });
                return;
            }

            // Initialize if doesn't exist
            if (!coins[targetUser.id]) {
                coins[targetUser.id] = 0;
            }
            if (!coins[userId]) {
                coins[userId] = 0;
            }

            // Check if target has coins
            if (coins[targetUser.id] === 0) {
                await interaction.reply({ 
                    content: `❌ **${targetUser.username}** has no coins to rob!`, 
                    ephemeral: true 
                });
                return;
            }

            // 40% chance of success
            const success = Math.random() < 0.4;
            
            if (success) {
                // Steal 10-50% of target's coins (random)
                const stealPercentage = 0.1 + (Math.random() * 0.4); // 10% to 50%
                const stolenAmount = Math.floor(coins[targetUser.id] * stealPercentage);
                
                // Ensure at least 1 coin is stolen if target has coins
                const finalStolenAmount = Math.max(1, stolenAmount);

                coins[targetUser.id] -= finalStolenAmount;
                coins[userId] += finalStolenAmount;
                saveCoinsData();

                const robEmbed = new EmbedBuilder()
                    .setColor(0xFF6B35)
                    .setTitle('💰 Robbery Successful!')
                    .setDescription(`**${interaction.user.username}** successfully robbed **${finalStolenAmount}** coins from **${targetUser.username}**!`)
                    .addFields(
                        { name: 'Stolen Amount', value: finalStolenAmount.toString(), inline: true },
                        { name: 'Your Coins', value: coins[userId].toString(), inline: true },
                        { name: `${targetUser.username}'s Remaining Coins`, value: coins[targetUser.id].toString(), inline: true }
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [robEmbed] });
            } else {
                // Failed robbery - lose 5% of your coins as penalty (minimum 1)
                const penalty = Math.max(1, Math.floor(coins[userId] * 0.05));
                coins[userId] -= penalty;
                saveCoinsData();

                const robEmbed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('🚨 Robbery Failed!')
                    .setDescription(`**${interaction.user.username}** was caught trying to rob **${targetUser.username}**!`)
                    .addFields(
                        { name: 'Penalty', value: `-${penalty} coins`, inline: true },
                        { name: 'Your Coins', value: coins[userId].toString(), inline: true }
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [robEmbed] });
            }
        }

        else if (commandName === 'giftcoins') {
            const targetUser = interaction.options.getUser('user');
            const amount = interaction.options.getInteger('amount');
            const userId = interaction.user.id;

            // Can't gift to yourself
            if (targetUser.id === userId) {
                await interaction.reply({ 
                    content: '❌ You cannot gift coins to yourself!', 
                    ephemeral: true 
                });
                return;
            }

            // Initialize if doesn't exist
            if (!coins[userId]) {
                coins[userId] = 0;
            }
            if (!coins[targetUser.id]) {
                coins[targetUser.id] = 0;
            }

            // Check if user has enough coins
            if (coins[userId] < amount) {
                await interaction.reply({ 
                    content: `❌ You don't have enough coins! You need ${amount} coins but only have ${coins[userId]}.`, 
                    ephemeral: true 
                });
                return;
            }

            // Transfer coins
            coins[userId] -= amount;
            coins[targetUser.id] += amount;
            saveCoinsData();

            const giftEmbed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('🎁 Coins Gifted!')
                .setDescription(`**${interaction.user.username}** sent **${amount}** coins to **${targetUser.username}**!`)
                .addFields(
                    { name: 'Amount Sent', value: amount.toString(), inline: true },
                    { name: 'Your Coins', value: coins[userId].toString(), inline: true },
                    { name: `${targetUser.username}'s Coins`, value: coins[targetUser.id].toString(), inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [giftEmbed] });
        }

        else if (commandName === 'clearpoints') {
            if (!isGrandmaster(interaction.member)) {
                await interaction.reply({ content: '❌ Only Grandmasters can clear points!', ephemeral: true });
                return;
            }

            const targetUser = interaction.options.getUser('user');
            const userId = targetUser.id;

            // Clear rank points
            if (userPoints[userId]) {
                delete userPoints[userId];
                saveUserPoints();
            }

            // Clear raid points
            if (raidPoints[userId]) {
                delete raidPoints[userId];
                saveRaidPointsData();
            }

            const clearEmbed = new EmbedBuilder()
                .setColor(0xFF6B35)
                .setTitle('🗑️ Points Cleared')
                .setDescription(`All rank and raid points have been cleared for **${targetUser.username}**`)
                .addFields(
                    { name: 'User', value: targetUser.username, inline: true },
                    { name: 'Cleared By', value: interaction.user.username, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [clearEmbed] });
        }

        else if (commandName === 'deleteall') {
            if (!isExecutiveOrHigher(interaction.member)) {
                await interaction.reply({ content: '❌ Only Executive+ can delete all messages!', ephemeral: true });
                return;
            }

            const channel = interaction.channel;
            const messages = await channel.messages.fetch({ limit: 100 });
            
            try {
                await channel.bulkDelete(messages);
                await interaction.reply({ content: '✅ All messages in this channel have been deleted!', ephemeral: true });
            } catch (error) {
                console.error('Error deleting messages:', error);
                await interaction.reply({ content: '❌ An error occurred while deleting messages!', ephemeral: true });
            }
        }

        else if (commandName === 'deletelast10') {
            if (!isExecutiveOrHigher(interaction.member)) {
                await interaction.reply({ content: '❌ Only Executive+ can delete messages!', ephemeral: true });
                return;
            }

            const channel = interaction.channel;
            const messages = await channel.messages.fetch({ limit: 10 });
            
            try {
                await channel.bulkDelete(messages);
                await interaction.reply({ content: '✅ Last 10 messages have been deleted!', ephemeral: true });
            } catch (error) {
                console.error('Error deleting messages:', error);
                await interaction.reply({ content: '❌ An error occurred while deleting messages!', ephemeral: true });
            }
        }

        // Moderation: Ban
        else if (commandName === 'ban') {
            if (!isGrandmaster(interaction.member)) {
                await interaction.reply({ content: '❌ Only Grandmasters can ban members!', ephemeral: true });
                return;
            }

            const targetUser = interaction.options.getUser('user');
            const reason = interaction.options.getString('reason') || 'No reason provided';

            if (targetUser.id === interaction.user.id) {
                await interaction.reply({ content: '❌ You cannot ban yourself!', ephemeral: true });
                return;
            }

            if (targetUser.id === client.user.id) {
                await interaction.reply({ content: '❌ I cannot ban myself.', ephemeral: true });
                return;
            }

            const member = interaction.guild.members.cache.get(targetUser.id);
            if (!member) {
                await interaction.reply({ content: '❌ User not found in this server!', ephemeral: true });
                return;
            }

            if (!member.bannable) {
                await interaction.reply({ content: '❌ I do not have permission to ban this user (role hierarchy).', ephemeral: true });
                return;
            }

            try {
                await member.ban({ reason });

                const banEmbed = new EmbedBuilder()
                    .setColor(0xE53935)
                    .setTitle('🔨 User Banned')
                    .setDescription(`**${targetUser.username}** has been banned from the server`)
                    .addFields(
                        { name: 'User', value: targetUser.tag, inline: true },
                        { name: 'Moderator', value: interaction.user.tag, inline: true },
                        { name: 'Reason', value: reason, inline: false }
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [banEmbed] });
            } catch (error) {
                console.error('Error banning user:', error);
                await interaction.reply({ content: '❌ An error occurred while banning the user.', ephemeral: true });
            }
        }

        // Moderation: Kick
        else if (commandName === 'kick') {
            if (!isExecutiveOrHigher(interaction.member)) {
                await interaction.reply({ content: '❌ Only Executive+ can kick members!', ephemeral: true });
                return;
            }

            const targetUser = interaction.options.getUser('user');
            const reason = interaction.options.getString('reason') || 'No reason provided';

            if (targetUser.id === interaction.user.id) {
                await interaction.reply({ content: '❌ You cannot kick yourself!', ephemeral: true });
                return;
            }

            if (targetUser.id === client.user.id) {
                await interaction.reply({ content: '❌ I cannot kick myself.', ephemeral: true });
                return;
            }

            // Defer reply to prevent timeout
            await interaction.deferReply();

            try {
                const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
                if (!member) {
                    await interaction.editReply({ content: '❌ User not found in this server!' });
                    return;
                }

                // Check if target is Executive+ (Executive or Elder) - cannot kick them
                if (isExecutivePlus(member)) {
                    await interaction.editReply({ content: '❌ You cannot kick Executive+ members (Executive or Elder)!' });
                    return;
                }

                if (!member.kickable) {
                    await interaction.editReply({ content: '❌ I do not have permission to kick this user (role hierarchy).' });
                    return;
                }

                await member.kick(reason);

                const kickEmbed = new EmbedBuilder()
                    .setColor(0xFB8C00)
                    .setTitle('👢 User Kicked')
                    .setDescription(`**${targetUser.username}** has been kicked from the server`)
                    .addFields(
                        { name: 'User', value: targetUser.tag, inline: true },
                        { name: 'Moderator', value: interaction.user.tag, inline: true },
                        { name: 'Reason', value: reason, inline: false }
                    )
                    .setTimestamp();

                await interaction.editReply({ embeds: [kickEmbed] });
            } catch (error) {
                console.error('Error kicking user:', error);
                try {
                    await interaction.editReply({ 
                        content: `❌ An error occurred while kicking the user.\n\nError: ${error.message}`
                    });
                } catch (editError) {
                    await interaction.followUp({ 
                        content: `❌ An error occurred while kicking the user.\n\nError: ${error.message}`,
                        ephemeral: true
                    });
                }
            }
        }

        else if (commandName === 'play') {
            try {
                const link = interaction.options.getString('link');
                const member = interaction.member;
                const voiceChannel = member.voice.channel;

                // Check if user is in a voice channel
                if (!voiceChannel) {
                    await interaction.reply({ content: '❌ You need to be in a voice channel to play music!', ephemeral: true });
                    return;
                }

                // Check if bot has permission to join and speak
                if (!voiceChannel.joinable) {
                    await interaction.reply({ content: '❌ I don\'t have permission to join this voice channel!', ephemeral: true });
                    return;
                }

                await interaction.deferReply();

                let stream;
                let songInfo;

                try {
                    // Validate the link
                    const linkType = await play.validate(link);
                    
                    // Check for playlists and albums FIRST (before checking videos/tracks)
                    // YouTube playlist check: must be /playlist in URL path, not just "playlist" in query params
                    const isYoutubePlaylist = linkType === 'yt_playlist' || 
                                             (link.includes('youtube.com') && link.includes('/playlist'));
                    
                    // Spotify playlist/album check
                    const isSpotifyPlaylistOrAlbum = linkType === 'sp_playlist' || linkType === 'sp_album' || 
                                                     (link.includes('spotify.com') && (link.includes('/playlist') || link.includes('/album')));
                    
                    if (isYoutubePlaylist) {
                        await interaction.editReply({ content: '❌ Playlists are not supported yet. Please use a single video link.' });
                        return;
                    }
                    
                    if (isSpotifyPlaylistOrAlbum || linkType === 'playlist' || linkType === 'album') {
                        await interaction.editReply({ content: '❌ Playlists and albums are not supported yet. Please use a single track link.' });
                        return;
                    }
                    
                    // Handle YouTube video links (single videos only, playlists already filtered out)
                    if (linkType === 'yt_video' || linkType === 'video' || link.includes('youtube.com') || link.includes('youtu.be')) {
                        const info = await play.video_info(link);
                        stream = await play.stream(link);
                        songInfo = info.video_details;
                    } 
                    // Handle Spotify track links
                    else if (linkType === 'sp_track' || linkType === 'track' || (link.includes('spotify.com') && link.includes('/track'))) {
                        // Spotify track - get track info and search YouTube
                        const spotifyInfo = await play.spotify(link);
                        const searchQuery = `${spotifyInfo.name} ${spotifyInfo.artists[0]?.name || ''}`;
                        const ytSearch = await play.search(searchQuery, { limit: 1 });
                        
                        if (ytSearch.length === 0) {
                            await interaction.editReply({ content: '❌ Could not find this song on YouTube. Please try a YouTube link instead.' });
                            return;
                        }

                        const ytUrl = ytSearch[0].url;
                        const info = await play.video_info(ytUrl);
                        stream = await play.stream(ytUrl);
                        songInfo = info.video_details;
                    } 
                    // Try to treat as YouTube search query if it's not a valid link
                    else if (!link.includes('http') && !link.includes('://')) {
                        // Treat as search query
                        const ytSearch = await play.search(link, { limit: 1 });
                        
                        if (ytSearch.length === 0) {
                            await interaction.editReply({ content: '❌ Could not find any results. Please provide a valid YouTube or Spotify link.' });
                            return;
                        }

                        const ytUrl = ytSearch[0].url;
                        const info = await play.video_info(ytUrl);
                        stream = await play.stream(ytUrl);
                        songInfo = info.video_details;
                    } 
                    else {
                        await interaction.editReply({ content: '❌ Invalid link! Please provide a valid YouTube or Spotify link.' });
                        return;
                    }
                } catch (error) {
                    console.error('Error processing music link:', error);
                    await interaction.editReply({ content: `❌ Error processing the link: ${error.message}. Please make sure it's a valid YouTube or Spotify link.` });
                    return;
                }

                // Join or get existing voice connection
                let connection = voiceConnections.get(interaction.guild.id);
                
                if (!connection || connection.state.status === 'disconnected') {
                    connection = joinVoiceChannel({
                        channelId: voiceChannel.id,
                        guildId: interaction.guild.id,
                        adapterCreator: interaction.guild.voiceAdapterCreator,
                    });
                    voiceConnections.set(interaction.guild.id, connection);
                } else if (connection.joinConfig.channelId !== voiceChannel.id) {
                    // User is in a different channel, move the bot
                    connection.destroy();
                    connection = joinVoiceChannel({
                        channelId: voiceChannel.id,
                        guildId: interaction.guild.id,
                        adapterCreator: interaction.guild.voiceAdapterCreator,
                    });
                    voiceConnections.set(interaction.guild.id, connection);
                }

                // Create or get audio player
                let player = audioPlayers.get(interaction.guild.id);
                if (!player) {
                    player = createAudioPlayer();
                    audioPlayers.set(interaction.guild.id, player);
                }
                
                // Ensure connection is subscribed to player (always resubscribe after connection changes)
                try {
                    connection.subscribe(player);
                } catch (error) {
                    // If subscription fails, try again after a short delay
                    setTimeout(() => {
                        try {
                            connection.subscribe(player);
                        } catch (e) {
                            console.error('Error subscribing player:', e);
                        }
                    }, 100);
                }

                // Create audio resource and play
                const resource = createAudioResource(stream.stream, {
                    inputType: stream.type,
                });

                player.play(resource);

                // Create embed with song info
                const songEmbed = new EmbedBuilder()
                    .setColor(0x1DB954)
                    .setTitle('🎵 Now Playing')
                    .setDescription(`**${songInfo.title || 'Unknown'}**`)
                    .addFields(
                        { name: 'Duration', value: songInfo.durationRaw || 'Unknown', inline: true },
                        { name: 'Channel', value: songInfo.channel?.name || 'Unknown', inline: true },
                        { name: 'Voice Channel', value: voiceChannel.name, inline: true }
                    )
                    .setThumbnail(songInfo.thumbnails?.[0]?.url || null)
                    .setTimestamp()
                    .setFooter({ text: 'ShadowBot Music' });

                await interaction.editReply({ embeds: [songEmbed] });

                // Handle player events
                player.on(AudioPlayerStatus.Idle, () => {
                    // Auto-disconnect after 5 minutes of inactivity
                    setTimeout(() => {
                        if (player.state.status === AudioPlayerStatus.Idle) {
                            connection.destroy();
                            voiceConnections.delete(interaction.guild.id);
                            audioPlayers.delete(interaction.guild.id);
                        }
                    }, 300000); // 5 minutes
                });

            } catch (error) {
                console.error('Error playing music:', error);
                await interaction.editReply({ content: '❌ An error occurred while playing music. Please try again.' });
            }
        }

    } catch (error) {
        console.error('Error handling slash command:', error);
        const errorMessage = { content: '❌ There was an error while executing this command!', ephemeral: true };
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
});

// Handle button interactions
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton()) return;

    const { customId } = interaction;

    try {
        // Handle mission accept/decline buttons
        if (customId.startsWith('mission_accept_') || customId.startsWith('mission_decline_')) {
            const missionId = customId.split('_')[2];
            const mission = missions[missionId];

            if (!mission) {
                await interaction.reply({ content: '❌ Mission not found.', ephemeral: true });
                return;
            }

            if (mission.status !== 'active') {
                await interaction.reply({ content: `❌ This mission is no longer available.`, ephemeral: true });
                return;
            }

            const isAccepted = customId.startsWith('mission_accept_');
            
            if (isAccepted) {
                // Accept the mission
                missions[missionId].status = 'accepted';
                missions[missionId].acceptedBy = interaction.user.id;
                missions[missionId].acceptedByName = interaction.user.username;
                missions[missionId].acceptedAt = new Date().toISOString();
                saveMissionData();

                // Update the mission message
                const acceptedEmbed = new EmbedBuilder()
                    .setColor(mission.difficulty === 'Easy' ? 0x4CAF50 : mission.difficulty === 'Normal' ? 0xFF9800 : 0xF44336)
                    .setTitle(`📋 Mission: ${mission.difficulty} [ACCEPTED]`)
                    .setDescription(mission.description)
                    .addFields(
                        { name: 'Difficulty', value: mission.difficulty, inline: true },
                        { name: 'Coin Reward', value: `${mission.coinReward} coins`, inline: true },
                        { name: 'Mission ID', value: missionId, inline: false },
                        { name: 'Status', value: 'Accepted', inline: true },
                        { name: 'Accepted By', value: interaction.user.username, inline: true }
                    )
                    .setFooter({ text: 'Post proof in mission-proof channel when complete' })
                    .setTimestamp();

                await interaction.update({ 
                    embeds: [acceptedEmbed], 
                    components: [] // Remove buttons
                });

                // Send confirmation to user
                try {
                    const userDM = await client.users.fetch(interaction.user.id);
                    await userDM.send({ 
                        content: `✅ You have accepted mission **${missionId}**!\n\nPost your proof in the mission-proof channel when you complete it.`
                    });
                } catch (dmError) {
                    console.log(`Could not send DM to user ${interaction.user.username}:`, dmError.message);
                }

            } else {
                // Decline the mission (just acknowledge, don't change mission status)
                await interaction.reply({ 
                    content: '❌ You have declined this mission.', 
                    ephemeral: true 
                });
            }
        }

        // Handle mission reward claim button
        if (customId.startsWith('mission_claim_')) {
            const missionId = customId.split('_')[2];
            const mission = missions[missionId];

            if (!mission) {
                await interaction.reply({ content: '❌ Mission not found.', ephemeral: true });
                return;
            }

            // Check if user is the one who accepted the mission
            if (mission.acceptedBy !== interaction.user.id) {
                await interaction.reply({ content: '❌ You did not accept this mission!', ephemeral: true });
                return;
            }

            // Check if proof was approved
            if (mission.status !== 'proof_approved') {
                await interaction.reply({ content: '❌ Your proof has not been approved yet!', ephemeral: true });
                return;
            }

            // Check if reward already claimed
            if (mission.rewardClaimed) {
                await interaction.reply({ content: '❌ You have already claimed this reward!', ephemeral: true });
                return;
            }

            // Award coins
            coins[interaction.user.id] = (coins[interaction.user.id] || 0) + mission.coinReward;
            saveCoinsData();

            // Mark reward as claimed
            missions[missionId].rewardClaimed = true;
            missions[missionId].rewardClaimedAt = new Date().toISOString();
            saveMissionData();

            const userCoins = coins[interaction.user.id];

            const claimEmbed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('✅ Reward Claimed!')
                .setDescription(`You have claimed your reward for mission **${missionId}**!`)
                .addFields(
                    { name: '💰 Coins Awarded', value: `+${mission.coinReward}`, inline: true },
                    { name: 'Total Coins', value: userCoins.toString(), inline: true },
                    { name: 'Mission ID', value: missionId, inline: false }
                )
                .setTimestamp();

            await interaction.update({ 
                embeds: [claimEmbed], 
                components: [] // Remove claim button
            });

            // Send DM confirmation
            try {
                const userDM = await client.users.fetch(interaction.user.id);
                await userDM.send({ embeds: [claimEmbed] });
            } catch (dmError) {
                console.log(`Could not send DM to user ${interaction.user.username}:`, dmError.message);
            }
        }

        // Handle bounty approval buttons
        if (customId.startsWith('bounty_approve_') || customId.startsWith('bounty_reject_')) {
            const bountyId = customId.split('_')[2];
            const bounty = bounties[bountyId];

            if (!bounty) {
                await interaction.reply({ content: '❌ Bounty not found.', ephemeral: true });
                return;
            }

            if (bounty.status !== 'pending') {
                await interaction.reply({ content: `❌ This bounty has already been ${bounty.status}.`, ephemeral: true });
                return;
            }

            const isApproved = customId.startsWith('bounty_approve_');
            
            if (isApproved) {
                // Approve the bounty
                bounty.status = 'approved';
                bounty.approvedBy = interaction.user.id;
                bounty.approvedAt = new Date().toISOString();
                saveBountyData();

                // Update the approval message
                const updatedEmbed = new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setTitle('✅ Bounty Request - Approved')
                    .setDescription(`**Target:** ${bounty.title}`)
                    .addFields(
                        { name: 'Reason', value: bounty.description, inline: false },
                        { name: 'Requester', value: `<@${bounty.requester}> (${bounty.requesterName})`, inline: true },
                        { name: 'Approved By', value: `<@${interaction.user.id}> (${interaction.user.username})`, inline: true },
                        { name: 'Bounty ID', value: bountyId, inline: false }
                    )
                    .setFooter({ text: 'This bounty has been approved' })
                    .setTimestamp();

                await interaction.update({ 
                    embeds: [updatedEmbed], 
                    components: [] // Remove buttons
                });

                // The bounty is already in the bounty-board channel, so no need to post again
                // The message has been updated to show it's approved

            } else {
                // Reject the bounty
                bounty.status = 'rejected';
                bounty.rejectedBy = interaction.user.id;
                bounty.rejectedAt = new Date().toISOString();
                saveBountyData();

                // Update the approval message
                const updatedEmbed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('❌ Bounty Request - Rejected')
                    .setDescription(`**Target:** ${bounty.title}`)
                    .addFields(
                        { name: 'Reason', value: bounty.description, inline: false },
                        { name: 'Requester', value: `<@${bounty.requester}> (${bounty.requesterName})`, inline: true },
                        { name: 'Rejected By', value: `<@${interaction.user.id}> (${interaction.user.username})`, inline: true },
                        { name: 'Bounty ID', value: bountyId, inline: false }
                    )
                    .setFooter({ text: 'This bounty has been rejected' })
                    .setTimestamp();

                await interaction.update({ 
                    embeds: [updatedEmbed], 
                    components: [] // Remove buttons
                });
            }
        }

    } catch (error) {
        console.error('Error handling button interaction:', error);
        const errorMessage = { content: '❌ There was an error while processing this action!', ephemeral: true };
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
});

// Handle message reactions (for bounty proof approval)
client.on(Events.MessageReactionAdd, async (reaction, user) => {
    try {
        // Ignore bot reactions
        if (user.bot) return;

        // Fetch the message if it's a partial
        const message = reaction.message.partial ? await reaction.message.fetch() : reaction.message;
        
        // Get the channel
        const channel = message.channel;
        
        // Get the guild and member who reacted
        const guild = message.guild;
        if (!guild) return;

        const member = await guild.members.fetch(user.id);
        if (!member) return;

        // Handle mission proof approval (✅ reaction on mission-proof channel)
        if (reaction.emoji.name === '✅') {
            const missionProofChannelId = config.MISSION_PROOF_CHANNEL_ID;
            if (missionProofChannelId && channel.id === missionProofChannelId) {
                // Check if user is grandmaster or has Executive role
                const hasExecutiveRole = hasRole(member, 'Executive');
                if (!isGrandmaster(member) && !hasExecutiveRole) {
                    // Remove the reaction if user doesn't have permission
                    await reaction.remove();
                    return;
                }

                // Find mission ID from message
                let missionId = null;
                let completedByUserId = message.author.id;
                let completedByUsername = message.author.username;

                // Check if message has embeds
                if (message.embeds.length > 0) {
                    const embed = message.embeds[0];
                    if (embed.fields) {
                        const missionIdField = embed.fields.find(field => 
                            field.name.toLowerCase().includes('mission id')
                        );
                        if (missionIdField) {
                            missionId = missionIdField.value.trim();
                        }
                    }
                    if (!missionId) {
                        const description = embed.description || '';
                        const title = embed.title || '';
                        const missionIdMatch = (description + ' ' + title).match(/mission[_\s-]?id[:\s]*([a-z0-9]+)/i);
                        if (missionIdMatch) {
                            missionId = missionIdMatch[1];
                        }
                    }
                }

                // Also check message content for mission ID
                if (!missionId && message.content) {
                    const missionIdMatch = message.content.match(/mission[_\s-]?id[:\s]*([a-z0-9]+)/i);
                    if (missionIdMatch) {
                        missionId = missionIdMatch[1];
                    }
                }

                // If we found a mission ID, approve the proof
                if (missionId && missions[missionId]) {
                    const mission = missions[missionId];
                    
                    // Check if mission was accepted by this user
                    if (mission.acceptedBy === completedByUserId) {
                        // Check if reward already claimed
                        if (mission.rewardClaimed) {
                            return; // Already processed, ignore
                        }

                        // Handle both 'accepted' status and 'proof_approved' status (in case proof was approved but coins not awarded)
                        const shouldAwardCoins = mission.status === 'accepted' || mission.status === 'proof_approved';
                        
                        if (shouldAwardCoins) {
                            // Award coins immediately
                            coins[completedByUserId] = (coins[completedByUserId] || 0) + mission.coinReward;
                            saveCoinsData();

                            // Get user's current coin balance
                            const userCoins = coins[completedByUserId];

                            // Update mission status to proof_approved and mark reward as claimed
                            missions[missionId].status = 'proof_approved';
                            missions[missionId].proofApprovedAt = new Date().toISOString();
                            missions[missionId].approvedBy = user.id;
                            missions[missionId].approvedByName = user.username;
                            missions[missionId].rewardClaimed = true;
                            missions[missionId].rewardClaimedAt = new Date().toISOString();
                            saveMissionData();

                            // Create proof approved embed showing coins were awarded
                            const approvedEmbed = new EmbedBuilder()
                                .setColor(0x00FF00)
                                .setTitle('✅ Mission Proof Approved!')
                                .setDescription(`**${completedByUsername}**'s proof has been approved and coins have been awarded!`)
                                .addFields(
                                    { name: 'Mission ID', value: missionId, inline: false },
                                    { name: 'Difficulty', value: mission.difficulty, inline: true },
                                    { name: '💰 Coins Awarded', value: `+${mission.coinReward}`, inline: true },
                                    { name: 'Total Coins', value: userCoins.toString(), inline: true },
                                    { name: 'Approved By', value: `<@${user.id}> (${user.username})`, inline: true }
                                )
                                .setFooter({ text: 'Coins have been automatically added to your balance' })
                                .setTimestamp();

                            // Send DM to the user
                            try {
                                const completedUser = await client.users.fetch(completedByUserId);
                                await completedUser.send({ 
                                    embeds: [approvedEmbed]
                                });
                            } catch (dmError) {
                                console.log(`Could not send DM to user ${completedByUsername}:`, dmError.message);
                            }

                            // Also reply to the proof message
                            await message.reply({ 
                                embeds: [approvedEmbed]
                            });
                        }
                    }
                }
                return;
            }
        }

        // Handle bounty proof approval (existing code)
        if (reaction.emoji.name === '✅') {
            const bountyProofChannelId = config.BOUNTY_PROOF_CHANNEL_ID || config.NOTIFICATION_CHANNEL_ID;
            if (bountyProofChannelId && channel.id === bountyProofChannelId) {
                // Check if user is grandmaster or has Executive role
                const hasExecutiveRole = hasRole(member, 'Executive');
                if (!isGrandmaster(member) && !hasExecutiveRole) {
                    // Remove the reaction if user doesn't have permission
                    await reaction.remove();
                    return;
                }

                // Find bounty ID from message (check embed fields or message content)
                let bountyId = null;
                let completedByUserId = message.author.id;
                let completedByUsername = message.author.username;

                // Check if message has embeds
                if (message.embeds.length > 0) {
                    const embed = message.embeds[0];
                    // Look for Bounty ID in embed fields
                    if (embed.fields) {
                        const bountyIdField = embed.fields.find(field => 
                            field.name.toLowerCase().includes('bounty id') || 
                            field.name.toLowerCase().includes('bountyid')
                        );
                        if (bountyIdField) {
                            bountyId = bountyIdField.value.trim();
                        }
                    }
                    // Also check embed description or title for bounty ID
                    if (!bountyId) {
                        const description = embed.description || '';
                        const title = embed.title || '';
                        const bountyIdMatch = (description + ' ' + title).match(/bounty[_\s-]?id[:\s]*([a-z0-9]+)/i);
                        if (bountyIdMatch) {
                            bountyId = bountyIdMatch[1];
                        }
                    }
                }

                // Also check message content for bounty ID
                if (!bountyId && message.content) {
                    const bountyIdMatch = message.content.match(/bounty[_\s-]?id[:\s]*([a-z0-9]+)/i);
                    if (bountyIdMatch) {
                        bountyId = bountyIdMatch[1];
                    }
                }

                // If we found a bounty ID, try to get bounty info
                let bounty = null;
                if (bountyId && bounties[bountyId]) {
                    bounty = bounties[bountyId];
                }

                // Award 250 coins to the user who posted the proof
                const coinsToAward = 250;
                coins[completedByUserId] = (coins[completedByUserId] || 0) + coinsToAward;
                saveCoinsData();

                // Get user's current coin balance
                const userCoins = coins[completedByUserId];

                // Update bounty status if we found the bounty
                if (bounty) {
                    bounty.status = 'completed';
                    bounty.completedBy = completedByUserId;
                    bounty.completedAt = new Date().toISOString();
                    bounty.approvedBy = user.id;
                    saveBountyData();
                }

                // Create completed bounty embed
                const completedEmbed = new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setTitle('✅ Bounty Completed!')
                    .setDescription(`**${completedByUsername}** has successfully completed a bounty!`)
                    .addFields(
                        { name: '💰 Coins Awarded', value: `+${coinsToAward}`, inline: true },
                        { name: 'Total Coins', value: userCoins.toString(), inline: true },
                        { name: 'Approved By', value: `<@${user.id}> (${user.username})`, inline: true }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'ShadowBot' });

                if (bounty) {
                    completedEmbed.addFields(
                        { name: 'Target', value: bounty.title, inline: false },
                        { name: 'Reason', value: bounty.description, inline: false },
                        { name: 'Bounty ID', value: bountyId, inline: false }
                    );
                } else if (bountyId) {
                    completedEmbed.addFields({ name: 'Bounty ID', value: bountyId, inline: false });
                }

                // Post to completed-bounties channel
                const completedBountiesChannelId = config.COMPLETED_BOUNTIES_CHANNEL_ID || config.NOTIFICATION_CHANNEL_ID;
                if (completedBountiesChannelId && completedBountiesChannelId !== 'your_channel_id_here') {
                    const completedChannel = client.channels.cache.get(completedBountiesChannelId);
                    if (completedChannel) {
                        await completedChannel.send({ embeds: [completedEmbed] });
                    }
                }

                // Send DM to the user who completed the bounty
                try {
                    const completedUser = await client.users.fetch(completedByUserId);
                    await completedUser.send({ embeds: [completedEmbed] });
                } catch (dmError) {
                    console.log(`Could not send DM to user ${completedByUsername}:`, dmError.message);
                }
            }
        }

    } catch (error) {
        console.error('Error handling message reaction:', error);
    }
});

// Handle errors
client.on(Events.Error, error => {
    console.error('Discord client error:', error);
});

// Handle warnings
process.on('warning', warning => {
    console.warn('Warning:', warning);
});

// Webhook endpoints for Roblox integration
app.post('/webhook/roblox-event', async (req, res) => {
    try {
        const { robloxUserId, eventType, points, description, username } = req.body;

        // Validate required fields
        if (!robloxUserId || !eventType || !points) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Find Discord user linked to this Roblox account
        let discordUserId = null;
        for (const [discordId, data] of Object.entries(robloxUsers)) {
            if (data.robloxId.toString() === robloxUserId.toString()) {
                discordUserId = discordId;
                break;
            }
        }

        if (!discordUserId) {
            console.log(`No Discord user found for Roblox ID: ${robloxUserId}`);
            return res.status(404).json({ error: 'Discord user not found for this Roblox account' });
        }

        // Add points to the user
        userPoints[discordUserId] = (userPoints[discordUserId] || 0) + points;
        saveUserPoints();

        // Get the Discord user
        const discordUser = await client.users.fetch(discordUserId);
        const userPointsAmount = userPoints[discordUserId];
        const currentRole = getUserCurrentRole(userPointsAmount);

        // Create event notification embed
        const eventEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('🎮 Roblox Event Completed!')
            .setDescription(`**${username || 'Player'}** completed an event in the game!`)
            .addFields(
                { name: 'Event Type', value: eventType, inline: true },
                { name: 'Points Awarded', value: `+${points}`, inline: true },
                { name: 'Total Points', value: userPointsAmount.toString(), inline: true },
                { name: 'Current Role', value: currentRole, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'ShadowBot' });

        if (description) {
            eventEmbed.addFields({ name: 'Description', value: description, inline: false });
        }

        // Send notification to a specific channel (you can configure this)
        const notificationChannelId = config.NOTIFICATION_CHANNEL_ID;
        if (notificationChannelId) {
            const channel = client.channels.cache.get(notificationChannelId);
            if (channel) {
                await channel.send({ embeds: [eventEmbed] });
            }
        }

        // Send DM to the user
        try {
            await discordUser.send({ embeds: [eventEmbed] });
        } catch (dmError) {
            console.log(`Could not send DM to user ${discordUser.username}:`, dmError.message);
        }

        res.json({ 
            success: true, 
            message: 'Event processed successfully',
            discordUser: discordUser.username,
            newPoints: userPointsAmount,
            currentRole: currentRole
        });

    } catch (error) {
        console.error('Error processing Roblox event:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Webhook endpoint for bounty completion
app.post('/webhook/bounty-complete', async (req, res) => {
    try {
        const { discordUserId, bountyId, username } = req.body;

        // Validate required fields
        if (!discordUserId) {
            return res.status(400).json({ error: 'Missing required field: discordUserId' });
        }

        // Award 250 coins for completing a bounty
        const coinsToAward = 250;
        coins[discordUserId] = (coins[discordUserId] || 0) + coinsToAward;
        saveCoinsData();

        // Get the Discord user
        const discordUser = await client.users.fetch(discordUserId);
        const userCoins = coins[discordUserId];

        // Create bounty completion notification embed
        const bountyEmbed = new EmbedBuilder()
            .setColor(0xFFD700)
            .setTitle('🎯 Bounty Completed!')
            .setDescription(`**${username || discordUser.username}** completed a bounty!`)
            .addFields(
                { name: 'Coins Awarded', value: `+${coinsToAward}`, inline: true },
                { name: 'Total Coins', value: userCoins.toString(), inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'ShadowBot' });

        if (bountyId) {
            bountyEmbed.addFields({ name: 'Bounty ID', value: bountyId, inline: false });
        }

        // Send notification to a specific channel (if configured)
        const notificationChannelId = config.NOTIFICATION_CHANNEL_ID;
        if (notificationChannelId) {
            const channel = client.channels.cache.get(notificationChannelId);
            if (channel) {
                await channel.send({ embeds: [bountyEmbed] });
            }
        }

        // Send DM to the user
        try {
            await discordUser.send({ embeds: [bountyEmbed] });
        } catch (dmError) {
            console.log(`Could not send DM to user ${discordUser.username}:`, dmError.message);
        }

        res.json({ 
            success: true, 
            message: 'Bounty completion processed successfully',
            discordUser: discordUser.username,
            coinsAwarded: coinsToAward,
            totalCoins: userCoins
        });

    } catch (error) {
        console.error('Error processing bounty completion:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        bot: client.isReady() ? 'online' : 'offline',
        timestamp: new Date().toISOString()
    });
});

// Start Express server with error handling
const server = app.listen(PORT, () => {
    console.log(`Webhook server running on port ${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use!`);
        console.log('💡 Try one of these solutions:');
        console.log('1. Kill the process using port ' + PORT + ':');
        console.log('   Windows: netstat -ano | findstr :' + PORT);
        console.log('   Then: taskkill /PID <PID> /F');
        console.log('2. Use a different port by setting PORT environment variable:');
        console.log('   set PORT=3002 && npm start');
        console.log('3. Or modify the PORT in your config file');
        process.exit(1);
    } else {
        console.error('❌ Error starting webhook server:', err);
        process.exit(1);
    }
});

// Login to Discord with your client's token
client.login(config.DISCORD_TOKEN);
