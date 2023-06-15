const Joi = require("joi");

const getSubBoardsSchema = Joi.object({
  boardId: Joi.string().guid().required(),
});

const createAccountSchema = Joi.object({
  roleId: Joi.string().uuid().required(),
  Name: Joi.string().max(225).required(),
  userName: Joi.string().max(225).required(),
  email: Joi.string().email().max(225).required(),
  password: Joi.string().required(),
  boardIds: Joi.array().items(Joi.string().uuid().required()),
  subBoardIds: Joi.array().items(Joi.string().uuid().required()),
  subjectsIds: Joi.array().items(Joi.string().uuid().required()),
});

module.exports = {
  getSubBoardsSchema,
  createAccountSchema,
};
