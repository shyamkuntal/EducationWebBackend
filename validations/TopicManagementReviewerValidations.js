const Joi = require("joi");
const CONSTANTS = require("../constants/constants");

const updateInprogressTaskStatusSchema = Joi.object({
  topicTaskId: Joi.string().guid().required(),
  reviewerId: Joi.string().guid().required(),
});

const updateCompleteTaskStatusSchema = Joi.object({
  topicTaskId: Joi.string().guid().required(),
  reviewerId: Joi.string().guid().required(),
});

const addErrorReportToTopicTaskSchema = Joi.object({
  topicTaskId: Joi.string().guid().required(),
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

const addErrorsToTopicsSchema = Joi.object({
  topicId: Joi.string().guid().required(),
  topicTaskId: Joi.string().guid().required(),
  isError: Joi.boolean().required(),
  errorReport: Joi.string().max(225).required().allow(null),
});

const addErrorsToSubTopicsSchema = Joi.object({
  subTopicId: Joi.string().guid().required(),
  topicId: Joi.string().guid().required(),
  topicTaskId: Joi.string().guid().required(),
  isError: Joi.boolean().required(),
  errorReport: Joi.string().max(225).required().allow(null),
});

const addErrorsToVocabularySchema = Joi.object({
  vocabularyId: Joi.string().guid().required(),
  topicId: Joi.string().guid().required(),
  topicTaskId: Joi.string().guid().required(),
  isError: Joi.boolean().required(),
  errorReport: Joi.string().max(225).required().allow(null),
});

const submitTaskToSupervisorSchema = Joi.object({
  topicTaskId: Joi.string().guid().required(),
  reviewerId: Joi.string().guid().required(),
});

const addRecheckCommentSchema = Joi.object({
  topicTaskId: Joi.string().guid().required(),
  reviewerId: Joi.string().guid().required(),
  recheckComment: Joi.string().max(225).required(),
});

const getErrorReportFilesSchema = Joi.object({
  topicTaskId: Joi.string().guid().required(),
});

const getRecheckingCommentsSchema = Joi.object({
  topicTaskId: Joi.string().guid().required(),
});

module.exports = {
  addErrorReportToTopicTaskSchema,
  addErrorsToTopicsSchema,
  addErrorsToSubTopicsSchema,
  addErrorsToVocabularySchema,
  updateInprogressTaskStatusSchema,
  updateCompleteTaskStatusSchema,
  submitTaskToSupervisorSchema,
  addRecheckCommentSchema,
  getErrorReportFilesSchema,
  getRecheckingCommentsSchema,
};
