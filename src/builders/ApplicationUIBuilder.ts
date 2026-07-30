import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { RPForms } from '../core/RPForms';
import { IForm, IFormQuestion } from '../interfaces/IForm';

export class ApplicationUIBuilder {
    static getProgressBar(current: number, total: number) {
        const length = 10;
        const progress = Math.round((current / total) * length);
        const emptyProgress = length - progress;
        return '█'.repeat(progress) + '░'.repeat(emptyProgress);
    }

    static buildErrorEmbed(message: string) {
        const embed = new EmbedBuilder()
            .setTitle('Error')
            .setDescription(`⚠️ ${message}`)
            .setColor(RPForms.config.getAll().embeds.colors.danger as any);
        return { embeds: [embed], components: [], ephemeral: true };
    }

    static buildStartEmbed(appId: number, form: IForm, isResume: boolean = false) {
        const embed = new EmbedBuilder()
            .setTitle(form.embeds?.startEmbed?.title || 'Application Started')
            .setDescription(isResume ? 'Welcome back! You have an unfinished application. Would you like to resume?' : form.metadata.description)
            .setColor(form.embeds?.startEmbed?.color as any || RPForms.config.getAll().embeds.colors.primary as any);

        if (form.embeds?.startEmbed?.thumbnail) {
            embed.setThumbnail(form.embeds.startEmbed.thumbnail);
        }

        const row = new ActionRowBuilder<any>().addComponents(
            new ButtonBuilder()
                .setCustomId(`app_continue_${appId}_0`)
                .setLabel(isResume ? 'Resume Application' : 'Start Application')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`app_cancelConfirm_${appId}`)
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Danger),
        );

        return { embeds: [embed], components: [row] };
    }

    static buildCancelConfirmEmbed(appId: number, form: IForm) {
        const embed = new EmbedBuilder()
            .setTitle('Cancel Application')
            .setDescription('Are you sure you want to cancel this application? All progress will be lost.')
            .setColor(RPForms.config.getAll().embeds.colors.warning as any);

        const row = new ActionRowBuilder<any>().addComponents(
            new ButtonBuilder()
                .setCustomId(`app_cancel_${appId}`)
                .setLabel('Yes, Cancel')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId(`app_continue_${appId}_0`)
                .setLabel('No, Resume')
                .setStyle(ButtonStyle.Secondary),
        );

        return { embeds: [embed], components: [row] };
    }

    static buildQuestionEmbed(appId: number, qIndex: number, question: IFormQuestion, totalQuestions: number, answerText?: string, form?: IForm) {
        const requirementText = question.required ? '*(Required)*' : '*(Optional)*';
        const lengthText = question.minLength || question.maxLength 
            ? `\n\n*Length limits: ${question.minLength || 0} to ${question.maxLength || '∞'} chars*` 
            : '';

        const embed = new EmbedBuilder()
            .setTitle(form?.embeds?.questionEmbed?.title || `Question ${qIndex + 1} of ${totalQuestions}`)
            .setDescription(
                `**${question.label}** ${requirementText}\n` +
                `${question.question}${lengthText}\n\n` +
                `**Your Answer:**\n\`\`\`text\n${answerText ? answerText : 'No answer provided yet.'}\n\`\`\`\n\n*(Progress: ${qIndex + 1}/${totalQuestions})*`
            )
            .setColor(form?.embeds?.questionEmbed?.color as any || RPForms.config.getAll().embeds.colors.primary as any);

        if (form?.embeds?.questionEmbed?.thumbnail) {
            embed.setThumbnail(form.embeds.questionEmbed.thumbnail);
        }

        const row = new ActionRowBuilder<any>().addComponents(
            new ButtonBuilder()
                .setCustomId(`app_prev_${appId}_${qIndex}`)
                .setLabel('⬅ Previous')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(qIndex === 0),
            new ButtonBuilder()
                .setCustomId(`app_answer_${appId}_${qIndex}`)
                .setLabel(answerText ? '✏️ Edit Answer' : '📝 Provide Answer')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`app_next_${appId}_${qIndex}`)
                .setLabel(qIndex === totalQuestions - 1 ? 'Review ➡' : 'Next ➡')
                .setStyle(ButtonStyle.Success)
                .setDisabled(question.required && !answerText),
            new ButtonBuilder()
                .setCustomId(`app_cancelConfirm_${appId}`)
                .setLabel('❌ Cancel')
                .setStyle(ButtonStyle.Danger),
        );

        return { embeds: [embed], components: [row] };
    }

    static buildFinalReviewEmbed(appId: number, form: IForm, questions: IFormQuestion[], answers: any[]) {
        const embed = new EmbedBuilder()
            .setTitle(form.embeds?.reviewEmbed?.title || 'Final Review')
            .setDescription('Please review your answers before submitting. Click "Edit" to modify an answer.')
            .setColor(form.embeds?.reviewEmbed?.color as any || RPForms.config.getAll().embeds.colors.primary as any);

        if (form.embeds?.reviewEmbed?.thumbnail) {
            embed.setThumbnail(form.embeds.reviewEmbed.thumbnail);
        }

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            const a = answers.find((ans) => String(ans.question_id) === String(q.id));
            let displayAnswer = a ? a.answer_text : '*(No answer)*';
            if (displayAnswer.length > 1010) displayAnswer = displayAnswer.substring(0, 1010) + '...';
            embed.addFields({ name: `Q${i + 1}: ${q.label}`, value: `\`\`\`text\n${displayAnswer}\n\`\`\`` });
        }

        const row = new ActionRowBuilder<any>().addComponents(
            new ButtonBuilder()
                .setCustomId(`app_continue_${appId}_0`) // Goes back to first question to edit
                .setLabel('Edit Answers')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(`app_submit_${appId}`)
                .setLabel('Submit Application')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`app_cancelConfirm_${appId}`)
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Danger),
        );

        return { embeds: [embed], components: [row] };
    }

    static buildSubmissionConfirmationEmbed(appId: number, form: IForm) {
        const embed = new EmbedBuilder()
            .setTitle('Application Submitted! ✅')
            .setDescription(`Your application has been successfully submitted to the staff team for review.\n\n**Reference ID:** \`#${appId}\`\n\nYou will be notified here once a decision is made.`)
            .setColor(RPForms.config.getAll().embeds.colors.success as any);
        return { embeds: [embed], components: [] };
    }
}
