const {
  updateInprogressTaskStatusSchema,
  updateCompleteTaskStatusSchema,
  submitTaskToSupervisorSchema,
  addRecheckCommentSchema,
  getErrorReportFilesSchema,
  getRecheckingCommentsSchema,
  addErrorReportToBookTaskSchema,
  addErrorsToBooksSchema,
  addErrorsToChaptersSchema,
} = require("../../validations/BookManagementReviewerValidations");
const services = require("../../services");
const httpStatus = require("http-status");
const CONSTANTS = require("../../constants/constants");
const { User } = require("../../models/User");
const { generateFileName } = require("../../config/s3");
const { ApiError } = require("../../middlewares/apiError");
const db = require("../../config/database");
const { SpamBookTaskRecheckComments } = require("../../models/BookTask");
const { updateBookStatusSchema } = require("../../validations/BookManagementDGValidations");

const ReviewerBookController = {
  async updateInProgressTaskStatus(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await updateInprogressTaskStatusSchema.validateAsync(req.body);

      let whereQuery = { where: { id: values.bookTaskId }, raw: true };

      let bookTaskData = await services.bookTaskService.findOneBookTask(whereQuery);

      if (!bookTaskData) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Topic Task not found!");
      }

      let assignedTo = bookTaskData.assignedToUserId;
      let lifeCycle = bookTaskData.lifeCycle;
      let previousStatus = bookTaskData.statusForReviewer;

      if (assignedTo !== values.reviewerId || lifeCycle !== CONSTANTS.roleNames.Reviewer) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Task not assigned to reviewer or lifecycle mismatch"
        );
      }

      if (previousStatus === CONSTANTS.sheetStatuses.InProgress) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Current sheet status is already Inprogress");
      }
      let dataToBeUpdated = {
        statusForSupervisor: CONSTANTS.sheetStatuses.InProgress,
        statusForReviewer: CONSTANTS.sheetStatuses.InProgress,
      };

      let whereQueryForTaskUpdate = { where: { id: bookTaskData.id } };

      await services.bookTaskService.updateBookTask(dataToBeUpdated, whereQueryForTaskUpdate, {
        transaction: t,
      });
      await t.commit();
      res.status(httpStatus.OK).send({ message: "Task Status Updated successfully!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },

  async updateCompleteTaskStatus(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await updateCompleteTaskStatusSchema.validateAsync(req.body);

      let whereQuery = { where: { id: values.bookTaskId }, raw: true };

      let bookTaskData = await services.bookTaskService.findOneBookTask(whereQuery);

      if (!bookTaskData) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Book Task not found!");
      }

      let assignedTo = bookTaskData.assignedToUserId;
      let lifeCycle = bookTaskData.lifeCycle;
      let previousStatus = bookTaskData.statusForReviewer;

      if (assignedTo !== values.reviewerId && lifeCycle !== CONSTANTS.roleNames.Reviewer) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Task not assigned to reviewr or lifecycle mismatch"
        );
      }

      if (previousStatus === CONSTANTS.sheetStatuses.Complete) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Current Task status is already Complete");
      }

      let dataToBeUpdated = {
        statusForReviewer: CONSTANTS.sheetStatuses.Complete,
      };

      let whereQueryForUpdate = { where: { id: bookTaskData.id } };

      await services.bookTaskService.updateBookTask(dataToBeUpdated, whereQueryForUpdate, {
        transaction: t,
      });
      await t.commit();
      res.status(httpStatus.OK).send({ message: "Sheet Status Updated successfully!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },

  async addErrorReportToBookTask(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await addErrorReportToBookTaskSchema.validateAsync({
        ...req.body,
        errorReportFile: req.file,
      });

      let responseMessage = {
        message: {
          errorReport: "",
          errorReportFileUpload: "",
          sheetLog: "",
        },
      };

      let whereQueryForFindBooktask = {
        where: {
          id: values.bookTaskId,
        },
        include: [
          { model: User, as: "assignedToUserName", attributes: ["id", "Name", "userName"] },
          { model: User, as: "supervisor", attributes: ["id", "Name", "userName"] },
        ],
        raw: true,
        nest: true,
      };

      let bookTaskData = await services.bookTaskService.findOneBookTask(whereQueryForFindBooktask);

      if (!bookTaskData) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Topic Task not found!");
      }

      if (
        values.reviewerId !== bookTaskData.reviewerId ||
        bookTaskData.assignedToUserId !== bookTaskData.reviewerId
      ) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Reviewer not assigned to task!");
      }

      if (bookTaskData.isSpam === true) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Error Report already exists!!");
      }

      let fileName =
        process.env.AWS_BUCKET_BOOKMANAGEMENT_ERROR_REPORT_IMAGES_FOLDER +
        "/" +
        generateFileName(values.errorReportFile.originalname);

      let uploadFile = await services.paperNumberSheetService.uploadPaperNumberErrorReportFile(
        fileName,
        values.errorReportFile
      );

      if (uploadFile) {
        responseMessage.message.errorReportFileUpload = "Error Report file added successfully!";
      }

      //   Update topicTask with error report
      let dataToBeUpdated = {
        assignedToUserId: bookTaskData.supervisorId,
        statusForReviewer: CONSTANTS.sheetStatuses.Complete,
        statusForSupervisor: CONSTANTS.sheetStatuses.Complete,
        errorReport: values.errorReport,
        reviewerCommentToSupervisor: values.comment,
        errorReportImg: fileName,
        isSpam: true,
      };

      let whereQueryForUpdateBookTask = {
        where: { id: values.bookTaskId },
      };

      let updateTopicTask = await services.bookTaskService.updateBookTask(
        dataToBeUpdated,
        whereQueryForUpdateBookTask,
        {
          transaction: t,
        }
      );

      if (updateTopicTask[0] > 0) {
        responseMessage.message.errorReport = "Error Report updated successfully!";
      }

      // Create sheetLog
      let createLog = await services.bookTaskService.createBookTaskLog(
        values.bookTaskId,
        bookTaskData.assignedToUserName.userName,
        bookTaskData.supervisor.userName,
        CONSTANTS.sheetLogsMessages.reviewerAssignToSupervisorErrorReport,
        {
          transaction: t,
        }
      );

      if (createLog) {
        responseMessage.message.sheetLog =
          "Log record for assignment to supervisor added successfully";
      }
      await t.commit();
      res.status(httpStatus.OK).send(responseMessage);
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },

  async addErrorsToBooks(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await addErrorsToBooksSchema.validateAsync(req.body);

      let dataToBeUpdated = {
        isError: true,
        errorReport: values.errorReport,
      };

      let whereQuery = { where: { bookId: values.bookId, bookTaskId: values.bookTaskId } };

      let updateTaskBookMapping = await services.bookTaskService.updateTaskBookMapping(
        dataToBeUpdated,
        whereQuery,
        { transaction: t }
      );
      if (!updateTaskBookMapping[0] > 0) {
        throw new ApiError(
          httpStatus.INTERNAL_SERVER_ERROR,
          "Couldn't add Error Report to taskBook mapping!"
        );
      } else {
        res.status(httpStatus.OK).send({ message: "Added Error Report to taskBook mapping!" });
      }
      await t.commit();
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },

  async addErrorsToChapters(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await addErrorsToChaptersSchema.validateAsync({
        chaptersErrors: req.body.chaptersErrors,
      });

      let chaptersWithErrors = values.chaptersErrors;

      for (let i = 0; i < chaptersWithErrors.length; i++) {
        let dataToBeUpdated = {
          isError: chaptersWithErrors[i].isError,
          errorReport: chaptersWithErrors[i].errorReport,
        };

        let whereQuery = {
          where: {
            chapterId: chaptersWithErrors[i].chapterId,
            bookId: chaptersWithErrors[i].bookId,
            bookTaskId: chaptersWithErrors[i].bookTaskId,
          },
        };

        await services.bookTaskService.updateTaskChapterMapping(dataToBeUpdated, whereQuery, {
          transaction: t,
        });
      }

      await t.commit();
      res.status(httpStatus.OK).send({ message: "Added Error Report to taskChapter mapping!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },

  async submitTaskToSupervisor(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await submitTaskToSupervisorSchema.validateAsync(req.body);

      let responseMessage = {
        assinedUserToSheet: "",
        UpdateSheetStatus: "",
        sheetLog: "",
      };

      let whereQueryForFindBookTask = {
        where: {
          id: values.bookTaskId,
        },
        include: [
          { model: User, as: "assignedToUserName", attributes: ["id", "Name", "userName"] },
          { model: User, as: "supervisor", attributes: ["id", "Name", "userName"] },
        ],
        raw: true,
        nest: true,
      };

      let bookTaskData = await services.bookTaskService.findOneBookTask(whereQueryForFindBookTask);

      if (!bookTaskData) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Topic Task not found!");
      }

      if (bookTaskData.assignedToUserId === bookTaskData.supervisorId) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Task already assigned to supervisor!");
      }

      // Checking if sheet status is complete for reviewer
      if (bookTaskData.statusForReviewer !== CONSTANTS.sheetStatuses.Complete) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Please mark it as complete first");
      }

      //UPDATE sheet assignment & sheet status
      let dataToBeUpdated = {
        assignedToUserId: bookTaskData.supervisorId,
        statusForSupervisor: CONSTANTS.sheetStatuses.Complete,
      };

      let whereQuery = {
        where: { id: bookTaskData.id },
      };

      await services.bookTaskService.updateBookTask(dataToBeUpdated, whereQuery, {
        transaction: t,
      });

      responseMessage.assinedUserToSheet = "Task assigned to supervisor successfully";
      responseMessage.UpdateSheetStatus = "Task Statuses updated successfully";

      // Create sheetLog

      await services.bookTaskService.createBookTaskLog(
        values.bookTaskId,
        bookTaskData.assignedToUserName.userName,
        bookTaskData.supervisor.userName,
        CONSTANTS.sheetLogsMessages.reviewerAssignToSupervisor,
        { transaction: t }
      );

      responseMessage.sheetLog = "Log record for assignment to supervisor added successfully";

      await t.commit();

      res.status(httpStatus.OK).send(responseMessage);
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },

  async addRecheckComment(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await addRecheckCommentSchema.validateAsync(req.body);

      let responseMessage = {
        message: { recheckComment: "", taskLog: "" },
      };

      let whereQuery = {
        where: { id: values.bookTaskId },
        include: [
          { model: User, as: "assignedToUserName", attributes: ["id", "Name", "userName"] },
          { model: User, as: "supervisor", attributes: ["id", "Name", "userName"] },
        ],
        raw: true,
        nest: true,
      };

      let bookTaskData = await services.bookTaskService.findOneBookTask(whereQuery);

      if (!bookTaskData) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Book Task not found!");
      }

      if (bookTaskData.reviewerId !== values.reviewerId) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Reviewer Not assigned to task!");
      }

      if (bookTaskData.isSpam !== true) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Cannot add recheck error, task not in spam state!"
        );
      }

      let dataToBeCreated = {
        bookTaskId: values.bookTaskId,
        reviewerRecheckComment: values.recheckComment,
      };

      let addRecheckComment = await SpamBookTaskRecheckComments.create(dataToBeCreated, {
        transaction: t,
      });

      responseMessage.message.recheckComment = "RecheckComment added successfully!";

      let dataToBeUpdated = {
        assignedToUserId: bookTaskData.supervisorId,
        statusForReviewer: CONSTANTS.sheetStatuses.Complete,
        lifeCycle: CONSTANTS.roleNames.Supervisor,
        isSpam: true,
      };

      let whereQueryForTaskUpdate = { where: { id: values.bookTaskId } };

      await services.bookTaskService.updateBookTask(dataToBeUpdated, whereQueryForTaskUpdate, {
        transaction: t,
      });

      await services.bookTaskService.createBookTaskLog(
        values.bookTaskId,
        bookTaskData.assignedToUserName.userName,
        bookTaskData.supervisor.userName,
        CONSTANTS.sheetLogsMessages.reviewerAssignToSupervisorErrorReport,
        { transaction: t }
      );

      responseMessage.message.taskLog =
        "Log record for assignment to supervisor added successfully";

      res.status(httpStatus.OK).send({
        message: "Recheking error added successfully!",
        responseMessage,
        addRecheckComment,
      });

      await t.commit();
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },

  async getErrorReportFile(req, res, next) {
    try {
      let values = await getErrorReportFilesSchema.validateAsync({
        bookTaskId: req.query.bookTaskId,
      });
      let whereQuery = {
        where: { id: values.bookTaskId },
      };
      let bookTaskData = await services.bookTaskService.findOneBookTask(whereQuery);

      if (!bookTaskData) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Book Task not found!");
      }

      let fileUrl = await services.paperNumberSheetService.getFilesUrlFromS3(
        bookTaskData.errorReportImg
      );

      res.status(httpStatus.OK).send({
        errorReportFile: bookTaskData.errorReportImg,
        errorReportFileUrl: fileUrl,
      });
    } catch (err) {
      next(err);
    }
  },
  async setBookInProgressStatus(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await updateBookStatusSchema.validateAsync(req.body);

      let whereQuery = {
        where: { bookTaskId: values.bookTaskId, bookId: values.bookId },
        raw: true,
      };

      let book = await services.bookTaskService.findBookByBookTask(whereQuery);

      let bookDetails = book[0];

      if (!bookDetails) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Book Not Found for this Task!");
      }

      if (bookDetails.bookStatusForReviewer === CONSTANTS.sheetStatuses.InProgress) {
        throw new ApiError(httpStatus.OK, "Book Status is already InProgress ");
      }

      let dataToBeUpdated = {
        bookStatusForReviewer: CONSTANTS.sheetStatuses.InProgress,
      };

      let whereQueryForUpdateBookTask = {
        where: { bookTaskId: values.bookTaskId, bookId: values.bookId },
      };

      await services.bookTaskService.updateTaskBookMapping(
        dataToBeUpdated,
        whereQueryForUpdateBookTask,
        {
          transaction: t,
        }
      );

      await t.commit();

      res.status(httpStatus.OK).send({ message: "Book InProgress Status Updated!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async setBookCompleteStatus(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await updateBookStatusSchema.validateAsync(req.body);

      let whereQuery = {
        where: { bookTaskId: values.bookTaskId, bookId: values.bookId },
        raw: true,
      };

      let book = await services.bookTaskService.findBookByBookTask(whereQuery);

      let bookDetails = book[0];

      if (!bookDetails) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Book Not Found for this Task!");
      }

      if (bookDetails.bookStatusForReviewer === CONSTANTS.sheetStatuses.Complete) {
        throw new ApiError(httpStatus.OK, "Book Status is already Complete ");
      }

      let dataToBeUpdated = {
        bookStatusForReviewer: CONSTANTS.sheetStatuses.Complete,
      };

      let whereQueryForUpdateBookTask = {
        where: { bookTaskId: values.bookTaskId, bookId: values.bookId },
      };

      await services.bookTaskService.updateTaskBookMapping(
        dataToBeUpdated,
        whereQueryForUpdateBookTask,
        {
          transaction: t,
        }
      );

      await t.commit();

      res.status(httpStatus.OK).send({ message: "Book Complete Status Updated!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async getRecheckComment(req, res, next) {
    try {
      let values = await getRecheckingCommentsSchema.validateAsync({
        bookTaskId: req.query.bookTaskId,
      });
      let recheckComment = await services.bookTaskService.findRecheckingComments(values.bookTaskId);

      res.status(httpStatus.OK).send(recheckComment);
    } catch (err) {
      next(err);
    }
  },
};



module.exports = ReviewerBookController;
