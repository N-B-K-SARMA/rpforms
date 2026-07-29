import { Events } from 'discord.js';
import { registerApplicationEvents } from './framework/ApplicationEvents';
import { RPForms } from '../core/RPForms';

export default {
  name: Events.ClientReady,
  once: true,
  execute(client: any) {
    registerApplicationEvents(client);
    
    // Check for application timeouts every minute
    setInterval(() => {
        RPForms.applications.handleTimeouts().catch(console.error);
    }, 60 * 1000);

    console.log(`✓ Bot Ready! Logged in as ${client.user.tag}`);
  },
};
