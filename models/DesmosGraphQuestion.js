const Sequelize = require("sequelize");
const db = require("../config/database");
const { Question } = require("./Question");

const DesmosGraphQuestion = db.define("DesmosGraphQuestion", {
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

DesmosGraphQuestion.belongsTo(Question, {
  foreignKey: { name: "questionId" },
});

DesmosGraphQuestion.sync().then(() => {
  console.log("DesmosGraphQuestion Created");
});

module.exports = { DesmosGraphQuestion };
