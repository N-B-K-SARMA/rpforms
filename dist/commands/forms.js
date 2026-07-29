"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const RPForms_1 = require("../core/RPForms");
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('forms')
        .setDescription('Manage RPForms system')
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand => subcommand.setName('reload').setDescription('Reload all forms from disk'))
        .addSubcommand(subcommand => subcommand.setName('validate').setDescription('Validate all forms and print a report'))
        .addSubcommand(subcommand => subcommand.setName('list').setDescription('List all currently loaded forms'))
        .addSubcommand(subcommand => subcommand
        .setName('info')
        .setDescription('View details about a specific form')
        .addStringOption(option => option.setName('form_id').setDescription('The ID of the form').setRequired(true))),
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === 'reload') {
            RPForms_1.RPForms.forms.reload();
            await interaction.reply({ content: 'Forms reloaded successfully.', ephemeral: true });
        }
        else if (subcommand === 'validate') {
            RPForms_1.RPForms.forms.reload(); // Reload first to get fresh validation state
            const errors = RPForms_1.RPForms.forms.getValidationErrors();
            if (errors.size === 0) {
                return interaction.reply({ content: 'All forms validated successfully! ✅', ephemeral: true });
            }
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle('Form Validation Report')
                .setColor(RPForms_1.RPForms.config.getAll().embeds.colors.danger);
            let desc = '';
            errors.forEach((errList, file) => {
                desc += `**${file}**\n${errList.map(e => `- ${e}`).join('\n')}\n\n`;
            });
            embed.setDescription(desc || 'No errors.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
        else if (subcommand === 'list') {
            const forms = RPForms_1.RPForms.forms.getForms();
            if (forms.length === 0) {
                return interaction.reply({ content: 'No valid forms loaded.', ephemeral: true });
            }
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle('Loaded Forms')
                .setColor(RPForms_1.RPForms.config.getAll().embeds.colors.primary);
            let desc = '';
            forms.forEach(f => {
                desc += `**${f.metadata.title}** (${f.metadata.id}) - v${f.metadata.version}\n`;
            });
            embed.setDescription(desc);
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
        else if (subcommand === 'info') {
            const formId = interaction.options.getString('form_id');
            const form = RPForms_1.RPForms.forms.getForm(formId);
            if (!form) {
                return interaction.reply({ content: `Form \`${formId}\` not found or invalid.`, ephemeral: true });
            }
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle(`Form Info: ${form.metadata.title}`)
                .setDescription(form.metadata.description)
                .addFields({ name: 'ID', value: form.metadata.id, inline: true }, { name: 'Version', value: form.metadata.version, inline: true }, { name: 'Status', value: form.runtime.enabled ? '🟢 Enabled' : '🔴 Disabled', inline: true }, { name: 'Questions', value: `${form.questions.length}`, inline: true }, { name: 'Review Channel', value: `<#${form.review.channelId}>`, inline: true })
                .setColor(RPForms_1.RPForms.config.getAll().embeds.colors.primary);
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
