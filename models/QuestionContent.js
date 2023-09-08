const Sequelize = require("sequelize");
const db = require("../config/database");
const { Question } = require("./Question");

const QuestionContent = db.define("questionContent", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  questionId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  title: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  description: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  content: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

QuestionContent.belongsTo(Question, {
  foreignKey: { name: "questionId" },
});

QuestionContent.sync().then(() => {
  console.log("QuestionContent Created");
});

module.exports = { QuestionContent };
