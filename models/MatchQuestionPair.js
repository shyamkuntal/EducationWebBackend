const Sequelize = require("sequelize");
const db = require("../config/database");
const { Question } = require("./Question");

// Store html string in question
const MatchQuestionPair = db.define("matchQuestionPair", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  questionId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  matchTarget: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  matchPhrase: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  matchPhraseContent: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  matchTargetContent: {
    type: Sequelize.STRING,
    allowNull: true,
  },
});

MatchQuestionPair.belongsTo(Question, {
  foreignKey: { name: "questionId" },
});

MatchQuestionPair.sync().then(() => {
  console.log("MatchQuestionPair Created");
});

module.exports = { MatchQuestionPair };
