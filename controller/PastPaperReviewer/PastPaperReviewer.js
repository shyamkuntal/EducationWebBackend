const CONSTANTS = require("../../constants/constants.js");
const {
  assignSupervisorUserToSheetSchema,
  updateSheetStatusSchema,
  reportErrorSchema,
} = require("../../validations/PPMReviewerValidation.js");
const services = require("../../services/index.js");
const httpStatus = require("http-status");
const { generateFileName } = require("../../config/s3.js");

const PastPaperReviewerController = {
  async getSheet(req, res) {
    try {

      


    } catch (err) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err.message);
    }
  },
  async UpdateInprogressSheetStatus(req, res) {
    try {
      let values = await updateSheetStatusSchema.validateAsync(req.body);

      let sheet = await services.sheetService.findSheet(values.sheetId);

      let assignedTo = sheet.assignedToUserId;
      let lifeCycle = sheet.lifeCycle;
      let previousStatus = sheet.statusForReviewer;

      // Checking if sheet is assigned to current reviewer
      if (
        assignedTo === values.reviewerUserId &&
        lifeCycle === CONSTANTS.roleNames.Reviewer
      ) {
        if (previousStatus !== CONSTANTS.sheetStatuses.InProgress) {
          let statusToBeUpdated = {
            statusForSupervisor: CONSTANTS.sheetStatuses.InProgress,
            statusForReviewer: CONSTANTS.sheetStatuses.InProgress,
          };

          let updateInprogressStatus =
            await services.sheetService.updateSheetStatusForSupervisorAndReviewer(
              sheet.id,
              statusToBeUpdated.statusForSupervisor,
              statusToBeUpdated.statusForReviewer
            );

          if (updateInprogressStatus.length > 0) {
            res
              .status(httpStatus.OK)
              .send({ message: "Sheet Status Updated successfully!" });
          }
        } else {
          res
            .status(httpStatus.BAD_REQUEST)
            .send({ message: `Current sheet status is already "Inprogress"` });
        }
      } else {
        res
          .status(httpStatus.BAD_REQUEST)
          .send({ message: "Invalid reviewer id or sheet life cycle" });
      }
    } catch (err) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err.message);
    }
  },
  async UpdateCompleteSheetStatus(req, res) {
    try {
      let values = await updateSheetStatusSchema.validateAsync(req.body);

      let sheet = await services.sheetService.findSheet(values.sheetId);

      let assignedTo = sheet.assignedToUserId;
      let lifeCycle = sheet.lifeCycle;
      let previousStatus = sheet.statusForReviewer;

      // Checking if sheet is assigned to current reviewer
      if (
        assignedTo === values.reviewerUserId &&
        lifeCycle === CONSTANTS.roleNames.Reviewer
      ) {
        if (previousStatus !== CONSTANTS.sheetStatuses.Complete) {
          let statusToBeUpdated = {
            statusForReviewer: CONSTANTS.sheetStatuses.Complete,
          };

          let updateCompleteStatus =
            await services.sheetService.updateSheetStatusForReviewer(
              sheet.id,
              statusToBeUpdated.statusForReviewer
            );

          if (updateCompleteStatus.length > 0) {
            res
              .status(httpStatus.OK)
              .send({ message: "Sheet Status Updated successfully!" });
          }
        } else {
          res
            .status(httpStatus.BAD_REQUEST)
            .send({ message: `Current sheet status is already "Complete"` });
        }
      } else {
        res
          .status(httpStatus.BAD_REQUEST)
          .send({ message: "Invalid reviewer id or sheet life cycle " });
      }
    } catch (err) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err.message);
    }
  },

  async AssignSheetToSupervisor(req, res) {
    try {
      let values = await assignSupervisorUserToSheetSchema.validateAsync(
        req.body
      );

      let userData = await services.userService.finduser(
        values.reviewerId,
        CONSTANTS.roleNames.Reviewer
      );

      let sheetData = await services.sheetService.findSheetAndUser(
        values.sheetId
      );

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
          if (
            sheetData.statusForReviewer !== CONSTANTS.sheetStatuses.Complete
          ) {
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
              responseMessage.assinedUserToSheet =
                "Sheet assigned to supervisor successfully";
              responseMessage.UpdateSheetStatus =
                "Sheet Statuses updated successfully";
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
        res
          .status(httpStatus.BAD_REQUEST)
          .send({ message: "Wrong user Id or Sheet Id" });
      }
    } catch (err) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err.message);
    }
  },

  async ReportError(req, res, next) {
    try {
      let reqBody = {
        ...req.body,
        file: req.file.originalname,
      };

      let values = await reportErrorSchema.validateAsync(reqBody);

      // uploading error report file

      let fileName = generateFileName();
      let fileObj = req.file;

      // let uploadFile = await services.sheetService.uploadErrorReportFile(
      //   fileName,
      //   fileObj
      // );

      let uploadFile = true;

      if (uploadFile) {
      } else {
      }
    } catch (err) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err.message);
    }
  },
};

module.exports = PastPaperReviewerController;
