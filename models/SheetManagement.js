const Sequelize = require("sequelize");
const db = require("../config/database");
const { Board, SubBoard } = require("./Board");
const { Subject, SubjectLevel } = require("./Subject");
const { Variant } = require("./Variants");
const { sheetModelConstants } = require("../constants/constants.js");
const { User } = require("./User");

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
    type: Sequelize.BOOLEAN,
    default: false,
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
    allowNull: true,
  },
  timeVariable: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  questionVideoLink: {
    type: Sequelize.STRING,
    default: false,
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
    allowNull: true,
  },
  sheetDescForUploader: {
    type: Sequelize.STRING,
    allowNull: true,
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
    type: Sequelize.STRING,
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
  errorReport: { type: Sequelize.STRING, allowNull: true },
  errorReportImg: { type: Sequelize.STRING, allowNull: true },
  reviewerCommentToSupervisor: { type: Sequelize.STRING, allowNull: true },
  supervisorCommentToReviewer: { type: Sequelize.STRING, allowNull: true },
  supervisorCommentToUploader2: { type: Sequelize.STRING, allowNull: true },
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

SheetManagement.belongsTo(SubjectLevel, {
  foreignKey: { name: "subjectLevelId" },
});

SheetManagement.belongsTo(User, {
  foreignKey: { name: "supervisorId" },
  as: "supervisor",
});

SheetManagement.belongsTo(User, {
  foreignKey: { name: "teacherId" },
  as: "teacher",
});

SheetManagement.belongsTo(User, {
  foreignKey: { name: "reviewerId" },
  as: "reviewer",
});

SheetManagement.belongsTo(User, {
  foreignKey: "assignedToUserId",
  as: "assignedToUserName",
});

User.hasMany(SheetManagement, {
  foreignKey: "assignedToUserId",
});

SheetManagement.sync().then(() => {
  console.log("SheetManagement Created");
});

const SheetManagementSpamTaskRecheckComments = db.define("SheetManagementSpamTaskRecheckComments", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  sheetManagementId: { type: Sequelize.UUID, allowNull: false },
  reviewerRecheckComment: { type: Sequelize.STRING, allowNull: true },
});

SheetManagementSpamTaskRecheckComments.sync();

SheetManagementSpamTaskRecheckComments.belongsTo(SheetManagement, {
  foreignKey: "sheetManagementId",
});

const SheetManagementTaskCheckList = db.define("SheetManagementTaskCheckList", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  sheetManagementId: {
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

SheetManagementTaskCheckList.sync();

SheetManagementTaskCheckList.belongsTo(SheetManagement, {
  foreignKey: "sheetManagementId",
});

const SheetManagementLog = db.define("SheetManagementLog", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  sheetManagementId: { type: Sequelize.UUID, allowNull: false },
  assignee: { type: Sequelize.STRING, allowNull: false },
  assignedTo: { type: Sequelize.STRING, allowNull: false },
  logMessage: { type: Sequelize.STRING, allowNull: false },
});

SheetManagementLog.sync();

SheetManagementLog.belongsTo(SheetManagement, { foreignKey: "sheetManagementId" });

module.exports = {
  SheetManagement,
  SheetManagementLog,
  SheetManagementTaskCheckList,
  SheetManagementSpamTaskRecheckComments,
};
