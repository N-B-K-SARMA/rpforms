import fs from 'fs';
import path from 'path';
import { IForm } from '../interfaces/IForm';

export class FormManager {
    private forms: Map<string, IForm> = new Map();
    private validationErrors: Map<string, string[]> = new Map();

    constructor() {
        this.loadForms();
    }

    public loadForms(): void {
        const tempForms: Map<string, IForm> = new Map();
        const tempValidationErrors: Map<string, string[]> = new Map();
        
        const formsDir = path.join(__dirname, '..', '..', 'config', 'forms');
        if (fs.existsSync(formsDir)) {
            const files = fs.readdirSync(formsDir).filter(f => f.endsWith('.json'));
            for (const file of files) {
                try {
                    const data = JSON.parse(fs.readFileSync(path.join(formsDir, file), 'utf8'));
                    const errors = this.validate(data);
                    if (errors.length === 0) {
                        if (tempForms.has(data.metadata.id)) {
                            tempValidationErrors.set(file, [`Duplicate form ID: ${data.metadata.id}`]);
                        } else {
                            tempForms.set(data.metadata.id, data as IForm);
                            console.log(`[FormManager] Loaded valid form: ${data.metadata.id}`);
                        }
                    } else {
                        tempValidationErrors.set(file, errors);
                        console.error(`[FormManager] Invalid form schema in ${file}:`);
                        errors.forEach(e => console.error(`  - ${e}`));
                    }
                } catch (e: any) {
                    tempValidationErrors.set(file, [`JSON Parse Error: ${e.message}`]);
                    console.error(`[FormManager] Failed to load form ${file}:`, e.message);
                }
            }
        } else {
            console.warn(`[FormManager] Forms directory not found: ${formsDir}`);
        }

        // Atomic swap
        if (tempValidationErrors.size === 0 || tempForms.size > 0) {
            this.forms = tempForms;
        }
        this.validationErrors = tempValidationErrors;
    }

    public validate(data: any): string[] {
        const errors: string[] = [];
        if (!data || typeof data !== 'object') {
            errors.push('Root must be an object.');
            return errors;
        }

        // Metadata
        if (!data.metadata || typeof data.metadata !== 'object') {
            errors.push('Missing or invalid "metadata" object.');
        } else {
            if (typeof data.metadata.id !== 'string') errors.push('metadata.id must be a string.');
            if (typeof data.metadata.title !== 'string') errors.push('metadata.title must be a string.');
            if (typeof data.metadata.description !== 'string') errors.push('metadata.description must be a string.');
            if (typeof data.metadata.version !== 'string') {
                errors.push('metadata.version must be a string.');
            } else if (!data.metadata.version.startsWith('1.')) {
                errors.push(`[Warning] Outdated schema version: ${data.metadata.version}. Expected 1.x.x`);
            }
        }

        // Button
        if (!data.button || typeof data.button !== 'object') {
            errors.push('Missing or invalid "button" object.');
        } else {
            if (typeof data.button.label !== 'string') errors.push('button.label must be a string.');
            const validStyles = ['Primary', 'Secondary', 'Success', 'Danger'];
            if (!validStyles.includes(data.button.style)) errors.push(`button.style must be one of: ${validStyles.join(', ')}.`);
        }

        // Review
        if (!data.review || typeof data.review !== 'object') {
            errors.push('Missing or invalid "review" object.');
        } else {
            if (typeof data.review.channelId !== 'string') errors.push('review.channelId must be a string.');
            if (!Array.isArray(data.review.reviewerRoles)) errors.push('review.reviewerRoles must be an array of strings.');
        }

        // Actions
        if (!data.actions || typeof data.actions !== 'object') {
            errors.push('Missing or invalid "actions" object.');
        } else {
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
        } else {
            data.questions.forEach((q: any, i: number) => {
                if (typeof q.id !== 'number') errors.push(`questions[${i}].id must be a number.`);
                if (!['text', 'paragraph'].includes(q.type)) errors.push(`questions[${i}].type must be "text" or "paragraph".`);
                if (typeof q.label !== 'string') errors.push(`questions[${i}].label must be a string.`);
                if (typeof q.question !== 'string') errors.push(`questions[${i}].question must be a string.`);
                if (typeof q.required !== 'boolean') errors.push(`questions[${i}].required must be a boolean.`);
            });
        }

        // Runtime
        if (!data.runtime || typeof data.runtime !== 'object') {
            errors.push('Missing or invalid "runtime" object.');
        } else {
            if (typeof data.runtime.enabled !== 'boolean') errors.push('runtime.enabled must be a boolean.');
            if (data.runtime.resumeApplications !== undefined && typeof data.runtime.resumeApplications !== 'boolean') errors.push('runtime.resumeApplications must be a boolean.');
            if (data.runtime.timeoutMinutes !== undefined && typeof data.runtime.timeoutMinutes !== 'number') errors.push('runtime.timeoutMinutes must be a number.');
        }

        return errors;
    }

    public getForm(id: string): IForm | undefined {
        return this.forms.get(id);
    }

    public getForms(): IForm[] {
        return Array.from(this.forms.values());
    }

    public getValidationErrors(): Map<string, string[]> {
        return this.validationErrors;
    }

    public reload(): void {
        this.loadForms();
    }
}