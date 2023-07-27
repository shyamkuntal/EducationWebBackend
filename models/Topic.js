const Sequelize = require("sequelize");
const db = require("../config/database");
const { Vocabulary } = require("./Vocabulary");

const grades = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

const Topic = db.define("topic", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  errorReport: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  isError: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  isArchived: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
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
  },
  errorReport: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  isError: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  isArchived: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
});

SubTopic.sync().then(() => {
  console.log("SubTopic Created");
});

const SubTopicMapping = db.define("subTopicMapping", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  topicId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  subTopicId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
});

SubTopicMapping.belongsTo(Topic, {
  foreignKey: { name: "topicId" }
});

SubTopicMapping.belongsTo(SubTopic, {
  foreignKey: { name: "subTopicId" }
});

SubTopicMapping.sync().then(() => {
  console.log("SubTopicMapping Created");
});

const VocabularyMapping = db.define("vocabularyMapping", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  topicId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  vocabularyId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
});

VocabularyMapping.belongsTo(Topic, {
  foreignKey: { name: "topicId" }
});

VocabularyMapping.belongsTo(Vocabulary, {
  foreignKey: { name: "vocabularyId" }
});

VocabularyMapping.sync().then(() => {
  console.log("VocabularyMapping Created");
});

module.exports = { Topic, SubTopic, SubTopicMapping, VocabularyMapping };
