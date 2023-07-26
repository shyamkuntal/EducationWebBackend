const { Op, Sequelize, where } = require("sequelize");
const { TopicTask } = require("../models/TopicTask");
const httpStatus = require("http-status");
const { ApiError } = require("../middlewares/apiError.js");

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

module.exports = { createTopicTask, checkTopicTask };
