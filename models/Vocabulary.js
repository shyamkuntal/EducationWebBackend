const Sequelize = require("sequelize");
const db = require("../config/database");

const Vocabulary = db.define("vocabulary", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
});

Vocabulary.sync().then(() => {
  console.log("Vocabulary Created");
});

module.exports = { Vocabulary };
