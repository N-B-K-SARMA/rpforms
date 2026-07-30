import { RPForms } from "./core/RPForms";
import dotenv from 'dotenv';
dotenv.config();
import { Client, GatewayIntentBits, Collection } from 'discord.js';

declare module 'discord.js' {
    interface Client {
        commands: Collection<any, any>;
        interactions: Collection<any, any>;
    }
}

import { initDatabase } from './database/init';
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
        const handlersPath = path.join(__dirname, 'handlers');
        const handlerFiles = fs.readdirSync(handlersPath).filter(file => file.endsWith('.js'));
        
        for (const file of handlerFiles) {
            const handler = require(path.join(handlersPath, file));
            (handler.default || handler)(client);
        }
        
        // 3. Login
        await RPForms.init();
        await client.login(process.env.DISCORD_TOKEN);
        
        console.log('\n================================');
        console.log('   RPForms v1.0.0 Initialized   ');
        console.log('================================');
        console.log(`[Database] Connected to MariaDB`);
        console.log(`[Forms] Loaded ${RPForms.forms.getForms().length} templates`);
        
        const errors = RPForms.forms.getValidationErrors();
        if (errors.size > 0) {
            console.log(`[Forms] ⚠️ Warning: ${errors.size} forms failed validation.`);
        }
        
        console.log('================================\n');
    } catch (error) {
        console.error('\n[Fatal] Failed to start the bot:', error);
        process.exit(1);
    }
}

startBot();
