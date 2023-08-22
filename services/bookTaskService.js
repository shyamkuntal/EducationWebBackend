const { BookTask, BookTaskLog } = require("../models/Book/BookTask");
const { TaskBookMapping, TaskBookChapterMapping } = require("../models/Book/BookTaskMapping");
const { User } = require("../models/User");

const findBookTaskAndUser = async (bookTaskId) => {
  try {
    let task = await BookTask.findOne({
      where: { id: bookTaskId },
      include: [{ model: User, as: "supervisor" }],
      raw: true,
      nest: true,
    });
    return task;
  } catch (err) {
    throw err;
  }
};

const findBookTasks = async (whereQuery) => {
  try {
    let tasks = await BookTask.findAll(whereQuery);
    return tasks;
  } catch (err) {
    throw err;
  }
};

const createBookTaskLog = async (bookTaskId, assignee, assignedTo, logMessage) => {
  try {
    let taskLog = await BookTaskLog.create({ bookTaskId, assignee, assignedTo, logMessage });

    return taskLog;
  } catch (err) {
    throw err;
  }
};

const updateBookTask = async (dataToBeUpdated, whereQuery, options) => {
  try {
    let updatedTask = await BookTask.update(dataToBeUpdated, whereQuery, options);

    return updatedTask;
  } catch (err) {
    throw err;
  }
};

const findBookByBookTask = async (whereQuery) => {
  try {
    let books = await TaskBookMapping.findAll(whereQuery);

    return books;
  } catch (err) {
    throw err;
  }
};

const updateTaskBookMapping = async (dataToBeUpdated, whereQuery, options) => {
  try {
    let updatedTaskBookMapping = await TaskBookMapping.update(dataToBeUpdated, whereQuery, options);

    return updatedTaskBookMapping;
  } catch (err) {
    throw err;
  }
};

const updateTaskChapterMapping = async (dataToBeUpdated, whereQuery, options) => {
  try {
    let updatedMapping = await TaskBookChapterMapping.update(dataToBeUpdated, whereQuery, options);

    return updatedMapping;
  } catch (err) {
    throw err;
  }
};


const findOneBookTask = async (whereQuery) => {
  try {
    let task = await BookTask.findOne(whereQuery);
    return task;
  } catch (err) {
    throw err;
  }
};

const findRecheckingComments = async (bookTaskId) => {
  try {
    let findRecheckComments = await SpamBookTaskRecheckComments.findOne({
      where: { bookTaskId },
      order: [["createdAt", "DESC"]],
      raw: true,
    });
    return findRecheckComments;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  findBookTaskAndUser,
  createBookTaskLog,
  updateBookTask,
  findBookTasks,
  findBookByBookTask,
  updateTaskBookMapping,
  findOneBookTask,
  findRecheckingComments,
  updateTaskChapterMapping,
};
