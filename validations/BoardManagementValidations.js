const Joi = require("joi");
const CONSTANTS = require("../constants/constants");

const addBoardSchema = Joi.object({
  boardName: Joi.string().max(50).required(),
  boardType: Joi.string().max(50).required(),
  contact: Joi.string().regex(CONSTANTS.validationRegex.phoneRegex).required(),
  email: Joi.string().email().required(),
  website: Joi.string().regex(CONSTANTS.validationRegex.urlRegex).required(),
  address: Joi.string().max(225).required(),
  subBoard: Joi.array().items(
    Joi.object({ SubBoardName: Joi.string().max(225).required() })
  ),
});

const getSubBoardsSchema = Joi.object({
  boardId: Joi.string().guid().required(),
});

const toggleIsPublishedSchema = Joi.object({
  boardId: Joi.string().guid().required(),
  isPublished: Joi.boolean().required(),
});

const createSubBoardsSchema = Joi.object({
  boardId: Joi.string().guid().required(),
  subBoardName: Joi.string().max(50).required(),
});

const archiveBoardSchema = Joi.object({
  boardId: Joi.string().guid().required(),
  isArchived: Joi.boolean().required(),
});

const archiveSubBoardsSchema = Joi.object({
  boardId: Joi.string().guid().required(),
  isArchived: Joi.boolean().required(),
  subBoardIds: Joi.array().items(Joi.string().guid().required()),
});

module.exports = {
  getSubBoardsSchema,
  createSubBoardsSchema,
  addBoardSchema,
  toggleIsPublishedSchema,
  archiveBoardSchema,
  archiveSubBoardsSchema,
};
