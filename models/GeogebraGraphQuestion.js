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
  uploaderJson: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  studentJson: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  graphType: {
    type: Sequelize.STRING,
    allowNull: true,
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
