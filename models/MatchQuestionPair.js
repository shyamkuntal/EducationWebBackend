const Sequelize = require("sequelize");
const db = require("../config/database");
const { MatchQuestion } = require("./MatchQuestion");
const { Question } = require("./Question");

// Store html string in option
const MatchQuestionPair = db.define("matchQuestionPair", {
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
    type: Sequelize.BOOLEAN,
    default: false,
    allowNull: false,
  },
});

MatchQuestionPair.belongsTo(Question, {
  foreignKey: { name: "questionId" },
});

MatchQuestionPair.sync().then(() => {
  console.log("McqQuestion Created");
});

module.exports = { MatchQuestionPair };
