import { Events, InteractionType } from 'discord.js';

export default {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: 'There was an error while executing this command!',
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: 'There was an error while executing this command!',
            ephemeral: true,
          });
        }
      }
    } else if (interaction.isButton()) {
      // Check specific interaction handlers by customId prefix or exact match
      // e.g. customId: 'apply_start' -> handled by an interaction handler for 'apply_start'
      // We can iterate over the interaction handlers and find the matching one
      let handler = client.interactions.get(interaction.customId);

      // If it has dynamic parts e.g. "reject_123", we might need prefix matching
      if (!handler) {
        const prefix = interaction.customId.split('_')[0];
        handler = client.interactions.find(
          (i) => interaction.customId.startsWith(i.id) && i.type === 'button_prefix',
        );
      }

      if (handler) {
        try {
          await handler.execute(interaction, client);
        } catch (error) {
          console.error(error);
        }
      }
    } else if (interaction.type === InteractionType.ModalSubmit) {
      let handler = client.interactions.get(interaction.customId);

      if (!handler) {
        const prefix = interaction.customId.split('_')[0];
        handler = client.interactions.find(
          (i) => interaction.customId.startsWith(i.id) && i.type === 'modal_prefix',
        );
      }

      if (handler) {
        try {
          await handler.execute(interaction, client);
        } catch (error) {
          console.error(error);
        }
      }
    }
  },
};
