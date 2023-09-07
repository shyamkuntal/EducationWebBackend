const Sequelize = require("sequelize");
const db = require("../config/database");
const { Question } = require("./Question");

// Store html string in correctAnswer
const ConnectQuestionHint = db.define("connectQuestionHint", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  questionId: {
    type: Sequelize.UUID,
    allowNull: true,
  },
  hint: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  content: {
    type: Sequelize.STRING,
    allowNull: true,
  },
});

ConnectQuestionHint.belongsTo(Question, {
  foreignKey: { name: "questionId" },
});

ConnectQuestionHint.sync().then(() => {
  console.log("ConnectQuestion Created");
});

module.exports = { MatchQuestion };
