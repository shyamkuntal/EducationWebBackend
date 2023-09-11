const Sequelize = require("sequelize");
const db = require("../config/database");
const { Question } = require("./Question");

// Store html string in option
const TrueFalseQuestionOption = db.define("trueFalseQuestionOption", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  questionId: {
    type: Sequelize.UUID,
    allowNull: true,
  },
  statement: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  isCorrectOption: {
    type: Sequelize.BOOLEAN,
    default: false,
    allowNull: false,
  },
  content: {
    type: Sequelize.STRING,
    allowNull: true,
  },
});

TrueFalseQuestionOption.belongsTo(Question, {
  foreignKey: { name: "questionId" },
});

TrueFalseQuestionOption.sync().then(() => {
  console.log("TrueFalseQuestionOption Created");
});

module.exports = { TrueFalseQuestionOption };
