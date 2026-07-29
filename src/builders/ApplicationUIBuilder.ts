import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { RPForms } from '../core/RPForms';

export class ApplicationUIBuilder {
    static getProgressBar(current: number, total: number) {
        const length = 10;
        const progress = Math.round((current / total) * length);
        const emptyProgress = length - progress;
        return '█'.repeat(progress) + '░'.repeat(emptyProgress);
    }

    static buildStartEmbed(appId: number) {
        const embed = new EmbedBuilder()
            .setTitle('Application Process Started')
            .setDescription('You will be presented with several questions.\n\nPlease provide detailed answers.')
            .setColor(RPForms.config.getAll().embeds.colors.primary as any);

        const row = new ActionRowBuilder<any>().addComponents(
            new ButtonBuilder()
                .setCustomId(`app_continue_${appId}_0`)
                .setLabel('Continue')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`app_cancel_${appId}`)
                .setLabel('Cancel Application')
                .setStyle(ButtonStyle.Danger),
        );

        return { embeds: [embed], components: [row] };
    }

    static buildQuestionEmbed(appId: number, qIndex: number, question: any, totalQuestions: number, answerText?: string) {
        const embed = new EmbedBuilder()
            .setTitle(`Question ${qIndex + 1} / ${totalQuestions}`)
            .setDescription(
                `**${question.question}**\n\n${this.getProgressBar(qIndex + 1, totalQuestions)}\n\nYour Answer:\n${answerText ? answerText : '*(No answer provided yet)*'}`
            )
            .setColor(RPForms.config.getAll().embeds.colors.primary as any);

        const row = new ActionRowBuilder<any>().addComponents(
            new ButtonBuilder()
                .setCustomId(`app_prev_${appId}_${qIndex}`)
                .setLabel('⬅ Previous')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(qIndex === 0),
            new ButtonBuilder()
                .setCustomId(`app_answer_${appId}_${qIndex}`)
                .setLabel(answerText ? '✏️ Edit Answer' : '📝 Submit Answer')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`app_next_${appId}_${qIndex}`)
                .setLabel('➡ Next')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(!answerText),
            new ButtonBuilder()
                .setCustomId(`app_cancel_${appId}`)
                .setLabel('❌ Cancel')
                .setStyle(ButtonStyle.Danger),
        );

        return { embeds: [embed], components: [row] };
    }

    static buildFinalReviewEmbed(appId: number, questions: any[], answers: any[]) {
        const embed = new EmbedBuilder()
            .setTitle('Final Review')
            .setDescription('Please review your answers before submitting.')
            .setColor(RPForms.config.getAll().embeds.colors.primary as any);

        for (const q of questions) {
            const a = answers.find((ans) => String(ans.question_id) === String(q.id));
            let displayAnswer = a ? a.answer_text : 'No answer';
            if (displayAnswer.length > 1024) displayAnswer = displayAnswer.substring(0, 1020) + '...';
            embed.addFields({ name: q.question, value: displayAnswer });
        }

        const row = new ActionRowBuilder<any>().addComponents(
            new ButtonBuilder()
                .setCustomId(`app_edit_${appId}`)
                .setLabel('Edit Answers')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(`app_submit_${appId}`)
                .setLabel('Submit Application')
                .setStyle(ButtonStyle.Success),
        );

        return { embeds: [embed], components: [row] };
    }
}
