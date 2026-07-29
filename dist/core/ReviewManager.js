"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewManager = void 0;
const RPForms_1 = require("./RPForms");
const Application_1 = __importDefault(require("../models/Application"));
const User_1 = __importDefault(require("../models/User"));
const Answer_1 = __importDefault(require("../models/Answer"));
const ReviewUIBuilder_1 = require("../builders/ReviewUIBuilder");
const ModalUIBuilder_1 = require("../builders/ModalUIBuilder");
class ReviewManager {
    async processAction(request) {
        const { appId, action } = request;
        if (action === 'approve') {
            await Application_1.default.updateStatus(appId, 'approved');
            RPForms_1.RPForms.events.emit('applicationApprove', request);
            return { success: true };
        }
        else if (action === 'reject') {
            return { modal: ModalUIBuilder_1.ModalUIBuilder.buildReasonModal(appId, 'reject') };
        }
        else if (action === 'review') {
            return { modal: ModalUIBuilder_1.ModalUIBuilder.buildReasonModal(appId, 'review') };
        }
        return { error: 'Invalid action' };
    }
    async handleModal(request) {
        const { appId, action, reason } = request;
        if (action === 'reject') {
            await Application_1.default.updateStatus(appId, 'rejected');
            const app = await Application_1.default.getApplicationById(appId);
            if (app) {
                const cooldownMs = RPForms_1.RPForms.config.getAll().settings.cooldown || 86400000;
                const cooldownUntil = new Date(Date.now() + cooldownMs);
                await User_1.default.setCooldown(app.discord_id, cooldownUntil);
            }
            RPForms_1.RPForms.events.emit('applicationReject', request);
            return { success: true };
        }
        else if (action === 'review') {
            await Application_1.default.updateStatus(appId, 'review');
            RPForms_1.RPForms.events.emit('applicationReviewRequest', request);
            return { success: true };
        }
        return { error: 'Invalid modal action' };
    }
    async submitApplication(appId, applicantStr, applicantId) {
        await Application_1.default.updateStatus(appId, 'review');
        const answers = await Answer_1.default.getAnswers(appId);
        const form = RPForms_1.RPForms.forms.getForm('allowlist');
        const questions = form ? form.questions : [];
        const staffChannelId = RPForms_1.RPForms.config.getAll().channels.staffReviewChannel || RPForms_1.RPForms.config.getAll().channels.applicationCategory;
        await Application_1.default.updateStatus(appId, 'review', staffChannelId);
        RPForms_1.RPForms.events.emit('applicationSubmit', { appId, applicantId });
        return {
            ui: ReviewUIBuilder_1.ReviewUIBuilder.buildStaffReviewEmbed(applicantStr, applicantId, appId, questions, answers),
            staffChannelId
        };
    }
}
exports.ReviewManager = ReviewManager;
