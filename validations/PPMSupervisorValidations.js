const Joi = require("joi");

const createPastPaperSheetSchema = Joi.object({
  boardId: Joi.string().guid().required(),
  subBoardId: Joi.string().guid().required(),
  grade: Joi.string().max(225).required(),
  subjectId: Joi.string().guid().required(),
  subjectLevelId: Joi.string().guid().required(),
  year: Joi.string().max(225).required(),
  season: Joi.string().max(225).required(),
  variantId: Joi.string().guid().required(),
  paperNumber: Joi.string().max(225).required(),
  paperNumberId: Joi.string().guid().required(),
  resources: Joi.string().max(225).required(),
  supervisorId: Joi.string().guid().required(),
});

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
  sheetId: Joi.string().guid().required(),
});

const getUserAssignedSubjectsSchema = Joi.object({
  userId: Joi.string().guid().required(),
});

const createVariantSchema = Joi.object({ name: Joi.string().max(225).required() });

const editVariantSchema = Joi.object({
  variantId: Joi.string().guid().required(),
  newName: Joi.string().max(225).required(),
});

module.exports = {
  assignUploderUserToSheetSchema,
  assignReviewerUserToSheetSchema,
  getUserAssignedSubjectsSchema,
  getSheetLogsSchema,
  getPastPaperSchema,
  createVariantSchema,
  editVariantSchema,
  createPastPaperSheetSchema,
};
