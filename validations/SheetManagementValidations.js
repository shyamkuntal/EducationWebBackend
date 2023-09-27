const Joi = require("joi");

const createSheetSchema = Joi.object({
  sheetType: Joi.string().max(225).required(),
  boardId: Joi.string().uuid().required(),
  subBoardId: Joi.string().uuid().required(),
  grade: Joi.string().max(225).required(),
  subjectId: Joi.string().uuid().required(),
  subjectLevelId: Joi.string().uuid().required(),
  mypMarkingScheme: Joi.string().max(225).required(),
  answerType: Joi.string().max(225).required(),
  pricingSchForStudents: Joi.string().max(225),
  pricingSchForTeachers: Joi.string().max(225),
  numberOfQuestion: Joi.number(),
  timeVariable: Joi.string().max(225).required(),
  questionVideoLink: Joi.string().required(),
  resources: Joi.string(),
  isMCQQuestion: Joi.boolean(),
  sheetHintForUploader: Joi.string(),
  sheetDescForUploader: Joi.string(),
  isMultiplePaperNo: Joi.boolean(),
  year: Joi.string(),
  season: Joi.string(),
  month: Joi.string(),
  variantId: Joi.string().uuid(),
  paperNumber: Joi.array().items(Joi.string().uuid()),
  school: Joi.string(),
  testType: Joi.string(),
  batchHint: Joi.string(),
  bookId: Joi.string().uuid(),
  chapterName: Joi.string(),
  chapterNo: Joi.number(),
  startPageNo: Joi.number(),
  endPageNo: Joi.number(),
  supervisorId: Joi.string().uuid().required(),
});
const assignSheetToUploaderSchema = Joi.object({
  sheetId: Joi.string().guid().required(),
  uploader2Id: Joi.string().guid().required(),
  supervisorComments: Joi.string().max(225),
});
const assignSheetToReviewerSchema = Joi.object({
  sheetId: Joi.string().guid().required(),
  reviewerId: Joi.string().guid().required(),
  supervisorComments: Joi.string().max(225),
});
const assignSheetToTeacherSchema = Joi.object({
  sheetId: Joi.string().guid().required(),
  teacherId: Joi.string().guid().required(),
  supervisorComments: Joi.string().max(225),
});
module.exports = { 
  createSheetSchema ,
  assignSheetToUploaderSchema,
  assignSheetToReviewerSchema,
  assignSheetToTeacherSchema,
};
