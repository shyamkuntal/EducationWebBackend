const Joi = require("joi");
const CONSTANTS = require("../constants/constants");

const createSubjectSchema = Joi.object({
  boardId: Joi.string().guid().required(),
  subBoardId: Joi.string().guid().required(),
  grade: Joi.string().max(225).required(),
  subjectName: Joi.string().max(225),
  subjectNameId: Joi.string().guid(),
  subjectImageId: Joi.string(),
  subjectLevels: Joi.array().items(
    Joi.object({ subjectLevelName: Joi.string().max(225).required() })
  ),
  image: Joi.object({
    fieldname: Joi.string(),
    originalname: Joi.string(),
    encoding: Joi.string(),
    mimetype: Joi.string(),
    buffer: Joi.any(),
    size: Joi.number(),
  }).allow(null),
  newImage: Joi.object({
    fieldname: Joi.string(),
    originalname: Joi.string(),
    encoding: Joi.string(),
    mimetype: Joi.string(),
    buffer: Joi.any(),
    size: Joi.number(),
  }).allow(null),
});

const getSubBoardsSchema = Joi.object({
  boardId: Joi.string().guid().required(),
});

const getSubjectNameSugesstionsSchema = Joi.object({
  boardId: Joi.string().guid().required(),
  subBoardId: Joi.string().guid().required(),
});

const getSubjectBySubjectNameId = Joi.object({
  subjectNameId: Joi.string().guid().required(),
});

const getSubjectByIds = Joi.object({
  boardId: Joi.string().guid().required(),
  subBoardId: Joi.string().guid().required(),
  grade: Joi.string().max(50).required(),
});

const archiveSubjectsLevels = Joi.object({
  subjectId: Joi.string().guid().required(),
  isArchived: Joi.boolean().required(),
  levelsId: Joi.array().items(Joi.string().guid().required()),
});

const getSingleSubjectById = Joi.object({
  subjectNameId: Joi.string().guid().required(),
  boardId: Joi.string().guid().required(),
  subBoardId: Joi.string().guid().required(),
  grade: Joi.string().max(50).required(),
});

const getSubjectLevelBySubjectId = Joi.object({
  subjectId: Joi.string().guid().required(),
});

const togglePublishSubject = Joi.object({
  subjectIds: Joi.array().items(Joi.string().guid().required()),
  isPublished: Joi.boolean().required(),
});

const updateSubjectSchema = Joi.object({
  subjectId: Joi.string().guid().required(),
  boardId: Joi.string().guid().required(),
  subBoardId: Joi.string().guid().required(),
  grade: Joi.string().required(),
  subjectNameId: Joi.string().guid().required(),
  subjectLevels: Joi.array().items(
    Joi.object({
      id: Joi.string().guid().required(),
      subjectLevelName: Joi.string().max(225).required(),
      isArchived: Joi.boolean().required(),
      subjectId: Joi.string().guid(),
    })
  ),
  image: Joi.object({
    fieldname: Joi.string(),
    originalname: Joi.string(),
    encoding: Joi.string(),
    mimetype: Joi.string(),
    buffer: Joi.any(),
    size: Joi.number(),
  }),
});

module.exports = {
  createSubjectSchema,
  getSubBoardsSchema,
  getSubjectNameSugesstionsSchema,
  getSubjectBySubjectNameId,
  getSubjectByIds,
  getSubjectLevelBySubjectId,
  archiveSubjectsLevels,
  getSingleSubjectById,
  togglePublishSubject,
  updateSubjectSchema,
};
