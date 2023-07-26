const { Op, Sequelize, where } = require("sequelize");
const { TopicTask } = require("../models/TopicTask");
const httpStatus = require("http-status");
const { ApiError } = require("../middlewares/apiError.js");
const { Topic, SubTopic } = require("../models/Topic");
const { Vocabulary } = require("../models/Vocabulary");

const createTopicTask = async ({
  boardId,
  subBoardId,
  grade,
  subjectId,
  resources,
  description,
  supervisorId,
}) => {
  try {
    let topicTask = await TopicTask.create({
      boardId,
      subBoardId,
      grade,
      subjectId,
      resources,
      description,
      supervisorId,
    });

    return topicTask;
  } catch (err) {
    throw err;
  }
};

const checkTopicTask = async ({ boardId, subBoardId, grade, subjectId }) => {
  try {
    let checkTask = await TopicTask.findOne({
      where: {
        boardId,
        subBoardId,
        grade,
        subjectId,
      },
      raw: true,
    });

    if (checkTask) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Topic Task already exists!");
    }
  } catch (err) {
    throw err;
  }
};

const createTopic = async ({
  name
}) => {
  try {
    let topic = await Topic.create({
      name
    });

    return topic;
  } catch (err) {
    throw err;
  }
};

const createSubTopic = async ({
  name
}) => {
  try {
    let subtopic = await SubTopic.create({
      name
    });

    return subtopic;
  } catch (err) {
    throw err;
  }
};

const createVocabulary = async ({
  name
}) => {
  try {
    let vocabulary = await Vocabulary.create({
      name
    });

    return vocabulary;
  } catch (err) {
    throw err;
  }
};

module.exports = { createTopicTask, checkTopicTask, createTopic, createSubTopic, createVocabulary };
