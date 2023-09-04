const Sequelize = require("sequelize");
const db = require("../config/database");
const { Book } = require("./Book");
const { SheetManagement } = require("./SheetManagement");

const SheetManagementBookMapping = db.define("sheetManagementBookMapping", {
  sheetManagementId: {
    type: Sequelize.UUID,
    allowNull: false
  },
  bookId: {
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

SheetManagementBookMapping.belongsTo(Book, {
  foreignKey: { name: "bookId" }
});

SheetManagementBookMapping.belongsTo(SheetManagement, {
  foreignKey: { name: "sheetManagementId" }
});

SheetManagementBookMapping.sync().then(() => {
  console.log("SheetManagementBookMapping Created");
});

module.exports = { SheetManagementBookMapping };
