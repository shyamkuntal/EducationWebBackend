const { Board, SubBoard } = require("../../models/Board.js");
const { PaperNumberSheet, PaperNumber } = require("../../models/PaperNumber.js")
const services = require("../../services/index.js");
const httpStatus = require("http-status");
const { User, Roles } = require("../../models/User.js");
const { createPaperNumberSheetSchema, EditPaperNumberSheetSchema } = require("../../validations/PaperNumber.js")

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
                supervisorId: req.body.supervisorId
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
                return res.status(404).json({ error: 'PaperNumberSheet not found' });
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
            findPaperNumber.paperNumber = paperNumber

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
    }

    // async submitToDataGenerator(res, res, next){

    // }
}

module.exports = PaperNumberSheetController;

