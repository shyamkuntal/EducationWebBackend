const Sequelize = require("sequelize");
const db = require("../config/database");
const { Question } = require("./Question");
const { QuestionSubPart } = require("./QuestionSubPart");

// Store html string in option
const FillTextDropDownOption = db.define("fillTextDropDownOption", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  fillTextDropDownQuestionId: {
    type: Sequelize.UUID,
    allowNull: true,
  },
  option: {
    type: String(500),
    allowNull: true,
  },
  isCorrectOption: {
    type: Boolean,
    default: false,
    allowNull: false,
  },
});

FillTextDropDownOption.belongsTo(FillText, {
  foreignKey: { name: "fillTextDropDownQuestionId" },
});

FillTextDropDownOption.sync().then(() => {
  console.log("FillTextDropDownQuestion Created");
});

module.exports = { FillTextDropDownOption };
