const Sequelize = require("sequelize");
const db = require("../config/database");
const { Question } = require("./Question");
const { Vocabulary } = require("./Vocabulary");

const QuestionVocabMapping = db.define("questionVocabMapping", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  questionId: {
    type: Sequelize.UUID,
    allowNull: false
  },
  vocabId: {
    type: Sequelize.UUID,
    allowNull: false
  },
});

QuestionVocabMapping.belongsTo(Question, {
  foreignKey: { name: "questionId" }
});

QuestionVocabMapping.belongsTo(Vocabulary, {
  foreignKey: { name: "vocabId" }
});

QuestionVocabMapping.sync()

module.exports = { QuestionVocabMapping };
