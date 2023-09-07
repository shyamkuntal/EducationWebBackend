const Sequelize = require("sequelize");
const db = require("../config/database");
const { Question } = require("./Question");

// Store html string in option
const FillTextDropDownOption = db.define("fillTextDropDownOption", {
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

FillTextDropDownOption.belongsTo(Question, {
  foreignKey: { name: "questionId" },
});

FillTextDropDownOption.sync().then(() => {
  console.log("FillTextDropDownQuestion Created");
});

module.exports = { FillTextDropDownOption };
