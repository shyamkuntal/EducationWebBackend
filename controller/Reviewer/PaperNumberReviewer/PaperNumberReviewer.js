const services = require("../../../services/index.js");
const httpStatus = require("http-status");
const {
  updateSheetStatusSchema,
  addErrorReportSchema,
  addErrorToPaperNumbersSchema,
  submitSheetToSupervisorSchema,
  addRecheckCommentSchema,
  getRecheckingCommentsSchema,
  getErrorReportFilesSchema,
} = require("../../../validations/PaperNumberReviewerValidations.js");
const CONSTANTS = require("../../../constants/constants.js");
const { generateFileName } = require("../../../config/s3.js");
const { ApiError } = require("../../../middlewares/apiError");

const PaperNumberReviewerController = {
  async UpdateInprogressSheetStatus(req, res, next) {
    try {
      let values = await updateSheetStatusSchema.validateAsync(req.body);

      let sheet = await services.paperNumberSheetService.findPaperNumberSheetByPk(
        values.paperNumberSheetId
      );

      if (!sheet) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Sheet not found!");
      }
      let assignedTo = sheet.assignedToUserId;
      let lifeCycle = sheet.lifeCycle;
      let previousStatus = sheet.statusForReviewer;

      if (assignedTo !== values.reviewerId || lifeCycle !== CONSTANTS.roleNames.Reviewer) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Sheet not assigned to reviewr or lifecycle mismatch"
        );
      }

      if (previousStatus === CONSTANTS.sheetStatuses.InProgress) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Current sheet status is already Inprogress");
      }
      if (previousStatus === CONSTANTS.sheetStatuses.InProgress) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Current sheet status is already Inprogress");
      }

      let dataToBeUpdated = {
        statusForSupervisor: CONSTANTS.sheetStatuses.InProgress,
        statusForReviewer: CONSTANTS.sheetStatuses.InProgress,
      };

      let whereQuery = { where: { id: sheet.id } };

      let updateInprogressStatus = await services.paperNumberSheetService.updatePaperNumberSheet(
        dataToBeUpdated,
        whereQuery
      );

      if (updateInprogressStatus.length > 0) {
        res.status(httpStatus.OK).send({ message: "Sheet Status Updated successfully!" });
      }
    } catch (err) {
      next(err);
    }
  },

  async reportSheetError(req, res, next) {
    try {
      let values = await addErrorReportSchema.validateAsync({
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

      // checking sheet
      let paperNumberSheetData = await services.paperNumberSheetService.findSheetAndUser(
        values.paperNumberSheetId
      );

      if (!paperNumberSheetData) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Topic Task not found!");
      }

      if (
        values.reviewerId !== paperNumberSheetData.reviewerId ||
        paperNumberSheetData.assignedToUserId !== paperNumberSheetData.reviewerId
      ) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Reviewer not assigned to sheet!");
      }

      if (paperNumberSheetData.isSpam === true) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Error Report already exists!!");
      }

      let fileName =
        process.env.AWS_BUCKET_PAPERNUMBER_ERROR_REPORT_IMAGES_FOLDER +
        "/" +
        generateFileName(values.errorReportFile.originalname);

      let uploadFile = await services.paperNumberSheetService.uploadPaperNumberErrorReportFile(
        fileName,
        values.errorReportFile
      );

      if (uploadFile) {
        responseMessage.message.errorReportFileUpload = "Error Report file added successfully!";
      }

      // updating error report, adding reviewer comments,updating sheetStatuses,setting IsSpam to true
      //  error report img and assigning to supervisor

      let dataToBeUpdated = {
        assignedToUserId: paperNumberSheetData.supervisorId,
        statusForReviewer: CONSTANTS.sheetStatuses.Complete,
        statusForSupervisor: CONSTANTS.sheetStatuses.Complete,
        errorReport: values.errorReport,
        reviewerCommentToSupervisor: values.comment,
        errorReportImg: fileName,
        isSpam: true,
      };

      let whereQuery = {
        where: { id: values.paperNumberSheetId },
      };

      let updateErrorReport = await services.paperNumberSheetService.updatePaperNumberSheet(
        dataToBeUpdated,
        whereQuery
      );

      if (updateErrorReport.length > 0) {
        responseMessage.message.errorReport = "Error Report updated successfully!";
      }

      // Create sheetLog

      let dataToBeCreated = {
        paperNumberSheetId: paperNumberSheetData.id,
        assignee: paperNumberSheetData.assignedToUserName.userName,
        assignedTo: paperNumberSheetData.supervisor.userName,
        logMessage: CONSTANTS.sheetLogsMessages.reviewerAssignToSupervisorErrorReport,
      };

      let createLog = await services.paperNumberSheetService.createPaperNumberSheetLog(
        dataToBeCreated
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
  async submitSheetToSupervisor(req, res, next) {
    try {
      let values = await submitSheetToSupervisorSchema.validateAsync(req.body);

      let responseMessage = {
        assinedUserToSheet: "",
        UpdateSheetStatus: "",
        sheetLog: "",
      };
      // checking sheet
      let userData = await services.userService.finduser(
        values.reviewerId,
        CONSTANTS.roleNames.Reviewer
      );

      let paperNumberSheetData = await services.paperNumberSheetService.findSheetAndUser(
        values.paperNumberSheetId
      );

      if (!userData && !paperNumberSheetData) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Sheet not found!");
      }
      // Checking if sheet is already assingned to supervisor
      if (paperNumberSheetData.assignedToUserId === paperNumberSheetData.supervisorId) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Task already assigned to supervisor!");
      }

      // Checking if sheet status is complete for reviewer
      if (paperNumberSheetData.statusForReviewer !== CONSTANTS.sheetStatuses.Complete) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Please mark it as complete first");
      }

      //UPDATE sheet assignment & sheet status
      let dataToBeUpdated = {
        assignedToUserId: paperNumberSheetData.supervisorId,
        statusForSupervisor: CONSTANTS.sheetStatuses.Complete,
      };

      let whereQuery = {
        where: { id: paperNumberSheetData.id },
      };

      await services.paperNumberSheetService.updatePaperNumberSheet(dataToBeUpdated, whereQuery);

      responseMessage.assinedUserToSheet = "Sheet assigned to supervisor successfully";
      responseMessage.UpdateSheetStatus = "Sheet Statuses updated successfully";

      // Create sheetLog
      let dataToBeCreated = {
        paperNumberSheetId: paperNumberSheetData.id,
        assignee: userData.userName,
        assignedTo: paperNumberSheetData.supervisor.userName,
        logMessage: CONSTANTS.sheetLogsMessages.reviewerAssignToSupervisor,
      };

      await services.paperNumberSheetService.createPaperNumberSheetLog(dataToBeCreated);

      responseMessage.sheetLog = "Log record for assignment to supervisor added successfully";

      res.status(httpStatus.OK).send(responseMessage);
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  async addErrorsToPaperNumbers(req, res, next) {
    try {
      let values = await addErrorToPaperNumbersSchema.validateAsync(req.body);

      // Add errors to PaperNumbers

      if (values.paperNumberErrors && values.paperNumberErrors.length > 0) {
        let addPaperNumberErrors = "";
        for (element of values.paperNumberErrors) {
          let dataToBeUpdatedForPaperNumber = {
            isError: element.isError,
            errorReport: element.errorReport,
          };
          let whereQueryForPaperNumber = { where: { id: element.id } };

          addPaperNumberErrors = await services.paperNumberService.updatePaperNumber(
            dataToBeUpdatedForPaperNumber,
            whereQueryForPaperNumber
          );
        }

        if (addPaperNumberErrors.length > 0) {
          res.status(httpStatus.OK).send({ message: "Added Error Report to paperNumbers" });
        }
      }
    } catch (err) {
      next(err);
    }
  },

  async addRecheckComment(req, res, next) {
    try {
      let values = await addRecheckCommentSchema.validateAsync(req.body);

      let userData = await services.userService.finduser(
        values.reviewerId,
        CONSTANTS.roleNames.Reviewer
      );

      // checking sheet
      let paperNumberSheetData = await services.paperNumberSheetService.findSheetAndUser(
        values.paperNumberSheetId
      );

      let responseMessage = {
        message: { errorReport: "", sheetLog: "" },
      };

      if (userData && paperNumberSheetData) {
        // Checking is reviewer is assigned to sheet
        if (paperNumberSheetData.assignedToUserId === values.reviewerId) {
          // checking if sheet is spam, adding recheck error only if sheet is spam
          if (paperNumberSheetData.isSpam) {
            // adding recheck error

            let dataToBeCreated = {
              paperNumberSheetId: values.paperNumberSheetId,
              reviewerRecheckComment: values.recheckComment,
            };
            let addError = await services.paperNumberSheetService.createRecheckComment(
              dataToBeCreated
            );

            // Update paperNumberSheet statuses and assignment
            let dataToBeUpdated = {
              assignedToUserId: paperNumberSheetData.supervisorId,
              statusForReviewer: CONSTANTS.sheetStatuses.Complete,
              isSpam: true,
            };

            let whereQuery = { where: { id: values.paperNumberSheetId } };

            let updatePaperNumberSheetData =
              await services.paperNumberSheetService.updatePaperNumberSheet(
                dataToBeUpdated,
                whereQuery
              );

            if (updatePaperNumberSheetData.length > 0) {
              responseMessage.message.errorReport = "Error Report updated successfully!";
            }

            let dataToBeCreatedForLogs = {
              paperNumberSheetId: values.paperNumberSheetId,
              assignee: userData.userName,
              assignedTo: paperNumberSheetData.supervisor.userName,
              logMessage: CONSTANTS.sheetLogsMessages.reviewerAssignToSupervisorErrorReport,
            };

            let createLog = await services.paperNumberSheetService.createPaperNumberSheetLog(
              dataToBeCreatedForLogs
            );

            if (createLog) {
              responseMessage.message.sheetLog =
                "Log record for assignment to supervisor added successfully";
            }

            res.status(httpStatus.OK).send({
              message: "Recheking error added successfully!",
              responseMessage,
              addError,
            });
          } else {
            res.status(httpStatus.BAD_REQUEST).send({
              message: "Cannot add recheck error, sheet not in spam state",
            });
          }
        } else {
          res.status(httpStatus.BAD_REQUEST).send({ message: "Reviewer Not assigned to sheet" });
        }
      } else {
        res.status(httpStatus.BAD_REQUEST).send({ message: "Invalid paperNumberSheetId" });
      }
    } catch (err) {
      next(err);
    }
  },

  async updateCompleteSheetStatus(req, res, next) {
    try {
      let values = await updateSheetStatusSchema.validateAsync(req.body);

      // checking sheet
      let paperNumberSheetData = await services.paperNumberSheetService.findSheetAndUser(
        values.paperNumberSheetId
      );

      if (!paperNumberSheetData) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Sheet not found!");
      }

      let assignedTo = paperNumberSheetData.assignedToUserId;
      let lifeCycle = paperNumberSheetData.lifeCycle;
      let previousStatus = paperNumberSheetData.statusForReviewer;

      // Checking if sheet is assigned to current reviewer
      if (assignedTo !== values.reviewerId && lifeCycle !== CONSTANTS.roleNames.Reviewer) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Sheet not assigned to reviewr or lifecycle mismatch"
        );
      }

      if (previousStatus === CONSTANTS.sheetStatuses.Complete) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Current sheet status is already Complete");
      }

      let dataToBeUpdated = {
        statusForReviewer: CONSTANTS.sheetStatuses.Complete,
      };

      let whereQuery = { where: { id: paperNumberSheetData.id } };

      await services.paperNumberSheetService.updatePaperNumberSheet(dataToBeUpdated, whereQuery);

      res.status(httpStatus.OK).send({ message: "Sheet Status Updated successfully!" });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  async getErrorReportFile(req, res, next) {
    try {
      let values = await getErrorReportFilesSchema.validateAsync({
        paperNumberSheetId: req.query.paperNumberSheetId,
      });

      let paperNumberSheetData = await services.paperNumberSheetService.findPaperNumberSheetByPk(
        values.paperNumberSheetId
      );

      if (!paperNumberSheetData) {
        res.status(httpStatus.BAD_REQUEST).send({ message: "Sheet not found!" });
      }

      let fileUrl = await services.paperNumberSheetService.getFilesUrlFromS3(
        paperNumberSheetData.dataValues.errorReportImg
      );

      res.status(200).send({
        errorReportFile: paperNumberSheetData.dataValues.errorReportImg,
        errorReportFileUrl: fileUrl,
      });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
};

module.exports = PaperNumberReviewerController;
