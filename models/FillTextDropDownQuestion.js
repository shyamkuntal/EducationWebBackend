const Sequelize = require("sequelize");
const db = require("../config/database");
const { Question } = require("./Question");
const { QuestionSubPart } = require("./QuestionSubPart");

// Store html string in question
const FillTextDropDownQuestion = db.define("fillTextDropDownQuestion", {
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
  question: {
    type: String(500),
    allowNull: true,
  },
  isCorrectOption: {
    type: Boolean,
    default: false,
    allowNull: false,
  },
});

FillTextDropDownQuestion.belongsTo(Question, {
  foreignKey: { name: "questionId" },
});

FillTextDropDownQuestion.belongsTo(QuestionSubPart, {
  foreignKey: { name: "questionSubPartId" },
});

FillTextDropDownQuestion.sync().then(() => {
  console.log("FillTextDropDownQuestion Created");
});

module.exports = { FillTextDropDownQuestion };
