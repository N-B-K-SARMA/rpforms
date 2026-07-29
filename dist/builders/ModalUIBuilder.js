"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModalUIBuilder = void 0;
const discord_js_1 = require("discord.js");
class ModalUIBuilder {
    static buildAnswerModal(appId, qIndex, question, currentAnswer) {
        const modal = new discord_js_1.ModalBuilder()
            .setCustomId(`modal_answer_${appId}_${qIndex}`)
            .setTitle(`Question ${qIndex + 1}`);
        const answerInput = new discord_js_1.TextInputBuilder()
            .setCustomId('answerText')
            .setLabel('Your Answer')
            .setStyle(discord_js_1.TextInputStyle.Paragraph)
            .setRequired(question.required !== false)
            .setValue(currentAnswer || '');
        const actionRow = new discord_js_1.ActionRowBuilder().addComponents(answerInput);
        modal.addComponents(actionRow);
        return modal;
    }
    static buildReasonModal(appId, action) {
        const modal = new discord_js_1.ModalBuilder()
            .setCustomId(`staffmodal_${action}_${appId}`)
            .setTitle(action === 'reject' ? 'Reject Reason' : 'Review Reason');
        const reasonInput = new discord_js_1.TextInputBuilder()
            .setCustomId('reasonText')
            .setLabel('Reason')
            .setStyle(discord_js_1.TextInputStyle.Paragraph)
            .setRequired(true);
        const actionRow = new discord_js_1.ActionRowBuilder().addComponents(reasonInput);
        modal.addComponents(actionRow);
        return modal;
    }
}
exports.ModalUIBuilder = ModalUIBuilder;
