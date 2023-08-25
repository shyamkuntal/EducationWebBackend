const Joi = require("joi");
const CONSTANTS = require("../constants/constants");

const paginationValidationSchema = Joi.object({
  isSpam: Joi.boolean(),
  isArchived: Joi.boolean(),
  isPublished: Joi.boolean(),
  assignedToUserId: Joi.string().guid(),
  supervisorId: Joi.string().guid(),
  boardId: Joi.string().guid(),
  subBoardId: Joi.string().guid(),
  subjectId: Joi.string().guid(),
  grade: Joi.string(),
  statusForDataGenerator: Joi.string().max(50),
  statusForReviewer: Joi.string().max(50),
  search: Joi.string().max(225),
  time: Joi.string().max(225),
});

module.exports = {
  paginationValidationSchema,
};
