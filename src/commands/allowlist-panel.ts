import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { RPForms } from '../core/RPForms';

export default {
  data: new SlashCommandBuilder()
    .setName('allowlist-panel')
    .setDescription('Create the allowlist application panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: any, client: any) {
    RPForms.forms.reload();
    const form = RPForms.forms.getForm('allowlist');

    if (!form) {
      return interaction.reply({ content: 'Error: Form "allowlist" not found in config/forms', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle(form.metadata.title)
      .setDescription(form.metadata.description)
      .setColor(RPForms.config.getAll().embeds.colors.primary as any)
      .setImage(RPForms.config.getAll().embeds.banner)
      .setThumbnail(RPForms.config.getAll().embeds.logo)
      .setFooter({ text: RPForms.config.getAll().embeds.footer.text, iconURL: RPForms.config.getAll().embeds.footer.iconURL });

    const buttonStyle = form.button.style.toLowerCase() === 'success' ? ButtonStyle.Success 
                      : form.button.style.toLowerCase() === 'danger' ? ButtonStyle.Danger 
                      : form.button.style.toLowerCase() === 'secondary' ? ButtonStyle.Secondary
                      : ButtonStyle.Primary;

    const button = new ButtonBuilder()
      .setCustomId('apply_start')
      .setLabel(form.button.label)
      .setStyle(buttonStyle);

    const row = new ActionRowBuilder<any>().addComponents(button);

    await interaction.reply({ content: 'Panel created successfully!', ephemeral: true });
    await interaction.channel.send({ embeds: [embed], components: [row] });
  },
};
