const services = require("../../services/index");
const httpStatus = require("http-status");
const CONSTANTS = require("../../constants/constants");
const db = require("../../config/database");
const { McqQuestionOption } = require("../../models/McqQuestionOption");

const QuestionManagement = {
  
  async McqQuestion(req, res, next) {
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

          const createdOption = await McqQuestionOption.create(
            {
              questionId,
              option: option.option,
              isCorrectOption: option.isCorrectOption,
              feedback: option.feedback || null,
              content: contentFileName || null,
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

  async McqMultiple(res, req, next) {},
};

module.exports = QuestionManagement;
