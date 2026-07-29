const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src');

const filesToCreate = {
  'interfaces/IForm.ts': `
export interface IFormQuestion {
    id: number;
    question: string;
    required: boolean;
}
export interface IForm {
    id: string;
    title: string;
    description: string;
    button: { label: string; style: string; };
    questions: IFormQuestion[];
    review: { channelId: string; reviewerRoles: string[]; };
    roles: { onApprove: string[]; onRejectRemove: string[]; };
    logging: { approvedChannelId: string; rejectedChannelId: string; };
    cooldown: number;
}
  `,
  'core/EventManager.ts': `
import { EventEmitter } from 'events';
export class EventManager extends EventEmitter {
    constructor() { super(); }
}
  `,
  'core/ConfigManager.ts': `
export class ConfigManager {
    load() {}
}
  `,
  'core/FormManager.ts': `
import fs from 'fs';
import path from 'path';
import { IForm } from '../interfaces/IForm';
export class FormManager {
    public forms: Map<string, IForm> = new Map();
    loadForms() {
        const formsDir = path.join(__dirname, '..', '..', 'config', 'forms');
        if (fs.existsSync(formsDir)) {
            const files = fs.readdirSync(formsDir).filter(f => f.endsWith('.json'));
            for (const file of files) {
                const data = JSON.parse(fs.readFileSync(path.join(formsDir, file), 'utf8'));
                this.forms.set(data.id, data);
            }
        }
    }
    getForm(id: string): IForm | undefined { return this.forms.get(id); }
}
  `,
  'core/ApplicationManager.ts': `
export class ApplicationManager {
    startApplication() {}
}
  `,
  'core/ReviewManager.ts': `
export class ReviewManager {
    approve() {}
    reject() {}
}
  `,
  'core/RPForms.ts': `
import { EventManager } from './EventManager';
import { ConfigManager } from './ConfigManager';
import { FormManager } from './FormManager';
import { ApplicationManager } from './ApplicationManager';
import { ReviewManager } from './ReviewManager';
export class RPFormsClient {
    public events = new EventManager();
    public config = new ConfigManager();
    public forms = new FormManager();
    public applications = new ApplicationManager();
    public reviews = new ReviewManager();
    
    init() {
        this.forms.loadForms();
    }
}
export const RPForms = new RPFormsClient();
  `,
  'database/Database.ts': `
export interface IDatabase {
    connect(): Promise<void>;
    query(sql: string, params?: any[]): Promise<any>;
}
  `,
  'database/MariaDB.ts': `
import { IDatabase } from './Database';
import { getPool } from './pool';
export class MariaDB implements IDatabase {
    async connect() {}
    async query(sql: string, params?: any[]): Promise<any> {
        const pool = getPool();
        return await pool.query(sql, params);
    }
}
  `,
  'builders/EmbedBuilder.ts': `
import { EmbedBuilder as DiscordEmbedBuilder } from 'discord.js';
import config from '../config/config';
export class EmbedBuilder extends DiscordEmbedBuilder {
    constructor() {
        super();
        this.setColor(config.embeds.colors.primary as any);
        this.setFooter({ text: config.embeds.footer.text, iconURL: config.embeds.footer.iconURL });
    }
}
  `,
  'builders/ButtonBuilder.ts': `
import { ButtonBuilder as DiscordButtonBuilder, ButtonStyle } from 'discord.js';
export class ButtonBuilder extends DiscordButtonBuilder {
    constructor() { super(); }
}
  `,
  'builders/ModalBuilder.ts': `
import { ModalBuilder as DiscordModalBuilder } from 'discord.js';
export class ModalBuilder extends DiscordModalBuilder {
    constructor() { super(); }
}
  `,
  'builders/QuestionBuilder.ts': `
import { TextInputBuilder, TextInputStyle } from 'discord.js';
export class QuestionBuilder extends TextInputBuilder {
    constructor() { super(); this.setStyle(TextInputStyle.Paragraph); }
}
  `
};

for (const [relativePath, content] of Object.entries(filesToCreate)) {
    const fullPath = path.join(srcPath, relativePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, content.trim() + '\\n');
    console.log('Created: ' + relativePath);
}
