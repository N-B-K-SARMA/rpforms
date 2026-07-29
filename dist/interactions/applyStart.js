"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ApplicationService_1 = __importDefault(require("../services/ApplicationService"));
exports.default = {
    id: 'apply_start',
    type: 'button_prefix', // Exact match fallback handled by custom logic in interactionCreate
    async execute(interaction, client) {
        await ApplicationService_1.default.startApplication(interaction);
    },
};
