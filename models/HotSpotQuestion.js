const Sequelize = require("sequelize");
const db = require("../config/database");
const { Question } = require("./Question");

// Store mongodb objectId in canvasJson
const HotSpotQuestion = db.define("hotSpotQuestion", {
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
  hostSpotIds: { type: Sequelize.ARRAY(Sequelize.STRING) },
});

HotSpotQuestion.belongsTo(Question, {
  foreignKey: { name: "questionId" },
});

HotSpotQuestion.sync().then(() => {
  console.log("HotSpotQuestion Created");
});

module.exports = { HotSpotQuestion };
