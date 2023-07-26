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
  name: Joi.string(),
});

const createSubTopicSchema = Joi.object({
  topicTaskId: Joi.string().guid(),
  topicId: Joi.string().guid(),
  name: Joi.string(),
});

const createVocabularySchema = Joi.object({
  topicTaskId: Joi.string().guid(),
  topicId: Joi.string().guid(),
  name: Joi.string(),
});

module.exports = { createTopicTaskSchema, createTopicSchema, createSubTopicSchema, createVocabularySchema };
