"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RPForms_1 = require("../core/RPForms");
const discord_js_1 = require("discord.js");
const ReviewUIBuilder_1 = require("../builders/ReviewUIBuilder");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('application')
        .setDescription('Manage allowlist applications')
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator)
        .addSubcommand((subcommand) => subcommand
        .setName('user')
        .setDescription('View the latest application by user')
        .addUserOption((option) => option.setName('target').setDescription('The user').setRequired(true)))
        .addSubcommand((subcommand) => subcommand
        .setName('history')
        .setDescription('View all past applications by a user')
        .addUserOption((option) => option.setName('target').setDescription('The user').setRequired(true)))
        .addSubcommand((subcommand) => subcommand.setName('list').setDescription('List all pending applications'))
        .addSubcommand((subcommand) => subcommand
        .setName('delete')
        .setDescription('Delete an application')
        .addIntegerOption((option) => option.setName('id').setDescription('Application ID').setRequired(true)))
        .addSubcommand((subcommand) => subcommand.setName('export').setDescription('Export applications to JSON')),
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === 'user') {
            const target = interaction.options.getUser('target');
            const [rows] = await RPForms_1.RPForms.database.query('SELECT * FROM applications WHERE discord_id = ? ORDER BY created_at DESC LIMIT 1', [target.id]);
            if (rows.length === 0)
                return interaction.reply({
                    content: 'No applications found for this user.',
                    ephemeral: true,
                });
            const app = rows[0];
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle(`Latest Application Data for ${target.username}`)
                .addFields({ name: 'App ID', value: `${app.id}`, inline: true }, { name: 'Status', value: app.status, inline: true }, {
                name: 'Created At',
                value: `<t:${Math.floor(new Date(app.created_at).getTime() / 1000)}:R>`,
                inline: true,
            })
                .setColor(RPForms_1.RPForms.config.getAll().embeds.colors.primary);
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
        else if (subcommand === 'history') {
            const target = interaction.options.getUser('target');
            const [rows] = await RPForms_1.RPForms.database.query('SELECT * FROM applications WHERE discord_id = ? ORDER BY created_at DESC', [target.id]);
            if (rows.length === 0)
                return interaction.reply({
                    content: 'No applications found for this user.',
                    ephemeral: true,
                });
            const ui = ReviewUIBuilder_1.ReviewUIBuilder.buildHistoryEmbed(target.username, target.id, rows);
            await interaction.reply(ui);
        }
        else if (subcommand === 'list') {
            const [rows] = await RPForms_1.RPForms.database.query('SELECT * FROM applications WHERE status = "pending" ORDER BY created_at ASC LIMIT 10');
            if (rows.length === 0)
                return interaction.reply({ content: 'No pending applications.', ephemeral: true });
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle('Pending Applications')
                .setColor(RPForms_1.RPForms.config.getAll().embeds.colors.primary);
            let desc = '';
            for (const app of rows) {
                desc += `**ID:** ${app.id} | **User:** <@${app.discord_id}> | **Date:** <t:${Math.floor(new Date(app.created_at).getTime() / 1000)}:R>\n`;
            }
            embed.setDescription(desc);
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
        else if (subcommand === 'delete') {
            const id = interaction.options.getInteger('id');
            await RPForms_1.RPForms.database.query('DELETE FROM applications WHERE id = ?', [id]);
            await interaction.reply({ content: `Application #${id} has been deleted.`, ephemeral: true });
        }
        else if (subcommand === 'export') {
            const [apps] = await RPForms_1.RPForms.database.query('SELECT * FROM applications');
            const [answers] = await RPForms_1.RPForms.database.query('SELECT * FROM application_answers');
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
            const filePath = path_1.default.join(__dirname, '..', '..', 'export.json');
            fs_1.default.writeFileSync(filePath, JSON.stringify(exportData, null, 2));
            await interaction.reply({
                content: 'Applications exported!',
                files: [filePath],
                ephemeral: true,
            });
        }
    },
};
