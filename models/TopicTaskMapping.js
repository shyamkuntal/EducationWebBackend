const Sequelize = require("sequelize");
const db = require("../config/database");
const { Topic, SubTopic } = require("./Topic");
const { TopicTask } = require("./TopicTask");
const { Vocabulary } = require("./Vocabulary");

const TaskTopicMapping = db.define("taskTopicMapping", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  topicTaskId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  topicId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
});

TaskTopicMapping.belongsTo(TopicTask, {
  foreignKey: { name: "topicTaskId" },
});
TaskTopicMapping.belongsTo(Topic, {
  foreignKey: { name: "topicId" },
});

TaskTopicMapping.sync().then(() => {
  console.log("TaskTopic Created");
});

const TaskSubTopicMapping = db.define("taskSubTopicMapping", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  topicTaskId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  subTopicId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
});

TaskSubTopicMapping.belongsTo(TopicTask, {
  foreignKey: { name: "topicTaskId" },
});
TaskSubTopicMapping.belongsTo(SubTopic, {
  foreignKey: { name: "subTopicId" },
});

TaskSubTopicMapping.sync().then(() => {
  console.log("TaskSubTopicMapping Created");
});

const TaskVocabularyMapping = db.define("taskVocabularyMapping", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  topicTaskId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  vocabularyId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
});

TaskVocabularyMapping.belongsTo(TopicTask, {
  foreignKey: { name: "topicTaskId" },
});
TaskVocabularyMapping.belongsTo(Vocabulary, {
  foreignKey: { name: "vocabularyId" },
});

TaskVocabularyMapping.sync().then(() => {
  console.log("TaskVocabularyMapping Created");
});

module.exports = { TaskTopicMapping, TaskSubTopicMapping, TaskVocabularyMapping };
