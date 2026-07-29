"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const RPForms_1 = require("../core/RPForms");
const Application_1 = __importDefault(require("../models/Application"));
const Answer_1 = __importDefault(require("../models/Answer"));
const User_1 = __importDefault(require("../models/User"));
class ApplicationService {
    // Generate the progress bar
    static getProgressBar(current, total) {
        const length = 10;
        const progress = Math.round((current / total) * length);
        const emptyProgress = length - progress;
        return '█'.repeat(progress) + '░'.repeat(emptyProgress);
    }
    // Start application
    static async startApplication(interaction) {
        const userId = interaction.user.id;
        await User_1.default.ensureUser(userId);
        const user = await User_1.default.getUser(userId);
        if (user?.cooldown_until && new Date(user.cooldown_until) > new Date()) {
            return interaction.reply({
                content: `You are on cooldown until <t:${Math.floor(new Date(user.cooldown_until).getTime() / 1000)}:R>.`,
                ephemeral: true,
            });
        }
        // Check if user already has the allowlisted role
        const member = interaction.member;
        if (RPForms_1.RPForms.config.getAll().roles.allowlisted && member.roles.cache.has(RPForms_1.RPForms.config.getAll().roles.allowlisted)) {
            return interaction.reply({ content: 'You are already allowlisted!', ephemeral: true });
        }
        let app = await Application_1.default.getActiveApplication(userId);
        if (!app) {
            const appId = await Application_1.default.createApplication(userId);
            app = await Application_1.default.getApplicationById(appId);
        }
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('Application Process Started')
            .setDescription('You will be presented with several questions.\n\nPlease provide detailed answers.')
            .setColor(RPForms_1.RPForms.config.getAll().embeds.colors.primary);
        const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId(`app_continue_${app?.id}_0`) // index 0 means question index 0
            .setLabel('Continue')
            .setStyle(discord_js_1.ButtonStyle.Success), new discord_js_1.ButtonBuilder()
            .setCustomId(`app_cancel_${app?.id}`)
            .setLabel('Cancel Application')
            .setStyle(discord_js_1.ButtonStyle.Danger));
        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
    // Show a specific question
    static async showQuestion(interaction, appId, qIndex) {
        const form = RPForms_1.RPForms.forms.getForm('allowlist');
        const questions = form ? form.questions : [];
        if (qIndex >= questions.length) {
            return this.showFinalReview(interaction, appId);
        }
        const question = questions[qIndex];
        const answer = await Answer_1.default.getAnswer(appId, question.id.toString());
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle(`Question ${qIndex + 1} / ${questions.length}`)
            .setDescription(`**${question.question}**\n\n${this.getProgressBar(qIndex + 1, questions.length)}\n\nYour Answer:\n${answer ? answer.answer_text : '*(No answer provided yet)*'}`)
            .setColor(RPForms_1.RPForms.config.getAll().embeds.colors.primary);
        const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId(`app_prev_${appId}_${qIndex}`)
            .setLabel('⬅ Previous')
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setDisabled(qIndex === 0), new discord_js_1.ButtonBuilder()
            .setCustomId(`app_answer_${appId}_${qIndex}`)
            .setLabel(answer ? '✏️ Edit Answer' : '📝 Submit Answer')
            .setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder()
            .setCustomId(`app_next_${appId}_${qIndex}`)
            .setLabel('➡ Next')
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setDisabled(!answer), // Must answer to go next
        new discord_js_1.ButtonBuilder()
            .setCustomId(`app_cancel_${appId}`)
            .setLabel('❌ Cancel')
            .setStyle(discord_js_1.ButtonStyle.Danger));
        await interaction.update({ embeds: [embed], components: [row] });
    }
    // Show answer modal
    static async showAnswerModal(interaction, appId, qIndex) {
        const form = RPForms_1.RPForms.forms.getForm('allowlist');
        const questions = form ? form.questions : [];
        const question = questions[qIndex];
        if (!question)
            return;
        const answer = await Answer_1.default.getAnswer(appId, question.id.toString());
        const modal = new discord_js_1.ModalBuilder()
            .setCustomId(`modal_answer_${appId}_${qIndex}`)
            .setTitle(`Question ${qIndex + 1}`);
        const answerInput = new discord_js_1.TextInputBuilder()
            .setCustomId('answerText')
            .setLabel('Your Answer')
            .setStyle(discord_js_1.TextInputStyle.Paragraph)
            .setRequired(question.required !== false)
            .setValue(answer ? answer.answer_text : '');
        const actionRow = new discord_js_1.ActionRowBuilder().addComponents(answerInput);
        modal.addComponents(actionRow);
        await interaction.showModal(modal);
    }
    // Show final review
    static async showFinalReview(interaction, appId) {
        const form = RPForms_1.RPForms.forms.getForm('allowlist');
        const questions = form ? form.questions : [];
        const answers = await Answer_1.default.getAnswers(appId);
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
        await interaction.update({ embeds: [embed], components: [row] });
    }
}
exports.default = ApplicationService;
