const Sequelize = require("sequelize");
const db = require("../../config/database");
const { Book, Chapter } = require("./Book");
const { BookTask } = require("./BookTask");
const constants = require("../../constants/constants");

const TaskBookMapping = db.define("taskBookMapping", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  bookTaskId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  bookId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  errorReport: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  isError: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  isArchived: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  bookStatusForDataGenerator: {
    type: Sequelize.STRING,
    defaultValue: constants.sheetStatuses.NotStarted,
  },
  bookStatusForReviewer: {
    type: Sequelize.STRING,
    defaultValue: constants.sheetStatuses.NotStarted,
  },
});

TaskBookMapping.belongsTo(BookTask, {
  foreignKey: { name: "bookTaskId" },
});

TaskBookMapping.belongsTo(Book, {
  foreignKey: { name: "bookId" },
});

TaskBookMapping.sync()

const TaskBookChapterMapping = db.define("taskBookChapterMapping", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  bookTaskId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  bookId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  chapterId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  errorReport: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  isError: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  isArchived: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
});

TaskBookChapterMapping.belongsTo(BookTask, {
  foreignKey: { name: "bookTaskId" },
});
TaskBookChapterMapping.belongsTo(Book, {
  foreignKey: { name: "bookId" },
});
TaskBookChapterMapping.belongsTo(Chapter, {
  foreignKey: { name: "chapterId" },
});

TaskBookChapterMapping.sync()

module.exports = { TaskBookMapping, TaskBookChapterMapping };
