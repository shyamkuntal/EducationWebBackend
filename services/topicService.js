const { Op } = require("sequelize");
const { Topic, SubTopic } = require("../models/Topic");
const { TopicTask } = require("../models/TopicTask");
const { User } = require("../models/User");
const { Vocabulary } = require("../models/Vocabulary");

const createTopic = async ({ name }) => {
  console.log("shyam -------", name)
  try {
    let topic = await Topic.create({
      name,
    });

    return topic;
  } catch (err) {
    throw err;
  }
};

const createSubTopic = async (name) => {
  try {
    let subtopic = await SubTopic.create({
      name,
    });

    return subtopic;
  } catch (err) {
    throw err;
  }
};

const createVocabulary = async (name) => {
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

const checkTopicDuplicateName = async (name) => {
  try {
    const topic = await Topic.findOne({ 
      // name: { $regex: new RegExp(`^${name}$`, 'i') } 
      where: {
        name: {
          [Op.iLike]: name 
        }
      },
      raw: true
    }); // Case-insensitive search
    return topic;
  } catch (error) {
    throw error;
  }
}

const checkSubTopicDuplicateName = async (name) => {
  try {
    const subTopic = await SubTopic.findOne({
      where: {
        name: {
          [Op.iLike]: name 
        }
      },
      raw: true
    });
    return subTopic;
  } catch (error) {
    throw error;
  }
}

const checkVocabDuplicateName = async (name) => {
  try {
    const vocab = await Vocabulary.findOne({
      where: {
        name: {
          [Op.iLike]: name
        }
      },
      raw: true
    });
    return vocab;
  } catch (error) {
    throw error;
  }
}

module.exports = { createTopic, createSubTopic, createVocabulary, findSheetAndUser, updateTopicTaskSheet, findPaperNumberSheetByPk, findAllTopics, checkTopicDuplicateName, checkSubTopicDuplicateName, checkVocabDuplicateName };
