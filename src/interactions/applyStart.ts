import ApplicationService from '../services/ApplicationService';

export default {
  id: 'apply_start',
  type: 'button_prefix', // Exact match fallback handled by custom logic in interactionCreate

  async execute(interaction, client) {
    await ApplicationService.startApplication(interaction);
  },
};
