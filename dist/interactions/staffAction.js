"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RPForms_1 = require("../core/RPForms");
const discord_js_1 = require("discord.js");
const Application_1 = __importDefault(require("../models/Application"));
exports.default = {
    id: 'staff_',
    type: 'button_prefix',
    async execute(interaction, client) {
        const parts = interaction.customId.split('_');
        const action = parts[1]; // approve, reject, review, close, history
        const appId = parseInt(parts[2]);
        const applicantId = parts[3];
        const app = await Application_1.default.getApplicationById(appId);
        const form = app ? RPForms_1.RPForms.forms.getForm(app.form_id) : null;
        const adminRoles = RPForms_1.RPForms.config.getAll().roles.admin || [];
        const globalStaffRoles = RPForms_1.RPForms.config.getAll().roles.staff || [];
        const formStaffRoles = form?.review?.reviewerRoles || [];
        const allowedRoles = [...adminRoles, ...globalStaffRoles, ...formStaffRoles];
        const hasPermission = allowedRoles.some((roleId) => interaction.member.roles.cache.has(roleId));
        if (!hasPermission) {
            return interaction.reply({ content: 'You do not have permission to review applications.', ephemeral: true });
        }
        const request = {
            appId,
            action,
            applicantId,
            staffId: interaction.user.id
        };
        let warningMsg = '';
        if (form && action === 'approve') {
            const logChannelId = form.actions?.onApprove?.logChannelId;
            if (logChannelId && !interaction.guild.channels.cache.get(logChannelId)) {
                warningMsg = '⚠️ The application was approved, but the configured response log channel could not be found. Please check your configuration.';
            }
        }
        const result = await RPForms_1.RPForms.reviews.processAction(request);
        if (result.modal) {
            await interaction.showModal(result.modal);
        }
        else if (result.ui && action === 'history') {
            await interaction.reply(result.ui);
        }
        else if (result.ui && action === 'close') {
            await interaction.update(result.ui);
        }
        else if (result.success) {
            const originalEmbed = interaction.message.embeds[0];
            const updatedEmbed = discord_js_1.EmbedBuilder.from(originalEmbed);
            if (action === 'approve') {
                updatedEmbed.setColor(RPForms_1.RPForms.config.getAll().embeds.colors.success);
                if (updatedEmbed.data.description) {
                    // Be robust against existing strange characters in the previous status
                    updatedEmbed.setDescription(updatedEmbed.data.description.replace(/.*Pending Review.*/, '**Status**\n🟢 Approved'));
                }
            }
            const newComponents = interaction.message.components.map((row) => {
                return discord_js_1.ActionRowBuilder.from(row).setComponents(row.components.map((c) => {
                    const btn = discord_js_1.ButtonBuilder.from(c);
                    const id = c.customId || '';
                    if (id.includes('staff_approve_') || id.includes('staff_reject_') || id.includes('staff_review_')) {
                        btn.setDisabled(true);
                    }
                    return btn;
                }));
            });
            await interaction.update({ embeds: [updatedEmbed], components: newComponents });
            if (warningMsg) {
                await interaction.followUp({ content: warningMsg, ephemeral: true });
            }
        }
        else if (result.error) {
            await interaction.reply({ content: `Error: ${result.error}`, ephemeral: true });
        }
    },
};
