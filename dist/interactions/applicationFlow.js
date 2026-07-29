"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RPForms_1 = require("../core/RPForms");
exports.default = {
    id: 'app_', // prefix for application flow
    type: 'button_prefix',
    async execute(interaction, client) {
        const parts = interaction.customId.split('_');
        const action = parts[1]; // continue, cancel, prev, next, answer, edit, submit
        const appId = parseInt(parts[2]);
        const qIndex = parseInt(parts[3]);
        const request = {
            userId: interaction.user.id,
            appId,
            qIndex
        };
        if (action === 'continue' || action === 'edit') {
            request.qIndex = 0;
            const result = await RPForms_1.RPForms.applications.showQuestion(request);
            if (result && result.ui)
                await interaction.update(result.ui);
        }
        else if (action === 'cancel') {
            await interaction.update({ content: 'Application cancelled.', embeds: [], components: [] });
            RPForms_1.RPForms.events.emit('applicationClose', request);
        }
        else if (action === 'prev') {
            request.qIndex = qIndex - 1;
            const result = await RPForms_1.RPForms.applications.showQuestion(request);
            if (result && result.ui)
                await interaction.update(result.ui);
        }
        else if (action === 'next') {
            request.qIndex = qIndex + 1;
            const result = await RPForms_1.RPForms.applications.showQuestion(request);
            if (result && result.ui)
                await interaction.update(result.ui);
        }
        else if (action === 'answer') {
            const result = await RPForms_1.RPForms.applications.showAnswerModal(request);
            if (result && result.modal)
                await interaction.showModal(result.modal);
        }
        else if (action === 'submit') {
            const result = await RPForms_1.RPForms.reviews.submitApplication(appId, `<@${interaction.user.id}>`, interaction.user.id);
            const guild = interaction.guild;
            const staffChannel = guild.channels.cache.get(result.staffChannelId);
            if (staffChannel) {
                const staffPing = RPForms_1.RPForms.config.getAll().roles.staff && RPForms_1.RPForms.config.getAll().roles.staff.length > 0
                    ? `<@&${RPForms_1.RPForms.config.getAll().roles.staff[0]}>`
                    : '@here';
                await staffChannel.send({
                    content: `${staffPing} A new application has been submitted by <@${interaction.user.id}>!`,
                    ...result.ui
                });
            }
            await interaction.update({
                content: 'Your application has been submitted for review!',
                embeds: [],
                components: [],
            });
        }
    },
};
