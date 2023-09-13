const Sequelize = require("sequelize");
const db = require("../config/database");
const { Question } = require("./Question");

const TableQuestion= db.define("tableQuestion", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  questionId: {
    type: Sequelize.UUID,
    allowNull: true,
  },
  tableData: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  allowPrefilledText: {
    type: Sequelize.BOOLEAN,
    default: false,
  },
  autoPlot: {
    type: Sequelize.BOOLEAN,
    default: false,
  },
  content: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

TableQuestion.belongsTo(Question, {
  foreignKey: { name: "questionId" },
});

TableQuestion.sync().then(() => {
  console.log("TableQuestion Created");
});

module.exports = { TableQuestion };
