import { RPForms } from './RPForms';
import ApplicationModel from '../models/Application';
import UserModel from '../models/User';
import AnswerModel from '../models/Answer';
import { StartApplicationRequest, ShowQuestionRequest, AnswerQuestionRequest } from '../dto/ApplicationDTO';
import { ApplicationUIBuilder } from '../builders/ApplicationUIBuilder';
import { ModalUIBuilder } from '../builders/ModalUIBuilder';

export class ApplicationManager {
    async startApplication(request: StartApplicationRequest, memberRoles: string[]) {
        const { userId, formId } = request;

        const form = RPForms.forms.getForm(formId);
        if (!form) {
            return { error: true, ui: ApplicationUIBuilder.buildErrorEmbed(`Form '${formId}' not found or invalid.`) };
        }

        if (!form.runtime.enabled) {
            return { error: true, ui: ApplicationUIBuilder.buildErrorEmbed(`Form '${form.metadata.title}' is currently disabled.`) };
        }

        await UserModel.ensureUser(userId);
        const user = await UserModel.getUser(userId);

        if (user?.cooldown_until && new Date(user.cooldown_until) > new Date()) {
            return {
                error: true,
                ui: ApplicationUIBuilder.buildErrorEmbed(`You are on cooldown until <t:${Math.floor(new Date(user.cooldown_until).getTime() / 1000)}:R>.`)
            };
        }

        // Roles check (global for now or we could use form-specific block roles if added)
        if (RPForms.config.getAll().roles.allowlisted && memberRoles.includes(RPForms.config.getAll().roles.allowlisted)) {
            // This logic should probably be configurable per form, but we'll stick to the existing behavior for now or adapt it to allowlist only.
            // If the user wants to apply for staff, but they have allowlisted role, they shouldn't be blocked.
            // For now, let's keep it as is if it's the allowlist form.
            if (formId === 'allowlist') {
                return { error: true, ui: ApplicationUIBuilder.buildErrorEmbed('You already have the allowlist role.') };
            }
        }

        let app = await ApplicationModel.getActiveApplication(userId);
        let isResume = false;

        if (app) {
            // There's an active application. We can resume it.
            isResume = true;
        } else {
            const newAppId = await ApplicationModel.createApplication(userId, formId);
            app = await ApplicationModel.getApplicationById(newAppId);
        }

        if (!app) {
            return { error: true, ui: ApplicationUIBuilder.buildErrorEmbed('Database error: Could not start application.') };
        }

        if (!isResume) {
            console.log(`[ApplicationManager] User ${userId} started a new application (ID: ${app.id}, Form: ${formId})`);
            RPForms.events.emit('applicationCreate', { userId, formId, appId: app.id });
        } else {
            console.log(`[ApplicationManager] User ${userId} resumed application (ID: ${app.id}, Form: ${formId})`);
        }

        return {
            error: false,
            ui: ApplicationUIBuilder.buildStartEmbed(app.id, form, isResume)
        };
    }

    async showQuestion(request: ShowQuestionRequest) {
        const { appId, qIndex } = request;
        
        const app = await ApplicationModel.getApplicationById(appId);
        if (!app) return { ui: ApplicationUIBuilder.buildErrorEmbed('Application not found.') };

        const form = RPForms.forms.getForm(app.form_id); 
        if (!form) return { ui: ApplicationUIBuilder.buildErrorEmbed('Form configuration missing.') };

        const questions = form.questions || [];

        if (qIndex >= questions.length) {
            return await this.showFinalReview(appId);
        }

        const question = questions[qIndex];
        const answer = await AnswerModel.getAnswer(appId, question.id.toString());

        return {
            ui: ApplicationUIBuilder.buildQuestionEmbed(appId, qIndex, question, questions.length, answer?.answer_text, form)
        };
    }

    async showAnswerModal(request: ShowQuestionRequest) {
        const { appId, qIndex } = request;
        const app = await ApplicationModel.getApplicationById(appId);
        if (!app) return null;

        const form = RPForms.forms.getForm(app.form_id);
        const questions = form ? form.questions : [];
        const question = questions[qIndex];
        
        if (!question) return null;

        const answer = await AnswerModel.getAnswer(appId, question.id.toString());
        return {
            modal: ModalUIBuilder.buildAnswerModal(appId, qIndex, question, answer?.answer_text)
        };
    }

    async answerQuestion(request: AnswerQuestionRequest) {
        const { appId, qIndex, answerText } = request;
        const app = await ApplicationModel.getApplicationById(appId);
        if (!app) return false;

        const form = RPForms.forms.getForm(app.form_id);
        const questions = form ? form.questions : [];
        const question = questions[qIndex];
        
        if (!question) return false;

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

        await AnswerModel.saveAnswer(appId, question.id.toString(), answerText);
        return true;
    }

    async showFinalReview(appId: number) {
        const app = await ApplicationModel.getApplicationById(appId);
        if (!app) return { ui: ApplicationUIBuilder.buildErrorEmbed('Application not found.') };

        const form = RPForms.forms.getForm(app.form_id);
        if (!form) return { ui: ApplicationUIBuilder.buildErrorEmbed('Form configuration missing.') };
        
        const questions = form.questions || [];
        const answers = await AnswerModel.getAnswers(appId);

        return {
            ui: ApplicationUIBuilder.buildFinalReviewEmbed(appId, form, questions, answers)
        };
    }

    async handleTimeouts() {
        const forms = RPForms.forms.getForms();
        for (const form of forms) {
            if (!form.runtime.timeoutMinutes) continue;

            const [rows]: any = await RPForms.database.query(
                'SELECT * FROM applications WHERE status = "pending" AND form_id = ?',
                [form.metadata.id]
            );

            const timeoutMs = form.runtime.timeoutMinutes * 60 * 1000;
            const now = new Date().getTime();

            for (const app of rows) {
                const appTime = new Date(app.created_at).getTime();
                if (now - appTime > timeoutMs) {
                    await RPForms.database.query('UPDATE applications SET status = "cancelled" WHERE id = ?', [app.id]);
                    console.log(`[Timeout] Cancelled application ${app.id} due to timeout.`);
                    // We could also send a DM to the user here.
                }
            }
        }
    }
}
