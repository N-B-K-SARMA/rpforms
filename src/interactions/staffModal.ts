import { RPForms } from '../core/RPForms';

export default {
  id: 'staffmodal_',
  type: 'modal_prefix',

  async execute(interaction: any, client: any) {
    const parts = interaction.customId.split('_');
    const action = parts[1]; // reject, review
    const appId = parseInt(parts[2]);

    const reason = interaction.fields.getTextInputValue('reasonText');

    const request = {
      appId,
      action,
      staffId: interaction.user.id,
      reason
    };

    const result = await RPForms.reviews.handleModal(request);

    if (result.success) {
      if (action === 'reject') {
        const originalEmbed = interaction.message.embeds[0];
        const updatedEmbed = { ...originalEmbed.data };
        updatedEmbed.color = RPForms.config.getAll().embeds.colors.danger;
        const statusField = updatedEmbed.fields.find((f: any) => f.name === 'Status');
        if (statusField) statusField.value = '🔴 Rejected';
        
        await interaction.update({ embeds: [updatedEmbed], components: [] });
      } else if (action === 'review') {
        await interaction.reply({ content: 'Review requested sent to user!', ephemeral: true });
      }
    }
  },
};
