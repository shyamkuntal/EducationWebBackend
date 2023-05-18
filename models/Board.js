const Sequelize = require("sequelize");
const db = require("../config/database");

const Board = db.define("board", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
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
  console.log("Board created");
});

const SubBoard = db.define("subBoard", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  SubBoardName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  isArchived: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  boardId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
});

SubBoard.sync().then(() => {
  console.log("sub-board created");
});

SubBoard.belongsTo(Board, {
  foreignKey: { name: "boardId" },
});

//SubBoard.hasMany(Subject, { foreignKey: 'subBoardId' });

module.exports = { Board, SubBoard };
