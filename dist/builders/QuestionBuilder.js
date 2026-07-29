"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionBuilder = void 0;
const discord_js_1 = require("discord.js");
class QuestionBuilder extends discord_js_1.TextInputBuilder {
    constructor() { super(); this.setStyle(discord_js_1.TextInputStyle.Paragraph); }
}
exports.QuestionBuilder = QuestionBuilder;
n;
