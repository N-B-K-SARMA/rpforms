"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RPForms_1 = require("../core/RPForms");
exports.default = {
    id: 'apply_start',
    type: 'button_prefix',
    async execute(interaction, client) {
        const memberRoles = interaction.member.roles.cache.map((r) => r.id);
        // customId is 'apply_start_formId' or just 'apply_start' for legacy panels
        const parts = interaction.customId.split('_');
        const formId = parts[2] || 'allowlist';
        const result = await RPForms_1.RPForms.applications.startApplication({
            userId: interaction.user.id,
            formId: formId
        }, memberRoles);
        if (result.error) {
            await interaction.reply({ ...result.ui, ephemeral: true });
        }
        else {
            await interaction.reply({ ...result.ui, ephemeral: true });
        }
    },
};
