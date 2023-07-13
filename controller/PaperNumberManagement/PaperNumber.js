const { Board, SubBoard } = require("../../models/Board.js");
const { PaperNumberSheet, PaperNumber } = require("../../models/PaperNumber.js");
const services = require("../../services/index.js");
const httpStatus = require("http-status");
const { User, Roles } = require("../../models/User.js");
const CONSTANTS = require("../../constants/constants.js");
const {
  createPaperNumberSheetSchema,
  EditPaperNumberSheetSchema,
  assignDataGeneratorUserToSheetSchema,
  assignReviewerUserToSheetSchema,
} = require("../../validations/PaperNumberValidations.js");
const constants = require("../../constants/constants.js");

const PaperNumberSheetController = {
    //take care of isarchived and ispublished later
    async CreatePaperNumberSheet(req, res, next) {
        try {
            let values = await createPaperNumberSheetSchema.validateAsync({
                boardId: req.body.boardId,
                subBoardId: req.body.subBoardId,
                grade: req.body.grade,
                subjectId: req.body.subjectId,
                resources: req.body.resources,
                description: req.body.description,
                supervisorId: req.body.supervisorId
            });
            // console.log(values)

      const paperNumberSheet = await PaperNumberSheet.create(values);

            return res.status(httpStatus.OK).send({
                paperNumberSheet,
            });
        } catch (err) {
            next(err);
            console.log(err)
        }
    },

    async UpdatePaperNumberSheet(req, res, next) {
    try {
      let values = await EditPaperNumberSheetSchema.validateAsync({
        paperNumberSheetId: req.body.paperNumberSheetId,
        boardId: req.body.boardId,
        subBoardId: req.body.subBoardId,
        grade: req.body.grade,
        subjectId: req.body.subjectId,
        resources: req.body.resources,
        description: req.body.description,
        supervisorId: req.body.supervisorId,
      });

      // Find the sheet with the given ID
      const paperNumberSheet = await PaperNumberSheet.findByPk(values.paperNumberSheetId);
      // Update the sheet's values with the provided data
      paperNumberSheet.boardId = values.boardId;
      paperNumberSheet.subBoardId = values.subBoardId;
      paperNumberSheet.grade = values.grade;
      paperNumberSheet.subjectId = values.subjectId;
      paperNumberSheet.resources = values.resources;
      paperNumberSheet.description = values.description;
      paperNumberSheet.supervisorId = values.supervisorId;

      // Save the updated PaperNumberSheet
      await paperNumberSheet.save();

            return res.status(httpStatus.OK).send({
                message: "PaperNumberSheet Updated Successfully",
                paperNumberSheet,
            });
        } catch (err) {
            next(err);
            console.log(err)
        }
      },

    async createPaperNumber(req, res, next) {
    try {
      const { paperNumberSheetId, paperNumber } = req.body;

      // Find the PaperNumberSheet
      const paperNumberSheet = await PaperNumberSheet.findByPk(paperNumberSheetId);
      if (!paperNumberSheet) {
        return res.status(404).json({ error: "PaperNumberSheet not found" });
      }

            // Create PaperNumbers
            // if single paperNumber
            if (!Array.isArray(paperNumber)) {
                const createdPaperNumber = await PaperNumber.create({
                    paperNumberSheetId,
                    paperNumber,
                })
                return res.status(200).json({ paperNumber: createdPaperNumber });
            } else {
                const createdPaperNumbers = await Promise.all(
                    paperNumber.map(async (paperNumber) => {
                        const createdPaperNumber = await PaperNumber.create({
                            paperNumberSheetId,
                            paperNumber,
                        });
                        return createdPaperNumber;
                    })
                );
                return res.status(httpStatus.OK).send({ paperNumber: createdPaperNumbers });
            }

        } catch (error) {
            console.error('Error creating PaperNumbers:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
      },

    async getAllPaperNumber(req, res, next) {
        try {
            const paperNumbers = await PaperNumber.findAll();
            res.status(httpStatus.OK).send(paperNumbers);
        } catch (error) {
            next(error)
            console.error('Error retrieving PaperNumbers:', error);
            res.status(500).json({ error: 'Failed to retrieve PaperNumbers' });
        }
    },

    async EditPaperNumber(req, res, next) {
    const { paperNumberId, paperNumber } = req.body;

    try {
      // Find the PaperNumber with the given ID
      const findPaperNumber = await PaperNumber.findByPk(paperNumberId);
      findPaperNumber.paperNumber = paperNumber;

            if (!findPaperNumber) {
                return res.status(404).json({ error: 'PaperNumber not found' });
            }

            await findPaperNumber.save()

            res.status(httpStatus.OK).send({ message: 'PaperNumber updated successfully' });
        } catch (error) {
            console.error('Error updating PaperNumber:', error);
            next(error)
            res.status(500).json({ error: 'Failed to update PaperNumber' });
        }
    },

    async AssignSheetToDataGenerator(req, res, next){
        try {
            let values = await assignDataGeneratorUserToSheetSchema.validateAsync(req.body);
      
            // userData can later on come from middleware
            let userData = await services.userService.finduser(
              values.dataGeneratorId,
              constants.roleNames.DataGenerator
            );
      
            let sheetData = await services.paperNumberSheetService.findSheetAndUser(
              values.paperNumberSheetId
            );
      
            let Comment = values.supervisorComments;
      
            let responseMessage = {
              assinedUserToSheet: "",
              UpdateSheetStatus: "",
              sheetLog: "",
            };
      
            if (userData && sheetData) {
              // Checking if sheet is already assigned to Data Generator
      
              if (sheetData.assignedToUserId === userData.id) {
                res
                  .status(httpStatus.OK)
                  .send({ mesage: "sheet already assigned to Data Generator" });
              } else {
                //UPDATE sheet assignment & life cycle & sheet status
      
                let sheetStatusToBeUpdated = {
                  statusForSupervisor: CONSTANTS.sheetStatuses.NotStarted,
                  statusForDataGenerator: CONSTANTS.sheetStatuses.NotStarted,
                  statusForReviewer: null,
                };
      
                let updateAssignAndLifeCycleAndStatus =
                  await services.paperNumberSheetService.assignUserToSheetAndUpdateLifeCycleAndStatuses(
                    sheetData.id,
                    userData.id,
                    CONSTANTS.roleNames.DataGenerator,
                    sheetStatusToBeUpdated.statusForSupervisor,
                    sheetStatusToBeUpdated.statusForDataGenerator
                  );
      
      
                if (updateAssignAndLifeCycleAndStatus.length > 0) {
                  responseMessage.assinedUserToSheet =
                    "Sheet assigned to Data Generator and lifeCycle updated successfully";
                  responseMessage.UpdateSheetStatus =
                    "Sheet Statuses updated successfully";
                }
      
                // updating supervisor comments
                if (Comment) {
                  let updateComment = await services.paperNumberSheetService.updateSupervisorComments(
                    sheetData.id,
                    Comment,
                    "PastPaper"
                  )
                  if(updateComment){
                    responseMessage.updateComment =
                    "Supervisor comment added successfully";
                  }
                }
                // CREATE sheet log for sheet assignment to past paper uploader
      
                let createLog = await services.paperNumberSheetService.createSheetLog(
                  sheetData.id,
                  sheetData.supervisor.Name,
                  userData.Name,
                  CONSTANTS.sheetLogsMessages.supervisorAssignToDataGenerator
                );
      
                if (createLog) {
                  responseMessage.sheetLog =
                    "Log record for sheet assignment to uploader added successfully";
                }
      
                res.status(httpStatus.OK).send({ message: responseMessage });
              }
            } else {
              res
                .status(httpStatus.BAD_REQUEST)
                .send({ message: "Wrong user Id or Sheet Id" });
            }
          } catch (err) {
            console.log(err)
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err.message);
          }
    },

    async AssignSheetToReviewer(req, res, next) {
        try {
          let values = await assignReviewerUserToSheetSchema.validateAsync(
            req.body
          );
          // userData can later on come from middleware
          let userData = await services.userService.finduser(values.reviewerId);
    
          let sheetData = await services.paperNumberSheetService.findSheetAndUser(
            values.paperNumberSheetId
          );
    
          let Comment = values.supervisorComments;
    
          let responseMessage = {
            assinedUserToSheet: "",
            UpdateSheetStatus: "",
            sheetLog: "",
          };
    
          if (userData && sheetData) {
            // Checking if sheet is already assigned to past paper reviewer
    
            if (sheetData.assignedToUserId === userData.id) {
              res
                .status(httpStatus.OK)
                .send({ message: "sheet already assigned to reviewer" });
            } else {
              //UPDATE sheet assignment & life cycle & sheet status
              let sheetStatusToBeUpdated = {
                statusForSupervisor: CONSTANTS.sheetStatuses.NotStarted,
                statusForReviewer: CONSTANTS.sheetStatuses.NotStarted,
              };
    
              let updateAssignAndUpdateLifeCycle =
                await services.paperNumberSheetService.assignUserToSheetAndUpdateLifeCycleAndStatuses(
                  sheetData.id,
                  userData.id,
                  CONSTANTS.roleNames.Reviewer,
                  sheetStatusToBeUpdated.statusForSupervisor,
                  sheetStatusToBeUpdated.statusForReviewer
                );
              
              // updating supervisor comments
              if (Comment) {
                let updateComment = await services.paperNumberSheetService.updateSupervisorComments(
                  sheetData.id,
                  Comment,
                  "Reviewer"
                )
                if(updateComment){
                  responseMessage.updateComment =
                  "Supervisor comment added successfully";
                }
              }
         
              if (updateAssignAndUpdateLifeCycle.length > 0) {
                responseMessage.assinedUserToSheet =
                  "Sheet assigned to reviewer and lifeCycle updated successfully";
                responseMessage.UpdateSheetStatus =
                  "Sheet Statuses updated successfully";
              }
    
              // CREATE sheet log for sheet assignment to past paper uploader
              let createLog = await services.paperNumberSheetService.createSheetLog(
                sheetData.id,
                sheetData.supervisor.Name,
                userData.Name,
                CONSTANTS.sheetLogsMessages.supervisorAssignToReviewer
              );
    
              if (createLog) {
                responseMessage.sheetLog =
                  "Log record for PaperNumber Sheet Task to reviewer added successfully";
              }
    
              // Create Sheet CheckList
              let checkForPreviousCheckList =
                await services.paperNumberSheetService.findCheckList(sheetData.id);
    
              if (checkForPreviousCheckList.length <= 0) {
                let createSheetCheckList =
                  await services.paperNumberSheetService.createSheetCheckList(sheetData.id);
                if (createSheetCheckList.length > 0) {
                  responseMessage.CheckList = "Check List Created!";
                } 
              }
    
              res.status(httpStatus.OK).send({ message: responseMessage });
            }
          } else {
            res
              .status(httpStatus.BAD_REQUEST)
              .send({ mesage: "Wrong user Id or Sheet Id" });
          }
        } catch (err) {
            console.log(err)
          return res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err.message);
        }
      },

    async TogglePublishSheet(req, res) {
        const id = req.body.id;
        console.log(id)
        // const isPublished = req.body.isPublished;
    
        try {
          const sheet = await services.paperNumberSheetService.findPaperNumberSheetByPk(id);
          console.log(sheet)
    
          if (!sheet) {
            return res.status(404).json({ message: "sheet not found" });
          }
    
          sheet.isPublished = !sheet.isPublished;
          sheet.isSpam = false;
          await sheet.save();
    
          return res.json({ status: 200, sheet });
        } catch (err) {
          return res.status(501).json({ error: err.message });
        }
    },

} 

module.exports = PaperNumberSheetController;
