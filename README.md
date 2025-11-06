# Discord ShadowBot

A Discord bot built with Node.js and Discord.js for managing game server roles and providing server information.

## Features

- **Slash Commands**: Modern Discord slash command interface
- **Point System**: Track user points and manage role progression
- **Role Management**: Automatic role updates based on points
- **7-Tier Ranking System**: Bronze → Silver → Gold → Platinum → Diamond → Master → Grandmaster
- **Admin Controls**: Add points to users with admin permissions
- **Server Information**: Display server stats and information
- **Roblox Integration**: Link Discord accounts to Roblox accounts
- **Game Event Webhooks**: Automatically award points for in-game events
- **Real-time Notifications**: Get notified when players complete events
- **Challenge System**: Players can challenge each other to fights
- **Fight Simulation**: Automated fight results with round-by-round details
- **Challenge Statistics**: Track wins, losses, streaks, and leaderboards

## Setup

### Prerequisites

- Node.js (version 16.9.0 or higher)
- A Discord application and bot token

### Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a Discord application:
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Click "New Application"
   - Give your bot a name
   - Go to the "Bot" section
   - Click "Add Bot"
   - Copy the bot token

4. Configure your bot:
   - Copy `config.example.js` to `config.js`
   - Replace `your_bot_token_here` with your actual bot token
   - Replace `your_client_id_here` with your application's Client ID (found in General Information)

5. Invite your bot to a server:
   - Go to the "OAuth2" > "URL Generator" section
   - Select "bot" and "applications.commands" scopes
   - Select necessary permissions (Send Messages, Read Message History, Manage Roles, etc.)
   - Copy the generated URL and open it in your browser
   - Select a server and authorize the bot

6. Deploy slash commands:
   ```bash
   npm run deploy-commands
   ```

7. Setup roles (optional):
   ```bash
   npm run setup-roles
   ```

### Running the Bot

```bash
# Start the bot
npm start

# Start with auto-restart on file changes (development)
npm run dev
```

## Slash Commands

- `/ping` - Check if the bot is responding
- `/help` - Show help information and available commands
- `/serverinfo` - Display server information
- `/points` - Check your current points and role status
- `/update` - Update your role based on your current points
- `/addpoints <user> <amount>` - Add points to a user (Admin only)
- `/roles` - Show available roles and their point requirements
- `/verify <username>` - Link your Discord account to your Roblox account
- `/unverify` - Unlink your Discord account from Roblox
- `/profile` - View your linked Roblox profile and stats
- `/challenge <player> [rounds]` - Challenge another player to a fight
- `/accept` - Accept a pending challenge
- `/decline` - Decline a pending challenge
- `/challengestats` - View your challenge statistics
- `/challengeleaderboard` - View the challenge leaderboard

## Role System

The bot uses a 7-tier ranking system based on points:

| Role | Points Required | Color |
|------|----------------|-------|
| Bronze | 0 | Brown |
| Silver | 100 | Silver |
| Gold | 250 | Gold |
| Platinum | 500 | Light Gray |
| Diamond | 1000 | Light Blue |
| Master | 2000 | Purple |
| Grandmaster | 5000 | Orange |

## Roblox Integration

### Setup

1. **Deploy your bot** with the webhook server running
2. **Get your webhook URL**: `https://your-domain.com/webhook/roblox-event`
3. **Add the Roblox script** to your game (see `roblox-integration-example.lua`)
4. **Configure the webhook URL** in your Roblox script
5. **Users verify their accounts** using `/verify <username>`

### How It Works

1. Players use `/verify <username>` to link their Discord and Roblox accounts
2. When players complete events in your Roblox game, the game sends a webhook
3. The bot automatically awards points to the linked Discord user
4. Players receive notifications about their points and can use `/update` to get new roles

### Webhook Format

Your Roblox game should send POST requests to `/webhook/roblox-event` with this format:

```json
{
    "robloxUserId": 123456789,
    "eventType": "Kill",
    "points": 10,
    "description": "Killed another player",
    "username": "PlayerName"
}
```

### Event Types

- `Kill` - Player kills another player
- `Win` - Player wins a round/game
- `LevelUp` - Player levels up
- `QuestComplete` - Player completes a quest
- `DailyLogin` - Daily login bonus
- `SpecialEvent` - Special event participation

## Challenge System

### How It Works

1. **Challenge a Player**: Use `/challenge <player> [rounds]` to challenge another player
2. **Accept/Decline**: The challenged player can use `/accept` or `/decline`
3. **Fight Simulation**: The bot simulates a fight with round-by-round results
4. **Points Awarded**: Winner gets 25 points, loser gets 5 points, draw gives 10 points each
5. **Statistics Tracked**: Wins, losses, draws, win streaks, and leaderboards

### Challenge Features

- **Cooldown System**: 5-minute cooldown between challenges
- **Round Options**: 1-5 rounds per fight (default: 3)
- **Fight Simulation**: Realistic fight results with round-by-round breakdown
- **Statistics**: Track individual and server-wide challenge statistics
- **Leaderboards**: See top fighters by wins
- **Point Integration**: Challenge points count toward role progression

### Challenge Commands

- `/challenge <player> [rounds]` - Challenge another player to a fight
- `/accept` - Accept a pending challenge
- `/decline` - Decline a pending challenge
- `/challengestats` - View your personal challenge statistics
- `/challengeleaderboard` - View the top 10 fighters

### Point Values

- **Winner**: +25 points
- **Loser**: +5 points
- **Draw**: +10 points each

## Bot Permissions

Make sure your bot has the following permissions:
- Send Messages
- Read Message History
- View Channels
- Embed Links
- Read Members
- Manage Roles
- Use Slash Commands

## Development

This bot is built with:
- [Discord.js](https://discord.js.org/) - Discord API wrapper
- [Node.js](https://nodejs.org/) - JavaScript runtime
- [dotenv](https://www.npmjs.com/package/dotenv) - Environment variable management
- [Express](https://expressjs.com/) - Web server for webhooks
- [Axios](https://axios-http.com/) - HTTP client for Roblox API

## License

MIT
