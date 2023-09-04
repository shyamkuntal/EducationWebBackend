const Sequelize = require("sequelize");
const db = require("../config/database");
const { SheetManagement } = require("./SheetManagement");
const { PaperNumber } = require("./PaperNumberSheet");

const SheetManagementPaperNoMapping = db.define("sheetManagementPaperNoMapping", {
  sheetManagementId: {
    type: Sequelize.UUID,
    allowNull: false
  },
  paperNoId: {
    type: Sequelize.UUID,
    allowNull: false
  },
});

SheetManagementPaperNoMapping.belongsTo(SheetManagement, {
  foreignKey: { name: "sheetManagementId" }
});

SheetManagementPaperNoMapping.belongsTo(PaperNumber, {
  foreignKey: { name: "paperNoId" }
});

SheetManagementPaperNoMapping.sync().then(() => {
  console.log("SheetManagementPaperNoMapping Created");
});

module.exports = { SheetManagementPaperNoMapping };
