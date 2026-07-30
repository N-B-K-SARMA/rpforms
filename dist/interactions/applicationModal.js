"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RPForms_1 = require("../core/RPForms");
exports.default = {
    id: 'modal_answer_',
    type: 'modal_prefix',
    async execute(interaction, client) {
        await interaction.deferUpdate();
        const parts = interaction.customId.split('_');
        const appId = parseInt(parts[2]);
        const qIndex = parseInt(parts[3]);
        const answerText = interaction.fields.getTextInputValue('answerText');
        await RPForms_1.RPForms.applications.answerQuestion({
            userId: interaction.user.id,
            appId,
            qIndex,
            answerText
        });
        const result = await RPForms_1.RPForms.applications.showQuestion({
            userId: interaction.user.id,
            appId,
            qIndex
        });
        if (result && result.ui) {
            await interaction.editReply(result.ui);
        }
        else {
            await interaction.editReply({ content: 'Question not found.', embeds: [], components: [] });
        }
    },
};
