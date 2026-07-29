import StaffReviewService from '../services/StaffReviewService';

export default {
  id: 'staff_',
  type: 'button_prefix',

  async execute(interaction, client) {
    const parts = interaction.customId.split('_');
    const action = parts[1]; // approve, reject, review
    const appId = parseInt(parts[2]);

    await StaffReviewService.handleStaffAction(interaction, client, action, appId);
  },
};
