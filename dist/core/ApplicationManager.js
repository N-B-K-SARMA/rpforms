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
        const form = RPForms_1.RPForms.forms.getForm(formId);
        if (!form) {
            return { error: true, ui: ApplicationUIBuilder_1.ApplicationUIBuilder.buildErrorEmbed(`Form '${formId}' not found or invalid.`) };
        }
        if (!form.runtime.enabled) {
            return { error: true, ui: ApplicationUIBuilder_1.ApplicationUIBuilder.buildErrorEmbed(`Form '${form.metadata.title}' is currently disabled.`) };
        }
        await User_1.default.ensureUser(userId);
        const user = await User_1.default.getUser(userId);
        if (user?.cooldown_until && new Date(user.cooldown_until) > new Date()) {
            return {
                error: true,
                ui: ApplicationUIBuilder_1.ApplicationUIBuilder.buildErrorEmbed(`You are on cooldown until <t:${Math.floor(new Date(user.cooldown_until).getTime() / 1000)}:R>.`)
            };
        }
        // Roles check (global for now or we could use form-specific block roles if added)
        if (RPForms_1.RPForms.config.getAll().roles.allowlisted && memberRoles.includes(RPForms_1.RPForms.config.getAll().roles.allowlisted)) {
            // This logic should probably be configurable per form, but we'll stick to the existing behavior for now or adapt it to allowlist only.
            // If the user wants to apply for staff, but they have allowlisted role, they shouldn't be blocked.
            // For now, let's keep it as is if it's the allowlist form.
            if (formId === 'allowlist') {
                return { error: true, ui: ApplicationUIBuilder_1.ApplicationUIBuilder.buildErrorEmbed('You already have the allowlist role.') };
            }
        }
        let app = await Application_1.default.getActiveApplication(userId);
        let isResume = false;
        if (app) {
            // There's an active application. We can resume it.
            isResume = true;
        }
        else {
            const newAppId = await Application_1.default.createApplication(userId);
            app = await Application_1.default.getApplicationById(newAppId);
        }
        if (!app) {
            return { error: true, ui: ApplicationUIBuilder_1.ApplicationUIBuilder.buildErrorEmbed('Database error: Could not start application.') };
        }
        if (!isResume) {
            RPForms_1.RPForms.events.emit('applicationCreate', { userId, formId, appId: app.id });
        }
        return {
            error: false,
            ui: ApplicationUIBuilder_1.ApplicationUIBuilder.buildStartEmbed(app.id, form, isResume)
        };
    }
    async showQuestion(request) {
        const { appId, qIndex } = request;
        // We really should store formId in the database application row. 
        // For now, we will default to allowlist or we could try to guess. Let's just use allowlist until schema is updated.
        const form = RPForms_1.RPForms.forms.getForm('allowlist');
        if (!form)
            return { ui: ApplicationUIBuilder_1.ApplicationUIBuilder.buildErrorEmbed('Form configuration missing.') };
        const questions = form.questions || [];
        if (qIndex >= questions.length) {
            return await this.showFinalReview(appId);
        }
        const question = questions[qIndex];
        const answer = await Answer_1.default.getAnswer(appId, question.id.toString());
        return {
            ui: ApplicationUIBuilder_1.ApplicationUIBuilder.buildQuestionEmbed(appId, qIndex, question, questions.length, answer?.answer_text, form)
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
        // Validation
        if (question.required && (!answerText || answerText.trim() === '')) {
            return false;
        }
        if (question.minLength && answerText.length < question.minLength) {
            return false; // Could throw error but returning false for simplicity right now
        }
        if (question.maxLength && answerText.length > question.maxLength) {
            return false;
        }
        await Answer_1.default.saveAnswer(appId, question.id.toString(), answerText);
        return true;
    }
    async showFinalReview(appId) {
        const form = RPForms_1.RPForms.forms.getForm('allowlist');
        if (!form)
            return { ui: ApplicationUIBuilder_1.ApplicationUIBuilder.buildErrorEmbed('Form configuration missing.') };
        const questions = form.questions || [];
        const answers = await Answer_1.default.getAnswers(appId);
        return {
            ui: ApplicationUIBuilder_1.ApplicationUIBuilder.buildFinalReviewEmbed(appId, form, questions, answers)
        };
    }
    async handleTimeouts() {
        const forms = RPForms_1.RPForms.forms.getForms();
        for (const form of forms) {
            if (!form.runtime.timeoutMinutes)
                continue;
            const [rows] = await RPForms_1.RPForms.database.query('SELECT * FROM applications WHERE status = "pending"');
            const timeoutMs = form.runtime.timeoutMinutes * 60 * 1000;
            const now = new Date().getTime();
            for (const app of rows) {
                // We should technically check if this app belongs to this form. For now assuming all are allowlist.
                const appTime = new Date(app.created_at).getTime();
                if (now - appTime > timeoutMs) {
                    await RPForms_1.RPForms.database.query('UPDATE applications SET status = "cancelled" WHERE id = ?', [app.id]);
                    console.log(`[Timeout] Cancelled application ${app.id} due to timeout.`);
                    // We could also send a DM to the user here.
                }
            }
        }
    }
}
exports.ApplicationManager = ApplicationManager;
