const CONSTANTS = require("../../constants/constants.js");
const httpStatus = require("http-status");
const {
  createSheetSchema,
  assignSheetToUploaderSchema,
  assignSheetToReviewerSchema,
  assignSheetToTeacherSchema,
  assignSheetToPricerSchema,
} = require("../../validations/SheetManagementValidations.js");
const { SheetManagement, SheetManagementLog } = require("../../models/SheetManagement.js");
const db = require("../../config/database");
const { SheetManagementPaperNoMapping } = require("../../models/SheetManagementPaperNoMapping.js");
const { findBookByBookId } = require("../../services/bookTaskService.js");
const { SheetManagementBookMapping } = require("../../models/SheetManagementBookMapping.js");
const services = require("../../services/index");

const SheetManagementController = {
  async createSheet(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await createSheetSchema.validateAsync(req.body);

      let sheet = await SheetManagement.create(values, {
        transaction: t,
      });

      const mappingEntries = [];
      if (values.sheetType === "Books") {
        let bookMapping = await SheetManagementBookMapping.create(
          {
            sheetManagementId: sheet.id,
            bookId: values.bookId,
            chapterNo: values.chapterNo,
            chapterName: values.chapterName,
            startPageNo: values.startPageNo,
            endPageNo: values.endPageNo,
          },
          {
            transaction: t,
          }
        );
        console.log("bookMapping", bookMapping);
      }

      if (values.sheetType === "Top School" || values.sheetType === "Past Paper") {
        let paperNumbers = values.paperNumber;
        for (let item of paperNumbers) {
          const mapping = await SheetManagementPaperNoMapping.create(
            {
              sheetManagementId: sheet.id,
              paperNoId: item,
            },
            {
              transaction: t,
            }
          );
          mappingEntries.push(mapping);
        }
      }

      await t.commit();
      res.status(httpStatus.OK).send({ sheet, mappingEntries });
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },

  async FindBookByBookId(req, res, next) {
    const id = req.query.bookId;
    try {
      const book = await findBookByBookId(id);
      res.status(httpStatus.OK).send(book);
    } catch (err) {
      next(err);
    }
  },

  async assignSheetToUploader(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await assignSheetToUploaderSchema.validateAsync(req.body);

      let userData = await services.userService.finduser(
        values.uploader2Id,
        CONSTANTS.roleNames.Uploader2
      );

      let sheetData = await services.sheetManagementService.findSheetAndUser(values.sheetId);

      let responseMessage = {
        assinedUserToTask: "",
        UpdateSheetStatus: "",
        taskLog: "",
      };

      if (userData && sheetData) {
        // Checking if sheet is already assigned to Data Generator

        if (sheetData.assignedToUserId === userData.id) {
          res.status(httpStatus.OK).send({ message: "Sheet already assigned to Uploader" });
        } else {
          let dataToBeUpdatedInTaskTable = {
            assignedToUserId: userData.id,
            uploader2Id: userData.id,
            lifeCycle: CONSTANTS.roleNames.Uploader2,
            statusForSupervisor: CONSTANTS.sheetStatuses.NotStarted,
            statusForUploader: CONSTANTS.sheetStatuses.NotStarted,
            supervisorCommentToUploader: values.supervisorComments,
          };

          let updatedSheet = await SheetManagement.update(dataToBeUpdatedInTaskTable, {
            where: { id: values.sheetId },
            returning: true,
            transaction: t,
          });

          if (updatedSheet.length > 0) {
            responseMessage.assinedUserToTask =
              "Task assigned to Uploader and lifeCycle updated successfully";
            responseMessage.UpdateTaskStatus = "Task Statuses updated successfully";
          }

          let createLog = await services.sheetManagementService.createSheetLog(
            sheetData.id,
            sheetData.supervisor.Name,
            userData.Name,
            CONSTANTS.sheetLogsMessages.supervisorAssignToUploader2,
            { transaction: t }
          );

          if (createLog) {
            responseMessage.taskLog =
              "Log record for task assignment to uploader2 added successfully";
          }

          await t.commit();
          res.status(httpStatus.OK).send(responseMessage);
        }
      } else {
        res.status(httpStatus.BAD_REQUEST).send({ message: "Wrong user Id or Task Id" });
      }
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },

  async assignSheetToReviewer(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await assignSheetToReviewerSchema.validateAsync(req.body);

      let userData = await services.userService.finduser(
        values.reviewerId,
        CONSTANTS.roleNames.Reviewer
      );

      let sheetData = await services.sheetManagementService.findSheetAndUser(values.sheetId);

      let responseMessage = {
        assinedUserToTask: "",
        UpdateSheetStatus: "",
        taskLog: "",
      };

      if (userData && sheetData) {
        if (sheetData.assignedToUserId === userData.id) {
          res.status(httpStatus.OK).send({ message: "Sheet already assigned to Reviewer" });
        } else {
          let dataToBeUpdatedInTaskTable = {
            assignedToUserId: userData.id,
            reviewerId: userData.id,
            lifeCycle: CONSTANTS.roleNames.Reviewer,
            statusForSupervisor: CONSTANTS.sheetStatuses.NotStarted,
            statusForReviewer: CONSTANTS.sheetStatuses.NotStarted,
            supervisorCommentToUploader: values.supervisorComments,
          };

          let updatedSheet = await SheetManagement.update(dataToBeUpdatedInTaskTable, {
            where: { id: values.sheetId },
            returning: true,
            transaction: t,
          });

          if (updatedSheet.length > 0) {
            responseMessage.assinedUserToTask =
              "Sheet assigned to Reviewer and lifeCycle updated successfully";
            responseMessage.UpdateTaskStatus = "Sheet Statuses updated successfully";
          }

          let createLog = await services.sheetManagementService.createSheetLog(
            sheetData.id,
            sheetData.supervisor.Name,
            userData.Name,
            CONSTANTS.sheetLogsMessages.supervisorAssignToReviewer,
            { transaction: t }
          );

          if (createLog) {
            responseMessage.taskLog =
              "Log record for task assignment to Reviewer added successfully";
          }

          await t.commit();
          res.status(httpStatus.OK).send(responseMessage);
        }
      } else {
        res.status(httpStatus.BAD_REQUEST).send({ message: "Wrong user Id or Task Id" });
      }
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },

  async assignSheetToTeacher(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await assignSheetToTeacherSchema.validateAsync(req.body);

      let userData = await services.userService.finduser(
        values.teacherId,
        CONSTANTS.roleNames.Teacher
      );

      let sheetData = await services.sheetManagementService.findSheetAndUser(values.sheetId);

      let responseMessage = {
        assinedUserToTask: "",
        UpdateSheetStatus: "",
        taskLog: "",
      };

      if (userData && sheetData) {
        if (sheetData.assignedToUserId === userData.id) {
          res.status(httpStatus.OK).send({ message: "Sheet already assigned to Teacher" });
        } else {
          let dataToBeUpdatedInTaskTable = {
            assignedToUserId: userData.id,
            teacherId: userData.id,
            lifeCycle: CONSTANTS.roleNames.Teacher,
            statusForSupervisor: CONSTANTS.sheetStatuses.NotStarted,
            statusForTeacher: CONSTANTS.sheetStatuses.NotStarted,
            supervisorCommentToTeacher: values.supervisorComments,
          };

          let updatedSheet = await SheetManagement.update(dataToBeUpdatedInTaskTable, {
            where: { id: values.sheetId },
            returning: true,
            transaction: t,
          });

          if (updatedSheet.length > 0) {
            responseMessage.assinedUserToTask =
              "Sheet assigned to Teacher and lifeCycle updated successfully";
            responseMessage.UpdateTaskStatus = "Sheet Statuses updated successfully";
          }

          let createLog = await services.sheetManagementService.createSheetLog(
            sheetData.id,
            sheetData.supervisor.Name,
            userData.Name,
            CONSTANTS.sheetLogsMessages.supervisorAssignToTeacher,
            { transaction: t }
          );

          if (createLog) {
            responseMessage.taskLog =
              "Log record for task assignment to Teacher added successfully";
          }

          await t.commit();
          res.status(httpStatus.OK).send(responseMessage);
        }
      } else {
        res.status(httpStatus.BAD_REQUEST).send({ message: "Wrong user Id or Task Id" });
      }
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },

  async assignSheetToPricer(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await assignSheetToPricerSchema.validateAsync(req.body);

      let userData = await services.userService.finduser(
        values.pricerId,
        CONSTANTS.roleNames.Pricer
      );

      let sheetData = await services.sheetManagementService.findSheetAndUser(values.sheetId);

      let responseMessage = {
        assinedUserToTask: "",
        UpdateSheetStatus: "",
        taskLog: "",
      };

      if (userData && sheetData) {
        if (sheetData.assignedToUserId === userData.id) {
          res.status(httpStatus.OK).send({ message: "Sheet already assigned to Pricer" });
        } else {
          let dataToBeUpdatedInTaskTable = {
            assignedToUserId: userData.id,
            pricerId: userData.id,
            lifeCycle: CONSTANTS.roleNames.Pricer,
            statusForSupervisor: CONSTANTS.sheetStatuses.NotStarted,
            statusForPricer: CONSTANTS.sheetStatuses.NotStarted,
            supervisorCommentToPricer: values.supervisorComments,
          };

          let updatedSheet = await SheetManagement.update(dataToBeUpdatedInTaskTable, {
            where: { id: values.sheetId },
            returning: true,
            transaction: t,
          });

          if (updatedSheet.length > 0) {
            responseMessage.assinedUserToTask =
              "Sheet assigned to Teacher and lifeCycle updated successfully";
            responseMessage.UpdateTaskStatus = "Sheet Statuses updated successfully";
          }

          let createLog = await services.sheetManagementService.createSheetLog(
            sheetData.id,
            sheetData.supervisor.Name,
            userData.Name,
            CONSTANTS.sheetLogsMessages.supervisorAssignToPricer,
            { transaction: t }
          );

          if (createLog) {
            responseMessage.taskLog =
              "Log record for task assignment to Pricer added successfully";
          }

          await t.commit();
          res.status(httpStatus.OK).send(responseMessage);
        }
      } else {
        res.status(httpStatus.BAD_REQUEST).send({ message: "Wrong user Id or Task Id" });
      }
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },

  async publishShmSheetTask(req, res, next) {
    try {
      let values = req.body;

      let responseMessage = {};

      let whereQueryForTaskFind = { where: { id: values.sheetId }, raw: true };

      let task = await services.sheetManagementService.findSheet(whereQueryForTaskFind);

      if (!task) {
        return res.status(httpStatus.BAD_REQUEST).send({ message: "Sheet not found" });
      }
    
      let taskData = task[0];

      let dataToBeUpdated = {
        isPublished: !taskData.isPublished,
        publishTo: values.publishTo,
        isSpam: false,
      };

      let updateTask = await SheetManagement.update(dataToBeUpdated, {
        where: { id: values.sheetId },
        returning: true,
      });

      if (updateTask.length > 0) {
        responseMessage.message = `sheet is Published to ${dataToBeUpdated.publishTo}`;
      }

      res.status(httpStatus.OK).send({ responseMessage });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  async getSheetLogs(req, res, next) {
    try {
      let sheetId = req.query.sheetId;

      let logs = await SheetManagementLog.findAll({
        where: { sheetManagementId: sheetId },
        order: [["createdAt", "ASC"]],
      });

      res.status(httpStatus.OK).send(logs);
    } catch (err) {
      next(err);
    }
  },

  async ArchiveSheet(req, res, next) {
    try {
      var sheet = await SheetManagement.update({ isArchived: true }, { where: req.body });
      res.status(httpStatus.OK).send({ message: "Archived Succesfully", sheet });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
};

module.exports = SheetManagementController;
