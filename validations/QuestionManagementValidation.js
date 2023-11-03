const Joi = require("joi");
const CONSTANTS = require("../constants/constants");

const createQuestionsSchema = Joi.object({
  sheetId: Joi.string().guid(),
  parentQuestionId:Joi.string().guid(),
  distractors:Joi.array(),
  questionType: Joi.string().required(),
  questionData: Joi.string().required(),
  questionDescription: Joi.string().allow(""),
  marks: Joi.number(),
  isQuestionSubPart:Joi.boolean(),
  requiredTime: Joi.number(),
  uploaderDescription: Joi.string(),
  videoLink: Joi.string().uri(),
  pageNumber: Joi.number(),
  bookExcercise: Joi.string(),
  exampleNo: Joi.number(),
  bookExcerciseNo: Joi.string(),
  priceForTeacher: Joi.number(),
  priceForStudent: Joi.number(),
  difficultyLevel: Joi.string(),
  levelTagging: Joi.string(),
  commandTerm: Joi.string(),
  errorReportByTeacher: Joi.string(),
  errorReportByReviewer: Joi.string(),
  isPremium: Joi.boolean(),
  isCheckedByPricer: Joi.boolean(),
  isErrorByTeacher: Joi.boolean(),
  isCheckedByReviewer: Joi.boolean(),
  isErrorByReviewer: Joi.boolean(),
  parentQuestionId: Joi.string().guid(),
  hasSubPart: Joi.boolean(),
  isQuestionSubPart: Joi.boolean(),
  includeExplanation: Joi.boolean(),
  explanation: Joi.string(),
  questionIndentifier: Joi.string(),
  isShuffle: Joi.boolean(),
  subQuestionNumberingScheme: Joi.string(),
});

const createTextQuestionSchema = Joi.array().items({
  sheetId: Joi.string().guid().required(),
  questionData: Joi.string().required(),
});
const updateTextQuestionSchema = Joi.object({
  questionId: Joi.string().guid().required(),
  questionData: Joi.string().required(),
  explanation: Joi.string(),
  includeExplanation: Joi.boolean(),
});

const createFillDropDownQuestionOptionsSchema = Joi.array().items({
  option: Joi.string().required(),
  isCorrectOption: Joi.boolean().required(),
});

const addFillDropDownQuestionOptionsSchema = Joi.object({
  questionId: Joi.string().guid().required(),
  optionsToBeAdded: Joi.array().items({
    option: Joi.string().required(),
    isCorrectOption: Joi.boolean().required(),
  }),
});

const deleteFillDropDownQuestionOptionsSchema = Joi.object({
  optionId: Joi.string().guid().required(),
});

const getFillDropDownQuestionOptionsSchema = Joi.object({
  questionId: Joi.string().guid().required(),
});

const deleteFillDropDownQuestionSchema = Joi.object({
  questionId: Joi.string().guid().required(),
});

const optionSchema = Joi.object({
  option: Joi.string().required(),
  isCorrectOption: Joi.boolean().required(),
  feedback: Joi.string().required(),
  content: Joi.object({
    filename: Joi.string().required(),
    mimetype: Joi.string().required(),
    buffer: Joi.string().base64().required(),
  }).optional(),
});

const McqSchema = Joi.object({
  options: Joi.array()
    .items(
      Joi.object({
        option: Joi.string().required(),
        isCorrectOption: Joi.boolean().required(),
        feedback: Joi.string().allow(""),
        content: Joi.string().optional().allow(""),
      })
    )
    .required(),
});

const editFillDropDownQuestionOptionsSchema = Joi.object({
  questionId: Joi.string().guid().required(),
  dataToBeUpdated: Joi.array().items({
    id: Joi.string().guid().required(),
    option: Joi.string().required(),
    isCorrectOption: Joi.boolean().required(),
  }),
});

const deleteQuestionSchema = Joi.object({ questionId: Joi.string().guid().required() });

const editQuestionSchema = Joi.object({
  id: Joi.string().guid(),
  parentQuestionId: Joi.string().guid(),
  questionId: Joi.string().guid(),
  sheetId: Joi.string().guid(),
  questionType: Joi.string(),
  type: Joi.string(),
  questionData: Joi.string(),
  marks: Joi.number(),
  requiredTime: Joi.string(),
  uploaderDescription: Joi.string(),
  videoLink: Joi.string(),
  pageNumber: Joi.string(),
  bookExcercise: Joi.string(),
  exampleNo: Joi.string(),
  bookExcerciseNo: Joi.number(),
  priceForTeacher: Joi.number(),
  priceForStudent: Joi.number(),
  difficultyLevel: Joi.string(),
  levelTagging: Joi.string(),
  commandTerm: Joi.string(),
  errorReportByTeacher: Joi.string(),
  errorReportByReviewer: Joi.string(),
  isPremium: Joi.boolean(),
  isCheckedByPricer: Joi.boolean(),
  isCheckedByTeacher: Joi.boolean(),
  isErrorByTeacher: Joi.boolean(),
  isCheckedByReviewer: Joi.boolean(),
  isErrorByReviewer: Joi.boolean(),
  includeExplanation: Joi.boolean(),
  explanation: Joi.string(),
  questionIndentifier: Joi.string(),
  isShuffle: Joi.boolean(),
});

const createMatchQuestionPairsSchema = Joi.object({
  pairs: Joi.array().items({
    matchPhrase: Joi.string().required(),
    matchTarget: Joi.string().required(),
    matchPhraseContent: Joi.string().allow(null),
    matchTargetContent: Joi.string().allow(null),
  }),
});

const editMatchQuestionPairsSchema = Joi.object({
  pairsToBeUpdated: Joi.array().items({
    id: Joi.string().uuid().required(),
    matchPhrase: Joi.string().required(),
    matchTarget: Joi.string().required(),
    matchPhraseContent: Joi.string(),
    matchTargetContent: Joi.string(),
    newMatchPhraseContent: Joi.object({
      filename: Joi.string(),
      mimetype: Joi.string(),
      buffer: Joi.string(),
    }).allow(null),
    newMatchTargetContent: Joi.object({
      filename: Joi.string(),
      mimetype: Joi.string(),
      buffer: Joi.string(),
    }).allow(null),
  }),
});

const addMatchQuestionPairSchema = Joi.object({
  questionId: Joi.string().uuid().required(),
  pairsToBeAdded: Joi.array().items({
    matchPhrase: Joi.string(),
    matchTarget: Joi.string(),
    matchPhraseContent: Joi.object({
      filename: Joi.string(),
      mimetype: Joi.string(),
      buffer: Joi.string(),
    }).allow(null),
    matchTargetContent: Joi.object({
      filename: Joi.string(),
      mimetype: Joi.string(),
      buffer: Joi.string(),
    }).allow(null),
  }),
});

const deleteMatchPairSchema = Joi.object({ pairId: Joi.string().uuid().required() });

const createDrawingQuestionSchema = Joi.object({
  uploaderJson: Joi.string().required(),
  studentJson: Joi.string().required(),
});

const editDrawingQuestionSchema = Joi.object({
  uploaderJson: Joi.string().required(),
  studentJson: Joi.string().required(),
});

const createLabelDragQuestionSchema = Joi.object({
  uploaderJson: Joi.string().required(),
  studentJson: Joi.string().required(),
});

const editLabelDragQuestionSchema = Joi.object({
  uploaderJson: Joi.string().required(),
  studentJson: Joi.string().required(),
});

const createLabelFillQuestionSchema = Joi.object({
  dataGeneratorJson: Joi.string().required(),
  studentJson: Joi.string().required(),
});

const editLabelFillQuestionSchema = Joi.object({
  dataGeneratorJson: Joi.string().required(),
  studentJson: Joi.string().required(),
});

const createGeogebraGraphQuestionSchema = Joi.object({
  uploaderJson: Joi.string().required(),
  studentJson: Joi.string(),
  graphType: Joi.string().required(),
  allowAlgebraInput: Joi.boolean().required(),
});

const editGeogebraGraphQuestionSchema = Joi.object({
  uploaderJson: Joi.string().required(),
  studentJson: Joi.string(),
  graphType: Joi.string(),
  allowAlgebraInput: Joi.boolean().required(),
});

const createDesmosGraphQuestionSchema = Joi.object({
  uploaderJson: Joi.string().required(),
  studentJson: Joi.string().required(),
});

const editDesmosGraphQuestionSchema = Joi.object({
  newUploaderJson: Joi.string().required(),
  newStudentJson: Joi.string().required(),
});

const createHotSpotQuestionSchema = Joi.object({
  uploaderJson: Joi.string().required(),
  studentJson: Joi.string().required(),
  hotSpotIds: Joi.array().items(Joi.string().uuid()),
});

const editHotSpotQuestionSchema = Joi.object({
  uploaderJson: Joi.string().required(),
  studentJson: Joi.string().required(),
  hotSpotIds: Joi.array().items(Joi.string().uuid()),
});

const createSortQuestionSchema = Joi.object({
  options: Joi.array().items({
    option: Joi.string().required(),
    content: Joi.string().allow(null),
  }),
});

const editSortQuestionSchema = Joi.object({
  optionsToBeUpdated: Joi.array().items({
    id: Joi.string().uuid(),
    option: Joi.string().required(),
    content: Joi.string().allow(null),
  }),
});

const addSortQuestionOptionSchema = Joi.object({
  questionId: Joi.string().uuid().required(),
  optionsToBeAdded: Joi.array().items({
    option: Joi.string().required(),
    content: Joi.string().allow(null),
  }),
});

const deleteSortQuestionOptionSchema = Joi.object({
  optionId: Joi.string().uuid().required(),
});

module.exports = {
  createQuestionsSchema,
  createFillDropDownQuestionOptionsSchema,
  addFillDropDownQuestionOptionsSchema,
  deleteFillDropDownQuestionOptionsSchema,
  getFillDropDownQuestionOptionsSchema,
  deleteFillDropDownQuestionSchema,
  optionSchema,
  McqSchema,
  editFillDropDownQuestionOptionsSchema,
  deleteQuestionSchema,
  editQuestionSchema,
  createMatchQuestionPairsSchema,
  editMatchQuestionPairsSchema,
  addMatchQuestionPairSchema,
  createDrawingQuestionSchema,
  editDrawingQuestionSchema,
  deleteMatchPairSchema,
  createLabelDragQuestionSchema,
  createTextQuestionSchema,
  updateTextQuestionSchema,
  editLabelDragQuestionSchema,
  createLabelFillQuestionSchema,
  editLabelFillQuestionSchema,
  createGeogebraGraphQuestionSchema,
  editGeogebraGraphQuestionSchema,
  createDesmosGraphQuestionSchema,
  editDesmosGraphQuestionSchema,
  createHotSpotQuestionSchema,
  editHotSpotQuestionSchema,
  createSortQuestionSchema,
  editSortQuestionSchema,
  addSortQuestionOptionSchema,
  deleteSortQuestionOptionSchema,
};
