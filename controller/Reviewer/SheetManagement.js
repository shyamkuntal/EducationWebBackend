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

const SheetManagementController = {
    async updateInProgressTaskStatus(req, res, next) {
        const t = await db.transaction();
        try {
            let values = await updateInprogressTaskStatusSchema.validateAsync(req.body);

            let whereQuery = { where: { id: values.sheetId }, raw: true };

            let sheetData = await SheetManagement.findOne(whereQuery);

            if (!sheetData) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Topic Task not found!");
            }

            let assignedTo = sheetData.assignedToUserId;
            let lifeCycle = sheetData.lifeCycle;
            let previousStatus = sheetData.statusForReviewer;

            if (assignedTo !== values.reviewerId || lifeCycle !== CONSTANTS.roleNames.Reviewer) {
                throw new ApiError(
                    httpStatus.BAD_REQUEST,
                    "Task not assigned to Reviewer or lifecycle mismatch"
                );
            }

            if (previousStatus === CONSTANTS.sheetStatuses.InProgress) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Current sheet status is already Inprogress");
            }

            await SheetManagement.update({
                statusForReviewer: CONSTANTS.sheetStatuses.InProgress
            }, whereQuery)

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
            let values = await updateInprogressTaskStatusSchema.validateAsync(req.body);

            let whereQuery = { where: { id: values.sheetId }, raw: true };

            let sheetData = await SheetManagement.findOne(whereQuery);

            if (!sheetData) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Sheet not found!");
            }

            let assignedTo = sheetData.assignedToUserId;
            let lifeCycle = sheetData.lifeCycle;
            let previousStatus = sheetData.statusForReviewer;

            if (assignedTo !== values.reviewerId || lifeCycle !== CONSTANTS.roleNames.Reviewer) {
                throw new ApiError(
                    httpStatus.BAD_REQUEST,
                    "Task not assigned to Reviewer or lifecycle mismatch"
                );
            }

            if (previousStatus === CONSTANTS.sheetStatuses.Complete) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Current sheet status is already Complete");
            }

            await SheetManagement.update({
                statusForReviewer: CONSTANTS.sheetStatuses.Complete
            }, whereQuery)

            await t.commit();
            res.status(httpStatus.OK).send({ message: "Sheet Status Updated successfully!" });
        } catch (err) {
            await t.rollback();
            next(err);
        }
    },
    async getTopicSubTopicVocabMappingsForQuestion(req, res, next) {
        try {
            const questionId = req.query.questionId;

            const topicMappings = await QuestionTopicMapping.findAll({
                where: {
                    questionId,
                },
                attributes: ["topicId"],
                include: [{ model: Topic, attributes: ["name"] }],
                raw: true,
            });

            const subTopicMappings = await QuestionSubTopicMapping.findAll({
                where: {
                    questionId,
                },
                attributes: ["subTopicId"],
                include: [{ model: SubTopic, attributes: ["name"] }],
                raw: true,
            });

            const vocabMappings = await QuestionVocabMapping.findAll({
                where: {
                    questionId,
                },
                attributes: ["vocabId"],
                include: [{ model: Vocabulary, attributes: ["name"] }],
                raw: true,
            });

            res.status(httpStatus.OK).send({
                questionId,
                topicMappings,
                subTopicMappings,
                vocabMappings,
            });
        } catch (err) {
            console.log(err);
            next(err);
        }
    },
    async checkQuestion(req, res, next) {
        const t = await db.transaction();
        try {
            let whereQuery = { where: { id: req.body.id }, raw: true };

            let question = await Question.findOne(whereQuery);

            if (!question) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Question not found!");
            }

            await Question.update({ isCheckedByReviewer: true, isErrorByReviewer: false }, whereQuery)

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

            await Question.update({ isCheckedByReviewer: false }, whereQuery)

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

            await Question.update({ isErrorByReviewer: true, isCheckedByReviewer: false }, whereQuery)

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

            await Question.update({ isErrorByReviewer: false }, whereQuery)

            await t.commit();
            res.status(httpStatus.OK).send({ message: "Question Updated successfully!" });
        } catch (err) {
            await t.rollback();
            next(err);
        }
    },
    async addErrorReportToQuestion(req, res, next) {
        const t = await db.transaction();
        try {
            let values = await addErrorReportSchema.validateAsync({
                ...req.body,
                errorReportFile: req.file,
            });

            let questionData = await Question.findOne({ where: { id: values.questionId } });

            if (!questionData) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Question not found!");
            }
            let uploadFile;

            if (req.file) {
                let fileName =
                    process.env.AWS_BUCKET_SHEETMANAGEMENT_ERROR_REPORT_IMAGES_FOLDER +
                    "/" +
                    generateFileName(values.errorReportFile.originalname);

                uploadFile = await services.sheetManagementReviewerService.uploadSheetManagementErrorReportFile(
                    fileName,
                    values.errorReportFile
                );
            }

            let dataToBeUpdated = {
                errorReportByReviewer: values.errorReport,
                errorReportImgByReviewer: uploadFile,
            };

            await Question.update(dataToBeUpdated, { where: { id: values.questionId } })
            await t.commit();
            res.status(httpStatus.OK).send({ message: "Updated Error In Question Sucessfully" });
        } catch (err) {
            await t.rollback();
            next(err);
        }
    },
    async addTopicSubTopicVocabErrorReportToQuestion(req, res, next) {
        const t = await db.transaction();
        try {
            let values = await addErrorReportSchema.validateAsync({
                ...req.body,
                errorReportFile: req.file,
            });

            let questionData = await Question.findOne({ where: { id: values.questionId } });

            if (!questionData) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Question not found!");
            }
            let uploadFile;

            if (req.file) {
                let fileName =
                    process.env.AWS_BUCKET_SHEETMANAGEMENT_ERROR_REPORT_IMAGES_FOLDER +
                    "/" +
                    generateFileName(values.errorReportFile.originalname);

                uploadFile = await services.sheetManagementReviewerService.uploadSheetManagementErrorReportFile(
                    fileName,
                    values.errorReportFile
                );
            }

            let dataToBeUpdated = {
                errorForTopicSubTopicVocabByReviewer: values.errorReport,
                errorImgForTopicSubTopicVocabByReviewer: uploadFile,
            };

            await Question.update(dataToBeUpdated, { where: { id: values.questionId } })
            await t.commit();
            res.status(httpStatus.OK).send({ message: "Updated Error In Question Sucessfully" });
        } catch (err) {
            await t.rollback();
            console.log(err)
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
            };
            await SheetManagement.update(dataToBeUpdated, whereQuery, {
                transaction: t,
            });
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
            res.status(httpStatus.OK).send({ pdf: fileUrl });

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
            let whereQuery = { where: { id: values.sheetId }, raw: true };

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

            await SheetManagement.update(dataToBeUpdated, whereQuery, {
                transaction: t,
            });

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

module.exports = SheetManagementController;