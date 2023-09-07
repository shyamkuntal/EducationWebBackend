const Sequelize = require("sequelize");
const db = require("../config/database");
const { Question } = require("./Question");
const { QuestionSubPart } = require("./QuestionSubPart");

// Store html string in option
const McqQuestionOption = db.define("mcqQuestionOption", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  questionId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  option: {
    type: String(500),
    allowNull: true,
  },
  isCorrectOption: {
    type: Boolean,
    default: false,
    allowNull: false,
  },
  content: {
    type: String(500),
    allowNull: true,
  },
});

McqQuestionOption.belongsTo(Question, {
  foreignKey: { name: "questionId" },
});

McqQuestionOption.belongsTo(QuestionSubPart, {
  foreignKey: { name: "questionSubPartId" },
});

McqQuestionOption.sync().then(() => {
  console.log("McqQuestion Created");
});

module.exports = { McqQuestionOption };
