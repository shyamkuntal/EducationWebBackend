import Joi from "joi";

export const assignUploderUserToSheetSchema = Joi.object({
  sheetId: Joi.string().guid(),
  uploaderUserId: Joi.string().guid(),
});

export const assignReviewerUserToSheetSchema = Joi.object({
  sheetId: Joi.string().guid(),
  reviewerUserId: Joi.string().guid(),
});
