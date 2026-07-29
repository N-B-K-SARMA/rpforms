"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerApplicationEvents = registerApplicationEvents;
const discord_js_1 = require("discord.js");
const RPForms_1 = require("../../core/RPForms");
const Application_1 = __importDefault(require("../../models/Application"));
function registerApplicationEvents(client) {
    RPForms_1.RPForms.events.on('applicationApprove', async (request) => {
        const { appId } = request;
        const app = await Application_1.default.getApplicationById(appId);
        if (!app)
            return;
        // In a real system, the DB would track which form was used. For now, we assume 'allowlist'
        const form = RPForms_1.RPForms.forms.getForm('allowlist');
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
                    if (role)
                        await member.roles.add(role).catch(() => { });
                }
            }
            if (form.actions.onApprove.removeRoles) {
                for (const roleId of form.actions.onApprove.removeRoles) {
                    const role = guild.roles.cache.get(roleId);
                    if (role && member.roles.cache.has(role.id)) {
                        await member.roles.remove(role).catch(() => { });
                    }
                }
            }
        }
        const acceptedEmbed = new discord_js_1.EmbedBuilder()
            .setDescription(`Congratulations! Your allow-list application has been accepted. Welcome to Daddy's Roleplay!`)
            .addFields({ name: 'User', value: `<@${app.discord_id}>`, inline: true }, { name: 'Time of Acceptance', value: `<t:${Math.floor(Date.now() / 1000)}:f>`, inline: true }, { name: 'Moderator', value: `<@${request.staffId}>`, inline: true }, { name: 'Acceptance ID', value: `${appId}`, inline: true })
            .setColor(form.embeds?.reviewEmbed?.color || '#00FF00');
        if (form.actions.onApprove.sendDM && member) {
            try {
                await member.send({ embeds: [acceptedEmbed] });
            }
            catch (e) { }
        }
        if (form.actions.onApprove.logChannelId) {
            const channel = guild.channels.cache.get(form.actions.onApprove.logChannelId);
            if (channel)
                await channel.send({ embeds: [acceptedEmbed] }).catch(() => { });
        }
    });
    RPForms_1.RPForms.events.on('applicationReject', async (request) => {
        const { appId, reason, staffId } = request;
        const app = await Application_1.default.getApplicationById(appId);
        if (!app)
            return;
        const form = RPForms_1.RPForms.forms.getForm('allowlist');
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
        const rejectedEmbed = new discord_js_1.EmbedBuilder()
            .setDescription(`Unfortunately, your allow-list application has been rejected.\n\n**Reason:**\n${reason}`)
            .addFields({ name: 'User', value: `<@${app.discord_id}>`, inline: true }, { name: 'Time of Rejection', value: `<t:${Math.floor(Date.now() / 1000)}:f>`, inline: true }, { name: 'Moderator', value: `<@${staffId}>`, inline: true }, { name: 'Rejection ID', value: `${appId}`, inline: true })
            .setColor(form.embeds?.reviewEmbed?.color || '#FF0000');
        if (form.actions.onReject.sendDM && member) {
            try {
                await member.send({ embeds: [rejectedEmbed] });
            }
            catch (e) { }
        }
        if (form.actions.onReject.logChannelId) {
            const channel = guild.channels.cache.get(form.actions.onReject.logChannelId);
            if (channel)
                await channel.send({ embeds: [rejectedEmbed] }).catch(() => { });
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
        catch (e) { }
        if (member) {
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle('Application Requires Changes')
                .setDescription(`Your application requires changes.\n\n**Reason:**\n${reason}\n\nPlease use the button below or start again to continue.`)
                .setColor('#FFFF00');
            try {
                await member.send({ embeds: [embed] });
            }
            catch (e) { }
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
                await channel.send({ embeds: [embed] }).catch(() => { });
            }
        }
    });
    RPForms_1.RPForms.events.on('applicationClose', async (request) => {
        const { appId, staffId } = request;
        const app = await Application_1.default.getApplicationById(appId);
        if (!app)
            return;
        const form = RPForms_1.RPForms.forms.getForm('allowlist');
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
