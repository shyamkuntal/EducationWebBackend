const Joi = require("joi");
const CONSTANTS = require("../constants/constants");

const createPastPaperSchema = Joi.object({
  paperNumber: Joi.number().required(),
  googleLink: Joi.string().regex(CONSTANTS.validationRegex.urlRegex).required(),
  image: Joi.object({
    fieldname: Joi.string(),
    originalname: Joi.string(),
    encoding: Joi.string(),
    mimetype: Joi.string().valid("image/jpeg", "image/png"),
    buffer: Joi.any(),
    size: Joi.number(),
  }),

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
  sheetId: Joi.string().uuid().required(),
});


module.exports = {
  createPastPaperSchema,
};
