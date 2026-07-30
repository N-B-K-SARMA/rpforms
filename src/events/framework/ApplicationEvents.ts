import { EmbedBuilder } from 'discord.js';
import { RPForms } from '../../core/RPForms';
import ApplicationModel from '../../models/Application';

export function registerApplicationEvents(client: any) {
    RPForms.events.on('applicationApprove', async (request: any) => {
        const { appId } = request;
        const app = await ApplicationModel.getApplicationById(appId);
        if (!app) return;

        // Fetch the corresponding form configuration
        const form = RPForms.forms.getForm(app.form_id);
        if (!form) return;

        const guild = client.guilds.cache.first(); 
        if (!guild) return;

        let member;
        try {
            member = await guild.members.fetch(app.discord_id);
        } catch (e) {
            console.log('Member left the server.');
        }

        if (member) {
            if (form.actions.onApprove.addRoles) {
                for (const roleId of form.actions.onApprove.addRoles) {
                    const role = guild.roles.cache.get(roleId);
                    if (role) {
                        try { await member.roles.add(role); } catch (e) { console.warn(`[ApplicationEvents] Failed to add role ${roleId}`); }
                    }
                }
            }
            if (form.actions.onApprove.removeRoles) {
                for (const roleId of form.actions.onApprove.removeRoles) {
                    const role = guild.roles.cache.get(roleId);
                    if (role && member.roles.cache.has(role.id)) {
                        try { await member.roles.remove(role); } catch (e) { console.warn(`[ApplicationEvents] Failed to remove role ${roleId}`); }
                    }
                }
            }
        }

        const acceptedEmbed = new EmbedBuilder()
            .setDescription(`Congratulations! Your allow-list application has been accepted. Welcome to Daddy's Roleplay!`)
            .addFields(
                { name: 'User', value: `<@${app.discord_id}>`, inline: true },
                { name: 'Time of Acceptance', value: `<t:${Math.floor(Date.now() / 1000)}:f>`, inline: true },
                { name: 'Moderator', value: `<@${request.staffId}>`, inline: true },
                { name: 'Acceptance ID', value: `${appId}`, inline: true },
            )
            .setColor(form.embeds?.reviewEmbed?.color || '#00FF00' as any);

        if (form.actions.onApprove.sendDM && member) {
            try { await member.send({ embeds: [acceptedEmbed] }); } catch (e) {}
        }

        if (form.actions.onApprove.logChannelId) {
            const channel = guild.channels.cache.get(form.actions.onApprove.logChannelId);
            if (channel) await channel.send({ embeds: [acceptedEmbed] }).catch(() => {});
        }
    });

    RPForms.events.on('applicationReject', async (request: any) => {
        const { appId, reason, staffId } = request;
        const app = await ApplicationModel.getApplicationById(appId);
        if (!app) return;

        const form = RPForms.forms.getForm(app.form_id);
        if (!form) return;

        const guild = client.guilds.cache.first();
        if (!guild) return;

        let member;
        try { member = await guild.members.fetch(app.discord_id); } catch (e) {}

        const rejectedEmbed = new EmbedBuilder()
            .setDescription(`Unfortunately, your allow-list application has been rejected.\n\n**Reason:**\n${reason}`)
            .addFields(
                { name: 'User', value: `<@${app.discord_id}>`, inline: true },
                { name: 'Time of Rejection', value: `<t:${Math.floor(Date.now() / 1000)}:f>`, inline: true },
                { name: 'Moderator', value: `<@${staffId}>`, inline: true },
                { name: 'Rejection ID', value: `${appId}`, inline: true },
            )
            .setColor(form.embeds?.reviewEmbed?.color || '#FF0000' as any);

        if (form.actions.onReject.sendDM && member) {
            try { await member.send({ embeds: [rejectedEmbed] }); } catch (e) { console.warn(`[ApplicationEvents] Failed to send rejection DM to ${app.discord_id}`); }
        }

        if (form.actions.onReject.logChannelId) {
            const channel = guild.channels.cache.get(form.actions.onReject.logChannelId);
            if (channel) await channel.send({ embeds: [rejectedEmbed] }).catch((e) => { console.warn(`[ApplicationEvents] Failed to send log to ${form.actions.onReject.logChannelId}`, e.message) });
        }
    });

    RPForms.events.on('applicationReviewRequest', async (request: any) => {
        const { appId, reason, staffId } = request;
        const app = await ApplicationModel.getApplicationById(appId);
        if (!app) return;

        const guild = client.guilds.cache.first();
        if (!guild) return;

        let member;
        try { member = await guild.members.fetch(app.discord_id); } catch (e) { console.warn(`[ApplicationEvents] Member left server: ${app.discord_id}`); }

        if (member) {
            const embed = new EmbedBuilder()
                .setTitle('Application Requires Changes')
                .setDescription(`Your application requires changes.\n\n**Reason:**\n${reason}\n\nPlease use the button below or start again to continue.`)
                .setColor('#FFFF00');

            try { await member.send({ embeds: [embed] }); } catch (e) { console.warn(`[ApplicationEvents] Failed to send review DM to ${app.discord_id}`); }
        }

        const channelId = RPForms.config.getAll().channels?.reviewLogChannel;
        if (channelId) {
            const channel = guild.channels.cache.get(channelId);
            if (channel) {
                const embed = new EmbedBuilder()
                    .setTitle(`Application #${appId} Review Requested`)
                    .setDescription(`Applicant: <@${app.discord_id}>\nRequested by: <@${staffId}>\nReason: ${reason}`)
                    .setColor('#FFFF00')
                    .setTimestamp();
                await channel.send({ embeds: [embed] }).catch((e) => { console.warn(`[ApplicationEvents] Failed to send log to ${channelId}`, e.message) });
            }
        }
    });

    RPForms.events.on('applicationClose', async (request: any) => {
        const { appId, staffId } = request;
        const app = await ApplicationModel.getApplicationById(appId);
        if (!app) return;

        const form = RPForms.forms.getForm(app.form_id);
        if (!form) return;

        const guild = client.guilds.cache.first();
        if (!guild) return;

        if (form.actions.onReject.logChannelId && staffId) {
            const channel = guild.channels.cache.get(form.actions.onReject.logChannelId);
            if (channel) {
                const embed = new EmbedBuilder()
                    .setTitle(`Application #${appId} Closed`)
                    .setDescription(`Applicant: <@${app.discord_id}>\nClosed by: <@${staffId}>`)
                    .setColor('#808080')
                    .setTimestamp();
                await channel.send({ embeds: [embed] }).catch(() => {});
            }
        }
    });
}
