const { Sequelize } = require("sequelize");
const db = require("../config/database");
const { Sheet } = require("./PastPaperSheet");

const PastPaper = db.define("pastPaper", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  paperNumber: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  googleLink: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  questionPdf: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  answerPdf: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  imagebanner: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  sheetId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
});

PastPaper.sync().then(() => {
  console.log("PastPaper created");
});

PastPaper.belongsTo(Sheet, {
  foreignKey: { name: "sheetId" },
});

module.exports = { PastPaper };
