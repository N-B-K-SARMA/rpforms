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
    constructor() {
        this.loadForms();
    }
    loadForms() {
        this.forms.clear();
        const formsDir = path_1.default.join(__dirname, '..', '..', 'config', 'forms');
        if (fs_1.default.existsSync(formsDir)) {
            const files = fs_1.default.readdirSync(formsDir).filter(f => f.endsWith('.json'));
            for (const file of files) {
                try {
                    const data = JSON.parse(fs_1.default.readFileSync(path_1.default.join(formsDir, file), 'utf8'));
                    if (this.validate(data)) {
                        this.forms.set(data.id, data);
                    }
                    else {
                        console.error(`Invalid form schema in ${file}`);
                    }
                }
                catch (e) {
                    console.error(`Failed to load form ${file}:`, e);
                }
            }
        }
        else {
            console.warn(`Forms directory not found: ${formsDir}`);
        }
    }
    validate(data) {
        if (!data || typeof data !== 'object')
            return false;
        if (typeof data.id !== 'string')
            return false;
        if (typeof data.title !== 'string')
            return false;
        if (!Array.isArray(data.questions))
            return false;
        for (const q of data.questions) {
            if (!q.id || typeof q.question !== 'string')
                return false;
        }
        return true;
    }
    getForm(id) {
        return this.forms.get(id);
    }
    getForms() {
        return Array.from(this.forms.values());
    }
    reload() {
        this.loadForms();
        console.log(`Reloaded ${this.forms.size} forms.`);
    }
}
exports.FormManager = FormManager;
