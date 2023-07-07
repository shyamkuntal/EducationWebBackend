const Joi = require("joi");

const assignUploderUserToSheetSchema = Joi.object({
  sheetId: Joi.string().guid().required(),
  uploaderId: Joi.string().guid().required(),
  supervisorComments: Joi.string().max(225),
});

const assignReviewerUserToSheetSchema = Joi.object({
  sheetId: Joi.string().guid().required(),
  reviewerId: Joi.string().guid().required(),
  supervisorComments: Joi.string().max(225),
});

const getSheetLogsSchema = Joi.object({
  sheetId: Joi.string().guid().required(),
});

const getPastPaperSchema = Joi.object({
  pastPaperId: Joi.string().guid().required(),
});

module.exports = {
  assignUploderUserToSheetSchema,
  assignReviewerUserToSheetSchema,
  getSheetLogsSchema,
  getPastPaperSchema,
};
