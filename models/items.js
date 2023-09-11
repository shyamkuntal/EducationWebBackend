const Sequelize = require("sequelize");
const db = require("../config/database");
const { Question } = require("./Question");

const QuestionItem = db.define("questionItem", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  questionId: {
    type: Sequelize.UUID,
    allowNull: true,
  },
  categoryId: {
    type: Sequelize.UUID,
    allowNull: true,
  },
  item: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  content: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

QuestionItem.belongsTo(Question, {
  foreignKey: { name: "questionId" },
});

QuestionItem.sync().then(() => {
  console.log("QuestionItem Created");
});

module.exports = { QuestionItem };
