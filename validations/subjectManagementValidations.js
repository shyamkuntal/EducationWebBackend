const Joi = require("joi");
const CONSTANTS = require("../constants/constants");

const createSubjectSchema = Joi.object({
  boardId: Joi.string().guid().required(),
  subBoardId: Joi.string().guid().required(),
  grade: Joi.string().max(225).required(),
  subjectName: Joi.string().max(225),
  subjectNameId: Joi.string().guid(),
  subjectImage: Joi.string(),
  subjectLevels: Joi.array().items(
    Joi.object({ subjectLevelName: Joi.string().max(225).required() })
  ),
  image: Joi.object({
    fieldname: Joi.string(),
    originalname: Joi.string(),
    encoding: Joi.string(),
    mimetype: Joi.string(),
    buffer: Joi.any(),
    size: Joi.number(),
  }),
});

const getSubBoardsSchema = Joi.object({
  boardId: Joi.string().guid().required(),
});

const getSubjectNameSugesstionsSchema = Joi.object({
  boardId: Joi.string().guid().required(),
  subBoardId: Joi.string().guid().required(),
});

module.exports = {
  createSubjectSchema,
  getSubBoardsSchema,
  getSubjectNameSugesstionsSchema,
};
