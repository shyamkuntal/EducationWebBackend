const Joi = require("joi");

const createQuestionsSchema = Joi.object({
  sheetId: Joi.string().guid().required(),
  questionType: Joi.string().required(),
  questionData: Joi.string().required(),
  questionDescription: Joi.string(),
  marks: Joi.number(),
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
  // hasSubParts: Joi.boolean(),
  parentQuestionId: Joi.string().guid(),
  isQuestionSubPart: Joi.boolean().required(),
  includeExplanation: Joi.string(),
  explanation: Joi.string(),
  questionIndentifier: Joi.string(),
  isShuffle: Joi.boolean(),
});

const createTextQuestionSchema = Joi.array().items({
  sheetId: Joi.string().guid().required(),
  questionData: Joi.string().max(1000).required(),
});
const updateTextQuestionSchema = Joi.object({
  questionId: Joi.string().guid().required(),
  questionData: Joi.string().max(1000).required(),
});

const createFillDropDownQuestionOptionsSchema = Joi.array().items({
  option: Joi.string().max(225).required(),
  isCorrectOption: Joi.boolean().required(),
});

const addFillDropDownQuestionOptionsSchema = Joi.object({
  questionId: Joi.string().guid().required(),
  optionsToBeAdded: Joi.array().items({
    option: Joi.string().max(225).required(),
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
  questionType: Joi.string().valid("MCQ").required(),
  questionData: Joi.string().required(),
  sheetId: Joi.string().guid().required(),
  options: Joi.array()
    .items(
      Joi.object({
        option: Joi.string().required(),
        isCorrectOption: Joi.boolean().required(),
        feedback: Joi.string().required(),
        content: Joi.object({
          filename: Joi.string().required(),
          mimetype: Joi.string().required(),
          buffer: Joi.string().required(),
        }).optional(),
      })
    )
    .required(),
});

const editFillDropDownQuestionOptionsSchema = Joi.object({
  questionId: Joi.string().guid().required(),
  dataToBeUpdated: Joi.array().items({
    id: Joi.string().guid().required(),
    option: Joi.string().max(225).required(),
    isCorrectOption: Joi.boolean().required(),
  }),
});

const deleteQuestionSchema = Joi.object({ questionId: Joi.string().guid().required() });

const editQuestionSchema = Joi.object({
  id: Joi.string().guid().required(),
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
  errorReportByTeacher: Joi.string().max(225),
  errorReportByReviewer: Joi.string().max(225),
  isPremium: Joi.boolean(),
  isCheckedByPricer: Joi.boolean(),
  isCheckedByTeacher: Joi.boolean(),
  isErrorByTeacher: Joi.boolean(),
  isCheckedByReviewer: Joi.boolean(),
  isErrorByReviewer: Joi.boolean(),
  includeExplanation: Joi.boolean(),
  explanation: Joi.string().max(225),
  questionIndentifier: Joi.string(),
  isShuffle: Joi.boolean(),
});

const createMatchQuestionPairsSchema = Joi.object({
  pairs: Joi.array().items({
    matchPhrase: Joi.string().required(),
    matchTarget: Joi.string().required(),
    matchPhraseContent: Joi.object({
      filename: Joi.string(),
      mimetype: Joi.string(),
      buffer: Joi.string(),
    }),
    matchTargetContent: Joi.object({
      filename: Joi.string(),
      mimetype: Joi.string(),
      buffer: Joi.string(),
    }),
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
    }),
    newMatchTargetContent: Joi.object({
      filename: Joi.string(),
      mimetype: Joi.string(),
      buffer: Joi.string(),
    }),
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
    }),
    matchTargetContent: Joi.object({
      filename: Joi.string(),
      mimetype: Joi.string(),
      buffer: Joi.string(),
    }),
  }),
});

const deleteMatchPairSchema = Joi.object({ pairId: Joi.string().uuid().required() });

const createDrawingQuestionSchema = Joi.object({
  canvasJson: Joi.string().required(),
});

const editDrawingQuestionSchema = Joi.object({
  newCanvasJson: Joi.string().required(),
});

const createLabelDragQuestionSchema = Joi.object({
  dataGeneratorJson: Joi.string().required(),
  studentJson: Joi.string().required(),
});

const editLabelDragQuestionSchema = Joi.object({
  newDataGeneratorCanvasJson: Joi.string().required(),
  newStudentCanvasJson: Joi.string().required(),
});

const createLabelFillQuestionSchema = Joi.object({
  dataGeneratorJson: Joi.string().required(),
  studentJson: Joi.string().required(),
  fillAnswer: Joi.string().required(),
  fillAnswerId: Joi.string().uuid().required(),
});

const editLabelFillQuestionSchema = Joi.object({
  newDataGeneratorJson: Joi.string().required(),
  newStudentJson: Joi.string().required(),
  newFillAnswer: Joi.string().required(),
  newFillAnswerId: Joi.string().uuid().required(),
});

const createGeogebraGraphQuestionSchema = Joi.object({
  dataGeneratorJson: Joi.string().required(),
  studentJson: Joi.string().required(),
  allowAlgebraInput: Joi.boolean().required(),
});

const editGeogebraGraphQuestionSchema = Joi.object({
  newDataGeneratorJson: Joi.string().required(),
  newStudentJson: Joi.string().required(),
  allowAlgebraInput: Joi.boolean().required(),
});

const createDesmosGraphQuestionSchema = Joi.object({
  dataGeneratorJson: Joi.string().required(),
  studentJson: Joi.string().required(),
});

const editDesmosGraphQuestionSchema = Joi.object({
  newDataGeneratorJson: Joi.string().required(),
  newStudentJson: Joi.string().required(),
});

const createHotSpotQuestionSchema = Joi.object({
  dataGeneratorJson: Joi.string().required(),
  studentJson: Joi.string().required(),
  hotSpotIds: Joi.array().items(Joi.string().uuid()),
});

const editHotSpotQuestionSchema = Joi.object({
  newDataGeneratorJson: Joi.string().required(),
  newStudentJson: Joi.string().required(),
  hotSpotIds: Joi.array().items(Joi.string().uuid()),
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
};
