const Sequelize = require("sequelize");
const db = require("../config/database");
const { Question } = require("./Question");
const { Topic } = require("./Topic");

const QuestionTopicMapping = db.define("questionTopicMapping", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  questionId: {
    type: Sequelize.UUID,
    allowNull: false
  },
  topicId: {
    type: Sequelize.UUID,
    allowNull: false
  },
});

QuestionTopicMapping.belongsTo(Question, {
  foreignKey: { name: "questionId" }
});
QuestionTopicMapping.belongsTo(Topic, {
  foreignKey: { name: "topicId" }
});

QuestionTopicMapping.sync()

module.exports = { QuestionTopicMapping };
