import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { RPForms } from '../core/RPForms';

export class ReviewUIBuilder {
    static buildStaffReviewEmbed(applicantStr: string, applicantId: string, appId: number, questions: any[], answers: any[]) {
        const embed = new EmbedBuilder()
            .setTitle('New Application Review')
            .addFields(
                { name: 'Discord User', value: `${applicantStr} (${applicantId})`, inline: true },
                { name: 'Application ID', value: `${appId}`, inline: true },
                { name: 'Status', value: '🟡 Review', inline: true },
            )
            .setColor(RPForms.config.getAll().embeds.colors.warning as any)
            .setTimestamp();

        for (const q of questions) {
            const a = answers.find((ans) => String(ans.question_id) === String(q.id));
            let displayAnswer = a ? a.answer_text : 'No answer';
            if (displayAnswer.length > 1024) displayAnswer = displayAnswer.substring(0, 1020) + '...';
            embed.addFields({ name: q.question, value: displayAnswer });
        }

        const row = new ActionRowBuilder<any>().addComponents(
            new ButtonBuilder()
                .setCustomId(`staff_approve_${appId}`)
                .setLabel('✅ Approve')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`staff_reject_${appId}`)
                .setLabel('❌ Reject')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId(`staff_review_${appId}`)
                .setLabel('🟡 Review')
                .setStyle(ButtonStyle.Secondary),
        );

        return { embeds: [embed], components: [row] };
    }
}
