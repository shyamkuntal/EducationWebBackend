const Sequelize = require("sequelize");
const db = require("../config/database");

const Variant = db.define("variant", {
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

Variant.sync().then(() => {
  console.log("Varaints Created");
});

module.exports = { Variant };
