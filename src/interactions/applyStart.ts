import { RPForms } from '../core/RPForms';

export default {
  id: 'apply_start',
  type: 'button_prefix',

  async execute(interaction: any, client: any) {
    const memberRoles = interaction.member.roles.cache.map((r: any) => r.id);
    
    // customId is 'apply_start_formId' or just 'apply_start' for legacy panels
    const parts = interaction.customId.split('_');
    const formId = parts[2] || 'allowlist';

    const result = await RPForms.applications.startApplication({
      userId: interaction.user.id,
      formId: formId
    }, memberRoles);

    if (result.error) {
      await interaction.reply({ ...result.ui, ephemeral: true });
    } else {
      await interaction.reply({ ...result.ui, ephemeral: true });
    }
  },
};
