const Sequelize = require("sequelize");
const db = require("../../config/database");
const { Board, SubBoard } = require("../Board");
const { Subject, SubjectLevel } = require("../Subject.js");
const { User, Roles } = require("../User.js");
const { sheetModelConstants } = require("../../constants/constants.js");
const grades = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

const BookTask = db.define("bookTask", {
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

BookTask.sync();

BookTask.belongsTo(Subject, {
  foreignKey: { name: "subjectId" },
});

BookTask.belongsTo(Board, {
  foreignKey: "boardId",
});

BookTask.belongsTo(SubBoard, {
  foreignKey: "subBoardId",
});

BookTask.belongsTo(User, {
  foreignKey: { name: "supervisorId" },
  as: "supervisor",
});

BookTask.belongsTo(User, {
  foreignKey: { name: "dataGeneratorId" },
  as: "dataGenerator",
});

BookTask.belongsTo(User, {
  foreignKey: { name: "reviewerId" },
  as: "reviewer",
});

BookTask.belongsTo(User, {
  foreignKey: "assignedToUserId",
  as: "assignedToUserName",
});

User.hasMany(BookTask, {
  foreignKey: "assignedToUserId",
});

const SpamBookTaskRecheckComments = db.define("SpamBookTaskRecheckComments", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  bookTaskId: { type: Sequelize.UUID, allowNull: false },
  reviewerRecheckComment: { type: Sequelize.STRING, allowNull: true },
});

SpamBookTaskRecheckComments.sync();

SpamBookTaskRecheckComments.belongsTo(BookTask, {
  foreignKey: "bookTaskId",
});

const BookTaskCheckList = db.define("BookTaskCheckList", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  bookTaskId: {
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

BookTaskCheckList.sync();

BookTaskCheckList.belongsTo(BookTask, {
  foreignKey: "bookTaskId",
});

const BookTaskLog = db.define("BookTaskLog", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  bookTaskId: { type: Sequelize.UUID, allowNull: false },
  assignee: { type: Sequelize.STRING, allowNull: false },
  assignedTo: { type: Sequelize.STRING, allowNull: false },
  logMessage: { type: Sequelize.STRING, allowNull: false },
});

BookTaskLog.sync();

BookTaskLog.belongsTo(BookTask, { foreignKey: "bookTaskId" });

module.exports = {
  BookTask,
  BookTaskLog,
  SpamBookTaskRecheckComments,
  BookTaskCheckList,
};
