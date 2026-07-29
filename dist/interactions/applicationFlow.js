"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ApplicationService_1 = __importDefault(require("../services/ApplicationService"));
const StaffReviewService_1 = __importDefault(require("../services/StaffReviewService"));
exports.default = {
    id: 'app_', // prefix for application flow
    type: 'button_prefix',
    async execute(interaction, client) {
        const parts = interaction.customId.split('_');
        const action = parts[1]; // continue, cancel, prev, next, answer, edit, submit
        const appId = parseInt(parts[2]);
        const qIndex = parseInt(parts[3]);
        if (action === 'continue') {
            await ApplicationService_1.default.showQuestion(interaction, appId, 0);
        }
        else if (action === 'cancel') {
            await interaction.update({ content: 'Application cancelled.', embeds: [], components: [] });
            // optionally clean up db or set status to cancelled
        }
        else if (action === 'prev') {
            await ApplicationService_1.default.showQuestion(interaction, appId, qIndex - 1);
        }
        else if (action === 'next') {
            await ApplicationService_1.default.showQuestion(interaction, appId, qIndex + 1);
        }
        else if (action === 'answer') {
            await ApplicationService_1.default.showAnswerModal(interaction, appId, qIndex);
        }
        else if (action === 'edit') {
            await ApplicationService_1.default.showQuestion(interaction, appId, 0);
        }
        else if (action === 'submit') {
            // submit application
            await StaffReviewService_1.default.submitApplication(interaction, client, appId);
        }
    },
};
