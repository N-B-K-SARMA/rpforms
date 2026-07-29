"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ApplicationService_1 = __importDefault(require("../services/ApplicationService"));
const Answer_1 = __importDefault(require("../models/Answer"));
const QuestionService_1 = __importDefault(require("../services/QuestionService"));
exports.default = {
    id: 'modal_answer_',
    type: 'modal_prefix',
    async execute(interaction, client) {
        const parts = interaction.customId.split('_');
        const appId = parseInt(parts[2]);
        const qIndex = parseInt(parts[3]);
        const answerText = interaction.fields.getTextInputValue('answerText');
        const question = QuestionService_1.default.getQuestions()[qIndex];
        // Save answer
        await Answer_1.default.saveAnswer(appId, question.id, answerText);
        // Update embed to show the answered question
        await ApplicationService_1.default.showQuestion(interaction, appId, qIndex);
    },
};
