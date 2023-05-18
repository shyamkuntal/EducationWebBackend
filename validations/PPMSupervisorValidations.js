import Joi from "joi";

export const assignUserToSheetSchema = Joi.object({
  sheetId: Joi.number(),
  userId: Joi.number(),
});
