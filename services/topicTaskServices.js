const { Op, Sequelize, where } = require("sequelize");
const { TopicTask, TopicTaskLog, SpamTopicTaskRecheckComments } = require("../models/TopicTask");
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
  options,
}) => {
  try {
    let topicTask = await TopicTask.create(
      {
        boardId,
        subBoardId,
        grade,
        subjectId,
        resources,
        description,
        supervisorId,
      },
      options
    );

    return topicTask;
  } catch (err) {
    throw err;
  }
};

const findOneTopicTask = async (whereQuery) => {
  try {
    let task = await TopicTask.findOne(whereQuery);
    return task;
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

const updateTopicTask = async (dataToBeUpdated, whereQuery, options) => {
  try {
    let updatedTopicTask = await TopicTask.update(dataToBeUpdated, whereQuery, options);

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

const createTopicTaskLog = async (topicTaskId, assignee, assignedTo, logMessage, options) => {
  try {
    console.log(topicTaskId, assignee, assignedTo, logMessage);
    let taskLog = await TopicTaskLog.create(
      { topicTaskId, assignee, assignedTo, logMessage },
      options
    );

    return taskLog;
  } catch (err) {
    throw err;
  }
};

const findTopicTaskMappingsByTaskId = async (topicTaskId) => {
  try {
    let mappings = await TaskTopicMapping.findAll({
      where: { topicTaskId },
      attributes: ["topicTaskId", "topicId", "errorReport", "isError"],
      include: [{ model: Topic, attributes: ["id", "name"] }],
      raw: true,
      nest: true,
    });

    return mappings;
  } catch (err) {
    throw err;
  }
};

const findTopicTaskMappingsByTopicTaskIdAndTopicId = async (topicTaskId, topicId) => {
  try {
    let mappings = await TaskTopicMapping.findAll({
      where: { topicTaskId, topicId },
      attributes: ["topicTaskId", "topicId", "errorReport", "isError"],
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

const findVocabTopicTaskMappingsByTopicId = async (topicId) => {
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

const findSubTopicTaskMappingsByTaskId = async (topicTaskId, topicId) => {
  try {
    let mappings = await TaskSubTopicMapping.findAll({
      where: { topicTaskId, topicId },
      attributes: ["topicId", "errorReport", "isError"],
      include: [{ model: SubTopic, attributes: ["id", "name"] }],
    });

    return mappings;
  } catch (err) {
    throw err;
  }
};

const findVocabTaskMappingsByTaskId = async (topicTaskId, topicId) => {
  try {
    let mappings = await TaskVocabularyMapping.findAll({
      where: { topicTaskId, topicId },
      attributes: ["topicId", "errorReport", "isError"],
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

const updateTaskTopicMapping = async (dataToBeUpdated, whereQuery, options) => {
  try {
    let updatedMapping = await TaskTopicMapping.update(dataToBeUpdated, whereQuery, options);

    return updatedMapping;
  } catch (err) {
    throw err;
  }
};

const updateTaskSubTopicMapping = async (dataToBeUpdated, whereQuery, options) => {
  try {
    let updatedMapping = await TaskSubTopicMapping.update(dataToBeUpdated, whereQuery.options);

    return updatedMapping;
  } catch (err) {
    throw err;
  }
};

const updateTaskVocabularyMapping = async (dataToBeUpdated, whereQuery) => {
  try {
    let updatedMapping = await TaskVocabularyMapping.update(dataToBeUpdated, whereQuery);

    return updatedMapping;
  } catch (err) {
    throw err;
  }
};

const findRecheckingComments = async (topicTaskId) => {
  try {
    let findRecheckComments = await SpamTopicTaskRecheckComments.findOne({
      where: { topicTaskId },
      order: [["createdAt", "DESC"]],
      raw: true,
    });
    return findRecheckComments;
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
  findVocabTopicTaskMappingsByTopicId,
  getTaskLogs,
  findVocabTaskMappingsByTaskId,
  findSubTopicTaskMappingsByTaskId,
  findTopicTaskMappingsByTopicTaskIdAndTopicId,
  updateTaskTopicMapping,
  updateTaskSubTopicMapping,
  updateTaskVocabularyMapping,
  findOneTopicTask,
  findRecheckingComments,
};
