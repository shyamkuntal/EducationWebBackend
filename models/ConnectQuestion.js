const Sequelize = require("sequelize");
const db = require("../config/database");
const { Question } = require("./Question");
const { QuestionSubPart } = require("./QuestionSubPart");

// Store html string in correctAnswer
const ConnectQuestion = db.define("connectQuestion", {
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
  correctAnswer: {
    type: Sequelize.STRING,
    allowNull: true,
  },
});

ConnectQuestion.belongsTo(Question, {
  foreignKey: { name: "questionId" },
});

ConnectQuestion.belongsTo(QuestionSubPart, {
  foreignKey: { name: "questionSubPartId" },
});

ConnectQuestion.sync().then(() => {
  console.log("ConnectQuestion Created");
});

module.exports = { MatchQuestion };
