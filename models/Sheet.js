import { Sequelize } from "sequelize";
import { db } from "../config/database.js";
import { Board, SubBoard } from "./Board.js";
import { Subject, SubjectLevel } from "./Subject.js";
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
    type: Sequelize.STRING,
    allowNull: false,
  },
  resources: {
    type: Sequelize.STRING,
    allowNull: false,
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

export { Sheet };
