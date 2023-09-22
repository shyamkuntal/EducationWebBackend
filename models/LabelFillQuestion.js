const Sequelize = require("sequelize");
const db = require("../config/database");
const { Question } = require("./Question");

const LabelFillQuestion = db.define("labelFillQuestion", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  questionId: {
    type: Sequelize.UUID,
    allowNull: true,
  },
  dataGeneratorJson: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  studentJson: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
});

LabelFillQuestion.belongsTo(Question, {
  foreignKey: { name: "questionId" },
});

LabelFillQuestion.sync().then(() => {
  console.log("LabelFillQuestion Created");
});

module.exports = { LabelFillQuestion };
