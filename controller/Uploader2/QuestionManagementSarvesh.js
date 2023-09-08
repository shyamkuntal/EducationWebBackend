const services = require("../../services/index");
const httpStatus = require("http-status");
const CONSTANTS = require("../../constants/constants");
const db = require("../../config/database");
const {
  createQuestionsSchema,
  createFillDropDownQuestionOptionsSchema,
  addFillDropDownQuestionOptionsSchema,
  deleteFillDropDownQuestionOptionsSchema,
  getFillDropDownQuestionOptionsSchema,
  deleteFillDropDownQuestionSchema,
} = require("../../validations/QuestionManagementValidation");
const { FillDropDownOption } = require("../../models/FillDropDownOption");
const { Question } = require("../../models/Question");
const { ApiError } = require("../../middlewares/apiError");

const QuestionManagementSarveshController = {
  async createFillDropDown(req, res, next) {
    const t = await db.transaction();
    try {
      const { dropDownOptions, ...rest } = req.body;

      let questionValues = await createQuestionsSchema.validateAsync({
        ...rest,
        questionType: CONSTANTS.questionType.Fill_Dropdown,
      });

      let fillDropDownValues = await createFillDropDownQuestionOptionsSchema.validateAsync(
        dropDownOptions
      );

      if (questionValues.isQuestionSubPart === true && !questionValues.parentQuestionId) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Please give parentQuestionId!");
      }

      let question = await services.questionService.createQuestion(questionValues, {
        raw: true,
        transaction: t,
      });

      let newQuestionData = question.dataValues;

      if (fillDropDownValues.length > 10) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Only 10 options can be added!");
      }

      for (let i = 0; i < fillDropDownValues.length; i++) {
        await FillDropDownOption.create(
          {
            option: fillDropDownValues[i].option,
            isCorrectOption: fillDropDownValues[i].isCorrectOption,
            questionId: newQuestionData.id,
          },
          { transaction: t }
        );
      }
      await t.commit();
      res
        .status(httpStatus.OK)
        .send({ message: "FillDropDown options & New Question added!", newQuestionData });
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },

  async addFillDropDownOptions(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await addFillDropDownQuestionOptionsSchema.validateAsync(req.body);

      await services.questionService.checkFillDropDownOptions(values.questionId);

      let = dataToBeAdded = values.optionsToBeAdded;

      for (let i = 0; i < dataToBeAdded.length; i++) {
        await FillDropDownOption.create(
          {
            option: dataToBeAdded[i].option,
            isCorrectOption: dataToBeAdded[i].isCorrectOption,
            questionId: values.questionId,
          },
          { transaction: t }
        );
      }

      await t.commit();

      res.status(httpStatus.OK).send({ message: "New dropDown Options added!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },

  async deleteFillDropDownOption(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await deleteFillDropDownQuestionOptionsSchema.validateAsync({
        optionId: req.query.optionId,
      });
      await FillDropDownOption.destroy({ where: { id: values.optionId } });

      await t.commit();

      res.status(httpStatus.OK).send({ message: "option deleted!" });
    } catch (err) {
      next(err);
    }
  },

  async editFillDropDownOption(req, res, next) {
    try {
    } catch (err) {}
  },
  async getfillDropDownOptions(req, res, next) {
    try {
      let values = await getFillDropDownQuestionOptionsSchema.validateAsync({
        questionId: req.query.questionId,
      });

      console.log(values);

      let questionDetails = await services.questionService.getQuestionsDetailsById(
        values.questionId
      );

      let fillDropDownOptions = await FillDropDownOption.findAll({
        where: { questionId: values.questionId },
        attributes: ["id", "option", "isCorrectOption"],
        raw: true,
      });
      res.status(httpStatus.OK).send({ questionDetails, options: fillDropDownOptions });
    } catch (err) {
      next(err);
    }
  },
  async deleteFillDropDownQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await deleteFillDropDownQuestionSchema.validateAsync({
        questionId: req.query.questionId,
      });

      console.log(values);

      await FillDropDownOption.destroy({ where: { questionId: values.questionId } });

      await Question.destroy({ where: { id: values.questionId } });

      await t.commit();

      res.status(httpStatus.OK).send({ message: "FillDropDown Option & Question deleted!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },

  async createFillTextQuestion(req, res, next) {
    try {
      let values = await createQuestionsSchema.validateAsync(req.body);

      console.log(values);

      
    } catch (err) {
      next(err);
    }
  },
};

module.exports = QuestionManagementSarveshController;
