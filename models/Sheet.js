import { Sequelize } from "sequelize";
import { db } from "../config/database.js";
import { Board, SubBoard } from "./Board.js";
import { Subject, SubjectLevel } from "./Subject.js";
import { User, Roles } from "./User.js";
import { sheetModelConstants } from "../constants/constants.js";
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

export { Sheet, SheetLog };
