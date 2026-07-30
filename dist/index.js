"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RPForms_1 = require("./core/RPForms");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const discord_js_1 = require("discord.js");
const init_1 = require("./database/init");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMembers,
        discord_js_1.GatewayIntentBits.GuildMessages,
    ]
});
client.commands = new discord_js_1.Collection();
client.interactions = new discord_js_1.Collection();
async function startBot() {
    try {
        // 1. Initialize Database
        await (0, init_1.initDatabase)();
        // 2. Load Handlers
        const handlersPath = path_1.default.join(__dirname, 'handlers');
        const handlerFiles = fs_1.default.readdirSync(handlersPath).filter(file => file.endsWith('.js'));
        for (const file of handlerFiles) {
            const handler = require(path_1.default.join(handlersPath, file));
            (handler.default || handler)(client);
        }
        // 3. Login
        await RPForms_1.RPForms.init();
        await client.login(process.env.DISCORD_TOKEN);
        console.log('\n================================');
        console.log('   RPForms v1.0.0 Initialized   ');
        console.log('================================');
        console.log(`[Database] Connected to MariaDB`);
        console.log(`[Forms] Loaded ${RPForms_1.RPForms.forms.getForms().length} templates`);
        const errors = RPForms_1.RPForms.forms.getValidationErrors();
        if (errors.size > 0) {
            console.log(`[Forms] ⚠️ Warning: ${errors.size} forms failed validation.`);
        }
        console.log('================================\n');
    }
    catch (error) {
        console.error('\n[Fatal] Failed to start the bot:', error);
        process.exit(1);
    }
}
startBot();
