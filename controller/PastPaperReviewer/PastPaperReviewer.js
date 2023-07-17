const CONSTANTS = require("../../constants/constants.js");
const {
  assignSupervisorUserToSheetSchema,
  updateSheetStatusSchema,
  reportErrorSchema,
  getRecheckingComments,
} = require("../../validations/PPMReviewerValidation.js");
const services = require("../../services/index");
const httpStatus = require("http-status");
const { generateFileName } = require("../../config/s3.js");

const PastPaperReviewerController = {
  async getRecheckErrors(req, res, next) {
    try {
      let reqVariables = { sheetId: req.query.sheetId };

      let values = await getRecheckingComments.validateAsync(reqVariables);

      let recheckingComments = await services.sheetService.findRecheckingComments(values.sheetId);

      res.status(httpStatus.OK).send(recheckingComments);
    } catch (err) {
      next(err);
    }
  },

  async UpdateInprogressSheetStatus(req, res, next) {
    try {
      let values = await updateSheetStatusSchema.validateAsync(req.body);

      let sheet = await services.sheetService.findSheet(values.sheetId);

      if (sheet) {
        let assignedTo = sheet.assignedToUserId;
        let lifeCycle = sheet.lifeCycle;
        let previousStatus = sheet.statusForReviewer;

        // Checking if sheet is assigned to current reviewer

        if (assignedTo === values.reviewerId && lifeCycle === CONSTANTS.roleNames.Reviewer) {
          if (previousStatus !== CONSTANTS.sheetStatuses.InProgress) {
            let statusToBeUpdated = {
              statusForSupervisor: CONSTANTS.sheetStatuses.InProgress,
              statusForReviewer: CONSTANTS.sheetStatuses.InProgress,
            };

            let dataToBeUpdated = {
              statusForSupervisor: CONSTANTS.sheetStatuses.InProgress,
              statusForReviewer: CONSTANTS.sheetStatuses.InProgress,
            };

            let whereQuery = { where: { id: sheet.id } };

            let updateInprogressStatus = await services.sheetService.updateSheet(
              dataToBeUpdated,
              whereQuery
            );

            if (updateInprogressStatus.length > 0) {
              res.status(httpStatus.OK).send({ message: "Sheet Status Updated successfully!" });
            }
          } else {
            res.status(httpStatus.BAD_REQUEST).send({
              message: "Current sheet status is already Inprogress",
            });
          }
        } else {
          res
            .status(httpStatus.BAD_REQUEST)
            .send({ message: "Invalid reviewer id or sheet life cycle" });
        }
      } else {
        res.status(httpStatus.BAD_REQUEST).send({ message: "Invalid sheetId" });
      }
    } catch (err) {
      next(err);
    }
  },

  async UpdateCompleteSheetStatus(req, res, next) {
    try {
      let values = await updateSheetStatusSchema.validateAsync(req.body);

      let sheet = await services.sheetService.findSheet(values.sheetId);

      if (sheet) {
        let assignedTo = sheet.assignedToUserId;
        let lifeCycle = sheet.lifeCycle;
        let previousStatus = sheet.statusForReviewer;

        // Checking if sheet is assigned to current reviewer
        if (assignedTo === values.reviewerId && lifeCycle === CONSTANTS.roleNames.Reviewer) {
          if (previousStatus !== CONSTANTS.sheetStatuses.Complete) {
            let dataToBeUpdated = {
              statusForReviewer: CONSTANTS.sheetStatuses.Complete,
            };

            let whereQuery = { where: { id: sheet.id } };

            let updateCompleteStatus = await services.sheetService.updateSheet(
              dataToBeUpdated,
              whereQuery
            );

            if (updateCompleteStatus.length > 0) {
              res.status(httpStatus.OK).send({ message: "Sheet Status Updated successfully!" });
            }
          } else {
            res
              .status(httpStatus.BAD_REQUEST)
              .send({ message: "Current sheet status is already Complete" });
          }
        } else {
          res
            .status(httpStatus.BAD_REQUEST)
            .send({ message: "Invalid reviewer id or sheet life cycle " });
        }
      } else {
        res.status(httpStatus.BAD_REQUEST).send({ message: "Invalid sheetId" });
      }
    } catch (err) {
      next(err);
    }
  },

  async AssignSheetToSupervisor(req, res, next) {
    try {
      let values = await assignSupervisorUserToSheetSchema.validateAsync(req.body);

      let userData = await services.userService.finduser(
        values.reviewerId,
        CONSTANTS.roleNames.Reviewer
      );

      let sheetData = await services.sheetService.findSheetAndUser(values.sheetId);

      let responseMessage = {
        assinedUserToSheet: "",
        UpdateSheetStatus: "",
        sheetLog: "",
      };

      if (userData && sheetData) {
        // Checking if sheet is already assingned to supervisor
        if (sheetData.assignedToUserId === sheetData.supervisorId) {
          res.status(httpStatus.BAD_REQUEST).send({
            message: "Sheet already assigned to supervisor",
          });
        } else {
          // Checking if sheet status is complete for reviewer
          if (sheetData.statusForReviewer !== CONSTANTS.sheetStatuses.Complete) {
            res.status(httpStatus.BAD_REQUEST).send({
              message: "Please mark it as complete first",
            });
          } else {
            //UPDATE sheet assignment & sheet status
            let sheetStatusToBeUpdated = {
              statusForSupervisor: CONSTANTS.sheetStatuses.Complete,
            };

            let updateAssignAndStatus =
              await services.sheetService.assignSupervisorToSheetAndUpdateStatus(
                sheetData.id,
                sheetData.supervisorId,
                sheetStatusToBeUpdated.statusForSupervisor
              );

            if (updateAssignAndStatus.length > 0) {
              responseMessage.assinedUserToSheet = "Sheet assigned to supervisor successfully";
              responseMessage.UpdateSheetStatus = "Sheet Statuses updated successfully";
            }

            // CREATE sheet log for sheet assignment to supervisor
            let createLog = await services.sheetService.createSheetLog(
              sheetData.id,
              sheetData.supervisor.Name,
              userData.Name,
              CONSTANTS.sheetLogsMessages.reviewerAssignToSupervisor
            );

            if (createLog) {
              responseMessage.sheetLog =
                "Log record for assignment to supervisor added successfully";
            }

            res.status(httpStatus.OK).send({ message: responseMessage });
          }
        }
      } else {
        res.status(httpStatus.BAD_REQUEST).send({ message: "Wrong user Id or Sheet Id" });
      }
    } catch (err) {
      next(err);
    }
  },

  async ReportError(req, res, next) {
    try {
      let values = {
        ...req.body,
        file: req.file,
      };

      let responseMessage = {
        message: { errorReport: "", errorReportFileUpload: "", sheetLog: "" },
      };

      // let values = await reportErrorSchema.validateAsync(reqBody);

      // checking sheet
      let userData = await services.userService.finduser(
        values.reviewerId,
        CONSTANTS.roleNames.Reviewer
      );

      let sheetData = await services.sheetService.findSheetAndUser(values.sheetId);

      if (userData && sheetData) {
        // Checking is reviewer is assigned to sheet
        if (userData.id === sheetData.assignedToUserId) {
          // checking if erorr Report exists, adding if does not exists
          if (sheetData.errorReport === null) {
            // uploading error report file
            let fileName =
              process.env.AWS_BUCKET_PASTPAPER_ERROR_REPORT_IMAGES_FOLDER +
              "/" +
              generateFileName(values.file.originalname);
            let fileObj = req.file;

            let uploadFile = await services.sheetService.uploadErrorReportFile(fileName, fileObj);

            if (uploadFile) {
              responseMessage.message.errorReportFileUpload =
                "Error Report file added successfully!";
            }

            // updating error report, adding reviewer comments,updating sheetStatuses,setting IsSpam to true
            //  error report img and assigning to supervisor

            let dataToBeUpdated = {
              assignedToUserId: sheetData.supervisorId,
              statusForReviwer: CONSTANTS.sheetStatuses.Complete,
              statusForSupervsior: CONSTANTS.sheetStatuses.Complete,
              isSpam: true,
              errorReport: values.errorReport,
              reviewerCommentToSupervisor: values.comment,
              errorReportImg: fileName,
            };

            let whereQuery = { where: { id: values.sheetId } };

            let updateErrorReport = await services.sheetService.updateSheet(
              dataToBeUpdated,
              whereQuery
            );

            if (updateErrorReport.length > 0) {
              responseMessage.message.errorReport = "Error Report updated successfully!";
            }

            // Create sheetLog

            let createLog = await services.sheetService.createSheetLog(
              sheetData.id,
              sheetData.supervisor.userName,
              userData.userName,
              CONSTANTS.sheetLogsMessages.reviewerAssignToSupervisorErrorReport
            );

            if (createLog) {
              responseMessage.message.sheetLog =
                "Log record for assignment to supervisor added successfully";
            }

            res.status(httpStatus.OK).send(responseMessage);
          } else {
            res.status(httpStatus.BAD_REQUEST).send({ message: "Error report already exists" });
          }
        } else {
          res.status(httpStatus.BAD_REQUEST).send({ message: "Reviewer Not assigned to sheet" });
        }
      } else {
        res.status(httpStatus.BAD_REQUEST).send({ message: "Invalid sheetId" });
      }
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  async AddRecheckComment(req, res, next) {
    try {
      let values = await reportErrorSchema.validateAsync(req.body);

      let userData = await services.userService.finduser(
        values.reviewerId,
        CONSTANTS.roleNames.Reviewer
      );

      // checking sheet
      let sheetData = await services.sheetService.findSheetAndUser(values.sheetId);

      let responseMessage = {
        message: { errorReport: "", sheetLog: "" },
      };

      if (sheetData) {
        // Checking is reviewer is assigned to sheet
        if (sheetData.assignedToUserId === values.reviewerId) {
          // checking if sheet is spam, adding recheck error only if sheet is spam
          if (sheetData.isSpam) {
            // adding recheck error
            let addError = await services.sheetService.addRecheckError(
              sheetData.id,
              values.recheckComment
            );

            let dataToBeUpdated = {
              assignedToUserId: sheetData.supervisorId,
              statusForReviewer: CONSTANTS.sheetStatuses.Complete,
              isSpam: true,
            };

            let whereQuery = { where: { id: values.sheetId } };

            let updateErrorReport = await services.sheetService.updateSheet(
              dataToBeUpdated,
              whereQuery
            );

            if (updateErrorReport.length > 0) {
              responseMessage.message.errorReport = "Error Report updated successfully!";
            }

            let createLog = await services.sheetService.createSheetLog(
              sheetData.id,
              sheetData.supervisor.userName,
              userData.userName,
              CONSTANTS.sheetLogsMessages.reviewerAssignToSupervisorErrorReport
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
        res.status(httpStatus.BAD_REQUEST).send({ message: "Invalid sheetId" });
      }
    } catch (err) {
      next(err);
    }
  },
};

module.exports = PastPaperReviewerController;
