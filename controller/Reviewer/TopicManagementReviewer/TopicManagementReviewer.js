const {
  addErrorsToTopicsSchema,
  addErrorsToSubTopicsSchema,
  addErrorsToVocabularySchema,
  addErrorReportToTopicTaskSchema,
  updateInprogressTaskStatusSchema,
  updateCompleteTaskStatusSchema,
  submitTaskToSupervisorSchema,
} = require("../../../validations/TopicManagementReviewerValidations");
const { TaskTopicMapping } = require("../../../models/TopicTaskMapping");
const services = require("../../../services");
const httpStatus = require("http-status");
const CONSTANTS = require("../../../constants/constants");
const { User } = require("../../../models/User");
const { generateFileName } = require("../../../config/s3");
const { ApiError } = require("../../../middlewares/apiError");

const TopicManagementController = {
  async updateInProgressTaskStatus(req, res, next) {
    try {
      let values = await updateInprogressTaskStatusSchema.validateAsync(req.body);

      let whereQuery = { where: { id: values.topicTaskId }, raw: true };

      let topicTaskData = await services.topicTaskService.findOneTopicTask(whereQuery);

      if (!topicTaskData) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Topic Task not found!");
      }

      let assignedTo = topicTaskData.assignedToUserId;
      let lifeCycle = topicTaskData.lifeCycle;
      let previousStatus = topicTaskData.statusForReviewer;

      if (assignedTo !== values.reviewerId || lifeCycle !== CONSTANTS.roleNames.Reviewer) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Task not assigned to reviewr or lifecycle mismatch"
        );
      }

      if (previousStatus === CONSTANTS.sheetStatuses.InProgress) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Current sheet status is already Inprogress");
      }
      let dataToBeUpdated = {
        statusForSupervisor: CONSTANTS.sheetStatuses.InProgress,
        statusForReviewer: CONSTANTS.sheetStatuses.InProgress,
      };

      let whereQueryForTaskUpdate = { where: { id: topicTaskData.id } };

      await services.topicTaskService.updateTopicTask(dataToBeUpdated, whereQueryForTaskUpdate);

      res.status(httpStatus.OK).send({ message: "Sheet Status Updated successfully!" });
    } catch (err) {
      next(err);
    }
  },
  async addErrorReportToTopicTask(req, res, next) {
    try {
      let values = await addErrorReportToTopicTaskSchema.validateAsync({
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

      let whereQueryForFindTopictask = {
        where: {
          id: values.topicTaskId,
        },
        include: [
          { model: User, as: "assignedToUserName", attributes: ["id", "Name", "userName"] },
          { model: User, as: "supervisor", attributes: ["id", "Name", "userName"] },
        ],
        raw: true,
        nest: true,
      };

      let topicTaskData = await services.topicTaskService.findOneTopicTask(
        whereQueryForFindTopictask
      );

      if (!topicTaskData) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Topic Task not found!");
      }

      if (
        values.reviewerId !== topicTaskData.reviewerId ||
        topicTaskData.assignedToUserId !== topicTaskData.reviewerId
      ) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Reviewer not assigned to task!");
      }

      if (topicTaskData.isSpam === true) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Error Report already exists!!");
      }

      let fileName =
        process.env.AWS_BUCKET_TOPICMANAGEMENT_ERROR_REPORT_IMAGES_FOLDER +
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
        assignedToUserId: topicTaskData.supervisorId,
        statusForReviewer: CONSTANTS.sheetStatuses.Complete,
        statusForSupervisor: CONSTANTS.sheetStatuses.Complete,
        errorReport: values.errorReport,
        reviewerCommentToSupervisor: values.comment,
        errorReportImg: fileName,
        isSpam: true,
      };

      let whereQueryForUpdateTopicTask = {
        where: { id: values.topicTaskId },
      };

      let updateTopicTask = await services.topicTaskService.updateTopicTask(
        dataToBeUpdated,
        whereQueryForUpdateTopicTask
      );

      if (updateTopicTask[0] > 0) {
        responseMessage.message.errorReport = "Error Report updated successfully!";
      }

      // Create sheetLog
      let createLog = await services.topicTaskService.createTopicTaskLog(
        values.topicTaskId,
        topicTaskData.assignedToUserName.userName,
        topicTaskData.supervisor.userName,
        CONSTANTS.sheetLogsMessages.reviewerAssignToSupervisorErrorReport
      );

      if (createLog) {
        responseMessage.message.sheetLog =
          "Log record for assignment to supervisor added successfully";
      }
      res.status(httpStatus.OK).send(responseMessage);
    } catch (err) {
      next(err);
    }
  },
  async addErrorsToTopics(req, res, next) {
    try {
      let values = await addErrorsToTopicsSchema.validateAsync(req.body);

      let dataToBeUpdated = {
        isError: values.isError,
        errorReport: values.errorReport,
      };

      let whereQuery = { where: { topicId: values.topicId, topicTaskId: values.topicTaskId } };

      let updateTaskTopicMapping = await services.topicTaskService.updateTaskTopicMapping(
        dataToBeUpdated,
        whereQuery
      );

      if (!updateTaskTopicMapping[0] > 0) {
        res
          .status(httpStatus.INTERNAL_SERVER_ERROR)
          .send({ message: "Couldn't add Error Report to taskSubTopic mapping!" });
      } else {
        res.status(httpStatus.OK).send({ message: "Added Error Report to taskTopic mapping!" });
      }
    } catch (err) {
      next(err);
    }
  },
  async addErrorsToSubTopics(req, res, next) {
    try {
      let values = await addErrorsToSubTopicsSchema.validateAsync(req.body);

      let dataToBeUpdated = {
        isError: values.isError,
        errorReport: values.errorReport,
      };

      let whereQuery = {
        where: {
          subTopicId: values.subTopicId,
          topicId: values.topicId,
          topicTaskId: values.topicTaskId,
        },
      };

      let updatedTaskSubTopicMapping = await services.topicTaskService.updateTaskSubTopicMapping(
        dataToBeUpdated,
        whereQuery
      );
      if (!updatedTaskSubTopicMapping[0] > 0) {
        res
          .status(httpStatus.INTERNAL_SERVER_ERROR)
          .send({ message: "Couldn't add Error Report to taskSubTopic mapping!" });
      } else {
        res.status(httpStatus.OK).send({ message: "Added Error Report to taskSubTopic mapping!" });
      }
    } catch (err) {
      next(err);
    }
  },
  async addErrorsToVocabulary(req, res, next) {
    try {
      let values = await addErrorsToVocabularySchema.validateAsync(req.body);

      let dataToBeUpdated = { isError: values.isError, errorReport: values.errorReport };

      let whereQuery = {
        where: {
          vocabularyId: values.vocabularyId,
          topicId: values.topicId,
          topicTaskId: values.topicTaskId,
        },
      };
      let updateTaskVocabularyMapping = await services.topicTaskService.updateTaskVocabularyMapping(
        dataToBeUpdated,
        whereQuery
      );

      if (!updateTaskVocabularyMapping[0] > 0) {
        res
          .status(httpStatus.INTERNAL_SERVER_ERROR)
          .send({ message: "Couldn't add Error Report to taskVocabulary mapping!" });
      } else {
        res
          .status(httpStatus.OK)
          .send({ message: "Added Error Report to taskVocabulary mapping!" });
      }
    } catch (err) {
      next(err);
    }
  },
  async updateCompleteTaskStatus(req, res, next) {
    try {
      let values = await updateCompleteTaskStatusSchema.validateAsync(req.body);

      let whereQuery = { where: { id: values.topicTaskId }, raw: true };

      let topicTaskData = await services.topicTaskService.findOneTopicTask(whereQuery);

      if (!topicTaskData) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Topic Task not found!");
      }

      let assignedTo = topicTaskData.assignedToUserId;
      let lifeCycle = topicTaskData.lifeCycle;
      let previousStatus = topicTaskData.statusForReviewer;

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

      let whereQueryForUpdate = { where: { id: topicTaskData.id } };

      await services.topicTaskService.updateTopicTask(dataToBeUpdated, whereQueryForUpdate);

      res.status(httpStatus.OK).send({ message: "Sheet Status Updated successfully!" });

      console.log(values);
    } catch (err) {
      next(err);
    }
  },
  async submitTaskToSupervisor(req, res, next) {
    try {
      let values = await submitTaskToSupervisorSchema.validateAsync(req.body);

      console.log(values);

      let responseMessage = {
        assinedUserToSheet: "",
        UpdateSheetStatus: "",
        sheetLog: "",
      };

      let whereQueryForFindTopictask = {
        where: {
          id: values.topicTaskId,
        },
        include: [
          { model: User, as: "assignedToUserName", attributes: ["id", "Name", "userName"] },
          { model: User, as: "supervisor", attributes: ["id", "Name", "userName"] },
        ],
        raw: true,
        nest: true,
      };

      let topicTaskData = await services.topicTaskService.findOneTopicTask(
        whereQueryForFindTopictask
      );

      if (!topicTaskData) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Topic Task not found!");
      }

      if (topicTaskData.assignedToUserId === topicTaskData.supervisorId) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Task already assigned to supervisor!");
      }

      // Checking if sheet status is complete for reviewer
      if (topicTaskData.statusForReviewer !== CONSTANTS.sheetStatuses.Complete) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Please mark it as complete first");
      }

      //UPDATE sheet assignment & sheet status
      let dataToBeUpdated = {
        assignedToUserId: topicTaskData.supervisorId,
        statusForSupervisor: CONSTANTS.sheetStatuses.Complete,
      };

      let whereQuery = {
        where: { id: topicTaskData.id },
      };

      await services.topicTaskService.updateTopicTask(dataToBeUpdated, whereQuery);

      responseMessage.assinedUserToSheet = "Task assigned to supervisor successfully";
      responseMessage.UpdateSheetStatus = "Task Statuses updated successfully";

      // Create sheetLog

      await services.topicTaskService.createTopicTaskLog(
        values.topicTaskId,
        topicTaskData.assignedToUserName.userName,
        topicTaskData.supervisor.userName,
        CONSTANTS.sheetLogsMessages.reviewerAssignToSupervisor
      );

      responseMessage.sheetLog = "Log record for assignment to supervisor added successfully";

      res.status(httpStatus.OK).send(responseMessage);
    } catch (err) {
      next(err);
    }
  },
  async addRecheckComment(req, res, next) {
    try {
    } catch (err) {
      next(err);
    }
  },
};

module.exports = TopicManagementController;
