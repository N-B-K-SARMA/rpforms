"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const RPForms_1 = require("../core/RPForms");
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('allowlist-panel')
        .setDescription('Create the allowlist application panel')
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        RPForms_1.RPForms.forms.reload();
        const form = RPForms_1.RPForms.forms.getForm('allowlist');
        if (!form) {
            return interaction.reply({ content: 'Error: Form "allowlist" not found in config/forms', ephemeral: true });
        }
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle(form.metadata.title)
            .setDescription(form.metadata.description)
            .setColor(RPForms_1.RPForms.config.getAll().embeds.colors.primary)
            .setImage(RPForms_1.RPForms.config.getAll().embeds.banner)
            .setThumbnail(RPForms_1.RPForms.config.getAll().embeds.logo)
            .setFooter({ text: RPForms_1.RPForms.config.getAll().embeds.footer.text, iconURL: RPForms_1.RPForms.config.getAll().embeds.footer.iconURL });
        const buttonStyle = form.button.style.toLowerCase() === 'success' ? discord_js_1.ButtonStyle.Success
            : form.button.style.toLowerCase() === 'danger' ? discord_js_1.ButtonStyle.Danger
                : form.button.style.toLowerCase() === 'secondary' ? discord_js_1.ButtonStyle.Secondary
                    : discord_js_1.ButtonStyle.Primary;
        const button = new discord_js_1.ButtonBuilder()
            .setCustomId('apply_start')
            .setLabel(form.button.label)
            .setStyle(buttonStyle);
        const row = new discord_js_1.ActionRowBuilder().addComponents(button);
        await interaction.reply({ content: 'Panel created successfully!', ephemeral: true });
        await interaction.channel.send({ embeds: [embed], components: [row] });
    },
};
