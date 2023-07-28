const { Op, Sequelize, where } = require("sequelize");
const { TopicTask, TopicTaskLog } = require("../models/TopicTask");
const {
  TaskTopicMapping,
  TaskSubTopicMapping,
  TaskVocabularyMapping,
} = require("../models/TopicTaskMapping");
const { Topic, SubTopic } = require("../models/Topic");
const { Vocabulary } = require("../models/Vocabulary");
const httpStatus = require("http-status");
const { ApiError } = require("../middlewares/apiError.js");
const { User } = require("../models/User");

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

const findTopicTasks = async (whereQuery) => {
  try {
    let tasks = await TopicTask.findAll(whereQuery);
    return tasks;
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
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Topic Task already exists with given parameters!"
      );
    }
  } catch (err) {
    throw err;
  }
};

const updateTopicTask = async (dataToBeUpdated, whereQuery) => {
  try {
    let updatedTopicTask = await TopicTask.update(dataToBeUpdated, whereQuery);

    return updatedTopicTask;
  } catch (err) {
    throw err;
  }
};

const findTopicTaskAndUser = async (topicTaskId) => {
  try {
    let task = await TopicTask.findOne({
      where: { id: topicTaskId },
      include: [{ model: User, as: "supervisor" }],
      raw: true,
      nest: true,
    });
    return task;
  } catch (err) {
    throw err;
  }
};

const createTopicTaskLog = async (topicTaskId, assignee, assignedTo, logMessage) => {
  try {
    let taskLog = await TopicTaskLog.create({ topicTaskId, assignee, assignedTo, logMessage });

    return taskLog;
  } catch (err) {
    throw err;
  }
};

const findTopicTaskMappingsByTaskId = async (topicTaskId) => {
  try {
    let mappings = await TaskTopicMapping.findAll({
      where: { topicTaskId },
      attributes: ["topicTaskId", "topicId"],
      include: [{ model: Topic, attributes: ["id", "name"] }],
      raw: true,
      nest: true,
    });
    return mappings;
  } catch (err) {
    throw err;
  }
};

const findSubTopicTaskMappingsByTopicId = async (topicId) => {
  try {
    let mappings = await TaskSubTopicMapping.findAll({
      where: { topicId },
      attributes: ["topicId"],
      include: [{ model: SubTopic, attributes: ["id", "name"] }],
    });

    return mappings;
  } catch (err) {
    throw err;
  }
};

const findVocabTaskMappingsByTopicId = async (topicId) => {
  try {
    let mappings = await TaskVocabularyMapping.findAll({
      where: { topicId },
      attributes: ["topicId"],
      include: [{ model: Vocabulary, attributes: ["id", "name"] }],
    });
    return mappings;
  } catch (err) {
    throw err;
  }
};

const getTaskLogs = async (topicTaskId) => {
  try {
    let logs = await TopicTaskLog.findAll({
      where: { topicTaskId },
      order: [["createdAt", "ASC"]],
    });
    return logs;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  createTopicTask,
  findTopicTasks,
  checkTopicTask,
  updateTopicTask,
  findTopicTaskAndUser,
  createTopicTaskLog,
  findTopicTaskMappingsByTaskId,
  findSubTopicTaskMappingsByTopicId,
  findVocabTaskMappingsByTopicId,
  getTaskLogs,
};
