import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { RPForms } from '../core/RPForms';

export default {
    data: new SlashCommandBuilder()
        .setName('rpforms')
        .setDescription('Manage RPForms system')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand.setName('reload').setDescription('Reload all forms from disk')
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
        )
        .addSubcommand(subcommand =>
            subcommand.setName('status').setDescription('View RPForms system status')
        )
        .addSubcommand(subcommand =>
            subcommand.setName('doctor').setDescription('Run system diagnostics')
        )
        .addSubcommand(subcommand =>
            subcommand.setName('stats').setDescription('View application statistics')
        ),

    async execute(interaction: any, client: any) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'reload') {
            RPForms.forms.reload();
            await interaction.reply({ content: 'Forms reloaded successfully.', ephemeral: true });
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
        } else if (subcommand === 'status') {
            const uptime = process.uptime();
            const memory = process.memoryUsage();
            const stats = await RPForms.database.getGlobalStats();
            
            const embed = new EmbedBuilder()
                .setTitle('RPForms Status')
                .addFields(
                    { name: 'Uptime', value: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`, inline: true },
                    { name: 'RAM Usage', value: `${Math.round(memory.rss / 1024 / 1024)} MB`, inline: true },
                    { name: 'Loaded Forms', value: `${RPForms.forms.getForms().length}`, inline: true },
                    { name: 'Pending Apps', value: `${stats.pending}`, inline: true },
                    { name: 'Database', value: `🟢 Connected`, inline: true },
                    { name: 'Version', value: `v1.0.0`, inline: true },
                )
                .setColor(RPForms.config.getAll().embeds.colors.primary as any)
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (subcommand === 'doctor') {
            await interaction.deferReply({ ephemeral: true });
            
            let report = '**Diagnostic Report:**\n\n';
            let issues = 0;

            // Database
            try {
                await RPForms.database.query('SELECT 1');
                report += '✅ Database Connected\n';
            } catch (e) {
                report += '❌ Database Connection Failed\n';
                issues++;
            }

            // Forms validation
            const errors = RPForms.forms.getValidationErrors();
            if (errors.size === 0) {
                report += '✅ Form Schemas Valid\n';
            } else {
                report += `❌ Form Schemas Invalid (${errors.size} files have errors)\n`;
                issues += errors.size;
            }

            // Roles and Channels
            const guild = interaction.guild;
            const forms = RPForms.forms.getForms();
            
            let missingRoles = 0;
            let missingChannels = 0;

            for (const form of forms) {
                if (form.review.channelId && !guild.channels.cache.get(form.review.channelId)) missingChannels++;
                if (form.actions.onApprove.logChannelId && !guild.channels.cache.get(form.actions.onApprove.logChannelId)) missingChannels++;
                if (form.actions.onReject.logChannelId && !guild.channels.cache.get(form.actions.onReject.logChannelId)) missingChannels++;

                if (form.review.reviewerRoles) {
                    for (const roleId of form.review.reviewerRoles) {
                        if (!guild.roles.cache.get(roleId)) missingRoles++;
                    }
                }
                if (form.actions.onApprove.addRoles) {
                    for (const roleId of form.actions.onApprove.addRoles) {
                        if (!guild.roles.cache.get(roleId)) missingRoles++;
                    }
                }
            }

            if (missingChannels > 0) {
                report += `⚠️ Missing Channels: ${missingChannels} configured channels were not found.\n`;
                issues++;
            } else {
                report += '✅ Channels Verified\n';
            }

            if (missingRoles > 0) {
                report += `⚠️ Missing Roles: ${missingRoles} configured roles were not found.\n`;
                issues++;
            } else {
                report += '✅ Roles Verified\n';
            }

            report += `\n**Total Issues Found:** ${issues}`;

            const embed = new EmbedBuilder()
                .setTitle('RPForms Doctor')
                .setDescription(report)
                .setColor(issues > 0 ? RPForms.config.getAll().embeds.colors.warning as any : RPForms.config.getAll().embeds.colors.success as any);
            
            await interaction.editReply({ embeds: [embed] });
        } else if (subcommand === 'stats') {
            const stats = await RPForms.database.getGlobalStats();
            
            const embed = new EmbedBuilder()
                .setTitle('Global Application Statistics')
                .addFields(
                    { name: 'Total Applications', value: `${stats.total}`, inline: true },
                    { name: 'Approved', value: `${stats.approved}`, inline: true },
                    { name: 'Rejected', value: `${stats.rejected}`, inline: true },
                    { name: 'Pending Review', value: `${stats.pending}`, inline: true },
                    { name: 'Closed/Cancelled', value: `${stats.closed}`, inline: true }
                )
                .setColor(RPForms.config.getAll().embeds.colors.primary as any);

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
