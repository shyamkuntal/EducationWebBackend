const Joi = require("joi");

const assignUploderUserToSheetSchema = Joi.object({
  sheetId: Joi.string().guid(),
  uploaderUserId: Joi.string().guid(),
});

const assignReviewerUserToSheetSchema = Joi.object({
  sheetId: Joi.string().guid(),
  reviewerUserId: Joi.string().guid(),
});

module.exports = {
  assignUploderUserToSheetSchema,
  assignReviewerUserToSheetSchema,
};
