import { RPForms } from '../core/RPForms';

export default {
  id: 'staff_',
  type: 'button_prefix',

  async execute(interaction: any, client: any) {
    const parts = interaction.customId.split('_');
    const action = parts[1]; // approve, reject, review
    const appId = parseInt(parts[2]);

    const request = {
      appId,
      action,
      staffId: interaction.user.id
    };

    const result = await RPForms.reviews.processAction(request);
    
    if (result.modal) {
      await interaction.showModal(result.modal);
    } else if (result.success) {
      // Handled entirely by events
      // We still need to update the interaction visually? Or that happens in Event listeners.
      // But interaction.update is required so it doesn't fail.
      
      const originalEmbed = interaction.message.embeds[0];
      // We will let the event listener update the interaction message if we pass it along.
      // But for now, we pass the interaction to the event? No, we don't have interaction in DTO.
      // So we must handle the visual update here.
      
      const updatedEmbed = { ...originalEmbed.data };
      if (action === 'approve') {
          updatedEmbed.color = RPForms.config.getAll().embeds.colors.success;
          const statusField = updatedEmbed.fields.find((f: any) => f.name === 'Status');
          if (statusField) statusField.value = '🟢 Approved';
      }
      
      await interaction.update({ embeds: [updatedEmbed], components: [] });
    }
  },
};
