const Sequelize = require("sequelize");
const db = require("../config/database");
const { Question } = require("./Question");

const QuestionCategory = db.define("questionCategory", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  questionId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  category: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  content: {
    type: Sequelize.STRING,
    allowNull: true,
  },
});

QuestionCategory.belongsTo(Question, {
  foreignKey: { name: "questionId" },
});

QuestionCategory.sync().then(() => {
  console.log("QuestionItem Created");
});

module.exports = { QuestionCategory };
