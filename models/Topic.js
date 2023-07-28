const Sequelize = require("sequelize");
const db = require("../config/database");

const Topic = db.define("topic", {
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

Topic.sync().then(() => {
  console.log("Topic Created");
});

const SubTopic = db.define("subTopic", {
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

SubTopic.sync().then(() => {
  console.log("SubTopic Created");
});

module.exports = { Topic, SubTopic };
