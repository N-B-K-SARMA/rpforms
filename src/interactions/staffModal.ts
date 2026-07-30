import { RPForms } from '../core/RPForms';
import { EmbedBuilder } from 'discord.js';
import ApplicationModel from '../models/Application';

export default {
  id: 'staffmodal_',
  type: 'modal_prefix',

  async execute(interaction: any, client: any) {
    const parts = interaction.customId.split('_');
    const action = parts[1]; // reject, review
    const appId = parseInt(parts[2]);

    const app = await ApplicationModel.getApplicationById(appId);
    const form = app ? RPForms.forms.getForm(app.form_id) : null;

    const adminRoles = RPForms.config.getAll().roles.admin || [];
    const globalStaffRoles = RPForms.config.getAll().roles.staff || [];
    const formStaffRoles = form?.review?.reviewerRoles || [];
    
    const allowedRoles = [...adminRoles, ...globalStaffRoles, ...formStaffRoles];
    const hasPermission = allowedRoles.some((roleId: string) => interaction.member.roles.cache.has(roleId));

    if (!hasPermission) {
        return interaction.reply({ content: 'You do not have permission to review applications.', ephemeral: true });
    }

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
        const updatedEmbed = EmbedBuilder.from(originalEmbed);
        updatedEmbed.setColor(RPForms.config.getAll().embeds.colors.danger as any);
        if (updatedEmbed.data.description) {
            updatedEmbed.setDescription(updatedEmbed.data.description.replace('🟡 Pending Review', '🔴 Rejected'));
        }
        
        await interaction.update({ embeds: [updatedEmbed], components: [] });
      } else if (action === 'review') {
        await interaction.reply({ content: 'Review requested sent to user!', ephemeral: true });
      }
    }
  },
};
