"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormManager = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class FormManager {
    forms = new Map();
    validationErrors = new Map();
    constructor() {
        this.loadForms();
    }
    loadForms() {
        this.forms.clear();
        this.validationErrors.clear();
        const formsDir = path_1.default.join(__dirname, '..', '..', 'config', 'forms');
        if (fs_1.default.existsSync(formsDir)) {
            const files = fs_1.default.readdirSync(formsDir).filter(f => f.endsWith('.json'));
            for (const file of files) {
                try {
                    const data = JSON.parse(fs_1.default.readFileSync(path_1.default.join(formsDir, file), 'utf8'));
                    const errors = this.validate(data);
                    if (errors.length === 0) {
                        this.forms.set(data.metadata.id, data);
                        console.log(`[FormManager] Loaded valid form: ${data.metadata.id}`);
                    }
                    else {
                        this.validationErrors.set(file, errors);
                        console.error(`[FormManager] Invalid form schema in ${file}:`);
                        errors.forEach(e => console.error(`  - ${e}`));
                    }
                }
                catch (e) {
                    this.validationErrors.set(file, [`JSON Parse Error: ${e.message}`]);
                    console.error(`[FormManager] Failed to load form ${file}:`, e.message);
                }
            }
        }
        else {
            console.warn(`[FormManager] Forms directory not found: ${formsDir}`);
        }
    }
    validate(data) {
        const errors = [];
        if (!data || typeof data !== 'object') {
            errors.push('Root must be an object.');
            return errors;
        }
        // Metadata
        if (!data.metadata || typeof data.metadata !== 'object') {
            errors.push('Missing or invalid "metadata" object.');
        }
        else {
            if (typeof data.metadata.id !== 'string')
                errors.push('metadata.id must be a string.');
            if (typeof data.metadata.title !== 'string')
                errors.push('metadata.title must be a string.');
            if (typeof data.metadata.description !== 'string')
                errors.push('metadata.description must be a string.');
            if (typeof data.metadata.version !== 'string') {
                errors.push('metadata.version must be a string.');
            }
            else if (!data.metadata.version.startsWith('1.')) {
                errors.push(`[Warning] Outdated schema version: ${data.metadata.version}. Expected 1.x.x`);
            }
        }
        // Button
        if (!data.button || typeof data.button !== 'object') {
            errors.push('Missing or invalid "button" object.');
        }
        else {
            if (typeof data.button.label !== 'string')
                errors.push('button.label must be a string.');
            const validStyles = ['Primary', 'Secondary', 'Success', 'Danger'];
            if (!validStyles.includes(data.button.style))
                errors.push(`button.style must be one of: ${validStyles.join(', ')}.`);
        }
        // Review
        if (!data.review || typeof data.review !== 'object') {
            errors.push('Missing or invalid "review" object.');
        }
        else {
            if (typeof data.review.channelId !== 'string')
                errors.push('review.channelId must be a string.');
            if (!Array.isArray(data.review.reviewerRoles))
                errors.push('review.reviewerRoles must be an array of strings.');
        }
        // Actions
        if (!data.actions || typeof data.actions !== 'object') {
            errors.push('Missing or invalid "actions" object.');
        }
        else {
            if (!data.actions.onApprove || typeof data.actions.onApprove !== 'object') {
                errors.push('Missing or invalid "actions.onApprove" object.');
            }
            if (!data.actions.onReject || typeof data.actions.onReject !== 'object') {
                errors.push('Missing or invalid "actions.onReject" object.');
            }
        }
        // Questions
        if (!Array.isArray(data.questions)) {
            errors.push('Missing or invalid "questions" array.');
        }
        else {
            data.questions.forEach((q, i) => {
                if (typeof q.id !== 'number')
                    errors.push(`questions[${i}].id must be a number.`);
                if (!['text', 'paragraph'].includes(q.type))
                    errors.push(`questions[${i}].type must be "text" or "paragraph".`);
                if (typeof q.label !== 'string')
                    errors.push(`questions[${i}].label must be a string.`);
                if (typeof q.question !== 'string')
                    errors.push(`questions[${i}].question must be a string.`);
                if (typeof q.required !== 'boolean')
                    errors.push(`questions[${i}].required must be a boolean.`);
            });
        }
        // Runtime
        if (!data.runtime || typeof data.runtime !== 'object') {
            errors.push('Missing or invalid "runtime" object.');
        }
        else {
            if (typeof data.runtime.enabled !== 'boolean')
                errors.push('runtime.enabled must be a boolean.');
            if (data.runtime.resumeApplications !== undefined && typeof data.runtime.resumeApplications !== 'boolean')
                errors.push('runtime.resumeApplications must be a boolean.');
            if (data.runtime.timeoutMinutes !== undefined && typeof data.runtime.timeoutMinutes !== 'number')
                errors.push('runtime.timeoutMinutes must be a number.');
        }
        return errors;
    }
    getForm(id) {
        return this.forms.get(id);
    }
    getForms() {
        return Array.from(this.forms.values());
    }
    getValidationErrors() {
        return this.validationErrors;
    }
    reload() {
        this.loadForms();
    }
}
exports.FormManager = FormManager;
