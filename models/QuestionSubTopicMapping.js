const Sequelize = require("sequelize");
const db = require("../config/database");
const { Question } = require("./Question");
const { SubTopic } = require("./Topic");

const QuestionSubTopicMapping = db.define("questionSubTopicMapping", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  questionId: {
    type: Sequelize.UUID,
    allowNull: false
  },
  subTopicId: {
    type: Sequelize.UUID,
    allowNull: false
  },
});

QuestionSubTopicMapping.belongsTo(Question, {
  foreignKey: { name: "questionId" }
});
QuestionSubTopicMapping.belongsTo(SubTopic, {
  foreignKey: { name: "subTopicId" }
});

QuestionSubTopicMapping.sync()

module.exports = { QuestionSubTopicMapping };
