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