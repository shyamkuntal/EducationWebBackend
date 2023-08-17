const Joi = require("joi");
const CONSTANTS = require("../constants/constants");

const updateInprogressTaskStatusSchema = Joi.object({
  bookTaskId: Joi.string().guid().required(),
  reviewerId: Joi.string().guid().required(),
});

const updateCompleteTaskStatusSchema = Joi.object({
  bookTaskId: Joi.string().guid().required(),
  reviewerId: Joi.string().guid().required(),
});

const addErrorReportToBookTaskSchema = Joi.object({
  bookTaskId: Joi.string().guid().required(),
  reviewerId: Joi.string().guid().required(),
  comment: Joi.string().max(225).required(),
  errorReport: Joi.string().max(225).required(),
  errorReportFile: Joi.object({
    fieldname: Joi.string(),
    originalname: Joi.string(),
    encoding: Joi.string(),
    mimetype: Joi.string(),
    buffer: Joi.any(),
    size: Joi.number(),
  }),
});

const addErrorsToBooksSchema = Joi.object({
  bookId: Joi.string().guid().required(),
  bookTaskId: Joi.string().guid().required(),
  isError: Joi.boolean().required(),
  errorReport: Joi.string().max(225).required().allow(null).allow(""),
});

const addErrorsToChaptersSchema = Joi.object({
  chaptersErrors: Joi.array().items(
    Joi.object({
      chapterId: Joi.string().guid().required(),
      bookId: Joi.string().guid().required(),
      bookTaskId: Joi.string().guid().required(),
      isError: Joi.boolean().required(),
      errorReport: Joi.string().max(225).required().allow(null).allow(""),
    })
  ),
});

const addErrorsToVocabularySchema = Joi.object({
  vocabularyErrors: Joi.array().items(
    Joi.object({
      vocabularyId: Joi.string().guid().required(),
      topicId: Joi.string().guid().required(),
      bookTaskId: Joi.string().guid().required(),
      isError: Joi.boolean().required(),
      errorReport: Joi.string().max(225).required().allow(null).allow(""),
    })
  ),
});

const submitTaskToSupervisorSchema = Joi.object({
  bookTaskId: Joi.string().guid().required(),
  reviewerId: Joi.string().guid().required(),
});

const addRecheckCommentSchema = Joi.object({
  bookTaskId: Joi.string().guid().required(),
  reviewerId: Joi.string().guid().required(),
  recheckComment: Joi.string().max(225).required(),
});

const getErrorReportFilesSchema = Joi.object({
  bookTaskId: Joi.string().guid().required(),
});

const getRecheckingCommentsSchema = Joi.object({
  bookTaskId: Joi.string().guid().required(),
});

module.exports = {
  addErrorReportToBookTaskSchema,
  addErrorsToBooksSchema,
  addErrorsToChaptersSchema,
  addErrorsToVocabularySchema,
  updateInprogressTaskStatusSchema,
  updateCompleteTaskStatusSchema,
  submitTaskToSupervisorSchema,
  addRecheckCommentSchema,
  getErrorReportFilesSchema,
  getRecheckingCommentsSchema,
};
