const { SheetManagement, SheetManagementLog } = require("../models/SheetManagement");
const { User } = require("../models/User");

const findSheetAndUser = async (sheetId) => {
  try {
    let task = await SheetManagement.findOne({
      where: { id: sheetId },
      include: [{ model: User, as: "supervisor" }],
      raw: true,
      nest: true,
    });
    return task;
  } catch (err) {
    throw err;
  }
};
const createSheetLog = async (sheetManagementId, assignee, assignedTo, logMessage) => {
  try {
    let taskLog = await SheetManagementLog.create({ sheetManagementId, assignee, assignedTo, logMessage });

    return taskLog;
  } catch (err) {
    throw err;
  }
};
const findSheet = async (whereQuery) => {
  try {
    let tasks = await SheetManagement.findAll(whereQuery);
    return tasks;
  } catch (err) {
    throw err;
  }
};
module.exports = {
  findSheetAndUser,
  createSheetLog,
  findSheet
}