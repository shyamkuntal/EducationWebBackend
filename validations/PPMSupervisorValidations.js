const Joi = require("joi");

const assignUploderUserToSheetSchema = Joi.object({
  sheetId: Joi.string().guid().required(),
  uploaderId: Joi.string().guid().required(),
});

const assignReviewerUserToSheetSchema = Joi.object({
  sheetId: Joi.string().guid().required(),
  reviewerId: Joi.string().guid().required(),
});

module.exports = {
  assignUploderUserToSheetSchema,
  assignReviewerUserToSheetSchema,
};
