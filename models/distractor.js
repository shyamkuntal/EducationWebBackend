const Sequelize = require("sequelize");
const db = require("../config/database");
const { Question } = require("./Question");
const {QuestionContent} = require("./QuestionContent")

const QuestionDistractor = db.define("questionContent", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  questionId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  distractor: {
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
  console.log("QuestionDistractor Created");
});

module.exports = { QuestionDistractor };
