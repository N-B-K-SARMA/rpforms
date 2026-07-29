"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewUIBuilder = void 0;
const discord_js_1 = require("discord.js");
const RPForms_1 = require("../core/RPForms");
class ReviewUIBuilder {
    static buildStaffReviewEmbed(applicantStr, applicantId, appId, questions, answers) {
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('New Application Review')
            .addFields({ name: 'Discord User', value: `${applicantStr} (${applicantId})`, inline: true }, { name: 'Application ID', value: `${appId}`, inline: true }, { name: 'Status', value: '🟡 Review', inline: true })
            .setColor(RPForms_1.RPForms.config.getAll().embeds.colors.warning)
            .setTimestamp();
        for (const q of questions) {
            const a = answers.find((ans) => String(ans.question_id) === String(q.id));
            let displayAnswer = a ? a.answer_text : 'No answer';
            if (displayAnswer.length > 1024)
                displayAnswer = displayAnswer.substring(0, 1020) + '...';
            embed.addFields({ name: q.question, value: displayAnswer });
        }
        const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId(`staff_approve_${appId}`)
            .setLabel('✅ Approve')
            .setStyle(discord_js_1.ButtonStyle.Success), new discord_js_1.ButtonBuilder()
            .setCustomId(`staff_reject_${appId}`)
            .setLabel('❌ Reject')
            .setStyle(discord_js_1.ButtonStyle.Danger), new discord_js_1.ButtonBuilder()
            .setCustomId(`staff_review_${appId}`)
            .setLabel('🟡 Review')
            .setStyle(discord_js_1.ButtonStyle.Secondary));
        return { embeds: [embed], components: [row] };
    }
}
exports.ReviewUIBuilder = ReviewUIBuilder;
