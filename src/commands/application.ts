import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { getPool } from '../database/pool';
import fs from 'fs';
import path from 'path';
import config from '../config/config';

export default {
  data: new SlashCommandBuilder()
    .setName('application')
    .setDescription('Manage allowlist applications')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) =>
      subcommand
        .setName('user')
        .setDescription('View an application by user')
        .addUserOption((option) =>
          option.setName('target').setDescription('The user').setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('list').setDescription('List all pending applications'),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('delete')
        .setDescription('Delete an application')
        .addIntegerOption((option) =>
          option.setName('id').setDescription('Application ID').setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('export').setDescription('Export applications to JSON'),
    ),

  async execute(interaction, client) {
    const pool = getPool();
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'user') {
      const target = interaction.options.getUser('target');
      const [rows]: any = await pool.query(
        'SELECT * FROM applications WHERE discord_id = ? ORDER BY created_at DESC LIMIT 1',
        [target.id],
      );

      if (rows.length === 0)
        return interaction.reply({
          content: 'No applications found for this user.',
          ephemeral: true,
        });

      const app = rows[0];
      const embed = new EmbedBuilder()
        .setTitle(`Application Data for ${target.username}`)
        .addFields(
          { name: 'App ID', value: `${app.id}`, inline: true },
          { name: 'Status', value: app.status, inline: true },
          {
            name: 'Created At',
            value: `<t:${Math.floor(new Date(app.created_at).getTime() / 1000)}:R>`,
            inline: true,
          },
        )
        .setColor(config.embeds.colors.primary as any);

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else if (subcommand === 'list') {
      const [rows]: any = await pool.query(
        'SELECT * FROM applications WHERE status = "pending" ORDER BY created_at ASC LIMIT 10',
      );

      if (rows.length === 0)
        return interaction.reply({ content: 'No pending applications.', ephemeral: true });

      const embed = new EmbedBuilder()
        .setTitle('Pending Applications')
        .setColor(config.embeds.colors.primary as any);
      let desc = '';
      for (const app of rows) {
        desc += `**ID:** ${app.id} | **User:** <@${app.discord_id}> | **Date:** <t:${Math.floor(new Date(app.created_at).getTime() / 1000)}:R>\n`;
      }
      embed.setDescription(desc);

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else if (subcommand === 'delete') {
      const id = interaction.options.getInteger('id');
      await pool.query('DELETE FROM applications WHERE id = ?', [id]);
      await interaction.reply({ content: `Application #${id} has been deleted.`, ephemeral: true });
    } else if (subcommand === 'export') {
      const [apps]: any = await pool.query('SELECT * FROM applications');
      const [answers]: any = await pool.query('SELECT * FROM application_answers');

      const exportData = apps.map((app) => {
        return {
          id: app.id,
          discord_id: app.discord_id,
          status: app.status,
          created_at: app.created_at,
          answers: answers
            .filter((a) => a.application_id === app.id)
            .map((a) => ({
              question_id: a.question_id,
              answer: a.answer_text,
            })),
        };
      });

      const filePath = path.join(__dirname, '..', '..', 'export.json');
      fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));

      await interaction.reply({
        content: 'Applications exported!',
        files: [filePath],
        ephemeral: true,
      });
    }
  },
};
