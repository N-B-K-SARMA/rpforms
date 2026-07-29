"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RPForms_1 = require("../core/RPForms");
class AnswerModel {
    static async saveAnswer(applicationId, questionId, answerText) {
        await RPForms_1.RPForms.database.saveAnswer(applicationId, questionId, answerText);
    }
    static async getAnswers(applicationId) {
        return await RPForms_1.RPForms.database.getAnswers(applicationId);
    }
    static async getAnswer(applicationId, questionId) {
        return await RPForms_1.RPForms.database.getAnswer(applicationId, questionId);
    }
}
exports.default = AnswerModel;
