"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RPForms_1 = require("../core/RPForms");
const discord_js_1 = require("discord.js");
const Application_1 = __importDefault(require("../models/Application"));
exports.default = {
    id: 'staffmodal_',
    type: 'modal_prefix',
    async execute(interaction, client) {
        const parts = interaction.customId.split('_');
        const action = parts[1]; // reject, review
        const appId = parseInt(parts[2]);
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
        const reason = interaction.fields.getTextInputValue('reasonText');
        const request = {
            appId,
            action,
            staffId: interaction.user.id,
            reason
        };
        let warningMsg = '';
        if (form && action === 'reject') {
            const logChannelId = form.actions?.onReject?.logChannelId;
            if (logChannelId && !interaction.guild.channels.cache.get(logChannelId)) {
                warningMsg = '⚠️ The application was rejected, but the configured response log channel could not be found. Please check your configuration.';
            }
        }
        const result = await RPForms_1.RPForms.reviews.handleModal(request);
        if (result.success) {
            if (action === 'reject') {
                const originalEmbed = interaction.message.embeds[0];
                const updatedEmbed = discord_js_1.EmbedBuilder.from(originalEmbed);
                updatedEmbed.setColor(RPForms_1.RPForms.config.getAll().embeds.colors.danger);
                if (updatedEmbed.data.description) {
                    updatedEmbed.setDescription(updatedEmbed.data.description.replace(/.*Pending Review.*/, '**Status**\n🔴 Rejected'));
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
            else if (action === 'review') {
                await interaction.reply({ content: 'Review requested sent to user!', ephemeral: true });
            }
        }
    },
};
