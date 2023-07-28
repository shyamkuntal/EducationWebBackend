const { Topic, SubTopic } = require("../models/Topic");
const { TopicTask } = require("../models/TopicTask");
const { User } = require("../models/User");
const { Vocabulary } = require("../models/Vocabulary");

const createTopic = async ({ name }) => {
  try {
    let topic = await Topic.create({
      name,
    });

    return topic;
  } catch (err) {
    throw err;
  }
};

const createSubTopic = async ({ name }) => {
  try {
    let subtopic = await SubTopic.create({
      name,
    });

    return subtopic;
  } catch (err) {
    throw err;
  }
};

const createVocabulary = async ({ name }) => {
  try {
    let vocabulary = await Vocabulary.create({
      name,
    });

    return vocabulary;
  } catch (err) {
    throw err;
  }
};

const findAllTopics = async () => {
  try {
    let topics = await Topic.findAll();
    return topics;
  } catch (err) {
    throw err;
  }
};

const findPaperNumberSheetByPk = async (topicTaskId) => {
  try {
    let sheet = await TopicTask.findByPk(topicTaskId);

    return sheet;
  } catch (err) {
    throw err;
  }
};

const findSheetAndUser = async (topicTaskId) => {
  try {
    let findSheet = TopicTask.findOne({
      where: { id: topicTaskId },
      include: [
        {
          model: User,
          as: "supervisor",
        },
      ],
      raw: true,
      nest: true,
    });
    return findSheet;
  } catch (err) {
    throw err;
  }
};

const updateTopicTaskSheet = async (dataToBeUpdated, whereQuery) => {
  try {
    let updateStatus = await TopicTask.update(dataToBeUpdated, whereQuery);

    return updateStatus;
  } catch (err) {
    throw err;
  }
};

module.exports = { createTopic, createSubTopic, createVocabulary, findSheetAndUser, updateTopicTaskSheet, findPaperNumberSheetByPk, findAllTopics };
