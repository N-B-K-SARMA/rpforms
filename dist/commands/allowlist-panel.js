"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const config_1 = __importDefault(require("../config/config"));
const QuestionService_1 = __importDefault(require("../services/QuestionService"));
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('allowlist-panel')
        .setDescription('Create the allowlist application panel')
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        // Reload questions when panel is posted
        QuestionService_1.default.reload();
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle("👑 DADDY'S ROLEPLAY\n\nALLOWLIST MANAGER")
            .setDescription("Welcome to Daddy's Roleplay.\n\nBefore applying, please read all server rules carefully.\n\nYour application will be reviewed by our Staff Team.\n\nPlease answer every question honestly and with detailed responses.\n\nFalse information may result in rejection.")
            .setColor(config_1.default.embeds.colors.primary)
            .setImage(config_1.default.embeds.banner)
            .setThumbnail(config_1.default.embeds.logo)
            .setFooter({ text: config_1.default.embeds.footer.text, iconURL: config_1.default.embeds.footer.iconURL });
        const button = new discord_js_1.ButtonBuilder()
            .setCustomId('apply_start')
            .setLabel('📩 Apply for Allowlist')
            .setStyle(discord_js_1.ButtonStyle.Primary);
        const row = new discord_js_1.ActionRowBuilder().addComponents(button);
        await interaction.reply({ content: 'Panel created successfully!', ephemeral: true });
        await interaction.channel.send({ embeds: [embed], components: [row] });
    },
};
