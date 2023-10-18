const Sequelize = require("sequelize");
const db = require("../config/database");
const { SheetManagement } = require("./SheetManagement");

// Store html in question field
const Question = db.define("question", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  sheetId: {
    type: Sequelize.UUID,
    allowNull: true,
  },
  questionType: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  questionId: {
    type: Sequelize.UUID,
    defaultValue: null,
  },
  questionData: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  questionDescription: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  marks: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  requiredTime: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  uploaderDescription: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  videoLink: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  pageNumber: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  bookExcercise: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  exampleNo: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  bookExcerciseNo: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  priceForTeacher: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  priceForStudent: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  difficultyLevel: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  levelTagging: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  commandTerm: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  errorReportByTeacher: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  errorReportByReviewer: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  errorReportImgByReviewer: { type: Sequelize.STRING, allowNull: true },
  errorForTopicSubTopicVocabByReviewer: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  errorImgForTopicSubTopicVocabByReviewer: { type: Sequelize.STRING, allowNull: true },
  isPremium: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  isCheckedByPricer: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  isCheckedByTeacher: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  isErrorByTeacher: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  isCheckedByReviewer: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  isErrorByReviewer: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  parentQuestionId: {
    type: Sequelize.UUID,
    allowNull: true,
  },
  hasSubPart: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  includeExplanation: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  explanation: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  questionIndentifier: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  isShuffle: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  complete: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  isCalculatorAllowed: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  subQuestionNumberingScheme: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  reviewerHighlightErrorPdf: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  reviewerHighlightErrorErrors: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
});

Question.sync().then(() => {
  console.log("Question Created");
});

Question.belongsTo(Question, {
  foreignKey: { name: "questionId" },
});

Question.belongsTo(SheetManagement, {
  foreignKey: { name: "sheetId" },
});

Question.belongsTo(Question, {
  foreignKey: { name: "parentQuestionId" },
  as: "subQuestion",
});

module.exports = { Question };
