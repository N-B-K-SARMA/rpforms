import { RPForms } from './RPForms';
import ApplicationModel from '../models/Application';
import UserModel from '../models/User';
import AnswerModel from '../models/Answer';
import { StaffActionRequest } from '../dto/ApplicationDTO';
import { ReviewUIBuilder } from '../builders/ReviewUIBuilder';
import { ModalUIBuilder } from '../builders/ModalUIBuilder';
import { EmbedBuilder } from 'discord.js';

export class ReviewManager {
    async processAction(request: StaffActionRequest) {
        const { appId, action, applicantId, staffId } = request;

        const app = await ApplicationModel.getApplicationById(appId);
        if (!app) return { error: 'Application not found' };

        // Prevent race conditions: action is only allowed if it's currently pending or in review
        if (action !== 'history' && app.status !== 'pending' && app.status !== 'review') {
            return { error: 'Application has already been processed.' };
        }

        if (action === 'approve') {
            console.log(`[ReviewManager] App #${appId} approved by ${staffId}`);
            await ApplicationModel.updateStatus(appId, 'approved');
            RPForms.events.emit('applicationApprove', request);
            return { success: true };
        } else if (action === 'reject') {
            return { modal: ModalUIBuilder.buildReasonModal(appId, 'reject') };
        } else if (action === 'review') {
            return { modal: ModalUIBuilder.buildReasonModal(appId, 'review') };
        } else if (action === 'close') {
            console.log(`[ReviewManager] App #${appId} closed by ${staffId}`);
            await ApplicationModel.updateStatus(appId, 'closed');
            RPForms.events.emit('applicationClose', request);
            const closeEmbed = new EmbedBuilder()
                .setTitle(`Application #${appId} Closed`)
                .setDescription('This application has been closed by staff without approval or rejection.')
                .setColor(RPForms.config.getAll().embeds.colors.secondary as any);
            return { success: true, ui: { embeds: [closeEmbed], components: [] } };
        } else if (action === 'history') {
            if (!applicantId) return { error: 'Applicant ID not provided' };
            const history = await ApplicationModel.getApplicationHistory(applicantId);
            return { success: true, ui: ReviewUIBuilder.buildHistoryEmbed('Applicant', applicantId, history) };
        }

        return { error: 'Invalid action' };
    }
    
    async handleModal(request: StaffActionRequest) {
        const { appId, action, reason, staffId } = request;
        
        const app = await ApplicationModel.getApplicationById(appId);
        if (!app) return { error: 'Application not found' };

        if (app.status !== 'pending' && app.status !== 'review') {
            return { error: 'Application has already been processed.' };
        }
        
        if (action === 'reject') {
            console.log(`[ReviewManager] App #${appId} rejected by ${staffId}. Reason: ${reason}`);
            await ApplicationModel.updateStatus(appId, 'rejected');
            
            // Determine cooldown from form settings
            const form = RPForms.forms.getForm('allowlist');
            const cooldownHours = form?.actions?.onReject?.cooldownHours || 24;
            const cooldownMs = cooldownHours * 60 * 60 * 1000;
            const cooldownUntil = new Date(Date.now() + cooldownMs);
            await UserModel.setCooldown(app.discord_id, cooldownUntil);

            RPForms.events.emit('applicationReject', request);
            return { success: true };
        } else if (action === 'review') {
            console.log(`[ReviewManager] App #${appId} needs review requested by ${staffId}. Reason: ${reason}`);
            await ApplicationModel.updateStatus(appId, 'review');
            RPForms.events.emit('applicationReviewRequest', request);
            return { success: true };
        }

        return { error: 'Invalid modal action' };
    }

    async submitApplication(appId: number, applicantStr: string, applicantId: string) {
        await ApplicationModel.updateStatus(appId, 'review');
        
        const answers = await AnswerModel.getAnswers(appId);
        const form = RPForms.forms.getForm('allowlist');
        const questions = form ? form.questions : [];

        const staffChannelId = form?.review?.channelId || RPForms.config.getAll().channels.staffReviewChannel || (RPForms.config.getAll().channels as any).applicationCategory;
        
        await ApplicationModel.updateStatus(appId, 'review', staffChannelId);

        RPForms.events.emit('applicationSubmit', { appId, applicantId });

        const history = await ApplicationModel.getApplicationHistory(applicantId);
        const historyInfo = {
            total: history.length,
            approved: history.filter(h => h.status === 'approved').length,
            rejected: history.filter(h => h.status === 'rejected').length
        };

        return {
            ui: ReviewUIBuilder.buildStaffReviewEmbed(applicantStr, applicantId, appId, questions, answers, historyInfo),
            staffChannelId
        };
    }
}
