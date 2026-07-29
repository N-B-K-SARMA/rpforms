"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Application_1 = __importDefault(require("../models/Application"));
const Answer_1 = __importDefault(require("../models/Answer"));
const User_1 = __importDefault(require("../models/User"));
const QuestionService_1 = __importDefault(require("./QuestionService"));
const config_1 = __importDefault(require("../config/config"));
class StaffReviewService {
    static async submitApplication(interaction, client, appId) {
        await interaction.deferUpdate(); // Defer update to prevent timeout
        // Set status to review
        await Application_1.default.updateStatus(appId, 'review');
        const guild = interaction.guild;
        const applicant = interaction.user;
        // Fetch application and answers
        const app = await Application_1.default.getApplicationById(appId);
        const answers = await Answer_1.default.getAnswers(appId);
        const questions = QuestionService_1.default.getQuestions();
        // Get the review channel where all applications will be posted
        const staffChannelId = config_1.default.channels.staffReviewChannel || config_1.default.channels.applicationCategory;
        const staffChannel = guild.channels.cache.get(staffChannelId);
        if (!staffChannel) {
            return interaction.editReply({
                content: 'Error: Staff review channel not found in configuration.',
                embeds: [],
                components: [],
            });
        }
        await Application_1.default.updateStatus(appId, 'review', staffChannel.id);
        // Build Staff Embed
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('New Application Review')
            .addFields({ name: 'Discord User', value: `${applicant} (${applicant.id})`, inline: true }, { name: 'Application ID', value: `${appId}`, inline: true }, { name: 'Status', value: '🟡 Review', inline: true })
            .setColor(config_1.default.embeds.colors.warning)
            .setTimestamp();
        for (const q of questions) {
            const a = answers.find((ans) => ans.question_id === q.id);
            let displayAnswer = a ? a.answer_text : 'No answer';
            if (displayAnswer.length > 1024)
                displayAnswer = displayAnswer.substring(0, 1020) + '...';
            embed.addFields({ name: q.question, value: displayAnswer });
        }
        const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId(`staff_approve_${appId}`)
            .setLabel('✅ Approve')
            .setStyle(discord_js_1.ButtonStyle.Success), new discord_js_1.ButtonBuilder()
            .setCustomId(`staff_reject_${appId}`)
            .setLabel('❌ Reject')
            .setStyle(discord_js_1.ButtonStyle.Danger), new discord_js_1.ButtonBuilder()
            .setCustomId(`staff_review_${appId}`)
            .setLabel('🟡 Review')
            .setStyle(discord_js_1.ButtonStyle.Secondary));
        // Ping the first staff role found in the config
        const staffPing = config_1.default.roles.staff && config_1.default.roles.staff.length > 0
            ? `<@&${config_1.default.roles.staff[0]}>`
            : '@here';
        await staffChannel.send({
            content: `${staffPing} A new application has been submitted by ${applicant}!`,
            embeds: [embed],
            components: [row],
        });
        await interaction.editReply({
            content: 'Your application has been submitted for review!',
            embeds: [],
            components: [],
        });
    }
    static async handleStaffAction(interaction, client, action, appId) {
        if (action === 'approve') {
            await this.approveApplication(interaction, client, appId);
        }
        else if (action === 'reject') {
            await this.showReasonModal(interaction, appId, 'reject');
        }
        else if (action === 'review') {
            await this.showReasonModal(interaction, appId, 'review');
        }
    }
    static async showReasonModal(interaction, appId, action) {
        const modal = new discord_js_1.ModalBuilder()
            .setCustomId(`staffmodal_${action}_${appId}`)
            .setTitle(action === 'reject' ? 'Reject Reason' : 'Review Reason');
        const reasonInput = new discord_js_1.TextInputBuilder()
            .setCustomId('reasonText')
            .setLabel('Reason')
            .setStyle(discord_js_1.TextInputStyle.Paragraph)
            .setRequired(true);
        const actionRow = new discord_js_1.ActionRowBuilder().addComponents(reasonInput);
        modal.addComponents(actionRow);
        await interaction.showModal(modal);
    }
    static async approveApplication(interaction, client, appId) {
        const app = await Application_1.default.getApplicationById(appId);
        if (!app)
            return interaction.reply({ content: 'Application not found', ephemeral: true });
        // Update DB
        await Application_1.default.updateStatus(appId, 'approved');
        // Update original message
        const originalEmbed = discord_js_1.EmbedBuilder.from(interaction.message.embeds[0]);
        originalEmbed.setColor(config_1.default.embeds.colors.success);
        const statusField = originalEmbed.data.fields.find((f) => f.name === 'Status');
        if (statusField)
            statusField.value = '🟢 Approved';
        await interaction.update({ embeds: [originalEmbed], components: [] });
        const guild = interaction.guild;
        let member;
        try {
            member = await guild.members.fetch(app.discord_id);
        }
        catch (e) {
            console.log('Member left the server.');
        }
        if (member) {
            // Add allowlisted role
            if (config_1.default.roles.allowlisted) {
                const role = guild.roles.cache.get(config_1.default.roles.allowlisted);
                if (role)
                    await member.roles
                        .add(role)
                        .catch((err) => console.log('Notice: Missing permissions to add allowlisted role.'));
            }
            // Remove non-whitelisted role
            if (config_1.default.roles.nonWhitelisted) {
                const role = guild.roles.cache.get(config_1.default.roles.nonWhitelisted);
                if (role && member.roles.cache.has(role.id)) {
                    await member.roles
                        .remove(role)
                        .catch((err) => console.log('Notice: Missing permissions to remove non-whitelisted role.'));
                }
            }
        } // ADDED MISSING BRACE
        // Build accepted embed
        const acceptedEmbed = new discord_js_1.EmbedBuilder()
            .setDescription(`Congratulations! Your allow-list application has been accepted. Welcome to Daddy's Roleplay!`)
            .addFields({ name: 'User', value: `<@${app.discord_id}>`, inline: true }, {
            name: 'Time of Acceptance',
            value: `<t:${Math.floor(Date.now() / 1000)}:f>`,
            inline: true,
        }, { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true }, { name: 'Acceptance ID', value: `${appId}`, inline: true })
            .setColor(config_1.default.embeds.colors.success);
        if (config_1.default.embeds.banner)
            acceptedEmbed.setImage(config_1.default.embeds.banner);
        if (member) {
            // DM User
            try {
                await member.send({ embeds: [acceptedEmbed] });
            }
            catch (e) {
                console.log('Could not DM user.');
            }
        }
        // Log to accepted log channel
        if (config_1.default.channels.acceptedLogChannel) {
            const channel = guild.channels.cache.get(config_1.default.channels.acceptedLogChannel);
            if (channel)
                await channel.send({ embeds: [acceptedEmbed] }).catch(() => { });
        }
    }
    static async processModal(interaction, client, action, appId) {
        const reason = interaction.fields.getTextInputValue('reasonText');
        const app = await Application_1.default.getApplicationById(appId);
        if (!app)
            return interaction.reply({ content: 'Application not found', ephemeral: true });
        const guild = interaction.guild;
        let member;
        try {
            member = await guild.members.fetch(app.discord_id);
        }
        catch (e) { }
        if (action === 'reject') {
            await Application_1.default.updateStatus(appId, 'rejected');
            // Update original message
            const originalEmbed = discord_js_1.EmbedBuilder.from(interaction.message.embeds[0]);
            originalEmbed.setColor(config_1.default.embeds.colors.danger);
            const statusField = originalEmbed.data.fields.find((f) => f.name === 'Status');
            if (statusField)
                statusField.value = '🔴 Rejected';
            await interaction.update({ embeds: [originalEmbed], components: [] });
            // Set cooldown
            const cooldownMs = config_1.default.settings.cooldown || 86400000;
            const cooldownUntil = new Date(Date.now() + cooldownMs)
                .toISOString()
                .slice(0, 19)
                .replace('T', ' ');
            await User_1.default.setCooldown(app.discord_id, cooldownUntil);
            // Build rejected embed
            const rejectedEmbed = new discord_js_1.EmbedBuilder()
                .setDescription(`Unfortunately, your allow-list application has been rejected.\n\n**Reason:**\n${reason}`)
                .addFields({ name: 'User', value: `<@${app.discord_id}>`, inline: true }, {
                name: 'Time of Rejection',
                value: `<t:${Math.floor(Date.now() / 1000)}:f>`,
                inline: true,
            }, { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true }, { name: 'Rejection ID', value: `${appId}`, inline: true })
                .setColor(config_1.default.embeds.colors.danger);
            if (config_1.default.embeds.banner)
                rejectedEmbed.setImage(config_1.default.embeds.banner);
            if (member) {
                try {
                    await member.send({ embeds: [rejectedEmbed] });
                }
                catch (e) { }
            }
            // Log to rejected log channel
            if (config_1.default.channels.rejectedLogChannel) {
                const channel = guild.channels.cache.get(config_1.default.channels.rejectedLogChannel);
                if (channel)
                    await channel.send({ embeds: [rejectedEmbed] }).catch(() => { });
            }
        }
        else if (action === 'review') {
            await Application_1.default.updateStatus(appId, 'review'); // Stays in review status but needs action
            if (member) {
                const embed = new discord_js_1.EmbedBuilder()
                    .setTitle('Application Requires Changes')
                    .setDescription(`Your application requires changes.\n\n**Reason:**\n${reason}\n\nPlease click the button below to continue your application.`)
                    .setColor(config_1.default.embeds.colors.warning);
                const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                    .setCustomId(`app_continue_${appId}_0`)
                    .setLabel('Continue Application')
                    .setStyle(discord_js_1.ButtonStyle.Primary));
                try {
                    await member.send({ embeds: [embed], components: [row] });
                }
                catch (e) {
                    console.log('Could not DM user.');
                }
            }
            await this.sendLog(guild, config_1.default.channels.reviewLogChannel, `Application #${appId} Review Requested`, `Applicant: <@${app.discord_id}>\nRequested by: ${interaction.user}\nReason: ${reason}`, config_1.default.embeds.colors.warning);
            await interaction.reply({ content: 'Review requested sent to user!' });
        }
    }
    static async sendLog(guild, channelId, title, description, color) {
        if (!channelId)
            return;
        const channel = guild.channels.cache.get(channelId);
        if (channel) {
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .setColor(color)
                .setTimestamp();
            await channel.send({ embeds: [embed] }).catch(() => { });
        }
    }
}
exports.default = StaffReviewService;
