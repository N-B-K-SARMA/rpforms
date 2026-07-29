import { RPForms } from '../core/RPForms';
import { ApplicationUIBuilder } from '../builders/ApplicationUIBuilder';

export default {
  id: 'app_', // prefix for application flow
  type: 'button_prefix',

  async execute(interaction: any, client: any) {
    const parts = interaction.customId.split('_');
    const action = parts[1]; // continue, cancelConfirm, cancel, prev, next, answer, edit, submit
    const appId = parseInt(parts[2]);
    const qIndex = parseInt(parts[3]) || 0;

    const request = {
      userId: interaction.user.id,
      appId,
      qIndex
    };

    if (action === 'continue' || action === 'edit') {
      request.qIndex = 0;
      const result = await RPForms.applications.showQuestion(request);
      if (result && result.ui) await interaction.update(result.ui);
    } else if (action === 'cancelConfirm') {
        const form = RPForms.forms.getForm('allowlist');
        if (form) {
            const ui = ApplicationUIBuilder.buildCancelConfirmEmbed(appId, form);
            await interaction.update(ui);
        } else {
            await interaction.update(ApplicationUIBuilder.buildErrorEmbed('Form configuration missing.'));
        }
    } else if (action === 'cancel') {
      await interaction.update({ content: 'Application cancelled.', embeds: [], components: [] });
      RPForms.events.emit('applicationClose', request);
    } else if (action === 'prev') {
      request.qIndex = qIndex - 1;
      const result = await RPForms.applications.showQuestion(request);
      if (result && result.ui) await interaction.update(result.ui);
    } else if (action === 'next') {
      request.qIndex = qIndex + 1;
      const result = await RPForms.applications.showQuestion(request);
      if (result && result.ui) await interaction.update(result.ui);
    } else if (action === 'answer') {
      const result = await RPForms.applications.showAnswerModal(request);
      if (result && result.modal) await interaction.showModal(result.modal);
    } else if (action === 'submit') {
      const result = await RPForms.reviews.submitApplication(appId, `<@${interaction.user.id}>`, interaction.user.id);
      
      const guild = interaction.guild;
      const staffChannel = guild.channels.cache.get(result.staffChannelId);
      
      if (staffChannel) {
        const form = RPForms.forms.getForm('allowlist');
        let staffPing = '@here';
        if (form && form.review.pingRoles && form.review.pingRoles.length > 0) {
            staffPing = form.review.pingRoles.map(r => `<@&${r}>`).join(' ');
        } else if (RPForms.config.getAll().roles.staff && RPForms.config.getAll().roles.staff.length > 0) {
            staffPing = `<@&${RPForms.config.getAll().roles.staff[0]}>`;
        }
          
        await staffChannel.send({
          content: `${staffPing} A new application has been submitted by <@${interaction.user.id}>!`,
          ...result.ui
        });
      }

      const form = RPForms.forms.getForm('allowlist');
      if (form) {
          const confirmUi = ApplicationUIBuilder.buildSubmissionConfirmationEmbed(appId, form);
          await interaction.update(confirmUi);
      } else {
          await interaction.update({
            content: 'Your application has been submitted for review!',
            embeds: [],
            components: [],
          });
      }
    }
  },
};
