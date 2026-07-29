import ApplicationService from '../services/ApplicationService';
import AnswerModel from '../models/Answer';
import QuestionService from '../services/QuestionService';

export default {
  id: 'modal_answer_',
  type: 'modal_prefix',

  async execute(interaction, client) {
    const parts = interaction.customId.split('_');
    const appId = parseInt(parts[2]);
    const qIndex = parseInt(parts[3]);

    const answerText = interaction.fields.getTextInputValue('answerText');
    const question = QuestionService.getQuestions()[qIndex];

    // Save answer
    await AnswerModel.saveAnswer(appId, question.id, answerText);

    // Update embed to show the answered question
    await ApplicationService.showQuestion(interaction, appId, qIndex);
  },
};
