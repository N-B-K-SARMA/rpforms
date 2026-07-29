import { RPForms } from '../core/RPForms';
import { IAnswer } from '../interfaces/IDatabaseModels';

class AnswerModel {
  static async saveAnswer(applicationId: number, questionId: string, answerText: string): Promise<void> {
    await RPForms.database.saveAnswer(applicationId, questionId, answerText);
  }

  static async getAnswers(applicationId: number): Promise<IAnswer[]> {
    return await RPForms.database.getAnswers(applicationId);
  }

  static async getAnswer(applicationId: number, questionId: string): Promise<IAnswer | undefined> {
    return await RPForms.database.getAnswer(applicationId, questionId);
  }
}

export default AnswerModel;
