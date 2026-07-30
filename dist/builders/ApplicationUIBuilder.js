"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationUIBuilder = void 0;
const discord_js_1 = require("discord.js");
const RPForms_1 = require("../core/RPForms");
class ApplicationUIBuilder {
    static getProgressBar(current, total) {
        const length = 10;
        const progress = Math.round((current / total) * length);
        const emptyProgress = length - progress;
        return '█'.repeat(progress) + '░'.repeat(emptyProgress);
    }
    static buildErrorEmbed(message) {
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('Error')
            .setDescription(`⚠️ ${message}`)
            .setColor(RPForms_1.RPForms.config.getAll().embeds.colors.danger);
        return { embeds: [embed], components: [], ephemeral: true };
    }
    static buildStartEmbed(appId, form, isResume = false) {
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle(form.embeds?.startEmbed?.title || 'Application Started')
            .setDescription(isResume ? 'Welcome back! You have an unfinished application. Would you like to resume?' : form.metadata.description)
            .setColor(form.embeds?.startEmbed?.color || RPForms_1.RPForms.config.getAll().embeds.colors.primary);
        if (form.embeds?.startEmbed?.thumbnail) {
            embed.setThumbnail(form.embeds.startEmbed.thumbnail);
        }
        const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId(`app_continue_${appId}_0`)
            .setLabel(isResume ? 'Resume Application' : 'Start Application')
            .setStyle(discord_js_1.ButtonStyle.Success), new discord_js_1.ButtonBuilder()
            .setCustomId(`app_cancelConfirm_${appId}`)
            .setLabel('Cancel')
            .setStyle(discord_js_1.ButtonStyle.Danger));
        return { embeds: [embed], components: [row] };
    }
    static buildCancelConfirmEmbed(appId, form) {
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('Cancel Application')
            .setDescription('Are you sure you want to cancel this application? All progress will be lost.')
            .setColor(RPForms_1.RPForms.config.getAll().embeds.colors.warning);
        const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId(`app_cancel_${appId}`)
            .setLabel('Yes, Cancel')
            .setStyle(discord_js_1.ButtonStyle.Danger), new discord_js_1.ButtonBuilder()
            .setCustomId(`app_continue_${appId}_0`)
            .setLabel('No, Resume')
            .setStyle(discord_js_1.ButtonStyle.Secondary));
        return { embeds: [embed], components: [row] };
    }
    static buildQuestionEmbed(appId, qIndex, question, totalQuestions, answerText, form) {
        const requirementText = question.required ? '*(Required)*' : '*(Optional)*';
        const lengthText = question.minLength || question.maxLength
            ? `\n\n*Length limits: ${question.minLength || 0} to ${question.maxLength || '∞'} chars*`
            : '';
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle(form?.embeds?.questionEmbed?.title || `Question ${qIndex + 1} of ${totalQuestions}`)
            .setDescription(`**${question.label}** ${requirementText}\n` +
            `${question.question}${lengthText}\n\n` +
            `**Your Answer:**\n\`\`\`text\n${answerText ? answerText : 'No answer provided yet.'}\n\`\`\`\n\n*(Progress: ${qIndex + 1}/${totalQuestions})*`)
            .setColor(form?.embeds?.questionEmbed?.color || RPForms_1.RPForms.config.getAll().embeds.colors.primary);
        if (form?.embeds?.questionEmbed?.thumbnail) {
            embed.setThumbnail(form.embeds.questionEmbed.thumbnail);
        }
        const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId(`app_prev_${appId}_${qIndex}`)
            .setLabel('⬅ Previous')
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setDisabled(qIndex === 0), new discord_js_1.ButtonBuilder()
            .setCustomId(`app_answer_${appId}_${qIndex}`)
            .setLabel(answerText ? '✏️ Edit Answer' : '📝 Provide Answer')
            .setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder()
            .setCustomId(`app_next_${appId}_${qIndex}`)
            .setLabel(qIndex === totalQuestions - 1 ? 'Review ➡' : 'Next ➡')
            .setStyle(discord_js_1.ButtonStyle.Success)
            .setDisabled(question.required && !answerText), new discord_js_1.ButtonBuilder()
            .setCustomId(`app_cancelConfirm_${appId}`)
            .setLabel('❌ Cancel')
            .setStyle(discord_js_1.ButtonStyle.Danger));
        return { embeds: [embed], components: [row] };
    }
    static buildFinalReviewEmbed(appId, form, questions, answers) {
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle(form.embeds?.reviewEmbed?.title || 'Final Review')
            .setDescription('Please review your answers before submitting. Click "Edit" to modify an answer.')
            .setColor(form.embeds?.reviewEmbed?.color || RPForms_1.RPForms.config.getAll().embeds.colors.primary);
        if (form.embeds?.reviewEmbed?.thumbnail) {
            embed.setThumbnail(form.embeds.reviewEmbed.thumbnail);
        }
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            const a = answers.find((ans) => String(ans.question_id) === String(q.id));
            let displayAnswer = a ? a.answer_text : '*(No answer)*';
            if (displayAnswer.length > 1010)
                displayAnswer = displayAnswer.substring(0, 1010) + '...';
            embed.addFields({ name: `Q${i + 1}: ${q.label}`, value: `\`\`\`text\n${displayAnswer}\n\`\`\`` });
        }
        const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId(`app_continue_${appId}_0`) // Goes back to first question to edit
            .setLabel('Edit Answers')
            .setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
            .setCustomId(`app_submit_${appId}`)
            .setLabel('Submit Application')
            .setStyle(discord_js_1.ButtonStyle.Success), new discord_js_1.ButtonBuilder()
            .setCustomId(`app_cancelConfirm_${appId}`)
            .setLabel('Cancel')
            .setStyle(discord_js_1.ButtonStyle.Danger));
        return { embeds: [embed], components: [row] };
    }
    static buildSubmissionConfirmationEmbed(appId, form) {
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('Application Submitted! ✅')
            .setDescription(`Your application has been successfully submitted to the staff team for review.\n\n**Reference ID:** \`#${appId}\`\n\nYou will be notified here once a decision is made.`)
            .setColor(RPForms_1.RPForms.config.getAll().embeds.colors.success);
        return { embeds: [embed], components: [] };
    }
}
exports.ApplicationUIBuilder = ApplicationUIBuilder;
