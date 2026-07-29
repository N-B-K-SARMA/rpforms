import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import QuestionService from './QuestionService';
import ApplicationModel from '../models/Application';
import AnswerModel from '../models/Answer';
import UserModel from '../models/User';
import config from '../config/config';

class ApplicationService {
  // Generate the progress bar
  static getProgressBar(current, total) {
    const length = 10;
    const progress = Math.round((current / total) * length);
    const emptyProgress = length - progress;
    return '█'.repeat(progress) + '░'.repeat(emptyProgress);
  }

  // Start application
  static async startApplication(interaction) {
    const userId = interaction.user.id;

    await UserModel.ensureUser(userId);
    const user = await UserModel.getUser(userId);

    if (user.cooldown_until && new Date(user.cooldown_until) > new Date()) {
      return interaction.reply({
        content: `You are on cooldown until <t:${Math.floor(new Date(user.cooldown_until).getTime() / 1000)}:R>.`,
        ephemeral: true,
      });
    }

    // Check if user already has the allowlisted role
    const member = interaction.member;
    if (config.roles.allowlisted && member.roles.cache.has(config.roles.allowlisted)) {
      return interaction.reply({ content: 'You are already allowlisted!', ephemeral: true });
    }

    let app = await ApplicationModel.getActiveApplication(userId);

    if (!app) {
      const appId = await ApplicationModel.createApplication(userId);
      app = await ApplicationModel.getApplicationById(appId);
    }

    const embed = new EmbedBuilder()
      .setTitle('Application Process Started')
      .setDescription(
        'You will be presented with several questions.\n\nPlease provide detailed answers.',
      )
      .setColor(config.embeds.colors.primary as any);

    const row = new ActionRowBuilder<any>().addComponents(
      new ButtonBuilder()
        .setCustomId(`app_continue_${app.id}_0`) // index 0 means question index 0
        .setLabel('Continue')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`app_cancel_${app.id}`)
        .setLabel('Cancel Application')
        .setStyle(ButtonStyle.Danger),
    );

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }

  // Show a specific question
  static async showQuestion(interaction, appId, qIndex) {
    const questions = QuestionService.getQuestions();
    if (qIndex >= questions.length) {
      return this.showFinalReview(interaction, appId);
    }

    const question = questions[qIndex];
    const answer = await AnswerModel.getAnswer(appId, question.id);

    const embed = new EmbedBuilder()
      .setTitle(`Question ${qIndex + 1} / ${questions.length}`)
      .setDescription(
        `**${question.question}**\n\n${this.getProgressBar(qIndex + 1, questions.length)}\n\nYour Answer:\n${answer ? answer.answer_text : '*(No answer provided yet)*'}`,
      )
      .setColor(config.embeds.colors.primary as any);

    const row = new ActionRowBuilder<any>().addComponents(
      new ButtonBuilder()
        .setCustomId(`app_prev_${appId}_${qIndex}`)
        .setLabel('⬅ Previous')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(qIndex === 0),
      new ButtonBuilder()
        .setCustomId(`app_answer_${appId}_${qIndex}`)
        .setLabel(answer ? '✏️ Edit Answer' : '📝 Submit Answer')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`app_next_${appId}_${qIndex}`)
        .setLabel('➡ Next')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(!answer), // Must answer to go next
      new ButtonBuilder()
        .setCustomId(`app_cancel_${appId}`)
        .setLabel('❌ Cancel')
        .setStyle(ButtonStyle.Danger),
    );

    await interaction.update({ embeds: [embed], components: [row] });
  }

  // Show answer modal
  static async showAnswerModal(interaction, appId, qIndex) {
    const questions = QuestionService.getQuestions();
    const question = questions[qIndex];
    const answer = await AnswerModel.getAnswer(appId, question.id);

    const modal = new ModalBuilder()
      .setCustomId(`modal_answer_${appId}_${qIndex}`)
      .setTitle(`Question ${qIndex + 1}`);

    const answerInput = new TextInputBuilder()
      .setCustomId('answerText')
      .setLabel('Your Answer')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(question.required !== false)
      .setValue(answer ? answer.answer_text : '');

    const actionRow = new ActionRowBuilder<any>().addComponents(answerInput);
    modal.addComponents(actionRow);

    await interaction.showModal(modal);
  }

  // Show final review
  static async showFinalReview(interaction, appId) {
    const questions = QuestionService.getQuestions();
    const answers = await AnswerModel.getAnswers(appId);

    const embed = new EmbedBuilder()
      .setTitle('Final Review')
      .setDescription('Please review your answers before submitting.')
      .setColor(config.embeds.colors.primary as any);

    for (const q of questions) {
      const a = (answers as any[]).find((ans) => ans.question_id === q.id);
      let displayAnswer = a ? a.answer_text : 'No answer';
      if (displayAnswer.length > 1024) displayAnswer = displayAnswer.substring(0, 1020) + '...';
      embed.addFields({ name: q.question, value: displayAnswer });
    }

    const row = new ActionRowBuilder<any>().addComponents(
      new ButtonBuilder()
        .setCustomId(`app_edit_${appId}`)
        .setLabel('Edit Answers')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`app_submit_${appId}`)
        .setLabel('Submit Application')
        .setStyle(ButtonStyle.Success),
    );

    await interaction.update({ embeds: [embed], components: [row] });
  }
}

export default ApplicationService;
