const { Op, Sequelize } = require("sequelize");
const { Sheet, SheetLog } = require("../models/Sheet.js");
const { User } = require("../models/User.js");

const findSheet = async (sheetId) => {
  try {
    let findSheet = Sheet.findOne({
      where: { id: sheetId },
      raw: true,
      nest: true,
    });

    return findSheet;
  } catch (err) {
    throw err;
  }
};
const findSheetAndUser = async (sheetId) => {
  try {
    let findSheet = Sheet.findOne({
      where: { id: sheetId },
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

const checkSheetAssignmentId = async (sheetId, userId) => {
  try {
    let checkId = await Sheet.findOne({
      where: { [Op.and]: [{ id: sheetId }, { assignedToUserId: userId }] },
      raw: true,
    });

    console.log(checkId);

    return checkId;
  } catch (err) {
    throw err;
  }
};
const assignUserToSheetAndUpdateLifeCycleAndStatuses = async (
  sheetId,
  userId,
  lifeCycleName,
  statusForSupervisor,
  statusForPastPaper
) => {
  try {
    let assignSheetAndStatus = await Sheet.update(
      {
        assignedToUserId: userId,
        lifeCycle: lifeCycleName,
        statusForSupervisor,
        statusForPastPaper,
      },
      { where: { id: sheetId } }
    );

    return assignSheetAndStatus;
  } catch (err) {
    throw err;
  }
};

const findSheetInSheetStatus = async (sheetId) => {
  try {
    let findSheet = await SheetStatus.findOne({
      where: { sheetId: sheetId },
    });
    return findSheet;
  } catch (err) {
    throw err;
  }
};

const createSheetLog = async (sheetId, assignee, assignedTo, logMessage) => {
  try {
    let createLog = await SheetLog.create({
      sheetId,
      assignee,
      assignedTo,
      logMessage,
    });

    return createLog;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  findSheet,
  findSheetAndUser,
  checkSheetAssignmentId,
  assignUserToSheetAndUpdateLifeCycleAndStatuses,
  findSheetInSheetStatus,
  createSheetLog,
};
