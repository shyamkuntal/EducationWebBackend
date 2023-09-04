const Sequelize = require("sequelize");
const db = require("../config/database");
const { Board, SubBoard } = require("./Board");
const { Subject } = require("./Subject");
const { Variant } = require("./Variants");

const SheetManagement = db.define("sheetManagement", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  sheetType: {
    type: Sequelize.STRING,
    allowNull: false
  },
  board: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  subBoard: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  grade: {
    type: Sequelize.STRING,
    allowNull: false
  },
  subject: {
    type: Sequelize.UUID,
    allowNull: false
  },
  levels: {
    type: Sequelize.STRING,
    allowNull: false
  },
  mypMarkingScheme: {
    type: Sequelize.STRING,
    allowNull: false
  },
  answerType: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  pricingSchForStudents: {
    type: Sequelize.STRING,
    allowNull: true
  },
  pricingSchForTeachers: {
    type: Sequelize.STRING,
    allowNull: true
  },
  numberOfQuestion: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  timeVariable: {
    type: Sequelize.STRING,
    allowNull: false
  },
  questionVedioLink: {
    type: Sequelize.STRING,
    allowNull: false
  },
  resources: {
    type: Sequelize.STRING,
    allowNull: true
  },
  isMCQQuestion: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  },
  sheetHintForUploader: {
    type: Sequelize.STRING,
    allowNull: false
  },
  sheetDescForUploader: {
    type: Sequelize.STRING,
    allowNull: false
  },
  isMultiplePaperNo: {
    type: Sequelize.BOOLEAN,
    allowNull: true
  },
  year: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  season: {
    type: Sequelize.STRING,
    allowNull: true
  },
  variantId: {
    type: Sequelize.UUID,
    allowNull: true
  },
  month: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  school: {
    type: Sequelize.STRING,
    allowNull: true
  },
  testType: {
    type: Sequelize.STRING,
    allowNull: true
  },
  batchHint: {
    type: Sequelize.INTEGER,
    allowNull: true
  }
});

SheetManagement.belongsTo(Board, {
  foreignKey: { name: "board" }
});

SheetManagement.belongsTo(SubBoard, {
  foreignKey: { name: "subBoard" }
});

SheetManagement.belongsTo(Subject, {
  foreignKey: { name: "subject" }
});

SheetManagement.belongsTo(Variant, {
  foreignKey: { name: "variantId" }
});

SheetManagement.sync().then(() => {
  console.log("SheetManagement Created")
});

module.exports = { SheetManagement };
