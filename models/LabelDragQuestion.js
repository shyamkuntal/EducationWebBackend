const Sequelize = require("sequelize");
const db = require("../config/database");
const { Question } = require("./Question");

// Store mongodb objectId in canvasJson
const LabelDragQuestion = db.define("labelDragQuestion", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  questionId: {
    type: Sequelize.UUID,
    allowNull: true,
  },
  DataGeneratorJson: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  studentJson: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
});

LabelDragQuestion.belongsTo(Question, {
  foreignKey: { name: "questionId" },
});

LabelDragQuestion.sync().then(() => {
  console.log("LabelDragQuestion Created");
});

module.exports = { LabelDragQuestion };
