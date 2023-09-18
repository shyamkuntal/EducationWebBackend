const services = require("../../services/index");
const httpStatus = require("http-status");
const CONSTANTS = require("../../constants/constants");
const db = require("../../config/database");
const { createQuestionsSchema } = require("../../validations/QuestionManagementValidation");
const { MatchQuestion } = require("../../models/MatchQuestionPair");



const QuestionManagementController = {
  async createLongAnswer(req, res, next) {
    const t = await db.transaction();
    try {
      let question = await services.questionService.createQuestion(req.body, {
        transaction: t,
      });
      res.status(httpStatus.OK).send(question);
      await t.commit();
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },

  async MatchQues(req, res, next) {
    const t = await db.transaction();
    try {
      let data = req.body;
      let questionData = {
        questionType: data.questionType,
        questionData: data.questionData,
        sheetId: data.sheetId,
      };

      let createdQuestion = await services.questionService.createQuestion(questionData, {
        transaction: t,
      });


      let options = data.options;
      let questionId = await createdQuestion.id;

      const createdOptions = await Promise.all(
        options.map(async (option) => {
          let contentFileName = null;

          if (option.content) {
            contentFileName = await services.questionService.uploadFile(option.content);
          }

          const createdOption = await MatchQuestion.create(
            {
              questionId,
              matchPhrase: option.matchPhrase,
              distractor: option.distractor,
              matchTarget: option.distractor,
              MatchPhraseContent: option.MatchPhraseContent || null ,
              MatchTargetContent: option.MatchTargetContent || null,
              distractorContent: option.distractorContent || null,
            },
            { transaction: t }
          );

          return createdOption;
        })
      );

      await t.commit();
      res.status(httpStatus.OK).send({
        question: createdQuestion,
        options: createdOptions,
      });
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },

  async createQuestion(req, res, next) {
    try {
        console.log(req.body)
      let values = await createQuestionsSchema.validateAsync(req.body);

      let question = await services.questionService.createQuestion(values);
      res.status(httpStatus.OK).send(question);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = QuestionManagementController;
