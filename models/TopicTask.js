const Sequelize = require("sequelize");
const db = require("../config/database");
const { Board, SubBoard } = require("./Board.js");
const { Subject } = require("./Subject.js");
const { User } = require("./User.js");

const grades = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

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
  dataGeneratorId: {
    type: Sequelize.UUID,
    allowNull: true,
  },
  reviewerId: {
    type: Sequelize.UUID,
    allowNull: true,
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
  foreignKey: { name: "dataGeneratorId" },
  as: "dataGenerator",
});

TopicTask.belongsTo(User, {
  foreignKey: { name: "reviewerId" },
  as: "reviewer",
});

module.exports = { TopicTask };
