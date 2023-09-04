const Sequelize = require("sequelize");
const db = require("../config/database");
const { SheetManagement } = require("./SheetManagement");

const SheetManagementOthersMapping = db.define("sheetManagementOthersMapping", {
  sheetManagementId: {
    type: Sequelize.UUID,
    allowNull: false
  },
  resourceId: {
    type: Sequelize.UUID,
    allowNull: false
  },
  chapterNo: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  chapterName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  startPageNo: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  endPageNo: {
    type: Sequelize.INTEGER,
    allowNull: true
  }
});

SheetManagementOthersMapping.belongsTo(SheetManagement, {
  foreignKey: { name: "sheetManagementId" }
});

module.exports = { SheetManagementOthersMapping };
