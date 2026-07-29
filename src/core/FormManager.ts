import fs from 'fs';
import path from 'path';
import { IForm } from '../interfaces/IForm';

export class FormManager {
    private forms: Map<string, IForm> = new Map();

    constructor() {
        this.loadForms();
    }

    public loadForms(): void {
        this.forms.clear();
        const formsDir = path.join(__dirname, '..', '..', 'config', 'forms');
        if (fs.existsSync(formsDir)) {
            const files = fs.readdirSync(formsDir).filter(f => f.endsWith('.json'));
            for (const file of files) {
                try {
                    const data = JSON.parse(fs.readFileSync(path.join(formsDir, file), 'utf8'));
                    if (this.validate(data)) {
                        this.forms.set(data.id, data as IForm);
                    } else {
                        console.error(`Invalid form schema in ${file}`);
                    }
                } catch (e) {
                    console.error(`Failed to load form ${file}:`, e);
                }
            }
        } else {
            console.warn(`Forms directory not found: ${formsDir}`);
        }
    }

    public validate(data: any): boolean {
        if (!data || typeof data !== 'object') return false;
        if (typeof data.id !== 'string') return false;
        if (typeof data.title !== 'string') return false;
        if (!Array.isArray(data.questions)) return false;
        for (const q of data.questions) {
            if (!q.id || typeof q.question !== 'string') return false;
        }
        return true;
    }

    public getForm(id: string): IForm | undefined {
        return this.forms.get(id);
    }

    public getForms(): IForm[] {
        return Array.from(this.forms.values());
    }

    public reload(): void {
        this.loadForms();
        console.log(`Reloaded ${this.forms.size} forms.`);
    }
}