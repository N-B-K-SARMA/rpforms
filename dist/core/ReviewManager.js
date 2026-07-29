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
const discord_js_1 = require("discord.js");
class ReviewManager {
    async processAction(request) {
        const { appId, action, applicantId } = request;
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
        else if (action === 'close') {
            await Application_1.default.updateStatus(appId, 'closed');
            RPForms_1.RPForms.events.emit('applicationClose', request);
            const closeEmbed = new discord_js_1.EmbedBuilder()
                .setTitle(`Application #${appId} Closed`)
                .setDescription('This application has been closed by staff without approval or rejection.')
                .setColor(RPForms_1.RPForms.config.getAll().embeds.colors.secondary);
            return { success: true, ui: { embeds: [closeEmbed], components: [] } };
        }
        else if (action === 'history') {
            if (!applicantId)
                return { error: 'Applicant ID not provided' };
            const history = await Application_1.default.getApplicationHistory(applicantId);
            return { success: true, ui: ReviewUIBuilder_1.ReviewUIBuilder.buildHistoryEmbed('Applicant', applicantId, history) };
        }
        return { error: 'Invalid action' };
    }
    async handleModal(request) {
        const { appId, action, reason } = request;
        if (action === 'reject') {
            await Application_1.default.updateStatus(appId, 'rejected');
            const app = await Application_1.default.getApplicationById(appId);
            if (app) {
                // Determine cooldown from form settings
                const form = RPForms_1.RPForms.forms.getForm('allowlist');
                const cooldownHours = form?.actions?.onReject?.cooldownHours || 24;
                const cooldownMs = cooldownHours * 60 * 60 * 1000;
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
        const staffChannelId = form?.review?.channelId || RPForms_1.RPForms.config.getAll().channels.staffReviewChannel || RPForms_1.RPForms.config.getAll().channels.applicationCategory;
        await Application_1.default.updateStatus(appId, 'review', staffChannelId);
        RPForms_1.RPForms.events.emit('applicationSubmit', { appId, applicantId });
        const history = await Application_1.default.getApplicationHistory(applicantId);
        const historyInfo = {
            total: history.length,
            approved: history.filter(h => h.status === 'approved').length,
            rejected: history.filter(h => h.status === 'rejected').length
        };
        return {
            ui: ReviewUIBuilder_1.ReviewUIBuilder.buildStaffReviewEmbed(applicantStr, applicantId, appId, questions, answers, historyInfo),
            staffChannelId
        };
    }
}
exports.ReviewManager = ReviewManager;
