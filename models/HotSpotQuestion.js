const Sequelize = require("sequelize");
const db = require("../config/database");
const { Question } = require("./Question");
const { QuestionSubPart } = require("./QuestionSubPart");

// Store mongodb objectId in canvasJson
const HotSpotQuestion = db.define("HotSpotQuestion", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  questionId: {
    type: Sequelize.UUID,
    allowNull: true,
  },
  questionSubPartId: {
    type: Sequelize.UUID,
    allowNull: true,
  },
  canvasJson: {
    type: String,
    // Validation for mongoDb objectId
    validate: { is: /^[a-fA-F0-9]{24}$/ },
    allowNull: false,
  },
});

HotSpotQuestion.belongsTo(Question, {
  foreignKey: { name: "questionId" },
});

HotSpotQuestion.belongsTo(QuestionSubPart, {
  foreignKey: { name: "questionSubPartId" },
});

HotSpotQuestion.sync().then(() => {
  console.log("HotSpotQuestion Created");
});

module.exports = { HotSpotQuestion };
