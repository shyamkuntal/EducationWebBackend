const Sequelize = require("sequelize");
const db = require("../config/database");
const { Board, SubBoard } = require("./Board.js");
const { Subject, SubjectLevel } = require("./Subject.js");
const { User, Roles } = require("./User.js");
const { sheetModelConstants } = require("../constants/constants.js");
const grades = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

const PaperNumberSheet = db.define("paperNumberSheet", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  boardId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  subBoardId: {
    type: Sequelize.UUID,
    allowNull: true,
  },
  grade: {
    type: Sequelize.STRING,
    enum: grades,
    allowNull: false,
  },
  subjectId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  resources: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  lifeCycle: {
    type: Sequelize.STRING,
    defaultValue: sheetModelConstants.defaultSheetLifeCycle,
  },
  supervisorId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  dataGeneratorId: {
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
  statusForDataGenerator: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  statusForSupervisor: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  statusForReviewer: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  errorReport: { type: Sequelize.STRING, allowNull: true },
  errorReportImg: { type: Sequelize.STRING, allowNull: true },
  reviewerCommentToSupervisor: { type: Sequelize.STRING, allowNull: true },
  supervisorCommentToReviewer: { type: Sequelize.STRING, allowNull: true },
  supervisorCommentToDataGenerator: { type: Sequelize.STRING, allowNull: true },
  isSpam: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  isArchived: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  isPublished: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
});

PaperNumberSheet.sync().then(() => {
  console.log("PaperNumberSheet created");
});

PaperNumberSheet.belongsTo(Subject, {
  foreignKey: { name: "subjectId" },
});

PaperNumberSheet.belongsTo(Board, {
  foreignKey: "boardId",
});

PaperNumberSheet.belongsTo(SubBoard, {
  foreignKey: "subBoardId",
});

PaperNumberSheet.belongsTo(User, {
  foreignKey: "assignedToUserId",
  as: "assignedToUserName",
});

Subject.hasMany(PaperNumberSheet, {
  foreignKey: "subjectId",
});

User.hasMany(PaperNumberSheet, {
  foreignKey: "assignedToUserId",
});

PaperNumberSheet.belongsTo(User, {
  foreignKey: "supervisorId",
  as: "supervisor",
});

const SpamPaperNumberSheetRecheckComments = db.define("SpamPaperNumberSheetRecheckComments", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  paperNumberSheetId: { type: Sequelize.UUID, allowNull: false },
  reviewerRecheckComment: { type: Sequelize.STRING, allowNull: true },
});

SpamPaperNumberSheetRecheckComments.sync().then(() => {
  console.log("SpamPaperNumberSheetRecheckComments created");
});

SpamPaperNumberSheetRecheckComments.belongsTo(PaperNumberSheet, {
  foreignKey: "paperNumberSheetId",
});

const PaperNumberSheetCheckList = db.define("PaperNumberSheetCheckList", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  paperNumberSheetId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  label: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  isChecked: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
});

PaperNumberSheetCheckList.sync().then(() => {
  console.log("PaperNumberSheetCheckList created");
});

PaperNumberSheetCheckList.belongsTo(PaperNumberSheet, {
  foreignKey: "paperNumberSheetId",
});

const PaperNumberSheetLog = db.define("paperNumberSheetLog", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  paperNumberSheetId: { type: Sequelize.UUID, allowNull: false },
  assignee: { type: Sequelize.STRING, allowNull: false },
  assignedTo: { type: Sequelize.STRING, allowNull: false },
  logMessage: { type: Sequelize.STRING, allowNull: false },
});

PaperNumberSheetLog.sync().then(() => {
  console.log("paperNumberSheetLog created");
});
PaperNumberSheetLog.belongsTo(PaperNumberSheet, { foreignKey: "paperNumberSheetId" });

const PaperNumber = db.define("paperNumber", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  paperNumberSheetId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  paperNumber: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  errorReport: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  isError: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  isArchive: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
});

PaperNumber.sync().then(() => {
  console.log("PaperNumber created");
});

PaperNumber.belongsTo(PaperNumberSheet, {
  foreignKey: "paperNumberSheetId",
});

module.exports = {
  PaperNumberSheet,
  PaperNumberSheetLog,
  SpamPaperNumberSheetRecheckComments,
  PaperNumberSheetCheckList,
  PaperNumber,
};
