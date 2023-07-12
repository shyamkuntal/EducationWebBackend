const Joi = require("joi");

const updateSheetStatusSchema = Joi.object({
  sheetId: Joi.string().guid().required(),
  reviewerId: Joi.string().guid().required(),
});

module.exports = {
  updateSheetStatusSchema,
};
