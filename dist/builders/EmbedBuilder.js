"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbedBuilder = void 0;
const discord_js_1 = require("discord.js");
const config_1 = __importDefault(require("../config/config"));
class EmbedBuilder extends discord_js_1.EmbedBuilder {
    constructor() {
        super();
        this.setColor(config_1.default.embeds.colors.primary);
        this.setFooter({ text: config_1.default.embeds.footer.text, iconURL: config_1.default.embeds.footer.iconURL });
    }
}
exports.EmbedBuilder = EmbedBuilder;
n;
