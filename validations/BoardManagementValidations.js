const Joi = require("joi");
const CONSTANTS = require("../constants/constants");

const addBoardSchema = Joi.object({
  boardName: Joi.string().max(50).required(),
  boardType: Joi.string().max(50).required(),
  contact: Joi.number().required(),
  email: Joi.string().email().required(),
  website: Joi.string().uri().required(),
  address: Joi.string().max(225).allow(""),
  subBoard: Joi.array().items(Joi.object({ subBoardName: Joi.string().max(225).required() })),
});

const editBoardSchema = Joi.object({
  id: Joi.string().guid().required(),
  boardName: Joi.string().max(50).required(),
  boardType: Joi.string().max(50).required(),
  contact: Joi.number().required(),
  email: Joi.string().email().required(),
  website: Joi.string().uri().required(),
  address: Joi.string().max(225).allow(""),
  subBoards: Joi.array().items(
    Joi.object({
      id: Joi.string().guid().required().allow(null),
      subBoardName: Joi.string().max(225).required(),
      isArchived: Joi.boolean().required(),
      boardId: Joi.string().guid().required(),
    })
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

const getBoardsAndSubBoards = Joi.object({
  boardId: Joi.string().guid().required(),
});

const getBoardsByTypeSchema = Joi.object({
  boardType: Joi.string().max(50).required(),
});

const updateSubBoardSchema = Joi.object({
  subBoardId: Joi.string().guid().required(),
  subBoardName: Joi.string().max(225).required(),
});

module.exports = {
  getSubBoardsSchema,
  createSubBoardsSchema,
  addBoardSchema,
  toggleIsPublishedSchema,
  archiveBoardSchema,
  archiveSubBoardsSchema,
  getBoardsAndSubBoards,
  editBoardSchema,
  getBoardsByTypeSchema,
  updateSubBoardSchema,
};
