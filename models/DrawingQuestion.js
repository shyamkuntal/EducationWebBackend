const Sequelize = require("sequelize");
const db = require("../config/database");
const { Question } = require("./Question");

// Store mongodb objectId in canvasJson
const DrawingQuestion = db.define("drawingQuestion", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  questionId: {
    type: Sequelize.UUID,
    allowNull: true,
  },
  uploaderJson: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  studentJson: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
});

DrawingQuestion.belongsTo(Question, {
  foreignKey: { name: "questionId" },
});

DrawingQuestion.sync().then(() => {
  console.log("DrawingQuestion Created");
});

module.exports = { DrawingQuestion };
