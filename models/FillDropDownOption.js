const Sequelize = require("sequelize");
const db = require("../config/database");
const { Question } = require("./Question");

// Store html string in option
const FillDropDownOption = db.define("FillDropDownOption", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  questionId: {
    type: Sequelize.UUID,
    allowNull: true,
  },
  option: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  isCorrectOption: {
    type: Sequelize.BOOLEAN,
    default: false,
    allowNull: false,
  },
});

FillDropDownOption.belongsTo(Question, {
  foreignKey: { name: "questionId" },
});

FillDropDownOption.sync().then(() => {
  console.log("FillTextDropDownQuestion Created");
});

module.exports = { FillDropDownOption };
