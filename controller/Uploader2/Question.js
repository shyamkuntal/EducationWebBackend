const services = require("../../services/index");
const httpStatus = require("http-status");
const CONSTANTS = require("../../constants/constants");
const db = require("../../config/database");
const { McqQuestionOption } = require("../../models/McqQuestionOption");
const { TrueFalseQuestionOption } = require("../../models/TrueFalseQuestionOption");
const { McqSchema } = require("../../validations/QuestionManagementValidation");
const { Question } = require("../../models/Question");

const QuestionManagement = {

  async McqQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      let data = await McqSchema.validateAsync(req.body)

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

  async DeleteMcqQues(req, res, next)  {
    const questionId = req.query.questionId;
  
    const t = await db.transaction();
  
    try {
      const question = await Question.findByPk(questionId);
      if (!question) {
        await t.rollback();
        return res.status(httpStatus.NOT_FOUND).json({ message: 'Question not found' });
      }

      await McqQuestionOption.destroy({
        where: { questionId },
        transaction: t,
      });

      await question.destroy({ transaction: t });
  
      await t.commit();
  
      res.status(httpStatus.OK).send("Question Deleted Successfully");
    } catch (err) {
      console.error(err);
      await t.rollback();
      next(err);
    }
  },

  async DeleteMcqOption (req, res, next) {

    const { questionId, optionId } = req.query;
    console.log(questionId)
    const t = await db.transaction();
  
    try {
      
      const option = await McqQuestionOption.findOne({
        where: { id: optionId, questionId: questionId },
      });
  
      if (!option) {
        await t.rollback();
        return res.status(httpStatus.NOT_FOUND).json({ message: 'Option not found' });
      }
  
      await option.destroy({ transaction: t });
  
      await t.commit();
  
      res.status(httpStatus.OK).send("Option Deleted Successfully");
    } catch (err) {
      console.error(err);
      await t.rollback();
      next(err);
    }
  },

  async TrueFalse(req, res, next) {
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

      let statements = data.statements;
      let questionId = await createdQuestion.id;

      const createdStatements = await Promise.all(
        statements.map(async (statement) => {
          let contentFileName = null;

          if (statement.content) {
            contentFileName = await services.questionService.uploadFile(statement.content);
          }

          const createdOption = await TrueFalseQuestionOption.create(
            {
              questionId,
              statement: statement.statement,
              isCorrectOption: statement.isCorrectOption,
              feedback: statement.feedback || null,
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
        statements: createdStatements,
      });
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },

  async TrueFalseQuesDelete(req, res, next) {
    const questionId = req.query.questionId;
  
    const t = await db.transaction();
  
    try {
      
      const question = await Question.findByPk(questionId);
  
      if (!question) {
        await t.rollback();
        return res.status(httpStatus.NOT_FOUND).json({ message: 'Question not found' });
      }
      await TrueFalseQuestionOption.destroy({
        where: { questionId },
        transaction: t,
      });
      await question.destroy({ transaction: t });
  
      await t.commit();
  
      res.status(httpStatus.NO_CONTENT).send("Question Deleted Successfully");
    } catch (err) {
      console.error(err);
      await t.rollback();
      next(err);
    }
  },

  async DeleteTrueFalseOption (req, res, next) {

    const { questionId, optionId } = req.query;
    
    const t = await db.transaction();
  
    try {
      
      const option = await TrueFalseQuestionOption.findOne({
        where: { id: optionId, questionId: questionId },
      });
  
      if (!option) {
        await t.rollback();
        return res.status(httpStatus.NOT_FOUND).json({ message: 'Option not found' });
      }
  
      await option.destroy({ transaction: t });
  
      await t.commit();
  
      res.status(httpStatus.OK).send("Option Deleted Successfully");
    } catch (err) {
      console.error(err);
      await t.rollback();
      next(err);
    }
  },

  async creatTextQues(req, res, next) {
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

  async createImageQues(req, res, next) {
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

      let files = data.statements;
      let questionId = await createdQuestion.id;

      const createdStatements = await Promise.all(
        files.map(async (statement) => {
          let contentFileName = null;

          if (statement.content) {
            contentFileName = await services.questionService.uploadFile(statement.content);
          }

          const createdOption = await TrueFalseQuestionOption.create(
            {
              questionId,
              statement: statement.statement,
              isCorrectOption: statement.isCorrectOption,
              feedback: statement.feedback || null,
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
        files: createdStatements,
      });
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },
};

module.exports = QuestionManagement;
