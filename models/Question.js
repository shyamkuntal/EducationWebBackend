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
    type: String,
    allowNull: false,
  },
  question: {
    type: String(500),
    allowNull: false,
  },
  marks: {
    type: Number,
    allowNull: true,
  },
  requiredTime: {
    type: String,
    allowNull: true,
  },
  uploaderDescription: {
    type: String,
    allowNull: false,
  },
  videoLink: {
    type: String,
    allowNull: true,
  },
  pageNumber: {
    type: String,
    allowNull: true,
  },
  bookExcercise: {
    type: String,
    allowNull: true,
  },
  exampleNo: {
    type: String,
    allowNull: true,
  },
  bookExcerciseNo: {
    type: Number,
    allowNull: true,
  },
  priceForTeacher: {
    type: Number,
    allowNull: true,
  },
  priceForStudent: {
    type: Number,
    allowNull: true,
  },
  difficultyLevel: {
    type: String,
    allowNull: true,
  },
  levelTagging: {
    type: String,
    allowNull: true,
  },
  commandTerm: {
    type: String,
    allowNull: true,
  },
  errorReportByTeacher: {
    type: String,
    allowNull: true,
  },
  errorReportByReviewer: {
    type: String,
    allowNull: true,
  },
  isPremium: {
    type: Boolean,
    default: false,
    allowNull: false,
  },
  isCheckedByPricer: {
    type: Boolean,
    default: false,
    allowNull: false,
  },
  isCheckedByTeacher: {
    type: Boolean,
    default: false,
    allowNull: false,
  },
  isErrorByTeacher: {
    type: Boolean,
    default: false,
    allowNull: false,
  },
  isCheckedByReviewer: {
    type: Boolean,
    default: false,
    allowNull: false,
  },
  isErrorByReviewer: {
    type: Boolean,
    default: false,
    allowNull: false,
  },
  hasSubParts: {
    type: Boolean,
    allowNull: false,
    default: false,
  },
  questionId: {
    type: Sequelize.UUID,
    allowNull: true,
  },
  isQuestionSubPart: {
    type: Boolean,
    allowNull: false,
    default: false,
  },
});

Question.belongsTo(SheetManagement, {
  foreignKey: { name: "sheetId" },
});

Question.belongsTo(Question, {
  foreignKey: { name: "questionId" },
});

Question.sync().then(() => {
  console.log("Question Created");
});

module.exports = { Question };
