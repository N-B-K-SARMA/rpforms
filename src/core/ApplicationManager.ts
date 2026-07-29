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

        await UserModel.ensureUser(userId);
        const user = await UserModel.getUser(userId);

        if (user?.cooldown_until && new Date(user.cooldown_until) > new Date()) {
            return {
                error: true,
                message: `You are on cooldown until <t:${Math.floor(new Date(user.cooldown_until).getTime() / 1000)}:R>.`
            };
        }

        if (RPForms.config.getAll().roles.allowlisted && memberRoles.includes(RPForms.config.getAll().roles.allowlisted)) {
            return { error: true, message: 'You are already allowlisted!' };
        }

        let app = await ApplicationModel.getActiveApplication(userId);

        if (!app) {
            const appId = await ApplicationModel.createApplication(userId);
            app = await ApplicationModel.getApplicationById(appId);
        }

        if (!app) {
            return { error: true, message: 'Could not start application.' };
        }

        RPForms.events.emit('applicationCreate', { userId, formId, appId: app.id });

        return {
            error: false,
            ui: ApplicationUIBuilder.buildStartEmbed(app.id)
        };
    }

    async showQuestion(request: ShowQuestionRequest) {
        const { appId, qIndex } = request;
        const form = RPForms.forms.getForm('allowlist');
        const questions = form ? form.questions : [];

        if (qIndex >= questions.length) {
            return await this.showFinalReview(appId);
        }

        const question = questions[qIndex];
        const answer = await AnswerModel.getAnswer(appId, question.id.toString());

        return {
            ui: ApplicationUIBuilder.buildQuestionEmbed(appId, qIndex, question, questions.length, answer?.answer_text)
        };
    }

    async showAnswerModal(request: ShowQuestionRequest) {
        const { appId, qIndex } = request;
        const form = RPForms.forms.getForm('allowlist');
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
        const form = RPForms.forms.getForm('allowlist');
        const questions = form ? form.questions : [];
        const question = questions[qIndex];
        
        if (!question) return false;

        await AnswerModel.saveAnswer(appId, question.id.toString(), answerText);
        return true;
    }

    async showFinalReview(appId: number) {
        const form = RPForms.forms.getForm('allowlist');
        const questions = form ? form.questions : [];
        const answers = await AnswerModel.getAnswers(appId);

        return {
            ui: ApplicationUIBuilder.buildFinalReviewEmbed(appId, questions, answers)
        };
    }
}
