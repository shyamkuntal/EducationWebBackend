const Joi = require("joi");

const updateSheetStatusSchema = Joi.object({
  sheetId: Joi.string().uuid().required(),
  uploaderId: Joi.string().uuid().required(),
});

const getQuestionsSchema = Joi.object({
  sheetId: Joi.string().uuid(),
});

const submitSheetToSupervisorSchema = Joi.object({
  sheetId: Joi.string().guid().required(),
  uploaderId: Joi.string().guid().required(),
});

module.exports = { updateSheetStatusSchema, getQuestionsSchema, submitSheetToSupervisorSchema };
