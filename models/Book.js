const Sequelize = require("sequelize");
const db = require("../config/database");

const Book = db.define("book", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  subTitle: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  author: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  publisher: {
    type: Sequelize.STRING,
    allowNull: true,
  }
});

Book.sync()

const Chapter = db.define("chapter", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  chapterNumber: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

Chapter.sync()

module.exports = { Book, Chapter };
