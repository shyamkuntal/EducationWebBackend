const Sequelize = require("sequelize");
const db = require("../config/database");
const { Question } = require("./Question");

const GeogebraGraphQuestion = db.define("GeogebraGraphQuestion", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  questionId: {
    type: Sequelize.UUID,
    allowNull: true,
  },
  dataGeneratorData: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  studentData: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  allowAlgebraInput: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
});

GeogebraGraphQuestion.belongsTo(Question, {
  foreignKey: { name: "questionId" },
});

GeogebraGraphQuestion.sync().then(() => {
  console.log("GeogebraGraphQuestion Created");
});

module.exports = { GeogebraGraphQuestion };
