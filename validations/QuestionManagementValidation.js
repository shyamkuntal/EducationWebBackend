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
  hasSubParts: Joi.boolean(),
  parentQuestionId: Joi.string().guid(),
  isQuestionSubPart: Joi.boolean(),
  includeExplanation: Joi.string(),
  explanation: Joi.string(),
  questionIndentifier: Joi.string(),
  isShuffle: Joi.boolean(),
});

module.exports = { createQuestionsSchema };
