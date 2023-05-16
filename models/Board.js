// const Sequelize = require("sequelize");
// const db = require("../config/database");
import { Sequelize } from "sequelize";
import { db } from "../config/database.js";
const Board = db.define("board", {
  boardName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  boardType: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  contact: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  website: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  address: {
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

Board.sync().then(() => {
  console.log("table created");
});

const SubBoard = db.define("subBoard", {
  SubBoardName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  isArchived: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  boardId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});

SubBoard.sync().then(() => {
  console.log(" sub-board table created");
});

SubBoard.belongsTo(Board, {
  foreignKey: { name: "boardId" },
});

//SubBoard.hasMany(Subject, { foreignKey: 'subBoardId' });

export { Board, SubBoard };
