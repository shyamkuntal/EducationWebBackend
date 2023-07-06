const CONSTANTS = require("../../constants/constants.js");
const {
  assignSupervisorUserToSheetSchema,
  updateSheetStatusSchema,
  reportErrorSchema,
  getRecheckingComments,
} = require("../../validations/PPMReviewerValidation.js");
const services = require("../../services/index.js");
const httpStatus = require("http-status");
const { generateFileName, s3Client } = require("../../config/s3.js");
const { SubBoard, Board } = require("../../models/Board.js");
const { Subject } = require("../../models/Subject.js");
const { getSubBoardsSchema } = require("../../validations/subjectManagementValidations.js");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const PastPaperReviewerController = {

async getsubjectName(req, res, next) {
  try {
    const subjectName = await services.subjectService.getSubjectNames();
    let subjectDetails = [];

    for (const element of subjectName) {
      const getObjectParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: element.subjectImage,
      };
      const command = new GetObjectCommand(getObjectParams);

      const url = await getSignedUrl(s3Client, command, {
        expiresIn: 3600,
      });

      subjectDetails.push({
        ...element,
        subjectImageUrl: url,
      });
    }

    res.status(httpStatus.OK).send(subjectDetails);
  } catch (err) {
    console.log(err);
    next(err);
  }
},

  async getRecheckErrors(req, res) {
    try {
      let reqVariables = { sheetId: req.query.sheetId };

      let values = await getRecheckingComments.validateAsync(reqVariables);

      let recheckingComments =
        await services.sheetService.findRecheckingComments(values.sheetId);

      res.status(httpStatus.OK).send(recheckingComments);
    } catch (err) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err.message);
    }
  },

  async getUserAssignedSubjects (req, res, next) {
    
    try {
      let userId = req.query.userId
      let userSubject = await services.userService.getUserAssignedSubjects(userId);
      res.status(httpStatus.OK).send(userSubject)
    } catch (error) {
      next(error)
    }
  },

  async getAllboards(req, res, next) {
    try {
      const distinctBoardIds = await Subject.findAll({
        attributes: ["boardId"],
        group: ["boardId"],
      });

      const boardIds = distinctBoardIds.map((board) => board.boardId);

      const boards = await Board.findAll({
        attributes: ["id", "boardName"],
        where: {
          id: boardIds,
        },
      });

      const boardNames = boards.map((board) => board.dataValues);

      return res.json({ status: 200, boardNames });
    } catch (err) {
      return res.json({ status: 501, error: err.message });
    }
  },
   
  
  async getAllSubBoards(req, res) {
    try {
      let values = await getSubBoardsSchema.validateAsync({
        boardId: req.query.boardId,
      });

      let subBoards = await services.boardService.getSubBoardsByBoardId(
        values.boardId
      );
      return res.status(200).json(subBoards);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async UpdateInprogressSheetStatus(req, res) {
    try {
      let values = await updateSheetStatusSchema.validateAsync(req.body);

      let sheet = await services.sheetService.findSheet(values.sheetId);

      if (sheet) {
        let assignedTo = sheet.assignedToUserId;
        let lifeCycle = sheet.lifeCycle;
        let previousStatus = sheet.statusForReviewer;

        // Checking if sheet is assigned to current reviewer
        
        if (
          assignedTo === values.reviewerId &&
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
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err.message);
    }
  },
  
  async UpdateCompleteSheetStatus(req, res) {
    try {
      let values = await updateSheetStatusSchema.validateAsync(req.body);

      let sheet = await services.sheetService.findSheet(values.sheetId);

      if (sheet) {
        let assignedTo = sheet.assignedToUserId;
        let lifeCycle = sheet.lifeCycle;
        let previousStatus = sheet.statusForReviewer;

        // Checking if sheet is assigned to current reviewer
        if (
          assignedTo === values.reviewerId &&
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
      let values = {
        ...req.body,
        file: req.file,
      };
      console.log(values)
      let responseMessage = {
        message: { errorReport: "", errorReportFileUpload: "", sheetLog: "" },
      };

      // let values = await reportErrorSchema.validateAsync(reqBody);

      // checking sheet
      let userData = await services.userService.finduser(
        values.reviewerId,
        CONSTANTS.roleNames.Reviewer
      );

      let sheetData = await services.sheetService.findSheetAndUser(
        values.sheetId
      );

      if (userData && sheetData) {
        // Checking is reviewer is assigned to sheet
        if (userData.id === sheetData.assignedToUserId) {
          // checking if erorr Report exists, adding if does not exists
          if (sheetData.errorReport === null) {
            // uploading error report file
            let fileName = generateFileName(32, req.file.originalname);
            let fileObj = req.file;

            let uploadFile = await services.sheetService.uploadErrorReportFile(
              fileName,
              fileObj,
            );

            if (uploadFile) {
              responseMessage.message.errorReportFileUpload =
                "Error Report file added successfully!";
            }

            // updating error report, adding reviewer comments,updating sheetStatuses,setting IsSpam to true
            //  error report img and assigning to supervisor

            let statusTobeUpdated = {
              statusForReviwer: CONSTANTS.sheetStatuses.Complete,
              statusForSupervsior: CONSTANTS.sheetStatuses.Complete,
              isSpam: true,
            };

            let updateErrorReport =
              await services.sheetService.updateErrorReportAndAssignToSupervisor(
                values.sheetId,
                sheetData.supervisorId,
                statusTobeUpdated.statusForReviwer,
                statusTobeUpdated.statusForSupervsior,
                statusTobeUpdated.isSpam,
                values.errorReport,
                values.comment,
                fileName
              );

            if (updateErrorReport.length > 0) {
              responseMessage.message.errorReport =
                "Error Report updated successfully!";
            }

            // Create sheetLog

            let createLog = await services.sheetService.createSheetLog(
              sheetData.id,
              sheetData.supervisor.Name,
              userData.Name,
              CONSTANTS.sheetLogsMessages.reviewerAssignToSupervisorErrorReport
            );

            if (createLog) {
              responseMessage.message.sheetLog =
                "Log record for assignment to supervisor added successfully";
            }

            res.status(httpStatus.OK).send(responseMessage);
          } else {
            res
              .status(httpStatus.BAD_REQUEST)
              .send({ message: "Error report already exists" });
          }
        } else {
          res
            .status(httpStatus.BAD_REQUEST)
            .send({ message: "Reviewer Not assigned to sheet" });
        }
      } else {
        res.status(httpStatus.BAD_REQUEST).send({ message: "Invalid sheetId" });
      }
    } catch (err) {
      console.log(err)
      next(err)
      // return res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err.message);
    }
  },

  async AddRecheckComment(req, res) {
    try {
      let values = await reportErrorSchema.validateAsync(req.body);

      // checking sheet
      let sheetData = await services.sheetService.findSheetAndUser(
        values.sheetId
      );

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

            res.status(httpStatus.OK).send({
              message: "Recheking error added successfully!",
              addError,
            });
          } else {
            res.status(httpStatus.BAD_REQUEST).send({
              message: "Cannot add recheck error, sheet not in spam state",
            });
          }
        } else {
          res
            .status(httpStatus.BAD_REQUEST)
            .send({ message: "Reviewer Not assigned to sheet" });
        }
      } else {
        res.status(httpStatus.BAD_REQUEST).send({ message: "Invalid sheetId" });
      }
    } catch (err) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err.message);
    }
  },
}


module.exports = PastPaperReviewerController;
