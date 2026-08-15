import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { RPForms } from '../core/RPForms';

export class ReviewUIBuilder {
    static buildStaffReviewEmbed(applicantStr: string, applicantId: string, appId: number, questions: any[], answers: any[], historyInfo?: { total: number, approved: number, rejected: number }) {
        const embed = new EmbedBuilder()
            .setTitle(`Application Review #${appId}`)
            .setColor(RPForms.config.getAll().embeds.colors.warning as any)
            .setTimestamp();

        let description = `**Applicant**\n<@${applicantId}>\n\n**Discord ID**\n\`${applicantId}\`\n\n**Status**\n🟡 Pending Review\n`;
        
        if (historyInfo) {
            description += `\n**Application History**\n\`${historyInfo.total} Total • ${historyInfo.approved} Approved • ${historyInfo.rejected} Rejected\`\n`;
        }

        embed.setDescription(description);

        for (const q of questions) {
            const a = answers.find((ans) => String(ans.question_id) === String(q.id));
            let displayAnswer = a ? a.answer_text : '*(No answer)*';
            if (displayAnswer.length > 1000) displayAnswer = displayAnswer.substring(0, 1000) + '... *(Truncated)*';
            
            // Use blockquotes for a cleaner UI
            const formattedAnswer = displayAnswer.split('\n').map(line => `> ${line}`).join('\n');
            embed.addFields({ name: q.label || q.question, value: formattedAnswer + '\n\u200B' }); // zero-width space for padding
        }

        const row = new ActionRowBuilder<any>().addComponents(
            new ButtonBuilder()
                .setCustomId(`staff_approve_${appId}`)
                .setLabel('Approve')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`staff_reject_${appId}`)
                .setLabel('Reject')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId(`staff_review_${appId}`)
                .setLabel('Needs Review')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(`staff_history_${appId}_${applicantId}`)
                .setLabel('View History')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`staff_close_${appId}`)
                .setLabel('Close')
                .setStyle(ButtonStyle.Secondary),
        );

        return { embeds: [embed], components: [row] };
    }

    static buildHistoryEmbed(applicantStr: string, applicantId: string, history: any[]) {
        const embed = new EmbedBuilder()
            .setTitle(`Application History for ${applicantStr}`)
            .setDescription(`Found **${history.length}** applications for <@${applicantId}>.`)
            .setColor(RPForms.config.getAll().embeds.colors.primary as any);

        const limit = Math.min(history.length, 10);
        for (let i = 0; i < limit; i++) {
            const app = history[i];
            const dateStr = new Date(app.created_at).toLocaleDateString();
            
            let emoji = '🟡';
            if (app.status === 'approved') emoji = '✅';
            if (app.status === 'rejected') emoji = '❌';
            if (app.status === 'cancelled' || app.status === 'closed') emoji = '⚪';

            embed.addFields({
                name: `Application #${app.id}`,
                value: `${emoji} Status: **${app.status.toUpperCase()}**\nDate: ${dateStr}`,
                inline: true
            });
        }

        if (history.length > 10) {
            embed.addFields({ name: 'Note', value: `*Showing the 10 most recent applications out of ${history.length} total.*` });
        }

        return { embeds: [embed], ephemeral: true };
    }
}
