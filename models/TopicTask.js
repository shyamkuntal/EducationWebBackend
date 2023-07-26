const Sequelize = require("sequelize");
const db = require("../config/database");
const { Board, SubBoard } = require("./Board.js");
const { Subject } = require("./Subject.js");
const { User } = require("./User.js");
const CONSTANTS = require("../constants/constants");

const grades = CONSTANTS.grades;

const TopicTask = db.define("topicTask", {
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
  subjectId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  grade: {
    type: Sequelize.STRING,
    enum: grades,
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
    defaultValue: CONSTANTS.sheetModelConstants.defaultSheetLifeCycle,
  },
  supervisorId: {
    type: Sequelize.UUID,
    allowNull: true,
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

TopicTask.sync().then(() => {
  console.log("TopicTask created");
});

TopicTask.belongsTo(SubBoard, {
  foreignKey: { name: "subBoardId" },
});

TopicTask.belongsTo(Board, {
  foreignKey: { name: "boardId" },
});

TopicTask.belongsTo(Subject, {
  foreignKey: { name: "subjectId" },
});

TopicTask.belongsTo(User, {
  foreignKey: { name: "supervisorId" },
  as: "supervisor",
});

TopicTask.belongsTo(User, {
  foreignKey: { name: "dataGeneratorId" },
  as: "dataGenerator",
});

TopicTask.belongsTo(User, {
  foreignKey: { name: "reviewerId" },
  as: "reviewer",
});

module.exports = { TopicTask };
