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
  teacherJsonId: {
    type: Sequelize.STRING,
    // Validation for mongoDb objectId
    validate: { is: /^[a-fA-F0-9]{24}$/ },
    allowNull: false,
  },
  studentJsonId: {
    type: Sequelize.STRING,
    // Validation for mongoDb objectId
    validate: { is: /^[a-fA-F0-9]{24}$/ },
    allowNull: false,
  },
});

HotSpotQuestion.belongsTo(Question, {
  foreignKey: { name: "questionId" },
});

HotSpotQuestion.sync().then(() => {
  console.log("HotSpotQuestion Created");
});

module.exports = { HotSpotQuestion };
