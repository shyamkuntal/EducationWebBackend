const Sequelize = require("sequelize");
const db = require("../config/database");
const { Question } = require("./Question");

// Store html string in option
const McqQuestionOption = db.define("mcqQuestionOption", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  questionId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  option: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  isCorrectOption: {
    type: Sequelize.BOOLEAN,
    default: false,
    allowNull: false,
  },
  feedback: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  content: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  shuffleOptions: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
});

McqQuestionOption.belongsTo(Question, {
  foreignKey: { name: "questionId" },
});

McqQuestionOption.sync().then(() => {
  console.log("McqQuestion Created");
});

module.exports = { McqQuestionOption };
