const Joi = require("joi");

const getSubBoardsSchema = Joi.object({
  boardId: Joi.string().guid().required(),
});

const createAccountSchema = Joi.object({
  roleId: Joi.string().uuid().required(),
  Name: Joi.string().max(225).required(),
  userName: Joi.string().max(225).required(),
  email: Joi.string().email().max(225).required(),
  password: Joi.string().max(225).required(),
  boardIds: Joi.array().items(Joi.string().uuid()),
  subBoardIds: Joi.array().items(Joi.string().uuid()),
  subjectsIds: Joi.array().items(Joi.string().uuid()),
  qualifications: Joi.array().items(Joi.string()),
  modules: Joi.array().items(Joi.string().max(50)),
});

const editAccountSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  Name: Joi.string().max(225).required(),
  userName: Joi.string().max(225).required(),
  email: Joi.string().email().max(225).required(),
  password: Joi.string().max(225).allow(""),
  boardIds: Joi.array().items(Joi.string().uuid()),
  subBoardIds: Joi.array().items(Joi.string().uuid()),
  subjectsIds: Joi.array().items(Joi.string().uuid()),
  qualifications: Joi.array().items(Joi.string()),
  modules: Joi.array().items(Joi.string()),
});

const getSubjectNameByIdSchema = Joi.object({
  subjectNameId: Joi.string().uuid().required(),
});

const toggleActivateUserSchema = Joi.object({
  userId: Joi.string().uuid().required(),
});

const getUserBoardSubBoardSubjectSchema = Joi.object({
  userId: Joi.string().uuid().required(),
});
module.exports = {
  getSubBoardsSchema,
  createAccountSchema,
  getSubjectNameByIdSchema,
  toggleActivateUserSchema,
  getUserBoardSubBoardSubjectSchema,
  editAccountSchema,
};
