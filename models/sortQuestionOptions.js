const Sequelize = require("sequelize");
const db = require("../config/database");
const { Question } = require("./Question");

// Store html string in option
const SortQuestionOption = db.define("sortQuestionOption", {
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
  content: {
    type: Sequelize.STRING,
    allowNull: true,
  },
});

SortQuestionOption.belongsTo(Question, {
  foreignKey: { name: "questionId" },
});

SortQuestionOption.sync().then(() => {
  console.log("McqQuestion Created");
});

module.exports = { SortQuestionOption };
