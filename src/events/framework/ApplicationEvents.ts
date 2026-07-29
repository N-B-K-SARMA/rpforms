import { EmbedBuilder } from 'discord.js';
import { RPForms } from '../../core/RPForms';
import ApplicationModel from '../../models/Application';

export function registerApplicationEvents(client: any) {
    RPForms.events.on('applicationApprove', async (request: any) => {
        const { appId } = request;
        const app = await ApplicationModel.getApplicationById(appId);
        if (!app) return;

        const guild = client.guilds.cache.first(); // Assuming a single guild for simplicity, or we fetch from DB
        if (!guild) return;

        let member;
        try {
            member = await guild.members.fetch(app.discord_id);
        } catch (e) {
            console.log('Member left the server.');
        }

        if (member) {
            if (RPForms.config.getAll().roles.allowlisted) {
                const role = guild.roles.cache.get(RPForms.config.getAll().roles.allowlisted);
                if (role) await member.roles.add(role).catch(() => {});
            }
            if (RPForms.config.getAll().roles.nonWhitelisted) {
                const role = guild.roles.cache.get(RPForms.config.getAll().roles.nonWhitelisted);
                if (role && member.roles.cache.has(role.id)) {
                    await member.roles.remove(role).catch(() => {});
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
            .setColor(RPForms.config.getAll().embeds.colors.success as any);

        if (RPForms.config.getAll().embeds.banner) acceptedEmbed.setImage(RPForms.config.getAll().embeds.banner);

        if (member) {
            try { await member.send({ embeds: [acceptedEmbed] }); } catch (e) {}
        }

        if (RPForms.config.getAll().channels.acceptedLogChannel) {
            const channel = guild.channels.cache.get(RPForms.config.getAll().channels.acceptedLogChannel);
            if (channel) await channel.send({ embeds: [acceptedEmbed] }).catch(() => {});
        }
    });

    RPForms.events.on('applicationReject', async (request: any) => {
        const { appId, reason, staffId } = request;
        const app = await ApplicationModel.getApplicationById(appId);
        if (!app) return;

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
            .setColor(RPForms.config.getAll().embeds.colors.danger as any);

        if (RPForms.config.getAll().embeds.banner) rejectedEmbed.setImage(RPForms.config.getAll().embeds.banner);

        if (member) {
            try { await member.send({ embeds: [rejectedEmbed] }); } catch (e) {}
        }

        if (RPForms.config.getAll().channels.rejectedLogChannel) {
            const channel = guild.channels.cache.get(RPForms.config.getAll().channels.rejectedLogChannel);
            if (channel) await channel.send({ embeds: [rejectedEmbed] }).catch(() => {});
        }
    });

    RPForms.events.on('applicationReviewRequest', async (request: any) => {
        const { appId, reason, staffId } = request;
        const app = await ApplicationModel.getApplicationById(appId);
        if (!app) return;

        const guild = client.guilds.cache.first();
        if (!guild) return;

        let member;
        try { member = await guild.members.fetch(app.discord_id); } catch (e) {}

        if (member) {
            const embed = new EmbedBuilder()
                .setTitle('Application Requires Changes')
                .setDescription(`Your application requires changes.\n\n**Reason:**\n${reason}\n\nPlease use the button below or start again to continue.`)
                .setColor(RPForms.config.getAll().embeds.colors.warning as any);

            // We omit the button here for simplicity, or we can add it back if we have the UI builder for it.
            // But since the discord.js interaction is not present here, we just send a DM.
            try { await member.send({ embeds: [embed] }); } catch (e) {}
        }

        const channelId = RPForms.config.getAll().channels.reviewLogChannel;
        if (channelId) {
            const channel = guild.channels.cache.get(channelId);
            if (channel) {
                const embed = new EmbedBuilder()
                    .setTitle(`Application #${appId} Review Requested`)
                    .setDescription(`Applicant: <@${app.discord_id}>\nRequested by: <@${staffId}>\nReason: ${reason}`)
                    .setColor(RPForms.config.getAll().embeds.colors.warning as any)
                    .setTimestamp();
                await channel.send({ embeds: [embed] }).catch(() => {});
            }
        }
    });
}
