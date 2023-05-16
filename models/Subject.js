import { Sequelize } from "sequelize";
import { db } from "../config/database.js";
import { Board, SubBoard } from "./Board.js";
const grades = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

const Subject = db.define("subject", {
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
  subjectName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  subjectImage: {
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

Subject.sync().then(() => {
  console.log("table created");
});

Subject.belongsTo(SubBoard, {
  foreignKey: { name: "SubBoardId" },
});

Subject.belongsTo(Board, {
  foreignKey: { name: "boardId" },
});

const SubjectLevel = db.define("subjectLevel", {
  subjectLevelName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  isArchived: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  subjectId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});

SubjectLevel.sync().then(() => {
  console.log("subject level created");
});

SubjectLevel.belongsTo(Subject, {
  foreignKey: { name: "subjectId" },
});

Subject.hasMany(SubjectLevel, {
  foreignKey: "subjectId",
});

export { Subject, SubjectLevel };
