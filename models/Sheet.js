const Sequelize = require("sequelize");
const db = require("../config/database");
const { Board, SubBoard } = require("./Board.js");
const { Subject, SubjectLevel } = require("./Subject.js");
const { User, Roles } = require("./User.js");
const { sheetModelConstants } = require("../constants/constants.js");
const grades = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

const Sheet = db.define("sheet", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  boardId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  SubBoardId: {
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
  subjectLevelId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  year: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  season: { type: Sequelize.STRING, allowNull: false },

  varient: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  paperNumber: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  resources: {
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
  pastPaperId: {
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
  statusForPastPaper: {
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
  supervisorCommentToPastPaper: { type: Sequelize.STRING, allowNull: true },
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

Sheet.sync().then(() => {
  console.log("sheet created");
});

Sheet.belongsTo(SubjectLevel, {
  foreignKey: { name: "subjectLevelId" },
});

Sheet.belongsTo(Subject, {
  foreignKey: { name: "subjectId" },
});

Sheet.belongsTo(Board, {
  foreignKey: "boardId",
});

Sheet.belongsTo(SubBoard, {
  foreignKey: "SubBoardId",
});

Sheet.belongsTo(User, {
  foreignKey: "assignedToUserId",
});
User.hasMany(Sheet, {
  foreignKey: "assignedToUserId",
});
Sheet.belongsTo(User, {
  foreignKey: "supervisorId",
  as: "supervisor",
});

const SpamSheetRecheckComments = db.define("SpamSheetRecheckComments", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  sheetId: { type: Sequelize.UUID, allowNull: false },
  reviewerRecheckComment: { type: Sequelize.STRING, allowNull: true },
});

SpamSheetRecheckComments.sync().then(() => {
  console.log("SpamSheetRecheckComments created");
});

SpamSheetRecheckComments.belongsTo(Sheet, {
  foreignKey: "sheetId",
});

SheetCheckList = db.define("SheetCheckList", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  sheetId: {
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
SheetCheckList.sync().then(() => {
  console.log("SpamSheetRecheckComments created");
});

SheetCheckList.belongsTo(Sheet, {
  foreignKey: "sheetId",
});

const SheetLog = db.define("sheetLog", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  sheetId: { type: Sequelize.UUID, allowNull: false },
  assignee: { type: Sequelize.STRING, allowNull: false },
  assignedTo: { type: Sequelize.STRING, allowNull: false },
  logMessage: { type: Sequelize.STRING, allowNull: false },
});

SheetLog.sync().then(() => {
  console.log("sheetLog created");
});
SheetLog.belongsTo(Sheet, { foreignKey: "sheetId" });

module.exports = { Sheet, SheetLog, SpamSheetRecheckComments, SheetCheckList };
