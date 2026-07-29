import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { RPForms } from '../core/RPForms';

export default {
    data: new SlashCommandBuilder()
        .setName('forms')
        .setDescription('Manage RPForms system')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand.setName('reload').setDescription('Reload all forms from disk')
        )
        .addSubcommand(subcommand =>
            subcommand.setName('validate').setDescription('Validate all forms and print a report')
        )
        .addSubcommand(subcommand =>
            subcommand.setName('list').setDescription('List all currently loaded forms')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('View details about a specific form')
                .addStringOption(option =>
                    option.setName('form_id').setDescription('The ID of the form').setRequired(true)
                )
        ),

    async execute(interaction: any, client: any) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'reload') {
            RPForms.forms.reload();
            await interaction.reply({ content: 'Forms reloaded successfully.', ephemeral: true });
        } else if (subcommand === 'validate') {
            RPForms.forms.reload(); // Reload first to get fresh validation state
            const errors = RPForms.forms.getValidationErrors();
            
            if (errors.size === 0) {
                return interaction.reply({ content: 'All forms validated successfully! ✅', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle('Form Validation Report')
                .setColor(RPForms.config.getAll().embeds.colors.danger as any);

            let desc = '';
            errors.forEach((errList, file) => {
                desc += `**${file}**\n${errList.map(e => `- ${e}`).join('\n')}\n\n`;
            });
            embed.setDescription(desc || 'No errors.');

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (subcommand === 'list') {
            const forms = RPForms.forms.getForms();
            if (forms.length === 0) {
                return interaction.reply({ content: 'No valid forms loaded.', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle('Loaded Forms')
                .setColor(RPForms.config.getAll().embeds.colors.primary as any);

            let desc = '';
            forms.forEach(f => {
                desc += `**${f.metadata.title}** (${f.metadata.id}) - v${f.metadata.version}\n`;
            });
            embed.setDescription(desc);

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (subcommand === 'info') {
            const formId = interaction.options.getString('form_id');
            const form = RPForms.forms.getForm(formId);

            if (!form) {
                return interaction.reply({ content: `Form \`${formId}\` not found or invalid.`, ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle(`Form Info: ${form.metadata.title}`)
                .setDescription(form.metadata.description)
                .addFields(
                    { name: 'ID', value: form.metadata.id, inline: true },
                    { name: 'Version', value: form.metadata.version, inline: true },
                    { name: 'Status', value: form.runtime.enabled ? '🟢 Enabled' : '🔴 Disabled', inline: true },
                    { name: 'Questions', value: `${form.questions.length}`, inline: true },
                    { name: 'Review Channel', value: `<#${form.review.channelId}>`, inline: true },
                )
                .setColor(RPForms.config.getAll().embeds.colors.primary as any);

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
