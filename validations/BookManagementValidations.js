const Joi = require("joi");
const CONSTANTS = require("../constants/constants");

const createBookTaskSchema = Joi.object({
  boardId: Joi.string().guid().required(),
  subBoardId: Joi.string().guid().required(),
  grade: Joi.string().max(225).required(),
  subjectId: Joi.string().guid(),
  resources: Joi.string(),
  description: Joi.string(),
  supervisorId: Joi.string().guid(),
  bookNames: Joi.array().items(Joi.string().max(255)).required(),
});

const updateBookTaskSchema = Joi.object({
  bookTaskId: Joi.string().guid().required(),
  boardId: Joi.string().guid().required(),
  subBoardId: Joi.string().guid().required(),
  grade: Joi.string().max(225).required(),
  subjectId: Joi.string().guid(),
  resources: Joi.string(),
  description: Joi.string(),
  bookNames: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().guid().required(),
        name: Joi.string().max(255).required(),
      })
    )
    .required(),
});

const assignTaskToDataGeneratorSchema = Joi.object({
    bookTaskId: Joi.string().guid().required(),
    dataGeneratorId: Joi.string().guid().required(),
    supervisorComments: Joi.string().max(225),
});

const assignTaskToReviewerSchema = Joi.object({
    bookTaskId: Joi.string().guid().required(),
    reviewerId: Joi.string().guid().required(),
    supervisorComments: Joi.string().max(225),
});

module.exports = {
  createBookTaskSchema,
  updateBookTaskSchema,
  assignTaskToDataGeneratorSchema,
  assignTaskToReviewerSchema,
};
