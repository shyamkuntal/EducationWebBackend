const Joi = require("joi");

const updateSheetStatusSchema = Joi.object({
  sheetId: Joi.string().guid().required(),
  reviewerId: Joi.string().guid().required(),
});

const assignSupervisorUserToSheetSchema = Joi.object({
  sheetId: Joi.string().guid().required(),
  reviewerId: Joi.string().guid().required(),
});

const reportErrorSchema = Joi.object({
  sheetId: Joi.string().guid().required(),
  errorReport: Joi.string().max(150).required(),
  comment: Joi.string().max(150).required(),
  file: Joi.string().required(),
});

module.exports = {
  assignSupervisorUserToSheetSchema,
  updateSheetStatusSchema,
  reportErrorSchema,
};
