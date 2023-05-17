import { Sequelize } from "sequelize";
import { db } from "../config/database.js";
import { Board, SubBoard } from "./Board.js";
import { Subject, SubjectLevel } from "./Subject.js";
import { User, Roles } from "./User.js";
import { sheetModelConstants } from "../constants/constants.js";
const grades = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

const Sheet = db.define("sheet", {
  boardId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  SubBoardId: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  grade: {
    type: Sequelize.STRING,
    enum: grades,
    allowNull: false,
  },
  subjectId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  subjectLevelId: {
    type: Sequelize.INTEGER,
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
    type: Sequelize.STRING,
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
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  assignedToUserId: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
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
  as: "assignedTo",
});
Sheet.belongsTo(User, {
  foreignKey: "supervisorId",
  as: "supervisor",
});

const SheetStatus = db.define("sheetStatus", {
  sheetId: { type: Sequelize.INTEGER, allowNull: false },
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
});

SheetStatus.sync().then(() => {
  console.log("sheetStatus created");
});

const SheetLog = db.define("sheetLog", {
  sheetId: { type: Sequelize.INTEGER, allowNull: false },
  assignee: { type: Sequelize.STRING, allowNull: false },
  assignedTo: { type: Sequelize.STRING, allowNull: false },
  logMessage: { type: Sequelize.STRING, allowNull: false },
});

SheetLog.sync().then(() => {
  console.log("sheetLog created");
});

export { Sheet, SheetStatus, SheetLog };
