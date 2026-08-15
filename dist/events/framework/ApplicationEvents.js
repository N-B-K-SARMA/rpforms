"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerApplicationEvents = registerApplicationEvents;
const discord_js_1 = require("discord.js");
const RPForms_1 = require("../../core/RPForms");
const Application_1 = __importDefault(require("../../models/Application"));
const Answer_1 = __importDefault(require("../../models/Answer"));
function registerApplicationEvents(client) {
    RPForms_1.RPForms.events.on('applicationApprove', async (request) => {
        const { appId } = request;
        const app = await Application_1.default.getApplicationById(appId);
        if (!app)
            return;
        // Fetch the corresponding form configuration
        const form = RPForms_1.RPForms.forms.getForm(app.form_id);
        if (!form)
            return;
        const guild = client.guilds.cache.first();
        if (!guild)
            return;
        let member;
        try {
            member = await guild.members.fetch(app.discord_id);
        }
        catch (e) {
            console.log('Member left the server.');
        }
        if (member) {
            if (form.actions.onApprove.addRoles) {
                for (const roleId of form.actions.onApprove.addRoles) {
                    const role = guild.roles.cache.get(roleId);
                    if (role) {
                        try {
                            await member.roles.add(role);
                        }
                        catch (e) {
                            console.warn(`[ApplicationEvents] Failed to add role ${roleId}`);
                        }
                    }
                }
            }
            if (form.actions.onApprove.removeRoles) {
                for (const roleId of form.actions.onApprove.removeRoles) {
                    const role = guild.roles.cache.get(roleId);
                    if (role && member.roles.cache.has(role.id)) {
                        try {
                            await member.roles.remove(role);
                        }
                        catch (e) {
                            console.warn(`[ApplicationEvents] Failed to remove role ${roleId}`);
                        }
                    }
                }
            }
        }
        let characterName = undefined;
        try {
            const answers = await Answer_1.default.getAnswers(appId);
            // Try to find the character name
            const charNameQuestion = form.questions?.find((q) => q.label?.toLowerCase().includes('character name') || q.question?.toLowerCase().includes('character name'));
            if (charNameQuestion) {
                const charNameAnswer = answers.find(a => String(a.question_id) === String(charNameQuestion.id));
                if (charNameAnswer)
                    characterName = charNameAnswer.answer_text;
            }
        }
        catch (e) {
            console.warn(`[ApplicationEvents] Failed to fetch answers for app ${appId}`);
        }
        const acceptedEmbed = new discord_js_1.EmbedBuilder()
            .setDescription(`Congratulations! Your allow-list application has been accepted. Welcome to Horizon City Roleplay!`)
            .addFields({ name: 'User', value: `<@${app.discord_id}>`, inline: true }, { name: 'Time of Acceptance', value: `<t:${Math.floor(Date.now() / 1000)}:f>`, inline: true }, { name: 'Moderator', value: `<@${request.staffId}>`, inline: true }, { name: 'Acceptance ID', value: `${appId}`, inline: true })
            .setColor(form.embeds?.reviewEmbed?.color || '#00FF00');
        if (form.actions.onApprove.sendDM && member) {
            try {
                await member.send({ embeds: [acceptedEmbed] });
            }
            catch (e) {
                console.warn(`[ApplicationEvents] Failed to send DM`);
            }
        }
        if (form.actions.onApprove.logChannelId) {
            const channel = guild.channels.cache.get(form.actions.onApprove.logChannelId);
            if (channel) {
                const logEmbed = new discord_js_1.EmbedBuilder()
                    .setTitle('Application Approved')
                    .addFields({ name: 'Applicant', value: `<@${app.discord_id}>`, inline: true }, { name: 'Application', value: `#${appId}`, inline: true }, { name: 'Reviewed By', value: `<@${request.staffId}>`, inline: true })
                    .setColor('#00FF00');
                if (characterName) {
                    logEmbed.addFields({ name: 'Character', value: characterName, inline: true });
                }
                logEmbed.addFields({ name: 'Status', value: '🟢 Approved', inline: true });
                await channel.send({ embeds: [logEmbed] }).catch(() => { console.warn(`[ApplicationEvents] Failed to send log`); });
            }
        }
    });
    RPForms_1.RPForms.events.on('applicationReject', async (request) => {
        const { appId, reason, staffId } = request;
        const app = await Application_1.default.getApplicationById(appId);
        if (!app)
            return;
        const form = RPForms_1.RPForms.forms.getForm(app.form_id);
        if (!form)
            return;
        const guild = client.guilds.cache.first();
        if (!guild)
            return;
        let member;
        try {
            member = await guild.members.fetch(app.discord_id);
        }
        catch (e) { }
        let characterName = undefined;
        try {
            const answers = await Answer_1.default.getAnswers(appId);
            // Try to find the character name
            const charNameQuestion = form.questions?.find((q) => q.label?.toLowerCase().includes('character name') || q.question?.toLowerCase().includes('character name'));
            if (charNameQuestion) {
                const charNameAnswer = answers.find(a => String(a.question_id) === String(charNameQuestion.id));
                if (charNameAnswer)
                    characterName = charNameAnswer.answer_text;
            }
        }
        catch (e) {
            console.warn(`[ApplicationEvents] Failed to fetch answers for app ${appId}`);
        }
        const rejectedEmbed = new discord_js_1.EmbedBuilder()
            .setDescription(`Unfortunately, your allow-list application has been rejected.\n\n**Reason:**\n${reason}`)
            .addFields({ name: 'User', value: `<@${app.discord_id}>`, inline: true }, { name: 'Time of Rejection', value: `<t:${Math.floor(Date.now() / 1000)}:f>`, inline: true }, { name: 'Moderator', value: `<@${staffId}>`, inline: true }, { name: 'Rejection ID', value: `${appId}`, inline: true })
            .setColor(form.embeds?.reviewEmbed?.color || '#FF0000');
        if (form.actions.onReject.sendDM && member) {
            try {
                await member.send({ embeds: [rejectedEmbed] });
            }
            catch (e) {
                console.warn(`[ApplicationEvents] Failed to send rejection DM to ${app.discord_id}`);
            }
        }
        if (form.actions.onReject.logChannelId) {
            const channel = guild.channels.cache.get(form.actions.onReject.logChannelId);
            if (channel) {
                const logEmbed = new discord_js_1.EmbedBuilder()
                    .setTitle('Application Rejected')
                    .addFields({ name: 'Applicant', value: `<@${app.discord_id}>`, inline: true }, { name: 'Application', value: `#${appId}`, inline: true }, { name: 'Reviewed By', value: `<@${staffId}>`, inline: true })
                    .setColor('#FF0000');
                if (characterName) {
                    logEmbed.addFields({ name: 'Character', value: characterName, inline: true });
                }
                logEmbed.addFields({ name: 'Status', value: '🔴 Rejected', inline: true });
                if (reason) {
                    logEmbed.addFields({ name: 'Reason', value: reason });
                }
                await channel.send({ embeds: [logEmbed] }).catch((e) => { console.warn(`[ApplicationEvents] Failed to send log`, e.message); });
            }
        }
    });
    RPForms_1.RPForms.events.on('applicationReviewRequest', async (request) => {
        const { appId, reason, staffId } = request;
        const app = await Application_1.default.getApplicationById(appId);
        if (!app)
            return;
        const guild = client.guilds.cache.first();
        if (!guild)
            return;
        let member;
        try {
            member = await guild.members.fetch(app.discord_id);
        }
        catch (e) {
            console.warn(`[ApplicationEvents] Member left server: ${app.discord_id}`);
        }
        if (member) {
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle('Application Requires Changes')
                .setDescription(`Your application requires changes.\n\n**Reason:**\n${reason}\n\nPlease use the button below or start again to continue.`)
                .setColor('#FFFF00');
            try {
                await member.send({ embeds: [embed] });
            }
            catch (e) {
                console.warn(`[ApplicationEvents] Failed to send review DM to ${app.discord_id}`);
            }
        }
        const channelId = RPForms_1.RPForms.config.getAll().channels?.reviewLogChannel;
        if (channelId) {
            const channel = guild.channels.cache.get(channelId);
            if (channel) {
                const embed = new discord_js_1.EmbedBuilder()
                    .setTitle(`Application #${appId} Review Requested`)
                    .setDescription(`Applicant: <@${app.discord_id}>\nRequested by: <@${staffId}>\nReason: ${reason}`)
                    .setColor('#FFFF00')
                    .setTimestamp();
                await channel.send({ embeds: [embed] }).catch((e) => { console.warn(`[ApplicationEvents] Failed to send log to ${channelId}`, e.message); });
            }
        }
    });
    RPForms_1.RPForms.events.on('applicationClose', async (request) => {
        const { appId, staffId } = request;
        const app = await Application_1.default.getApplicationById(appId);
        if (!app)
            return;
        const form = RPForms_1.RPForms.forms.getForm(app.form_id);
        if (!form)
            return;
        const guild = client.guilds.cache.first();
        if (!guild)
            return;
        if (form.actions.onReject.logChannelId && staffId) {
            const channel = guild.channels.cache.get(form.actions.onReject.logChannelId);
            if (channel) {
                const embed = new discord_js_1.EmbedBuilder()
                    .setTitle(`Application #${appId} Closed`)
                    .setDescription(`Applicant: <@${app.discord_id}>\nClosed by: <@${staffId}>`)
                    .setColor('#808080')
                    .setTimestamp();
                await channel.send({ embeds: [embed] }).catch(() => { });
            }
        }
    });
}
