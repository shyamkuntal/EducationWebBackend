const { PaperNumberSheet, PaperNumber } = require("../../models/PaperNumber.js");
const httpStatus = require("http-status");
const services = require("../../services/index.js");
const { User, Roles } = require("../../models/User.js");
const CONSTANTS = require("../../constants/constants.js");
const {
    getPaperNumberByPaperNumberSheetSchema,
} = require("../../validations/PaperNumberValidations.js");
const { assignSheetToSupervisorSchema } = require("../../validations/DataGeneratorValidations.js");

const DataGeneratorController = {
    //take care of isarchived and ispublished later

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

    async deletePaperNumber(req, res, next) {
        try {
            const { paperNumberId } = req.body;

            // Find the PaperNumber
            const paperNumber = await PaperNumber.findByPk(paperNumberId);
            if (!paperNumber) {
                return res.status(404).json({ error: "PaperNumber not found" });
            }

            // Delete the PaperNumber
            await paperNumber.destroy();

            return res.status(200).json({ message: "PaperNumber deleted successfully" });
        } catch (error) {
            console.error('Error deleting PaperNumber:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getAllPaperNumber(req, res, next) {
        try {
            const paperNumbers = await PaperNumber.findAll();
            res.status(httpStatus.OK).send(paperNumbers);
        } catch (error) {
            next(error);
            console.error("Error retrieving PaperNumbers:", error);
            res.status(500).json({ error: "Failed to retrieve PaperNumbers" });
        }
    },

    async getPaperNumberByPaperNumberSheet(req, res, next) {
        try {
            let values = await getPaperNumberByPaperNumberSheetSchema.validateAsync({
                paperNumberSheetId: req.query.paperNumberSheetId,
            });

            let whereQuery = { where: { paperNumberSheetId: values.paperNumberSheetId }, raw: true };

            let paperNumber = await services.paperNumberService.findPaperNumber(whereQuery);

            res.status(httpStatus.OK).send(paperNumber);
        } catch (err) {
            next(err);
            console.log(err)
        }
    },

    async EditPaperNumber(req, res, next) {
        try {
            const { paperNumberSheetId, paperNumbers } = req.body;
        
            // Find the PaperNumberSheet
            const paperNumberSheet = await PaperNumberSheet.findByPk(paperNumberSheetId);
            if (!paperNumberSheet) {
              return res.status(404).json({ error: "PaperNumberSheet not found" });
            }
        
            // Update PaperNumbers
            const updatedPaperNumbers = await Promise.all(
              paperNumbers.map(async (paperNumber) => {
                const existingPaperNumber = await PaperNumber.findOne({
                  where: {
                    paperNumberSheetId,
                    paperNumber: paperNumber.paperNumber,
                  },
                });
                  // Update the existing PaperNumber if it exists
                  existingPaperNumber.paperNumber = paperNumber.paperNumber;
                  return existingPaperNumber.save();
                
              })
            );
        

            res.status(httpStatus.OK).send({ message: 'PaperNumber updated successfully' });
        } catch (error) {
            console.error('Error updating PaperNumber:', error);
            next(error)
            res.status(500).json({ error: 'Failed to update PaperNumber' });
        }
    },

    async SubmitToSupervisor(req, res, next) {
        try {
            let values = await assignSheetToSupervisorSchema.validateAsync(req.body)

            let responseMessage = {
                assinedUserToSheet: "",
                UpdateSheetStatus: "",
                sheetLog: "",
            };

            let userData = await services.userService.finduser(
                values.dataGeneratorId,
                CONSTANTS.roleNames.DataGenerator
            );
            let sheetData = await services.paperNumberSheetService.findSheetAndUser(values.paperNumberSheetId);

            if (sheetData) {
                let dataToBeUpdated = {
                    statusForDataGenerator: CONSTANTS.sheetStatuses.Complete,
                    assignedToUserId: sheetData.supervisorId,
                    lifeCycle: CONSTANTS.roleNames.Supervisor
                }
                let whereQuery = {
                    where: {
                        id: sheetData.id
                    }
                }
                let statusToUpdate = await services.paperNumberSheetService.updatePaperNumberSheet(dataToBeUpdated, whereQuery)

                let createLog = await services.paperNumberSheetService.createSheetLog(
                    sheetData.id,
                    sheetData.supervisor.Name,
                    userData.Name,
                    CONSTANTS.sheetLogsMessages.DataGeneratorAssignToSupervisor
                )

                if (statusToUpdate.length > 0 && createLog) {
                    responseMessage.assinedUserToSheet = "Sheet assigned to supervisor successfully";
                    responseMessage.UpdateSheetStatus = "Sheet Statuses updated successfully";
                    responseMessage.sheetLog =
                        "Log record for Task to supervisor added successfully";
                }

                res.status(httpStatus.OK).send({ message: responseMessage });
            } else {
                res.status(httpStatus.BAD_REQUEST).send({ message: "Wrong user Id or Sheet Id" });
            }
        } catch (err) {
            next(err)
            console.log(err)
        }
    },

    async MarkitasInProgress(req, res) {
        const id = req.body.paperNumberSheetId;

        try {
            const sheetData = await services.paperNumberSheetService.findPaperNumberSheetByPk(id);

            let statusToUpdate = {
                statusForDataGenerator: CONSTANTS.sheetStatuses.InProgress
            }
            let whereQuery = {
                where: {
                    id: sheetData.id
                }
            }
            let response = await services.paperNumberSheetService.updatePaperNumberSheet(statusToUpdate, whereQuery)

            return res.status(httpStatus.OK).send({
                message: "Sheet marked InProgress successfully",
            });
        } catch (err) {
            console.log(err)
            return res.json({ status: 501, error: err.message });
        }
    },

    async Markitascomplete(req, res) {
        const id = req.body.paperNumberSheetId;

        try {
            const sheetData = await services.paperNumberSheetService.findPaperNumberSheetByPk(id);

            let statusToUpdate = {
                statusForDataGenerator: CONSTANTS.sheetStatuses.Complete
            }
            let whereQuery = {
                where: {
                    id: sheetData.id
                }
            }
            let response = await services.paperNumberSheetService.updatePaperNumberSheet(statusToUpdate, whereQuery)

            return res.status(httpStatus.OK).send({
                message: "Sheet marked Complete successfully",
            });
        } catch (err) {
            return res.json({ status: 501, error: err.message });
        }
    },

}

module.exports = DataGeneratorController;