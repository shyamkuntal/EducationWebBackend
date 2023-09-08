const Sequelize = require("sequelize");
const db = require("../config/database");
const { Question } = require("./Question");

// Store html string in option
const FillTextAnswer = db.define("fillTextAnswer", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  questionId: {
    type: Sequelize.UUID,
    allowNull: true,
  },
  answerContent: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

FillTextAnswer.belongsTo(Question, {
  foreignKey: { name: "questionId" },
});

FillTextAnswer.sync().then(() => {
  console.log("FillTextAnswer Created");
});

module.exports = { FillDropDownOption };
