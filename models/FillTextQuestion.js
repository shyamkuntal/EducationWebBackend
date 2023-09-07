const Sequelize = require("sequelize");
const db = require("../config/database");
const { Question } = require("./Question");
const { QuestionSubPart } = require("./QuestionSubPart");

// Store html string in question
const FillTextQuestion = db.define("fillTextQuestion", {
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
  correctAnswer: {
    type: String,
    allowNull: false,
  },
});

FillTextQuestion.belongsTo(Question, {
  foreignKey: { name: "questionId" },
});

FillTextQuestion.belongsTo(QuestionSubPart, {
  foreignKey: { name: "questionSubPartId" },
});

FillTextQuestion.sync().then(() => {
  console.log("FillTextQuestion Created");
});

module.exports = { FillTextQuestion };
