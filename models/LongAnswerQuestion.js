const Sequelize = require("sequelize");
const db = require("../config/database");
const { Question } = require("./Question");
const { QuestionSubPart } = require("./QuestionSubPart");

// Store html in question
const LongAnswerQuestion = db.define("longAnswerQuestion", {
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
});

LongAnswerQuestion.belongsTo(Question, {
  foreignKey: { name: "questionId" },
});

LongAnswerQuestion.belongsTo(QuestionSubPart, {
  foreignKey: { name: "questionSubPartId" },
});

LongAnswerQuestion.sync().then(() => {
  console.log("LongAnswerQuestion Created");
});

module.exports = { LongAnswerQuestion };
