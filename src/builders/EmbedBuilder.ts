import { EmbedBuilder as DiscordEmbedBuilder } from 'discord.js';
import config from '../config/config';
export class EmbedBuilder extends DiscordEmbedBuilder {
    constructor() {
        super();
        this.setColor(config.embeds.colors.primary as any);
        this.setFooter({ text: config.embeds.footer.text, iconURL: config.embeds.footer.iconURL });
    }
}