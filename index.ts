import dotenv from 'dotenv';
dotenv.config();
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { initDatabase } from './src/database/init';
import fs from 'fs';
import path from 'path';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
    ]
});

client.commands = new Collection();
client.interactions = new Collection();

async function startBot() {
    try {
        // 1. Initialize Database
        await initDatabase();
        
        // 2. Load Handlers
        const handlersPath = path.join(__dirname, 'src', 'handlers');
        const handlerFiles = fs.readdirSync(handlersPath).filter(file => file.endsWith('.js'));
        
        for (const file of handlerFiles) {
            require(path.join(handlersPath, file))(client);
        }
        
        // 3. Login
        await client.login(process.env.DISCORD_TOKEN);
    } catch (error) {
        console.error('Failed to start the bot:', error);
        process.exit(1);
    }
}

startBot();
