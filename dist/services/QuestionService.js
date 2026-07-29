"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class QuestionService {
    questions;
    filePath;
    constructor() {
        this.questions = [];
        this.filePath = path_1.default.join(__dirname, '..', 'config', 'questions.json');
        this.loadQuestions();
    }
    loadQuestions() {
        try {
            const data = fs_1.default.readFileSync(this.filePath, 'utf8');
            this.questions = JSON.parse(data);
        }
        catch (error) {
            console.error('Failed to load questions.json', error);
            this.questions = [];
        }
    }
    reload() {
        this.loadQuestions();
    }
    getQuestions() {
        return this.questions;
    }
    getQuestionById(id) {
        return this.questions.find((q) => q.id === id);
    }
    getTotalQuestions() {
        return this.questions.length;
    }
}
// Export as singleton
exports.default = new QuestionService();
