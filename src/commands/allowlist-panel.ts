import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import config from '../config/config';
import QuestionService from '../services/QuestionService';

export default {
  data: new SlashCommandBuilder()
    .setName('allowlist-panel')
    .setDescription('Create the allowlist application panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, client) {
    // Reload questions when panel is posted
    QuestionService.reload();

    const embed = new EmbedBuilder()
      .setTitle("👑 DADDY'S ROLEPLAY\n\nALLOWLIST MANAGER")
      .setDescription(
        "Welcome to Daddy's Roleplay.\n\nBefore applying, please read all server rules carefully.\n\nYour application will be reviewed by our Staff Team.\n\nPlease answer every question honestly and with detailed responses.\n\nFalse information may result in rejection.",
      )
      .setColor(config.embeds.colors.primary as any)
      .setImage(config.embeds.banner)
      .setThumbnail(config.embeds.logo)
      .setFooter({ text: config.embeds.footer.text, iconURL: config.embeds.footer.iconURL });

    const button = new ButtonBuilder()
      .setCustomId('apply_start')
      .setLabel('📩 Apply for Allowlist')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    await interaction.reply({ content: 'Panel created successfully!', ephemeral: true });
    await interaction.channel.send({ embeds: [embed], components: [row] });
  },
};
