const Sequelize = require("sequelize");
const db = require("../config/database");
const { Question } = require("./Question");

// Store html string in question
const MatchQuestion = db.define("matchQuestion", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  questionId: {
    type: Sequelize.UUID,
    allowNull: true,
  },
  matchTarget: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  matchPhrase: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  distractor:{
    type: Sequelize.STRING,
    allowNull: true,
  },
  distractorContent:{
    type: Sequelize.STRING,
    allowNull: true,
  },
  MatchPhraseContent:{
    type: Sequelize.STRING,
    allowNull: true,
  },
  MatchTargetContent:{
    type: Sequelize.STRING,
    allowNull: true,
  },
});

MatchQuestion.belongsTo(Question, {
  foreignKey: { name: "questionId" },
});


MatchQuestion.sync().then(() => {
  console.log("MatchQuestion Created");
});

module.exports = { MatchQuestion };
