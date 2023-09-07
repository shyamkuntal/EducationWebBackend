const Sequelize = require("sequelize");
const db = require("../config/database");
const { Question } = require("./Question");
const { QuestionSubPart } = require("./QuestionSubPart");

// Store html string in option
const TrueFalseQuestionOption = db.define("trueFalseQuestionOption", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  questionId: {
    type: Sequelize.UUID,
    allowNull: true,
  },
  questionSubPartId: {
    type: Sequelize.UUID,
    allowNull: true,
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
});

TrueFalseQuestionOption.belongsTo(Question, {
  foreignKey: { name: "questionId" },
});

TrueFalseQuestionOption.belongsTo(QuestionSubPart, {
  foreignKey: { name: "questionSubPartId" },
});

TrueFalseQuestionOption.sync().then(() => {
  console.log("TrueFalseQuestionOption Created");
});

module.exports = { TrueFalseQuestionOption };
