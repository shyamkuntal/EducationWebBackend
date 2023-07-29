const Joi = require("joi");
const CONSTANTS = require("../constants/constants");

const createTopicTaskSchema = Joi.object({
  boardId: Joi.string().guid().required(),
  subBoardId: Joi.string().guid().required(),
  grade: Joi.string().max(225).required(),
  subjectId: Joi.string().guid(),
  resources: Joi.string(),
  description: Joi.string(),
  supervisorId: Joi.string().guid(),
});

const createTopicSchema = Joi.object({
  topicTaskId: Joi.string().guid(),
  name: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())),
});

const createSubTopicSchema = Joi.object({
  topicTaskId: Joi.string().guid(),
  topicId: Joi.string().guid(),
  name: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())),
});

const createVocabularySchema = Joi.object({
  topicTaskId: Joi.string().guid(),
  topicId: Joi.string().guid(),
  name: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())),
});

const updateTopicTaskSchema = Joi.object({
  topicTaskId: Joi.string().guid().required(),
  boardId: Joi.string().guid().required(),
  subBoardId: Joi.string().guid().required(),
  grade: Joi.string().max(225).required(),
  subjectId: Joi.string().guid(),
  resources: Joi.string(),
  description: Joi.string(),
  supervisorId: Joi.string().guid(),
});

const assignTaskToDataGeneratorSchema = Joi.object({
  topicTaskId: Joi.string().guid().required(),
  dataGeneratorId: Joi.string().guid().required(),
  supervisorComments: Joi.string().max(225),
});

const assignTaskToReviewerSchema = Joi.object({
  topicTaskId: Joi.string().guid().required(),
  reviewerId: Joi.string().guid().required(),
  supervisorComments: Joi.string().max(225),
});

const getTopicSubTopicVocabByTaskIdSchema = Joi.object({
  topicTaskId: Joi.string().guid().required(),
});
const getSubTopicVocabByTopicIdSchema = Joi.object({
  topicId: Joi.string().guid().required(),
});

const getAllTopicSubTopicVocabSchema = Joi.object({
  boardId: Joi.string().guid().allow("").allow(null),
  subBoardId: Joi.string().guid().allow("").allow(null),
  grade: Joi.string().allow("").allow(null),
});

const getTopicTaskLogsSchema = Joi.object({
  topicTaskId: Joi.string().guid().required(),
});

const togglePublishTopicTaskSchema = Joi.object({
  topicTaskId: Joi.string().guid().required(),
});

module.exports = {
  createTopicTaskSchema,
  updateTopicTaskSchema,
  assignTaskToDataGeneratorSchema,
  assignTaskToReviewerSchema,
  createTopicSchema,
  createSubTopicSchema,
  createVocabularySchema,
  getTopicSubTopicVocabByTaskIdSchema,
  getAllTopicSubTopicVocabSchema,
  getTopicTaskLogsSchema,
  getSubTopicVocabByTopicIdSchema,
  togglePublishTopicTaskSchema,
};
