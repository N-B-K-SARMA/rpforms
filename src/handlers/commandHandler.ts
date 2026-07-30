import fs from 'fs';
import path from 'path';
import { REST, Routes } from 'discord.js';

export default async (client: any) => {
  const commandsPath = path.join(__dirname, '..', 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
  const commands = [];

  for (const file of commandFiles) {
    const req = require(path.join(commandsPath, file));
    const command = req.default || req;
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      commands.push(command.data.toJSON());
    } else {
      console.log(
        `[WARNING] The command at ${file} is missing a required "data" or "execute" property.`,
      );
    }
  }

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    // Use client ID from env, or a placeholder if missing (will fail gracefully)
    if (process.env.CLIENT_ID) {
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
      console.log(`Successfully reloaded ${commands.length} application (/) commands.`);
    } else {
      console.log(
        '[WARNING] CLIENT_ID not provided in .env. Slash commands will not be registered globally until it is set.',
      );
    }
  } catch (error) {
    console.error(error);
  }
};
