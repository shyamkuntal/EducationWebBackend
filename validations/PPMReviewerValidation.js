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
  reviewerId: Joi.string().guid().required(),
  recheckComment: Joi.string().max(225),
});

module.exports = {
  assignSupervisorUserToSheetSchema,
  updateSheetStatusSchema,
  reportErrorSchema,
};
