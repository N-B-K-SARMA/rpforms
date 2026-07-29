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
    loadForms() {
        const formsDir = path_1.default.join(__dirname, '..', '..', 'config', 'forms');
        if (fs_1.default.existsSync(formsDir)) {
            const files = fs_1.default.readdirSync(formsDir).filter(f => f.endsWith('.json'));
            for (const file of files) {
                const data = JSON.parse(fs_1.default.readFileSync(path_1.default.join(formsDir, file), 'utf8'));
                this.forms.set(data.id, data);
            }
        }
    }
    getForm(id) { return this.forms.get(id); }
}
exports.FormManager = FormManager;
n;
