import { RPForms } from './RPForms';
import ApplicationModel from '../models/Application';
import UserModel from '../models/User';
import AnswerModel from '../models/Answer';
import { StaffActionRequest } from '../dto/ApplicationDTO';
import { ReviewUIBuilder } from '../builders/ReviewUIBuilder';
import { ModalUIBuilder } from '../builders/ModalUIBuilder';

export class ReviewManager {
    async processAction(request: StaffActionRequest) {
        const { appId, action } = request;

        if (action === 'approve') {
            await ApplicationModel.updateStatus(appId, 'approved');
            RPForms.events.emit('applicationApprove', request);
            return { success: true };
        } else if (action === 'reject') {
            return { modal: ModalUIBuilder.buildReasonModal(appId, 'reject') };
        } else if (action === 'review') {
            return { modal: ModalUIBuilder.buildReasonModal(appId, 'review') };
        }

        return { error: 'Invalid action' };
    }
    
    async handleModal(request: StaffActionRequest) {
        const { appId, action, reason } = request;
        
        if (action === 'reject') {
            await ApplicationModel.updateStatus(appId, 'rejected');
            
            const app = await ApplicationModel.getApplicationById(appId);
            if (app) {
                const cooldownMs = RPForms.config.getAll().settings.cooldown || 86400000;
                const cooldownUntil = new Date(Date.now() + cooldownMs);
                await UserModel.setCooldown(app.discord_id, cooldownUntil);
            }

            RPForms.events.emit('applicationReject', request);
            return { success: true };
        } else if (action === 'review') {
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

        const staffChannelId = RPForms.config.getAll().channels.staffReviewChannel || (RPForms.config.getAll().channels as any).applicationCategory;
        
        await ApplicationModel.updateStatus(appId, 'review', staffChannelId);

        RPForms.events.emit('applicationSubmit', { appId, applicantId });

        return {
            ui: ReviewUIBuilder.buildStaffReviewEmbed(applicantStr, applicantId, appId, questions, answers),
            staffChannelId
        };
    }
}
