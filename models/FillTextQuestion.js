const Sequelize = require("sequelize");
const db = require("../config/database");
const { Question } = require("./Question");

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
  question: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  correctAnswer: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

FillTextQuestion.belongsTo(Question, {
  foreignKey: { name: "questionId" },
});

FillTextQuestion.sync().then(() => {
  console.log("FillTextQuestion Created");
});

module.exports = { FillTextQuestion };
