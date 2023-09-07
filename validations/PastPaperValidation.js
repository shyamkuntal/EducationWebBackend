const Joi = require("joi");
const CONSTANTS = require("../constants/constants");

const createPastPaperSchema = Joi.object({
  paperNumber: Joi.string().required(),
  googleLink: Joi.string().uri().required(),
  questionPdf: Joi.object({
    fieldname: Joi.string(),
    originalname: Joi.string(),
    encoding: Joi.string(),
    mimetype: Joi.string(),
    buffer: Joi.any(),
    size: Joi.number(),
  }),

  answerPdf: Joi.object({
    fieldname: Joi.string(),
    originalname: Joi.string(),
    encoding: Joi.string(),
    mimetype: Joi.string(),
    buffer: Joi.any(),
    size: Joi.number(),
  }),
  image: Joi.object({
    fieldname: Joi.string(),
    originalname: Joi.string(),
    encoding: Joi.string(),
    mimetype: Joi.string().valid("image/jpeg", "image/png", "image/jpg"),
    buffer: Joi.any(),
    size: Joi.number(),
  }),

  sheetId: Joi.string().uuid().required(),
});
const assignSupervisorUserToSheetSchema = Joi.object({
  sheetId: Joi.string().guid().required(),
  pastPaperId: Joi.string().guid().required(),
});

const editPastPaperSchema = Joi.object({
  sheetId: Joi.string().guid().required(),
  paperNumber: Joi.string().required(),
  googleLink: Joi.string().required(),
  newQuestionPaper: Joi.object({
    fieldname: Joi.string(),
    originalname: Joi.string(),
    encoding: Joi.string(),
    mimetype: Joi.string(),
    buffer: Joi.any(),
    size: Joi.number(),
  }).allow(null),
  newAnswerPaper: Joi.object({
    fieldname: Joi.string(),
    originalname: Joi.string(),
    encoding: Joi.string(),
    mimetype: Joi.string(),
    buffer: Joi.any(),
    size: Joi.number(),
  }).allow(null),
  newImageBanner: Joi.object({
    fieldname: Joi.string(),
    originalname: Joi.string(),
    encoding: Joi.string(),
    mimetype: Joi.string(),
    buffer: Joi.any(),
    size: Joi.number(),
  }).allow(null),
});

const getErrorReportFileSchema = Joi.object({
  sheetId: Joi.string().guid().required(),
});

module.exports = {
  createPastPaperSchema,
  assignSupervisorUserToSheetSchema,
  editPastPaperSchema,
  getErrorReportFileSchema,
};
