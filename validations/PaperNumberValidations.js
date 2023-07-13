const Joi = require("joi");
const CONSTANTS = require("../constants/constants");

const createPaperNumberSheetSchema = Joi.object({
  boardId: Joi.string().guid().required(),
  subBoardId: Joi.string().guid().required(),
  grade: Joi.string().max(225).required(),
  subjectId: Joi.string().guid(),
  resources: Joi.string(),
  description: Joi.string(),
  supervisorId: Joi.string().guid(),
});

const EditPaperNumberSheetSchema = Joi.object({
  paperNumberSheetId: Joi.string().guid().required(),
  boardId: Joi.string().guid().required(),
  subBoardId: Joi.string().guid().required(),
  grade: Joi.string().max(225).required(),
  subjectId: Joi.string().guid(),
  resources: Joi.string(),
  description: Joi.string(),
  supervisorId: Joi.string().guid(),
});

const CreatePaperNumber = Joi.object({
  paperNumberSheetId: Joi.string().guid().required(),
  paperNumber: Joi.string().required(),
});

const assignDataGeneratorUserToSheetSchema = Joi.object({
  paperNumberSheetId: Joi.string().guid().required(),
  dataGeneratorId: Joi.string().guid().required(),
  supervisorComments: Joi.string().max(225),
});

const assignReviewerUserToSheetSchema = Joi.object({
  paperNumberSheetId: Joi.string().guid().required(),
  reviewerId: Joi.string().guid().required(),
  supervisorComments: Joi.string().max(225),
});

module.exports = { createPaperNumberSheetSchema, EditPaperNumberSheetSchema, assignDataGeneratorUserToSheetSchema, assignReviewerUserToSheetSchema };
