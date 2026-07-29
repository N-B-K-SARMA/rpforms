import { Events } from 'discord.js';
import { registerApplicationEvents } from './framework/ApplicationEvents';

export default {
  name: Events.ClientReady,
  once: true,
  execute(client: any) {
    registerApplicationEvents(client);
    console.log(`✓ Bot Ready! Logged in as ${client.user.tag}`);
  },
};
