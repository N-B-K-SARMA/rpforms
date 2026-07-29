import { RPForms } from '../core/RPForms';

export default {
  id: 'apply_start',
  type: 'button_prefix',

  async execute(interaction: any, client: any) {
    const memberRoles = interaction.member.roles.cache.map((r: any) => r.id);
    
    const result = await RPForms.applications.startApplication({
      userId: interaction.user.id,
      formId: 'allowlist'
    }, memberRoles);

    if (result.error) {
      await interaction.reply({ content: result.message, ephemeral: true });
    } else {
      await interaction.reply({ ...result.ui, ephemeral: true });
    }
  },
};
