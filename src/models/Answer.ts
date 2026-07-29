import { getPool } from '../database/pool';

class AnswerModel {
  static async saveAnswer(applicationId, questionId, answerText) {
    const pool = getPool();
    await pool.query(
      `INSERT INTO application_answers (application_id, question_id, answer_text) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE answer_text = VALUES(answer_text)`,
      [applicationId, questionId, answerText],
    );
  }

  static async getAnswers(applicationId) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM application_answers WHERE application_id = ? ORDER BY question_id ASC',
      [applicationId],
    );
    return rows;
  }

  static async getAnswer(applicationId, questionId) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM application_answers WHERE application_id = ? AND question_id = ?',
      [applicationId, questionId],
    );
    return rows[0];
  }
}

export default AnswerModel;
