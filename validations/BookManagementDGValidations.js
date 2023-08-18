const Joi = require("joi");
const CONSTANTS = require("../constants/constants");

const getBooksByBookTaskIdSchema = Joi.object({
  bookTaskId: Joi.string().guid().required(),
});

const updateBookSchema = Joi.object({
  bookId: Joi.string().guid().required(),
  subTitle: Joi.string().max(225).required(),
  author: Joi.string().max(225).required(),
  publisher: Joi.string().max(225).required(),
});

const addChapterSchema = Joi.array().items(
  Joi.object({
    bookTaskId: Joi.string().guid().required(),
    bookId: Joi.string().guid().required(),
    chapterNumber: Joi.string().max(225).required(),
    name: Joi.string().max(225).required(),
  })
);

module.exports = {
  getBooksByBookTaskIdSchema,
  updateBookSchema,
  addChapterSchema,
};
