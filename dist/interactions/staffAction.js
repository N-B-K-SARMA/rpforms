"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const StaffReviewService_1 = __importDefault(require("../services/StaffReviewService"));
exports.default = {
    id: 'staff_',
    type: 'button_prefix',
    async execute(interaction, client) {
        const parts = interaction.customId.split('_');
        const action = parts[1]; // approve, reject, review
        const appId = parseInt(parts[2]);
        await StaffReviewService_1.default.handleStaffAction(interaction, client, action, appId);
    },
};
