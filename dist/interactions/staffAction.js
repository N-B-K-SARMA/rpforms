"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RPForms_1 = require("../core/RPForms");
exports.default = {
    id: 'staff_',
    type: 'button_prefix',
    async execute(interaction, client) {
        const parts = interaction.customId.split('_');
        const action = parts[1]; // approve, reject, review, close, history
        const appId = parseInt(parts[2]);
        const applicantId = parts[3];
        const request = {
            appId,
            action,
            applicantId,
            staffId: interaction.user.id
        };
        const result = await RPForms_1.RPForms.reviews.processAction(request);
        if (result.modal) {
            await interaction.showModal(result.modal);
        }
        else if (result.ui && action === 'history') {
            await interaction.reply(result.ui);
        }
        else if (result.ui && action === 'close') {
            await interaction.update(result.ui);
        }
        else if (result.success) {
            const originalEmbed = interaction.message.embeds[0];
            const updatedEmbed = { ...originalEmbed.data };
            if (action === 'approve') {
                updatedEmbed.color = RPForms_1.RPForms.config.getAll().embeds.colors.success;
                const statusField = updatedEmbed.fields.find((f) => f.name === 'Status');
                if (statusField)
                    statusField.value = '🟢 Approved';
            }
            await interaction.update({ embeds: [updatedEmbed], components: [] });
        }
        else if (result.error) {
            await interaction.reply({ content: `Error: ${result.error}`, ephemeral: true });
        }
    },
};
