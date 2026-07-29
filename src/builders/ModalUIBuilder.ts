import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { RPForms } from '../core/RPForms';

export class ModalUIBuilder {
    static buildAnswerModal(appId: number, qIndex: number, question: any, currentAnswer?: string) {
        const modal = new ModalBuilder()
            .setCustomId(`modal_answer_${appId}_${qIndex}`)
            .setTitle(`Question ${qIndex + 1}`);

        const answerInput = new TextInputBuilder()
            .setCustomId('answerText')
            .setLabel('Your Answer')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(question.required !== false)
            .setValue(currentAnswer || '');

        const actionRow = new ActionRowBuilder<any>().addComponents(answerInput);
        modal.addComponents(actionRow);

        return modal;
    }

    static buildReasonModal(appId: number, action: string) {
        const modal = new ModalBuilder()
            .setCustomId(`staffmodal_${action}_${appId}`)
            .setTitle(action === 'reject' ? 'Reject Reason' : 'Review Reason');

        const reasonInput = new TextInputBuilder()
            .setCustomId('reasonText')
            .setLabel('Reason')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const actionRow = new ActionRowBuilder<any>().addComponents(reasonInput);
        modal.addComponents(actionRow);

        return modal;
    }
}
