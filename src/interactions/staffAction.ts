import { RPForms } from '../core/RPForms';
import { EmbedBuilder } from 'discord.js';

export default {
  id: 'staff_',
  type: 'button_prefix',

  async execute(interaction: any, client: any) {
    const form = RPForms.forms.getForm('allowlist');
    if (form?.review?.reviewerRoles) {
        const hasRole = form.review.reviewerRoles.some((roleId: string) => interaction.member.roles.cache.has(roleId));
        if (!hasRole) {
            return interaction.reply({ content: 'You do not have permission to review applications.', ephemeral: true });
        }
    }

    const parts = interaction.customId.split('_');
    const action = parts[1]; // approve, reject, review, close, history
    const appId = parseInt(parts[2]);
    const applicantId = parts[3];

    const request = {
      appId,
      action,
      applicantId,
      staffId: interaction.user.id
    };

    const result = await RPForms.reviews.processAction(request);
    
    if (result.modal) {
      await interaction.showModal(result.modal);
    } else if (result.ui && action === 'history') {
      await interaction.reply(result.ui);
    } else if (result.ui && action === 'close') {
      await interaction.update(result.ui);
    } else if (result.success) {
      const originalEmbed = interaction.message.embeds[0];
      
      const updatedEmbed = { ...originalEmbed.data };
      if (action === 'approve') {
          updatedEmbed.color = RPForms.config.getAll().embeds.colors.success;
          const statusField = updatedEmbed.fields.find((f: any) => f.name === 'Status');
          if (statusField) statusField.value = '🟢 Approved';
      }
      
      await interaction.update({ embeds: [updatedEmbed], components: [] });
    } else if (result.error) {
        await interaction.reply({ content: `Error: ${result.error}`, ephemeral: true });
    }
  },
};
