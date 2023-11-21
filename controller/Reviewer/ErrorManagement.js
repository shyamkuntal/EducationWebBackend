const {
    updateInprogressTaskStatusSchema, assignSupervisorUserToSheetSchema, addErrorReportSchema, addErrorReportToSheetSchema
} = require("../../validations/ReviewerValidation");
const { generateFileName } = require("../../config/s3");
const { SheetManagement } = require("../../models/SheetManagement");
const { QuestionTopicMapping } = require("../../models/QuestionTopicMapping");
const { QuestionVocabMapping } = require("../../models/QuestionVocabMapping");
const { QuestionSubTopicMapping } = require("../../models/QuestionSubTopicMapping");
const { Question } = require("../../models/Question")
const { User } = require('../../models/User')
const { Topic, SubTopic } = require("../../models/Topic");
const { Vocabulary } = require("../../models/Vocabulary")
const services = require("../../services/index");
const httpStatus = require("http-status");
const CONSTANTS = require("../../constants/constants");
const db = require("../../config/database");
const { ApiError } = require("../../middlewares/apiError.js");
const { s3Client } = require("../../config/s3");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");

const ErrorManagementController = {
    async checkQuestion(req, res, next) {
        const t = await db.transaction();
        try {
            let whereQuery = { where: { id: req.body.id }, raw: true };

            let question = await Question.findOne(whereQuery);

            if (!question) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Question not found!");
            }

            await Question.update({ isCheckedByReviewer: true, isErrorByReviewer: false, isReCheckedByReviewer: true }, whereQuery)

            await t.commit();
            res.status(httpStatus.OK).send({ message: "Question Updated successfully!" });
        } catch (err) {
            await t.rollback();
            next(err);
        }
    },
    async unCheckQuestion(req, res, next) {
        const t = await db.transaction();
        try {
            let whereQuery = { where: { id: req.body.id }, raw: true };

            let question = await Question.findOne(whereQuery);

            if (!question) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Question not found!");
            }

            await Question.update({ isCheckedByReviewer: false, isErrorByReviewer: true, isReCheckedByReviewer: false }, whereQuery)

            await t.commit();
            res.status(httpStatus.OK).send({ message: "Question Updated successfully!" });
        } catch (err) {
            await t.rollback();
            next(err);
        }
    },
    async setErrorQuestion(req, res, next) {
        const t = await db.transaction();
        try {
            let whereQuery = { where: { id: req.body.id }, raw: true };

            let question = await Question.findOne(whereQuery);

            if (!question) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Question not found!");
            }

            await Question.update({ isErrorByReviewer: true, isCheckedByReviewer: false, isReCheckedByReviewer: true }, whereQuery)

            await t.commit();
            res.status(httpStatus.OK).send({ message: "Question Updated successfully!" });
        } catch (err) {
            await t.rollback();
            next(err);
        }
    },
    async unsetErrorQuestion(req, res, next) {
        const t = await db.transaction();
        try {
            let whereQuery = { where: { id: req.body.id }, raw: true };

            let question = await Question.findOne(whereQuery);

            if (!question) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Question not found!");
            }

            await Question.update({ isReCheckedByReviewer: false }, whereQuery)

            await t.commit();
            res.status(httpStatus.OK).send({ message: "Question Updated successfully!" });
        } catch (err) {
            await t.rollback();
            next(err);
        }
    },
    async AssignSheetToSupervisor(req, res, next) {
        const t = await db.transaction();
        try {
            let values = await assignSupervisorUserToSheetSchema.validateAsync(req.body);
            let responseMessage = {
                assinedUserToSheet: "",
                UpdateSheetStatus: "",
                sheetLog: "",
            };
            let whereQueryForFindSheet = {
                where: {
                    id: values.sheetId,
                },
                include: [
                    { model: User, as: "assignedToUserName", attributes: ["id", "Name", "userName"] },
                    { model: User, as: "supervisor", attributes: ["id", "Name", "userName"] },
                ],
                raw: true,
                nest: true,
            };
            let sheetData = await SheetManagement.findOne(whereQueryForFindSheet);
            if (!sheetData) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Sheet not found!");
            }
            if (sheetData.assignedToUserId === sheetData.supervisorId) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Task already assigned to supervisor!");
            }
            // Checking if sheet status is complete for reviewer
            if (sheetData.statusForReviewer !== CONSTANTS.sheetStatuses.Complete) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Please mark it as complete first");
            }
            //UPDATE sheet assignment & sheet status
            let dataToBeUpdated = {
                assignedToUserId: sheetData.supervisorId,
                statusForSupervisor: CONSTANTS.sheetStatuses.Complete,
            };
            let whereQuery = {
                where: { id: sheetData.id },
                transaction: t
            };
            await SheetManagement.update(dataToBeUpdated, whereQuery);
            responseMessage.assinedUserToSheet = "Sheet assigned to supervisor successfully";
            responseMessage.UpdateSheetStatus = "Sheet Statuses updated successfully";
            // Create sheetLog
            await services.sheetManagementService.createSheetLog(
                values.sheetId,
                sheetData.assignedToUserName.userName,
                sheetData.supervisor.userName,
                CONSTANTS.sheetLogsMessages.reviewerAssignToSupervisor,
                { transaction: t }
            );
            responseMessage.sheetLog = "Log record for assignment to supervisor added successfully";
            await t.commit();
            res.status(httpStatus.OK).send(responseMessage);
        } catch (err) {
            console.log(err);
            await t.rollback();
            next(err);
        }
    },
    async addHighlightPdfToQuestion(req, res, next) {
        const t = await db.transaction();
        try {

            let questionData = await Question.findOne({ where: { id: req.body.questionId } });
            if (!questionData) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Question not found!");
            }

            if (questionData.reviewerHighlightErrorPdf) {
                let deleteParams = {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: questionData.reviewerHighlightErrorPdf,
                };

                await s3Client.send(new DeleteObjectCommand(deleteParams));
            }

            let uploadFile;
            if (req.file) {
                let fileName =
                    process.env.AWS_BUCKET_SHEETMANAGEMENT_HIGHLIGHT_PDF_FOLDER +
                    "/" +
                    generateFileName(req.file.originalname)

                uploadFile = await services.sheetManagementReviewerService.uploadSheetManagementErrorReportFile(
                    fileName,
                    req.file
                );
            }

            let dataToBeUpdated = {
                reviewerHighlightErrorPdf: uploadFile,
            };


            await Question.update(dataToBeUpdated, { where: { id: req.body.questionId } })
            await t.commit();
            res.status(httpStatus.OK).send({ message: "Added pdf In Question Sucessfully" });
        } catch (err) {
            await t.rollback();
            console.log(err)
            next(err);
        }
    },
    async getHighlightPdfQuestion(req, res, next) {
        try {

            let questionData = await Question.findOne({ where: { id: req.query.questionId } });
            if (!questionData) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Question not found!");
            }

            let fileUrl = await services.sheetManagementReviewerService.getFilesUrlFromS3(questionData.reviewerHighlightErrorPdf);

            res.status(httpStatus.OK).send({ pdf: fileUrl, errors: questionData.reviewerHighlightErrorErrors });

        } catch (err) {
            console.log(err)
            next(err);
        }
    },
    async saveHighlightDataInQuestions(req, res, next) {
        const t = await db.transaction();
        try {

            let questionData = await Question.findOne({ where: { id: req.body.questionId } });
            if (!questionData) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Question not found!");
            }

            let dataToBeUpdated = {
                reviewerHighlightErrorErrors: req.body.report,
            };

            await Question.update(dataToBeUpdated, { where: { id: req.body.questionId } })
            await t.commit();
            res.status(httpStatus.OK).send({ message: "Updated Error In Question Sucessfully" });

        } catch (err) {
            console.log(err)
            await t.rollback();
            next(err);
        }
    },
    async reportSheetError(req, res, next) {
        const t = await db.transaction();
        try {
            let values = await addErrorReportToSheetSchema.validateAsync(req.body);

            // checking sheet
            let whereQueryForFindSheet = {
                where: {
                    id: values.sheetId,
                },
                include: [
                    { model: User, as: "assignedToUserName", attributes: ["id", "Name", "userName"] },
                    { model: User, as: "supervisor", attributes: ["id", "Name", "userName"] },
                ],
                raw: true,
                nest: true,
            };
            let whereQuery = { where: { id: values.sheetId }, raw: true, transaction: t };

            let sheetData = await SheetManagement.findOne(whereQueryForFindSheet);

            if (!sheetData) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Sheet not found!");
            }

            if (
                values.reviewerId !== sheetData.reviewerId ||
                sheetData.assignedToUserId !== sheetData.reviewerId
            ) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Reviewer not assigned to sheet!");
            }

            if (sheetData.isSpam === true) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Error Report already exists!!");
            }

            let dataToBeUpdated = {
                assignedToUserId: sheetData.supervisorId,
                statusForReviewer: CONSTANTS.sheetStatuses.Complete,
                statusForSupervisor: CONSTANTS.sheetStatuses.Complete,
                reviewerCommentToSupervisor: values.errorReport,
                isSpam: true,
            };

            await SheetManagement.update(dataToBeUpdated, whereQuery);

            // Create sheetLog
            await services.sheetManagementService.createSheetLog(
                values.sheetId,
                sheetData.assignedToUserName.userName,
                sheetData.supervisor.userName,
                CONSTANTS.sheetLogsMessages.reviewerAssignToSupervisorErrorReport,
                { transaction: t }
            );

            await t.commit();
            res.status(httpStatus.OK).send({ message: "Added To Spam Succesfully" });
        } catch (err) {
            await t.rollback();
            console.log(err)
            next(err);
        }
    },
}

module.exports = ErrorManagementController;