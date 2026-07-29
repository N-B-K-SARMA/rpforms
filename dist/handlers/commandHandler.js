"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const discord_js_1 = require("discord.js");
exports.default = async (client) => {
    const commandsPath = path_1.default.join(__dirname, '..', 'commands');
    const commandFiles = fs_1.default.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
    const commands = [];
    for (const file of commandFiles) {
        const command = require(path_1.default.join(commandsPath, file));
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON());
        }
        else {
            console.log(`[WARNING] The command at ${file} is missing a required "data" or "execute" property.`);
        }
    }
    const rest = new discord_js_1.REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);
        // Use client ID from env, or a placeholder if missing (will fail gracefully)
        if (process.env.CLIENT_ID) {
            await rest.put(discord_js_1.Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
            console.log(`Successfully reloaded ${commands.length} application (/) commands.`);
        }
        else {
            console.log('[WARNING] CLIENT_ID not provided in .env. Slash commands will not be registered globally until it is set.');
        }
    }
    catch (error) {
        console.error(error);
    }
};
