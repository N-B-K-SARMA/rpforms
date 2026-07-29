"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationManager = void 0;
const RPForms_1 = require("./RPForms");
const Application_1 = __importDefault(require("../models/Application"));
const User_1 = __importDefault(require("../models/User"));
const Answer_1 = __importDefault(require("../models/Answer"));
const ApplicationUIBuilder_1 = require("../builders/ApplicationUIBuilder");
const ModalUIBuilder_1 = require("../builders/ModalUIBuilder");
class ApplicationManager {
    async startApplication(request, memberRoles) {
        const { userId, formId } = request;
        await User_1.default.ensureUser(userId);
        const user = await User_1.default.getUser(userId);
        if (user?.cooldown_until && new Date(user.cooldown_until) > new Date()) {
            return {
                error: true,
                message: `You are on cooldown until <t:${Math.floor(new Date(user.cooldown_until).getTime() / 1000)}:R>.`
            };
        }
        if (RPForms_1.RPForms.config.getAll().roles.allowlisted && memberRoles.includes(RPForms_1.RPForms.config.getAll().roles.allowlisted)) {
            return { error: true, message: 'You are already allowlisted!' };
        }
        let app = await Application_1.default.getActiveApplication(userId);
        if (!app) {
            const appId = await Application_1.default.createApplication(userId);
            app = await Application_1.default.getApplicationById(appId);
        }
        if (!app) {
            return { error: true, message: 'Could not start application.' };
        }
        RPForms_1.RPForms.events.emit('applicationCreate', { userId, formId, appId: app.id });
        return {
            error: false,
            ui: ApplicationUIBuilder_1.ApplicationUIBuilder.buildStartEmbed(app.id)
        };
    }
    async showQuestion(request) {
        const { appId, qIndex } = request;
        const form = RPForms_1.RPForms.forms.getForm('allowlist');
        const questions = form ? form.questions : [];
        if (qIndex >= questions.length) {
            return await this.showFinalReview(appId);
        }
        const question = questions[qIndex];
        const answer = await Answer_1.default.getAnswer(appId, question.id.toString());
        return {
            ui: ApplicationUIBuilder_1.ApplicationUIBuilder.buildQuestionEmbed(appId, qIndex, question, questions.length, answer?.answer_text)
        };
    }
    async showAnswerModal(request) {
        const { appId, qIndex } = request;
        const form = RPForms_1.RPForms.forms.getForm('allowlist');
        const questions = form ? form.questions : [];
        const question = questions[qIndex];
        if (!question)
            return null;
        const answer = await Answer_1.default.getAnswer(appId, question.id.toString());
        return {
            modal: ModalUIBuilder_1.ModalUIBuilder.buildAnswerModal(appId, qIndex, question, answer?.answer_text)
        };
    }
    async answerQuestion(request) {
        const { appId, qIndex, answerText } = request;
        const form = RPForms_1.RPForms.forms.getForm('allowlist');
        const questions = form ? form.questions : [];
        const question = questions[qIndex];
        if (!question)
            return false;
        await Answer_1.default.saveAnswer(appId, question.id.toString(), answerText);
        return true;
    }
    async showFinalReview(appId) {
        const form = RPForms_1.RPForms.forms.getForm('allowlist');
        const questions = form ? form.questions : [];
        const answers = await Answer_1.default.getAnswers(appId);
        return {
            ui: ApplicationUIBuilder_1.ApplicationUIBuilder.buildFinalReviewEmbed(appId, questions, answers)
        };
    }
}
exports.ApplicationManager = ApplicationManager;
