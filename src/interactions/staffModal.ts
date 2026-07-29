import StaffReviewService from '../services/StaffReviewService';

export default {
  id: 'staffmodal_',
  type: 'modal_prefix',

  async execute(interaction, client) {
    const parts = interaction.customId.split('_');
    const action = parts[1]; // reject, review
    const appId = parseInt(parts[2]);

    await StaffReviewService.processModal(interaction, client, action, appId);
  },
};
