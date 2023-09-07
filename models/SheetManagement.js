const Sequelize = require("sequelize");
const db = require("../config/database");
const { Board, SubBoard } = require("./Board");
const { Subject } = require("./Subject");
const { Variant } = require("./Variants");
const { sheetModelConstants } = require("../constants/constants.js");

const SheetManagement = db.define("sheetManagement", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  sheetType: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  boardId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  subBoardId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  grade: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  subjectId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  subjectLevelId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  mypMarkingScheme: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  answerType: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  pricingSchForStudents: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  pricingSchForTeachers: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  numberOfQuestion: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  timeVariable: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  questionVedioLink: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  resources: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  isMCQQuestion: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },
  sheetHintForUploader: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  sheetDescForUploader: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  isMultiplePaperNo: {
    type: Sequelize.BOOLEAN,
    allowNull: true,
  },
  year: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  season: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  variantId: {
    type: Sequelize.UUID,
    allowNull: true,
  },
  school: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  testType: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  batchHint: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  publishTo: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  assignOn: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  lifeCycle: {
    type: Sequelize.STRING,
    defaultValue: sheetModelConstants.defaultSheetLifeCycle,
  },
  supervisorId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  uploader2Id: {
    type: Sequelize.UUID,
    allowNull: true,
  },
  teacherId: {
    type: Sequelize.UUID,
    allowNull: true,
  },
  reviewerId: {
    type: Sequelize.UUID,
    allowNull: true,
  },
  assignedToUserId: {
    type: Sequelize.UUID,
    allowNull: true,
  },
  statusForSupervisor: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  statusForUploader: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  statusForReviewer: {
    type: Sequelize.STRING,
    allowNull: true,
  },
});

SheetManagement.belongsTo(Board, {
  foreignKey: { name: "boardId" },
});

SheetManagement.belongsTo(SubBoard, {
  foreignKey: { name: "subBoardId" },
});

SheetManagement.belongsTo(Subject, {
  foreignKey: { name: "subjectId" },
});

SheetManagement.belongsTo(Variant, {
  foreignKey: { name: "variantId" },
});

SheetManagement.sync().then(() => {
  console.log("SheetManagement Created");
});

module.exports = { SheetManagement };
