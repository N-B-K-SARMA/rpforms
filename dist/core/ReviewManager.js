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
        const { appId, action, applicantId, staffId } = request;
        const app = await Application_1.default.getApplicationById(appId);
        if (!app)
            return { error: 'Application not found' };
        // Prevent race conditions: action is only allowed if it's currently pending or in review
        if (action !== 'history' && app.status !== 'pending' && app.status !== 'review') {
            return { error: 'Application has already been processed.' };
        }
        if (action === 'approve') {
            console.log(`[ReviewManager] App #${appId} approved by ${staffId}`);
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
            console.log(`[ReviewManager] App #${appId} closed by ${staffId}`);
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
        const { appId, action, reason, staffId } = request;
        const app = await Application_1.default.getApplicationById(appId);
        if (!app)
            return { error: 'Application not found' };
        if (app.status !== 'pending' && app.status !== 'review') {
            return { error: 'Application has already been processed.' };
        }
        if (action === 'reject') {
            console.log(`[ReviewManager] App #${appId} rejected by ${staffId}. Reason: ${reason}`);
            await Application_1.default.updateStatus(appId, 'rejected');
            // Determine cooldown from form settings
            const form = RPForms_1.RPForms.forms.getForm(app.form_id);
            const cooldownHours = form?.actions?.onReject?.cooldownHours || 24;
            const cooldownMs = cooldownHours * 60 * 60 * 1000;
            const cooldownUntil = new Date(Date.now() + cooldownMs);
            await User_1.default.setCooldown(app.discord_id, cooldownUntil);
            RPForms_1.RPForms.events.emit('applicationReject', request);
            return { success: true };
        }
        else if (action === 'review') {
            console.log(`[ReviewManager] App #${appId} needs review requested by ${staffId}. Reason: ${reason}`);
            await Application_1.default.updateStatus(appId, 'review');
            RPForms_1.RPForms.events.emit('applicationReviewRequest', request);
            return { success: true };
        }
        return { error: 'Invalid modal action' };
    }
    async submitApplication(appId, applicantStr, applicantId) {
        const app = await Application_1.default.getApplicationById(appId);
        if (!app)
            return { error: 'Application not found' };
        await Application_1.default.updateStatus(appId, 'review');
        const answers = await Answer_1.default.getAnswers(appId);
        const form = RPForms_1.RPForms.forms.getForm(app.form_id);
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
