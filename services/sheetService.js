import { Op, Sequelize } from "sequelize";
import { Sheet, SheetLog, SheetStatus } from "../models/Sheet.js";
import { User } from "../models/User.js";

const sheetService = {
  async findSheet(sheetId) {
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
  },
  async findSheetAndUser(sheetId) {
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
  },

  async checkSheetAssignmentId(sheetId, userId) {
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
  },
  async assignUserToSheetAndUpdateLifeCycle(sheetId, userId, lifeCycleName) {
    try {
      console.log(userId, lifeCycleName);
      let assignSheet = await Sheet.update(
        { assignedToUserId: userId, lifeCycle: lifeCycleName },
        { where: { id: sheetId } }
      );
     
      return assignSheet;
    } catch (err) {
      throw err;
    }
  },

  async findSheetInSheetStatus(sheetId) {
    try {
      let findSheet = await SheetStatus.findOne({
        where: { sheetId: sheetId },
      });
      return findSheet;
    } catch (err) {
      throw err;
    }
  },

  async createSheetStatusRecord(
    sheetId,
    statusForSupervisor,
    statusForPastPaper
  ) {
    try {
      let createSheet = await SheetStatus.create({
        sheetId,
        statusForSupervisor,
        statusForPastPaper,
      });

     
      return createSheet;
    } catch (err) {
      throw err;
    }
  },

  async updateSheetStatus(
    sheetId,
    statusForSupervisor,
    statusForPastPaper,
    statusForReviewer
  ) {
    try {
      let updateSheetStatus = await SheetStatus.update(
        {
          statusForSupervisor: statusForSupervisor,
          statusForPastPaper: statusForPastPaper,
          statusForReviewer: statusForReviewer,
        },
        { where: { sheetId: sheetId } }
      );
    
      return updateSheetStatus;
    } catch (err) {
      throw err;
    }
  },

  async createSheetLog(sheetId, assignee, assignedTo, logMessage) {
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
  },
};

export { sheetService };
