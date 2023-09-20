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

const addChapterSchema = Joi.object({
  bookTaskId: Joi.string().guid().required(),
  bookId: Joi.string().guid().required(),
  chapterNumber: Joi.number().required(),
  name: Joi.string().max(225).required(),
});

const deleteChapterSchema = Joi.object({
  bookTaskId: Joi.string().guid().required(),
  bookId: Joi.string().guid().required(),
  chapterId: Joi.string().guid().required(),
});

const updateBookStatusSchema = Joi.object({
  bookTaskId: Joi.string().guid().required(),
  bookId: Joi.string().guid().required(),
});

const updateInprogressTaskStatusSchema = Joi.object({
  bookTaskId: Joi.string().guid().required(),
  dataGeneratorId: Joi.string().guid().required(),
});

const updateCompleteTaskStatusSchema = Joi.object({
  bookTaskId: Joi.string().guid().required(),
  dataGeneratorId: Joi.string().guid().required(),
});

const submitTaskToSupervisorSchema = Joi.object({
  bookTaskId: Joi.string().guid().required(),
  dataGeneratorId: Joi.string().guid().required(),
});

const updateChapterSchema = Joi.object({
  chapterId: Joi.string().guid().required(),
  chapterNumber: Joi.number().max(225).required(),
  name: Joi.string().max(225).required(),
});

module.exports = {
  getBooksByBookTaskIdSchema,
  updateBookSchema,
  addChapterSchema,
  deleteChapterSchema,
  updateBookStatusSchema,
  updateInprogressTaskStatusSchema,
  updateCompleteTaskStatusSchema,
  submitTaskToSupervisorSchema,
  updateChapterSchema,
};
