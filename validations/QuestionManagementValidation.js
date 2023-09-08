const Joi = require("joi");

const createQuestionsSchema = Joi.object({
  sheetId: Joi.string().guid().required(),
  questionType: Joi.string().required(),
  questionData: Joi.string().required(),
  marks: Joi.number(),
  requiredTime: Joi.number(),
  uploaderDescription: Joi.string(),
  videoLink: Joi.string().uri(),
  pageNumber: Joi.number(),
  bookExcercise: Joi.string(),
  exampleNo: Joi.number(),
  bookExcerciseNo: Joi.string(),
  priceForTeacher: Joi.number(),
  priceForStudent: Joi.number(),
  difficultyLevel: Joi.string(),
  levelTagging: Joi.string(),
  commandTerm: Joi.string(),
  errorReportByTeacher: Joi.string(),
  errorReportByReviewer: Joi.string(),
  isPremium: Joi.boolean(),
  isCheckedByPricer: Joi.boolean(),
  isErrorByTeacher: Joi.boolean(),
  isCheckedByReviewer: Joi.boolean(),
  isErrorByReviewer: Joi.boolean(),
  // hasSubParts: Joi.boolean(),
  parentQuestionId: Joi.string().guid(),
  isQuestionSubPart: Joi.boolean().required(),
  includeExplanation: Joi.string(),
  explanation: Joi.string(),
  questionIndentifier: Joi.string(),
  isShuffle: Joi.boolean(),
});

const createFillDropDownQuestionOptionsSchema = Joi.array().items({
  option: Joi.string().max(225).required(),
  isCorrectOption: Joi.boolean().required(),
});

const addFillDropDownQuestionOptionsSchema = Joi.object({
  questionId: Joi.string().guid().required(),
  optionsToBeAdded: Joi.array().items({
    option: Joi.string().max(225).required(),
    isCorrectOption: Joi.boolean().required(),
  }),
});

const deleteFillDropDownQuestionOptionsSchema = Joi.object({
  optionId: Joi.string().guid().required(),
});

const getFillDropDownQuestionOptionsSchema = Joi.object({
  questionId: Joi.string().guid().required(),
});

const deleteFillDropDownQuestionSchema = Joi.object({
  questionId: Joi.string().guid().required(),
});

module.exports = {
  createQuestionsSchema,
  createFillDropDownQuestionOptionsSchema,
  addFillDropDownQuestionOptionsSchema,
  deleteFillDropDownQuestionOptionsSchema,
  getFillDropDownQuestionOptionsSchema,
  deleteFillDropDownQuestionSchema,
};
