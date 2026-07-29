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
    static buildStartEmbed(appId) {
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('Application Process Started')
            .setDescription('You will be presented with several questions.\n\nPlease provide detailed answers.')
            .setColor(RPForms_1.RPForms.config.getAll().embeds.colors.primary);
        const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId(`app_continue_${appId}_0`)
            .setLabel('Continue')
            .setStyle(discord_js_1.ButtonStyle.Success), new discord_js_1.ButtonBuilder()
            .setCustomId(`app_cancel_${appId}`)
            .setLabel('Cancel Application')
            .setStyle(discord_js_1.ButtonStyle.Danger));
        return { embeds: [embed], components: [row] };
    }
    static buildQuestionEmbed(appId, qIndex, question, totalQuestions, answerText) {
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle(`Question ${qIndex + 1} / ${totalQuestions}`)
            .setDescription(`**${question.question}**\n\n${this.getProgressBar(qIndex + 1, totalQuestions)}\n\nYour Answer:\n${answerText ? answerText : '*(No answer provided yet)*'}`)
            .setColor(RPForms_1.RPForms.config.getAll().embeds.colors.primary);
        const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId(`app_prev_${appId}_${qIndex}`)
            .setLabel('⬅ Previous')
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setDisabled(qIndex === 0), new discord_js_1.ButtonBuilder()
            .setCustomId(`app_answer_${appId}_${qIndex}`)
            .setLabel(answerText ? '✏️ Edit Answer' : '📝 Submit Answer')
            .setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder()
            .setCustomId(`app_next_${appId}_${qIndex}`)
            .setLabel('➡ Next')
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setDisabled(!answerText), new discord_js_1.ButtonBuilder()
            .setCustomId(`app_cancel_${appId}`)
            .setLabel('❌ Cancel')
            .setStyle(discord_js_1.ButtonStyle.Danger));
        return { embeds: [embed], components: [row] };
    }
    static buildFinalReviewEmbed(appId, questions, answers) {
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('Final Review')
            .setDescription('Please review your answers before submitting.')
            .setColor(RPForms_1.RPForms.config.getAll().embeds.colors.primary);
        for (const q of questions) {
            const a = answers.find((ans) => String(ans.question_id) === String(q.id));
            let displayAnswer = a ? a.answer_text : 'No answer';
            if (displayAnswer.length > 1024)
                displayAnswer = displayAnswer.substring(0, 1020) + '...';
            embed.addFields({ name: q.question, value: displayAnswer });
        }
        const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId(`app_edit_${appId}`)
            .setLabel('Edit Answers')
            .setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
            .setCustomId(`app_submit_${appId}`)
            .setLabel('Submit Application')
            .setStyle(discord_js_1.ButtonStyle.Success));
        return { embeds: [embed], components: [row] };
    }
}
exports.ApplicationUIBuilder = ApplicationUIBuilder;
