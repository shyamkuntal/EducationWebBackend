const Sequelize = require("sequelize");
const db = require("../config/database");
const { Board, SubBoard } = require("./Board.js");
const grades = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

const Subject = db.define("subject", {
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
  subjectNameId: {
    type: Sequelize.UUID,
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
  console.log("subject created");
});

Subject.belongsTo(SubBoard, {
  foreignKey: { name: "subBoardId" },
});

Subject.belongsTo(Board, {
  foreignKey: { name: "boardId" },
});

const SubjectLevel = db.define("subjectLevel", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  subjectLevelName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  isArchived: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  subjectId: {
    type: Sequelize.UUID,
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

const subjectName = db.define("subjectName", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  subjectName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  subjectImage: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

Subject.belongsTo(subjectName, { foreignKey: "subjectNameId" });

subjectName.sync().then(() => {
  console.log("subjectName created");
});

module.exports = { Subject, SubjectLevel, subjectName };
