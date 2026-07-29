import ApplicationService from '../services/ApplicationService';
import AnswerModel from '../models/Answer';
import QuestionService from '../services/QuestionService';
import StaffReviewService from '../services/StaffReviewService';

export default {
  id: 'app_', // prefix for application flow
  type: 'button_prefix',

  async execute(interaction, client) {
    const parts = interaction.customId.split('_');
    const action = parts[1]; // continue, cancel, prev, next, answer, edit, submit
    const appId = parseInt(parts[2]);
    const qIndex = parseInt(parts[3]);

    if (action === 'continue') {
      await ApplicationService.showQuestion(interaction, appId, 0);
    } else if (action === 'cancel') {
      await interaction.update({ content: 'Application cancelled.', embeds: [], components: [] });
      // optionally clean up db or set status to cancelled
    } else if (action === 'prev') {
      await ApplicationService.showQuestion(interaction, appId, qIndex - 1);
    } else if (action === 'next') {
      await ApplicationService.showQuestion(interaction, appId, qIndex + 1);
    } else if (action === 'answer') {
      await ApplicationService.showAnswerModal(interaction, appId, qIndex);
    } else if (action === 'edit') {
      await ApplicationService.showQuestion(interaction, appId, 0);
    } else if (action === 'submit') {
      // submit application
      await StaffReviewService.submitApplication(interaction, client, appId);
    }
  },
};
