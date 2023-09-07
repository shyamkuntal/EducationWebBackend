const Sequelize = require("sequelize");
const db = require("../config/database");
const { Question } = require("./Question");

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
  questionData: {
    type: Sequelize.STRING,
    allowNull: true,
  },
});

LongAnswerQuestion.belongsTo(Question, {
  foreignKey: { name: "questionId" },
});

LongAnswerQuestion.sync().then(() => {
  console.log("LongAnswerQuestion Created");
});

module.exports = { LongAnswerQuestion };
