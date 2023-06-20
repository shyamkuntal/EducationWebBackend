const Joi = require("joi");

const assignUploderUserToSheetSchema = Joi.object({
  sheetId: Joi.string().guid().required(),
  uploaderId: Joi.string().guid().required(),
  supervisorComments: Joi.string().max(225),
});

const assignReviewerUserToSheetSchema = Joi.object({
  sheetId: Joi.string().guid().required(),
  reviewerId: Joi.string().guid().required(),
  // supervisorComments: Joi.string().max(225).required(),
});

module.exports = {
  assignUploderUserToSheetSchema,
  assignReviewerUserToSheetSchema,
};
