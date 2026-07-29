import fs from 'fs';
import path from 'path';

class QuestionService {
  questions: any;
  filePath: any;

  constructor() {
    this.questions = [];
    this.filePath = path.join(__dirname, '..', 'config', 'questions.json');
    this.loadQuestions();
  }

  loadQuestions() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      this.questions = JSON.parse(data);
    } catch (error) {
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
export default new QuestionService();
