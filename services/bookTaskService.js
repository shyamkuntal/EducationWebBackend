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

const updateBookTask = async (dataToBeUpdated, whereQuery) => {
  try {
    let updatedTask = await BookTask.update(dataToBeUpdated, whereQuery);

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

const findTaskBookChapterByBookTaskId = async (whereQuery) => {
  try {
  } catch (err) {}
};
module.exports = {
  findBookTaskAndUser,
  createBookTaskLog,
  updateBookTask,
  findBookTasks,
  findBookByBookTask,
  findTaskBookChapterByBookTaskId,
};
