const Sequelize = require("sequelize");
const db = require("../config/database");
const { Question } = require("./Question");

const Accordian = db.define("accordianItem", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  questionId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  title: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  content: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
});

Accordian.belongsTo(Question, {
  foreignKey: { name: "accordian" },
});

Accordian.sync().then(() => {
  console.log("accordian Created");
});

module.exports = { Accordian };
