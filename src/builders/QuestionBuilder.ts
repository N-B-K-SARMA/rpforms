import { TextInputBuilder, TextInputStyle } from 'discord.js';
export class QuestionBuilder extends TextInputBuilder {
    constructor() { super(); this.setStyle(TextInputStyle.Paragraph); }
}