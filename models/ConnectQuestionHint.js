const Sequelize = require("sequelize");
const db = require("../config/database");

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
    type: String(500),
  },
  content:{
    type:String(500),
    
  }
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
