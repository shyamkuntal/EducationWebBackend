const Joi = require("joi");

const updateSheetStatusSchema = Joi.object({
  sheetId: Joi.string().uuid().required(),
  uploaderId: Joi.string().uuid().required(),
});

const getQuestionsSchema = Joi.object({
  sheetId: Joi.string().uuid(),
});

module.exports = { updateSheetStatusSchema, getQuestionsSchema };
