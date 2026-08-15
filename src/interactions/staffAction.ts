import { RPForms } from '../core/RPForms';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder } from 'discord.js';
import ApplicationModel from '../models/Application';

export default {
  id: 'staff_',
  type: 'button_prefix',

  async execute(interaction: any, client: any) {
    const parts = interaction.customId.split('_');
    const action = parts[1]; // approve, reject, review, close, history
    const appId = parseInt(parts[2]);
    const applicantId = parts[3];

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

    const request = {
      appId,
      action,
      applicantId,
      staffId: interaction.user.id
    };

    let warningMsg = '';
    if (form && action === 'approve') {
        const logChannelId = form.actions?.onApprove?.logChannelId;
        if (logChannelId && !interaction.guild.channels.cache.get(logChannelId)) {
            warningMsg = '⚠️ The application was approved, but the configured response log channel could not be found. Please check your configuration.';
        }
    }

    const result = await RPForms.reviews.processAction(request);
    
    if (result.modal) {
      await interaction.showModal(result.modal);
    } else if (result.ui && action === 'history') {
      await interaction.reply(result.ui);
    } else if (result.ui && action === 'close') {
      await interaction.update(result.ui);
    } else if (result.success) {
      const originalEmbed = interaction.message.embeds[0];
      const updatedEmbed = EmbedBuilder.from(originalEmbed);
      
      if (action === 'approve') {
          updatedEmbed.setColor(RPForms.config.getAll().embeds.colors.success as any);
          if (updatedEmbed.data.description) {
              // Be robust against existing strange characters in the previous status
              updatedEmbed.setDescription(updatedEmbed.data.description.replace(/.*Pending Review.*/, '**Status**\n🟢 Approved'));
          }
      }
      
      const newComponents = interaction.message.components.map((row: any) => {
          return ActionRowBuilder.from(row).setComponents(
              row.components.map((c: any) => {
                  const btn = ButtonBuilder.from(c as any);
                  const id = c.customId || '';
                  if (id.includes('staff_approve_') || id.includes('staff_reject_') || id.includes('staff_review_')) {
                      btn.setDisabled(true);
                  }
                  return btn;
              })
          );
      });
      
      await interaction.update({ embeds: [updatedEmbed], components: newComponents as any[] });

      if (warningMsg) {
          await interaction.followUp({ content: warningMsg, ephemeral: true });
      }
    } else if (result.error) {
        await interaction.reply({ content: `Error: ${result.error}`, ephemeral: true });
    }
  },
};
